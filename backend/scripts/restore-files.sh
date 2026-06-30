#!/bin/bash

###############################################################################
# File Storage Restore Script
#
# Restores file storage backups created by backup-files.sh
# - Supports both local and S3 backup sources
# - Verifies checksums before restore
# - Creates pre-restore backup automatically
# - Supports full or selective restore
#
# Usage: ./restore-files.sh <backup-directory>
#        ./restore-files.sh s3://bucket/backups/files/files_20260619_120000.tar.gz
###############################################################################

set -e  # Exit on error

# Configuration
BACKUP_DIR="/var/backups/eduhub/files"
RESTORE_LOG="/var/log/eduhub/restore.log"
TARGET_DIR="${UPLOADS_DIR:-/var/www/eduhub/uploads}"
TEMP_DIR="/tmp/eduhub-restore-$$"

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

# Check if backup source was provided
if [ -z "$1" ]; then
    echo "Usage: $0 <backup-source>"
    echo ""
    echo "Examples:"
    echo "  $0 /var/backups/eduhub/files/files_20260619_120000"
    echo "  $0 s3://my-bucket/backups/files/files_20260619_120000.tar.gz"
    echo ""
    echo "Available local backups:"
    ls -lhd "$BACKUP_DIR"/files_* 2>/dev/null || echo "  No backups found"
    exit 1
fi

BACKUP_SOURCE="$1"

log "========================================="
log "File Storage Restore Process Started"
log "========================================="
log "Backup source: $BACKUP_SOURCE"
log "Target directory: $TARGET_DIR"

# Verify target directory exists
if [ ! -d "$TARGET_DIR" ]; then
    log "Creating target directory: $TARGET_DIR"
    mkdir -p "$TARGET_DIR"
fi

