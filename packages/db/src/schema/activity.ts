import { pgTable, serial, text, integer, jsonb, timestamp } from 'drizzle-orm/pg-core';
import { tenants } from './tenants';
import { users } from './tenants';
import { companies } from './entities';
import { patents } from './patents';

export const activities = pgTable('activities', {
  id: serial('id').primaryKey(),
  tenantId: integer('tenant_id').notNull().references(() => tenants.id),
  type: text('type').notNull(),
  subject: text('subject').notNull(),
  subjectType: text('subject_type').notNull(),
  complete: integer('complete').notNull().default(0),
  professionalId: integer('professional_id'),
  assignedTo: integer('assigned_to').references(() => users.id),
  dueDate: timestamp('due_date'),
  priority: text('priority'),
  metadata: jsonb('metadata'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

export const comments = pgTable('comments', {
  id: serial('id').primaryKey(),
  tenantId: integer('tenant_id').notNull().references(() => tenants.id),
  activityId: integer('activity_id').notNull().references(() => activities.id),
  userId: integer('user_id').notNull().references(() => users.id),
  content: text('content').notNull(),
  editedAt: timestamp('edited_at'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

export const timelines = pgTable('timelines', {
  id: serial('id').primaryKey(),
  tenantId: integer('tenant_id').notNull().references(() => tenants.id),
  companyId: integer('company_id').references(() => companies.id),
  patentId: integer('patent_id').references(() => patents.id),
  eventDate: timestamp('event_date').notNull(),
  eventType: text('event_type').notNull(),
  patentNumber: text('patent_number'),
  title: text('title'),
  description: text('description'),
  metadata: jsonb('metadata'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

export const dashboardItems = pgTable('dashboard_items', {
  id: serial('id').primaryKey(),
  tenantId: integer('tenant_id').notNull().references(() => tenants.id),
  userId: integer('user_id').notNull().references(() => users.id),
  itemType: text('item_type').notNull(),
  itemId: integer('item_id').notNull(),
  position: integer('position').notNull().default(0),
});
