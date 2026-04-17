#!/bin/sh
# Fix pgpass permissions for pgAdmin
if [ -f /pgpass ]; then
    cp /pgpass /tmp/pgpass
    chmod 600 /tmp/pgpass
    chown pgadmin:root /tmp/pgpass
fi

# Call the original entrypoint
exec /entrypoint.sh
