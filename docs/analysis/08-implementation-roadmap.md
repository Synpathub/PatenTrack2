# 08 - Implementation Roadmap

**Phased migration plan with specific file mappings: Legacy → PatenTrack2**

---

## Overview

**Timeline:** 12 weeks to feature parity  
**Approach:** Incremental migration, phase-by-phase  
**Strategy:** Database → Business Logic → API → Frontend

---

## Phase 1: Database Schema Completion
**Duration:** Weeks 1-2  
**Goal:** Complete all missing database tables in Drizzle ORM

### Tasks

#### 1.1 Application Tables (22 tables)
**Files to create:** `packages/db/src/schema/application/*.ts`

| Legacy Sequelize Model | New Drizzle Schema | Priority |
|------------------------|-------------------|----------|
| model/application/Assets.js | patents.ts (extend existing) | 🔴 CRITICAL |
| model/application/AssetsForSale.js | assets-for-sale.ts | 🟡 HIGH |
| model/application/AssetsTransfer.js | asset-transfers.ts | 🟡 HIGH |
| model/application/Assignments.js | assignments.ts | 🔴 CRITICAL |
| model/application/Assignors.js | assignment-parties.ts | 🔴 CRITICAL |
| model/application/Assignees.js | assignment-parties.ts | 🔴 CRITICAL |
| model/application/CitedPatents.js | patents.ts (add citations) | 🟡 HIGH |
| model/application/Dashboards.js | dashboards.ts | 🔴 CRITICAL |
| model/application/DocumentIds.js | patent-documents.ts | 🟢 MEDIUM |
| model/application/Errors.js | processing-errors.ts | 🟢 LOW |
| model/application/Layouts.js | ui-layouts.ts | 🟤 LOW |
| model/application/OrganisationApplication.js | tenants.ts (extend) | 🔴 CRITICAL |
| model/application/Representatives.js | patent-attorneys.ts | 🟡 HIGH |
| model/application/Repository.js | document-repository.ts | 🟢 MEDIUM |
| model/application/ShareLinkDetails.js | sharing.ts (extend) | 🟡 HIGH |
| model/application/Templates.js | templates.ts | 🟤 LOW |
| model/application/Timelines.js | patent-timelines.ts | 🔴 CRITICAL |
| model/application/Validity.ts | patent-validity.ts | 🔴 CRITICAL |

**Implementation Example:**
```typescript
// packages/db/src/schema/assignments.ts
import { pgTable, uuid, text, timestamp, integer, varchar } from 'drizzle-orm/pg-core';

export const assignments = pgTable('assignments', {
  id: uuid('id').defaultRandom().primaryKey(),
  patentId: uuid('patent_id').references(() => patents.id),
  conveyanceText: text('conveyance_text'),
  recordedDate: timestamp('recorded_date'),
  executionDate: timestamp('execution_date'),
  reelFrame: varchar('reel_frame', { length: 20 }),
  assignmentType: varchar('assignment_type', { length: 50 }),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow()
});

export const assignmentParties = pgTable('assignment_parties', {
  id: uuid('id').defaultRandom().primaryKey(),
  assignmentId: uuid('assignment_id').references(() => assignments.id),
  partyType: varchar('party_type', { length: 20 }), // 'assignor' | 'assignee'
  entityName: text('entity_name'),
  normalizedName: text('normalized_name'), // From normalize_names algorithm
  addressLine1: varchar('address_line1', { length: 255 }),
  city: varchar('city', { length: 100 }),
  state: varchar('state', { length: 50 }),
  country: varchar('country', { length: 2 })
});
```

#### 1.2 Client Tables (18 tables)
**Files to create:** `packages/db/src/schema/tenant/*.ts`

| Legacy Model | New Schema | Priority |
|--------------|-----------|----------|
| model/client/Activities.js | tenant-activities.ts | 🟡 HIGH |
| model/client/Address.js | addresses.ts | 🟡 HIGH |
| model/client/Comments.js | comments.ts | 🟡 HIGH |
| model/client/Companies.js | entities.ts (extend) | 🔴 CRITICAL |
| model/client/Collections.js | collections.ts | 🟢 MEDIUM |
| model/client/Documents.js | tenant-documents.ts | 🟡 HIGH |
| model/client/Lawfirm.js | law-firms.ts | 🟢 MEDIUM |
| model/client/Professionals.js | patent-professionals.ts | 🟢 MEDIUM |
| model/client/Users.js | tenants.ts (users table) | 🔴 CRITICAL |

