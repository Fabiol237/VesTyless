/**
 * Vestyle — Script de migration des codes boutiques
 * Assigne un code 5 chiffres unique et permanent à chaque boutique.
 * Les boutiques qui ont déjà un code ne sont PAS modifiées.
 */

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://qkqowrwkmipxyktjdvfg.supabase.co';
const SERVICE_KEY  = process.env.SUPABASE_SERVICE_ROLE_KEY || 'YOUR_SUPABASE_SERVICE_KEY_HERE';

const supabase = createClient(SUPABASE_URL, SERVICE_KEY, {
  auth: { persistSession: false }
});

function generateCode(used) {
  let attempts = 0;
  while (attempts < 10000) {
    const code = String(Math.floor(Math.random() * 100000)).padStart(5, '0');
    if (!used.has(code)) return code;
    attempts++;
  }
  throw new Error('Impossible de générer un code unique après 10000 tentatives');
}

async function main() {
  console.log('🔍 Chargement de toutes les boutiques...');
  const { data: stores, error } = await supabase
    .from('stores')
    .select('id, name, store_code')
    .order('created_at', { ascending: true });

  if (error) {
    console.error('❌ Erreur:', error.message);
    process.exit(1);
  }

  console.log(`📦 ${stores.length} boutique(s) trouvée(s)`);

  const used = new Set(stores.map(s => s.store_code).filter(Boolean));
  const missing = stores.filter(s => !s.store_code);

  console.log(`✅ Déjà codées: ${stores.length - missing.length}`);
  console.log(`⚠️  Sans code:   ${missing.length}`);

  if (missing.length === 0) {
    console.log('\n🎉 Toutes les boutiques ont déjà leur code permanent !');
    // Print current state
    stores.forEach(s => console.log(`  [${s.store_code}] ${s.name}`));
    process.exit(0);
  }

  for (const store of missing) {
    const code = generateCode(used);
    used.add(code);

    const { error: upErr } = await supabase
      .from('stores')
      .update({ store_code: code })
      .eq('id', store.id)
      .is('store_code', null); // Safety: only update if still null

    if (upErr) {
      console.error(`❌ Erreur pour "${store.name}": ${upErr.message}`);
    } else {
      console.log(`✅ [${code}] → "${store.name}"`);
    }
  }

  // Final verification
  console.log('\n📋 État final:');
  const { data: final } = await supabase.from('stores').select('name, store_code').order('name');
  final?.forEach(s => console.log(`  [${s.store_code ?? '-----'}] ${s.name}`));

  // Check for duplicates
  const codes = (final || []).map(s => s.store_code).filter(Boolean);
  const uniq = new Set(codes);
  if (codes.length !== uniq.size) {
    console.error('\n🚨 ATTENTION: Des codes dupliqués ont été détectés!');
  } else {
    console.log(`\n🎉 Parfait ! ${codes.length} code(s) unique(s) attribué(s).`);
  }
}

main().catch(err => {
  console.error('Fatal:', err);
  process.exit(1);
});
