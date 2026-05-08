import { Resend } from 'resend';
import { NextResponse } from 'next/server';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request) {
  try {
    const { to, subject, title, message, type, orderData } = await request.json();

    if (!process.env.RESEND_API_KEY) {
      throw new Error('RESEND_API_KEY is not defined');
    }

    // Template HTML Premium
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f6f6f7; color: #111b21; margin: 0; padding: 0; }
          .container { max-width: 600px; margin: 20px auto; background: #ffffff; border-radius: 24px; overflow: hidden; border: 1px solid #eef0f2; }
          .header { background-color: #128C7E; color: white; padding: 40px 20px; text-align: center; }
          .content { padding: 40px 30px; line-height: 1.6; }
          .footer { background-color: #f9f9f9; padding: 20px; text-align: center; font-size: 12px; color: #8696a0; }
          .button { background-color: #25D366; color: white; padding: 15px 30px; text-decoration: none; border-radius: 12px; font-weight: bold; display: inline-block; margin-top: 20px; }
          .order-box { background-color: #f0f2f5; padding: 20px; border-radius: 16px; margin-top: 20px; border-left: 4px solid #128C7E; }
          .price { font-size: 24px; font-weight: 900; color: #128C7E; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1 style="margin:0; font-size: 28px;">VesTyle</h1>
            <p style="margin:5px 0 0 0; opacity: 0.8;">Le commerce de proximité réinventé</p>
          </div>
          <div class="content">
            <h2 style="color: #111b21; margin-top: 0;">${title}</h2>
            <p>${message}</p>
            
            ${type === 'order' && orderData ? `
              <div class="order-box">
                <p style="margin:0; font-size: 12px; color: #667781; text-transform: uppercase; font-weight: bold;">Récapitulatif Commande</p>
                <p style="margin:5px 0; font-weight: bold;">Commande #${orderData.id?.slice(0, 8) || 'N/A'}</p>
                <p class="price">${orderData.total} F</p>
                <p style="margin: 10px 0 0 0; font-size: 14px;">Articles: ${orderData.items_count}</p>
              </div>
            ` : ''}

            <div style="text-align: center;">
              <a href="https://vestyle.cm/dashboard" class="button">Accéder à mon espace</a>
            </div>
          </div>
          <div class="footer">
            <p>&copy; 2026 VesTyle. Tous droits réservés.</p>
            <p>Cet email a été envoyé via Resend pour une fiabilité maximale.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    const { data, error } = await resend.emails.send({
      from: 'Vestyle <onboarding@resend.dev>',
      to: [to],
      subject: subject,
      html: htmlContent,
    });

    if (error) {
      console.error('Resend error:', error);
      return NextResponse.json({ error }, { status: 400 });
    }

    return NextResponse.json({ success: true, data });

  } catch (error) {
    console.error('Email sending error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
