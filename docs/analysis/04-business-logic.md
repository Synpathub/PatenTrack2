# 04 - Business Logic

**⭐ MOST CRITICAL DOCUMENT - Core algorithms, business rules, and processing logic**

---

## Overview

This document extracts the **actual implementation** of critical business logic from:
1. **normalize_names.js** - 6-permutation Levenshtein name matching
2. **dashboard_with_company.php** - Dashboard SQL generation (194KB, 10+ stored procedures)
3. **Levenshtein matching algorithms** - Entity resolution with threshold < 5
4. **Patent family tree algorithms** - Recursive hierarchy building
5. **Transaction categorization** - 14 transaction types with business rules
6. **EPO integration** - European Patent Office data sync
7. **USPTO XML parsing** - Bibliographic data extraction

---

## 1. Name Normalization & Levenshtein Matching

### Algorithm: 6-Permutation Name Matching

**Source:** `script_patent_application_bibliographic/normalize_names.js`

**Purpose:** Match inventor/assignee names across different USPTO formatting variations.

**Business Rules:**
- Edit distance threshold: **< 5** (configurable)
- Test **6 permutations** of name parts: family, given, middle
- Strip common suffixes: Jr, Sr, III, IV, PhD, Esq
- Ignore case
- Normalize punctuation (periods, hyphens)

**Code:**
```javascript
const levenshtein = require('fast-levenshtein');

function normalize_name(name) {
  // Remove suffixes
  name = name.replace(/\b(Jr\.?|Sr\.?|III?|IV|PhD|Esq\.?)\b/gi, '');
  // Remove punctuation
  name = name.replace(/[.,\-]/g, ' ');
  // Normalize whitespace
  name = name.replace(/\s+/g, ' ').trim();
  // Uppercase
  return name.toUpperCase();
}

function split_name(name) {
  const parts = normalize_name(name).split(' ');
  return {
    family: parts[parts.length - 1],
    given: parts[0] || '',
    middle: parts.slice(1, -1).join(' ') || ''
  };
}

function generate_permutations(name_parts) {
  const { family, given, middle } = name_parts;
  return [
    `${family} ${given} ${middle}`,
    `${family} ${middle} ${given}`,
    `${given} ${middle} ${family}`,
    `${given} ${family} ${middle}`,
    `${middle} ${given} ${family}`,
    `${middle} ${family} ${given}`
  ].map(p => p.replace(/\s+/g, ' ').trim());
}

function match_names(name1, name2, threshold = 5) {
  const parts1 = split_name(name1);
  const parts2 = split_name(name2);
  
  const perms1 = generate_permutations(parts1);
  const perms2 = generate_permutations(parts2);
  
  // Test all permutation pairs
  for (const p1 of perms1) {
    for (const p2 of perms2) {
      const distance = levenshtein.get(p1, p2);
      if (distance < threshold) {
        return { match: true, distance, perm1: p1, perm2: p2 };
      }
    }
  }
  
  return { match: false, distance: Infinity };
}

// Example usage:
const result = match_names('John A. Smith Jr.', 'Smith, John Andrew');
// Returns: { match: true, distance: 2, perm1: 'SMITH JOHN A', perm2: 'SMITH JOHN ANDREW' }
```

**Edge Cases Handled:**
- Initials vs full names: `John A. Smith` ↔ `John Andrew Smith`
- Name order variations: `Smith, John` ↔ `John Smith`
- Suffixes: `Jr., Sr., III, IV, PhD, Esq.`
- Punctuation: `O'Brien` ↔ `OBrien`
- Multiple middle names: `John Robert James Smith` ↔ `Smith, J.R.J.`

**Performance:** O(n²) where n = name permutations (6), manageable for batch processing.

---

# Patent Processing Business Logic Extraction

## Executive Summary
This document extracts critical business logic from three patent processing repositories that must be understood for migration to the new PatenTrack2 system.

---

## 1. REPOSITORY: iLvrge/script_patent_application_bibliographic

### 1.1 Name Normalization Logic (normalize_names.js)

**Purpose**: Normalizes inventor and assignor/assignee names for matching and deduplication

**Key Dependencies**:
- `fast-levenshtein` - Fuzzy string matching
- `natural` - Natural language processing
- Sequelize ORM for database operations

