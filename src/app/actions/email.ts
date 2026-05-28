'use server';

import { supabaseSelect, supabaseInsert, supabaseUpdate } from '@/lib/supabase';
import { sendEmailViaSmtp, getAgencySmtpConfig } from '@/lib/email-service';
import type { EmailMessage, EmailThread, EmailAccount, EmailFolder, EmailFlag } from '@/lib/models/types';

function generateId(): string {
  return `emm-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

// ── Accounts ──

export async function getEmailAccounts(token?: string): Promise<{ success: boolean; error?: string; data?: EmailAccount[] }> {
  try {
    const result = await supabaseSelect<EmailAccount>('email_accounts', { token });
    if (!result || result.length === 0) return { success: true, data: [] };

    // Deduplicar por email: quedarse con la más reciente
    const map = new Map<string, EmailAccount>();
    for (const acct of result) {
      if (acct.email) map.set(acct.email, acct);
    }
    return { success: true, data: Array.from(map.values()) };
  } catch (error: any) {
    return { success: true, data: [] };
  }
}

export async function saveEmailAccount(
  data: Partial<EmailAccount> & { email: string; display_name: string; smtp_host: string; smtp_port: number; smtp_user: string; smtp_pass: string; imap_host?: string; imap_port?: number; imap_user?: string; imap_pass?: string; imap_encryption?: string },
  token?: string
): Promise<{ success: boolean; error?: string; data?: EmailAccount }> {
  try {
    const payload = {
      agency_id: 'ag-001',
      email: data.email,
      display_name: data.display_name,
      smtp_host: data.smtp_host,
      smtp_port: data.smtp_port,
      smtp_user: data.smtp_user,
      smtp_pass: data.smtp_pass,
      smtp_encryption: data.smtp_encryption || 'starttls',
      imap_host: data.imap_host,
      imap_port: data.imap_port,
      imap_user: data.imap_user,
      imap_pass: data.imap_pass,
      imap_encryption: data.imap_encryption || 'ssl',
      provider: data.provider || 'other',
      sync_enabled: true,
    };

    const result = await supabaseInsert<EmailAccount>('email_accounts', payload as any, token);
    return { success: true, data: result[0] };
  } catch (error: any) {
    // Si es duplicate key (23505), hacemos UPDATE
    if (error.message?.includes('23505')) {
      try {
        const all = await supabaseSelect<EmailAccount>('email_accounts', { token });
        const match = all?.find(a => a.email === data.email);
        if (match) {
          const updated = await supabaseUpdate<EmailAccount>('email_accounts', match.id, {
            display_name: data.display_name,
            smtp_host: data.smtp_host,
            smtp_port: data.smtp_port,
            smtp_user: data.smtp_user,
            smtp_pass: data.smtp_pass,
            smtp_encryption: data.smtp_encryption || 'starttls',
            imap_host: data.imap_host,
            imap_port: data.imap_port,
            imap_user: data.imap_user,
            imap_pass: data.imap_pass,
            imap_encryption: data.imap_encryption || 'ssl',
            provider: data.provider || 'other',
            sync_enabled: true,
          } as any, token);
          return { success: true, data: updated || match };
        }
      } catch {}
    }
    return { success: false, error: error.message };
  }
}

// ── Threads (Retorna vacío ya que no hay tablas en BD) ──

export async function getEmailThreads(folder?: EmailFolder, token?: string): Promise<{ success: boolean; error?: string; data?: EmailThread[] }> {
  return { success: true, data: [] };
}

export async function getEmailThread(threadId: string, _token?: string): Promise<{ success: boolean; error?: string; data?: { thread: EmailThread; messages: EmailMessage[] } }> {
  return { success: false, error: 'No se encontraron hilos de correo en la base de datos.' };
}

export async function markThreadAsRead(threadId: string, _token?: string): Promise<{ success: boolean; error?: string }> {
  return { success: true };
}

export async function toggleThreadFlag(threadId: string, flag: EmailFlag, _token?: string): Promise<{ success: boolean; error?: string }> {
  return { success: true };
}

export async function moveThreadToFolder(threadId: string, folder: EmailFolder, _token?: string): Promise<{ success: boolean; error?: string }> {
  return { success: true };
}

// ── Messages ──

export async function sendEmail(data: {
  to: { name: string; email: string }[];
  cc?: { name: string; email: string }[];
  bcc?: { name: string; email: string }[];
  subject: string;
  body_text: string;
  thread_id?: string;
  account_id?: string;
  smtp_config?: { host: string; port: number; user: string; pass: string; fromName: string; fromEmail: string };
}, token?: string): Promise<{ success: boolean; error?: string; data?: EmailMessage }> {
  try {
    // 1. Enviar correo SMTP real
    const smtpResult = await sendEmailViaSmtp(
      {
        to: data.to,
        cc: data.cc,
        bcc: data.bcc,
        subject: data.subject,
        bodyText: data.body_text,
      },
      data.smtp_config
    );

    // 2. Crear estructura del mensaje de retorno
    const msg: EmailMessage = {
      id: generateId(),
      agency_id: 'ag-001',
      account_id: data.account_id || 'ema-001',
      thread_id: data.thread_id || generateId(),
      folder: 'sent',
      flags: smtpResult.success ? [] : ['unread'],
      from_name: data.smtp_config?.fromName || 'Real Top State',
      from_email: data.smtp_config?.fromEmail || 'info@real-top-state.com',
      to: data.to,
      cc: data.cc,
      bcc: data.bcc,
      subject: data.subject,
      body_text: data.body_text,
      size: data.body_text.length * 2,
      internal_date: new Date().toISOString(),
      received_at: new Date().toISOString(),
      sent_at: new Date().toISOString(),
      is_deleted: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    if (!smtpResult.success) {
      return { success: false, error: smtpResult.error || 'Error al enviar por SMTP.' };
    }

    return { success: true, data: msg };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function syncEmail(_token?: string): Promise<{ success: boolean; error?: string }> {
  return { success: true };
}
