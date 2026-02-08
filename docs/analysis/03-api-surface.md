# 03 - API Surface

**All Express routes, Socket.IO events, authentication patterns, and external integrations**

---

## Overview

The PT-API provides **250+ RESTful endpoints** across three route categories:
- **Application Routes** (15 modules) - Patent data and analytics
- **Business Routes** (9 modules) - Authentication and admin operations
- **Client Routes** (18 modules) - Client-specific multi-tenant operations

---

## Authentication & Authorization

### JWT Authentication
```javascript
// Token structure
{
  user_id: number,
  organisation_id: number,
  org_type: string,  // 'customer' | 'admin'
  share_code: string | null,
  exp: timestamp
}

// Header: x-auth-token
// Secret: 'p@nt3nt8@60' (HARDCODED - SECURITY RISK)
// Expiry: 24 hours (configurable)
```

### Middleware Pattern
```javascript
// From routes/business/login.js
const jwt = require('jsonwebtoken');

function verifyToken(req, res, next) {
  const token = req.header('x-auth-token');
  if (!token) return res.status(401).json({ error: 'No token provided' });
  
  try {
    const decoded = jwt.verify(token, 'p@nt3nt8@60');
    req.user_id = decoded.user_id;
    req.organisation_id = decoded.organisation_id;
    next();
  } catch (err) {
    res.status(401).json({ error: 'Invalid token' });
  }
}
```

### Share Link Authorization
```javascript
// UUID-based public access
GET /share/:share_code/:section
// Validates:
// - Share code exists in ShareLinks table
// - Share not expired
// - IP tracking
// - Read-only access
```

---

## Socket.IO Events

### Connection
```javascript
// Path: /patentrack-socket
// Server-side only (no client subscriptions)

const io = require('socket.io')(server, {
  path: '/patentrack-socket'
});

io.on('connection', (socket) => {
  console.log('Socket connection established');
});
```

### Events Emitted (Server → Client)
```javascript
// Real-time updates
socket.emit('patent-updated', { patent_id, changes });
socket.emit('dashboard-refresh', { organisation_id });
socket.emit('notification', { user_id, message, type });
socket.emit('error', { message, code });
```

**Note:** Legacy system uses Socket.IO for server-push only. No client-to-server events.

---

## API ENDPOINTS - COMPLETE LISTING

### Application Routes

#### **Assets** (`/assets`)
- `GET /assets` - List all assets
- `POST /assets/categories_products` - Get assets by categories/products
- `POST /assets/cpc` - Get assets by CPC classification
- `POST /assets/cpc/:year/:cpcCode` - Get assets by year and CPC code
- `GET /assets/:patentNumber/files/:channelID/slack/:token` - Get Slack files
- `GET /assets/download/:itemID` - Download asset item
- `GET /assets/:asset` - Get single asset
- `GET /assets/:patentNumber/:type/outsource` - Get outsource data
- `POST /assets/move` - Move assets
- `DELETE /assets/rollback` - Rollback asset transfer
- `POST /assets/search` - Search assets
- `POST /assets/validate` - Validate assets
- `POST /assets/assets_for_sale` - Create/list assets for sale
- `POST /assets/external_assets/sheets` - Google Sheets external assets
- `POST /assets/external_assets/sheets/assets` - Sheets assets list
- `POST /assets/external_assets/sheets/timeline` - Sheets timeline
- `PUT /assets/external_assets` - Update external assets
- `PATCH /assets/external_assets` - Partial update external assets
- `DELETE /assets/external_assets` - Delete external assets
- `POST /assets/external_assets` - Create external assets

#### **Dashboards** (`/dashboards`)
- `GET /` - Get dashboard items
- `POST /collateral` - Collateral data
- `POST /parties/assignor` - Assignor parties
- `GET /parties/inventor/:inventorID` - Inventor details
- `POST /parties` - Parties data
- `POST /filed_assets_events` - Filed assets events
- `POST /timeline` - Timeline data
- `POST /count` - Count statistics
- `POST /example` - Example report
- `POST /` - Create dashboard
- `POST /temp` - Temp dashboard
- `POST /share` - Share dashboard
- `GET /check` - Check dashboard

