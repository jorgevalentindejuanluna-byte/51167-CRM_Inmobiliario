-- ==========================================================================
-- ESQUEMA: CORREO ELECTRÓNICO (Módulo Email)
-- Tablas para cuentas, hilos, mensajes y adjuntos.
-- ==========================================================================

-- ── Cuentas de correo (SMTP/IMAP) ──
CREATE TABLE IF NOT EXISTS public.email_accounts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    agency_id UUID NOT NULL REFERENCES public.agencies(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    display_name TEXT NOT NULL,
    imap_host TEXT NOT NULL DEFAULT '',
    imap_port INTEGER NOT NULL DEFAULT 993,
    imap_encryption TEXT NOT NULL DEFAULT 'ssl',
    smtp_host TEXT NOT NULL DEFAULT '',
    smtp_port INTEGER NOT NULL DEFAULT 587,
    smtp_encryption TEXT NOT NULL DEFAULT 'starttls',
    smtp_user TEXT NOT NULL DEFAULT '',
    smtp_pass TEXT NOT NULL DEFAULT '',
    provider TEXT NOT NULL DEFAULT 'other',
    sync_enabled BOOLEAN NOT NULL DEFAULT false,
    last_sync_at TIMESTAMPTZ,
    signature TEXT DEFAULT '',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ── Hilos de conversación ──
CREATE TABLE IF NOT EXISTS public.email_threads (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    agency_id UUID NOT NULL REFERENCES public.agencies(id) ON DELETE CASCADE,
    subject TEXT NOT NULL DEFAULT '',
    snippet TEXT NOT NULL DEFAULT '',
    last_message_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    message_count INTEGER NOT NULL DEFAULT 0,
    participants TEXT NOT NULL DEFAULT '',
    folder TEXT NOT NULL DEFAULT 'inbox',
    flags JSONB NOT NULL DEFAULT '[]'::jsonb,
    is_deleted BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ── Mensajes individuales ──
CREATE TABLE IF NOT EXISTS public.email_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    agency_id UUID NOT NULL REFERENCES public.agencies(id) ON DELETE CASCADE,
    account_id UUID REFERENCES public.email_accounts(id) ON DELETE SET NULL,
    thread_id UUID REFERENCES public.email_threads(id) ON DELETE CASCADE,
    folder TEXT NOT NULL DEFAULT 'inbox',
    flags JSONB NOT NULL DEFAULT '[]'::jsonb,
    from_name TEXT NOT NULL DEFAULT '',
    from_email TEXT NOT NULL DEFAULT '',
    to_list JSONB NOT NULL DEFAULT '[]'::jsonb,
    cc_list JSONB DEFAULT '[]'::jsonb,
    bcc_list JSONB DEFAULT '[]'::jsonb,
    subject TEXT NOT NULL DEFAULT '',
    body_text TEXT NOT NULL DEFAULT '',
    body_html TEXT DEFAULT '',
    in_reply_to TEXT,
    references_list JSONB DEFAULT '[]'::jsonb,
    size INTEGER NOT NULL DEFAULT 0,
    internal_date TIMESTAMPTZ NOT NULL DEFAULT now(),
    received_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    sent_at TIMESTAMPTZ,
    is_deleted BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ── Adjuntos ──
CREATE TABLE IF NOT EXISTS public.email_attachments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    message_id UUID NOT NULL REFERENCES public.email_messages(id) ON DELETE CASCADE,
    filename TEXT NOT NULL,
    mime_type TEXT NOT NULL DEFAULT 'application/octet-stream',
    size INTEGER NOT NULL DEFAULT 0,
    url TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- RLS
ALTER TABLE public.email_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_threads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_attachments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Email accounts isolation by agency" ON public.email_accounts
    USING (agency_id = (auth.jwt() -> 'user_metadata' ->> 'agency_id')::uuid);

CREATE POLICY "Email threads isolation by agency" ON public.email_threads
    USING (agency_id = (auth.jwt() -> 'user_metadata' ->> 'agency_id')::uuid);

CREATE POLICY "Email messages isolation by agency" ON public.email_messages
    USING (agency_id = (auth.jwt() -> 'user_metadata' ->> 'agency_id')::uuid);

CREATE POLICY "Email attachments via message" ON public.email_attachments
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.email_messages m
            WHERE m.id = message_id
            AND m.agency_id = (auth.jwt() -> 'user_metadata' ->> 'agency_id')::uuid
        )
    );

-- Triggers
CREATE TRIGGER update_email_accounts_updated_at
    BEFORE UPDATE ON public.email_accounts
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_email_threads_updated_at
    BEFORE UPDATE ON public.email_threads
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_email_messages_updated_at
    BEFORE UPDATE ON public.email_messages
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
