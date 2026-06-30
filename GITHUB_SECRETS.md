# GitHub Secrets Configuration

This document lists all the GitHub Secrets required for the EduHub deployment pipeline.

## How to Add GitHub Secrets

1. Go to your GitHub repository
2. Navigate to **Settings** → **Secrets and variables** → **Actions**
3. Click **New repository secret**
4. Add each secret listed below

## Required Secrets

### Database Secrets
| Secret Name | Description | Example |
|------------|-------------|---------|
| `DB_PASSWORD` | PostgreSQL database password | `your_secure_db_password` |
| `PGADMIN_PASSWORD` | pgAdmin admin panel password | `your_pgadmin_password` |

### JWT Authentication Secrets
| Secret Name | Description | Example |
|------------|-------------|---------|
| `JWT_SECRET` | Secret key for JWT token signing | `change_this_to_a_long_random_secret_256_bits` |
| `JWT_REFRESH_SECRET` | Secret key for JWT refresh token signing | `change_this_to_another_long_random_secret` |

### SMTP Email Secrets ⚠️ **NEW**
| Secret Name | Description | How to Get |
|------------|-------------|------------|
| `SMTP_USER` | Gmail address for sending emails | Your Gmail address (e.g., `your.email@gmail.com`) |
| `SMTP_PASS` | Gmail App Password | Generate at https://myaccount.google.com/apppasswords |

**Important for SMTP:**
- `SMTP_USER` must be a valid Gmail address
- `SMTP_PASS` must be a Gmail **App Password**, NOT your regular Gmail password
- To generate an App Password:
  1. Visit https://myaccount.google.com/apppasswords
  2. Sign in to your Google Account
  3. Create an app password named "EduHub SMTP"
  4. Copy the 16-character password (format: `xxxx xxxx xxxx xxxx`)
  5. Remove spaces and add to GitHub Secrets

### Deployment Secrets
| Secret Name | Description | Example |
|------------|-------------|---------|
| `SSH_HOST` | Production server hostname/IP | `100.64.1.23` or `server.example.com` |
| `SSH_USER` | SSH username for deployment | `deploy` or `ubuntu` |
| `SSH_PRIVATE_KEY` | SSH private key for authentication | Your SSH private key content |
| `SSH_PORT` | SSH port (if not 22) | `22` or `2222` |
| `TS_AUTH_KEY` | Tailscale authentication key | Generate from Tailscale admin console |
| `GHCR_TOKEN` | GitHub Container Registry token | GitHub Personal Access Token with `write:packages` scope |

## Verification

After adding all secrets, verify they're configured:

```bash
# Local .env should ONLY have these for development
SMTP_USER=your_local_gmail@gmail.com
SMTP_PASS=your_local_app_password

# GitHub Secrets should have these for production
SMTP_USER → Set in GitHub Secrets
SMTP_PASS → Set in GitHub Secrets
```

## Security Notes

✅ **DO:**
- Use App Passwords for Gmail (never regular passwords)
- Keep secrets unique between environments
- Rotate secrets regularly (every 90 days)
- Use strong, randomly generated secrets for JWT

❌ **DON'T:**
- Commit secrets to Git
- Share secrets via email or chat
- Reuse passwords across services
- Use weak or predictable secrets

## Testing Email in Production

After deployment, test email functionality:

1. Submit a test application through the production site
2. Check the backend logs: `docker logs eduhub_backend`
3. Look for: `[EmailService] SMTP configured with host: smtp.gmail.com`
4. Verify email delivery to the applicant's inbox

If emails aren't sending, check:
- GitHub Secrets are correctly set
- App Password is valid (not expired)
- Gmail account has 2FA enabled (required for App Passwords)