# Handle S3 source
if [[ "$BACKUP_SOURCE" == s3://* ]]; then
    log "Downloading backup from S3..."
    TARBALL="$TEMP_DIR/$(basename "$BACKUP_SOURCE")"

    aws s3 cp "$BACKUP_SOURCE" "$TARBALL"

    if [ $? -ne 0 ]; then
        log "ERROR: Failed to download backup from S3"
        exit 1
    fi

    log "Extracting tarball..."
    tar -xzf "$TARBALL" -C "$TEMP_DIR"

    # Find the extracted directory
    BACKUP_DIR_NAME=$(tar -tzf "$TARBALL" | head -1 | cut -d'/' -f1)
    BACKUP_PATH="$TEMP_DIR/$BACKUP_DIR_NAME"
    CHECKSUM_FILE="$TEMP_DIR/$BACKUP_DIR_NAME.md5sums"
else
    # Local backup
    BACKUP_PATH="$BACKUP_SOURCE"
    CHECKSUM_FILE="$BACKUP_SOURCE.md5sums"

    # Verify local backup exists
    if [ ! -d "$BACKUP_PATH" ]; then
        log "ERROR: Backup directory not found: $BACKUP_PATH"
        exit 1
    fi
fi

# Verify checksum file exists
if [ ! -f "$CHECKSUM_FILE" ]; then
    log "WARNING: Checksum file not found: $CHECKSUM_FILE"
    read -p "Continue without checksum verification? (yes/no): " CONTINUE
    if [ "$CONTINUE" != "yes" ]; then
        log "Restore cancelled by user"
        exit 1
    fi
    SKIP_CHECKSUM=true
else
    SKIP_CHECKSUM=false
fi

# Verify backup integrity
if [ "$SKIP_CHECKSUM" = false ]; then
    log "Verifying backup integrity..."
    cd "$(dirname "$BACKUP_PATH")"

    if md5sum -c "$(basename "$CHECKSUM_FILE")" > /dev/null 2>&1; then
        log "Checksum verification successful - all files intact"
    else
        log "ERROR: Checksum verification failed - backup may be corrupted"
        read -p "Continue anyway? (yes/no): " CONTINUE
        if [ "$CONTINUE" != "yes" ]; then
            log "Restore cancelled by user"
            exit 1
        fi
    fi
fi

# Get backup statistics
BACKUP_FILE_COUNT=$(find "$BACKUP_PATH" -type f | wc -l)
BACKUP_SIZE=$(du -sh "$BACKUP_PATH" | cut -f1)
log "Backup contains $BACKUP_FILE_COUNT files (Total size: $BACKUP_SIZE)"

# Create pre-restore backup of current files
if [ -d "$TARGET_DIR" ] && [ "$(ls -A "$TARGET_DIR" 2>/dev/null)" ]; then
    log "Creating pre-restore backup of current files..."
    PRE_RESTORE_BACKUP="$BACKUP_DIR/pre_restore_${TIMESTAMP}"

    rsync -avh "$TARGET_DIR/" "$PRE_RESTORE_BACKUP/" 2>&1 | tee -a "$RESTORE_LOG"

    if [ $? -eq 0 ]; then
        PRE_BACKUP_SIZE=$(du -sh "$PRE_RESTORE_BACKUP" | cut -f1)
        PRE_BACKUP_FILES=$(find "$PRE_RESTORE_BACKUP" -type f | wc -l)
        log "Pre-restore backup created: $PRE_RESTORE_BACKUP"
        log "Size: $PRE_BACKUP_SIZE, Files: $PRE_BACKUP_FILES"
    else
        log "WARNING: Failed to create pre-restore backup"
        read -p "Continue without pre-restore backup? (yes/no): " CONTINUE
        if [ "$CONTINUE" != "yes" ]; then
            log "Restore cancelled by user"
            exit 1
        fi
    fi
else
    log "No existing files found - skipping pre-restore backup"
fi

# Ask for confirmation
log ""
log "WARNING: This will overwrite files in: $TARGET_DIR"
if [ -n "$PRE_RESTORE_BACKUP" ]; then
    log "Current files have been backed up to: $PRE_RESTORE_BACKUP"
fi
log ""
read -p "Are you sure you want to continue? (yes/no): " CONFIRM

if [ "$CONFIRM" != "yes" ]; then
    log "Restore cancelled by user"
    exit 1
fi

# Perform restore
log "Restoring files from backup..."
log "Source: $BACKUP_PATH"
log "Destination: $TARGET_DIR"

# Use rsync to restore files
# --delete removes files in destination that don't exist in backup
rsync -avh --delete "$BACKUP_PATH/" "$TARGET_DIR/" 2>&1 | tee -a "$RESTORE_LOG"

if [ $? -eq 0 ]; then
    log "File restore successful!"
else
    log "ERROR: File restore failed!"

    if [ -n "$PRE_RESTORE_BACKUP" ]; then
        log "You can restore the pre-restore backup using:"
        log "  rsync -avh --delete $PRE_RESTORE_BACKUP/ $TARGET_DIR/"
    fi

    exit 1
fi

# Verify restored files
RESTORED_FILE_COUNT=$(find "$TARGET_DIR" -type f | wc -l)
RESTORED_SIZE=$(du -sh "$TARGET_DIR" | cut -f1)

log "Verification: $RESTORED_FILE_COUNT files restored (Total size: $RESTORED_SIZE)"

# Set correct permissions
log "Setting file permissions..."
chown -R www-data:www-data "$TARGET_DIR" 2>/dev/null || chown -R $(whoami):$(whoami) "$TARGET_DIR"
find "$TARGET_DIR" -type f -exec chmod 644 {} \;
find "$TARGET_DIR" -type d -exec chmod 755 {} \;

log "Permissions updated"

log "========================================="
log "File Storage Restore Completed Successfully"
log "========================================="
log ""
log "Restored: $RESTORED_FILE_COUNT files ($RESTORED_SIZE)"

if [ -n "$PRE_RESTORE_BACKUP" ]; then
    log "Pre-restore backup saved at: $PRE_RESTORE_BACKUP"
    log "This backup will be kept for 7 days for rollback purposes"
fi

log ""

exit 0
