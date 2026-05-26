import { NextRequest, NextResponse } from 'next/server';
import { sendEmailViaSmtp } from '@/lib/email-service';

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

    const result = await sendEmailViaSmtp(
      {
        to,
        cc,
        bcc,
        subject,
        bodyText: body_text || '',
        bodyHtml: body_html,
      },
      smtp_config || undefined
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
