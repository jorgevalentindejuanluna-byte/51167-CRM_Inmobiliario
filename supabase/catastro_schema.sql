-- ==============================================================================
-- Módulo IA Urbanístico, Fiscal y Catastral
-- ==============================================================================

-- 1. Tabla de Historial de Consultas IA
CREATE TABLE IF NOT EXISTS public.ai_property_queries (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    property_id UUID REFERENCES public.properties(id) ON DELETE SET NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    agency_id UUID NOT NULL,
    query_type VARCHAR(50) NOT NULL CHECK (query_type IN ('urbanismo', 'ibi', 'catastro', 'completo')),
    province VARCHAR(255),
    municipality VARCHAR(255),
    address TEXT,
    cadastral_reference VARCHAR(50),
    input_payload JSONB,
    result_payload JSONB,
    sources JSONB,
    confidence_score DECIMAL(5,2),
    status VARCHAR(50) NOT NULL CHECK (status IN ('pending', 'completed', 'partial', 'failed', 'review_required')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Tabla de Caché Catastral
CREATE TABLE IF NOT EXISTS public.cadastral_cache (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    cadastral_reference VARCHAR(50) NOT NULL,
    province VARCHAR(255),
    municipality VARCHAR(255),
    raw_response TEXT,
    normalized_data JSONB,
    source_url TEXT,
    fetched_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE,
    UNIQUE (cadastral_reference)
);

-- Índices de búsqueda
CREATE INDEX IF NOT EXISTS idx_ai_property_queries_property_id ON public.ai_property_queries(property_id);
CREATE INDEX IF NOT EXISTS idx_ai_property_queries_agency_id ON public.ai_property_queries(agency_id);
CREATE INDEX IF NOT EXISTS idx_cadastral_cache_ref ON public.cadastral_cache(cadastral_reference);

-- Políticas RLS para ai_property_queries
ALTER TABLE public.ai_property_queries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Los agentes ven las consultas de su agencia" 
ON public.ai_property_queries FOR SELECT 
USING (
  agency_id = (SELECT agency_id FROM public.users WHERE public.users.id = auth.uid())
);

CREATE POLICY "Los agentes pueden insertar consultas para su agencia" 
ON public.ai_property_queries FOR INSERT 
WITH CHECK (
  agency_id = (SELECT agency_id FROM public.users WHERE public.users.id = auth.uid())
);

-- 3. Tabla de Caché de Ordenanzas Fiscales (IBI)
CREATE TABLE IF NOT EXISTS public.ibi_tax_cache (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    municipality VARCHAR(255) NOT NULL,
    province VARCHAR(255) NOT NULL,
    fiscal_year VARCHAR(4) NOT NULL,
    urban_rate DECIMAL(6,4),
    rustic_rate DECIMAL(6,4),
    bice_rate DECIMAL(6,4),
    bonuses JSONB,
    source_url TEXT,
    extracted_text TEXT,
    fetched_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    confidence_score DECIMAL(5,2),
    UNIQUE (municipality, province, fiscal_year)
);

CREATE INDEX IF NOT EXISTS idx_ibi_tax_cache_location ON public.ibi_tax_cache(municipality, province);
