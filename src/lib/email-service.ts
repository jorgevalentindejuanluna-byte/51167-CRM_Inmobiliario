import nodemailer from 'nodemailer';

interface SmtpConfig {
  host: string;
  port: number;
  user: string;
  pass: string;
  fromName: string;
  fromEmail: string;
}

interface EmailAddress {
  name: string;
  email: string;
}

interface SendEmailInput {
  to: EmailAddress[];
  cc?: EmailAddress[];
  bcc?: EmailAddress[];
  subject: string;
  bodyText: string;
  bodyHtml?: string;
  attachments?: {
    filename: string;
    content?: Buffer | string;
    path?: string;
    contentType?: string;
  }[];
}

interface SendEmailResult {
  success: boolean;
  error?: string;
  messageId?: string;
}

const DEFAULT_FROM_NAME = 'Real Top State CRM';
const DEFAULT_FROM_EMAIL = 'noreply@real-top-state.com';

function parseSmtpConfig(config: SmtpConfig): SmtpConfig {
  return {
    host: config.host || process.env.SMTP_HOST || '',
    port: config.port || Number(process.env.SMTP_PORT) || 587,
    user: config.user || process.env.SMTP_USER || '',
    pass: config.pass || process.env.SMTP_PASS || '',
    fromName: config.fromName || process.env.SMTP_FROM_NAME || DEFAULT_FROM_NAME,
    fromEmail: config.fromEmail || process.env.SMTP_FROM_EMAIL || DEFAULT_FROM_EMAIL,
  };
}

function createTransport(config: SmtpConfig) {
  const cfg = parseSmtpConfig(config);

  if (!cfg.host || !cfg.user || !cfg.pass) {
    throw new Error(
      'SMTP not configured. Set SMTP_HOST, SMTP_USER, SMTP_PASS env vars ' +
      'or configure an email account in Settings > Email.'
    );
  }

  return nodemailer.createTransport({
    host: cfg.host,
    port: cfg.port,
    secure: cfg.port === 465,
    auth: { user: cfg.user, pass: cfg.pass },
  });
}

function formatAddress(addr: EmailAddress): string {
  return addr.name ? `"${addr.name}" <${addr.email}>` : addr.email;
}

export async function sendEmailViaSmtp(
  input: SendEmailInput,
  smtpConfig?: SmtpConfig
): Promise<SendEmailResult> {
  try {
    const config = smtpConfig
      ? parseSmtpConfig(smtpConfig)
      : parseSmtpConfig({} as SmtpConfig);

    const transport = createTransport(config);

    const mailOptions: nodemailer.SendMailOptions = {
      from: `"${config.fromName}" <${config.fromEmail}>`,
      to: input.to.map(formatAddress).join(', '),
      cc: input.cc?.map(formatAddress).join(', '),
      bcc: input.bcc?.map(formatAddress).join(', '),
      subject: input.subject,
      text: input.bodyText,
      html: input.bodyHtml || input.bodyText.replace(/\n/g, '<br>'),
      attachments: input.attachments,
    };

    const info = await transport.sendMail(mailOptions);

    return {
      success: true,
      messageId: info.messageId,
    };
  } catch (err: any) {
    console.error('[EmailService] SMTP send error:', err);
    return {
      success: false,
      error: err.message || 'Unknown SMTP error',
    };
  }
}

export async function getAgencySmtpConfig(agencyId: string): Promise<SmtpConfig | null> {
  try {
    const { createClient } = await import('@supabase/supabase-js');
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!url || !key) return null;

    const supabase = createClient(url, key, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    const mapRow = (row: any) => row ? {
      host: row.smtp_host,
      port: row.smtp_port,
      user: row.smtp_user,
      pass: row.smtp_pass,
      fromName: row.display_name,
      fromEmail: row.email,
    } : null;

    const { data, error } = await supabase
      .from('email_accounts')
      .select('smtp_host, smtp_port, smtp_user, smtp_pass, display_name, email')
      .eq('agency_id', agencyId)
      .eq('sync_enabled', true)
      .order('created_at', { ascending: false })
      .maybeSingle();

    if (data) return mapRow(data);

    // Fallback: buscar cualquier cuenta aunque no tenga sync_enabled
    const { data: fallback } = await supabase
      .from('email_accounts')
      .select('smtp_host, smtp_port, smtp_user, smtp_pass, display_name, email')
      .eq('agency_id', agencyId)
      .order('created_at', { ascending: false })
      .maybeSingle();

    return mapRow(fallback);
  } catch {
    return null;
  }
}
