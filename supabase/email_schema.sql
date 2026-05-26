-- ============================================================================
-- ESQUEMA DE MENSAJERÍA EMAIL — Real Top State CRM
-- Módulo de mensajería vía protocolo IMAP
-- ============================================================================

-- ── Cuentas de email configuradas por agencia/usuario ──
CREATE TABLE IF NOT EXISTS email_accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agency_id UUID NOT NULL REFERENCES agencies(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  display_name TEXT NOT NULL,
  imap_host TEXT NOT NULL,
  imap_port INTEGER NOT NULL DEFAULT 993,
  imap_encryption TEXT NOT NULL DEFAULT 'ssl' CHECK (imap_encryption IN ('none', 'ssl', 'tls', 'starttls')),
  smtp_host TEXT NOT NULL,
  smtp_port INTEGER NOT NULL DEFAULT 587,
  smtp_encryption TEXT NOT NULL DEFAULT 'starttls' CHECK (smtp_encryption IN ('none', 'ssl', 'tls', 'starttls')),
  username TEXT NOT NULL,
  password_encrypted TEXT, -- cifrado a nivel de aplicación
  provider TEXT NOT NULL DEFAULT 'other' CHECK (provider IN ('other', 'gmail', 'outlook', 'yahoo')),
  sync_enabled BOOLEAN NOT NULL DEFAULT true,
  last_sync_at TIMESTAMPTZ,
  signature TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ── Hilos de conversación (threads) ──
CREATE TABLE IF NOT EXISTS email_threads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agency_id UUID NOT NULL REFERENCES agencies(id) ON DELETE CASCADE,
  subject TEXT NOT NULL,
  snippet TEXT,
  last_message_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  message_count INTEGER NOT NULL DEFAULT 1,
  participants TEXT NOT NULL,
  folder TEXT NOT NULL DEFAULT 'inbox' CHECK (folder IN ('inbox', 'sent', 'drafts', 'archived', 'spam', 'trash')),
  flags TEXT[] NOT NULL DEFAULT '{}', -- unread, important, starred, attachment
  is_deleted BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ── Mensajes individuales ──
CREATE TABLE IF NOT EXISTS email_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agency_id UUID NOT NULL REFERENCES agencies(id) ON DELETE CASCADE,
  account_id UUID NOT NULL REFERENCES email_accounts(id) ON DELETE CASCADE,
  thread_id UUID REFERENCES email_threads(id) ON DELETE SET NULL,
  folder TEXT NOT NULL DEFAULT 'inbox' CHECK (folder IN ('inbox', 'sent', 'drafts', 'archived', 'spam', 'trash')),
  flags TEXT[] NOT NULL DEFAULT '{}',
  from_name TEXT NOT NULL,
  from_email TEXT NOT NULL,
  "to" JSONB NOT NULL DEFAULT '[]', -- [{name, email}]
  cc JSONB DEFAULT '[]',
  bcc JSONB DEFAULT '[]',
  subject TEXT NOT NULL,
  body_text TEXT NOT NULL,
  body_html TEXT,
  in_reply_to TEXT,
  references TEXT[] DEFAULT '{}',
  size INTEGER NOT NULL DEFAULT 0,
  internal_date TIMESTAMPTZ NOT NULL DEFAULT now(),
  received_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  sent_at TIMESTAMPTZ,
  imap_uid INTEGER, -- UID original del servidor IMAP
  imap_folder TEXT, -- carpeta original en el servidor IMAP
  is_deleted BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ── Adjuntos ──
CREATE TABLE IF NOT EXISTS email_attachments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  message_id UUID NOT NULL REFERENCES email_messages(id) ON DELETE CASCADE,
  filename TEXT NOT NULL,
  mime_type TEXT NOT NULL,
  size INTEGER NOT NULL DEFAULT 0,
  storage_path TEXT, -- ruta en Supabase Storage
  imap_part_id TEXT, -- identificador de parte en IMAP
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ── Índices ──
CREATE INDEX IF NOT EXISTS idx_email_accounts_agency ON email_accounts(agency_id);
CREATE INDEX IF NOT EXISTS idx_email_accounts_user ON email_accounts(user_id);
CREATE INDEX IF NOT EXISTS idx_email_threads_agency ON email_threads(agency_id);
CREATE INDEX IF NOT EXISTS idx_email_threads_folder ON email_threads(agency_id, folder);
CREATE INDEX IF NOT EXISTS idx_email_threads_last_message ON email_threads(agency_id, last_message_at DESC);
CREATE INDEX IF NOT EXISTS idx_email_messages_thread ON email_messages(thread_id);
CREATE INDEX IF NOT EXISTS idx_email_messages_agency_folder ON email_messages(agency_id, folder);
CREATE INDEX IF NOT EXISTS idx_email_messages_internal_date ON email_messages(agency_id, internal_date DESC);
CREATE INDEX IF NOT EXISTS idx_email_attachments_message ON email_attachments(message_id);

-- ── Triggers ──
CREATE TRIGGER update_email_accounts_updated_at
  BEFORE UPDATE ON email_accounts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_email_threads_updated_at
  BEFORE UPDATE ON email_threads
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_email_messages_updated_at
  BEFORE UPDATE ON email_messages
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ── RLS ──
ALTER TABLE email_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_threads ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_attachments ENABLE ROW LEVEL SECURITY;

-- Políticas de aislamiento por agencia
CREATE POLICY email_accounts_agency_isolation ON email_accounts
  USING (agency_id = auth.jwt() ->> 'agency_id'::text)
  WITH CHECK (agency_id = auth.jwt() ->> 'agency_id'::text);

CREATE POLICY email_threads_agency_isolation ON email_threads
  USING (agency_id = auth.jwt() ->> 'agency_id'::text)
  WITH CHECK (agency_id = auth.jwt() ->> 'agency_id'::text);

CREATE POLICY email_messages_agency_isolation ON email_messages
  USING (agency_id = auth.jwt() ->> 'agency_id'::text)
  WITH CHECK (agency_id = auth.jwt() ->> 'agency_id'::text);

CREATE POLICY email_attachments_agency_isolation ON email_attachments
  USING (message_id IN (SELECT id FROM email_messages WHERE agency_id = (auth.jwt() ->> 'agency_id'::text)::uuid));
