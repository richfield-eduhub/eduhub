# EduHub Disaster Recovery Plan

## Overview

This document outlines the disaster recovery procedures for the EduHub system, including backup strategies, restore procedures, and recovery time objectives.

## Recovery Objectives

- **Recovery Time Objective (RTO)**: 4 hours
- **Recovery Point Objective (RPO)**: 24 hours for database, 24 hours for files

## Backup Strategy

### Database Backups

**Location**: `/var/backups/eduhub/database/`

**Schedule**:
- Full backups: Daily at 2:00 AM
- Incremental backups: Every 6 hours
- Retention: 30 days (full), 7 days (incremental)

**Features**:
- AES-256 encryption with PBKDF2
- Gzip compression
- Automatic integrity verification
- Optional S3 upload for offsite storage

**Backup Script**: `backup-database.sh`

### File Storage Backups

**Location**: `/var/backups/eduhub/files/`

**Schedule**:
- Daily backups at 3:00 AM
- Incremental synchronization using rsync
- Retention: 30 days

**Features**:
- MD5 checksum verification
- Hard-link based incremental backups (space-efficient)
- Optional S3 upload for offsite storage

**Backup Script**: `backup-files.sh`

## Setup Instructions

### 1. Install Required Dependencies

```bash
# Database tools
sudo apt-get install postgresql-client

# Encryption tools
sudo apt-get install openssl

# AWS CLI (optional - for S3 backups)
sudo apt-get install awscli
```

### 2. Configure Backup Scripts

Create environment configuration file:

```bash
sudo mkdir -p /etc/eduhub
sudo nano /etc/eduhub/backup.env
```

Add the following variables:

```bash
# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_NAME=eduhub
DB_USER=halo
DB_PASSWORD=your_secure_password

# File Storage Configuration
UPLOADS_DIR=/var/www/eduhub/uploads

# S3 Configuration (optional)
S3_BUCKET=your-backup-bucket
S3_REGION=us-east-1

# AWS Credentials (if using S3)
AWS_ACCESS_KEY_ID=your_access_key
AWS_SECRET_ACCESS_KEY=your_secret_key
```

### 3. Set Correct Permissions

```bash
# Make scripts executable
chmod +x /path/to/eduhub/backend/scripts/*.sh

# Secure environment file
sudo chmod 600 /etc/eduhub/backup.env

# Create backup directories
sudo mkdir -p /var/backups/eduhub/database
sudo mkdir -p /var/backups/eduhub/files
sudo mkdir -p /var/log/eduhub

# Set ownership
sudo chown -R eduhub:eduhub /var/backups/eduhub
sudo chown -R eduhub:eduhub /var/log/eduhub
```

### 4. Configure Cron Jobs

Edit crontab:

```bash
sudo crontab -e -u eduhub
```

Add the following entries:

```bash
# Source environment variables
SHELL=/bin/bash
BASH_ENV=/etc/eduhub/backup.env

# Database full backup - Daily at 2:00 AM
0 2 * * * /path/to/eduhub/backend/scripts/backup-database.sh full

# Database incremental backup - Every 6 hours
0 */6 * * * /path/to/eduhub/backend/scripts/backup-database.sh incremental

# File storage backup - Daily at 3:00 AM
0 3 * * * /path/to/eduhub/backend/scripts/backup-files.sh

# Cleanup old pre-restore backups - Weekly on Sunday at 4:00 AM
0 4 * * 0 find /var/backups/eduhub/database -name "pre_restore_*" -mtime +7 -delete
0 4 * * 0 find /var/backups/eduhub/files -name "pre_restore_*" -mtime +7 -delete
```

### 5. Test Backups

Run manual backups to verify configuration:

```bash
# Test database backup
sudo -u eduhub /path/to/eduhub/backend/scripts/backup-database.sh full

# Test file backup
sudo -u eduhub /path/to/eduhub/backend/scripts/backup-files.sh

# Check backup logs
tail -f /var/log/eduhub/backup.log
```

## Disaster Recovery Procedures

### Scenario 1: Database Corruption or Data Loss

**Steps**:

1. **Stop the application**:
   ```bash
   sudo systemctl stop eduhub
   ```

2. **Identify the backup to restore**:
   ```bash
   ls -lh /var/backups/eduhub/database/
   # Choose the most recent backup before the incident
   ```

3. **Run the restore script**:
   ```bash
   sudo -u eduhub /path/to/eduhub/backend/scripts/restore-database.sh \
       /var/backups/eduhub/database/eduhub_full_YYYYMMDD_HHMMSS.sql.gz.enc
   ```

4. **Follow the prompts**:
   - The script will create a pre-restore backup
   - Confirm the restoration when prompted

