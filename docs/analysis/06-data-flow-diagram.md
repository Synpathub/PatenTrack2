# 06 - Data Flow Diagram

**System architecture and data flow visualizations**

---

## System Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                         USERS / CLIENTS                          │
└─────────────────────────────────────────────────────────────────┘
          │                    │                    │
          │ HTTP/HTTPS         │ HTTP/HTTPS         │ HTTP/HTTPS
          ▼                    ▼                    ▼
┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐
│   PT-App (3000)  │  │PT-Admin (3001)   │  │ PT-Share (3002)  │
│  React Frontend  │  │ React Frontend   │  │ React Frontend   │
│  - Dashboard     │  │ - User Mgmt      │  │ - Share Viewer   │
│  - Charts        │  │ - Customer Mgmt  │  │ - Read-only      │
│  - Family Trees  │  │ - Analytics      │  │                  │
└──────────────────┘  └──────────────────┘  └──────────────────┘
          │                    │                    │
          │ REST API           │ REST API           │ REST API
          │ JWT Auth           │ JWT Auth           │ UUID Auth
          └────────────────────┴────────────────────┘
                               │
                               ▼
              ┌─────────────────────────────────┐
              │      PT-API (4200)              │
              │   Express.js + Socket.IO        │
              │                                 │
              │  ┌────────────────────────┐    │
              │  │   Route Handlers       │    │
              │  │  - /assets             │    │
              │  │  - /dashboards         │    │
              │  │  - /events             │    │
              │  │  - /family             │    │
              │  │  - /customers          │    │
              │  └────────────────────────┘    │
              │                                 │
              │  ┌────────────────────────┐    │
              │  │   Middleware           │    │
              │  │  - JWT verify          │    │
              │  │  - Tenant context      │    │
              │  │  - Error handler       │    │
              │  └────────────────────────┘    │
              │                                 │
              │  ┌────────────────────────┐    │
              │  │   Sequelize ORM        │    │
              │  │  - 58+ models          │    │
              │  │  - Multi-DB conn       │    │
              │  └────────────────────────┘    │
              └─────────────────────────────────┘
                               │
          ┌────────────────────┼────────────────────┐
          │                    │                    │
          ▼                    ▼                    ▼
┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐
│  business DB     │  │ application DB   │  │  [org_db_name]   │
│  - organisation  │  │ - assets         │  │ - activities     │
│  - users         │  │ - assignees      │  │ - companies      │
│  - share_links   │  │ - families       │  │ - documents      │
└──────────────────┘  │ - timelines      │  │ - comments       │
                      │ - dashboards     │  │ - collections    │
                      └──────────────────┘  └──────────────────┘
                               ▲
                               │
          ┌────────────────────┴────────────────────┐
          │                                         │
          ▼                                         ▼
┌──────────────────────────────┐      ┌──────────────────────────────┐
│  USPTO Data Processing       │      │  External Integrations       │
│                              │      │                              │
│  script_patent_...           │      │  - Google (Sheets, Drive)    │
│  - normalize_names.js        │      │  - Slack (Bot API)           │
│  - XML parsers               │      │  - Microsoft (Teams)         │
│  - Levenshtein matching      │      │  - AWS S3 (Documents)        │
│                              │      │  - EPO (European Patents)    │
│  uspto-data-sync             │      │                              │
│  - dashboard_with_company.php│      │                              │
│  - Stored procedures         │      │                              │
│  - Cron jobs (weekly)        │      │                              │
└──────────────────────────────┘      └──────────────────────────────┘
```

---

## Multi-Database Connection Flow

```javascript
// Dynamic tenant database connection

┌─────────────────────────────────────────────────────────────────┐
│ 1. API Request arrives                                           │
│    Headers: { 'x-auth-token': 'jwt...' }                        │
└─────────────────────────────────────────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────────┐
│ 2. JWT Middleware                                                │
│    - Decode token                                                │
│    - Extract: user_id, organisation_id                          │
│    - Attach to req object                                        │
└─────────────────────────────────────────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────────┐
│ 3. Query business.organisation                                   │
│    SELECT database_name, db_host, db_user, db_password          │
│    WHERE id = req.organisation_id                                │
│    Result: { database_name: 'org_acme_123' }                    │
└─────────────────────────────────────────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────────┐
│ 4. Get/Create Sequelize Connection                               │
│    - Check connection cache                                      │
│    - If not exists, create new Sequelize instance               │
│    - Store in cache with TTL (5 min idle timeout)              │
└─────────────────────────────────────────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────────┐
│ 5. Execute Query on Tenant Database                              │
│    SELECT * FROM companies WHERE active = 1                     │
│    // Executes on org_acme_123.companies table                  │
└─────────────────────────────────────────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────────┐
│ 6. Return Response to Client                                     │
│    { status: 200, data: [...] }                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## Patent Data Ingestion Pipeline

