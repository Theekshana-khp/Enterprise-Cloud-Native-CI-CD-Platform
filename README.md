# Enterprise Cloud-Native CI/CD Platform

A starter structure for a React frontend, Spring Boot backend, and MySQL application that can be deployed through a CI/CD pipeline.

## Task Management System

Full-stack task CRUD app lives under `app/frontend` and `app/backend`, with MySQL schema in `database/init.sql`.

### Prerequisites

- **Node.js** 18+ and npm
- **Java** 17+
- **Maven** 3.9+
- **MySQL** 8.x

### 1. MySQL

Start MySQL locally, then create the database and table:

```bash
mysql -u root -p < database/init.sql
```

Set credentials via environment variables (no passwords are stored in the repo):

```bash
export DB_URL="jdbc:mysql://localhost:3306/taskdb?useSSL=false&allowPublicKeyRetrieval=true&serverTimezone=UTC"
export DB_USERNAME="root"
export DB_PASSWORD="your_password_here"
```

Optional: `SERVER_PORT` (default `8080`), `JPA_DDL_AUTO` (default `update`).

### 2. Backend (Spring Boot)

```bash
cd app/backend
mvn spring-boot:run
```

Verify:

```bash
curl http://localhost:8080/api/health
# {"status":"UP"}
```

REST API base: `http://localhost:8080/api/tasks`

| Method | Path | Description |
| --- | --- | --- |
| GET | `/api/tasks` | List all tasks |
| GET | `/api/tasks/{id}` | Get one task |
| POST | `/api/tasks` | Create task |
| PUT | `/api/tasks/{id}` | Update task |
| DELETE | `/api/tasks/{id}` | Delete task |

Task fields: `id`, `title`, `description`, `status` (`TODO`, `IN_PROGRESS`, `COMPLETED`), `createdAt`.

Build JAR:

```bash
cd app/backend
mvn -DskipTests package
java -jar target/task-manager-backend-1.0.0.jar
```

Docker:

```bash
cd app/backend
docker build -t task-manager-backend .
docker run --rm -p 8080:8080 \
  -e DB_URL="jdbc:mysql://host.docker.internal:3306/taskdb?useSSL=false&allowPublicKeyRetrieval=true&serverTimezone=UTC" \
  -e DB_USERNAME="root" \
  -e DB_PASSWORD="your_password_here" \
  task-manager-backend
```

### 3. Frontend (React + Vite)

In a **separate terminal** (backend must be running on port 8080):

```bash
cd app/frontend
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173). The UI calls `http://localhost:8080/api/tasks` via Axios.

Production build:

```bash
cd app/frontend
npm run build
npm run preview
```

Docker:

```bash
cd app/frontend
docker build -t task-manager-frontend .
docker run --rm -p 3000:80 task-manager-frontend
```

> Note: When the frontend is served from Docker/nginx, configure the API URL for your environment (the dev app uses `http://localhost:8080/api/tasks`).

### Local run summary

1. MySQL: run `database/init.sql`, set `DB_*` env vars.
2. Terminal A: `cd app/backend && mvn spring-boot:run`
3. Terminal B: `cd app/frontend && npm install && npm run dev`

---

## Platform flow

`GitHub push → GitHub Actions tests/builds/scans → AWS ECR → Jenkins deployment → Kubernetes → Prometheus/Grafana`

## Folder guide

| Folder | Purpose |
| --- | --- |
| `app/frontend/` | React (Vite) task UI |
| `app/backend/` | Spring Boot REST API |
| `database/` | MySQL `init.sql` |
| `.github/workflows/` | GitHub Actions CI pipeline |
| `jenkins/` | Jenkins deployment pipeline |
| `terraform/` | AWS infrastructure code |
| `deploy/kubernetes/` | Kubernetes manifests |
| `deploy/docker-compose/` | Local development environment |
| `monitoring/` | Prometheus and Grafana configuration |
| `scripts/` | Health-check and rollback helper scripts |
| `docs/` | Architecture diagram, setup guide, screenshots |

## Recommended build order

1. Run the frontend and backend locally (see Task Management System above).
2. Dockerize each application.
3. Run them with Docker Compose.
4. Add GitHub Actions to test, build, scan and push images.
5. Create AWS infrastructure with Terraform.
6. Add Jenkins deployment.
7. Deploy to Kubernetes.
8. Add monitoring, health checks and rollback.

## Important

Do not commit passwords, AWS keys, tokens or `.env` files. Store secrets in GitHub Secrets, Jenkins Credentials, AWS Secrets Manager, or Kubernetes Secrets.