#### 1.3 Indexes & Constraints
```sql
-- Add to migration files
CREATE INDEX idx_assignments_patent_id ON assignments(patent_id);
CREATE INDEX idx_assignments_recorded_date ON assignments(recorded_date);
CREATE INDEX idx_assignment_parties_normalized_name ON assignment_parties(normalized_name);
CREATE INDEX idx_patent_timelines_patent_id ON patent_timelines(patent_id);
CREATE INDEX idx_patent_timelines_event_date ON patent_timelines(event_date);

-- Full-text search indexes
CREATE INDEX idx_patents_title_search ON patents USING gin(to_tsvector('english', title));
CREATE INDEX idx_patents_abstract_search ON patents USING gin(to_tsvector('english', abstract));
```

#### 1.4 Migration Scripts
```bash
# Generate migration
pnpm --filter @patentrack/db db:generate

# Apply migration
pnpm --filter @patentrack/db db:push

# Seed test data
pnpm --filter @patentrack/db db:seed
```

---

## Phase 2: Business Logic Porting
**Duration:** Weeks 3-4  
**Goal:** Port critical algorithms from legacy to TypeScript

### Tasks

#### 2.1 Name Normalization (CRITICAL)
**Port from:** `script_patent_application_bibliographic/normalize_names.js`  
**Create:** `packages/processing/src/algorithms/name-normalization.ts`

```typescript
// packages/processing/src/algorithms/name-normalization.ts
import levenshtein from 'fastest-levenshtein';

export interface NameParts {
  family: string;
  given: string;
  middle: string;
}

export interface MatchResult {
  match: boolean;
  distance: number;
  perm1?: string;
  perm2?: string;
}

export function normalizeName(name: string): string {
  // Remove suffixes: Jr, Sr, III, IV, PhD, Esq
  name = name.replace(/\b(Jr\.?|Sr\.?|III?|IV|PhD|Esq\.?)\b/gi, '');
  // Remove punctuation
  name = name.replace(/[.,\-]/g, ' ');
  // Normalize whitespace
  name = name.replace(/\s+/g, ' ').trim();
  // Uppercase
  return name.toUpperCase();
}

export function splitName(name: string): NameParts {
  const parts = normalizeName(name).split(' ');
  return {
    family: parts[parts.length - 1] || '',
    given: parts[0] || '',
    middle: parts.slice(1, -1).join(' ') || ''
  };
}

export function generatePermutations(parts: NameParts): string[] {
  const { family, given, middle } = parts;
  const perms = [
    `${family} ${given} ${middle}`,
    `${family} ${middle} ${given}`,
    `${given} ${middle} ${family}`,
    `${given} ${family} ${middle}`,
    `${middle} ${given} ${family}`,
    `${middle} ${family} ${given}`
  ];
  return perms.map(p => p.replace(/\s+/g, ' ').trim()).filter(p => p.length > 0);
}

export function matchNames(
  name1: string,
  name2: string,
  threshold: number = 5
): MatchResult {
  const parts1 = splitName(name1);
  const parts2 = splitName(name2);
  
  const perms1 = generatePermutations(parts1);
  const perms2 = generatePermutations(parts2);
  
  for (const p1 of perms1) {
    for (const p2 of perms2) {
      const distance = levenshtein.distance(p1, p2);
      if (distance < threshold) {
        return { match: true, distance, perm1: p1, perm2: p2 };
      }
    }
  }
  
  return { match: false, distance: Infinity };
}

// Unit tests
describe('Name Normalization', () => {
  test('matches names with initials', () => {
    const result = matchNames('John A. Smith Jr.', 'Smith, John Andrew');
    expect(result.match).toBe(true);
    expect(result.distance).toBeLessThan(5);
  });
  
  test('matches permutations', () => {
    const result = matchNames('Smith, John', 'John Smith');
    expect(result.match).toBe(true);
  });
  
  test('rejects non-matches', () => {
    const result = matchNames('John Smith', 'Jane Doe');
    expect(result.match).toBe(false);
  });
});
```