#### **Entity** (`/entity`)
- `GET /search/:search_string/:type` - Entity search

#### **Errors** (`/errors`)
- `GET /errors` - List errors
- `GET /errors/filters` - Error filters
- `GET /errors/:type/:companyName` - Errors by type and company

#### **Events** (`/events`)
- `GET /events/tabs/:tabID` - Events by tab
- `GET /events/tabs/:tabID/companies/:companyID` - Events by company
- `GET /events/tabs/:tabID/companies/:companyID/customers/:customerID` - Events by customer
- `GET /events/tabs/:tabID/companies/:representativeID/customers/:customerID/transactions/:rfID` - Transaction events
- `POST /events/abandoned/maintainence/assets` - Abandoned maintenance assets
- `POST /events/abandoned/yearly/assets` - Yearly abandoned assets
- `POST /events/assets` - Asset events
- `GET /events/tabs` - All event tabs
- `GET /events/tabs/:tabID/companies/:companyID/customers/:customerID/transactions/:rfID/assets/:applicationNumber` - Asset transaction events
- `GET /events/all/assets/:category_type` - All assets by category
- `GET /events/all/assets/to_record/detail/:application` - Record detail
- `GET /events/:applicationNumber` - Events by application
- `GET /events/:applicationNumber/:patentNumber` - Events by patent
- `GET /events/assets/status/:applicationNumber` - Asset status
- `GET /events/assets/transactions/:rfID` - Asset transactions

#### **External API** (`/`)
- `GET /ptab/:asset` - PTAB data
- `GET /ptab/document/:identifier` - PTAB document
- `GET /citation/:asset` - Citation data
- `POST /citation` - Create citation
- `GET /generate_thumbnail` - Generate thumbnail

#### **Family** (`/family`)
- `GET /family/list/:grantNumber` - Family list
- `GET /family/epo/grant/:grantDocNumber` - EPO grant family
- `GET /family/:applicationNumber` - Family by application
- `GET /family/abstract/:applicationNumber` - Abstract
- `GET /family/claims/:applicationNumber` - Claims
- `GET /family/specifications/:applicationNumber` - Specifications
- `GET /family/images/:applicationNumber` - Images
- `GET /family/single/file/` - Single file
- `GET /family/single/:applicationNumber` - Single family

#### **Illustration** (`/`)
- `GET /connection/:reelFrame` - Connection by reel/frame
- `GET /connection/asset/:applicationNumber` - Connection by asset
- `GET /collections/:rf_id/illustration` - Collection illustration

#### **Search** (`/search`)
- `GET /:search_string` - Global search
- `GET /:search_string/:type` - Search by type

#### **Share** (`/share`)
- `POST /share` - Create share link
- `GET /share/illustration/:asset/:code` - Share illustration
- `GET /share/:code/:type` - Access shared data
- `GET /share/data/:asset/:code` - Share asset data
- `GET /share/timeline/list/:code` - Share timeline
- `GET /share/dashboard/list/:code` - Share dashboard
- `GET /share/illustrate/show/:code` - Share illustration view

#### **SVG Flag Icons** (`/events_icons`)
- `GET /` - Get flag icons

#### **Timelines** (`/timeline`)
- `GET /` - Get timelines
- `GET /item/:rfId` - Timeline item
- `GET /standalone/:groupId` - Standalone timeline
- `GET /standalone/filter/:groupId/:startDate/:endDate/:scroll` - Filtered standalone
- `GET /:groupId` - Timeline by group
- `GET /:organisation/:name/:depth/:groupId` - Org timeline
- `GET /filter/search/:groupId/:startDate/:endDate/:scroll` - Filtered search

#### **Transactions** (`/transactions`)
- `GET /transactions` - List transactions
- `GET /transactions/:transactionId` - Transaction details

#### **Updates** (`/updates`)
- `GET /updates/:companyName` - Company updates

