import { pgTable, serial, text, integer } from 'drizzle-orm/pg-core';
import { tenants } from './tenants';
import { patents } from './patents';

export const assetChannels = pgTable('asset_channels', {
  id: serial('id').primaryKey(),
  tenantId: integer('tenant_id').notNull().references(() => tenants.id),
  patentId: integer('patent_id').notNull().references(() => patents.id),
  channel: text('channel').notNull(),
  status: text('status').notNull(),
});