**Tests:** Use real USPTO data samples from `script_patent_application_bibliographic/test_data/`

#### 2.2 Patent Expiration Logic
**Port from:** `uspto-data-sync/calculate_expirations.php`  
**Create:** `packages/processing/src/algorithms/expiration-calculator.ts`

```typescript
// packages/processing/src/algorithms/expiration-calculator.ts
import { addYears } from 'date-fns';

export interface MaintenanceFee {
  dueDate: Date;
  feeYear: 4 | 8 | 12;
  paid: boolean;
  paidDate?: Date;
}

export interface ExpirationResult {
  expirationDate: Date;
  daysUntilExpiration: number;
  expired: boolean;
  reason: 'natural' | 'fee_unpaid';
  maintenanceFees: MaintenanceFee[];
}

export function calculateExpiration(
  filingDate: Date,
  grantDate: Date,
  maintenanceFees: MaintenanceFee[]
): ExpirationResult {
  // 20-year rule from filing date
  const naturalExpiration = addYears(filingDate, 20);
  
  // Check maintenance fees (due at 3.5, 7.5, 11.5 years from grant)
  const fee4 = addYears(grantDate, 4);
  const fee8 = addYears(grantDate, 8);
  const fee12 = addYears(grantDate, 12);
  
  const now = new Date();
  
  // Check if any fees unpaid past due date
  for (const fee of maintenanceFees) {
    if (!fee.paid && fee.dueDate < now) {
      // Patent expired due to non-payment
      return {
        expirationDate: fee.dueDate,
        daysUntilExpiration: Math.floor((fee.dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)),
        expired: true,
        reason: 'fee_unpaid',
        maintenanceFees
      };
    }
  }
  
  // Natural expiration
  const daysUntil = Math.floor((naturalExpiration.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  
  return {
    expirationDate: naturalExpiration,
    daysUntilExpiration: daysUntil,
    expired: daysUntil < 0,
    reason: 'natural',
    maintenanceFees
  };
}
```

#### 2.3 Dashboard Aggregations
**Port from:** `uspto-data-sync/dashboard_with_company.php`  
**Create:** `packages/db/src/repositories/dashboard-repository.ts`

```typescript
// packages/db/src/repositories/dashboard-repository.ts
export class DashboardRepository extends BaseRepository {
  
  // Port: sp_get_latest_transaction
  async getLatestTransactions(tenantId: string) {
    // Implement LATERAL JOIN pattern in Drizzle
    return await this.db
      .select()
      .from(patents)
      .leftJoin(
        // Drizzle lateral join equivalent
        sql`LATERAL (
          SELECT * FROM ${assignments}
          WHERE ${assignments.patentId} = ${patents.id}
          ORDER BY ${assignments.recordedDate} DESC
          LIMIT 1
        ) AS latest_txn ON true`
      )
      .where(eq(patents.tenantId, tenantId));
  }
  
  // Port: sp_bank_security_interests
  async getBankSecurityInterests(tenantId: string) {
    // Implement OTA flag tracking
    return await this.db
      .select()
      .from(assignments)
      .where(
        and(
          eq(patents.tenantId, tenantId),
          or(
            like(assignments.conveyanceText, '%SECURITY INTEREST%'),
            like(assignments.conveyanceText, '%SECURITY AGREEMENT%'),
            eq(assignments.assignmentType, 'SECURITY_INTEREST')
          )
        )
      );
  }
  
  // Port: sp_family_tree (recursive CTE)
  async getFamilyTree(rootPatentId: string) {
    return await this.db.execute(sql`
      WITH RECURSIVE family AS (
        SELECT id, parent_patent_id, relationship_type, 1 as depth
        FROM ${patents}
        WHERE id = ${rootPatentId}
        
        UNION ALL
        
        SELECT p.id, p.parent_patent_id, p.relationship_type, f.depth + 1
        FROM ${patents} p
        INNER JOIN family f ON p.parent_patent_id = f.id
        WHERE f.depth < 10
      )
      SELECT * FROM family;
    `);
  }
}
```