5. **Verify the restoration**:
   ```bash
   # Connect to database
   psql -U halo -d eduhub

   # Check critical tables
   SELECT COUNT(*) FROM users;
   SELECT COUNT(*) FROM applications;
   SELECT COUNT(*) FROM students;
   ```

6. **Restart the application**:
   ```bash
   sudo systemctl start eduhub
   ```

7. **Monitor logs**:
   ```bash
   tail -f /var/log/eduhub/restore.log
   sudo journalctl -u eduhub -f
   ```

**Estimated Recovery Time**: 1-2 hours

### Scenario 2: File Storage Loss or Corruption

**Steps**:

1. **Stop the application** (optional, to prevent concurrent modifications):
   ```bash
   sudo systemctl stop eduhub
   ```

2. **Identify the backup to restore**:
   ```bash
   ls -lhd /var/backups/eduhub/files/files_*
   # Choose the most recent backup
   ```

3. **Run the restore script**:
   ```bash
   sudo -u eduhub /path/to/eduhub/backend/scripts/restore-files.sh \
       /var/backups/eduhub/files/files_YYYYMMDD_HHMMSS
   ```

4. **Follow the prompts**:
   - The script will create a pre-restore backup
   - Confirm the restoration when prompted

5. **Verify the restoration**:
   ```bash
   # Check file count
   find /var/www/eduhub/uploads -type f | wc -l

   # Verify file permissions
   ls -la /var/www/eduhub/uploads
   ```

6. **Restart the application**:
   ```bash
   sudo systemctl start eduhub
   ```

**Estimated Recovery Time**: 30 minutes - 2 hours (depending on file count)

### Scenario 3: Complete System Failure

**Steps**:

1. **Provision new server** with same OS and specifications

2. **Install EduHub application**:
   ```bash
   # Clone repository
   git clone https://github.com/your-org/eduhub.git

   # Install dependencies
   cd eduhub/backend
   npm install
   ```

3. **Install PostgreSQL**:
   ```bash
   sudo apt-get install postgresql postgresql-contrib
   ```

4. **Create database and user**:
   ```bash
   sudo -u postgres psql
   CREATE DATABASE eduhub;
   CREATE USER halo WITH PASSWORD 'your_password';
   GRANT ALL PRIVILEGES ON DATABASE eduhub TO halo;
   \q
   ```

5. **Restore database from S3** (or local backup):
   ```bash
   # If using S3
   /path/to/eduhub/backend/scripts/restore-database.sh \
       s3://your-bucket/backups/database/eduhub_full_YYYYMMDD_HHMMSS.sql.gz.enc

   # If using local backup (copy from backup server first)
   /path/to/eduhub/backend/scripts/restore-database.sh \
       /path/to/backup.sql.gz.enc
   ```

6. **Restore file storage**:
   ```bash
   # Create uploads directory
   sudo mkdir -p /var/www/eduhub/uploads

   # Restore from S3 or local backup
   /path/to/eduhub/backend/scripts/restore-files.sh \
       s3://your-bucket/backups/files/files_YYYYMMDD_HHMMSS.tar.gz
   ```

7. **Configure environment**:
   ```bash
   # Copy .env file
   cp .env.example .env
   nano .env  # Update with production values
   ```

8. **Start application**:
   ```bash
   npm start
   # Or if using PM2:
   pm2 start ecosystem.config.js
   ```

9. **Verify functionality**:
   - Test login
   - Verify application submissions
   - Check file uploads/downloads
   - Test all critical workflows

**Estimated Recovery Time**: 3-4 hours

### Scenario 4: Rollback After Failed Update

**Steps**:

1. **Stop the application**:
   ```bash
   sudo systemctl stop eduhub
   ```

2. **Restore pre-update database backup**:
   ```bash
   # The backup script creates these automatically
   ls /var/backups/eduhub/database/pre_restore_*

   # Restore the pre-update backup
   /path/to/eduhub/backend/scripts/restore-database.sh \
       /var/backups/eduhub/database/pre_restore_YYYYMMDD_HHMMSS.sql.gz.enc
   ```

3. **Rollback code changes**:
   ```bash
   cd /path/to/eduhub
   git log --oneline -10  # Find commit before update
   git checkout <commit-hash>
   npm install  # Reinstall dependencies
   ```

4. **Restart application**:
   ```bash
   sudo systemctl start eduhub
   ```

**Estimated Recovery Time**: 30 minutes

## Monitoring and Alerts

### Backup Monitoring

Create a monitoring script to check backup health:

```bash
#!/bin/bash
# /path/to/eduhub/backend/scripts/check-backups.sh

BACKUP_DIR="/var/backups/eduhub"
ALERT_EMAIL="admin@eduhub.ac.za"

# Check if backups exist from last 24 hours
DB_BACKUP=$(find "$BACKUP_DIR/database" -name "eduhub_full_*.sql.gz.enc" -mtime -1 | wc -l)
FILE_BACKUP=$(find "$BACKUP_DIR/files" -name "files_*" -mtime -1 -type d | wc -l)

if [ "$DB_BACKUP" -eq 0 ]; then
    echo "ALERT: No database backup found in last 24 hours" | mail -s "EduHub Backup Alert" "$ALERT_EMAIL"
fi

if [ "$FILE_BACKUP" -eq 0 ]; then
    echo "ALERT: No file backup found in last 24 hours" | mail -s "EduHub Backup Alert" "$ALERT_EMAIL"
fi
```

Add to crontab to run daily:

```bash
0 9 * * * /path/to/eduhub/backend/scripts/check-backups.sh
```

### Log Monitoring

Monitor backup logs for errors:

```bash
# Check recent backup logs
tail -n 100 /var/log/eduhub/backup.log | grep -i error

# Set up log rotation
sudo nano /etc/logrotate.d/eduhub
```

Add the following to logrotate configuration:

```
/var/log/eduhub/*.log {
    daily
    rotate 30
    compress
    delaycompress
    missingok
    notifempty
    create 0640 eduhub eduhub
}
```

## Security Considerations

1. **Encryption Keys**:
   - Store encryption key file (`/etc/eduhub/backup.key`) securely
   - Backup the encryption key to a separate secure location
   - Limit access: `chmod 600 /etc/eduhub/backup.key`

2. **S3 Bucket Security**:
   - Enable S3 bucket encryption
   - Use IAM roles with minimal required permissions
   - Enable S3 versioning for additional protection
   - Configure bucket lifecycle policies

3. **Access Control**:
   - Limit SSH access to backup server
   - Use key-based authentication only
   - Enable audit logging for all restore operations

4. **Backup Testing**:
   - Perform quarterly restore drills
   - Document restore times and issues
   - Update procedures based on test results

## Offsite Backup Strategy

### S3 Configuration

1. **Create S3 bucket**:
   ```bash
   aws s3 mb s3://eduhub-backups --region us-east-1
   ```

2. **Enable encryption**:
   ```bash
   aws s3api put-bucket-encryption \
       --bucket eduhub-backups \
       --server-side-encryption-configuration '{
           "Rules": [{
               "ApplyServerSideEncryptionByDefault": {
                   "SSEAlgorithm": "AES256"
               }
           }]
       }'
   ```

3. **Configure lifecycle policy** (optional - additional retention):
   ```bash
   aws s3api put-bucket-lifecycle-configuration \
       --bucket eduhub-backups \
       --lifecycle-configuration file://lifecycle-policy.json
   ```

Example lifecycle policy (`lifecycle-policy.json`):

```json
{
  "Rules": [
    {
      "Id": "Archive old backups",
      "Status": "Enabled",
      "Transitions": [
        {
          "Days": 30,
          "StorageClass": "GLACIER"
        },
        {
          "Days": 90,
          "StorageClass": "DEEP_ARCHIVE"
        }
      ],
      "Expiration": {
        "Days": 365
      }
    }
  ]
}
```

## Troubleshooting

### Issue: Restore fails with "Invalid encryption key"

**Solution**:
- Verify you're using the correct encryption key file
- Check that the encryption key hasn't been corrupted
- Ensure the backup file is from the same system/key

### Issue: Database restore fails with permission errors

**Solution**:
```bash
# Grant necessary permissions
sudo -u postgres psql
GRANT ALL PRIVILEGES ON DATABASE eduhub TO halo;
ALTER DATABASE eduhub OWNER TO halo;
```

### Issue: File restore shows checksum errors

**Solution**:
- Download backup again if from S3
- Use `--force` option to skip checksum verification (last resort)
- Investigate disk errors if backups are consistently corrupted

### Issue: Out of disk space during restore

**Solution**:
```bash
# Check disk space
df -h

# Clean up old pre-restore backups
find /var/backups/eduhub -name "pre_restore_*" -mtime +7 -delete

# Increase volume size if consistently running out of space
```

## Contact Information

For disaster recovery assistance:

- **Primary Contact**: System Administrator - admin@eduhub.ac.za
- **Backup Contact**: IT Manager - it-manager@eduhub.ac.za
- **24/7 Hotline**: +27-XX-XXX-XXXX

## Revision History

| Date | Version | Changes | Author |
|------|---------|---------|--------|
| 2026-06-19 | 1.0 | Initial disaster recovery plan | System |

## Next Steps

1. Review this document with IT team
2. Schedule quarterly backup/restore drills
3. Update contact information
4. Configure monitoring alerts
5. Test S3 backup/restore procedures
6. Document any custom configurations
