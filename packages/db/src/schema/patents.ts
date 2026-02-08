import { pgTable, serial, text, integer, timestamp } from 'drizzle-orm/pg-core';
import { tenants } from './tenants';
import { companies } from './entities';

export const patents = pgTable('patents', {
  id: serial('id').primaryKey(),
  tenantId: integer('tenant_id').notNull().references(() => tenants.id),
  applicationNum: text('application_num').notNull(),
  grantNum: text('grant_num'),
  title: text('title').notNull(),
  abstract: text('abstract'),
  filingDate: timestamp('filing_date').notNull(),
  grantDate: timestamp('grant_date'),
  expirationDate: timestamp('expiration_date'),
  status: text('status').notNull(),
  companyId: integer('company_id').references(() => companies.id),
  cpcCodes: text('cpc_codes').array(),
  claims: text('claims'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

export const inventors = pgTable('inventors', {
  id: serial('id').primaryKey(),
  patentId: integer('patent_id').notNull().references(() => patents.id),
  name: text('name').notNull(),
  deduplicatedId: integer('deduplicated_id'),
  city: text('city'),
  state: text('state'),
  country: text('country'),
  sequence: integer('sequence'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

export const patentFamilies = pgTable('patent_families', {
  id: serial('id').primaryKey(),
  patentId: integer('patent_id').notNull().references(() => patents.id),
  familyId: text('family_id').notNull(),
});

export const citedPatents = pgTable('cited_patents', {
  id: serial('id').primaryKey(),
  patentId: integer('patent_id').notNull().references(() => patents.id),
  citedPatentId: integer('cited_patent_id').notNull().references(() => patents.id),
  citationType: text('citation_type'),
});