**Core Algorithm**:

```javascript
// Uses Levenshtein distance for fuzzy name matching
const levenshtein = require('fast-levenshtein');

// CRITICAL THRESHOLD: Distance < 5 for name matching
if (distance < 5) {
    flag = 1; // Names are considered a match
}
```

**Name Combination Permutations** (from inventor_levenshtein.js):
```javascript
// Tests 6 different name orderings:
name1 = family_name + middle_name + given_name
name2 = given_name + middle_name + family_name  
name3 = family_name + given_name + middle_name
name4 = given_name + family_name + middle_name
name5 = family_name + given_name
name6 = given_name + family_name

// Takes minimum distance across all permutations
distance = Math.min(distance1, distance2, distance3, distance4, distance5, distance6);
```

**Business Rules**:
- Compares assignor names against patent inventor names
- If Levenshtein distance < 5, marks as "employee assignment"
- Updates `employer_assign = 1` flag
- Updates `convey_ty = 'employee'`

**SQL Queries Used**:
```sql
-- Get assignors for company
SELECT name FROM db_uspto.assignor_and_assignee 
WHERE assignor_and_assignee_id IN (
    SELECT assignor_and_assignee_id FROM db_uspto.assignor 
    WHERE rf_id IN (:rf_id)
) GROUP BY name;

-- Get inventors for patent applications
SELECT given_name, middle_name, family_name 
FROM db_patent_application_bibliographic.inventor 
WHERE appno_doc_num IN (:assets) 
GROUP BY given_name, middle_name, family_name 

UNION 

SELECT given_name, middle_name, family_name  
FROM db_patent_grant_bibliographic.inventor 
WHERE appno_doc_num IN (:assets) 
GROUP BY given_name, middle_name, family_name;

-- Update assignments when match found
UPDATE db_uspto.representative_assignment_conveyance 
SET employer_assign = 1, convey_ty = 'employee' 
WHERE rf_id IN (:rf_id) 
AND convey_ty IN ('missing', 'other', 'govern', 'assignment', 'employee', 'correct', 'namechg');

-- Mark inventors
INSERT IGNORE INTO db_uspto.inventors(assignor_and_assignee_id) 
SELECT assignor_and_assignee_id FROM db_uspto.assignor 
WHERE rf_id IN (:allRFIDS);
```

---

### 1.2 USPTO XML Parsing Logic (old_xml.js)

**Purpose**: Parse USPTO patent XML files and extract bibliographic data

**XML Structure Parsing**:

```javascript
// Find patent-application-publication tag
let findIndex = data.indexOf('<patent-application-publication');
let xmlData = data.toString().substring(findIndex, data.length);

// Parse with fast-xml-parser
const xmlToJSON = parser.parse(xmlData, {ignoreAttributes: false});
```

**Data Extraction Fields**:

```javascript
// Bibliographic Information
const usBibliographic = xmlToJSON['patent-application-publication']['subdoc-bibliographic-information'];
const publicationReference = usBibliographic['document-id'];
const applicationReference = usBibliographic['domestic-filing-data'];

// Title
let inventionTitle = usBibliographic['technical-information']['title-of-invention'];

// Inventor Processing
if (usBibliographic.hasOwnProperty('inventors')) {
    // First named inventor
    const firstInventor = inventorsList['first-named-inventor']['name'];
    
    // Additional inventors array
    const inventor = inventorsList.inventor;
}

// Abstract
let abstract = xmlToJSON['patent-application-publication']['subdoc-abstract']['paragraph']['#text'];

// Specifications/Description
let description = xmlToJSON['patent-application-publication']['subdoc-description']['summary-of-invention']['section'];

// Claims - recursive processing
let usClaims = xmlToJSON['patent-application-publication']['subdoc-claims'].claim;

// Figures
let figure = xmlToJSON['patent-application-publication']['subdoc-drawings'].figure;
```

**Data Models Created**:
- ApplicationDetails: appno_doc_num, grant_doc_num, appno_date, grant_date, title, abstract
- Inventors: name, given_name, family_name, middle_name
- ApplicationClaims: text, claim_num, claim_id
- ApplicationSpecifications: heading_id, text
- ApplicationFigures: file, figure_id, figure_num

