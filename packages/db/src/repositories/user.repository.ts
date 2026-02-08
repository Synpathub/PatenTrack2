import { User } from '@patentrack/core';
import { BaseRepository } from './base.repository';
import { users } from '../schema/tenants';
import { sql } from 'drizzle-orm';

export class UserRepository extends BaseRepository<User> {
  constructor() {
    super(users);
  }

  async findByUsername(username: string): Promise<User | null> {
    const results = await this.db
      .select()
      .from(users)
      .where(sql`${users.username} = ${username}`)
      .limit(1);
    
    return (results[0] as User) || null;
  }

  async findByEmail(email: string): Promise<User | null> {
    const results = await this.db
      .select()
      .from(users)
      .where(sql`${users.email} = ${email}`)
      .limit(1);
    
    return (results[0] as User) || null;
  }

  async findByTenant(tenantId: number): Promise<User[]> {
    return this.db
      .select()
      .from(users)
      .where(sql`${users.tenantId} = ${tenantId}`) as any;
  }

  async updateLastLogin(id: number): Promise<User | null> {
    const [result] = await this.db
      .update(users)
      .set({ lastLoginAt: new Date() })
      .where(sql`${users.id} = ${id}`)
      .returning();
    
    return (result as User) || null;
  }
}