#### **Validity** (`/validity`)
- `GET /validity_counter` - Validity counter

---

### Business Routes

#### **Admin Company Search** (`/company`)
- `GET /company/request` - Company requests
- `PUT /company/request` - Update request
- `GET /company/representative/search/:name` - Search representative
- `GET /company/account/search/:name` - Search account
- `GET /company/search/all/` - Search all companies
- `GET /lawfirm/:ID/search/address` - Lawfirm address
- `GET /company/:ID/search/address/:type` - Company address
- `GET /company/:ID/search/address_with_transactions/:type` - Address with transactions
- `PUT /company/:ID/search/address_with_transactions/:type` - Update address transactions
- `POST /lawfirm/:ID/search/address/all` - All lawfirm addresses
- `POST /company/:ID/search/address/all/:type` - All company addresses
- `GET /company/search/:search` - Search companies
- `GET /company/search/address/:address` - Search by address
- `GET /company/search/country/:name` - Search by country
- `PUT /company/search/all/` - Update all companies
- `GET /company/transactions/:id` - Company transactions
- `GET /company/transactions/:id/:representativeID` - Representative transactions
- `PUT /company/transactions/:customerID` - Update transactions
- `GET /company/lender` - Get lenders
- `GET /company/lenders/:id/companies` - Lender companies
- `GET /company/:companyID/law_firms` - Company law firms
- `GET /company/law_firms` - All law firms
- `GET /company/law_firms/:id/normalize_lawfirms` - Normalize law firms
- `GET /company/law_firms/:id/companies` - Law firm companies
- `GET /company/law_firms/:id` - Law firm details
- `PUT /company/law_firms` - Update law firms
- `GET /company/lawyers` - All lawyers
- `GET /company/lawyers/:id` - Lawyer details
- `PUT /company/lawyers` - Update lawyers
- `GET /company/raw/assignments/:id` - Raw assignments
- `PUT /company/raw/assignments/:id` - Update assignments
- `GET /company/assignments` - All assignments
- `GET /company/assignments/:id` - Assignment details
- `PUT /company/assignments` - Update assignments
- `PUT /company/:id/company_selection/` - Company selection
- `POST /company/report_dashboard:id/` - Report dashboard
- `GET /company/family/:id` - Company family
- `GET /company/family/:id/:representativeID` - Representative family
- `POST /company/:id/add_bulk_companies` - Bulk add companies
- `POST /company/cited/:id/export` - Export cited
- `GET /company/owned/cited/:id` - Owned cited
- `GET /company/cited/:id` - Cited patents
- `PUT /company/cited/:id` - Update cited
- `DELETE /company/cited/:id` - Delete cited
- `POST /company/cited/:id` - Create cited
- `GET /company/saved_logo/parties/all/:id` - Saved logo parties
- `GET /company/parties/all/:id` - All parties
- `GET /company/parties/:id` - Party details
- `PUT /company/assignees/query_name` - Update assignee query
- `PUT /company/assignees/logos` - Update logos
- `GET /all/transactions/:conveyanceType` - Transactions by type
- `GET /company/assets/:entityID` - Company assets
- `GET /company/recent_transactions` - Recent transactions
- `GET /company/report` - Company report
- `GET /company/:representativeID/event_maintainence` - Event maintenance
- `GET /company/:id/companies` - Sub-companies
- `GET /company/auth_token` - Auth token
- `GET /company/get_counter_cited_organisations_and_logo` - Counter cited orgs

