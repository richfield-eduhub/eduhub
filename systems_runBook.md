# EduHub Home Server Setup — Session Summary

## 🖥️ Hardware
- **Machine:** Mac mini (Late 2014)
- **Specs:** 2.8GHz Dual-Core Intel Core i5, 8GB RAM, ~98GB storage
- **OS Before:** macOS Monterey 12.7.6 (unsupported, no security updates)

---

## ✅ What We Achieved

### 1. Ubuntu Server Installation
- Wiped macOS and installed **Ubuntu Server 24.04.4 LTS** with HWE kernel
- Fought through Apple firmware bugs (`Corrupted DMI table`) by adding `acpi=off` to the kernel boot parameters
- Used HDMI display and ethernet cable during install (Thunderbolt and WiFi don't work out of the box)

### 2. Network Configuration
- Manually created `/etc/netplan/01-netcfg.yaml` to bring up ethernet (`enp3s0f0`)
- Installed Broadcom WiFi drivers (`bcmwl-kernel-source`) for the BCM4360 chip
- Configured WiFi interface `wlp2s0` via netplan
- Server local IP: `192.168.1.90`
- Server Tailscale IP: `100.72.154.84`
- Public IP: `41.133.88.73`

### 3. SSH Hardening
- Installed and enabled OpenSSH server
- Changed SSH port from `22` to `6609`
- Disabled `ssh.socket` to allow custom port
- Generated dedicated SSH key (`id_ed25519_homeserver`) on laptop
- Configured `~/.ssh/config` on laptop for easy access:
  ```
  Host homeserver
      HostName 192.168.1.90
      User netian
      Port 6609
      IdentityFile ~/.ssh/id_ed25519_homeserver
  ```
- Disabled password authentication (`PasswordAuthentication no`)
- Disabled root login (`PermitRootLogin no`)
- Set `ListenAddress 0.0.0.0` for Tailscale compatibility

### 4. Firewall (UFW)
- Enabled UFW with the following rules:
  ```
  80/tcp    ALLOW IN
  443/tcp   ALLOW IN
  6609/tcp  ALLOW IN
  tailscale0 ALLOW IN
  ```

### 5. Docker Installation
- Installed **Docker 29.4.0** and **Docker Compose v5.1.3** from official Docker repo
- Added user to `docker` group (no sudo needed)
- Verified with `docker run hello-world`

### 6. DuckDNS Setup
- Domain: `edu-hub.duckdns.org` → `41.133.88.73`
- Created update script at `~/duckdns/duck.sh`
- Cron job to update IP every 5 minutes:
  ```
  */5 * * * * ~/duckdns/duck.sh
  ```

### 7. Router Port Forwarding
- Port `80` → `192.168.1.90:80` (HTTP)
- Port `443` → `192.168.1.90:443` (HTTPS)
- Port `6609` → `192.168.1.90:6609` (SSH)

### 8. Tailscale VPN
- Installed `cloudflared` and Tailscale to solve ISP blocking of GitHub Actions IP ranges (Azure `4.x.x.x`)
- Installed **Tailscale** on server
- Server joined Tailnet at `100.72.154.84`
- Configured Tailscale ACL to allow `tag:ci` runners full access
- Generated ephemeral auth key for GitHub Actions runner

### 9. GitHub Actions CI/CD Pipeline
- Pipeline: **push to main → build images → push to GHCR → deploy to server**
- Uses **Tailscale GitHub Action** to join the VPN before SSHing
- Detects which services changed using `dorny/paths-filter`
- Only rebuilds affected images (backend or nginx/frontend)
- Deploys with `--no-deps` to avoid restarting unaffected containers
- **Rollback on failed health check** — old container stays running if new one is unhealthy
- GitHub Secrets configured:
  - `SSH_HOST`, `SSH_USER`, `SSH_PORT`, `SSH_PRIVATE_KEY`
  - `GHCR_TOKEN`, `TS_AUTH_KEY`
  - `DB_PASSWORD`, `JWT_SECRET`, `JWT_REFRESH_SECRET`, `PGADMIN_PASSWORD`

### 10. Docker Compose Structure
- `docker-compose.yml` — base/shared config (postgres, pgadmin, backend, nginx)
- `docker-compose.override.yml` — local dev (auto-applied, builds from local Dockerfiles, mounts source code)
- `docker-compose.prod.yml` — production (pulls images from GHCR)
- `.env` — generated on server by pipeline from GitHub Secrets (single source of truth)

### 11. GHCR Image Registry
- Backend image: `ghcr.io/richfield-eduhub/eduhub-backend:latest`
- Nginx image: `ghcr.io/richfield-eduhub/eduhub-nginx:latest`
- Images built on GitHub's servers, pushed to GHCR, pulled on server

### 12. Frontend Baked into Nginx Image
- Updated `nginx/Dockerfile` to `COPY frontend/ /usr/share/nginx/html/`
- Build context changed to root (`.`) with `file: ./nginx/Dockerfile`
- Any change to `frontend/**` triggers nginx image rebuild

### 13. SSL/HTTPS with Let's Encrypt (Certbot)
- Domain secured: `edu-hub.duckdns.org` with Let's Encrypt certificate
- Nginx now serves:
  - `80/tcp`: ACME challenge (`/.well-known/acme-challenge/*`), `/healthz`, and HTTP -> HTTPS redirect
  - `443/tcp`: main app traffic with TLS certs from `/etc/letsencrypt/live/edu-hub.duckdns.org/`
- Added shared cert volumes for `nginx` and `certbot`:
  - `./certbot/conf:/etc/letsencrypt`
  - `./certbot/www:/var/www/certbot`
- Added `certbot` container renewal loop (`certbot renew` every 12 hours)
- First-time bootstrap strategy:
  1. Start nginx with temporary self-signed cert (so container can start)
  2. Issue real cert with certbot webroot challenge
  3. Reload nginx to activate real cert
- Verification result:
  - `issuer=C = US, O = Let's Encrypt`
  - `subject=CN = edu-hub.duckdns.org`
  - Valid until `2026-07-18`

---

## 🗂️ Project Structure
```
eduhub/
├── .github/
│   └── workflows/
│       └── deploy.yml          # CI/CD pipeline
├── backend/                    # Node.js/Express API
│   ├── Dockerfile
│   └── src/
├── database/
│   └── init.sql
├── frontend/                   # Pure HTML/CSS/JS
├── nginx/
│   ├── Dockerfile
│   └── nginx.conf
├── pgadmin-config/
├── docker-compose.yml          # Base config
├── docker-compose.override.yml # Local dev (auto-applied)
├── docker-compose.prod.yml     # Production (GHCR images)
├── Makefile                    # Dev and prod commands
└── .env                        # Generated by pipeline (not in repo)
```

---

## 🚀 How to Deploy
```bash
# Any push to main triggers the pipeline automatically
git push origin main
```

## 💻 How to Run Locally
```bash
docker compose up        # Uses override.yml automatically
docker compose down
make help                # See all available commands
```

## 🔧 Useful Server Commands
```bash
# SSH into server
ssh homeserver

# Check running containers
docker ps

# Check logs
docker logs eduhub_backend
docker logs eduhub_nginx

# Manual prod deploy
cd ~/prod/eduhub
docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d
docker compose -f docker-compose.yml -f docker-compose.prod.yml logs -f nginx certbot

# Check Tailscale
tailscale status
```

---

## 🔜 Next Steps
- [ ] Fix missing `morgan` dependency in `backend/package.json`
- [ ] Get all containers healthy (`db`, `pgadmin`, `backend`, `nginx`)
- [ ] Verify `edu-hub.duckdns.org` loads in browser
- [x] Set up SSL/HTTPS with Let's Encrypt (certbot)
- [ ] Set up automated database backups
- [ ] Configure log rotation
- [ ] Set up monitoring (Uptime Robot or similar)
- [ ] Remove debug step from pipeline once stable

---

---

## 📚 Command Reference

### 🐧 Linux / Ubuntu Basics
```bash
# System info
uname -a                          # Kernel version
lsb_release -a                    # Ubuntu version
df -h                             # Disk usage
free -h                           # RAM usage
top                               # Live process monitor (q to quit)
htop                              # Better process monitor (install: sudo apt install htop)
uptime                            # How long server has been running

# Files and navigation
ls -lthr                          # List files sorted by date, human readable
pwd                               # Current directory
cd ~                              # Go to home directory
cat filename                      # Print file contents
nano filename                     # Edit file (Ctrl+O save, Ctrl+X exit)
cp source dest                    # Copy file
mv source dest                    # Move/rename file
rm filename                       # Delete file
mkdir -p path/to/dir              # Create directory (and parents)
chmod 600 filename                # Set file permissions (owner read/write only)
chown user:group filename         # Change file owner

# Searching
grep -r "text" ./folder           # Search for text in folder recursively
find . -name "*.yml"              # Find files by name
cat file | grep "keyword"         # Filter file output

# Processes
ps aux                            # List all running processes
kill PID                          # Kill process by ID
sudo kill -9 PID                  # Force kill process
```

### 🌐 Networking
```bash
# IP and interfaces
ip a                              # Show all network interfaces and IPs
ip a show wlp2s0                  # Show specific interface
ip route                          # Show routing table
ip route | grep default           # Show default gateway (router IP)

# Connectivity
ping google.com                   # Test internet connectivity
curl ifconfig.me                  # Get your public IP
curl -v https://google.com        # Test HTTP connectivity verbose
nc -zv 192.168.1.90 6609          # Test if port is open (netcat)
nslookup edu-hub.duckdns.org      # DNS lookup

# Netplan (network config)
sudo netplan apply                # Apply network config changes
sudo netplan try                  # Test config (reverts after 120s if not confirmed)
cat /etc/netplan/*.yaml           # View network config

# Firewall (UFW)
sudo ufw status verbose           # Show firewall rules
sudo ufw allow 80/tcp             # Allow port
sudo ufw deny 80/tcp              # Deny port
sudo ufw delete allow 80/tcp      # Remove rule
sudo ufw enable                   # Enable firewall
sudo ufw disable                  # Disable firewall
sudo ufw reload                   # Reload rules

# Port monitoring
sudo ss -tlnp                     # Show all listening ports
sudo ss -tlnp | grep 6609         # Check specific port
sudo tcpdump -i tailscale0        # Capture traffic on interface
sudo tcpdump -i tailscale0 port 6609  # Capture traffic on specific port
```

### 🔐 SSH
```bash
# Connect
ssh username@ip                   # Basic SSH
ssh username@ip -p 6609           # SSH on custom port
ssh -i ~/.ssh/keyfile user@ip     # SSH with specific key
ssh homeserver                    # SSH using ~/.ssh/config alias

# Key management
ssh-keygen -t ed25519 -C "label" -f ~/.ssh/keyname   # Generate new key
ssh-copy-id -p 6609 user@ip       # Copy public key to server
cat ~/.ssh/keyname.pub            # Print public key
cat ~/.ssh/keyname                # Print private key (keep secret!)

# SSH config (~/.ssh/config)
# Host homeserver
#     HostName 192.168.1.90
#     User netian
#     Port 6609
#     IdentityFile ~/.ssh/id_ed25519_homeserver

# SCP (copy files over SSH)
scp -P 6609 file.txt user@ip:~/          # Copy file to server
scp -P 6609 user@ip:~/file.txt ./        # Copy file from server
scp -P 6609 -r folder/ user@ip:~/        # Copy folder to server

# SSH service management
sudo systemctl status ssh         # Check SSH status
sudo systemctl restart ssh        # Restart SSH
sudo systemctl enable ssh         # Enable SSH on boot
sudo systemctl stop ssh.socket    # Stop socket activation
sudo systemctl disable ssh.socket # Disable socket activation
sudo nano /etc/ssh/sshd_config    # Edit SSH config
```

### ⚙️ Systemd Services
```bash
sudo systemctl status servicename    # Check service status
sudo systemctl start servicename     # Start service
sudo systemctl stop servicename      # Stop service
sudo systemctl restart servicename   # Restart service
sudo systemctl enable servicename    # Enable on boot
sudo systemctl disable servicename   # Disable on boot
sudo systemctl reload servicename    # Reload config without restart
journalctl -xe                       # View system logs
journalctl -u servicename            # View logs for specific service
journalctl -f                        # Follow live logs
```

### 🐳 Docker
```bash
# Images
docker images                        # List local images
docker pull image:tag                # Pull image from registry
docker rmi image:tag                 # Remove image
docker system prune -f               # Remove unused images/containers/networks

# Containers
docker ps                            # List running containers
docker ps -a                         # List all containers including stopped
docker run image                     # Run container
docker run -d image                  # Run container in background
docker stop container                # Stop container
docker start container               # Start stopped container
docker restart container             # Restart container
docker rm container                  # Remove container
docker exec -it container sh         # Shell into running container
docker inspect container             # Detailed container info
docker stats                         # Live resource usage
docker stats --no-stream             # One-time resource snapshot

# Logs
docker logs container                # View container logs
docker logs -f container             # Follow container logs
docker logs --tail 100 container     # Last 100 lines

# Networks & Volumes
docker network ls                    # List networks
docker volume ls                     # List volumes
docker volume rm volumename          # Remove volume

# Registry
docker login ghcr.io -u username --password-stdin   # Login to GHCR
docker tag image ghcr.io/org/image:tag              # Tag image
docker push ghcr.io/org/image:tag                   # Push to registry
```

### 🔐 SSL / Let's Encrypt
```bash
# Validate ACME challenge path over HTTP (must return 200/ok)
mkdir -p ~/prod/eduhub/certbot/www/.well-known/acme-challenge
echo "ok" > ~/prod/eduhub/certbot/www/.well-known/acme-challenge/test
curl -I http://edu-hub.duckdns.org/.well-known/acme-challenge/test
curl http://edu-hub.duckdns.org/.well-known/acme-challenge/test

# Request/replace certificate (webroot mode)
cd ~/prod/eduhub
docker run --rm \
  -v "$(pwd)/certbot/conf:/etc/letsencrypt" \
  -v "$(pwd)/certbot/www:/var/www/certbot" \
  certbot/certbot:latest certonly \
  --webroot -w /var/www/certbot \
  --email admin@eduhub.co.za \
  --agree-tos --no-eff-email \
  -d edu-hub.duckdns.org \
  --non-interactive -v

# Reload nginx after cert issuance/renewal
docker exec eduhub_nginx nginx -s reload

# Verify certificate issuer, subject, and expiry
echo | openssl s_client -connect edu-hub.duckdns.org:443 -servername edu-hub.duckdns.org 2>/dev/null | openssl x509 -noout -issuer -subject -dates
```

### 🐙 Docker Compose
```bash
# Local dev (auto uses docker-compose.override.yml)
docker compose up                    # Start all services
docker compose up -d                 # Start in background
docker compose up --build            # Rebuild and start
docker compose down                  # Stop and remove containers
docker compose down -v               # Stop and remove containers + volumes
docker compose restart               # Restart all services
docker compose restart backend       # Restart specific service
docker compose ps                    # Show service status
docker compose logs -f               # Follow all logs
docker compose logs -f backend       # Follow specific service logs
docker compose exec backend sh       # Shell into service container
docker compose exec db psql -U postgres -d eduhub   # PostgreSQL shell

# Production (explicit files)
docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d
docker compose -f docker-compose.yml -f docker-compose.prod.yml down
docker compose -f docker-compose.yml -f docker-compose.prod.yml pull
docker compose -f docker-compose.yml -f docker-compose.prod.yml ps
docker compose -f docker-compose.yml -f docker-compose.prod.yml logs -f

# Rebuild specific service only (no-deps = don't restart others)
docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d --no-deps backend
```

### 🗄️ PostgreSQL
```bash
# Connect to database
docker compose exec db psql -U postgres -d eduhub

# Inside psql
\l                                   # List databases
\c dbname                            # Connect to database
\dt                                  # List tables
\d tablename                         # Describe table
\q                                   # Quit

# Backup and restore
docker compose exec -T db pg_dump -U postgres eduhub > backup_$(date +%Y%m%d).sql
docker compose exec -T db psql -U postgres eduhub < backup.sql
```

### 🌿 Git
```bash
git status                           # Check what changed
git add .                            # Stage all changes
git add filename                     # Stage specific file
git commit -m "message"              # Commit with message
git push origin main                 # Push to main (triggers pipeline)
git pull                             # Pull latest changes
git log --oneline                    # Compact commit history
git diff                             # Show unstaged changes
git stash                            # Temporarily save changes
git stash pop                        # Restore stashed changes
git branch                           # List branches
git checkout -b branch-name          # Create and switch to new branch
git checkout main                    # Switch to main branch
git merge branch-name                # Merge branch into current
```

### 🔒 Tailscale
```bash
tailscale status                     # Show connected devices
tailscale ip -4                      # Show your Tailscale IPv4
tailscale ping 100.x.x.x             # Ping another device
sudo tailscale up                    # Connect to Tailscale
sudo tailscale up --force-reauth     # Reauthenticate
sudo tailscale down                  # Disconnect
sudo systemctl status tailscaled     # Check Tailscale service
```

### 📦 APT Package Manager
```bash
sudo apt update                      # Update package list
sudo apt upgrade -y                  # Upgrade all packages
sudo apt install packagename         # Install package
sudo apt remove packagename          # Remove package
sudo apt autoremove                  # Remove unused packages
dpkg -l | grep packagename           # Check if package is installed
apt search packagename               # Search for package
```

### ⏰ Cron Jobs
```bash
crontab -e                           # Edit cron jobs
crontab -l                           # List cron jobs

# Cron syntax: minute hour day month weekday command
# */5 * * * *   = every 5 minutes
# 0 * * * *     = every hour
# 0 0 * * *     = every day at midnight
# 0 0 * * 0     = every Sunday at midnight
```

### 🔑 Generate Secrets
```bash
openssl rand -base64 32              # Generate random 32-byte secret (JWT etc)
openssl rand -hex 32                 # Generate random hex secret
uuidgen                              # Generate UUID
```

---

## 📌 Key Details
| Item | Value |
|------|-------|
| Server local IP | `192.168.1.90` |
| Server Tailscale IP | `100.72.154.84` |
| Public IP | `41.133.88.73` |
| Domain | `edu-hub.duckdns.org` |
| SSH Port | `6609` |
| SSH User | `netian` |
| OS | Ubuntu 24.04.4 LTS |
| Docker | 29.4.0 |
| Docker Compose | v5.1.3 |
| GitHub Repo | `richfield-eduhub/eduhub` |
