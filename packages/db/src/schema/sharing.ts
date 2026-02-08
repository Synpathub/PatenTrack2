import { pgTable, serial, text, integer, timestamp, boolean } from 'drizzle-orm/pg-core';
import { tenants } from './tenants';
import { users } from './tenants';

export const shareLinks = pgTable('share_links', {
  id: serial('id').primaryKey(),
  tenantId: integer('tenant_id').notNull().references(() => tenants.id),
  code: text('code').notNull().unique(),
  createdById: integer('created_by_id').notNull().references(() => users.id),
  type: integer('type').notNull(),
  resourceType: text('resource_type'),
  resourceId: integer('resource_id'),
  expiresAt: timestamp('expires_at'),
  showOtherCompanies: boolean('show_other_companies').notNull().default(false),
  accessCount: integer('access_count').notNull().default(0),
  lastAccessedAt: timestamp('last_accessed_at'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

export const shareLinkItems = pgTable('share_link_items', {
  id: serial('id').primaryKey(),
  shareLinkId: integer('share_link_id').notNull().references(() => shareLinks.id),
  itemType: text('item_type').notNull(),
  itemId: integer('item_id').notNull(),
});

export const shareLinkAccessLog = pgTable('share_link_access_log', {
  id: serial('id').primaryKey(),
  shareLinkId: integer('share_link_id').notNull().references(() => shareLinks.id),
  accessedAt: timestamp('accessed_at').notNull().defaultNow(),
  ipAddress: text('ip_address'),
  userAgent: text('user_agent'),
});
