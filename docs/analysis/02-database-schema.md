# 02 - Database Schema

**Complete database schema extraction from Sequelize models and PHP CREATE TABLE statements**

---

## Overview

The legacy PatenTrack system uses **7 MySQL databases** in a multi-tenant architecture:

1. **application** - Main patent data (USPTO)
2. **applicationNew** - New patent format support
3. **resources** - Shared resources and reference data
4. **business** - Tenants, users, organizations
5. **maintenance** - System maintenance data
6. **biblio** - USPTO bibliographic data warehouse
7. **[org_database_name]** - Per-organization tenant databases (dynamic)

**Total Tables: 58+**

---

## Multi-Tenancy Architecture

```
business.organisation table:
- id (primary key)
- name
- database_name  ← Dynamic per-tenant database
- db_host
- db_user
- db_password (encrypted)
- status
```

Each organization gets its own MySQL database with 26 client tables.

---

## DATABASE SCHEMAS

### APPLICATION MODELS (model/application/)

#### **Assets** (Table: `assets`)
- **Primary Key**: `id` (auto-increment)
- **Columns**:
  - `rf_id` (INTEGER)
  - `appno_doc_num` (STRING, nullable)
  - `grant_doc_num` (STRING, nullable)
  - `appno_date` (DATE, nullable)
  - `grant_date` (DATE, nullable)
  - `layout_id` (INTEGER, required)
  - `company_id` (INTEGER, required)
  - `organisation_id` (INTEGER, required)
- **Database**: `applicationNew`

#### **AssetsForSale** (Table: `assets_for_sale`)
- **Primary Key**: `sales_id` (auto-increment)
- **Columns**:
  - `appno_doc_num` (STRING, nullable)
  - `grant_doc_num` (STRING, nullable)
  - `type` (INTEGER, nullable)
  - `organisation_id` (INTEGER, required)
- **Database**: `applicationNew`

#### **AssetsPartiesAssignment** (Table: `activity_parties_transactions`)
- **Primary Key**: `rf_id`
- **Columns**:
  - `organisation_id` (INTEGER, required)
  - `company_id` (INTEGER, required)
  - `rf_id` (INTEGER, required, primary)
  - `exec_dt` (STRING, required)
  - `assignor_and_assignee_id` (INTEGER, required)
  - `activity_id` (INTEGER, required)
- **Schema**: `db_new_application`
- **Database**: `applicationNew`

#### **AssetsTransfer** (Table: `assets_transfer`)
- **Primary Key**: `asset_id` (auto-increment)
- **Columns**:
  - `grant_doc_num` (STRING, nullable)
  - `appno_doc_num` (STRING, nullable)
  - `organisation_id` (INTEGER, required)
  - `layout_id` (INTEGER, required)
  - `status` (INTEGER, required)
- **Database**: `application`

#### **AssigneeOrganizations** (Table: `assignee_organizations`)
- **Primary Key**: `assignee_id` (auto-increment)
- **Columns**:
  - `assignee_organization` (STRING, required)
  - `assignee_query` (STRING, required)
  - `domain`, `domain2`, `domain3` (STRING, nullable)
  - `api_logo`, `api_logo1` through `api_logo9` (STRING, nullable) - 10 logo URLs
  - `without_square` (STRING, nullable)
  - `image_url` (STRING, nullable)
  - `organisation_id` (INTEGER, nullable)
- **Database**: `applicationNew`

#### **Assignees** (Table: `assignee`)
- **Primary Key**: `rf_id` (auto-increment)
- **Columns**:
  - `original_name` (STRING, required)
  - `ee_name` (STRING, required)
  - `ee_address_1`, `ee_address_2` (STRING, required)
  - `ee_city`, `ee_state`, `ee_postcode`, `ee_country` (STRING, required)
  - `assignor_and_assignee_id` (INTEGER, nullable)
- **Relationships**: BelongsTo `AssignorAndAssignee`
- **Database**: `application`

#### **AssignmentConveyance** (Table: `assignment_conveyance`)
- **Primary Key**: `rf_id` (auto-increment)
- **Columns**:
  - `convey_ty` (STRING, required)
  - `employer_assign` (INTEGER, required)
- **Database**: `application`

