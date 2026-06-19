#!/bin/bash

###############################################################################
# Database Restore Script
#
# Restores encrypted database backups created by backup-database.sh
# - Supports both local and S3 backup sources
# - Decrypts and decompresses backup files
# - Verifies backup integrity before restore
# - Creates pre-restore backup automatically
#
# Usage: ./restore-database.sh <backup-file>
#        ./restore-database.sh s3://bucket/path/to/backup.sql.gz.enc
###############################################################################

set -e  # Exit on error

# Configuration
BACKUP_DIR="/var/backups/eduhub/database"
RESTORE_LOG="/var/log/eduhub/restore.log"
ENCRYPTION_KEY_FILE="/etc/eduhub/backup.key"
TEMP_DIR="/tmp/eduhub-restore-$$"

# Database credentials (from environment or .env)
DB_HOST="${DB_HOST:-localhost}"
DB_PORT="${DB_PORT:-5432}"
DB_NAME="${DB_NAME:-eduhub}"
DB_USER="${DB_USER:-halo}"
DB_PASSWORD="${DB_PASSWORD}"

# Timestamp
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
DATE=$(date +"%Y-%m-%d %H:%M:%S")

# Logging function
log() {
    echo "[$DATE] $1" | tee -a "$RESTORE_LOG"
}

# Cleanup function
cleanup() {
    log "Cleaning up temporary files..."
    rm -rf "$TEMP_DIR"
}

# Set trap to cleanup on exit
trap cleanup EXIT

# Create directories
mkdir -p "$(dirname "$RESTORE_LOG")"
mkdir -p "$TEMP_DIR"

# Check if backup file was provided
if [ -z "$1" ]; then
    echo "Usage: $0 <backup-file>"
    echo ""
    echo "Examples:"
    echo "  $0 /var/backups/eduhub/database/eduhub_full_20260619_120000.sql.gz.enc"
    echo "  $0 s3://my-bucket/backups/database/eduhub_full_20260619_120000.sql.gz.enc"
    echo ""
    echo "Available local backups:"
    ls -lh "$BACKUP_DIR"/eduhub_*.sql.gz.enc 2>/dev/null || echo "  No backups found"
    exit 1
fi

BACKUP_SOURCE="$1"

# Check if encryption key exists
if [ ! -f "$ENCRYPTION_KEY_FILE" ]; then
    log "ERROR: Encryption key not found at $ENCRYPTION_KEY_FILE"
    exit 1
fi

log "========================================="
log "Database Restore Process Started"
log "========================================="
log "Backup source: $BACKUP_SOURCE"
log "Target database: $DB_NAME@$DB_HOST:$DB_PORT"

# Download from S3 if necessary
if [[ "$BACKUP_SOURCE" == s3://* ]]; then
    log "Downloading backup from S3..."
    BACKUP_FILE="$TEMP_DIR/$(basename "$BACKUP_SOURCE")"

    aws s3 cp "$BACKUP_SOURCE" "$BACKUP_FILE"

    if [ $? -ne 0 ]; then
        log "ERROR: Failed to download backup from S3"
        exit 1
    fi

    log "Downloaded to: $BACKUP_FILE"
else
    BACKUP_FILE="$BACKUP_SOURCE"

    # Verify local backup file exists
    if [ ! -f "$BACKUP_FILE" ]; then
        log "ERROR: Backup file not found: $BACKUP_FILE"
        exit 1
    fi
fi

# Verify backup integrity
log "Verifying backup integrity..."
openssl enc -d -aes-256-cbc -pbkdf2 -pass file:"$ENCRYPTION_KEY_FILE" -in "$BACKUP_FILE" | \
    gzip -t > /dev/null 2>&1

if [ $? -ne 0 ]; then
    log "ERROR: Backup verification failed - file may be corrupted or encryption key is incorrect"
    exit 1
fi

log "Backup verification successful"

# Create pre-restore backup
log "Creating pre-restore backup of current database..."
PRE_RESTORE_BACKUP="$BACKUP_DIR/pre_restore_${TIMESTAMP}.sql.gz.enc"

export PGPASSWORD="$DB_PASSWORD"

pg_dump -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -Fc "$DB_NAME" | \
    gzip | \
    openssl enc -aes-256-cbc -salt -pbkdf2 -pass file:"$ENCRYPTION_KEY_FILE" \
    > "$PRE_RESTORE_BACKUP"

if [ $? -eq 0 ]; then
    PRE_BACKUP_SIZE=$(du -h "$PRE_RESTORE_BACKUP" | cut -f1)
    log "Pre-restore backup created: $PRE_RESTORE_BACKUP (Size: $PRE_BACKUP_SIZE)"
else
    log "WARNING: Failed to create pre-restore backup"
    read -p "Continue without pre-restore backup? (yes/no): " CONTINUE
    if [ "$CONTINUE" != "yes" ]; then
        log "Restore cancelled by user"
        exit 1
    fi
fi

# Ask for confirmation
log ""
log "WARNING: This will overwrite the current database: $DB_NAME"
log "A backup has been saved to: $PRE_RESTORE_BACKUP"
log ""
read -p "Are you sure you want to continue? (yes/no): " CONFIRM

if [ "$CONFIRM" != "yes" ]; then
    log "Restore cancelled by user"
    exit 1
fi

# Decrypt and decompress backup
log "Decrypting and decompressing backup..."
DECRYPTED_FILE="$TEMP_DIR/backup.sql"

openssl enc -d -aes-256-cbc -pbkdf2 -pass file:"$ENCRYPTION_KEY_FILE" -in "$BACKUP_FILE" | \
    gunzip > "$DECRYPTED_FILE"

if [ $? -ne 0 ]; then
    log "ERROR: Failed to decrypt/decompress backup"
    exit 1
fi

log "Backup prepared for restore"

# Terminate active connections to the database
log "Terminating active database connections..."
psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d postgres -c \
    "SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE datname = '$DB_NAME' AND pid <> pg_backend_pid();" \
    > /dev/null 2>&1

# Drop and recreate database
log "Dropping existing database..."
dropdb -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" "$DB_NAME" 2>/dev/null || true

log "Creating fresh database..."
createdb -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" "$DB_NAME"

if [ $? -ne 0 ]; then
    log "ERROR: Failed to create database"
    exit 1
fi

# Restore database
log "Restoring database from backup..."
pg_restore -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -v "$DECRYPTED_FILE" 2>&1 | tee -a "$RESTORE_LOG"

if [ $? -eq 0 ]; then
    log "Database restore successful!"
else
    log "ERROR: Database restore failed!"
    log "You can restore the pre-restore backup using:"
    log "  $0 $PRE_RESTORE_BACKUP"
    exit 1
fi

# Unset password
unset PGPASSWORD

# Verify restored database
log "Verifying restored database..."
RESTORE_TABLE_COUNT=$(psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -t -c \
    "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public';" 2>/dev/null | xargs)

if [ -n "$RESTORE_TABLE_COUNT" ] && [ "$RESTORE_TABLE_COUNT" -gt 0 ]; then
    log "Verification successful - $RESTORE_TABLE_COUNT tables found"
else
    log "WARNING: Database appears to be empty"
fi

log "========================================="
log "Database Restore Completed Successfully"
log "========================================="
log ""
log "Pre-restore backup saved at: $PRE_RESTORE_BACKUP"
log "This backup will be kept for 7 days for rollback purposes"
log ""

exit 0
