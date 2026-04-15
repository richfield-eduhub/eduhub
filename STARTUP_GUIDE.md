# EduHub — Startup Guide (Docker Toolbox)

---

## ⚠️ IMPORTANT — Folder Structure

After extracting the zip, your folder looks like this:

```
Downloads/
  eduhub/
    eduhub-merged/        ← THIS is the project root (has docker-compose.yml)
      backend/
      frontend-html/
      database/
      docker-compose.yml
```

All commands must be run from inside `eduhub-merged/`.

---

## Running from Docker Quickstart Terminal (Git Bash)

```bash
cd ~/Downloads/eduhub/eduhub-merged
docker-compose up -d
```

---

## Running from VS Code Terminal (PowerShell)

```powershell
cd C:\Users\user\Downloads\eduhub\eduhub-merged
docker-compose up -d
```

> Note: `docker-compose up -d` works from VS Code/PowerShell too —
> it just starts the containers. The backend container connects to
> the DB internally so the Docker Toolbox IP is not needed.

---

## After starting (~30 seconds to fully boot):

- **Backend API:** http://192.168.99.100:3000/api/health
- **pgAdmin:**     http://192.168.99.100:5050  (admin@eduhub.ac.za / admin)
- **Frontend:**    Open `frontend-html/index.html` in your browser

---

## Stop everything

```bash
docker-compose down
```

---

## Login Credentials (after seed runs automatically)

| Role     | Email                             | Password     |
|----------|-----------------------------------|--------------|
| Admin    | admin@eduhub.ac.za                | Password123! |
| Lecturer | john.smith@eduhub.ac.za           | Password123! |
| Student  | thabo.molefe@student.eduhub.ac.za | Password123! |

