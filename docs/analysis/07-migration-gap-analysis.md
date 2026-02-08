# 07 - Migration Gap Analysis

**Comparison: Legacy iLvrge System vs PatenTrack2 Phase 0**

---

## Executive Summary

Current PatenTrack2 (Phase 0) implements **~15% of legacy functionality**.

| Category | Legacy | Phase 0 | Gap | Priority |
|----------|--------|---------|-----|----------|
| Database Tables | 58+ | 13 | **45 tables** | 🔴 HIGH |
| API Endpoints | 250+ | 5 | **245 endpoints** | 🔴 HIGH |
| Business Logic | 100% | 5% | **95%** | 🔴 CRITICAL |
| Frontend Components | 170+ | 7 | **163 components** | 🟡 MEDIUM |
| External Integrations | 5 | 0 | **5 integrations** | 🟢 LOW |

---

## 1. Database Schema Gaps

### Phase 0 Implemented (13 tables)
```typescript
// packages/db/src/schema/
✅ tenants.ts          - tenants, users
✅ entities.ts         - companies/organizations
✅ patents.ts          - patents, inventors, patentFamilies, citedPatents
✅ transactions.ts     - transaction history
✅ ownership.ts        - patent ownership
✅ legal.ts            - legal documents
✅ sharing.ts          - share links & permissions
✅ activity.ts         - audit logs
✅ tenant-data.ts      - tenant-specific data
✅ global.ts           - global reference data
✅ internal.ts         - internal metadata
✅ asset-channels.ts   - distribution channels
```

### Missing Tables (45+)

#### Application Database Tables
```sql
❌ assets_for_sale           -- Patents listed for sale/licensing
❌ assets_transfer            -- Asset transfer history
❌ assignments                -- USPTO assignment data
❌ assignors                  -- Assignment parties (sellers)
❌ assignees                  -- Assignment parties (buyers)
❌ assignor_and_assignee      -- Junction table
❌ assignment_conveyance      -- Assignment documents
❌ cited_patents_with_assignee  -- Citation graph with entities
❌ dashboards                 -- Pre-computed dashboard data
❌ document_ids               -- Patent document identifiers
❌ errors                     -- Patent processing errors
❌ layouts                    -- UI layout configurations
❌ organisation_application   -- Org-to-patent mapping
❌ representatives            -- Patent attorneys/agents
❌ repository                 -- Document repository metadata
❌ share_link_details         -- Detailed share permissions
❌ share_lists                -- Shared patent collections
❌ templates                  -- Document templates
❌ timelines                  -- Patent prosecution timelines
❌ validity                   -- Patent validity status
❌ assets_parties_assignment  -- Complex assignment relationships
```

#### Client Database Tables (Multi-tenant)
```sql
❌ activities                 -- User activity log
❌ address                    -- Company addresses
❌ categories                 -- Product categories
❌ collections                -- Patent collections
❌ collection_companies       -- Collection membership
❌ comments                   -- Comments/annotations
❌ company_lawfirm            -- Company-lawfirm relationship
❌ documents                  -- Uploaded documents
❌ firms                      -- Law firms
❌ lawfirm                    -- Law firm details
❌ lawfirm_address            -- Law firm addresses
❌ products                   -- Product categories
❌ professionals              -- Patent professionals
❌ representatives            -- Attorney representatives
❌ roles                      -- User roles
❌ telephone                  -- Contact phone numbers
❌ types                      -- Classification types
❌ users                      -- Tenant users
```

#### Business Database Tables
```sql
❌ user_activity_selection    -- User activity preferences
❌ user_company_selection     -- User company filters
```

---

## 2. API Endpoint Gaps

### Phase 0 Implemented (5 endpoints)
```typescript
// packages/api/src/routes/
✅ GET  /health
✅ GET  /health/ready
✅ POST /api/v1/auth/signin
✅ POST /api/v1/auth/verify-code
✅ GET  /api/v1/profile
```

### Missing Endpoints (245+)

#### Application Routes (Missing ~120 endpoints)
```javascript
❌ GET    /assets                       // List all patent assets
❌ GET    /assets/:id                   // Get asset detail
❌ POST   /assets                       // Create asset
❌ PUT    /assets/:id                   // Update asset
❌ DELETE /assets/:id                   // Delete asset
❌ GET    /assets/:id/family            // Get patent family
❌ GET    /assets/:id/transactions      // Get transaction history
❌ GET    /assets/:id/documents         // Get related documents
❌ GET    /assets/:id/events            // Get prosecution events
❌ GET    /assets/:id/citations         // Get citations
❌ POST   /assets/bulk-import           // Bulk import patents

❌ GET    /dashboards                   // Get dashboard data
❌ GET    /dashboards/metrics           // Portfolio metrics
❌ GET    /dashboards/charts            // Chart data
❌ POST   /dashboards/refresh           // Force refresh

❌ GET    /events                       // List patent events
❌ GET    /events/:id                   // Event detail
❌ GET    /events/timeline              // Timeline view

❌ GET    /family/:id                   // Patent family tree
❌ GET    /family/:id/tree              // Hierarchical tree
❌ GET    /family/:id/members           // Family members

❌ GET    /search                       // Full-text search
❌ POST   /search/advanced              // Advanced search

❌ GET    /transactions                 // List transactions
❌ GET    /transactions/:id             // Transaction detail

❌ GET    /validity                     // Patent validity status
❌ POST   /validity/check               // Check validity
```

