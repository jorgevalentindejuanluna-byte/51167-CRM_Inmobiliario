'use server';

import { supabaseSelect } from '@/lib/supabase';
import { MOCK_EMAIL_MESSAGES, MOCK_EMAIL_THREADS, MOCK_EMAIL_ACCOUNTS } from '@/lib/mock-data';
import type { EmailMessage, EmailThread, EmailAccount, EmailFolder, EmailFlag } from '@/lib/models/types';

function generateId(): string {
  return `emm-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

// ── Accounts ──

export async function getEmailAccounts(token?: string): Promise<{ success: boolean; error?: string; data?: EmailAccount[] }> {
  try {
    try {
      const result = await supabaseSelect<EmailAccount>('email_accounts', { token });
      if (result && result.length > 0) return { success: true, data: result };
    } catch (err) {
      console.warn('[Email] Supabase error, fallback a mock', err);
    }
    return { success: true, data: MOCK_EMAIL_ACCOUNTS };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

// ── Threads ──

export async function getEmailThreads(folder?: EmailFolder, token?: string): Promise<{ success: boolean; error?: string; data?: EmailThread[] }> {
  try {
    try {
      const result = await supabaseSelect<EmailThread>('email_threads', { token });
      if (result && result.length > 0) {
        let filtered = result;
        if (folder) filtered = result.filter(t => t.folder === folder);
        return { success: true, data: filtered };
      }
    } catch (err) {
      console.warn('[Email] Supabase error, fallback a mock', err);
    }
    let threads = MOCK_EMAIL_THREADS;
    if (folder) threads = threads.filter(t => t.folder === folder);
    return { success: true, data: threads };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function getEmailThread(threadId: string, token?: string): Promise<{ success: boolean; error?: string; data?: { thread: EmailThread; messages: EmailMessage[] } }> {
  try {
    const thread = MOCK_EMAIL_THREADS.find(t => t.id === threadId);
    const messages = MOCK_EMAIL_MESSAGES.filter(m => m.thread_id === threadId);
    return { success: true, data: { thread: thread!, messages } };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function markThreadAsRead(threadId: string, token?: string): Promise<{ success: boolean; error?: string }> {
  try {
    const idx = MOCK_EMAIL_THREADS.findIndex(t => t.id === threadId);
    if (idx !== -1) {
      MOCK_EMAIL_THREADS[idx] = { ...MOCK_EMAIL_THREADS[idx], flags: MOCK_EMAIL_THREADS[idx].flags.filter(f => f !== 'unread') };
    }
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function toggleThreadFlag(threadId: string, flag: EmailFlag, token?: string): Promise<{ success: boolean; error?: string }> {
  try {
    const idx = MOCK_EMAIL_THREADS.findIndex(t => t.id === threadId);
    if (idx !== -1) {
      const has = MOCK_EMAIL_THREADS[idx].flags.includes(flag);
      MOCK_EMAIL_THREADS[idx] = {
        ...MOCK_EMAIL_THREADS[idx],
        flags: has ? MOCK_EMAIL_THREADS[idx].flags.filter(f => f !== flag) : [...MOCK_EMAIL_THREADS[idx].flags, flag],
      };
    }
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function moveThreadToFolder(threadId: string, folder: EmailFolder, token?: string): Promise<{ success: boolean; error?: string }> {
  try {
    const idx = MOCK_EMAIL_THREADS.findIndex(t => t.id === threadId);
    if (idx !== -1) {
      MOCK_EMAIL_THREADS[idx] = { ...MOCK_EMAIL_THREADS[idx], folder };
    }
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
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
}, token?: string): Promise<{ success: boolean; error?: string; data?: EmailMessage }> {
  try {
    const msg: EmailMessage = {
      id: generateId(),
      agency_id: 'ag-001',
      account_id: data.account_id || 'ema-001',
      thread_id: data.thread_id || generateId(),
      folder: 'sent',
      flags: [],
      from_name: 'Real Top State',
      from_email: 'info@real-top-state.com',
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
    MOCK_EMAIL_MESSAGES.push(msg);

    const thread: EmailThread = {
      id: msg.thread_id!,
      agency_id: 'ag-001',
      subject: data.subject,
      snippet: data.body_text.slice(0, 100),
      last_message_at: msg.sent_at!,
      message_count: 1,
      participants: data.to.map(p => p.name).join(', '),
      folder: 'sent',
      flags: [],
      is_deleted: false,
      created_at: msg.created_at,
      updated_at: msg.updated_at,
    };
    MOCK_EMAIL_THREADS.unshift(thread);

    return { success: true, data: msg };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function syncEmail(token?: string): Promise<{ success: boolean; error?: string }> {
  try {
    await new Promise(resolve => setTimeout(resolve, 1500));
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
