const { Resend } = require('resend');
require('dotenv').config({ path: '.env.local' });

async function testResend() {
  console.log("🚀 Lancement du test Resend...");
  
  if (!process.env.RESEND_API_KEY) {
    console.error("❌ ERREUR: RESEND_API_KEY est absent du fichier .env.local");
    return;
  }

  const resend = new Resend(process.env.RESEND_API_KEY);

  try {
    console.log("📧 Tentative d'envoi d'un email de test...");
    const { data, error } = await resend.emails.send({
      from: 'Vestyle Test <onboarding@resend.dev>',
      to: 'delivered@resend.dev', // Email de test spécial de Resend ou votre propre email
      subject: '🚀 Test Resend VesTyle Réussi !',
      html: '<h1>✅ Félicitations !</h1><p>Votre SaaS est maintenant connecté à <b>Resend</b>.</p>'
    });

    if (error) {
      console.error("❌ ERREUR Resend:", error.message);
    } else {
      console.log("✅ SUCCÈS: L'email a été envoyé ! ID:", data.id);
      console.log("\n💡 Note: En mode gratuit sans domaine configuré, vous ne pouvez envoyer qu'à votre propre adresse email ou à delivered@resend.dev.");
    }

  } catch (error) {
    console.error("❌ ERREUR fatale:", error.message);
  }
}

testResend();
