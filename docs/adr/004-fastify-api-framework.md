# ADR 004: Fastify Over Express

**Status:** Accepted

**Date:** 2024-02-07

## Context

We need a Node.js HTTP framework for the API server. Options considered:
- Express (legacy choice, widely used)
- Fastify (modern, fast, schema-based)
- Koa (minimalist)
- Hapi (enterprise)

## Decision

Use Fastify as the API framework.

## Consequences

**Positive:**
- **Performance:** ~65% faster than Express in benchmarks
- **Schema validation:** Built-in JSON Schema validation for requests/responses
- **TypeScript support:** Excellent TypeScript types out of the box
- **Plugin architecture:** Clean, encapsulated plugin system
- **OpenAPI generation:** Automatic Swagger docs from schemas
- **Async/await:** Native async support, no callback hell
- **Low overhead:** Minimal abstraction over Node.js HTTP

**Negative:**
- Smaller ecosystem than Express (mitigated by adapter plugins)
- Less familiar to some developers (mitigated by excellent documentation)
- Requires learning Fastify patterns (mitigated by strong typing)
