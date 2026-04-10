# Database Schema Export

This directory contains the exported database schema.

## What's Here

- **schema.sql** - Complete database schema (auto-generated)
  - Includes all tables, indexes, constraints, and ENUMs
  - Excludes the `migrations` tracking table
  - Perfect for importing to dbdiagram.io

## How to Generate

After running migrations:

```bash
make schema
```

This exports the current database structure to `schema.sql`.

## Using with dbdiagram.io

### Option 1: Import SQL Directly

1. Go to https://dbdiagram.io
2. Create a new diagram
3. Click "Import" → "From PostgreSQL"
4. Paste the contents of `schema.sql`
5. Click "Import"

### Option 2: Convert to DBML

If direct SQL import doesn't work:

1. Use a converter: https://github.com/softwaretechnik-berlin/dbml-renderer
2. Or manually write DBML based on the SQL

## Should This Be Tracked in Git?

**Yes!** This file serves as documentation showing:
- Current state of the database schema
- What tables exist at any given commit
- Historical view of schema evolution

## When to Update

Run `make schema` after:
- Creating new migrations
- Before committing schema changes
- Before creating pull requests

This keeps the schema.sql in sync with your migrations.

---

**Note:** This file is generated from migrations, not the other way around. Always create migrations first, then export the schema.
