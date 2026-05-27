CREATE TABLE IF NOT EXISTS public.doc_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    agency_id TEXT NOT NULL DEFAULT 'ag-001',
    lead_id TEXT,
    property_id TEXT,
    contact_name TEXT NOT NULL,
    contact_email TEXT NOT NULL,
    doc_type TEXT NOT NULL,
    notes TEXT,
    status TEXT NOT NULL DEFAULT 'pendiente', -- 'pendiente', 'completada', 'cancelada'
    token TEXT NOT NULL UNIQUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    completed_at TIMESTAMPTZ,
    expires_at TIMESTAMPTZ
);

ALTER TABLE public.doc_requests ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Doc requests isolation by agency" ON public.doc_requests;
CREATE POLICY "Allow all" ON public.doc_requests
    USING (true) WITH CHECK (true);
