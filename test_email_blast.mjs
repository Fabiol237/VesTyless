import { createClient } from '@supabase/supabase-js';
import { Resend } from 'resend';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '../vestyle/.env') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const resendKey = process.env.RESEND_API_KEY;

if (!supabaseUrl || !supabaseKey || !resendKey) {
  console.error("Clés manquantes dans le .env !");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);
const resend = new Resend(resendKey);

async function sendBlast() {
  console.log("🔍 Récupération des emails depuis Supabase...");
  
  const { data: users, error } = await supabase.auth.admin.listUsers();
  
  if (error) {
    console.error("❌ Erreur Supabase:", error);
    return;
  }
  
  const emails = users.users.map(u => u.email).filter(e => e);
  
  if (emails.length === 0) {
    console.log("⚠️ Aucun email trouvé dans la base de données !");
    return;
  }
  
  console.log(`✅ ${emails.length} emails trouvés:`, emails);
  console.log("🚀 Envoi des emails via Resend...");
  
  try {
    const data = await resend.emails.send({
      from: 'VeStyle <onboarding@resend.dev>',
      to: emails,
      subject: '🚀 Test système VeStyle',
      html: '<h1>Bonjour depuis VeStyle !</h1><p>Ceci est un test de notification générale envoyé à toute la base de données.</p>',
    });
    
    console.log("🎉 EMAILS ENVOYÉS AVEC SUCCÈS !");
    console.log("ID de l'envoi:", data);
  } catch (err) {
    console.error("❌ Erreur Resend:", err);
  }
}

sendBlast();
