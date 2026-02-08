import { Patent, PaginatedResponse } from '@patentrack/core';
import { BaseRepository, PaginationParams } from './base.repository';
import { patents } from '../schema/patents';
import { sql } from 'drizzle-orm';

export interface PatentFilters {
  tenantId?: number;
  companyId?: number;
  status?: string;
  applicationNum?: string;
  grantNum?: string;
}

export class PatentRepository extends BaseRepository<Patent> {
  constructor() {
    super(patents);
  }

  async findByTenant(tenantId: number): Promise<Patent[]> {
    return this.db
      .select()
      .from(patents)
      .where(sql`${patents.tenantId} = ${tenantId}`) as any;
  }

  async findByCompany(companyId: number, tenantId: number): Promise<Patent[]> {
    return this.db
      .select()
      .from(patents)
      .where(sql`${patents.companyId} = ${companyId} AND ${patents.tenantId} = ${tenantId}`) as any;
  }

  async findByApplicationNum(applicationNum: string, tenantId: number): Promise<Patent | null> {
    const results = await this.db
      .select()
      .from(patents)
      .where(sql`${patents.applicationNum} = ${applicationNum} AND ${patents.tenantId} = ${tenantId}`)
      .limit(1);
    
    return (results[0] as Patent) || null;
  }

  async findByGrantNum(grantNum: string, tenantId: number): Promise<Patent | null> {
    const results = await this.db
      .select()
      .from(patents)
      .where(sql`${patents.grantNum} = ${grantNum} AND ${patents.tenantId} = ${tenantId}`)
      .limit(1);
    
    return (results[0] as Patent) || null;
  }

  async findPaginatedWithFilters(
    params: PaginationParams,
    filters: PatentFilters
  ): Promise<PaginatedResponse<Patent>> {
    const conditions: any[] = [];

    if (filters.tenantId) {
      conditions.push(sql`${patents.tenantId} = ${filters.tenantId}`);
    }
    if (filters.companyId) {
      conditions.push(sql`${patents.companyId} = ${filters.companyId}`);
    }
    if (filters.status) {
      conditions.push(sql`${patents.status} = ${filters.status}`);
    }
    if (filters.applicationNum) {
      conditions.push(sql`${patents.applicationNum} = ${filters.applicationNum}`);
    }
    if (filters.grantNum) {
      conditions.push(sql`${patents.grantNum} = ${filters.grantNum}`);
    }

    const whereClause = conditions.length > 0
      ? conditions.reduce((acc, condition) => 
          acc ? sql`${acc} AND ${condition}` : condition
        )
      : undefined;

    return this.findPaginated(
      params,
      { tenantId: filters.tenantId },
      whereClause
    );
  }
}