---

## Phase 3: API Endpoint Implementation
**Duration:** Weeks 5-7  
**Goal:** Implement 100+ critical REST endpoints

### Tasks

#### 3.1 Assets API
**Create:** `packages/api/src/routes/assets.ts`

```typescript
// packages/api/src/routes/assets.ts
import { FastifyInstance } from 'fastify';

export default async function assetsRoutes(fastify: FastifyInstance) {
  
  // GET /api/v1/assets - List patents
  fastify.get('/api/v1/assets', {
    onRequest: [fastify.authenticate],
    schema: {
      querystring: {
        type: 'object',
        properties: {
          page: { type: 'number', default: 1 },
          limit: { type: 'number', default: 50 },
          search: { type: 'string' },
          status: { type: 'string', enum: ['active', 'expired', 'pending'] }
        }
      }
    }
  }, async (request, reply) => {
    const { page, limit, search, status } = request.query;
    const { tenantId } = request.user;
    
    const patents = await fastify.patentRepository.findByTenant(
      tenantId,
      { page, limit, search, status }
    );
    
    return { data: patents, page, total: patents.length };
  });
  
  // GET /api/v1/assets/:id - Get asset detail
  fastify.get('/api/v1/assets/:id', {
    onRequest: [fastify.authenticate],
    schema: {
      params: {
        type: 'object',
        required: ['id'],
        properties: {
          id: { type: 'string', format: 'uuid' }
        }
      }
    }
  }, async (request, reply) => {
    const { id } = request.params;
    const { tenantId } = request.user;
    
    const patent = await fastify.patentRepository.findById(id, tenantId);
    
    if (!patent) {
      return reply.code(404).send({ error: 'Patent not found' });
    }
    
    return { data: patent };
  });
  
  // POST /api/v1/assets - Create patent
  fastify.post('/api/v1/assets', {
    onRequest: [fastify.authenticate, fastify.requireRole('admin')],
    schema: {
      body: {
        type: 'object',
        required: ['patentNumber', 'title'],
        properties: {
          patentNumber: { type: 'string' },
          title: { type: 'string' },
          abstract: { type: 'string' },
          filingDate: { type: 'string', format: 'date' },
          grantDate: { type: 'string', format: 'date' }
        }
      }
    }
  }, async (request, reply) => {
    const { tenantId } = request.user;
    const patentData = request.body;
    
    const created = await fastify.patentRepository.create({
      ...patentData,
      tenantId
    });
    
    return reply.code(201).send({ data: created });
  });
  
  // GET /api/v1/assets/:id/family - Get family tree
  fastify.get('/api/v1/assets/:id/family', {
    onRequest: [fastify.authenticate]
  }, async (request, reply) => {
    const { id } = request.params;
    const { tenantId } = request.user;
    
    const family = await fastify.dashboardRepository.getFamilyTree(id);
    
    return { data: family };
  });
}
```

**Endpoints to implement (from legacy):**
```typescript
// Map: routes/application/assets.js → packages/api/src/routes/assets.ts
✅ GET    /api/v1/assets
✅ GET    /api/v1/assets/:id
✅ POST   /api/v1/assets
✅ PUT    /api/v1/assets/:id
✅ DELETE /api/v1/assets/:id
✅ GET    /api/v1/assets/:id/family
✅ GET    /api/v1/assets/:id/transactions
✅ GET    /api/v1/assets/:id/events
✅ GET    /api/v1/assets/:id/documents
```

#### 3.2 Dashboards API
**Map:** `routes/application/dashboards.js` → `packages/api/src/routes/dashboards.ts`

