import { pgTable, serial, text, integer, timestamp, boolean, real } from 'drizzle-orm/pg-core';
import { tenants } from './tenants';

export const entities = pgTable('entities', {
  id: serial('id').primaryKey(),
  canonicalName: text('canonical_name').notNull(),
  domain: text('domain'),
  logoUrl: text('logo_url'),
  entityType: text('entity_type').notNull(),
  website: text('website'),
  headquarters: text('headquarters'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

export const companies = pgTable('companies', {
  id: serial('id').primaryKey(),
  tenantId: integer('tenant_id').notNull().references(() => tenants.id),
  name: text('name').notNull(),
  entityId: integer('entity_id').references(() => entities.id),
  status: text('status').notNull().default('active'),
  description: text('description'),
  website: text('website'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

export const entityNameVariants = pgTable('entity_name_variants', {
  id: serial('id').primaryKey(),
  entityId: integer('entity_id').notNull().references(() => entities.id),
  rawName: text('raw_name').notNull(),
  source: text('source').notNull(),
  normalizedBy: text('normalized_by'),
  confidence: real('confidence'),
  isVerified: boolean('is_verified').notNull().default(false),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});
