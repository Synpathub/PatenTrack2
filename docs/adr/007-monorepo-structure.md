# ADR 007: Monorepo with pnpm + Turborepo

**Status:** Accepted

**Date:** 2024-02-07

## Context

The legacy system is spread across 7 repositories:
- Main application
- USPTO ingestion script
- EPO ingestion script
- Python processing service
- Admin panel
- Customer portal
- Share viewer

This causes:
- Version drift between components
- Duplicate code (utilities, types, constants)
- Complex deployments (coordinate 7 repos)
- Difficult to make cross-cutting changes

## Decision

Consolidate into a single monorepo using pnpm workspaces and Turborepo.

Structure:
```
packages/     - Shared libraries (core, db, api, workers)
apps/         - End-user applications (web-admin, web-customer, web-share)
```

## Consequences

**Positive:**
- **Atomic changes:** Single PR can update API contract + frontend + workers
- **Code sharing:** Common types, utilities, config shared via workspace packages
- **Simplified deployments:** Build all from single commit, single CI pipeline
- **Better refactoring:** Rename a type, update all usages in one go
- **Dependency management:** Single lockfile, no version drift
- **Turborepo caching:** Fast incremental builds, remote caching for CI

**Negative:**
- Larger repository checkout (mitigated by sparse checkout if needed)
- All developers need access to entire codebase (acceptable for small team)
- CI runs must be efficient (mitigated by Turborepo's smart caching)
- Git history spans all components (mitigated by good commit messages)

**Tooling:**
- **pnpm:** Fast, efficient, strict node_modules structure
- **Turborepo:** Intelligent task orchestration and caching