```typescript
// GET /api/v1/dashboards
fastify.get('/api/v1/dashboards', {
  onRequest: [fastify.authenticate]
}, async (request, reply) => {
  const { tenantId } = request.user;
  
  // Call all dashboard aggregation methods
  const [
    portfolioMetrics,
    filingTrends,
    technologyBreakdown,
    assigneeRankings,
    expiringPatents,
    bankSecurities
  ] = await Promise.all([
    fastify.dashboardRepository.getPortfolioMetrics(tenantId),
    fastify.dashboardRepository.getFilingTrends(tenantId),
    fastify.dashboardRepository.getTechnologyBreakdown(tenantId),
    fastify.dashboardRepository.getAssigneeRankings(tenantId),
    fastify.dashboardRepository.getExpiringPatents(tenantId, 180), // 6 months
    fastify.dashboardRepository.getBankSecurityInterests(tenantId)
  ]);
  
  return {
    data: {
      portfolioMetrics,
      filingTrends,
      technologyBreakdown,
      assigneeRankings,
      expiringPatents,
      bankSecurities
    }
  };
});
```

#### 3.3 Additional Routes
**Files to create:**
- `packages/api/src/routes/events.ts` (← `routes/application/events.js`)
- `packages/api/src/routes/family.ts` (← `routes/application/family.js`)
- `packages/api/src/routes/search.ts` (← `routes/application/search.js`)
- `packages/api/src/routes/transactions.ts` (← `routes/application/transactions.js`)
- `packages/api/src/routes/documents.ts` (← `routes/client/documents.js`)
- `packages/api/src/routes/collections.ts` (← `routes/client/collections.js`)
- `packages/api/src/routes/comments.ts` (← `routes/client/comments.js`)

---

## Phase 4: Frontend Feature Parity
**Duration:** Weeks 8-10  
**Goal:** Implement all major UI components

### Tasks

#### 4.1 Dashboard UI
**Port from:** `PT-App/src/components/Dashboard/`  
**Create in:** `apps/web-customer/src/components/Dashboard/`

```typescript
// apps/web-customer/src/components/Dashboard/PortfolioMetrics.tsx
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, Typography, Grid } from '@mui/material';

export function PortfolioMetrics() {
  const { data, isLoading } = useQuery({
    queryKey: ['dashboards'],
    queryFn: () => apiClient.get('/api/v1/dashboards').then(res => res.data.data)
  });
  
  if (isLoading) return <Loading />;
  
  const { portfolioMetrics } = data;
  
  return (
    <Grid container spacing={3}>
      <Grid item xs={12} sm={6} md={3}>
        <Card>
          <CardContent>
            <Typography variant="h6">Total Patents</Typography>
            <Typography variant="h3">{portfolioMetrics.totalPatents}</Typography>
          </CardContent>
        </Card>
      </Grid>
      
      <Grid item xs={12} sm={6} md={3}>
        <Card>
          <CardContent>
            <Typography variant="h6">Active Patents</Typography>
            <Typography variant="h3">{portfolioMetrics.activePatents}</Typography>
          </CardContent>
        </Card>
      </Grid>
      
      {/* More metrics... */}
    </Grid>
  );
}
```

#### 4.2 Family Tree Visualization
**Port from:** `PT-App/src/components/Family/FamilyTree.jsx`  
**Create:** `apps/web-customer/src/components/Family/FamilyTreeD3.tsx`

```typescript
// apps/web-customer/src/components/Family/FamilyTreeD3.tsx
import { useEffect, useRef } from 'react';
import * as d3 from 'd3';

interface Patent {
  id: string;
  patentNumber: string;
  title: string;
  children?: Patent[];
}

interface Props {
  rootPatentId: string;
}

export function FamilyTreeD3({ rootPatentId }: Props) {
  const svgRef = useRef<SVGSVGElement>(null);
  
  const { data: familyData } = useQuery({
    queryKey: ['family', rootPatentId],
    queryFn: () => apiClient.get(`/api/v1/assets/${rootPatentId}/family`)
      .then(res => res.data.data)
  });
  
  useEffect(() => {
    if (!familyData || !svgRef.current) return;
    
    const svg = d3.select(svgRef.current);
    const width = 800;
    const height = 600;
    
    svg.attr('width', width).attr('height', height);
    
    const tree = d3.tree<Patent>().size([height, width - 160]);
    const root = d3.hierarchy(familyData);
    const nodes = tree(root);
    
    // Draw links
    svg.selectAll('.link')
      .data(nodes.links())
      .enter()
      .append('path')
      .attr('class', 'link')
      .attr('d', d3.linkHorizontal()
        .x(d => d.y)
        .y(d => d.x)
      )
      .style('fill', 'none')
      .style('stroke', '#ccc');
    
    // Draw nodes
    const node = svg.selectAll('.node')
      .data(nodes.descendants())
      .enter()
      .append('g')
      .attr('class', 'node')
      .attr('transform', d => `translate(${d.y},${d.x})`);
    
    node.append('circle')
      .attr('r', 5)
      .style('fill', '#69b3a2');
    
    node.append('text')
      .attr('dy', 3)
      .attr('x', d => d.children ? -8 : 8)
      .style('text-anchor', d => d.children ? 'end' : 'start')
      .text(d => d.data.patentNumber);
      
  }, [familyData]);
  
  return <svg ref={svgRef} />;
}
```

