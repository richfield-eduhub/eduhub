#!/bin/bash

###############################################################################
# File Storage Backup Script
#
# Performs automated backup of uploaded files using rsync
# - Daily backups with incremental synchronization
# - 30-day retention policy
# - File integrity verification
# - Optional S3 upload
#
# Usage: ./backup-files.sh
###############################################################################

set -e  # Exit on error

# Configuration
BACKUP_DIR="/var/backups/eduhub/files"
BACKUP_LOG="/var/log/eduhub/backup.log"
SOURCE_DIR="${UPLOADS_DIR:-/var/www/eduhub/uploads}"
MAX_BACKUPS=30

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

# Verify source directory exists
if [ ! -d "$SOURCE_DIR" ]; then
    log "ERROR: Source directory does not exist: $SOURCE_DIR"
    exit 1
fi

# Backup directory name
BACKUP_NAME="files_${TIMESTAMP}"
BACKUP_PATH="$BACKUP_DIR/$BACKUP_NAME"

log "Starting file storage backup..."
log "Source: $SOURCE_DIR"
log "Destination: $BACKUP_PATH"

# Create backup using rsync
# -a: archive mode (preserves permissions, timestamps, etc.)
# -v: verbose
# -h: human-readable sizes
# --delete: delete files in destination that don't exist in source
# --link-dest: hard link to previous backup for space efficiency
LATEST_BACKUP=$(ls -dt "$BACKUP_DIR"/files_* 2>/dev/null | head -1)

if [ -n "$LATEST_BACKUP" ]; then
    log "Performing incremental backup (linking to: $LATEST_BACKUP)"
    rsync -avh --delete --link-dest="$LATEST_BACKUP" "$SOURCE_DIR/" "$BACKUP_PATH/" 2>&1 | tee -a "$BACKUP_LOG"
else
    log "Performing full backup (no previous backup found)"
    rsync -avh "$SOURCE_DIR/" "$BACKUP_PATH/" 2>&1 | tee -a "$BACKUP_LOG"
fi

# Check if backup was successful
if [ $? -eq 0 ]; then
    BACKUP_SIZE=$(du -sh "$BACKUP_PATH" | cut -f1)
    FILE_COUNT=$(find "$BACKUP_PATH" -type f | wc -l)
    log "Backup successful: $BACKUP_PATH"
    log "Size: $BACKUP_SIZE, Files: $FILE_COUNT"
else
    log "ERROR: Backup failed!"
    exit 1
fi

# Create checksum file for integrity verification
log "Creating checksums for verification..."
find "$BACKUP_PATH" -type f -exec md5sum {} \; > "$BACKUP_PATH.md5sums"
log "Checksums created: $BACKUP_PATH.md5sums"

# Create tarball for S3 upload (if configured)
if [ -n "$S3_BUCKET" ]; then
    log "Creating tarball for S3 upload..."
    TARBALL="$BACKUP_DIR/$BACKUP_NAME.tar.gz"
    tar -czf "$TARBALL" -C "$BACKUP_DIR" "$BACKUP_NAME" "$BACKUP_NAME.md5sums"

    if [ $? -eq 0 ]; then
        TARBALL_SIZE=$(du -h "$TARBALL" | cut -f1)
        log "Tarball created: $TARBALL (Size: $TARBALL_SIZE)"

        # Upload to S3
        log "Uploading backup to S3: s3://$S3_BUCKET/backups/files/"
        aws s3 cp "$TARBALL" "s3://$S3_BUCKET/backups/files/" --region "$S3_REGION"

        if [ $? -eq 0 ]; then
            log "S3 upload successful"
            # Remove local tarball after successful upload
            rm -f "$TARBALL"
            log "Local tarball removed (available in S3)"
        else
            log "WARNING: S3 upload failed (backup still available locally)"
        fi
    else
        log "ERROR: Failed to create tarball"
    fi
fi

# Cleanup old backups
log "Cleaning up old backups..."

# Keep only last 30 backups
BACKUPS_TO_DELETE=$(ls -dt "$BACKUP_DIR"/files_* 2>/dev/null | tail -n +$((MAX_BACKUPS + 1)))

if [ -n "$BACKUPS_TO_DELETE" ]; then
    echo "$BACKUPS_TO_DELETE" | while read backup; do
        rm -rf "$backup"
        rm -f "$backup.md5sums"
        log "Deleted old backup: $backup"
    done
    log "Removed backups older than $MAX_BACKUPS days"
else
    log "No old backups to remove"
fi

# Cleanup S3 old backups (if configured)
if [ -n "$S3_BUCKET" ]; then
    log "Cleaning up old S3 backups..."

    # Delete backups older than 30 days from S3
    CUTOFF_DATE=$(date -d "30 days ago" +%Y%m%d 2>/dev/null || date -v-30d +%Y%m%d)

    aws s3 ls "s3://$S3_BUCKET/backups/files/" --region "$S3_REGION" | \
        grep "files_" | \
        awk '{print $4}' | \
        while read filename; do
            # Extract date from filename (format: files_YYYYMMDD_HHMMSS.tar.gz)
            FILE_DATE=$(echo "$filename" | grep -oE '[0-9]{8}' | head -1)

            if [ -n "$FILE_DATE" ] && [ "$FILE_DATE" -lt "$CUTOFF_DATE" ]; then
                aws s3 rm "s3://$S3_BUCKET/backups/files/$filename" --region "$S3_REGION"
                log "Deleted old S3 backup: $filename"
            fi
        done
fi

# Verify backup integrity
log "Verifying backup integrity..."
cd "$BACKUP_DIR"

if md5sum -c "$BACKUP_NAME.md5sums" > /dev/null 2>&1; then
    log "Backup verification successful - all checksums match"
else
    log "WARNING: Some checksums do not match - backup may be corrupted"
    exit 1
fi

log "File backup process completed successfully"
exit 0