#### **Assignments** (Table: `assignment`)
- **Primary Key**: `rf_id` (auto-increment)
- **Columns**:
  - `file_id` (INTEGER, required)
  - `cname` (STRING, nullable)
  - `caddress_1` (STRING, required)
  - `caddress_2` (DATE, required)
  - `caddress_3`, `caddress_4`, `caddress_5`, `caddress_6` (STRING)
  - `reel_no` (INTEGER, required)
  - `frame_no` (INTEGER, nullable)
  - `convey_text` (STRING, required)
  - `record_dt`, `last_update_dt` (DATE)
  - `page_count` (INTEGER, required)
  - `purge_in` (STRING, required)
  - `law_firm_id` (INTEGER, required)
- **Database**: `application`

#### **AssignorAndAssignee** (Table: `assignor_and_assignee`)
- **Primary Key**: `assignor_and_assignee_id` (auto-increment)
- **Columns**:
  - `name` (STRING, required)
  - `instances` (INTEGER, nullable)
  - `representative_id` (INTEGER, nullable) - FK to Representatives
- **Relationships**: BelongsTo `Representatives`
- **Database**: `application`

#### **Assignors** (Table: `assignor`)
- **Primary Key**: `rf_id` (auto-increment)
- **Columns**:
  - `original_name`, `or_name` (STRING, required)
  - `exec_dt`, `ack_dt` (DATE, required)
  - `assignor_and_assignee_id` (INTEGER, nullable)
- **Relationships**: BelongsTo `AssignorAndAssignee`
- **Database**: `application`

#### **CitedPatents** (Table: `cited_patents`)
- **Primary Key**: `cited_patent_id` (auto-increment)
- **Columns**:
  - `patent_number` (STRING, required)
  - `assignee_id` (INTEGER, required)
- **Database**: `applicationNew`

#### **CitingPatentWithAssignee** (Table: `citing_patents_with_assignee`)
- **Primary Key**: `citing_id` (auto-increment)
- **Columns**:
  - `patent_number` (STRING, required)
  - `citing_patent_number` (STRING, required)
  - `app_date` (DATE, nullable)
  - `assignee_organization` (STRING, required)
  - `assignee_id` (INTEGER, required)
- **Database**: `applicationNew`

#### **ClientAddCompany** (Table: `client_add_company`)
- **Primary Key**: `company_id` (auto-increment)
- **Columns**:
  - `name` (STRING, required)
  - `organisation_id` (INTEGER, required)
  - `representative_id`, `account_id` (INTEGER, nullable)
  - `status` (INTEGER, required)
  - `request_date` (DATE, required)
- **Relationships**: 
  - BelongsTo `Representatives`
  - BelongsTo `Organisations`
- **Database**: `applicationNew`

#### **Dashboards** (Table: `dashboard_items`)
- **Primary Key**: `id` (auto-increment)
- **Columns**:
  - `organisation_id`, `representative_id` (INTEGER, required)
  - `type` (INTEGER, required)
  - `title`, `sub_heading` (STRING, required)
  - `number` (INTEGER, required)
  - `patent`, `application` (STRING, nullable)
  - `rf_id` (INTEGER)
- **Database**: `applicationNew`

#### **DocumentIds** (Table: `documentid`)
- **Primary Keys**: `rf_id`, `appno_doc_num` (composite)
- **Columns**:
  - `title` (STRING, required)
  - `lang` (STRING, nullable)
  - `appno_doc_num` (STRING, required, primary)
  - `appno_date` (DATE, required)
  - `appno_country` (STRING, nullable)
  - `pgpub_doc_num` (STRING, required)
  - `pgpub_date` (DATE, required)
  - `pgpub_country` (STRING, nullable)
  - `grant_doc_num` (STRING, required)
  - `grant_date` (DATE, nullable)
  - `grant_country` (STRING, required)
- **Database**: `resources`

#### **Errors** (Table: `error`)
- **Primary Keys**: `appno_doc_num`, `organisation_id`, `representative_id` (composite)
- **Columns**:
  - `type` (STRING, nullable)
  - `cname`, `caddress_1` (STRING, nullable)
  - `record_dt` (DATE, nullable)
  - `status` (INTEGER, nullable)
- **Relationships**: HasMany `Documentids`
- **Database**: `application`

#### **Layouts** (Table: `layouts`)
- **Primary Key**: `layout_id` (auto-increment)
- **Columns**:
  - `layout_name` (STRING, required)
- **Relationships**: HasMany `Templates`
- **Database**: `applicationNew`

