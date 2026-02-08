import { Company } from '@patentrack/core';
import { BaseRepository } from './base.repository';
import { companies } from '../schema/entities';
import { sql } from 'drizzle-orm';

export class CompanyRepository extends BaseRepository<Company> {
  constructor() {
    super(companies);
  }

  async findByTenant(tenantId: number): Promise<Company[]> {
    return this.db
      .select()
      .from(companies)
      .where(sql`${companies.tenantId} = ${tenantId}`) as any;
  }

  async findByName(name: string, tenantId?: number): Promise<Company | null> {
    let query = this.db
      .select()
      .from(companies)
      .where(sql`${companies.name} = ${name}`);

    if (tenantId) {
      query = (query as any).where(sql`${companies.tenantId} = ${tenantId}`);
    }

    const results = await query.limit(1);
    return (results[0] as Company) || null;
  }

  async findByStatus(status: string, tenantId: number): Promise<Company[]> {
    return this.db
      .select()
      .from(companies)
      .where(sql`${companies.status} = ${status} AND ${companies.tenantId} = ${tenantId}`) as any;
  }
}
