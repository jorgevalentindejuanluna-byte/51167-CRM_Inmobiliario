import { NextRequest, NextResponse } from 'next/server';
import { sendEmailViaSmtp, getAgencySmtpConfig } from '@/lib/email-service';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { to, cc, bcc, subject, body_text, body_html, smtp_config } = body;

    if (!to || !Array.isArray(to) || to.length === 0) {
      return NextResponse.json({ error: 'Recipient (to) is required' }, { status: 400 });
    }

    if (!subject) {
      return NextResponse.json({ error: 'Subject is required' }, { status: 400 });
    }

    let config = smtp_config;
    if (!config || (config && !config.pass)) {
      const dbConfig = await getAgencySmtpConfig('ag-001');
      if (dbConfig) {
        if (!config) {
          config = dbConfig;
        } else {
          // Mantener los datos del formulario, pero rellenar el password si falta
          config.pass = dbConfig.pass;
          // Si el usuario borró el user/host pero dejó pass vacío, mejor usar todo de BD
          if (!config.host) config.host = dbConfig.host;
          if (!config.user) config.user = dbConfig.user;
        }
      } else if (!config) {
        console.warn('[Email API] No SMTP config found in DB for agency ag-001');
      }
    }

    const result = await sendEmailViaSmtp(
      {
        to,
        cc,
        bcc,
        subject,
        bodyText: body_text || '',
        bodyHtml: body_html,
      },
      config
    );

    if (!result.success) {
      return NextResponse.json({ error: result.error || 'Failed to send email' }, { status: 502 });
    }

    return NextResponse.json({
      success: true,
      messageId: result.messageId,
    });
  } catch (err: any) {
    console.error('[Email API] Error:', err);
    return NextResponse.json({ error: err.message || 'Internal server error' }, { status: 500 });
  }
}
