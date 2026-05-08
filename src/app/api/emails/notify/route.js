import { Resend } from 'resend';
import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import webpush from 'web-push';

const resend = new Resend(process.env.RESEND_API_KEY);

const setupWebPush = () => {
  try {
    webpush.setVapidDetails(
      'mailto:admin@vestyle.cm',
      process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY?.trim() || '',
      process.env.VAPID_PRIVATE_KEY?.trim() || ''
    );
    return true;
  } catch (err) {
    console.error('[WebPush] Config Error:', err.message);
    return false;
  }
};

const NOTIFICATION_THEMES = {
  ORDER: { color: '#128C7E', label: 'NOUVELLE COMMANDE', icon: '🛍️' },
  SECURITY: { color: '#ef4444', label: 'ALERTE SÉCURITÉ', icon: '🛡️' },
  STOCK: { color: '#f59e0b', label: 'ALERTE STOCK', icon: '📦' },
  MESSAGE: { color: '#3b82f6', label: 'NOUVEAU MESSAGE', icon: '💬' },
  PULSE: { color: '#10b981', label: 'MATIN PULSE', icon: '📈' },
  FEEDBACK: { color: '#8b5cf6', label: 'AVIS CLIENT', icon: '⭐' },
  TREND: { color: '#ec4899', label: 'TENDANCE MARCHÉ', icon: '🔥' }
};

export async function POST(request) {
  try {
    const { to, subject, type, data } = await request.json();
    const theme = NOTIFICATION_THEMES[type] || NOTIFICATION_THEMES.PULSE;

    // 1. ENVOI DE L'EMAIL (RESEND)
    let emailResult = null;
    if (process.env.RESEND_API_KEY) {
      const htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc; color: #1e293b; margin: 0; padding: 0; }
            .wrapper { padding: 20px; }
            .container { max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 32px; overflow: hidden; border: 1px solid #e2e8f0; box-shadow: 0 10px 15px -3px rgba(0,0,0,0.1); }
            .header { background-color: ${theme.color}; padding: 60px 40px; text-align: center; color: white; }
            .content { padding: 40px; line-height: 1.6; }
            .badge { display: inline-block; padding: 4px 12px; border-radius: 99px; background: rgba(255,255,255,0.2); font-size: 10px; font-weight: 900; letter-spacing: 0.1em; text-transform: uppercase; margin-bottom: 10px; }
            .data-box { background-color: #f1f5f9; padding: 24px; border-radius: 24px; margin: 20px 0; border: 1px solid #e2e8f0; }
            .footer { background-color: #f8fafc; padding: 30px; text-align: center; font-size: 12px; color: #64748b; border-top: 1px solid #e2e8f0; }
            .button { display: inline-block; background-color: #1e293b; color: white; padding: 16px 32px; text-decoration: none; border-radius: 16px; font-weight: 800; font-size: 14px; margin-top: 20px; text-transform: uppercase; letter-spacing: 0.05em; }
            .stat-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; }
            .stat-card { background: white; padding: 15px; border-radius: 16px; border: 1px solid #e2e8f0; }
          </style>
        </head>
        <body>
          <div class="wrapper">
            <div class="container">
              <div class="header">
                <img src="${process.env.NEXT_PUBLIC_SITE_URL}/icon-512.png" style="width: 64px; height: 64px; border-radius: 18px; margin-bottom: 20px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); border: 2px solid rgba(255,255,255,0.2);" alt="Vestyle">
                <div class="badge">${theme.label}</div>
                <h1 style="margin: 0; font-size: 28px; font-weight: 900; letter-spacing: -0.02em;">${theme.icon} ${subject}</h1>
              </div>
              <div class="content">
                <p style="font-size: 16px; color: #475569;">${data.message || 'Mise à jour Vestyle Pro.'}</p>
                ${type === 'ORDER' ? `<div class="data-box"><p style="font-size: 24px; font-weight: 900; color: ${theme.color};">${data.amount} F</p><p>Client: ${data.customer}</p></div>` : ''}
                ${type === 'STOCK' ? `<div class="data-box" style="border-left: 4px solid #ef4444;"><p>Produit: <b>${data.productName}</b></p><p>Reste: ${data.stock} unités</p></div>` : ''}
                <div style="text-align: center;"><a href="${process.env.NEXT_PUBLIC_SITE_URL}/admin" class="button">Accéder au Hub</a></div>
              </div>
              <div class="footer"><p>&copy; 2026 Vestyle Pro Network. Resend Verified.</p></div>
            </div>
          </div>
        </body>
        </html>
      `;
      emailResult = await resend.emails.send({
        from: 'Vestyle <onboarding@resend.dev>',
        to: [to],
        subject: `${theme.icon} ${subject}`,
        html: htmlContent,
      });
    }

    // 2. ENVOI DE LA NOTIFICATION PUSH (PWA)
    let pushResult = { sent: 0, failed: 0 };
    const canPush = setupWebPush();

    const { data: subs } = await supabaseAdmin
      .from('push_subscriptions')
      .select('subscription')
      .eq('email', to);

    if (canPush && subs && subs.length > 0) {
      const payload = JSON.stringify({
        title: `${theme.icon} ${theme.label}`,
        body: subject,
        url: "/admin"
      });

      const pushPromises = subs.map(async (sub) => {
        try {
          await webpush.sendNotification(sub.subscription, payload);
          pushResult.sent++;
        } catch (error) {
          console.error('[WebPush] Error:', error);
          pushResult.failed++;
          if (error.statusCode === 410 || error.statusCode === 404) {
            // Supprimer la souscription expirée
            await supabaseAdmin.from('push_subscriptions').delete().eq('subscription', sub.subscription);
          }
        }
      });
      await Promise.all(pushPromises);
    }

    return NextResponse.json({ success: true, email: emailResult, push: pushResult });

  } catch (error) {
    console.error('Notify Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
