import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import fs from 'fs';

// Load .env.local
const envConfig = dotenv.parse(fs.readFileSync('.env.local'));
for (const k in envConfig) {
  process.env[k] = envConfig[k];
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabaseServiceRole = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error("Supabase URL or Anon key missing in .env.local");
  process.exit(1);
}

// Use Service Role if available to inspect auth users
const supabase = createClient(supabaseUrl, supabaseServiceRole || supabaseAnonKey);

async function run() {
  const storeId = '3dbf4d4e-2a2e-4316-996e-7d3780766e06';
  console.log(`Checking store: ${storeId}`);
  
  const { data: store, error: storeError } = await supabase
    .from('stores')
    .select('*')
    .eq('id', storeId)
    .single();

  if (storeError) {
    console.error("Error fetching store:", storeError);
  } else {
    console.log("Store found:", {
      id: store.id,
      name: store.name,
      owner_id: store.owner_id,
      slug: store.slug
    });
  }

  // Check profiles or users if service role is present
  if (supabaseServiceRole) {
    const { data: users, error: usersError } = await supabase.auth.admin.listUsers();
    if (usersError) {
      console.error("Error listing users:", usersError);
    } else {
      console.log(`Total users in system: ${users.users.length}`);
      users.users.forEach(u => {
        console.log(`User: id=${u.id}, email=${u.email}`);
      });
    }
  } else {
    console.log("No service role key found. Fetching profiles instead...");
    const { data: profiles, error: profError } = await supabase.from('profiles').select('*');
    if (profError) {
      console.error("Error fetching profiles:", profError);
    } else {
      console.log("Profiles in DB:", profiles.map(p => ({ id: p.id, email: p.email || p.username })));
    }
  }
}

run();
