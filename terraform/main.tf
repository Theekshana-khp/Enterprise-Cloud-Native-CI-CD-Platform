terraform {
  required_providers {
    aws = { source = "hashicorp/aws" }
  }
}

provider "aws" { region = var.aws_region }

# Add VPC, ECR, IAM, EC2 or EKS resources here.
