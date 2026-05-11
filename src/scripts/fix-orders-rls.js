const { Client } = require('pg');
require('dotenv').config({ path: '.env.local' });

const password = 'Z0kof@ro123';
const host = 'aws-0-eu-west-1.pooler.supabase.com';
const user = 'postgres.qkqowrwkmipxyktjdvfg';
const connectionString = `postgresql://${user}:${encodeURIComponent(password)}@${host}:6543/postgres?pgbouncer=true`;

async function fixPolicies() {
  const client = new Client({ connectionString, ssl: { rejectUnauthorized: false } });
  try {
    await client.connect();
    
    console.log('Fixing policies for "orders" table...');

    // 1. Enable RLS
    await client.query('ALTER TABLE orders ENABLE ROW LEVEL SECURITY');

    // 2. Clear existing policies to avoid conflicts
    await client.query('DROP POLICY IF EXISTS "Owners can update their store orders" ON orders');
    await client.query('DROP POLICY IF EXISTS "Anyone can confirm order receipt" ON orders');
    await client.query('DROP POLICY IF EXISTS "Anyone can view their own orders" ON orders');
    await client.query('DROP POLICY IF EXISTS "Anyone can create an order" ON orders');

    // 3. Create CLEAN policies
    
    // ALLOW: Vendeurs can manage orders for their stores
    await client.query(`
      CREATE POLICY "Vendeurs can manage store orders" ON orders
      FOR ALL
      TO authenticated
      USING (
        EXISTS (
          SELECT 1 FROM stores 
          WHERE stores.id = orders.store_id 
          AND stores.owner_id = auth.uid()
        )
      )
    `);

    // ALLOW: Anyone can create an order (Public Checkout)
    await client.query(`
      CREATE POLICY "Anyone can create orders" ON orders
      FOR INSERT
      TO public
      WITH CHECK (true)
    `);

    // ALLOW: Anyone can view an order if they have the ID (Public Tracking)
    await client.query(`
      CREATE POLICY "Anyone can view orders" ON orders
      FOR SELECT
      TO public
      USING (true)
    `);

    // ALLOW: Anyone can update status (for cancellation by customer OR delivery confirmation)
    // We limit this to only 'status' and 'confirmed_at' if we wanted, 
    // but for now let's allow public update to status='cancelled' if status='pending'
    await client.query(`
      CREATE POLICY "Customers can cancel pending orders" ON orders
      FOR UPDATE
      TO public
      USING (status = 'pending')
      WITH CHECK (status = 'cancelled')
    `);

    console.log('SUCCESS: Policies updated.');

  } catch (err) {
    console.error('Error:', err.message);
  } finally {
    await client.end();
  }
}

fixPolicies();