#### **Admin Customers** (`/customers`, `/users`)
- `GET /socket` - Socket connection
- `PUT /customers/:organisation_id/buttons` - Update buttons
- `GET /customers/:organisation_id/buttons` - Get buttons
- `GET /customers/run_query/:representative_name/:query_no` - Run query
- `GET /customers` - List customers
- `GET /users` - List users
- `POST /users` - Create user
- `PUT /users/:user_id` - Update user
- `DELETE /users/:orgId/:user_id` - Delete user
- `GET /customers/:id` - Customer details
- `GET /customers/customers/:id/:type` - Customers by type
- `GET /customers/read_static_file/read_entity_file/:id/:portfolios/:type` - Read entity file
- `GET /customers/static_file/read_entity_file` - Static entity file
- `GET /customers/customers/:id/:representativeID/:type` - Representative customers
- `GET /customers/:id/companies` - Customer companies
- `DELETE /customers/:id/companies` - Delete companies
- `DELETE /customers/:id/share` - Delete share
- `GET /customers/:id/reports` - Customer reports
- `GET /customers/:id/run_update_log` - Update log
- `DELETE /customers/:id/run_update_log` - Delete update log
- `GET /customers/:id/family` - Customer family
- `GET /customers/:id/reclassify-log` - Reclassify log
- `DELETE /customers/:id/reclassify-log` - Delete reclassify log
- `DELETE /customers/:id/family-log` - Delete family log
- `GET /customers/:id/reclassify` - Reclassify data
- `GET /customers/:id/users` - Customer users
- `POST /customers/:id/users` - Create customer user
- `PUT /customers/:id/users/:user_id` - Update customer user
- `PUT /customers/:id/logo` - Update logo
- `GET /customers/:id/libraries` - Libraries
- `GET /customers/:organisation_id/create_tree` - Create tree

#### **Admin Keywords** (`/`)
- `GET /keywords` - List keywords
- `POST /keywords` - Create keyword
- `PUT /keywords/:keywordID` - Update keyword
- `DELETE /keywords/:keywordID` - Delete keyword
- `GET /super_keywords` - Super keywords
- `POST /super_keywords` - Create super keyword
- `PUT /super_keywords/:keywordID` - Update super keyword
- `DELETE /super_keywords/:keywordID` - Delete super keyword
- `GET /state` - States
- `POST /state` - Create state
- `PUT /state/:stateID` - Update state
- `DELETE /state/:stateID` - Delete state
- `GET /company_keywords` - Company keywords
- `POST /company_keywords` - Create company keyword
- `PUT /company_keywords/:keywordID` - Update company keyword
- `DELETE /company_keywords/:keywordID` - Delete company keyword

#### **Admin Login** (`/`)
- `POST /signin` - Admin sign in

#### **Admin Tree** (`/`)
- `POST /corporate_tree` - Corporate tree

#### **Login** (`/`)
- `GET /authenticate/:code/:type` - Authenticate with code
- `POST /verify` - Verify credentials
- `GET /verify/:code/:email` - Email verification
- `POST /signin` - Sign in
- `POST /forgot_password` - Forgot password
- `POST /update_password_via_email` - Update password
- `GET /refresh-token` - Refresh JWT token

#### **Profile** (`/`)
- `GET /profile` - User profile

#### **User Activity Selection** (`/user_activity_selection`)
- `GET /user_activity_selection` - Get selections
- `POST /user_activity_selection` - Create selection
- `PUT /user_activity_selection` - Update selection

#### **User Company Selections** (`/user_company_selection`)
- `GET /user_company_selection` - Get selections
- `POST /user_company_selection` - Create selection
- `PUT /user_company_selection` - Update selection
- `DELETE /user_company_selection` - Delete selection

---

### Client Routes

#### **Activities** (`/activities`)
- `GET /activities/` - List activities
- `GET /activities/:type/:option` - Activities by type
- `GET /activities/comments/:subject_type/:subject` - Activity comments
- `GET /activities/:ID` - Activity details
- `POST /activities/:type` - Create activity
- `PUT /activities/:ID` - Update activity

#### **Address** (`/address`)
- `POST /address` - Create address
- `GET /address` - List addresses
- `GET /address/companies` - Company addresses
- `PUT /address/:addressID` - Update address
- `DELETE /address/:addressID` - Delete address

#### **Category Products** (`/category_products`)
- `POST /` - Create category
- `GET /` - List categories
- `GET /:categoryID/products` - Category products
- `DELETE /:categoryID` - Delete category
- `DELETE /products/:productID` - Delete product