#### Business Routes (Missing ~60 endpoints)
```javascript
❌ POST   /admin/login                  // Admin authentication
❌ GET    /admin/customers              // List customers
❌ POST   /admin/customers              // Create customer
❌ PUT    /admin/customers/:id          // Update customer
❌ DELETE /admin/customers/:id          // Delete customer
❌ GET    /admin/customers/:id/database // Get DB credentials
❌ POST   /admin/customers/:id/provision // Provision tenant DB

❌ GET    /admin/company-search         // Global company search
❌ POST   /admin/company-search/match   // Entity matching

❌ GET    /admin/tree/:id               // Company tree

❌ GET    /admin/keywords               // Keyword management
❌ POST   /admin/keywords               // Add keyword
❌ PUT    /admin/keywords/:id           // Update keyword
❌ DELETE /admin/keywords/:id           // Delete keyword
```

#### Client Routes (Missing ~65 endpoints)
```javascript
❌ GET    /customers/activities         // Activity log
❌ POST   /customers/activities         // Log activity

❌ GET    /charts/filing-trends         // Filing trends chart
❌ GET    /charts/technology-breakdown  // Tech breakdown
❌ GET    /charts/assignee-rankings     // Top assignees

❌ GET    /collections                  // Patent collections
❌ POST   /collections                  // Create collection
❌ PUT    /collections/:id              // Update collection
❌ DELETE /collections/:id              // Delete collection
❌ POST   /collections/:id/assets       // Add to collection

❌ GET    /comments                     // Comments
❌ POST   /comments                     // Add comment
❌ PUT    /comments/:id                 // Update comment
❌ DELETE /comments/:id                 // Delete comment

❌ GET    /companies                    // Company management
❌ POST   /companies                    // Add company
❌ PUT    /companies/:id                // Update company
❌ DELETE /companies/:id                // Delete company

❌ GET    /documents                    // Document library
❌ POST   /documents                    // Upload document
❌ GET    /documents/:id                // Download document
❌ DELETE /documents/:id                // Delete document

❌ GET    /professionals                // Patent professionals
❌ POST   /professionals                // Add professional

❌ GET    /slacks/channels              // Slack channels
❌ POST   /slacks/post-message          // Post to Slack

❌ GET    /microsoft/teams              // MS Teams channels
❌ POST   /microsoft/post-message       // Post to Teams

❌ GET    /users                        // User management
❌ POST   /users                        // Create user
❌ PUT    /users/:id                    // Update user
❌ DELETE /users/:id                    // Delete user
```

---

## 3. Business Logic Gaps

### Implemented (5%)
```typescript
✅ Basic authentication (JWT)
✅ Tenant context management
✅ User profile retrieval
```

### Missing (95%)

#### Name Normalization & Matching (CRITICAL)
```
❌ 6-permutation Levenshtein algorithm
❌ Name suffix removal (Jr, Sr, III, PhD)
❌ Punctuation normalization
❌ Company name standardization
❌ Entity resolution across datasets
```

#### Dashboard Aggregation (CRITICAL)
```
❌ sp_get_latest_transaction (LATERAL JOIN)
❌ sp_bank_security_interests (OTA tracking)
❌ sp_family_tree (recursive CTE)
❌ sp_transaction_categorization (14 types)
❌ sp_calculate_expirations (20-year + fees)
❌ sp_aggregate_assignees
❌ sp_dashboard_metrics
❌ sp_technology_keywords
❌ sp_inventor_rankings
❌ sp_filing_trends
```

#### Patent Processing
```
❌ USPTO XML parsing (v2.5 + v4.5)
❌ Bibliographic data extraction
❌ Claims parsing
❌ Figure extraction
❌ Citation graph building
```

#### Analytics
```
❌ Technology classification
❌ Keyword extraction
❌ Trend analysis
❌ Portfolio valuation
❌ Risk scoring
```

---

## 4. Frontend Gaps

### PT-App Missing Features
```
❌ Dashboard with KPI cards
❌ Patent asset grid (material-table)
❌ Family tree visualization (D3.js)
❌ Event timeline (vis-timeline)
❌ Full-text search interface
❌ Document library with upload
❌ Charts (Chart.js integration)
❌ Word cloud (technology keywords)
❌ Comments/annotations
❌ Collections management
❌ Dark mode toggle
❌ Drag & drop components
❌ Rich text editor (Quill)
❌ Virtual scrolling (react-virtualized)
```

### PT-Admin Missing Features
```
❌ Customer management UI
❌ User provisioning interface
❌ Global company search
❌ Database viewer
❌ Keyword management
❌ Analytics dashboard
```

