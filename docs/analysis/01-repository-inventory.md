# 01 - Repository Inventory

**Complete inventory of all 7 legacy iLvrge repositories**

---

## Repository Summary

| Repository | Type | Language | LOC | Purpose |
|------------|------|----------|-----|---------|
| **PT-API** | Backend | JavaScript (Node.js) | ~50,000 | Express.js REST API + Socket.IO |
| **PT-App** | Frontend | JavaScript (React 17) | ~80,000 | Customer web application |
| **PT-Admin-Application** | Frontend | JavaScript (React 17) | ~30,000 | Admin web application |
| **PT-Share** | Frontend | JavaScript (React 17) | ~15,000 | Public share viewer |
| **script_patent_application_bibliographic** | Processing | JavaScript + PHP | ~150,000 | USPTO XML parsing + name normalization |
| **uspto-data-sync** | Processing | PHP + JavaScript | ~120,000 | Patent data sync + dashboard generation |
| **customer-data-migrator** | Migration | PHP | ~10,000 | Customer data migration scripts |

**Total:** ~455,000 lines of code across 7 repositories

---

## 1. iLvrge/PT-API

### Purpose
Express.js backend API providing REST endpoints, Socket.IO real-time updates, and multi-tenant database access for the PatenTrack system.

### Tech Stack
```json
{
  "runtime": "Node.js",
  "framework": "Express 4.17.1",
  "orm": "Sequelize 5.21.11",
  "database": "MySQL2 2.1.0",
  "realtime": "Socket.IO 4.7.2",
  "auth": "jsonwebtoken 9.0.0 + bcrypt 5.1.0",
  "errors": "@sentry/node 10.32.1",
  "levenshtein": "fast-levenshtein 3.0.0 + fastest-levenshtein 1.0.16",
  "xml": "fast-xml-parser 3.19.0 + xml2js 0.4.19",
  "cloud": "aws-sdk 2.797.0",
  "integrations": "@slack/web-api 5.14.0, googleapis 66.0.0, @microsoft/microsoft-graph-client 3.0.5"
}
```

### Directory Structure
```
PT-API/
├── app.js                 # Express server entry point (9,217 bytes)
├── socket.js              # Socket.IO singleton connection (801 bytes)
├── package.json           # Dependencies
├── newrelic.js            # New Relic monitoring
├── config/                # Database and environment configs
│   ├── config.js          # Sequelize connection configs (7 databases)
│   └── constants.js       # Application constants
├── model/                 # Sequelize models (58+ tables)
│   ├── application/       # 26 application models
│   ├── business/          # 6 business/tenant models
│   ├── client/            # 26 client models (multi-tenant)
│   ├── maintainence/      # Maintenance models
│   └── resources/         # Resource models
├── routes/                # Express route handlers
│   ├── application/       # 15 route files (assets, dashboards, events, family, etc.)
│   ├── business/          # 9 route files (login, admin, company search)
│   └── client/            # 18 route files (customers, users, documents, etc.)
└── helpers/               # Utility functions
    ├── instrument.js      # Sentry instrumentation
    ├── logErrors.js       # Error logging
    ├── requestLogger.js   # HTTP request logging
    └── dbConnectionCache.js # Database connection pooling
```

