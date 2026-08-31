const { Resend } = require('resend');
require('dotenv').config({ path: '.env.local' });

async function runTest() {
  console.log("=========================================");
  console.log("🧪 TEST DU MOTEUR D'EMAIL VESTYLE PRO");
  console.log("=========================================");

  if (!process.env.RESEND_API_KEY) {
    console.error("❌ ERREUR: RESEND_API_KEY absente.");
    return;
  }

  const resend = new Resend(process.env.RESEND_API_KEY);

  console.log("🔑 Clé Resend détectée :", process.env.RESEND_API_KEY.slice(0, 10) + '...');

  try {
    // Test 1: Envoi vers l'adresse sandbox Resend
    console.log("\n📨 Test 1 : Envoi de test via Resend...");
    const { data, error } = await resend.emails.send({
      from: 'VeStyle <onboarding@resend.dev>',
      to: 'delivered@resend.dev',
      subject: '🛍️ Confirmation de commande #VS-9821 - VeStyle',
      html: `
        <div style="font-family: sans-serif; padding: 20px; background: #0F172A; color: white; border-radius: 12px;">
          <h1 style="color: #F59E0B;">VeStyle</h1>
          <p>Le système d'email est 100% opérationnel !</p>
        </div>
      `
    });

    if (error) {
      console.error("❌ Erreur Resend API:", error);
    } else {
      console.log("✅ SUCCÈS TOTAL ! Email ID:", data.id);
    }

  } catch (err) {
    console.error("❌ Erreur inattendue:", err.message);
  }
}

runTest();
