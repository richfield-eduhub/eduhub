-- Runs once when the Docker container is first created.
-- The database and user are already created via POSTGRES_DB / POSTGRES_USER env vars.
-- Add any PostgreSQL extensions you need here.

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
