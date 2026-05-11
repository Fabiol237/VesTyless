const { Client } = require('pg');
require('dotenv').config({ path: '.env.local' });

const password = 'Z0kof@ro123';
const host = 'aws-0-eu-west-1.pooler.supabase.com';
const user = 'postgres.qkqowrwkmipxyktjdvfg';
const connectionString = `postgresql://${user}:${encodeURIComponent(password)}@${host}:6543/postgres?pgbouncer=true`;

async function updateStockFunction() {
  const client = new Client({ connectionString, ssl: { rejectUnauthorized: false } });
  try {
    await client.connect();
    
    console.log('Updating decrement_stock function to return new stock...');

    await client.query(`
      CREATE OR REPLACE FUNCTION decrement_stock(product_id UUID, quantity_to_decrement INT)
      RETURNS INT AS $$
      DECLARE
        new_stock INT;
      BEGIN
        UPDATE products
        SET stock_quantity = stock_quantity - quantity_to_decrement
        WHERE id = product_id AND stock_quantity >= quantity_to_decrement
        RETURNING stock_quantity INTO new_stock;
        
        IF NOT FOUND THEN
          RAISE EXCEPTION 'Stock insuffisant';
        END IF;
        
        RETURN new_stock;
      END;
      $$ LANGUAGE plpgsql SECURITY DEFINER;
    `);

    console.log('SUCCESS: decrement_stock function updated.');

  } catch (err) {
    console.error('Error:', err.message);
  } finally {
    await client.end();
  }
}

updateStockFunction();
