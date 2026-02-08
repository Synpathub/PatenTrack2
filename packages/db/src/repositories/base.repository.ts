import { PaginatedResponse } from '@patentrack/core';
import { getDb } from '../connection';
import { SQL, sql } from 'drizzle-orm';
import { PgTableWithColumns } from 'drizzle-orm/pg-core';

export interface PaginationParams {
  page?: number;
  pageSize?: number;
}

export interface BaseFilters {
  tenantId?: number;
}

export abstract class BaseRepository<T extends Record<string, any>> {
  constructor(protected table: PgTableWithColumns<any>) {}

  protected get db() {
    return getDb();
  }

  async findById(id: number): Promise<T | null> {
    const results = await this.db
      .select()
      .from(this.table)
      .where(sql`${this.table.id} = ${id}`)
      .limit(1);
    
    return (results[0] as T) || null;
  }

  async findAll(filters?: BaseFilters): Promise<T[]> {
    let query = this.db.select().from(this.table);

    if (filters?.tenantId) {
      query = query.where(sql`${this.table.tenantId} = ${filters.tenantId}`) as any;
    }

    return query as any;
  }

  async findPaginated(
    params: PaginationParams = {},
    filters?: BaseFilters,
    additionalWhere?: SQL
  ): Promise<PaginatedResponse<T>> {
    const page = params.page || 1;
    const pageSize = params.pageSize || 20;
    const offset = (page - 1) * pageSize;

    let whereClause: SQL | undefined;
    const conditions: SQL[] = [];

    if (filters?.tenantId) {
      conditions.push(sql`${this.table.tenantId} = ${filters.tenantId}`);
    }

    if (additionalWhere) {
      conditions.push(additionalWhere);
    }

    if (conditions.length > 0) {
      whereClause = conditions.reduce((acc, condition) => 
        acc ? sql`${acc} AND ${condition}` : condition
      );
    }

    const countQuery = this.db
      .select({ count: sql<number>`count(*)::int` })
      .from(this.table);
    
    if (whereClause) {
      (countQuery as any).where(whereClause);
    }

    const [{ count: totalItems }] = await countQuery;

    let dataQuery = this.db
      .select()
      .from(this.table)
      .limit(pageSize)
      .offset(offset);

    if (whereClause) {
      dataQuery = (dataQuery as any).where(whereClause);
    }

    const data = await dataQuery;

    const totalPages = Math.ceil(totalItems / pageSize);

    return {
      data: data as T[],
      pagination: {
        page,
        pageSize,
        totalItems,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      },
    };
  }

  async create(data: Omit<T, 'id' | 'createdAt' | 'updatedAt'>): Promise<T> {
    const [result] = await this.db
      .insert(this.table)
      .values(data)
      .returning();
    
    return result as T;
  }

  async update(id: number, data: Partial<Omit<T, 'id' | 'createdAt'>>): Promise<T | null> {
    const [result] = await this.db
      .update(this.table)
      .set({ ...data, updatedAt: new Date() })
      .where(sql`${this.table.id} = ${id}`)
      .returning();
    
    return (result as T) || null;
  }

  async delete(id: number): Promise<boolean> {
    const result = await this.db
      .delete(this.table)
      .where(sql`${this.table.id} = ${id}`);
    
    return result.rowCount ? result.rowCount > 0 : false;
  }
}