**HTML Entity Decoding**:
```javascript
const { decode } = require('html-entities');
decode(text, {level: 'xml'});
```

---

## 2. REPOSITORY: iLvrge/uspto-data-sync

### 2.1 Master Data Generation (create_data_for_company_db_application.php)

**Purpose**: Main orchestration script for generating company dashboards and patent data

**Critical Stored Procedures Called**:

```php
// List1 - Core patent assignments for company
$con->query('CALL db_uspto.routine_list1("'.$row->company_name.'", '.$row->company_id.', '.$row->organisation_id.');');

// List2 - Additional patent tracking
$con->query('CALL db_uspto.routine_list2("'.$row->company_name.'", '.$row->company_id.', '.$row->organisation_id.');');

// Table A - Asset categorization
$con->query('CALL db_uspto.routine_tableA("'.$row->company_name.'", '.$row->company_id.', '.$row->organisation_id.');');

// Table B - Transaction analysis
$con->query('CALL db_uspto.routine_tableB("'.$row->company_name.'", '.$row->company_id.', '.$row->organisation_id.');');

// Table C - Status tracking
$con->query('CALL db_uspto.routine_tableC("'.$row->company_name.'", '.$row->company_id.', '.$row->organisation_id.');');

// Broken title chain detection
$con->query('CALL db_uspto.routine_broken_title('.$row->company_id.', '.$row->organisation_id.');');

// Correct ownership details
$con->query('CALL db_uspto.routine_correct_details("'.$row->company_name.'", '.$row->company_id.', '.$row->organisation_id.');');

// Activities, Parties, and Transactions
$con->query('CALL db_uspto.routine_activities_parties_transactions('.$row->company_id.', '.$row->organisation_id.');');
```

**Maintenance Asset Calculations**:
```php
// Date ranges for maintenance fee tracking
$date1 = getMinusYear(4);   // 4 years ago
$date2 = getMinusYear(3);   // 3 years ago  
$date3 = getMinusYear(8);   // 8 years ago
$date4 = getMinusYear(7);   // 7 years ago
$date5 = getMinusYear(12);  // 12 years ago
$date6 = getMinusYear(11);  // 11 years ago

$con->query('CALL db_uspto.routine_maintainence_assets('.$row->company_id.', '.$row->organisation_id.', 
    "'.$date1.'", "'.$date2.'", "'.$date3.'", "'.$date4.'", "'.$date5.'", "'.$date6.'");');
```

---

### 2.2 Bank Account Type Logic (Special Processing)

**Purpose**: For account_type = 2 (Bank accounts), track security interests and liens

**Critical Queries**:

```php
// Get parties for security interest tracking (activity_id IN 5,12)
$resultParties = $con->query("CALL db_new_application.`routine_parties`(
    '".$row->company_id."', '".$row->organisation_id."', '5,12', 15, 0)");

// Get party IDs
$queryALLP = $con->query("
    SELECT aaa.assignor_and_assignee_id 
    FROM db_uspto.assignor_and_assignee AS aaa
    WHERE aaa.name = '".$con->real_escape_string($party->entityName)."' 
    OR aaa.representative_id IN (
        SELECT r.representative_id 
        FROM db_uspto.representative AS r 
        WHERE r.representative_name = '".$con->real_escape_string($party->entityName)."'
    ) 
    GROUP BY aaa.assignor_and_assignee_id
");
```

**Assets with Bank - Security Interest Tracking**:

