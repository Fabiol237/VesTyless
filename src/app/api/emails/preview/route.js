import { NextResponse } from 'next/server';
import {
  generateOrderCustomerEmail,
  generateOrderVendorEmail,
  generateStatusUpdateEmail,
  generateWelcomeEmail,
  generateStockAlertEmail,
  generateGenericNotificationEmail
} from '@/lib/emailTemplates';

export const dynamic = 'force-dynamic';

export async function POST(req) {
  try {
    const { template, customData = {} } = await req.json();

    let html = '';

    switch (template) {
      case 'ORDER_CUSTOMER':
        html = generateOrderCustomerEmail({
          customerName: customData.customerName || 'Fabrice Mbia',
          orderId: customData.orderId || 'VS-849201',
          storeName: customData.storeName || 'Boutique Élégance Douala',
          items: customData.items || [
            { name: 'Chaussures Cuir Oxford Prestige', quantity: 1, price: 35000 },
            { name: 'Ceinture Cuir Véritable Noire', quantity: 2, price: 7500 }
          ],
          totalAmount: customData.totalAmount || 50000,
          deliveryAddress: customData.deliveryAddress || 'Akwa, Boulevard de la Liberté, Douala',
          trackingUrl: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://vestyless.vercel.app'}/suivi/demo-123`
        });
        break;

      case 'ORDER_VENDOR':
        html = generateOrderVendorEmail({
          vendorName: customData.vendorName || 'M. Kamdem',
          storeName: customData.storeName || 'Boutique Élégance Douala',
          orderId: customData.orderId || 'VS-849201',
          customerName: customData.customerName || 'Fabrice Mbia',
          customerPhone: customData.customerPhone || '237699001122',
          items: customData.items || [
            { name: 'Chaussures Cuir Oxford Prestige', quantity: 1, price: 35000 },
            { name: 'Ceinture Cuir Véritable Noire', quantity: 2, price: 7500 }
          ],
          totalAmount: customData.totalAmount || 50000,
          hubUrl: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://vestyless.vercel.app'}/dashboard/orders`
        });
        break;

      case 'STATUS_UPDATE':
        html = generateStatusUpdateEmail({
          customerName: customData.customerName || 'Fabrice Mbia',
          orderId: customData.orderId || 'VS-849201',
          statusTitle: customData.statusTitle || 'Votre colis est en route !',
          statusMessage: customData.statusMessage || 'Le coursier VeStyle Express a récupéré vos articles et se dirige vers votre localisation à Akwa.',
          statusIcon: customData.statusIcon || '🚚',
          trackingUrl: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://vestyless.vercel.app'}/suivi/demo-123`
        });
        break;

      case 'WELCOME_SELLER':
        html = generateWelcomeEmail({
          userName: customData.userName || 'Chantal',
          isSeller: true,
          storeName: customData.storeName || 'Chantal Fashion Douala',
          dashboardUrl: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://vestyless.vercel.app'}/dashboard`
        });
        break;

      case 'WELCOME_BUYER':
        html = generateWelcomeEmail({
          userName: customData.userName || 'Patrick',
          isSeller: false,
          dashboardUrl: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://vestyless.vercel.app'}/`
        });
        break;

      case 'STOCK':
        html = generateStockAlertEmail({
          vendorName: customData.vendorName || 'M. Kamdem',
          productName: customData.productName || 'Costume Slim Fit Bleu Marine',
          currentStock: customData.currentStock || 2,
          restockUrl: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://vestyless.vercel.app'}/dashboard/products`
        });
        break;

      default:
        html = generateGenericNotificationEmail({
          subject: 'Alerte Système VeStyle',
          message: 'Une nouvelle mise à jour de sécurité a été appliquée avec succès sur votre espace.',
          badge: 'Sécurité VeStyle 🔒',
          icon: '🛡️',
          themeColor: '#1E40AF',
          ctaText: 'Vérifier mon compte',
          ctaUrl: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://vestyless.vercel.app'}/profile`
        });
        break;
    }

    return NextResponse.json({ success: true, html });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
