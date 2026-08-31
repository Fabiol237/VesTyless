import { Resend } from 'resend';
import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import webpush from 'web-push';
import {
  generateOrderCustomerEmail,
  generateOrderVendorEmail,
  generateStatusUpdateEmail,
  generateWelcomeEmail,
  generateStockAlertEmail,
  generateGenericNotificationEmail
} from '@/lib/emailTemplates';

export const dynamic = 'force-dynamic';

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

export async function POST(request) {
  try {
    const { to, subject, type, data = {} } = await request.json();

    if (!to) {
      return NextResponse.json({ error: 'Adresse email destinataire manquante' }, { status: 400 });
    }

    // 1. DÉTERMINATION DU TEMPLATE HTML HAUTE FIDÉLITÉ
    let htmlContent = '';
    let emailSubject = subject || 'Notification VeStyle';

    switch (type) {
      case 'ORDER_CUSTOMER':
      case 'order_customer':
        htmlContent = generateOrderCustomerEmail({
          customerName: data.customerName || data.customer,
          orderId: data.orderId,
          storeName: data.storeName,
          items: data.items || [],
          totalAmount: data.amount || data.totalAmount,
          deliveryAddress: data.deliveryAddress || data.address,
          trackingUrl: data.trackingUrl,
        });
        emailSubject = `✅ Confirmation de votre commande #${data.orderId ? data.orderId.toString().slice(-6) : ''} - VeStyle`;
        break;

      case 'ORDER':
      case 'ORDER_VENDOR':
      case 'order_vendor':
        htmlContent = generateOrderVendorEmail({
          vendorName: data.vendorName,
          storeName: data.storeName || 'Votre boutique',
          orderId: data.orderId,
          customerName: data.customer || data.customerName,
          customerPhone: data.customerPhone || data.phone,
          items: data.items || [],
          totalAmount: data.amount || data.totalAmount,
          hubUrl: data.hubUrl,
        });
        emailSubject = `🛍️ Nouvelle commande (${Number(data.amount || 0).toLocaleString('fr-FR')} FCFA) sur ${data.storeName || 'VeStyle'}`;
        break;

      case 'status_update':
      case 'STATUS_UPDATE':
      case 'DELIVERY':
        htmlContent = generateStatusUpdateEmail({
          customerName: data.customerName || data.customer,
          orderId: data.orderId,
          statusTitle: data.statusTitle || subject,
          statusMessage: data.statusMessage || data.message,
          statusIcon: data.statusIcon || '🚚',
          trackingUrl: data.trackingUrl,
        });
        emailSubject = `${data.statusIcon || '🚚'} ${data.statusTitle || subject} - Commande #${data.orderId ? data.orderId.toString().slice(-6) : ''}`;
        break;

      case 'WELCOME':
      case 'welcome':
        htmlContent = generateWelcomeEmail({
          userName: data.userName || data.name,
          isSeller: Boolean(data.isSeller),
          storeName: data.storeName,
          dashboardUrl: data.dashboardUrl,
        });
        emailSubject = `✨ Bienvenue sur VeStyle, ${data.userName || ''} !`;
        break;

      case 'STOCK':
      case 'stock_alert':
        htmlContent = generateStockAlertEmail({
          vendorName: data.vendorName,
          productName: data.productName,
          currentStock: data.stock,
          restockUrl: data.restockUrl,
        });
        emailSubject = `⚠️ Alerte Stock Faible : ${data.productName} (${data.stock} restant)`;
        break;

      default:
        // Template universel / générique pour Pulse, Feedback, Alerte de Sécurité, etc.
        htmlContent = generateGenericNotificationEmail({
          subject: subject || 'Notification VeStyle',
          message: data.message,
          badge: data.badge || 'VeStyle Alert',
          icon: data.icon || '📢',
          themeColor: data.themeColor || '#1E40AF',
          ctaText: data.ctaText || 'Accéder à VeStyle',
          ctaUrl: data.ctaUrl || (process.env.NEXT_PUBLIC_SITE_URL || 'https://vestyless.vercel.app'),
          extraData: data.extraData || {},
        });
        break;
    }

    // 2. ENVOI INSTANTANÉ VIA RESEND
    let emailResult = null;
    if (process.env.RESEND_API_KEY) {
      const resend = new Resend(process.env.RESEND_API_KEY);

      // Nom d'expéditeur officiel : "VeStyle <notifications@vestyle.cm>" ou personnalisé via RESEND_FROM_EMAIL
      // Fallback automatique si aucun domaine vérifié configuré : "VeStyle <onboarding@resend.dev>"
      const fromAddress = process.env.RESEND_FROM_EMAIL || 'VeStyle <onboarding@resend.dev>';

      try {
        emailResult = await resend.emails.send({
          from: fromAddress,
          to: [to],
          subject: emailSubject,
          html: htmlContent,
        });
      } catch (sendErr) {
        console.error('[Resend] Erreur envoi email:', sendErr);
        // Si le domaine custom échoue car non vérifié, essai avec l'adresse onboarding Resend
        if (fromAddress !== 'VeStyle <onboarding@resend.dev>') {
          try {
            emailResult = await resend.emails.send({
              from: 'VeStyle <onboarding@resend.dev>',
              to: [to],
              subject: emailSubject,
              html: htmlContent,
            });
          } catch (retryErr) {
            console.error('[Resend] Fallback error:', retryErr);
          }
        }
      }
    } else {
      console.warn('[Resend] Clé RESEND_API_KEY non configurée dans .env.local');
    }

    // 3. ENVOI DE LA NOTIFICATION PUSH (PWA)
    let pushResult = { sent: 0, failed: 0 };
    const canPush = setupWebPush();

    const { data: subs } = await supabaseAdmin
      .from('push_subscriptions')
      .select('subscription')
      .eq('email', to);

    if (canPush && subs && subs.length > 0) {
      const payload = JSON.stringify({
        title: emailSubject,
        body: data.message || subject,
        url: data.ctaUrl || "/dashboard"
      });

      const pushPromises = subs.map(async (sub) => {
        try {
          await webpush.sendNotification(sub.subscription, payload);
          pushResult.sent++;
        } catch (error) {
          pushResult.failed++;
          if (error.statusCode === 410 || error.statusCode === 404) {
            await supabaseAdmin.from('push_subscriptions').delete().eq('subscription', sub.subscription);
          }
        }
      });
      await Promise.all(pushPromises);
    }

    return NextResponse.json({
      success: true,
      email: emailResult,
      push: pushResult,
      renderedSubject: emailSubject
    });

  } catch (error) {
    console.error('Notify Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