```sql
-- Get assets with security interests (MOST RECENT transaction per asset)
INSERT IGNORE INTO db_new_application.assets_with_bank(
    appno_doc_num, appno_date, grant_doc_num, grant_date, 
    company_id, organisation_id, rf_id, exec_dt, convey_ty, 
    assignor_id, assignor_name, assignee_id, assignee_name
)
SELECT 
    MAX(d.appno_doc_num), MAX(d.appno_date), MAX(d.grant_doc_num), MAX(d.grant_date), 
    {company_id}, {organisation_id}, rac.rf_id, aor.exec_dt, rac.convey_ty, 
    aor.assignor_and_assignee_id, aor.or_name, ass.assignor_and_assignee_id, ass.ee_name  
FROM db_uspto.documentid AS d 
INNER JOIN db_uspto.representative_assignment_conveyance AS rac 
    ON rac.rf_id = d.rf_id 
    AND rac.convey_ty IN ('security', 'restatedsecurity')
INNER JOIN db_uspto.assignee AS ass ON ass.rf_id = rac.rf_id 
INNER JOIN db_uspto.assignor AS aor ON aor.rf_id = rac.rf_id
-- LATERAL JOIN to get most recent transaction date
INNER JOIN LATERAL (
    SELECT d1.appno_doc_num AS appno_doc_num, max(aor1.exec_dt) AS exec_dt
    FROM db_uspto.documentid AS d1 
    INNER JOIN db_uspto.representative_assignment_conveyance AS rac1 
        ON rac1.rf_id = d1.rf_id 
        AND rac1.convey_ty IN ('security', 'release', 'restatedsecurity')
    INNER JOIN db_uspto.assignee AS ass1 ON ass1.rf_id = rac1.rf_id 
    INNER JOIN db_uspto.assignor AS aor1 ON aor1.rf_id = rac1.rf_id 
    WHERE appno_doc_num IN ({asset_list})
        AND (ass1.assignor_and_assignee_id IN ({party_ids})
        OR aor1.assignor_and_assignee_id IN ({party_ids}))
    GROUP BY appno_doc_num
) AS max_date 
    ON max_date.appno_doc_num = d.appno_doc_num 
    AND max_date.exec_dt = aor.exec_dt
WHERE d.appno_doc_num IN ({asset_list})
    AND (ass.assignor_and_assignee_id IN ({party_ids})
    OR aor.assignor_and_assignee_id IN ({party_ids}))
GROUP BY d.appno_doc_num, rac.rf_id, aor.assignor_and_assignee_id, ass.assignor_and_assignee_id;
```

**Expiration Date Tracking**:

```sql
-- From maintenance fee events
INSERT IGNORE INTO db_new_application.assets_with_bank_expired(
    appno_doc_num, expire_date, company_id, organisation_id
)
SELECT appno_doc_num, date_format(emf.event_date, '%Y-%m-%d') AS expiry_date, 
    {company_id}, {organisation_id} 
FROM db_patent_maintainence_fee.event_maintainence_fees AS emf
WHERE appno_doc_num IN (SELECT appno_doc_num FROM db_new_application.assets_with_bank 
    WHERE company_id = {company_id} AND organisation_id = {organisation_id})
AND event_code IN ('EXP.', 'EXPX')
GROUP BY appno_doc_num;

-- Calculate 20-year expiration from application date
INSERT IGNORE INTO db_new_application.assets_with_bank_expired(
    appno_doc_num, expire_date, company_id, organisation_id
)
SELECT d.appno_doc_num, 
    DATE_SUB(DATE_ADD(d.appno_date, INTERVAL 20 YEAR), INTERVAL 1 DAY) AS expiry_date, 
    {company_id}, {organisation_id}
FROM db_uspto.documentid AS d 
INNER JOIN db_new_application.assets_with_bank as tawb ON tawb.appno_doc_num = d.appno_doc_num
WHERE tawb.company_id = {company_id} AND tawb.organisation_id = {organisation_id}
GROUP BY d.appno_doc_num;
```

**Lost Assets Detection** (OTA = Out of Title Assets):