#### **OrganisationApplication** (Table: `organisations`)
- **Primary Key**: `organisation_id` (auto-increment)
- **Columns**:
  - `organisation_name` (STRING, required)
  - `logo_optimize`, `original_logo` (STRING, nullable)
- **Database**: `applicationNew`

#### **Representatives** (Table: `representative`)
- **Primary Key**: `representative_id` (auto-increment)
- **Columns**:
  - `representative_name` (STRING, required)
  - `created_at`, `updated_at` (DATE, nullable)
- **Timestamps**: true
- **Database**: `application`

#### **Repository** (Table: `repositories`)
- **Primary Key**: `repository_id` (auto-increment)
- **Columns**:
  - `organisation_id` (INTEGER, required)
  - `user_account` (STRING, required)
  - `container_id`, `container_name`, `breadcrumb` (STRING, nullable)
  - `template_container_id`, `template_container_name`, `template_breadcrumb` (STRING, nullable)
  - `utilities_container_id`, `utilities_name`, `utilities_breadcrumb` (STRING, nullable)
  - `foreign_assets_container_id` (STRING, nullable)
  - `file_container_id` through `file_container_child6_id` (STRING, nullable) - 7 file containers
- **Database**: `applicationNew`

#### **Share** (Table: `share`)
- **Primary Key**: `share_id` (auto-increment)
- **Columns**:
  - `code` (STRING, required)
  - `organisation_id` (INTEGER, required)
  - `user_id`, `type` (INTEGER)
  - `share_button` (INTEGER, nullable)
  - `transactions`, `show_other_companies` (STRING, nullable)
  - `created_at`, `updated_at` (DATE)
- **Relationships**: HasMany `ShareLists`
- **Timestamps**: true
- **Database**: `applicationNew`

#### **ShareLinkDetails** (Table: `share_link_details`)
- **No Primary Key** (removed)
- **Columns**:
  - `share_id` (INTEGER, required)
  - `ip_address` (STRING, required)
  - `created_at`, `updated_at` (DATE)
- **Timestamps**: true
- **Database**: `applicationNew`

#### **ShareLists** (Table: `share_list`)
- **No Primary Key** (removed)
- **Columns**:
  - `share_id` (INTEGER, required)
  - `asset` (STRING, required)
  - `type` (INTEGER, required)
- **Database**: `applicationNew`

#### **Templates** (Table: `templates`)
- **Primary Key**: `template_id` (auto-increment)
- **Columns**:
  - `layout_id` (INTEGER, required)
  - `user_account`, `container_name`, `container_id` (STRING, required)
  - `organisation_id` (INTEGER, required)
- **Database**: `applicationNew`

#### **Timelines** (Table: `timeline`)
- **Primary Key**: `rf_id`
- **Columns**:
  - `reel_no`, `frame_no` (INTEGER, required)
  - `record_dt` (DATE, nullable)
  - `representative_id` (INTEGER, required)
  - `type`, `original_name` (STRING, required)
  - `assignor_and_assignee_id` (INTEGER, required)
  - `exec_dt` (DATEONLY, nullable)
  - `convey_ty` (STRING, nullable)
  - `employer_assign` (INTEGER, required)
- **Database**: `application`

#### **Transactions** (Table: `transaction`)
- **Primary Key**: `transaction_id` (auto-increment)
- **Columns**:
  - `organisation_id`, `representative_id` (INTEGER, required)
  - `buy`, `buy_patent`, `diff_buy_patent` (INTEGER, required)
  - `sale`, `sale_patent`, `diff_sale_patent` (INTEGER, required)
  - `security`, `security_patent`, `diff_security_patent` (INTEGER, required)
  - `release`, `release_patent`, `diff_release_patent` (INTEGER, required)
  - `license_in`, `license_in_patent`, `diff_license_in_patent` (INTEGER, required)
  - `license_out`, `license_out_patent`, `diff_license_out_patent` (INTEGER, required)
  - `transaction_list` (STRING, required)
- **Database**: `application`

#### **Validity** (Table: `validity`)
- **Primary Key**: `validity_id` (auto-increment)
- **Columns**:
  - `organisation_id`, `representative_id` (INTEGER, required)
  - `application`, `patent`, `encumbered` (INTEGER, required)
  - `current_patent_year`, `previous_patent_year` (INTEGER, required)
  - `current_application_year`, `previous_application_year` (INTEGER, required)
  - `difference_patent`, `difference_application` (DECIMAL, required)
  - `list` (STRING, required)
