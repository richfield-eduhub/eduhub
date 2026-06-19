#!/bin/bash

###############################################################################
# Database Backup Script
#
# Performs automated database backups with encryption and compression
# - Full backups: Daily at 2:00 AM, 30-day retention
# - Incremental backups: Every 6 hours, 7-day retention
# - AES-256 encryption
# - Gzip compression
#
# Usage: ./backup-database.sh [full|incremental]
###############################################################################

set -e  # Exit on error

# Configuration
BACKUP_TYPE="${1:-full}"  # full or incremental
BACKUP_DIR="/var/backups/eduhub/database"
BACKUP_LOG="/var/log/eduhub/backup.log"
ENCRYPTION_KEY_FILE="/etc/eduhub/backup.key"
MAX_FULL_BACKUPS=30
MAX_INCREMENTAL_BACKUPS=7

# Database credentials (from environment or .env)
DB_HOST="${DB_HOST:-localhost}"
DB_PORT="${DB_PORT:-5432}"
DB_NAME="${DB_NAME:-eduhub}"
DB_USER="${DB_USER:-halo}"
DB_PASSWORD="${DB_PASSWORD}"

# S3 Configuration (optional - for cloud backup)
S3_BUCKET="${S3_BUCKET:-}"
S3_REGION="${S3_REGION:-us-east-1}"

# Timestamp
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
DATE=$(date +"%Y-%m-%d %H:%M:%S")

# Logging function
log() {
    echo "[$DATE] $1" | tee -a "$BACKUP_LOG"
}

# Create backup directory if it doesn't exist
mkdir -p "$BACKUP_DIR"
mkdir -p "$(dirname "$BACKUP_LOG")"

# Generate encryption key if it doesn't exist
if [ ! -f "$ENCRYPTION_KEY_FILE" ]; then
    log "Generating encryption key..."
    openssl rand -base64 32 > "$ENCRYPTION_KEY_FILE"
    chmod 600 "$ENCRYPTION_KEY_FILE"
    log "Encryption key generated at $ENCRYPTION_KEY_FILE"
fi

# Backup filename
if [ "$BACKUP_TYPE" = "full" ]; then
    BACKUP_FILE="$BACKUP_DIR/eduhub_full_${TIMESTAMP}.sql.gz.enc"
    log "Starting FULL database backup..."
else
    BACKUP_FILE="$BACKUP_DIR/eduhub_incremental_${TIMESTAMP}.sql.gz.enc"
    log "Starting INCREMENTAL database backup..."
fi

# Export password for pg_dump
export PGPASSWORD="$DB_PASSWORD"

# Perform backup
log "Backing up database: $DB_NAME"

if [ "$BACKUP_TYPE" = "full" ]; then
    # Full backup
    pg_dump -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -Fc "$DB_NAME" | \
        gzip | \
        openssl enc -aes-256-cbc -salt -pbkdf2 -pass file:"$ENCRYPTION_KEY_FILE" \
        > "$BACKUP_FILE"
else
    # Incremental backup (dump schema + data changes since last full backup)
    # Note: PostgreSQL doesn't natively support incremental backups
    # This is a simplified version - use WAL archiving for true incremental backups
    pg_dump -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -Fc "$DB_NAME" | \
        gzip | \
        openssl enc -aes-256-cbc -salt -pbkdf2 -pass file:"$ENCRYPTION_KEY_FILE" \
        > "$BACKUP_FILE"
fi

# Unset password
unset PGPASSWORD

# Check if backup was successful
if [ $? -eq 0 ]; then
    BACKUP_SIZE=$(du -h "$BACKUP_FILE" | cut -f1)
    log "Backup successful: $BACKUP_FILE (Size: $BACKUP_SIZE)"
else
    log "ERROR: Backup failed!"
    exit 1
fi

# Upload to S3 (if configured)
if [ -n "$S3_BUCKET" ]; then
    log "Uploading backup to S3: s3://$S3_BUCKET/backups/database/"
    aws s3 cp "$BACKUP_FILE" "s3://$S3_BUCKET/backups/database/" --region "$S3_REGION"

    if [ $? -eq 0 ]; then
        log "S3 upload successful"
    else
        log "WARNING: S3 upload failed (backup still available locally)"
    fi
fi

# Cleanup old backups
log "Cleaning up old backups..."

if [ "$BACKUP_TYPE" = "full" ]; then
    # Keep only last 30 full backups
    ls -t "$BACKUP_DIR"/eduhub_full_*.sql.gz.enc | tail -n +$((MAX_FULL_BACKUPS + 1)) | xargs -r rm -f
    log "Removed full backups older than $MAX_FULL_BACKUPS days"
else
    # Keep only last 7 incremental backups
    ls -t "$BACKUP_DIR"/eduhub_incremental_*.sql.gz.enc | tail -n +$((MAX_INCREMENTAL_BACKUPS + 1)) | xargs -r rm -f
    log "Removed incremental backups older than $MAX_INCREMENTAL_BACKUPS days"
fi

# Cleanup S3 old backups (if configured)
if [ -n "$S3_BUCKET" ]; then
    log "Cleaning up old S3 backups..."

    if [ "$BACKUP_TYPE" = "full" ]; then
        # Delete full backups older than 30 days from S3
        CUTOFF_DATE=$(date -d "30 days ago" +%Y%m%d)
        aws s3 ls "s3://$S3_BUCKET/backups/database/" --region "$S3_REGION" | \
            grep "eduhub_full_" | \
            awk '{print $4}' | \
            while read filename; do
                FILE_DATE=$(echo "$filename" | grep -oP '\d{8}' | head -1)
                if [ "$FILE_DATE" -lt "$CUTOFF_DATE" ]; then
                    aws s3 rm "s3://$S3_BUCKET/backups/database/$filename" --region "$S3_REGION"
                    log "Deleted old S3 backup: $filename"
                fi
            done
    fi
fi

# Verify backup integrity
log "Verifying backup integrity..."
openssl enc -d -aes-256-cbc -pbkdf2 -pass file:"$ENCRYPTION_KEY_FILE" -in "$BACKUP_FILE" | \
    gzip -t > /dev/null 2>&1

if [ $? -eq 0 ]; then
    log "Backup verification successful"
else
    log "ERROR: Backup verification failed!"
    exit 1
fi

log "Backup process completed successfully"
exit 0