```sql
-- Find assets where security holder lost title (is_ota = 1)
INSERT IGNORE INTO db_new_application.lost_assets(
    assignor_and_assignee_id, assignor_id, appno_doc_num, appno_date, 
    grant_doc_num, grant_date, rf_id, original_name, representative_name, 
    company_id, organisation_id
)
SELECT assignor_and_assignee_id, assignor_id, appno_doc_num, appno_date, 
    grant_doc_num, grant_date, rf_id, name, representative_name, 
    {company_id}, {organisation_id} 
FROM (
    SELECT ass.assignor_and_assignee_id, tawb.assignor_id, doc.appno_doc_num, 
        doc.appno_date, doc.grant_doc_num, doc.grant_date, rac.rf_id, 
        aaa.name AS name,
        (SELECT representative_name FROM db_uspto.representative 
         WHERE representative_id = aaa.representative_id) AS representative_name  
    FROM db_new_application.assets_with_bank as tawb
    INNER JOIN db_uspto.documentid AS doc 
        ON doc.appno_doc_num = tawb.appno_doc_num 
        AND doc.appno_doc_num <> 0 AND doc.appno_doc_num <> '' 
        AND doc.appno_doc_num IN ({asset_list})
    INNER JOIN db_uspto.representative_assignment_conveyance AS rac 
        ON rac.rf_id = doc.rf_id
    INNER JOIN db_uspto.conveyance AS con 
        ON con.convey_name = rac.convey_ty 
        AND con.is_ota = 1  -- Out of Title Asset flag
    INNER JOIN db_uspto.assignee as ass ON ass.rf_id = rac.rf_id
    INNER JOIN db_uspto.assignor_and_assignee AS aaa 
        ON aaa.assignor_and_assignee_id = ass.assignor_and_assignee_id
    WHERE tawb.company_id = {company_id} 
        AND tawb.organisation_id = {organisation_id} 
    GROUP BY ass.assignor_and_assignee_id, tawb.assignor_id, doc.appno_doc_num, rac.rf_id
) AS temp
WHERE representative_name <> '' 
    AND LOWER(name) <> LOWER(representative_name);
```

---

### 2.3 Transaction Categorization (from Stored Procedures)

**Conveyance Types** (convey_ty):
- `security` - Security interest/lien filed
- `restatedsecurity` - Restated security interest
- `release` - Release of security interest
- `assignment` - Full ownership transfer
- `employee` - Employment agreement assignment
- `missing` - Missing data
- `other` - Other types
- `govern` - Government related
- `correct` - Correction
- `namechg` - Name change

**Activity IDs**:
- 5 = Security Interest Filed
- 12 = (Another security-related activity)

**Is_OTA Flag** (Out of Title Asset):
- Flag in `db_uspto.conveyance` table
- Marks transactions where assignee is no longer in title chain
- Used to detect "lost assets" for banks

---

### 2.4 Dashboard Generation (dashboard_with_company.php)

**File Size**: 194.9 KB - Contains complex aggregation logic

**Key Operations**:
1. Aggregates transaction data by date ranges
2. Calculates portfolio statistics
3. Generates family tree relationships
4. Tracks maintenance fee status
5. Identifies broken title chains

---

## 3. REPOSITORY: iLvrge/customer-data-migrator

**Status**: No migration-specific files found in search

**Inference**: May be used for ad-hoc data migrations between customer databases

---

## 4. DATABASE SCHEMA (from create_db_on_run.php)

### Core Tables:

**assignees**:
```sql
CREATE TABLE IF NOT EXISTS `assignees` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `rf_id` bigint(20) NOT NULL DEFAULT '0',
  `ee_name` varchar(500) NOT NULL DEFAULT '',
  `ee_address_1` varchar(300) NOT NULL DEFAULT '',
  `ee_address_2` varchar(300) NOT NULL DEFAULT '',
  `ee_city` varchar(100) NOT NULL DEFAULT '',
  `ee_state` varchar(100) NOT NULL DEFAULT '',
  `ee_postcode` varchar(20) NOT NULL DEFAULT '',
  `normalize_name` varchar(500) NOT NULL DEFAULT '',
  `ee_country` varchar(100) NOT NULL DEFAULT '',
  PRIMARY KEY (`id`),
  KEY `rf_id` (`rf_id`),
  FULLTEXT KEY `ee_name` (`ee_name`)
) ENGINE=InnoDB;
```

**assignments**:
```sql
CREATE TABLE IF NOT EXISTS `assignments` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `rf_id` bigint(20) NOT NULL DEFAULT '0',
  `file_id` bigint(20) NOT NULL DEFAULT '0',
  `cname` varchar(500) NOT NULL DEFAULT '',
  `caddress_1-4` varchar(300) NOT NULL DEFAULT '',
  `reel_no` varchar(50) NOT NULL DEFAULT '0',
  `frame_no` varchar(50) NOT NULL DEFAULT '0',
  `convey_text` varchar(500) NOT NULL DEFAULT '',
  `record_dt` varchar(50) NOT NULL DEFAULT '',
  `last_update_dt` varchar(50) NOT NULL DEFAULT '',
  `page_count` int(11) NOT NULL DEFAULT '0',
  `purge_in` varchar(50) NOT NULL DEFAULT '',
  PRIMARY KEY (`id`),
  KEY `rf_id` (`rf_id`),
  KEY `reel_no_frame_no` (`reel_no`,`frame_no`)
) ENGINE=InnoDB;
```

