const { Client } = require('pg');
require('dotenv').config({ path: '.env.local' });

const password = 'Z0kof@ro123';
const host = 'aws-0-eu-west-1.pooler.supabase.com';
const user = 'postgres.qkqowrwkmipxyktjdvfg';
const connectionString = `postgresql://${user}:${encodeURIComponent(password)}@${host}:6543/postgres?pgbouncer=true`;

async function createStockFunction() {
  const client = new Client({ connectionString, ssl: { rejectUnauthorized: false } });
  try {
    await client.connect();
    
    console.log('Creating decrement_stock function...');

    await client.query(`
      CREATE OR REPLACE FUNCTION decrement_stock(product_id UUID, quantity_to_decrement INT)
      RETURNS VOID AS $$
      BEGIN
        UPDATE products
        SET stock_quantity = stock_quantity - quantity_to_decrement
        WHERE id = product_id AND stock_quantity >= quantity_to_decrement;
        
        IF NOT FOUND THEN
          RAISE EXCEPTION 'Stock insuffisant pour le produit %', product_id;
        END IF;
      END;
      $$ LANGUAGE plpgsql SECURITY DEFINER;
    `);

    console.log('SUCCESS: decrement_stock function created.');

  } catch (err) {
    console.error('Error:', err.message);
  } finally {
    await client.end();
  }
}

createStockFunction();
