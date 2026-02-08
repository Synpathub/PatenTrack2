import { pgTable, serial, text, integer, timestamp } from 'drizzle-orm/pg-core';
import { tenants } from './tenants';
import { users } from './tenants';
import { companies, entities } from './entities';
import { activities } from './activity';
import { lawFirms } from './legal';

export const userCompanySelections = pgTable('user_company_selections', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').notNull().references(() => users.id),
  companyId: integer('company_id').notNull().references(() => companies.id),
  selectedAt: timestamp('selected_at').notNull().defaultNow(),
});

export const userActivitySelections = pgTable('user_activity_selections', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').notNull().references(() => users.id),
  activityId: integer('activity_id').notNull().references(() => activities.id),
  selectedAt: timestamp('selected_at').notNull().defaultNow(),
});

export const tenantFirms = pgTable('tenant_firms', {
  id: serial('id').primaryKey(),
  tenantId: integer('tenant_id').notNull().references(() => tenants.id),
  lawFirmId: integer('law_firm_id').notNull().references(() => lawFirms.id),
});

export const professionals = pgTable('professionals', {
  id: serial('id').primaryKey(),
  tenantId: integer('tenant_id').notNull().references(() => tenants.id),
  name: text('name').notNull(),
  firmId: integer('firm_id').references(() => tenantFirms.id),
});

export const documents = pgTable('documents', {
  id: serial('id').primaryKey(),
  tenantId: integer('tenant_id').notNull().references(() => tenants.id),
  name: text('name').notNull(),
  fileKey: text('file_key').notNull(),
  uploadedBy: integer('uploaded_by').notNull().references(() => users.id),
  uploadedAt: timestamp('uploaded_at').notNull().defaultNow(),
});

export const telephone = pgTable('telephone', {
  id: serial('id').primaryKey(),
  tenantId: integer('tenant_id').notNull().references(() => tenants.id),
  entityId: integer('entity_id').notNull().references(() => entities.id),
  number: text('number').notNull(),
});
