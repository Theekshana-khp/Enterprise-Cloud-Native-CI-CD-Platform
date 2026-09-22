# Enterprise Cloud-Native CI/CD Platform

A simple starter structure for a React frontend, backend API and MySQL application that is deployed through a CI/CD pipeline.

## Flow

`GitHub push → GitHub Actions tests/builds/scans → AWS ECR → Jenkins deployment → Kubernetes → Prometheus/Grafana`

## Folder guide

| Folder | Purpose |
| --- | --- |
| `app/` | Your frontend and backend source code and Dockerfiles |
| `.github/workflows/` | GitHub Actions CI pipeline |
| `jenkins/` | Jenkins deployment pipeline |
| `terraform/` | AWS infrastructure code |
| `deploy/kubernetes/` | Kubernetes manifests for the application |
| `deploy/docker-compose/` | Local development environment |
| `monitoring/` | Prometheus and Grafana configuration |
| `scripts/` | Health-check and rollback helper scripts |
| `docs/` | Architecture diagram, setup guide, screenshots |

## Recommended build order

1. Make the frontend and backend run locally.
2. Dockerize each application.
3. Run them with Docker Compose.
4. Add GitHub Actions to test, build, scan and push images.
5. Create AWS infrastructure with Terraform.
6. Add Jenkins deployment.
7. Deploy to Kubernetes.
8. Add monitoring, health checks and rollback.

## Important

Do not commit passwords, AWS keys, tokens or `.env` files. Store secrets in GitHub Secrets, Jenkins Credentials, AWS Secrets Manager, or Kubernetes Secrets.
