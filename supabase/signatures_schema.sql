-- ==========================================================================
-- ESQUEMA: FIRMA DIGITAL Y BIOMÉTRICA (REGLA 7)
-- Seguimiento legal de firmas de contratos y documentos.
-- ==========================================================================

CREATE TABLE IF NOT EXISTS public.signatures (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    agency_id UUID NOT NULL REFERENCES public.agencies(id) ON DELETE CASCADE,
    operation_id UUID REFERENCES public.operations(id) ON DELETE CASCADE,
    document_id UUID REFERENCES public.documents(id) ON DELETE SET NULL,
    
    title TEXT NOT NULL,
    type TEXT NOT NULL, -- 'digital' (AutoFirma), 'biometric' (Presencial)
    status TEXT NOT NULL DEFAULT 'borrador', -- 'borrador', 'enviado', 'firmado', 'rechazado', 'caducado'
    
    -- Datos del firmante
    signer_name TEXT NOT NULL,
    signer_id TEXT, -- DNI/NIE
    signer_email TEXT,
    
    -- Metadatos técnicos (Regla 7.3)
    biometric_data JSONB DEFAULT '{}'::jsonb, -- { strokes: [], pressure: [], device: {} }
    hash_documento TEXT, -- Hash SHA-256 del PDF original
    hash_firmado TEXT, -- Hash del documento tras la firma
    
    -- Auditoría
    ip_address TEXT,
    browser_info TEXT,
    location_data JSONB DEFAULT '{}'::jsonb,
    
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    signed_at TIMESTAMPTZ,
    expires_at TIMESTAMPTZ
);

-- RLS
ALTER TABLE public.signatures ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Signatures isolation by agency" ON public.signatures
    USING (agency_id = (auth.jwt() ->> 'agency_id')::uuid);

-- Trigger
CREATE TRIGGER update_signatures_updated_at
    BEFORE UPDATE ON public.signatures
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

PRINT 'Esquema de firmas generado con éxito.';
