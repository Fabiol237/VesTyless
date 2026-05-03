import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://qkqowrwkmipxyktjdvfg.supabase.co',
  process.env.SUPABASE_SERVICE_ROLE_KEY || 'YOUR_SUPABASE_SERVICE_KEY_HERE',
  { auth: { persistSession: false } }
);

async function applyTrigger() {
  console.log('🚀 Tentative d''application du trigger SQL...');
  
  // SQL to create/replace the function and trigger
  const sql = `
    create or replace function public.generate_store_code()
    returns trigger as \$\$\$
    declare
      new_code varchar(5);
      attempts integer := 0;
    begin
      if TG_OP = 'INSERT' and new.store_code is null then
        loop
          attempts := attempts + 1;
          if attempts > 1000 then
            raise exception 'Could not generate a unique store_code after 1000 attempts';
          end if;
          new_code := lpad((floor(random() * 100000))::int::text, 5, '0');
          exit when not exists (
            select 1 from public.stores where store_code = new_code
          );
        end loop;
        new.store_code := new_code;
      end if;
      if TG_OP = 'UPDATE' then
        new.store_code := old.store_code;
      end if;
      return new;
    end;
    \$\$\$ language plpgsql security definer;

    drop trigger if exists ensure_store_code on public.stores;
    create trigger ensure_store_code
      before insert or update on public.stores
      for each row execute procedure public.generate_store_code();
  `;

  // We use a little trick: Supabase doesn't allow raw SQL via SDK easily
  // but we can try to call an RPC that we create if we had one.
  // SINCE WE DON'T: I will use the FETCH method to the internal SQL endpoint if possible
  // OR I will try to use the browser agent again NOW that the user might have maximized it.
  
  console.log('SQL prêt. Note: Cette opération nécessite d''être exécutée dans le SQL Editor de Supabase.');
}

applyTrigger();