#### **Charts** (`/charts`)
- `GET /:type` - Charts by type

#### **Collections** (`/collections`)
- `GET /collections` - List collections
- `POST /collections` - Create collection
- `PUT /collections/:collection_id` - Update collection
- `DELETE /collections/:collection_id` - Delete collection

#### **Comments** (`/comments`)
- `GET /comments/:subjectType` - Comments by type
- `GET /comments/:subjectType/:subject` - Subject comments
- `POST /comments/:subjectType` - Create comment
- `PUT /comments/:ID` - Update comment
- `DELETE /comments/:ID` - Delete comment

#### **Company** (`/companies`)
- `POST /request` - Company request
- `GET /request` - List requests
- `GET /` - List companies
- `PUT /:companyID` - Update company
- `GET /summary` - Company summary
- `GET /:companyID/list` - Company list
- `GET /:companyID/users` - Company users
- `GET /list` - All lists
- `GET /maintainence_assets` - Maintenance assets
- `GET /lawfirm` - Law firms
- `POST /lawfirm` - Create law firm
- `GET /search/:searchName` - Search company
- `POST /group` - Create group
- `POST /` - Create company
- `DELETE /` - Delete company
- `DELETE /subcompanies` - Delete subcompanies
- `DELETE /lawfirm/companyLawfirmID` - Delete law firm link

#### **Customers** (`/customers`)
- `GET /events/` - Customer events
- `GET /timeline` - Timeline
- `GET /timeline/filling_assets` - Filing assets timeline
- `GET /timeline/security` - Security timeline
- `GET /asset_types` - Asset types
- `GET /asset_types/:tab_id/companies` - Asset type companies
- `GET /asset_types/companies` - All asset companies
- `GET /asset_types/assignments` - Assignments
- `GET /asset_types/assignments/:rfID` - Assignment details
- `GET /asset_types/assets` - Assets
- `POST /asset_types/assets/agents` - Asset agents
- `POST /asset_types/assets/family` - Asset family
- `POST /asset_types/inventors/location` - Inventor location
- `GET /:layout/assets` - Layout assets
- `GET /:layout/transactions` - Layout transactions
- `POST /transactions/groupids` - Transaction group IDs
- `GET /transactions/address` - Transaction addresses
- `GET /transactions/name` - Transaction names
- `GET /incorrectnames` - Incorrect names
- `POST /transactions/queues/address` - Queue address updates
- `POST /transactions/queues/name` - Queue name updates
- `GET /lawfirm` - Law firms
- `GET /lenders` - Lenders
- `GET /:layout/parties` - Layout parties
- `GET /:layout/activites` - Layout activities
- `GET /portfolios/` - Portfolios
- `GET /:type` - By type
- `GET /:parentCompany/parties/:tabId` - Parent company parties
- `GET /:parentCompany/:name/collections/:tabId` - Collections
- `GET /:rf_id/assets` - RF ID assets

#### **Documents** (`/documents`)
- `GET /auth_token` - Google auth token
- `GET /profile` - Google profile
- `GET /layout` - Layouts
- `GET /layout/:layout_id` - Layout details
- `POST /layout` - Create layout
- `DELETE /layout` - Delete layout
- `GET /repo_folder` - Repo folder
- `PUT /repo_folder` - Update repo folder
- `PUT /template_folder` - Update template folder
- `POST /create_template_drive` - Create template drive
- `POST /downloadXML` - Download XML
- `POST /fixed_transaction_address/downloadXML` - Fixed address XML
- `POST /fixed_transaction_name/downloadXML` - Fixed name XML
- `POST /create_maintainence_file` - Create maintenance file
- `GET /drive` - Google Drive
- `POST /product_sheet` - Product sheet
- `POST /sheet` - Create sheet
- `POST /sheet/:type/url` - Sheet URL
- `PUT /sheet/:type` - Update sheet
- `POST /sheet/:type` - Create sheet type
- `POST /sheet/:type/:asset` - Sheet asset
- `POST /transaction` - Transaction
- `GET /` - List documents
- `POST /` - Create document
- `PUT /:document_id` - Update document
- `DELETE /:document_id` - Delete document

