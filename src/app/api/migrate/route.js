import { createClient } from '@supabase/supabase-js';

// Use admin client (service role gives full DDL access)
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  { auth: { persistSession: false } }
);

export async function GET(request) {
  const authHeader = request.headers.get('x-migration-key');
  if (authHeader !== 'vestyle-migrate-2026') {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const results = [];
  
  const steps = [
    {
      name: 'Add store_code to stores',
      rpc: 'exec_migration',
      fallback: async () => {
        // Use raw SQL via pg REST
        const r = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/`, {
          headers: { apikey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY }
        });
        return r.status;
      }
    }
  ];

  // Approach: Use supabase-js to alter columns via .from().insert() trick won't work for DDL
  // But we CAN use the Supabase Management API if we have access token
  // Instead: manually update all stores with generated codes using the SDK

  try {
    // 1. Get all stores
    const { data: stores, error: storeErr } = await supabaseAdmin
      .from('stores')
      .select('id, name, store_code');
    
    if (storeErr) throw new Error(`Fetch stores: ${storeErr.message}`);
    results.push({ step: 'Fetch stores', status: 'ok', count: stores.length });

    // 2. Generate codes for stores missing them (store_code column must exist)
    const missing = stores.filter(s => !s.store_code);
    const used = new Set(stores.map(s => s.store_code).filter(Boolean));
    
    for (const store of missing) {
      let code;
      do { code = String(Math.floor(Math.random() * 90000 + 10000)); } while (used.has(code));
      used.add(code);
      
      const { error: upErr } = await supabaseAdmin
        .from('stores')
        .update({ store_code: code })
        .eq('id', store.id);
      
      results.push({
        step: `Assign code to "${store.name}"`,
        status: upErr ? 'error' : 'ok',
        code,
        error: upErr?.message
      });
    }

    // 3. Verify
    const { data: verified } = await supabaseAdmin
      .from('stores')
      .select('name, store_code');
    
    return Response.json({
      success: true,
      results,
      stores: verified,
    });

  } catch (err) {
    return Response.json({ success: false, error: err.message, results }, { status: 500 });
  }
}