```
USPTO Weekly Release
         │
         ▼
┌─────────────────────┐
│ 1. Download XML     │
│    - Patent grants  │
│    - Applications   │
│    - ~10GB/week     │
└─────────────────────┘
         │
         ▼
┌─────────────────────┐
│ 2. XML Parsing      │
│    old_xml.js /     │
│    new_xml_parser.js│
│    - Extract biblio │
│    - Parse claims   │
│    - Extract figs   │
└─────────────────────┘
         │
         ▼
┌─────────────────────┐
│ 3. Name Norm        │
│    normalize_names  │
│    - 6 permutations │
│    - Levenshtein<5  │
│    - Entity match   │
└─────────────────────┘
         │
         ▼
┌─────────────────────┐
│ 4. DB Insert        │
│    INSERT INTO      │
│    application.     │
│    - assets         │
│    - assignees      │
│    - inventors      │
│    - families       │
└─────────────────────┘
         │
         ▼
┌─────────────────────┐
│ 5. Dashboard Update │
│    PHP stored procs │
│    - Aggregate stats│
│    - Family trees   │
│    - Transactions   │
└─────────────────────┘
```

---

## Dashboard Generation Workflow

```
Customer Login
      │
      ▼
┌──────────────────────────────────────────┐
│ GET /dashboards                           │
└──────────────────────────────────────────┘
      │
      ▼
┌──────────────────────────────────────────┐
│ Query: organisation_id from JWT          │
└──────────────────────────────────────────┘
      │
      ▼
┌──────────────────────────────────────────┐
│ Call PHP Script (via exec or API)       │
│ create_data_for_company_db_application   │
│   .php --org_id=123                      │
└──────────────────────────────────────────┘
      │
      ▼
┌──────────────────────────────────────────┐
│ Execute 10+ Stored Procedures            │
│ 1. sp_get_latest_transaction             │
│ 2. sp_bank_security_interests            │
│ 3. sp_family_tree                        │
│ 4. sp_transaction_categorization         │
│ 5. sp_calculate_expirations              │
│ 6. sp_aggregate_assignees                │
│ 7. sp_dashboard_metrics                  │
│ 8. sp_technology_keywords                │
│ 9. sp_inventor_rankings                  │
│ 10. sp_filing_trends                     │
└──────────────────────────────────────────┘
      │
      ▼
┌──────────────────────────────────────────┐
│ Update Dashboards Table                  │
│ INSERT INTO org_db.dashboards            │
│ - portfolio_value                        │
│ - active_patents                         │
│ - expiring_soon                          │
│ - technology_breakdown                   │
│ - filing_trends                          │
└──────────────────────────────────────────┘
      │
      ▼
┌──────────────────────────────────────────┐
│ Return Dashboard Data to Frontend        │
│ { metrics: {...}, charts: {...} }       │
└──────────────────────────────────────────┘
```

---

## Real-Time Socket.IO Flow

```
Client (PT-App)                 Server (PT-API)
      │                               │
      │──── Connect via WebSocket ───▶│
      │     /patentrack-socket        │
      │                               │
      │◀──── connection event ────────│
      │                               │
      │                               │
      │                          ┌────┴────┐
      │                          │ Background│
      │                          │ Job:      │
      │                          │ Update    │
      │                          │ patent    │
      │                          └────┬────┘
      │                               │
      │◀──── emit('patent-updated')──│
      │      { patent_id: 123 }      │
      │                               │
      │──── Fetch updated data ──────▶│
      │     GET /assets/123           │
      │                               │
      │◀──── Return updated patent ───│
      │                               │
```

**Note:** Legacy uses server→client push only. No client→server events.

---

## External Integration Data Flows

### Google Sheets Integration
```
PT-App                   PT-API                  Google Sheets API
   │                        │                           │
   │─ Export to Sheets ────▶│                           │
   │                        │─ Create spreadsheet ─────▶│
   │                        │                           │
   │                        │◀─ Spreadsheet created ────│
   │                        │   { id, url }             │
   │                        │                           │
   │                        │─ Batch update cells ─────▶│
   │                        │   [patent data rows]      │
   │                        │                           │
   │◀─ Return sheet URL ────│◀─ Update complete ────────│
```

### Slack Integration
```
PT-App                   PT-API                  Slack Web API
   │                        │                           │
   │─ Send notification ───▶│                           │
   │                        │─ Get channel ID ─────────▶│
   │                        │   (workspace scope)       │
   │                        │                           │
   │                        │◀─ Channel found ──────────│
   │                        │   { id: 'C01234' }        │
   │                        │                           │
   │                        │─ Post message ───────────▶│
   │                        │   { channel, text }       │
   │                        │                           │
   │◀─ Success ─────────────│◀─ Message posted ─────────│
```

### AWS S3 Document Storage
```
PT-App                   PT-API                  AWS S3
   │                        │                           │
   │─ Upload document ─────▶│                           │
   │   (multipart/form)     │                           │
   │                        │─ Generate presigned URL ──▶│
   │                        │                           │
   │                        │◀─ Presigned URL ──────────│
   │                        │   { url, key }            │
   │                        │                           │
   │                        │─ PUT document ───────────▶│
   │                        │   (binary data)           │
   │                        │                           │
   │                        │◀─ Upload complete ────────│
   │                        │                           │
   │                        │─ Save metadata ───────────▶│
   │                        │   INSERT INTO documents   │
   │                        │                           │
   │◀─ Success ─────────────│                           │
```

---

## Next Steps

Proceed to [07-migration-gap-analysis.md](./07-migration-gap-analysis.md)
