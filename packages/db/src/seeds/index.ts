import { getDb, createPool, closePool } from '../connection';
import * as schema from '../schema';
import * as bcrypt from 'bcrypt';

async function seed() {
  console.log('Starting database seed...');
  
  createPool();
  const db = getDb();

  try {
    // Clear existing data (in reverse dependency order)
    console.log('Clearing existing data...');
    await db.delete(schema.users);
    await db.delete(schema.tenants);
    await db.delete(schema.transactionTypes);
    await db.delete(schema.dataSources);

    // Seed transaction types
    console.log('Seeding transaction types...');
    const transactionTypesData = [
      { name: 'Assignment', category: 'acquisition', description: 'Transfer of patent rights' },
      { name: 'Security Agreement', category: 'security', description: 'Patent used as collateral' },
      { name: 'License', category: 'license_in', description: 'License agreement' },
      { name: 'Merger', category: 'merger_in', description: 'Merger or acquisition' },
      { name: 'Release', category: 'release', description: 'Release of security interest' },
      { name: 'Court Order', category: 'court_order', description: 'Court-ordered transfer' },
    ];
    
    await db.insert(schema.transactionTypes).values(transactionTypesData);

    // Seed data sources
    console.log('Seeding data sources...');
    const dataSourcesData = [
      { name: 'USPTO Assignment', type: 'uspto', config: { endpoint: 'https://assignment-api.uspto.gov' } },
      { name: 'EPO OPS', type: 'epo', config: { endpoint: 'https://ops.epo.org' } },
    ];
    
    await db.insert(schema.dataSources).values(dataSourcesData);

    // Seed tenants
    console.log('Seeding tenants...');
    const [tenant1] = await db.insert(schema.tenants).values({
      name: 'Acme Corp',
      slug: 'acme-corp',
      type: 1, // Company
      subscription: { plan: 'enterprise', status: 'active' },
      settings: { timezone: 'America/New_York' },
    }).returning();

    const [tenant2] = await db.insert(schema.tenants).values({
      name: 'First National Bank',
      slug: 'first-national-bank',
      type: 2, // Bank
      subscription: { plan: 'professional', status: 'active' },
      settings: { timezone: 'America/Chicago' },
    }).returning();

    // Seed users
    console.log('Seeding users...');
    const hashedPassword = await bcrypt.hash('password123', 10);
    
    // Super admin
    await db.insert(schema.users).values({
      tenantId: tenant1.id,
      username: 'admin',
      email: 'admin@patentrack.com',
      passwordHash: hashedPassword,
      role: 'super_admin',
      firstName: 'Super',
      lastName: 'Admin',
    });

    // Tenant 1 admin
    await db.insert(schema.users).values({
      tenantId: tenant1.id,
      username: 'acme_admin',
      email: 'admin@acme.com',
      passwordHash: hashedPassword,
      role: 'tenant_admin',
      firstName: 'Acme',
      lastName: 'Administrator',
    });

    // Tenant 1 user
    await db.insert(schema.users).values({
      tenantId: tenant1.id,
      username: 'acme_user',
      email: 'user@acme.com',
      passwordHash: hashedPassword,
      role: 'tenant_user',
      firstName: 'John',
      lastName: 'Doe',
    });

    // Tenant 2 admin
    await db.insert(schema.users).values({
      tenantId: tenant2.id,
      username: 'fnb_admin',
      email: 'admin@fnb.com',
      passwordHash: hashedPassword,
      role: 'tenant_admin',
      firstName: 'Bank',
      lastName: 'Administrator',
    });

    console.log('✅ Database seeded successfully!');
    console.log('\nTest credentials (all use password "password123"):');
    console.log('  - Super Admin: admin / password123');
    console.log('  - Acme Admin: acme_admin / password123');
    console.log('  - Acme User: acme_user / password123');
    console.log('  - FNB Admin: fnb_admin / password123');
  } catch (error) {
    console.error('❌ Seed failed:', error);
    throw error;
  } finally {
    await closePool();
  }
}

seed().catch(console.error);
