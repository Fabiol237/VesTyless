const nodemailer = require('nodemailer');
require('dotenv').config({ path: '.env.local' });

async function testEmail() {
  console.log("🚀 Lancement du test de connexion Gmail...");
  console.log("📧 Utilisateur:", process.env.GMAIL_USER);

  if (!process.env.GMAIL_USER || !process.env.GMAIL_APP_PASSWORD) {
    console.error("❌ ERREUR: Les variables GMAIL_USER ou GMAIL_APP_PASSWORD sont absentes du fichier .env.local");
    return;
  }

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_APP_PASSWORD,
    },
  });

  try {
    await transporter.verify();
    console.log("✅ SUCCÈS: La connexion avec Gmail est établie ! Votre SaaS peut maintenant envoyer des emails.");
    
    console.log("📧 Envoi d'un email de test à vous-même...");
    await transporter.sendMail({
      from: `"Vestyle Test" <${process.env.GMAIL_USER}>`,
      to: process.env.GMAIL_USER,
      subject: "🚀 Test de Notification VesTyle Réussi !",
      text: "Ceci est un test automatique. Si vous lisez ceci, votre SaaS est prêt à notifier vos clients !",
      html: "<h1>✅ Test Réussi !</h1><p>Votre SaaS <b>Vestyle</b> est maintenant capable d'envoyer des notifications Gmail automatiques.</p>"
    });
    console.log("📩 Email de test envoyé avec succès ! Vérifiez votre boîte de réception.");

  } catch (error) {
    console.error("❌ ERREUR de connexion:", error.message);
    console.log("\n💡 CONSEIL: Vérifiez que vous utilisez bien le 'Mot de passe d'application' (16 caractères) et non votre mot de passe Gmail habituel.");
  }
}

testEmail();
