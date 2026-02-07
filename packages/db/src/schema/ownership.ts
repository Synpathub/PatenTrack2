import { pgTable, serial, text, integer, jsonb, timestamp } from 'drizzle-orm/pg-core';
import { tenants } from './tenants';
import { patents } from './patents';
import { companies } from './entities';

export const titleChains = pgTable('title_chains', {
  id: serial('id').primaryKey(),
  tenantId: integer('tenant_id').notNull().references(() => tenants.id),
  patentId: integer('patent_id').notNull().references(() => patents.id),
  status: text('status').notNull(),
  chain: jsonb('chain').notNull(),
  missingLinks: jsonb('missing_links'),
  reason: text('reason'),
  analyzedAt: timestamp('analyzed_at').notNull(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

export const ownershipTrees = pgTable('ownership_trees', {
  id: serial('id').primaryKey(),
  tenantId: integer('tenant_id').notNull().references(() => tenants.id),
  companyId: integer('company_id').notNull().references(() => companies.id),
  tabId: text('tab_id'),
  treeData: jsonb('tree_data').notNull(),
  transactionCount: integer('transaction_count').notNull().default(0),
  assetsCount: integer('assets_count').notNull().default(0),
  generatedAt: timestamp('generated_at').notNull(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});
