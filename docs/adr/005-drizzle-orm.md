# ADR 005: Drizzle ORM

**Status:** Accepted

**Date:** 2024-02-07

## Context

We need an ORM/query builder for TypeScript that can:
- Provide type-safe database queries
- Support PostgreSQL-specific features (JSONB, arrays, CTEs)
- Generate migrations
- Not sacrifice performance for convenience

Options considered:
- Prisma (popular, schema-first, limited PostgreSQL features)
- TypeORM (mature, heavy, complex)
- Drizzle (new, SQL-like, lightweight, PostgreSQL-focused)
- Kysely (query builder, no migration tooling)

## Decision

Use Drizzle ORM for database access.

## Consequences

**Positive:**
- **Type safety:** Full TypeScript inference from schema to queries
- **SQL-like syntax:** Easy to understand for developers who know SQL
- **PostgreSQL features:** Full support for JSONB, arrays, CTEs, window functions
- **Lightweight:** Minimal runtime overhead, compiles to near-raw SQL
- **Migration tooling:** drizzle-kit generates migrations from schema changes
- **Flexible:** Can drop down to raw SQL when needed
- **Performance:** No query generation overhead at runtime

**Negative:**
- Newer tool with smaller community than Prisma/TypeORM
- Documentation still growing (mitigated by active Discord community)
- Some features still in development (mitigated by raw SQL escape hatch)
