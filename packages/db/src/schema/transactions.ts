import { pgTable, serial, text, integer, timestamp } from 'drizzle-orm/pg-core';
import { tenants } from './tenants';
import { patents } from './patents';
import { entities } from './entities';
import { transactionTypes } from './global';

export const transactions = pgTable('transactions', {
  id: serial('id').primaryKey(),
  tenantId: integer('tenant_id').notNull().references(() => tenants.id),
  patentId: integer('patent_id').notNull().references(() => patents.id),
  reelNo: text('reel_no'),
  frameNo: text('frame_no'),
  conveyanceText: text('conveyance_text'),
  typeId: integer('type_id').notNull().references(() => transactionTypes.id),
  recordDate: timestamp('record_date'),
  executionDate: timestamp('execution_date'),
  pagesScanned: integer('pages_scanned'),
  correspondenceAddress: text('correspondence_address'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

export const transactionParties = pgTable('transaction_parties', {
  id: serial('id').primaryKey(),
  transactionId: integer('transaction_id').notNull().references(() => transactions.id),
  entityId: integer('entity_id').references(() => entities.id),
  role: text('role').notNull(),
  rawName: text('raw_name').notNull(),
  normalizedName: text('normalized_name'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});
