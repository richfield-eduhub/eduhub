# 🚀 EduHub — Deploy to Railway (Free Hosting)

Railway hosts your backend + database online so ALL users share the same data.
Your frontend HTML files are served directly from the same backend — no separate hosting needed.

---

## What Railway gives you
- ✅ Live URL everyone can access (e.g. `https://eduhub-production.up.railway.app`)
- ✅ Shared PostgreSQL database (all users — admin, student, lecturer — see the same data)
- ✅ Free tier: 500 hours/month (enough for a project/demo)
- ✅ No Docker needed on the server — Railway handles it

---

## STEP 1 — Create a GitHub Account (if you don't have one)
Go to https://github.com and sign up. It's free.

---

## STEP 2 — Upload your project to GitHub

### Option A — Using GitHub Desktop (easiest)
1. Download GitHub Desktop: https://desktop.github.com
2. Open it → **File → Add Local Repository**
3. Point it to your project folder (`eduhub-popik-coder-patch`)
4. Click **Publish Repository** → make it **Private** → Publish

### Option B — Using VS Code terminal
Open terminal in your project folder and run:
```bash
git init
git add .
git commit -m "Initial EduHub commit"
```
Then go to https://github.com/new → create a new repo → follow the instructions shown.

---

## STEP 3 — Create a Railway Account
1. Go to https://railway.app
2. Click **Login** → **Login with GitHub**
3. Authorise Railway to access your GitHub

---

## STEP 4 — Create a New Project on Railway
1. Click **New Project**
2. Select **Deploy from GitHub repo**
3. Find and select your `eduhub-popik-coder-patch` repo
4. Railway will start deploying automatically — **wait, don't close the page**

---

## STEP 5 — Add a PostgreSQL Database
1. In your Railway project dashboard, click **+ New**
2. Select **Database → Add PostgreSQL**
3. Railway creates a Postgres database and automatically sets `DATABASE_URL` for your backend
4. **That's it** — no manual config needed. Railway links them automatically.

---

## STEP 6 — Set Environment Variables
1. Click on your **backend service** (not the database)
2. Go to the **Variables** tab
3. Add these variables one by one:

| Variable | Value |
|---|---|
| `NODE_ENV` | `production` |
| `PORT` | `3000` |
| `JWT_SECRET` | Any long random string (e.g. `eduhub_super_secret_jwt_2026_xyz`) |
| `JWT_REFRESH_SECRET` | Another long random string (e.g. `eduhub_refresh_secret_2026_abc`) |
| `JWT_EXPIRES_IN` | `7d` |

> **Note:** Do NOT add DB_HOST, DB_NAME etc — Railway sets `DATABASE_URL` automatically from the PostgreSQL plugin.

---

## STEP 7 — Redeploy
After adding variables:
1. Go to the **Deployments** tab
2. Click **Redeploy** on the latest deployment
3. Watch the logs — you should see:
   ```
   🔄 Running migrations...
   🌱 Running seeds...
   🚀 Starting server...
   ```

---

## STEP 8 — Get Your Live URL
1. Go to your service → **Settings** tab
2. Under **Networking**, click **Generate Domain**
3. Railway gives you a URL like: `https://eduhub-production.up.railway.app`
4. **Share this URL with all your users** — everyone accesses the same database!

---

## STEP 9 — Test It
Open the URL in your browser. You should see the EduHub login page.

Default accounts (created by seed):
| Role | Email | Password |
|---|---|---|
| Admin | admin@eduhub.ac.za | Password123! |
| Lecturer | john.smith@eduhub.ac.za | Password123! |
| Student | thabo.molefe@student.eduhub.ac.za | Password123! |

---

## Running locally (Docker) — still works the same
```bash
docker compose up -d
```
Then open: http://localhost:3000

---

## Troubleshooting

**Deployment fails with "cannot find module"**
→ Make sure `railway.json` is in the root of your project (it is — already included)

**Database connection error**
→ Make sure you added the PostgreSQL plugin in Step 5. Check that `DATABASE_URL` appears automatically in your Variables tab.

**Page loads but login fails**
→ Check that `JWT_SECRET` and `JWT_REFRESH_SECRET` are set in Variables (Step 6)

**Changes not showing after editing code**
→ Push to GitHub again: `git add . && git commit -m "update" && git push`
→ Railway auto-deploys on every push

---

## Email (sender name fix)
The sender name showing your personal Gmail is controlled by EmailJS:
1. Go to https://emailjs.com → Login
2. Email Services → click your service → Edit
3. Change **From Name** to: `EduHub Admissions`
4. Change **From Email** display to: `admissions@eduhub.ac.za`
5. Save — done ✅
