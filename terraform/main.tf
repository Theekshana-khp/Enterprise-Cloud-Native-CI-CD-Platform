
provider "aws" {
  region = "us-west-1"
}

variable "ec2_key_name" {
  type        = string
  description = "Name of an existing EC2 key pair in us-east-1"
}

variable "ssh_ip_cidr" {
  type    = string
  default = "112.134.151.43/32"
}

variable "jenkins_access_cidr" {
  type        = string
  description = "Trusted IP CIDR allowed to access Jenkins"
  default     = "112.134.151.43/32"
}

data "aws_ssm_parameter" "ubuntu_ami" {
  name = "/aws/service/canonical/ubuntu/server/24.04/stable/current/amd64/hvm/ebs-gp3/ami-id"
}

resource "aws_vpc" "prod_vpc" {
  cidr_block           = "10.0.0.0/16"
  enable_dns_support   = true
  enable_dns_hostnames = true

  tags = {
    Name = "task-manager-vpc"
  }
}

resource "aws_internet_gateway" "gw" {
  vpc_id = aws_vpc.prod_vpc.id

  tags = {
    Name = "task-manager-gateway"
  }
}

resource "aws_subnet" "public_subnet" {
  vpc_id                  = aws_vpc.prod_vpc.id
  cidr_block              = "10.0.1.0/24"
  availability_zone       = "us-west-1a"
  map_public_ip_on_launch = true

  tags = {
    Name = "task-manager-public-subnet"
  }
}

resource "aws_route_table" "public_rt" {
  vpc_id = aws_vpc.prod_vpc.id

  route {
    cidr_block = "0.0.0.0/0"
    gateway_id = aws_internet_gateway.gw.id
  }

  tags = {
    Name = "task-manager-public-route-table"
  }
}

resource "aws_route_table_association" "public_assoc" {
  subnet_id      = aws_subnet.public_subnet.id
  route_table_id = aws_route_table.public_rt.id
}

resource "aws_security_group" "allow_web" {
  name        = "task-manager-security-group"
  description = "Security group for Task Manager and Jenkins"
  vpc_id      = aws_vpc.prod_vpc.id

  ingress {
    description = "HTTP"
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  ingress {
    description = "Task Manager frontend"
    from_port   = 3000
    to_port     = 3000
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  ingress {
    description = "Jenkins access from trusted IP"
    from_port   = 8080
    to_port     = 8080
    protocol    = "tcp"
    cidr_blocks = [var.jenkins_access_cidr]
  }

  ingress {
    description = "SSH from trusted IP"
    from_port   = 22
    to_port     = 22
    protocol    = "tcp"
    cidr_blocks = [var.ssh_ip_cidr]
  }

  egress {
    description = "Allow outbound traffic"
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name = "task-manager-security-group"
  }
}

resource "aws_iam_role" "ec2_role" {
  name = "task-manager-ec2-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Principal = {
          Service = "ec2.amazonaws.com"
        }
        Action = "sts:AssumeRole"
      }
    ]
  })

  tags = {
    Name    = "task-manager-ec2-role"
    Project = "Task-Manager"
  }
}

resource "aws_iam_role_policy_attachment" "ecr_read_only" {
  role       = aws_iam_role.ec2_role.name
  policy_arn = "arn:aws:iam::aws:policy/AmazonEC2ContainerRegistryReadOnly"
}

resource "aws_iam_instance_profile" "ec2_profile" {
  name = "task-manager-ec2-profile"
  role = aws_iam_role.ec2_role.name
}

resource "aws_ecr_repository" "frontend" {
  name                 = "task-manager/frontend"
  image_tag_mutability = "MUTABLE"

  image_scanning_configuration {
    scan_on_push = true
  }

  tags = {
    Name    = "task-manager-frontend"
    Project = "Task-Manager"
  }
}

resource "aws_ecr_repository" "backend" {
  name                 = "task-manager/backend"
  image_tag_mutability = "MUTABLE"

  image_scanning_configuration {
    scan_on_push = true
  }

  tags = {
    Name    = "task-manager-backend"
    Project = "Task-Manager"
  }
}


resource "aws_instance" "task_manager" {
  ami                         = data.aws_ssm_parameter.ubuntu_ami.value
  instance_type               = "t3.small"
  key_name                    = var.ec2_key_name
  subnet_id                   = aws_subnet.public_subnet.id
  vpc_security_group_ids      = [aws_security_group.allow_web.id]
  iam_instance_profile        = aws_iam_instance_profile.ec2_profile.name
  associate_public_ip_address = true

  root_block_device {
    volume_size           = 20
    volume_type           = "gp3"
    encrypted             = true
    delete_on_termination = true
  }

  user_data = <<-EOF
    #!/bin/bash
    set -euxo pipefail

    exec > >(tee -a /var/log/user-data-setup.log) 2>&1

    # 1. Update Ubuntu
    apt-get update

    # 2. Install Java, Docker, Compose and utilities
    DEBIAN_FRONTEND=noninteractive apt-get install -y \
      ca-certificates \
      curl \
      gnupg \
      fontconfig \
      openjdk-21-jre \
      docker.io \
      docker-compose-v2 \
      unzip \
      maven

    # 3. Install AWS CLI v2
    cd /tmp
    curl -fsSL \
      "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" \
      -o awscliv2.zip
    unzip -q -o awscliv2.zip
    ./aws/install
    rm -rf aws awscliv2.zip

    # 4. Configure the Jenkins repository
    install -m 0755 -d /etc/apt/keyrings

    curl -fsSL \
    https://pkg.jenkins.io/debian-stable/jenkins.io-2026.key \
    -o /etc/apt/keyrings/jenkins-keyring.asc

    chmod 644 /etc/apt/keyrings/jenkins-keyring.asc

    echo "deb [signed-by=/etc/apt/keyrings/jenkins-keyring.asc] https://pkg.jenkins.io/debian-stable binary/" \
      > /etc/apt/sources.list.d/jenkins.list

    # 5. Install Jenkins
    apt-get update
    DEBIAN_FRONTEND=noninteractive apt-get install -y jenkins

    # 6. Start Docker
    systemctl enable --now docker

    # Allow Jenkins to use Docker for deployments
    usermod -aG docker jenkins

    # 7. Start Jenkins
    systemctl enable jenkins
    systemctl restart jenkins

    # 8. Record installation completion
    echo "Jenkins and Docker installation completed"
  EOF


  user_data_replace_on_change = true

  tags = {
    Name    = "task-manager-ec2"
    Project = "Task-Manager"
  }
}

output "ec2_public_ip" {
  value = aws_instance.task_manager.public_ip
}

output "jenkins_url" {
  value = "http://${aws_instance.task_manager.public_ip}:8080"
}

output "task_manager_url" {
  value = "http://${aws_instance.task_manager.public_ip}:3000"
}

output "ecr_registry" {
  value = split("/", aws_ecr_repository.frontend.repository_url)[0]
}

output "frontend_ecr_repository_url" {
  value = aws_ecr_repository.frontend.repository_url
}

output "backend_ecr_repository_url" {
  value = aws_ecr_repository.backend.repository_url
}