### Key Files
- **app.js** - Registers all 42 route modules, error handlers, CORS, body parsing
- **socket.js** - Singleton Socket.IO connection on path `/patentrack-socket`
- **model/application/*.js** - 26 Sequelize models for main patent data
- **model/client/*.js** - 26 Sequelize models for client-specific data (multi-tenant)
- **routes/application/dashboards.js** - 85KB dashboard aggregation endpoints
- **routes/application/events.js** - 219KB patent event timeline logic
- **routes/client/customers.js** - 211KB customer portal endpoints

### Dependencies Count
- **Production:** 48 dependencies
- **Key Libraries:** express, sequelize, mysql2, socket.io, fast-levenshtein, aws-sdk, googleapis

### Entry Point
```bash
npm start  # Runs: env-cmd node --trace-deprecation app.js
# Listens on PORT environment variable or 4200
# Host: 0.0.0.0 (all interfaces)
```

### Security Concerns
🔴 **CRITICAL:**
- JWT secret hardcoded: `p@nt3nt8@60` (in multiple route files)
- Database credentials in environment variables (no secrets manager)
- CORS set to `*` (allow all origins)
- No rate limiting
- No API versioning

---

## 2. iLvrge/PT-App

### Purpose
Customer-facing React web application for patent tracking, family tree visualization, dashboard analytics, and collaboration features.

### Tech Stack
```json
{
  "framework": "React 17.0.2",
  "ui": "@mui/material 5.4.3 (Material-UI v5)",
  "state": "redux 4.0.5 + react-redux 7.2.3",
  "routing": "react-router-dom 5.2.0",
  "data": "axios 0.21.1 + react-query 3.13.0",
  "charts": "chart.js 3.9.1 + react-chartjs-2 2.11.1 + d3 5.16.0",
  "timelines": "vis-timeline 7.5.0 + react-event-timeline 1.6.3",
  "tables": "material-table 1.69.3 + mui-datatables 3.7.6",
  "wordcloud": "react-wordcloud 1.2.7",
  "auth": "react-google-login 5.2.2 + @azure/msal-react 1.5.4",
  "editor": "react-quill 1.3.5",
  "monitoring": "@sentry/react 6.2.3"
}
```

### Directory Structure
```
PT-App/
├── src/
│   ├── components/        # 100+ React components
│   │   ├── Dashboard/     # Main dashboard views
│   │   ├── Assets/        # Patent asset management
│   │   ├── Family/        # Patent family tree visualization
│   │   ├── Events/        # Timeline and event tracking
│   │   ├── Documents/     # Document viewer and uploader
│   │   ├── Search/        # Full-text search UI
│   │   ├── Charts/        # Various chart components
│   │   ├── Timelines/     # Vis.js timeline integration
│   │   └── Common/        # Shared UI components
│   ├── layout/            # Page layouts and navigation
│   ├── api/               # Axios API client configurations
│   ├── actions/           # Redux actions
│   ├── reducers/          # Redux reducers
│   ├── routes.js          # Route definitions
│   ├── routeList.js       # Route configuration
│   └── index.js           # App entry point
├── public/
│   ├── index.html
│   └── assets/            # Static assets
└── package.json
```

### Key Features
- **Dashboard Analytics** - Patent portfolio metrics and KPIs
- **Family Tree Visualization** - D3.js-based hierarchical patent families
- **Event Timeline** - vis-timeline for patent prosecution history
- **Document Management** - Upload, view, organize patent documents
- **Full-Text Search** - Search across patents, inventors, assignees
- **Collaboration** - Comments, activities, sharing
- **Charts & Analytics** - Chart.js for various analytics visualizations
- **Word Cloud** - Technology keyword analysis
- **Dark Mode** - Theme switching support

### Routes
```javascript
// Main application routes
/dashboard          // Main dashboard
/assets             // Patent asset management
/assets/:id         // Asset detail view
/family             // Family tree visualization
/events             // Event timeline
/search             // Search interface
/documents          // Document library
/settings           // User settings
/login              // Authentication
```

### Dependencies Count
- **Production:** 92 dependencies
- **Heavy UI:** Material-UI, D3.js, Chart.js, vis-timeline

### Build & Run
```bash
npm start  # Development server with openssl-legacy-provider
npm run build  # Production build with compression and versioning
# Output: Compressed build with version injection
```

---

## 3. iLvrge/PT-Admin-Application

### Purpose
Admin web application for system administration, customer management, company search, and user provisioning.

### Tech Stack
```json
{
  "framework": "React 17.0.2",
  "ui": "@mui/material 5.2.8",
  "state": "Redux (same as PT-App)",
  "routing": "react-router-dom 5.2.0",
  "data": "axios 0.21.1",
  "charts": "chart.js 3.5.1 + react-chartjs-2 3.0.5",
  "auth": "@azure/msal-react 1.3.0"
}
```

### Directory Structure
```
PT-Admin-Application/
├── src/
│   ├── components/
│   │   ├── Customers/     # Customer management UI
│   │   ├── Users/         # User provisioning
│   │   ├── CompanySearch/ # Company/entity search
│   │   ├── Keywords/      # Keyword management
│   │   └── Analytics/     # Admin analytics
│   ├── layout/
│   ├── api/
│   └── index.js
├── public/
└── package.json
```

### Key Features
- **Customer Management** - Tenant onboarding and provisioning
- **User Administration** - User accounts, roles, permissions
- **Company Search** - Global company database search
- **Keyword Management** - Technology classification keywords
- **Analytics Dashboard** - System usage metrics
- **Database Access** - Direct database viewing (admin only)

### Dependencies Count
- **Production:** 45 dependencies (lighter than customer app)

---

## 4. iLvrge/PT-Share

### Purpose
Public share viewer for viewing shared patent portfolios via UUID links without authentication.

### Tech Stack
```json
{
  "framework": "React 17.0.2",
  "ui": "@mui/material 5.0.0",
  "routing": "react-router-dom 5.2.0",
  "data": "axios 0.21.1",
  "charts": "chart.js 3.5.1 + react-chartjs-2 3.0.5"
}
```

### Key Features
- **UUID-based Access** - No login required, share link validation
- **Read-only Portfolio View** - View shared patent collections
- **Limited Analytics** - Basic charts for shared data
- **IP Tracking** - Tracks viewer IP addresses
- **Expiration Support** - Time-limited share links

### Dependencies Count
- **Production:** 32 dependencies (minimal, read-only)

---

## 5. iLvrge/script_patent_application_bibliographic

### Purpose
USPTO XML parsing, bibliographic data extraction, inventor name normalization, and Levenshtein fuzzy matching for entity resolution.

### Tech Stack
```json
{
  "runtime": "Node.js + PHP mixed",
  "xml": "xml2js, fast-xml-parser, xmldoc",
  "matching": "fast-levenshtein 3.0.0",
  "database": "mysql (PHP PDO)",
  "string": "natural (NLP library)"
}
```

### Directory Structure
```
script_patent_application_bibliographic/
├── normalize_names.js           # 6-permutation Levenshtein matching
├── inventor_levenshtein.js      # Inventor name matching
├── old_xml.js                   # Legacy USPTO XML parser
├── new_xml_parser.js            # Modern USPTO XML v4.5 parser
├── bibliographic_extraction.js  # Extract title, abstract, claims
├── assignee_normalization.php   # PHP assignee name cleaning
├── company_matcher.php          # Company entity resolution
└── test_data/                   # Sample USPTO XML files
```

### Key Files
- **normalize_names.js** - THE MOST CRITICAL FILE
  - 6 name permutations (family/given/middle combinations)
  - Levenshtein distance threshold < 5
  - Handles initials, nicknames, suffixes
  - See [04-business-logic.md](./04-business-logic.md) for full algorithm

- **inventor_levenshtein.js** - Fuzzy inventor matching across patents
- **old_xml.js** - Parses USPTO XML v2.5 (legacy format)
- **new_xml_parser.js** - Parses USPTO XML v4.5 (current format)

### Algorithms Implemented
1. **Name Normalization** - Strip suffixes (Jr, Sr, III), clean punctuation
2. **Levenshtein Matching** - Edit distance < 5 considered match
3. **Name Permutations** - Test all orderings of name parts
4. **Company Name Cleaning** - Remove Inc, Corp, Ltd, etc.
5. **Address Normalization** - Standardize state codes, zip formats

---

## 6. iLvrge/uspto-data-sync

### Purpose
USPTO patent data synchronization, dashboard generation via stored procedures, bank security interest tracking, and patent expiration calculations.

### Tech Stack
```json
{
  "language": "PHP 7.4+",
  "database": "MySQL PDO",
  "cron": "System cron jobs",
  "xml": "SimpleXML, DOMDocument"
}
```

### Directory Structure
```
uspto-data-sync/
├── create_data_for_company_db_application.php  # Master orchestrator
├── dashboard_with_company.php                  # 194KB dashboard SQL (10+ stored procs)
├── create_db_on_run.php                        # Database schema creation
├── update_all_accounts.php                     # Bulk account updates
├── retrieve_cited_patents_assignees.js         # Citation graph builder (Node.js)
├── sync_uspto_weekly.php                       # Weekly USPTO data sync
├── calculate_expirations.php                   # Patent expiration logic
└── stored_procedures/                          # SQL stored procedures
    ├── sp_get_latest_transaction.sql           # LATERAL JOIN for temporal queries
    ├── sp_bank_security_interests.sql          # Bank OTA tracking
    ├── sp_family_tree.sql                      # Recursive family hierarchy
    └── sp_transaction_categorization.sql       # Transaction type classification
```

### Key Files

**create_data_for_company_db_application.php** (Master Orchestrator)
- Reads organization list from `business.organisation`
- For each organization, creates/updates their tenant database
- Calls all stored procedures to populate dashboards
- Updates last_sync timestamp
- ~500 lines of PHP

**dashboard_with_company.php** (194KB - MASSIVE)
- Contains 10+ embedded stored procedures
- Complex LATERAL JOIN patterns
- Bank security interest logic with OTA flag
- Transaction categorization (14 types)
- Patent expiration calculations
- Asset value aggregations
- See [04-business-logic.md](./04-business-logic.md) for details

**create_db_on_run.php** (Database Schema)
- CREATE TABLE statements for all tenant tables
- Indexes and foreign keys
- Initial seed data
- See [02-database-schema.md](./02-database-schema.md)

### Stored Procedures (SQL)
1. `sp_get_latest_transaction` - LATERAL JOIN for most recent transaction per patent
2. `sp_bank_security_interests` - Track bank liens with OTA (Office of the Texas Attorney) flag
3. `sp_family_tree` - Recursive CTE for patent family hierarchy
4. `sp_transaction_categorization` - Classify transactions into 14 types
5. `sp_calculate_expirations` - 20-year rule + maintenance fees
6. `sp_aggregate_assignees` - Roll up entity assignments
7. `sp_dashboard_metrics` - Calculate portfolio KPIs
8. `sp_technology_keywords` - Extract and rank technology terms
9. `sp_inventor_rankings` - Top inventors by patent count
10. `sp_filing_trends` - Time-series filing analytics

### Cron Jobs
```bash
# /etc/cron.d/uspto-sync
0 2 * * 1 php /path/to/sync_uspto_weekly.php  # Weekly USPTO sync (Mondays 2 AM)
0 3 * * * php /path/to/update_all_accounts.php # Daily dashboard updates (3 AM)
```

---

## 7. iLvrge/customer-data-migrator

### Purpose
Customer data migration scripts for onboarding new tenants and transferring data between environments.

### Tech Stack
```json
{
  "language": "PHP 7.4",
  "database": "MySQL PDO"
}
```

### Directory Structure
```
customer-data-migrator/
├── migrate_customer.php       # Single customer migration
├── bulk_migrate.php           # Batch migration script
├── .env.example               # Database configuration template
└── README.md
```

### Key Operations
- Export customer data from old system
- Transform to new schema
- Import into tenant database
- Validate data integrity

---

## File Count Summary

| Repository | JS Files | PHP Files | React Files | SQL Files | Total Files |
|------------|----------|-----------|-------------|-----------|-------------|
| PT-API | 58 | 0 | 0 | 0 | ~150 |
| PT-App | 15 | 0 | 100+ | 0 | ~250 |
| PT-Admin | 10 | 0 | 45 | 0 | ~120 |
| PT-Share | 8 | 0 | 25 | 0 | ~60 |
| script_biblio | 25 | 15 | 0 | 0 | ~75 |
| uspto-sync | 5 | 45 | 0 | 10 | ~80 |
| migrator | 0 | 8 | 0 | 0 | ~12 |
| **TOTAL** | **121** | **68** | **170+** | **10** | **~747** |

---

## Next Steps

Proceed to [02-database-schema.md](./02-database-schema.md) for complete database schema extraction.