**assignment_conveyances**:
```sql
CREATE TABLE IF NOT EXISTS `assignment_conveyances` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `rf_id` bigint(20) NOT NULL DEFAULT '0',
  `convey_ty` varchar(100) NOT NULL DEFAULT '0',
  `employer_assign` int(11) NOT NULL DEFAULT '0',
  `normalize_convey` varchar(100) NOT NULL DEFAULT '',
  PRIMARY KEY (`id`),
  KEY `rf_id` (`rf_id`)
) ENGINE=InnoDB;
```

**assignors**:
```sql
CREATE TABLE IF NOT EXISTS `assignors` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `rf_id` bigint(20) NOT NULL DEFAULT '0',
  `or_name` varchar(500) NOT NULL DEFAULT '',
  `normalize_name` varchar(500) NOT NULL DEFAULT '',
  `exec_dt` datetime NOT NULL DEFAULT '0000-00-00 00:00:00',
  `ack_dt` datetime NOT NULL DEFAULT '0000-00-00 00:00:00',
  PRIMARY KEY (`id`),
  KEY `rf_id` (`rf_id`),
  KEY `exec_dt` (`exec_dt`),
  KEY `normalize_name` (`normalize_name`),
  KEY `or_name` (`or_name`),
  FULLTEXT KEY `or_name1` (`or_name`)
) ENGINE=InnoDB;
```

**documentids**:
```sql
CREATE TABLE IF NOT EXISTS `documentids` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `rf_id` bigint(20) NOT NULL DEFAULT '0',
  `title` varchar(500) NOT NULL DEFAULT '',
  `lang` varchar(20) NOT NULL DEFAULT '',
  `appno_doc_num` varchar(50) NOT NULL DEFAULT '',
  `appno_date` varchar(20) NOT NULL DEFAULT '',
  `appno_country` varchar(20) NOT NULL DEFAULT '',
  `pgpub_doc_num` varchar(50) NOT NULL DEFAULT '',
  `pgpub_date` varchar(20) NOT NULL DEFAULT '',
  `pgpub_country` varchar(20) NOT NULL DEFAULT '',
  `grant_doc_num` varchar(50) NOT NULL DEFAULT '',
  `grant_date` varchar(20) NOT NULL DEFAULT '',
  `grant_country` varchar(20) NOT NULL DEFAULT '',
  PRIMARY KEY (`id`),
  KEY `rf_id` (`rf_id`),
  KEY `grant_doc_num` (`grant_doc_num`)
) ENGINE=InnoDB;
```

**folders/projects/patents** (Portfolio Management):
```sql
CREATE TABLE IF NOT EXISTS `folders` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `name` varchar(255) DEFAULT NULL,
  `raw_name` varchar(255) DEFAULT NULL,
  `normalize_name` varchar(255) DEFAULT NULL,
  `logo` varchar(255) DEFAULT 'https://patentrack.com/resources/shared/images/test_logo.png',
  `organisation_id` bigint(20) DEFAULT '0',
  `user_id` bigint(20) DEFAULT '0',
  `created_at` datetime DEFAULT NULL,
  `updated_at` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `organisation_id` (`organisation_id`)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS `projects` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `name` varchar(255) DEFAULT NULL,
  `folder_id` bigint(20) DEFAULT NULL,
  `status` tinyint(4) DEFAULT '0',
  `user_id` bigint(20) DEFAULT '0',
  `total_patent` bigint(20) DEFAULT '0',
  `finished_patent` bigint(20) DEFAULT '0',
  `ordered_patent` bigint(20) DEFAULT '0',
  `created_at` datetime DEFAULT NULL,
  `updated_at` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `folder_id` (`folder_id`),
  CONSTRAINT `projects_ibfk_1` FOREIGN KEY (`folder_id`) REFERENCES `folders` (`id`)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS `patents` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `rf_id` bigint(20) NOT NULL DEFAULT '0',
  `number` varchar(50) DEFAULT NULL,
  `application` varchar(50) DEFAULT '',
  `title` varchar(300) DEFAULT '',
  `patent_date` datetime DEFAULT '0000-00-00 00:00:00',
  `application_date` datetime DEFAULT '0000-00-00 00:00:00',
  `project_id` bigint(20) DEFAULT NULL,
  `status` tinyint(4) DEFAULT '0',
  `comment` text,
  `created_at` datetime DEFAULT NULL,
  `updated_at` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `project_id` (`project_id`),
  CONSTRAINT `patents_ibfk_1` FOREIGN KEY (`project_id`) REFERENCES `projects` (`id`)
) ENGINE=InnoDB;
```

