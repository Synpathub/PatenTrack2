import { Tenant } from '@patentrack/core';
import { BaseRepository } from './base.repository';
import { tenants } from '../schema/tenants';
import { sql } from 'drizzle-orm';

export class TenantRepository extends BaseRepository<Tenant> {
  constructor() {
    super(tenants);
  }

  async findBySlug(slug: string): Promise<Tenant | null> {
    const results = await this.db
      .select()
      .from(tenants)
      .where(sql`${tenants.slug} = ${slug}`)
      .limit(1);
    
    return (results[0] as Tenant) || null;
  }

  async findByName(name: string): Promise<Tenant | null> {
    const results = await this.db
      .select()
      .from(tenants)
      .where(sql`${tenants.name} = ${name}`)
      .limit(1);
    
    return (results[0] as Tenant) || null;
  }
}
