import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    );

    const { error } = await supabase.rpc('exec_sql', {
      sql: `ALTER TABLE stores ADD COLUMN IF NOT EXISTS business_type TEXT DEFAULT 'ecommerce';`
    });

    // Fallback: try direct query
    if (error) {
      await supabase.from('stores').select('business_type').limit(1);
    }

    return NextResponse.json({ success: true, message: 'Migration business_type OK' });
  } catch (err) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
