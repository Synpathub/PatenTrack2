import { pgSchema } from 'drizzle-orm/pg-core';
import { serial, text, integer, jsonb, timestamp, real, boolean } from 'drizzle-orm/pg-core';
import { users } from './tenants';
import { transactions } from './transactions';
import { transactionTypes } from './global';

export const internal = pgSchema('internal');

export const normalizationAuditLog = internal.table('normalization_audit_log', {
  id: serial('id').primaryKey(),
  rawName: text('raw_name').notNull(),
  canonicalName: text('canonical_name').notNull(),
  method: text('method').notNull(),
  confidence: real('confidence'),
  processedAt: timestamp('processed_at').notNull().defaultNow(),
});

export const reclassifyLog = internal.table('reclassify_log', {
  id: serial('id').primaryKey(),
  transactionId: integer('transaction_id').notNull().references(() => transactions.id),
  oldTypeId: integer('old_type_id').notNull().references(() => transactionTypes.id),
  newTypeId: integer('new_type_id').notNull().references(() => transactionTypes.id),
  reason: text('reason'),
  reclassifiedAt: timestamp('reclassified_at').notNull().defaultNow(),
  reclassifiedBy: integer('reclassified_by').references(() => users.id),
});

export const adminAccountProcess = internal.table('admin_account_process', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').notNull().references(() => users.id),
  action: text('action').notNull(),
  details: jsonb('details'),
  processedAt: timestamp('processed_at').notNull().defaultNow(),
});

export const processingFlags = internal.table('processing_flags', {
  id: serial('id').primaryKey(),
  entityType: text('entity_type').notNull(),
  entityId: integer('entity_id').notNull(),
  flagType: text('flag_type').notNull(),
  flagValue: boolean('flag_value').notNull(),
  setAt: timestamp('set_at').notNull().defaultNow(),
});
