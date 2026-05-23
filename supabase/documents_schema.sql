-- ==========================================================================
-- ESQUEMA AVANZADO: GESTIÓN DOCUMENTAL (REGLA 6)
-- Configuración de tabla y políticas para almacenamiento seguro.
-- ==========================================================================

-- 1. Tabla de Documentos
CREATE TABLE IF NOT EXISTS public.documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    agency_id UUID NOT NULL REFERENCES public.agencies(id) ON DELETE CASCADE,
    lead_id UUID REFERENCES public.leads(id) ON DELETE CASCADE,
    operation_id UUID REFERENCES public.operations(id) ON DELETE SET NULL,
    property_id UUID REFERENCES public.properties(id) ON DELETE SET NULL,
    
    name TEXT NOT NULL,
    type TEXT NOT NULL, -- 'dni', 'nomina', 'contrato', 'nota_simple', etc.
    url TEXT NOT NULL, -- Ruta en Supabase Storage
    size BIGINT,
    
    status TEXT NOT NULL DEFAULT 'pendiente', -- 'pendiente', 'subido', 'revisado', 'aprobado', 'rechazado'
    visibility TEXT NOT NULL DEFAULT 'interno', -- 'interno', 'publico' (visible al cliente)
    
    metadata JSONB DEFAULT '{}'::jsonb, -- Datos extraídos por OCR
    
    uploaded_by UUID REFERENCES public.users(id),
    reviewed_by UUID REFERENCES public.users(id),
    
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2. Habilitar RLS en Documents
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;

-- 3. Políticas RLS (Aislamiento Multiagencia - Regla 3.2)
CREATE POLICY "Documents isolation by agency" ON public.documents
    USING (agency_id = (auth.jwt() -> 'user_metadata' ->> 'agency_id')::uuid);

-- 4. Triggers de updated_at
CREATE TRIGGER update_documents_updated_at
    BEFORE UPDATE ON public.documents
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 5. Configuración de Storage (Políticas para Bucket 'documents')
-- Nota: Estas políticas se aplican al esquema storage
/*
INSERT INTO storage.buckets (id, name, public) VALUES ('documents', 'documents', false);

CREATE POLICY "Documents storage isolation" ON storage.objects
    FOR ALL USING (
        bucket_id = 'documents' 
        AND (storage.foldername(name))[1] = (auth.jwt() -> 'user_metadata' ->> 'agency_id')
    );
*/

PRINT 'Esquema de documentos generado con éxito. Aplicar en Supabase SQL Editor.';