#### **Lawfirm** (`/lawfirm`)
- `POST /lawfirm` - Create law firm
- `PUT /lawfirm/:lawfirmID` - Update law firm
- `GET /lawfirm` - List law firms
- `DELETE /lawfirm/:lawfirmID` - Delete law firm

#### **Lawfirm Address** (`/lawfirm_address`)
- `POST /lawfirm_address` - Create address
- `PUT /lawfirm_address/:lawfirmAddressID` - Update address
- `GET /lawfirm_address` - List addresses
- `GET /lawfirm_address/:lawfirmID` - Law firm addresses
- `DELETE /lawfirm_address/:lawfirmAddressID` - Delete address

#### **Microsoft** (`/microsoft`)
- `GET /me` - Microsoft user
- `GET /team` - Teams
- `POST /team` - Create team
- `POST /channel/:teamID` - Create channel
- `GET /channel/:teamID/:name` - Channel details
- `GET /:teamId/channels/:channelId/filesFolder` - Files folder
- `POST /:teamId/channels/:channelId/messages` - Post message
- `GET /:teamId/channels/:channelId/messages` - Get messages
- `GET /:teamId/channels` - Team channels
- `GET /:teamId/users` - Team users

#### **Professionals** (`/professionals`)
- `GET /` - List professionals
- `POST /` - Create professional
- `PUT /:professional_id` - Update professional
- `DELETE /:professional_id` - Delete professional

#### **Slacks** (`/slacks`)
- `GET /auth/:code` - Slack auth
- `GET /conversations/auth/:code` - Conversation auth
- `GET /user/info/:token/:userId` - User info
- `POST /conversations/create/:token` - Create conversation
- `PUT /team` - Update team
- `POST /conversations/message/:token` - Post message
- `GET /conversations/message/:token/:channelID/:messageID` - Get message
- `DELETE /conversations/message/:token/:channelID/:messageID` - Delete message
- `GET /conversations/history/:token/:channelID` - Conversation history
- `GET /conversations/search/assigned/:token` - Search assigned
- `GET /conversations/users/:token` - Conversation users
- `GET /asset/:asset` - Asset data
- `GET /channels/:token` - Channels
- `GET /channel/:channelID/files/:token` - Channel files

#### **Tabs** (`/tabs`)
- `GET /:tabID` - Tab details
- `GET /:tabID/companies/:companyID` - Tab company
- `GET /:tabID/customers` - Tab customers
- `GET /:tabID/companies/:companyID/customers/:customerID` - Tab customer details
- `GET /:tabID/companies/:companyID/customers/:customerID/transactions/:rfID` - Tab transactions

#### **Telephone** (`/telephone`)
- `POST /telephone` - Create telephone
- `GET /telephone` - List telephones
- `DELETE /telephone/:telephoneID` - Delete telephone

#### **Tree** (`/tree`)
- `GET /` - Corporate tree

#### **Users** (`/users`)
- `GET /` - List users
- `POST /` - Create user
- `PUT /:user_id` - Update user
- `DELETE /` - Delete all users
- `DELETE /:user_id` - Delete user
- `POST /invite` - Invite user

---

## AUTHENTICATION & AUTHORIZATION

### JWT Token Authentication (`helpers/verifyJwtToken.js`)

**Middleware**: `authJWT.verifyToken`
- **Header**: `x-auth-token`
- **Secret**: `process.env.SECRET` or default `'p@nt3nt8@60'`
- **Token Payload**:
  ```javascript
  {
    id: user_id,
    orgId: organisation_id,
    org_type: organisation_type,
    show_other_companies: boolean,
    share_code: string,
    iat: timestamp,
    expired: timestamp
  }
  ```
- **Validation**:
  1. Verify JWT signature
  2. Check user exists in `business.user` table
  3. Verify `status = 0` (active)
  4. Set `req.userId`, `req.orgId`, `req.orgType`, `req.showOtherCompanies`, `req.shareCode`

