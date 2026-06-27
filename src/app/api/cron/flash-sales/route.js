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

    // 1. Remettre les anciens produits en promo à leur prix normal
    const { data: expired } = await supabase
      .from('products')
      .select('id, original_price')
      .not('flash_sale_end', 'is', null);

    if (expired && expired.length > 0) {
      for (const p of expired) {
        if (p.original_price) {
          await supabase.from('products').update({ 
            price: p.original_price, 
            original_price: null, 
            flash_sale_end: null 
          }).eq('id', p.id);
        }
      }
    }

    // 2. Choisir 3 produits aléatoires pour la promo du jour
    // On prend des produits actifs, pas encore en promo, et avec un prix > 1000
    const { data: randomProducts } = await supabase
      .from('products')
      .select('id, price')
      .eq('is_active', true)
      .is('flash_sale_end', null)
      .gte('price', 1000)
      .limit(20);

    if (randomProducts && randomProducts.length > 0) {
      // Mélanger et prendre 3
      const shuffled = randomProducts.sort(() => 0.5 - Math.random());
      const selected = shuffled.slice(0, 3);
      
      const tomorrow = new Date();
      tomorrow.setHours(tomorrow.getHours() + 24);

      for (const p of selected) {
        const discountedPrice = Math.floor(p.price * 0.85); // -15%
        await supabase.from('products').update({
          original_price: p.price,
          price: discountedPrice,
          flash_sale_end: tomorrow.toISOString()
        }).eq('id', p.id);
      }
      
      return NextResponse.json({ success: true, selected: selected.length });
    }
    
    return NextResponse.json({ success: true, message: 'No eligible products' });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
