CREATE TABLE IF NOT EXISTS public.signatures (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    agency_id TEXT NOT NULL DEFAULT 'ag-001',
    operation_id TEXT,
    document_id TEXT,

    title TEXT NOT NULL,
    type TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'borrador',

    signer_name TEXT NOT NULL,
    signer_id TEXT,
    signer_email TEXT,

    token TEXT,
    signature_image_url TEXT,
    signed_document_url TEXT,

    biometric_data JSONB DEFAULT '{}'::jsonb,
    hash_documento TEXT,
    hash_firmado TEXT,

    ip_address TEXT,
    browser_info TEXT,
    location_data JSONB DEFAULT '{}'::jsonb,

    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    signed_at TIMESTAMPTZ,
    expires_at TIMESTAMPTZ
);

ALTER TABLE public.signatures ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Signatures isolation by agency" ON public.signatures;
CREATE POLICY "Allow all" ON public.signatures
    USING (true) WITH CHECK (true);

DROP TRIGGER IF EXISTS update_signatures_updated_at ON public.signatures;