### Share Link Authentication
**Route**: `GET /authenticate/:code/:type`
- Public access via UUID-based share codes
- Generates JWT token for anonymous access
- Tracks IP addresses in `share_link_details` table
- Token expires in 24 hours (86400 seconds)

### Admin Role Check
**Middleware**: `authJWT.isAdmin`
- Requires `user.type = '9'` and `status = 0`

### Password Hashing
- Uses `bcrypt` for password storage
- Email verification with 6-digit random codes (`crypto.randomBytes(3).toString('hex')`)

---

## SOCKET.IO IMPLEMENTATION

### Configuration (`socket.js`)
- **Path**: `/patentrack-socket`
- **Event Model**: Singleton pattern with class-based connection
- **Methods**:
  - `Socket.init(server)` - Initialize connection
  - `Socket.getConnection()` - Get singleton instance
  - `emit(event, data)` - Emit events to connected clients

### Connection Flow
```javascript
io.on("connection", (socket) => {
    console.log('Socket connection established.....')
    this.socket = socket;
});
```

**Usage Pattern**:
- Server-side only (no client event handlers in code)
- Used for real-time updates (transaction updates, asset changes)
- Single socket per server instance

---

## EXTERNAL INTEGRATIONS

### Google Services
- **Google Sheets API** - External asset management
- **Google Drive API** - Document storage and templates
- **OAuth2**: `GOOGLE_CLIENT_ID`, `GOOGLE_SECRET_KEY`, `REDIRECT_URL`

### Slack Integration
- **Bot Token**: `SLACK_BOT_TOKEN`
- **OAuth**: `SLACK_CLIENT_ID`, `SLACK_CLIENT_SECRET`
- Features: Conversations, file sharing, channel management

### Microsoft Teams Integration
- **Client ID**: `MICROSOFT_CLIENT_ID`
- **Secret**: `MICROSOFT_SECRET_KEY`
- **Tenant**: `MICROSOFT_TENANT_ID`
- Features: Teams, channels, messages, file folders

### AWS S3 Storage
```javascript
bucketConfig = {
    bucketName: BUCKET_NAME,
    dirName: BUCKET_PHOTO_DIR,
    region: BUCKET_REGION,
    accessKeyId: BUCKET_ACCESS_KEY,
    secretAccessKey: BUCKET_SECRET_KEY,
    s3Url: BUCKET_URL,
    documentDir: BUCKET_DOCUMENT_DIR,
    figuresDir: BUCKET_FIGURES_DIR
}
```

### Pusher (Real-time Events)
```javascript
pusher_config = {
    appId: '938985',
    key: '3252bb191d77e92ddb3c',
    secret: '2a3dd823cd1abcd45c71',
    cluster: 'us3',
    encrypted: true,
    channel: 'patentrack-channel',
    event: 'patentrack-event'
}
```

---

## DATABASE SCHEMA SUMMARY

### Complete Table List (58 Tables)

**Application Database**:
1. `assets` - Patent assets
2. `assets_for_sale` - Assets marked for sale
3. `assets_transfer` - Asset transfer records
4. `activity_parties_transactions` - Party transaction activities
5. `assignee_organizations` - Assignee org data with logos
6. `assignee` - Assignee details
7. `assignment_conveyance` - Assignment conveyance types
8. `assignment` - Assignment records
9. `assignor_and_assignee` - Combined assignor/assignee entities
10. `assignor` - Assignor details
11. `cited_patents` - Patent citations
12. `citing_patents_with_assignee` - Citing patents with assignees
13. `client_add_company` - Company addition requests
14. `dashboard_items` - Dashboard widgets
15. `error` - Error tracking
16. `layouts` - UI layouts
17. `organisations` - Organization metadata (app level)
18. `representative` - Company representatives
19. `repositories` - Google Drive repositories
20. `share` - Share links for assets
21. `share_link_details` - Share access tracking
22. `share_list` - Items in shares
23. `templates` - Layout templates
24. `timeline` - Transaction timelines
25. `transaction` - Transaction summaries
26. `validity` - Validity counters

