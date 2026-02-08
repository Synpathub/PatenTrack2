# ADR 002: PostgreSQL Over MySQL

**Status:** Accepted

**Date:** 2024-02-07

## Context

The legacy system uses MySQL. We need to choose a relational database for the rebuild that can handle:
- Complex patent ownership hierarchies
- Full-text search across patent data
- JSONB data for flexible entity attributes
- Multi-tenancy with strong isolation guarantees
- Analytics queries with window functions

## Decision

Migrate to PostgreSQL 16 as the primary database.

## Consequences

**Positive:**
- **JSONB support:** Flexible schema for entity attributes, settings, metadata
- **Recursive CTEs:** Essential for title chain and ownership tree analysis
- **Row-Level Security:** Built-in multi-tenancy isolation at the database level
- **Full-text search:** Native tsvector/tsquery eliminates need for Elasticsearch for basic search
- **Window functions:** Advanced analytics for transaction analysis
- **Array types:** Store CPC codes, tags efficiently
- **Better standards compliance:** Closer to SQL standard than MySQL

**Negative:**
- Migration effort from existing MySQL databases
- Team needs to learn PostgreSQL-specific features
- Slightly more resource-intensive than MySQL (mitigated by proper indexing)
