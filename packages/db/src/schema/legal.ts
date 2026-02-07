import { pgTable, serial, text, timestamp } from 'drizzle-orm/pg-core';
import { integer } from 'drizzle-orm/pg-core';

export const lawFirms = pgTable('law_firms', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  city: text('city'),
  state: text('state'),
  country: text('country'),
  website: text('website'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

export const attorneys = pgTable('attorneys', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  registrationNumber: text('registration_number'),
  lawFirmId: integer('law_firm_id').references(() => lawFirms.id),
  email: text('email'),
  phone: text('phone'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});