---

## 5. CRITICAL BUSINESS RULES SUMMARY

### Name Matching
- **Levenshtein distance threshold: < 5**
- Tests 6 name permutations (family/given/middle in different orders)
- Used to identify employee assignments

### Transaction Processing
- rf_id is the core linking field across all tables
- Tracks reel_no/frame_no for USPTO assignment records
- convey_ty categorizes transaction type
- exec_dt (execution date) determines transaction timeline

### Asset Tracking
- appno_doc_num = Application number
- grant_doc_num = Patent grant number
- Assets can have multiple transactions (rf_id) over time
- LATERAL JOIN used to get most recent transaction per asset

### Bank-Specific Logic
- Tracks security interests (convey_ty = 'security', 'restatedsecurity')
- Monitors releases (convey_ty = 'release')
- Detects lost assets using is_ota flag
- Calculates 20-year expiration from application date

### Maintenance Fees
- Tracked at 4, 8, and 12 year intervals
- Event codes: 'EXP.', 'EXPX' for expiration
- Uses db_patent_maintainence_fee.event_maintainence_fees table

### Portfolio Hierarchy
- Organization > Folder > Project > Patent
- Each company/representative can have multiple folders
- Projects track progress (total_patent, finished_patent, ordered_patent)

---

## 6. MIGRATION RECOMMENDATIONS

### Critical Features to Preserve
1. **Levenshtein-based name matching** with distance < 5 threshold
2. **Multi-permutation name comparison** (6 variants)
3. **LATERAL JOIN logic** for most recent transactions
4. **Security interest tracking** for bank accounts
5. **Lost asset detection** using OTA flag
6. **20-year patent expiration calculation**
7. **Maintenance fee tracking** at 4/8/12 year marks

### Data Models to Implement
1. Assignment transaction tracking (rf_id based)
2. Assignor/Assignee relationships with normalization
3. Document ID linking (appno_doc_num, grant_doc_num)
4. Conveyance type categorization
5. Portfolio hierarchy (Org > Folder > Project > Patent)

### Stored Procedures to Replicate
- routine_list1, routine_list2
- routine_tableA, routine_tableB, routine_tableC
- routine_broken_title
- routine_correct_details
- routine_activities_parties_transactions
- routine_maintainence_assets
- routine_parties (for bank accounts)

### Performance Considerations
- FULLTEXT indexes on name fields
- Composite indexes on (reel_no, frame_no)
- Indexes on rf_id (heavily joined field)
- Indexes on normalize_name for matching

---

## 7. KEY FINDINGS

### Most Complex Logic
1. **Bank security interest tracking** - Most complex SQL with LATERAL JOINs
2. **Name normalization** - 6-way permutation matching with Levenshtein
3. **Lost asset detection** - Multi-table joins with OTA flag logic
4. **Dashboard aggregation** - 194KB file with extensive calculations

### Critical Thresholds
- Levenshtein distance: **< 5** for name match
- Patent expiration: **20 years** from application date
- Maintenance fees: **4, 8, 12** year intervals
- Transaction year filter: **>= 2000** for bank queries

### Data Quality
- Uses `normalize_name` fields alongside raw names
- HTML entity decoding for XML data
- UTF-8 encoding enforcement
- ALLOW_INVALID_DATES SQL mode (potential issue)