#### 4.3 Component Mapping

| Legacy Component | New Component | Library | Priority |
|------------------|---------------|---------|----------|
| Dashboard/DashboardHome.jsx | Dashboard/DashboardHome.tsx | MUI | 🔴 CRITICAL |
| Assets/AssetList.jsx | Assets/AssetGrid.tsx | TanStack Table | 🔴 CRITICAL |
| Family/FamilyTree.jsx | Family/FamilyTreeD3.tsx | D3.js | 🟡 HIGH |
| Events/EventTimeline.jsx | Events/TimelineVisualization.tsx | vis-timeline | 🟡 HIGH |
| Charts/FilingLineChart.jsx | Charts/FilingTrends.tsx | Chart.js | 🟡 HIGH |
| Charts/TechnologyWordCloud.jsx | Charts/TechnologyCloud.tsx | react-wordcloud | 🟢 MEDIUM |
| Documents/DocumentLibrary.jsx | Documents/DocumentGrid.tsx | MUI | 🟢 MEDIUM |
| Comments/Comments.jsx | Collaboration/Comments.tsx | MUI | 🟢 MEDIUM |
| Collections/Collections.jsx | Collections/CollectionManager.tsx | MUI | 🟢 MEDIUM |

---

## Phase 5: External Integrations
**Duration:** Week 11  
**Goal:** Implement Slack, Google, Microsoft, AWS integrations

### Tasks

#### 5.1 Google Sheets Export
**Port from:** `routes/client/google_sheets.js`  
**Create:** `packages/api/src/integrations/google-sheets.ts`

```typescript
// packages/api/src/integrations/google-sheets.ts
import { google } from 'googleapis';

export class GoogleSheetsService {
  private sheets = google.sheets('v4');
  
  async exportPatents(tenantId: string, patentIds: string[]) {
    const auth = await this.getAuthClient(tenantId);
    
    // Create new spreadsheet
    const spreadsheet = await this.sheets.spreadsheets.create({
      auth,
      requestBody: {
        properties: { title: `Patent Export - ${new Date().toISOString()}` }
      }
    });
    
    // Fetch patent data
    const patents = await fastify.patentRepository.findByIds(patentIds, tenantId);
    
    // Format as rows
    const rows = [
      ['Patent Number', 'Title', 'Filing Date', 'Grant Date', 'Status'],
      ...patents.map(p => [p.patentNumber, p.title, p.filingDate, p.grantDate, p.status])
    ];
    
    // Write to sheet
    await this.sheets.spreadsheets.values.update({
      auth,
      spreadsheetId: spreadsheet.data.spreadsheetId!,
      range: 'Sheet1!A1',
      valueInputOption: 'RAW',
      requestBody: { values: rows }
    });
    
    return spreadsheet.data.spreadsheetUrl;
  }
}
```

#### 5.2 Slack Notifications
**Create:** `packages/api/src/integrations/slack.ts`

#### 5.3 AWS S3 Documents
**Create:** `packages/api/src/integrations/s3.ts`

---

## Phase 6: Testing & Cutover
**Duration:** Week 12  
**Goal:** Full testing, data migration, go-live

### Tasks

#### 6.1 Unit Tests
```bash
# Test coverage goals
packages/db/               > 80%
packages/api/              > 75%
packages/processing/       > 90% (critical algorithms)
apps/web-customer/         > 60%
```