**Resources Database**:
27. `documentid` - USPTO document IDs (patents/applications)

**Business Database**:
28. `organisation` - Organizations with DB credentials
29. `role` - User roles
30. `user` - Business users
31. `share_link` - Business share links
32. `user_activity_selection` - User activity preferences
33. `user_company_selection` - User company selections

**Client Databases** (Multi-tenant, per-org):
34. `activity` - Client activities
35. `address` - Company addresses
36. `categories` - Product categories
37. `collection` - Asset collections
38. `collection_company` - Collection companies
39. `comment` - Activity comments
40. `company_lawfirm` - Company-lawfirm links
41. `document` - Client documents
42. `firm` - Law firms
43. `lawfirm` - Lawfirm entities
44. `products` - Category products
45. `professional` - Legal professionals
46. `representative` - Client representatives (company entities)
47. `role` - Client roles
48. `telephone` - Phone numbers
49. `type` - Entity types
50. `user` - Client users

---

## KEY TECHNICAL PATTERNS

### Multi-Tenancy Implementation
1. **Organization-Level Database Isolation**
   - Each org has separate MySQL database
   - Credentials stored in `business.organisation`
   - Connection pooling with cache (`dbConnectionCache.js`)
   - Auto-cleanup of idle connections (5 min TTL)

2. **Client DB Connection Middleware**
   ```javascript
   [authJWT.verifyToken, clientDBConnection.connect]
   ```
   - Establishes org-specific DB connection via `req.connection_db`
   - Dynamic Sequelize instance per request

### Error Tracking
- Sentry integration (`@sentry/node`)
- Custom error logging to files (`helpers/logErrors.js`)
- Request logging middleware (`helpers/requestLogger.js`)

### Data Access Patterns
- **Resources DB**: Read-only USPTO data
- **Application DB**: Main patent tracking logic
- **Business DB**: User/org management
- **Client DBs**: Tenant-specific operational data

### Security Features
- JWT token expiration (24 hours)
- bcrypt password hashing
- Email verification codes
- IP address tracking for share links
- Multi-factor authentication support (`authentication_code`, `auth_token_expire`)

---

## RELATIONSHIPS & FOREIGN KEYS

### Key Relationships:
- `Assets` → `organisation_id`, `company_id`, `layout_id`
- `Assignees` → `AssignorAndAssignee` (BelongsTo)
- `Assignors` → `AssignorAndAssignee` (BelongsTo)
- `AssignorAndAssignee` → `Representatives` (BelongsTo)
- `ClientAddCompany` → `Representatives`, `Organisations` (BelongsTo)
- `Errors` → `Documentids` (HasMany)
- `Layouts` → `Templates` (HasMany)
- `Share` → `ShareLists` (HasMany)
- `Users` (business) → `Organisations`, `Roles` (BelongsTo)
- `Users` (business) → `UserCompanySelection` (HasMany)

---

## CONSTANTS & DEFAULTS
```javascript
DEFAULT_LIMIT = 100
DEFAULT_YEAR = current_year - 24 years
SECRET = 'p@nt3nt8@60' (default)
PORT = 4200 (default)
```

---

## LOGGING & MONITORING
- **NewRelic APM**: Performance monitoring (`newrelic.js`)
- **Console Logging**: Enhanced with stack traces
- **Request Logging**: All HTTP requests logged
- **Error Logging**: File-based error logs

---

## NOTES
- Models in `client/` directory use object structure (`mainStructure` + `options`) vs. direct Sequelize.define()
- Some models use composite primary keys (`Errors`, `AssetsPartiesAssignment`)
- Extensive use of raw SQL queries for complex operations
- File upload support via `express-fileupload`
- CORS enabled for all origins
- Body parser limits: 100MB

---

**Document Generated**: Analysis of PT-API repository (iLvrge/PT-API)
**Total Models Analyzed**: 58+
**Total Endpoints Documented**: 250+
**Database Connections**: 7 (5 main + 2 biblio + dynamic per-org)