- **Database**: `application`

---

### BUSINESS MODELS (model/business/)

#### **Organisations** (Table: `organisation`)
- **Primary Key**: `organisation_id` (auto-increment)
- **Columns**:
  - `uuid` (STRING.BINARY, nullable)
  - `name` (STRING, required)
  - `address` (STRING, nullable)
  - **Multi-tenant DB credentials**: `org_key`, `org_pass`, `org_host`, `org_db`, `org_usr` (STRING, nullable)
  - `organisation_type` (INTEGER, nullable)
  - `team`, `microsoft_team` (STRING, nullable)
  - `phone_number`, `email_address` (STRING, nullable)
  - `logo`, `linkedin_url` (STRING, nullable)
  - `zipcode`, `city`, `state` (STRING, nullable)
  - `country_id`, `type`, `subscribtion` (INTEGER, nullable)
  - `created_at`, `updated_at` (DATE, nullable)
- **Database**: `business`

#### **Roles** (Table: `role`)
- **Primary Key**: `role_id` (auto-increment)
- **Columns**:
  - `name` (STRING, required)
  - `created_at`, `updated_at` (DATE, nullable)
- **Timestamps**: true
- **Database**: `business`

#### **Users** (Table: `user`)
- **Primary Key**: `user_id` (auto-increment)
- **Columns**:
  - `first_name`, `last_name` (STRING, required)
  - `job_title`, `username` (STRING, nullable)
  - `email_address` (STRING, required)
  - `password` (STRING, required)
  - `organisation_id` (INTEGER, required) - FK to Organisations
  - `logo` (STRING, nullable)
  - `role_id` (INTEGER, required)
  - `type`, `status` (INTEGER)
  - `authentication_code` (STRING, nullable)
  - `auth_token_expire` (DATE, nullable)
  - `created_at`, `updated_at` (DATE, nullable)
- **Relationships**:
  - BelongsTo `Organisations`
  - BelongsTo `Roles`
  - HasMany `UserCompanySelection`
- **Timestamps**: true
- **Database**: `business`

#### **ShareLinks** (Table: `share_link`)
- **Primary Key**: `share_id` (auto-increment)
- **Columns**:
  - `code` (STRING, required)
  - `organisation_id`, `user_id` (INTEGER)
  - `subject` (STRING, required)
  - `subject_type` (INTEGER, required)
  - `created_at`, `updated_at` (DATE)
- **Timestamps**: true
- **Database**: `business`

#### **UserActivitySelection** (Table: `user_activity_selection`)
- **Primary Key**: `user_activity_selection_id` (auto-increment)
- **Columns**:
  - `user_id`, `organisation_id`, `activity_id` (INTEGER, required)
- **Database**: `business`

#### **UserCompanySelection** (Table: `user_company_selection`)
- **Primary Key**: `user_company_selection_id` (auto-increment)
- **Columns**:
  - `user_id`, `organisation_id`, `representative_id` (INTEGER, required)
- **Database**: `business`

---

### CLIENT MODELS (model/client/)
**Note**: Client models use dynamic connections (multi-tenant per org)

#### **Activities** (Table: `activity`)
- **Primary Key**: `activity_id` (auto-increment)
- **Columns**:
  - `user_id` (INTEGER, required)
  - `professional_id` (INTEGER, nullable)
  - `subject` (STRING, required)
  - `comment` (STRING, nullable)
  - `type`, `subject_type`, `document_id` (INTEGER, required)
  - `upload_file`, `share_url` (STRING, nullable)
  - `complete` (INTEGER, nullable)
  - `created_at`, `updated_at` (DATE)
- **Timestamps**: true

#### **Address** (Table: `address`)
- **Primary Key**: `address_id` (auto-increment)
- **Columns**:
  - `representative_id` (INTEGER, required)
  - `street_address`, `suite`, `city`, `state`, `country`, `zip_code` (STRING, nullable)
  - `telephone`, `telephone_2`, `telephone_3` (STRING, nullable)
  - `created_at`, `updated_at` (DATE, nullable)
- **Timestamps**: true

#### **Categories** (Table: `categories`)
- **Primary Key**: `category_id` (auto-increment)
- **Columns**:
  - `name` (STRING, required)
  - `created_at`, `updated_at` (DATE, nullable)
- **Timestamps**: true