### PT-Share Missing Features
```
❌ Share link viewer
❌ Read-only portfolio view
❌ Public-facing analytics
❌ UUID validation
❌ IP tracking
```

---

## 5. External Integration Gaps

```
❌ Google Sheets API (export patents)
❌ Google Drive API (document storage)
❌ Slack Web API (notifications)
❌ Microsoft Teams API (notifications)
❌ AWS S3 (document storage)
```

---

## 6. Priority Matrix

### 🔴 CRITICAL (Week 1-2)
Must have for MVP functionality:

1. **Database Schema Completion**
   - Add missing 45 tables
   - Implement Drizzle models
   - Create indexes and foreign keys
   - Migrate Sequelize → Drizzle patterns

2. **Name Normalization Algorithm**
   - Port `normalize_names.js` to TypeScript
   - Implement 6-permutation matching
   - Add Levenshtein distance calculation
   - Unit tests with real USPTO data

3. **Bank Security Interest Tracking**
   - Implement LATERAL JOIN pattern in Drizzle
   - Port `sp_bank_security_interests` logic
   - OTA flag tracking

4. **Patent Expiration Calculations**
   - 20-year from filing date
   - Maintenance fee tracking (4/8/12 years)
   - Expiry warnings

### 🟡 HIGH (Week 3-6)
Needed for customer-facing features:

5. **Dashboard Generation**
   - Port 10 stored procedures to Drizzle queries
   - Implement aggregation logic
   - Caching strategy

6. **Family Tree Algorithms**
   - Recursive patent family relationships
   - Priority date tracking
   - Continuation/CIP/Divisional logic

7. **Transaction Categorization**
   - 14 transaction types
   - Business rule engine
   - Auto-categorization

8. **API Endpoints (50+)**
   - Assets CRUD
   - Dashboard endpoints
   - Search endpoints
   - Family tree endpoints

9. **Frontend Components (50+)**
   - Dashboard UI
   - Asset grid
   - Family tree viz (D3.js)
   - Charts (Chart.js)

### 🟢 MEDIUM (Week 7-10)
Nice-to-have features:

10. **USPTO XML Parsing**
    - XML v2.5 + v4.5 parsers
    - Bibliographic extraction
    - Background job processing

11. **Advanced Search**
    - Full-text search (Postgres FTS)
    - Faceted filters
    - Saved searches

12. **Collections & Comments**
    - Patent grouping
    - Collaboration features
    - Activity logging

13. **External Integrations**
    - Slack notifications
    - Microsoft Teams
    - Google Sheets export

### 🟤 LOW (Week 11-12)
Optional enhancements:

14. **Document Management**
    - AWS S3 integration
    - PDF viewer
    - Annotations

15. **Advanced Visualizations**
    - Word cloud
    - Network graphs
    - Interactive timelines

16. **Admin Features**
    - Customer provisioning
    - Database viewer
    - Keyword management

---

## 7. Technical Debt Comparison

| Issue | Legacy | Phase 0 | Status |
|-------|--------|---------|--------|
| Type Safety | ❌ None (vanilla JS) | ✅ TypeScript | **IMPROVED** |
| Database ORM | ⚠️ Sequelize v5 | ✅ Drizzle | **IMPROVED** |
| API Framework | ⚠️ Express | ✅ Fastify | **IMPROVED** |
| Testing | ❌ No tests | ⚠️ Minimal | **PARTIAL** |
| Documentation | ❌ Sparse | ✅ This analysis! | **IMPROVED** |
| Secrets Mgmt | ❌ Hardcoded | ⚠️ ENV vars | **PARTIAL** |
| Error Handling | ⚠️ Sentry only | ✅ Structured | **IMPROVED** |
| Rate Limiting | ❌ None | ✅ Fastify plugin | **ADDED** |
| API Versioning | ❌ None | ✅ /api/v1 | **ADDED** |
| Monitoring | ⚠️ New Relic | ❌ Not yet | **REGRESSION** |

---

## 8. Data Migration Requirements

### Phase 1: Schema Migration
```sql
-- Export from legacy MySQL
mysqldump -u root -p application > application.sql
mysqldump -u root -p business > business.sql
-- For each org_db:
mysqldump -u root -p org_acme_123 > org_acme_123.sql

-- Transform to Postgres-compatible SQL
-- Import into PatenTrack2 PostgreSQL
```

### Phase 2: Data Transformation
```typescript
// Sequelize → Drizzle model mapping
// Type coercion (MySQL→PostgreSQL)
// Normalize dates (MySQL DATETIME → Postgres TIMESTAMP)
// Handle NULL vs empty string differences
// UUID generation for missing IDs
```

### Phase 3: Validation
```typescript
// Row count verification
// Sample data spot checks
// Relationship integrity checks
// Full data diff (legacy vs Phase 1)
```

---

## Next Steps

Proceed to [08-implementation-roadmap.md](./08-implementation-roadmap.md)
