import { pgTable, serial, text, jsonb, timestamp, real, integer } from 'drizzle-orm/pg-core';

export const transactionTypes = pgTable('transaction_types', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  category: text('category').notNull(),
  description: text('description'),
});

export const dataSources = pgTable('data_sources', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  type: text('type').notNull(),
  config: jsonb('config'),
});

export const ingestionJobs = pgTable('ingestion_jobs', {
  id: serial('id').primaryKey(),
  dataSourceId: integer('data_source_id').notNull().references(() => dataSources.id),
  status: text('status').notNull(),
  progress: real('progress').notNull().default(0),
  errorMessage: text('error_message'),
  recordsProcessed: integer('records_processed'),
  recordsFailed: integer('records_failed'),
  metadata: jsonb('metadata'),
  startedAt: timestamp('started_at'),
  completedAt: timestamp('completed_at'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

export const cpcHierarchy = pgTable('cpc_hierarchy', {
  id: serial('id').primaryKey(),
  code: text('code').notNull().unique(),
  section: text('section'),
  class: text('class'),
  subclass: text('subclass'),
  group: text('group'),
  subgroup: text('subgroup'),
  title: text('title'),
});
