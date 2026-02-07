# ADR 006: BullMQ for Job Queuing

**Status:** Accepted

**Date:** 2024-02-07

## Context

PatenTrack requires background job processing for:
- Patent data ingestion from USPTO/EPO
- Entity normalization and deduplication
- Title chain analysis
- Ownership tree computation
- Scheduled data refreshes

Requirements:
- Reliable job execution with retries
- Progress tracking
- Job scheduling (cron-like)
- Priority queues
- Concurrency control

## Decision

Use BullMQ (successor to Bull) with Redis as the job queue system.

## Consequences

**Positive:**
- **Reliability:** Redis-backed persistence ensures jobs aren't lost
- **Retries:** Exponential backoff and configurable retry strategies
- **Progress tracking:** Jobs can report progress for long-running operations
- **Scheduling:** Cron expressions for recurring jobs
- **Priority queues:** High-priority jobs (user-requested) jump the queue
- **Rate limiting:** Prevents overwhelming external APIs
- **Dashboard:** Bull Board provides web UI for monitoring
- **TypeScript support:** Excellent types

**Negative:**
- Requires Redis (already needed for session storage, acceptable)
- Jobs must be serializable (no closures or functions)
- More complex than simple task runners
