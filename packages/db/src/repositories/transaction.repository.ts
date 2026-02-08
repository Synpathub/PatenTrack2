import { Transaction, PaginatedResponse } from '@patentrack/core';
import { BaseRepository, PaginationParams } from './base.repository';
import { transactions } from '../schema/transactions';
import { sql } from 'drizzle-orm';

export interface TransactionFilters {
  tenantId?: number;
  patentId?: number;
  typeId?: number;
  reelNo?: string;
  frameNo?: string;
}

export class TransactionRepository extends BaseRepository<Transaction> {
  constructor() {
    super(transactions);
  }

  async findByTenant(tenantId: number): Promise<Transaction[]> {
    return this.db
      .select()
      .from(transactions)
      .where(sql`${transactions.tenantId} = ${tenantId}`) as any;
  }

  async findByPatent(patentId: number, tenantId: number): Promise<Transaction[]> {
    return this.db
      .select()
      .from(transactions)
      .where(sql`${transactions.patentId} = ${patentId} AND ${transactions.tenantId} = ${tenantId}`) as any;
  }

  async findByReelFrame(reelNo: string, frameNo: string, tenantId: number): Promise<Transaction | null> {
    const results = await this.db
      .select()
      .from(transactions)
      .where(sql`${transactions.reelNo} = ${reelNo} AND ${transactions.frameNo} = ${frameNo} AND ${transactions.tenantId} = ${tenantId}`)
      .limit(1);
    
    return (results[0] as any as Transaction) || null;
  }

  async findPaginatedWithFilters(
    params: PaginationParams,
    filters: TransactionFilters
  ): Promise<PaginatedResponse<Transaction>> {
    const conditions: any[] = [];

    if (filters.tenantId) {
      conditions.push(sql`${transactions.tenantId} = ${filters.tenantId}`);
    }
    if (filters.patentId) {
      conditions.push(sql`${transactions.patentId} = ${filters.patentId}`);
    }
    if (filters.typeId) {
      conditions.push(sql`${transactions.typeId} = ${filters.typeId}`);
    }
    if (filters.reelNo) {
      conditions.push(sql`${transactions.reelNo} = ${filters.reelNo}`);
    }
    if (filters.frameNo) {
      conditions.push(sql`${transactions.frameNo} = ${filters.frameNo}`);
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
