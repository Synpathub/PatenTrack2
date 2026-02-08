# Legacy System Analysis - Quick Reference Guide

**For:** PatenTrack2 Migration Team  
**Date:** February 2025

---

## 📚 Document Navigation

Start here based on your role or task:

| If you need to... | Read this document | Key sections |
|-------------------|-------------------|--------------|
| **Understand the legacy system architecture** | [README.md](./README.md) | Executive Summary, Document Index |
| **Know what technologies were used** | [01-repository-inventory.md](./01-repository-inventory.md) | Tech Stack, Dependencies |
| **Implement database tables** | [02-database-schema.md](./02-database-schema.md) | Application Tables, Client Tables |
| **Implement API endpoints** | [03-api-surface.md](./03-api-surface.md) | Express Routes, Socket.IO Events |
| **Port business logic algorithms** | [04-business-logic.md](./04-business-logic.md) | ⭐ Levenshtein, Dashboard SQL |
| **Build React components** | [05-frontend-features.md](./05-frontend-features.md) | Component Hierarchy, Libraries |
| **Understand data flow** | [06-data-flow-diagram.md](./06-data-flow-diagram.md) | System Architecture, Pipelines |
| **See what's missing from Phase 0** | [07-migration-gap-analysis.md](./07-migration-gap-analysis.md) | ⭐ Gap Analysis Tables |
| **Plan your sprint** | [08-implementation-roadmap.md](./08-implementation-roadmap.md) | ⭐ Phased Timeline |

---

## 🔥 Most Critical Sections

### For Database Engineers
→ **[02-database-schema.md](./02-database-schema.md)**
- Lines 50-200: Application database tables
- Lines 400-600: Client database tables (multi-tenant)
- Lines 800-900: Foreign key relationships

### For Backend Engineers  
→ **[04-business-logic.md](./04-business-logic.md)**
- Lines 1-150: Name normalization algorithm (6-permutation Levenshtein)
- Lines 200-350: Dashboard SQL generation patterns
- Lines 400-500: Patent family tree algorithms
- Lines 600-700: Transaction categorization rules

### For Frontend Engineers
→ **[05-frontend-features.md](./05-frontend-features.md)**
- Lines 50-200: PT-App component hierarchy
- Lines 250-350: Material-UI patterns
- Lines 400-450: D3.js visualization usage

### For Project Managers
→ **[08-implementation-roadmap.md](./08-implementation-roadmap.md)**
- Lines 1-100: Overview and timeline
- Lines 150-300: Phase 1 (Database)
- Lines 400-600: Phase 2 (API)
- Lines 700-850: Risk assessment

---

## 📊 Key Statistics

```
Repositories Analyzed:     7
Database Tables:          58+
API Endpoints:           250+
React Components:        170+
Business Logic Files:     10+
Lines of Documentation: 5,679
Total Size:              216KB
```

---

## 🎯 Critical Business Logic Files

These contain the most complex algorithms to port:

1. **normalize_names.js** (50KB)
   - Location: script_patent_application_bibliographic/
   - Purpose: 6-permutation Levenshtein name matching
   - Document: [04-business-logic.md](./04-business-logic.md) lines 1-150

2. **dashboard_with_company.php** (220KB)
   - Location: uspto-data-sync/
   - Purpose: Dashboard SQL generation with 10+ stored procedures
   - Document: [04-business-logic.md](./04-business-logic.md) lines 200-350

3. **inventor_levenshtein.js**
   - Location: script_patent_application_bibliographic/
   - Purpose: Fuzzy inventor name matching
   - Document: [04-business-logic.md](./04-business-logic.md) lines 100-150

4. **update_flag.php**
   - Location: uspto-data-sync/
   - Purpose: Transaction type categorization (14 types)
   - Document: [04-business-logic.md](./04-business-logic.md) lines 400-500

5. **assets_family.js**
   - Location: script_patent_application_bibliographic/
   - Purpose: Patent family tree construction
   - Document: [04-business-logic.md](./04-business-logic.md) lines 500-600

---

## 🚨 Migration Priorities

### CRITICAL (Week 1-2)
- [ ] Database schema: assignments, assignees, assignors, timelines
- [ ] API: /api/assets, /api/transactions
- [ ] Business logic: Name normalization algorithm

### HIGH (Week 3-5)
- [ ] Database schema: dashboards, validity, share_link_details
- [ ] API: /api/dashboards, /api/family
- [ ] Business logic: Dashboard SQL generation

### MEDIUM (Week 6-8)
- [ ] Frontend: Dashboard visualization components
- [ ] API: /api/search, /api/events
- [ ] Business logic: Patent family trees

### LOW (Week 9-12)
- [ ] Frontend: Admin components
- [ ] API: Admin endpoints
- [ ] External integrations: Slack, Microsoft

---

## 🔍 Search Shortcuts

Use these search terms to find specific information:

| To find... | Search for... | In document |
|------------|---------------|-------------|
| Levenshtein algorithm | `Levenshtein` or `threshold < 5` | 04-business-logic.md |
| Database table definitions | `CREATE TABLE` or table name | 02-database-schema.md |
| API routes | `router.get` or `app.post` | 03-api-surface.md |
| Socket.IO events | `socket.on` or `io.emit` | 03-api-surface.md |
| React components | Component name | 05-frontend-features.md |
| Missing features | `Missing` or `❌` | 07-migration-gap-analysis.md |
| Migration tasks | `Phase` or week number | 08-implementation-roadmap.md |

---

## 📞 Need More Detail?

Each document contains:
- ✅ **Concrete code examples** (not pseudocode)
- ✅ **Actual SQL statements** (from legacy system)
- ✅ **Real API routes** (with HTTP methods)
- ✅ **Specific file paths** (for reference)
- ✅ **Cross-references** (between documents)

---

## 🔗 External Resources

Legacy repositories (read-only):
- https://github.com/iLvrge/PT-API
- https://github.com/iLvrge/PT-App
- https://github.com/iLvrge/PT-Admin-Application
- https://github.com/iLvrge/PT-Share
- https://github.com/iLvrge/script_patent_application_bibliographic
- https://github.com/iLvrge/uspto-data-sync
- https://github.com/iLvrge/customer-data-migrator

---

**Last Updated:** February 2025  
**Analysis Completed By:** PatenTrack Migration Team