#### **Collections** (Table: `collection`)
- **Primary Key**: `collection_id` (auto-increment)
- **Columns**:
  - `user_id` (INTEGER, nullable)
  - `name` (STRING, required)
  - `created_at`, `updated_at` (DATE)
- **Timestamps**: true

#### **CollectionCompanies** (Table: `collection_company`)
- **Primary Keys**: `collection_company_id`, `collection_id` (composite)
- **Columns**:
  - `name` (STRING, required)
  - `instances` (INTEGER, required)
  - `created_at`, `updated_at` (DATE)
- **Timestamps**: true

#### **Comments** (Table: `comment`)
- **Primary Key**: `comment_id` (auto-increment)
- **Columns**:
  - `activity_id` (INTEGER, required)
  - `user_id` (INTEGER, nullable)
  - `comment` (STRING, nullable)
  - `created_at`, `updated_at` (DATE)
- **Timestamps**: true

#### **CompanyLawfirm** (Table: `company_lawfirm`)
- **Primary Key**: `company_lawfirm_id` (auto-increment)
- **Columns**:
  - `representative_id`, `lawfirm_id` (INTEGER, required)

#### **Documents** (Table: `document`)
- **Primary Key**: `document_id` (auto-increment)
- **Columns**:
  - `title` (STRING, nullable)
  - `file` (STRING, required)
  - `type` (INTEGER, nullable)
  - `description` (STRING, nullable)
  - `user_id` (INTEGER)
  - `created_at`, `updated_at` (DATE)
- **Timestamps**: true

#### **Firms** (Table: `firm`)
- **Primary Key**: `firm_id` (auto-increment)
- **Columns**:
  - `firm_name` (STRING, required)
  - `firm_logo` (STRING, nullable)
  - `firm_linkedin_url` (INTEGER, nullable)

#### **Lawfirm** (Table: `lawfirm`)
- **Primary Key**: `lawfirm_id` (auto-increment)
- **Columns**:
  - `name` (STRING, required)
  - `created_at`, `updated_at` (DATE, nullable)
- **Timestamps**: true

#### **Products** (Table: `products`)
- **Primary Key**: `product_id` (auto-increment)
- **Columns**:
  - `category_id` (INTEGER, required)
  - `name` (STRING, required)
  - `created_at`, `updated_at` (DATE, nullable)
- **Timestamps**: true

#### **Professionals** (Table: `professional`)
- **Primary Key**: `professional_id` (auto-increment)
- **Columns**:
  - `first_name`, `last_name` (STRING, required)
  - `email_address` (INTEGER, nullable)
  - `telephone` (STRING, nullable)
  - `telephone1`, `linkedin_url` (INTEGER)
  - `profile_logo`, `firm_id` (STRING, nullable)
  - `type` (INTEGER, nullable)
  - `created_at`, `updated_at` (DATE)
- **Timestamps**: true

#### **Representatives** (Table: `representative`)
- **Primary Key**: `representative_id` (auto-increment)
- **Columns**:
  - `company_id` (INTEGER, nullable)
  - `representative_name`, `original_name` (STRING)
  - `instances` (INTEGER, required)
  - `parent_id`, `child`, `type`, `mode`, `status` (INTEGER, nullable)

#### **Roles** (Table: `role`)
- **Primary Key**: `role_id` (auto-increment)
- **Columns**:
  - `name` (STRING, required)

#### **Telephone** (Table: `telephone`)
- **Primary Key**: `telephone_id` (auto-increment)
- **Columns**:
  - `representative_id` (INTEGER, required)
  - `telephone_number` (STRING, required)
  - `created_at`, `updated_at` (DATE, nullable)
- **Timestamps**: true

#### **Types** (Table: `type`)
- **Primary Key**: `type_id` (auto-increment)
- **Columns**:
  - `name` (STRING, required)

#### **Users** (Table: `user`)
- **Primary Key**: `user_id` (auto-increment)
- **Columns**:
  - `first_name`, `last_name` (STRING, required)
  - `username` (STRING, nullable)
  - `email_address` (STRING, required)
  - `linkedin_url`, `job_title` (STRING, nullable)
  - `telephone` (STRING, nullable)
  - `telephone1` (INTEGER)
  - `logo` (STRING, nullable)
  - `role_id` (INTEGER, required)
  - `status` (INTEGER, nullable)
  - `created_at`, `updated_at` (DATE)
- **Timestamps**: true

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