#### 6.2 Integration Tests
```typescript
// packages/api/src/__tests__/integration/assets.test.ts
describe('Assets API', () => {
  test('GET /api/v1/assets requires auth', async () => {
    const response = await app.inject({
      method: 'GET',
      url: '/api/v1/assets'
    });
    expect(response.statusCode).toBe(401);
  });
  
  test('GET /api/v1/assets returns paginated results', async () => {
    const response = await app.inject({
      method: 'GET',
      url: '/api/v1/assets?page=1&limit=10',
      headers: { 'x-auth-token': testToken }
    });
    expect(response.statusCode).toBe(200);
    expect(response.json().data).toHaveLength(10);
  });
});
```

#### 6.3 Data Migration
```bash
# 1. Export legacy data
node scripts/export-legacy-data.js --output=/tmp/legacy-export.json

# 2. Transform and validate
node scripts/transform-legacy-data.js --input=/tmp/legacy-export.json --output=/tmp/transformed.json

# 3. Import into PatenTrack2
pnpm --filter @patentrack/db migrate:import --file=/tmp/transformed.json

# 4. Validate
pnpm --filter @patentrack/db migrate:validate
```

#### 6.4 Go-Live Checklist
```
☐ All 58 database tables migrated
☐ All 250+ API endpoints implemented
☐ 100+ frontend components ported
☐ Name normalization algorithm validated
☐ Dashboard aggregations tested
☐ Family tree algorithm verified
☐ External integrations configured
☐ Production environment provisioned
☐ SSL certificates installed
☐ DNS configured
☐ Monitoring/alerting active
☐ Backup strategy implemented
☐ Rollback plan documented
☐ Customer training complete
☐ Support runbook prepared
```

---

## File Mapping Reference

### Complete Legacy → PatenTrack2 Mapping

#### Backend (PT-API → packages/api)
```
routes/application/assets.js          → src/routes/assets.ts
routes/application/dashboards.js      → src/routes/dashboards.ts
routes/application/events.js          → src/routes/events.ts
routes/application/family.js          → src/routes/family.ts
routes/application/search.js          → src/routes/search.ts
routes/business/login.js              → src/routes/auth.ts (extended)
routes/business/admin_customers.js    → src/routes/admin/customers.ts
routes/client/customers.js            → src/routes/customers.ts
routes/client/documents.js            → src/routes/documents.ts
routes/client/collections.js          → src/routes/collections.ts
routes/client/comments.js             → src/routes/comments.ts
```

#### Database (model/ → packages/db/src/schema/)
```
model/application/*.js                → schema/application/*.ts
model/business/*.js                   → schema/tenants.ts (consolidated)
model/client/*.js                     → schema/tenant/*.ts
```

#### Processing (scripts → packages/processing)
```
normalize_names.js                    → src/algorithms/name-normalization.ts
inventor_levenshtein.js               → src/algorithms/entity-matching.ts
old_xml.js                            → src/parsers/uspto-xml-v25.ts
new_xml_parser.js                     → src/parsers/uspto-xml-v45.ts
dashboard_with_company.php            → src/aggregations/dashboard-generator.ts
```

#### Frontend (PT-App → apps/web-customer)
```
src/components/Dashboard/             → src/components/Dashboard/
src/components/Assets/                → src/components/Assets/
src/components/Family/                → src/components/Family/
src/components/Charts/                → src/components/Charts/
src/api/client.js                     → src/lib/api-client.ts
```

---

## Success Metrics

| Metric | Target | Measurement |
|--------|--------|-------------|
| Feature Parity | 95%+ | Features implemented vs legacy |
| Performance | < 500ms p95 | API response times |
| Test Coverage | > 75% | Jest coverage report |
| Type Safety | 100% | Zero TypeScript `any` types |
| Migration Success | 100% | Data validation pass rate |
| Uptime | 99.9% | Production availability |

---

## Risk Mitigation

| Risk | Mitigation |
|------|------------|
| Data loss during migration | Blue-green deployment with rollback |
| Performance degradation | Load testing before cutover |
| Missing features discovered | Feature flag system for gradual rollout |
| User adoption issues | Parallel legacy system for 2 weeks |
| Technical debt accumulation | Code review + automated linting |

---

**END OF ROADMAP**
