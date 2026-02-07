# ADR 003: Row-Level Security for Multi-Tenancy

**Status:** Accepted

**Date:** 2024-02-07

## Context

PatenTrack serves multiple organizations (tenants) from a shared infrastructure. We need a strategy to ensure data isolation:
- Option 1: Separate database per tenant
- Option 2: Shared database with application-level filtering
- Option 3: Shared database with Row-Level Security (RLS)

## Decision

Use PostgreSQL Row-Level Security (RLS) with shared tables and `tenantId` column.

Implementation:
- All tenant-scoped tables include `tenantId` column
- RLS policies filter rows based on `app.current_tenant_id` session variable
- Application sets session variable after JWT verification
- Global tables (transaction types, data sources) have no RLS

## Consequences

**Positive:**
- **Strong isolation:** Database enforces tenant isolation, reducing risk of application bugs leaking data
- **Cost-effective:** Single database instance for all tenants
- **Simplified operations:** Single schema, single backup, single migration
- **Performance:** Proper indexing on `tenantId` makes queries efficient
- **Compliance:** Easier to prove data isolation to auditors

**Negative:**
- Schema changes affect all tenants simultaneously (mitigated by proper migration testing)
- Noisy neighbor risk (mitigated by connection pooling and query optimization)
- Cannot easily extract single tenant data (mitigated by backup tooling)
- RLS policies add complexity (mitigated by thorough testing)
