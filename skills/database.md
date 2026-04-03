# Database Skill — PostgreSQL Conventions

## Purpose
This skill defines database naming conventions, schema patterns, and query standards for all Agent Space projects.

## Naming Conventions
- **Tables:** snake_case, plural (`shipping_bills`, `cha_agents`, `users`)
- **Columns:** snake_case (`created_at`, `fob_value`, `exporter_name`)
- **Primary keys:** `id` (UUID or serial, depending on project)
- **Foreign keys:** `<referenced_table_singular>_id` (e.g., `user_id`, `port_id`)
- **Indexes:** `idx_<table>_<column>` (e.g., `idx_shipping_bills_sb_date`)
- **Constraints:** `<table>_<column>_<type>` (e.g., `users_email_unique`)

## Required Columns
Every table must include:
- `id` — primary key
- `created_at` — timestamp, default `NOW()`
- `updated_at` — timestamp, auto-updated on modification

## Soft Deletes
Use `deleted_at` (nullable timestamp) instead of hard deletes. Query with `WHERE deleted_at IS NULL` by default.

## Relationships
- Always define foreign key constraints.
- Use `ON DELETE CASCADE` only when child records have no meaning without the parent.
- Use `ON DELETE SET NULL` or `ON DELETE RESTRICT` when child records should survive.
- Document relationships in the schema file.

## Indexing Rules
- Index all foreign key columns.
- Index columns frequently used in WHERE clauses or ORDER BY.
- Use composite indexes for queries that filter on multiple columns together.
- Don't over-index — each index slows down writes.

## Migration Patterns
- One migration file per schema change.
- Migrations are forward-only in production — never edit a deployed migration.
- Name migrations descriptively: `001_create_users_table.sql`, `002_add_email_to_users.sql`

<!-- ==========================================================
     PROJECT-SPECIFIC SECTION: Fill this when starting a new project
     ========================================================== -->

## Project Schema

[FILL_PER_PROJECT — Document all tables using this format:]

### [table_name]

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK | Primary key |
| created_at | TIMESTAMP | NOT NULL, DEFAULT NOW() | Record creation time |
| updated_at | TIMESTAMP | NOT NULL | Last update time |

**Relationships:** [Describe foreign keys and relationships]
**Indexes:** [List indexes beyond the primary key]

<!-- ==========================================================
     END OF PROJECT-SPECIFIC SECTION
     ========================================================== -->
