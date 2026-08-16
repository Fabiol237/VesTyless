import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Ce script sera appelé chaque nuit (ex: par Vercel Cron ou n8n)
export async function GET(request) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    
    if (!supabaseUrl || !supabaseKey) {
      return NextResponse.json({ error: 'Missing keys' }, { status: 500 });
    }
    
    const supabase = createClient(supabaseUrl, supabaseKey);
    const nowIso = new Date().toISOString();

    // Nettoyage uniquement des promos marchands réellement expirées (si flash_sale_end < date actuelle)
    const { data: expired } = await supabase
      .from('products')
      .select('id, original_price')
      .not('flash_sale_end', 'is', null)
      .lt('flash_sale_end', nowIso);

    if (expired && expired.length > 0) {
      for (const p of expired) {
        if (p.original_price) {
          await supabase.from('products').update({ 
            price: p.original_price, 
            original_price: null, 
            flash_sale_end: null,
            is_promo: false
          }).eq('id', p.id);
        }
      }
    }
    
    return NextResponse.json({ success: true, expiredCleaned: expired?.length || 0 });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
