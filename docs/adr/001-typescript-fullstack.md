# ADR 001: Full-Stack TypeScript

**Status:** Accepted

**Date:** 2024-02-07

## Context

The PatenTrack platform is being rebuilt from a multi-repository Python/PHP codebase. We need to choose a primary programming language for the entire stack (backend, frontend, workers, tooling).

Key considerations:
- Developer productivity and code sharing
- Type safety across the entire stack
- Ecosystem maturity for B2B SaaS applications
- Team expertise and hiring pool

## Decision

We will use TypeScript for all application code across the entire stack:
- API server (Fastify)
- Background workers (ingestion, processing)
- Front-end applications (React)
- Shared libraries and utilities

## Consequences

**Positive:**
- Type safety reduces runtime errors and improves refactoring confidence
- Shared types between client and server prevent API contract mismatches
- Single language reduces context switching and cognitive load
- Excellent tooling (VS Code, ESLint, Prettier)
- Strong ecosystem for web applications
- Easier to hire full-stack developers

**Negative:**
- Compilation step adds complexity (mitigated by modern tooling)
- Some third-party libraries have poor or missing types
- TypeScript's type system has limitations compared to formal languages
