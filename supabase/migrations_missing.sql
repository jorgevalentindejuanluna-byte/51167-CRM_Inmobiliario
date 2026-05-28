-- ==========================================================================
-- MIGRACIÓN DE TABLAS Y COLUMNAS FALTANTES — Real Top State CRM
-- Ejecuta este script en el SQL Editor de Supabase para habilitar todas las columnas y tablas.
-- ==========================================================================

-- 1. Añadir columnas faltantes a properties
ALTER TABLE public.properties 
ADD COLUMN IF NOT EXISTS referencia_catastral TEXT;

-- 2. Añadir columnas faltantes a agents
ALTER TABLE public.agents 
ADD COLUMN IF NOT EXISTS rol TEXT DEFAULT 'agente';

-- 3. Añadir columnas faltantes a agent_activity
ALTER TABLE public.agent_activity 
ADD COLUMN IF NOT EXISTS cliente_nombre TEXT,
ADD COLUMN IF NOT EXISTS propiedad_titulo TEXT;

-- 4. Crear tabla de comisiones de agentes si no existe
CREATE TABLE IF NOT EXISTS public.agent_commissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    agency_id UUID NOT NULL REFERENCES public.agencies(id) ON DELETE CASCADE,
    agent_id UUID NOT NULL REFERENCES public.agents(id) ON DELETE CASCADE,
    operation_id UUID REFERENCES public.operations(id) ON DELETE SET NULL,
    operation_titulo TEXT,
    property_id UUID REFERENCES public.properties(id) ON DELETE SET NULL,
    property_titulo TEXT,
    tipo_comision TEXT NOT NULL,
    concepto TEXT NOT NULL,
    base_calculo NUMERIC(12,2) DEFAULT 0,
    porcentaje NUMERIC(5,2) DEFAULT 0,
    importe NUMERIC(12,2) DEFAULT 0,
    estado TEXT NOT NULL DEFAULT 'calculada',
    fecha_generacion TIMESTAMPTZ DEFAULT now(),
    fecha_liquidacion TIMESTAMPTZ,
    notas TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- RLS para agent_commissions
ALTER TABLE public.agent_commissions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Comisiones vista agencia" ON public.agent_commissions;
CREATE POLICY "Comisiones vista agencia" ON public.agent_commissions
    FOR ALL USING (agency_id = (auth.jwt() ->> 'agency_id')::uuid);

-- 5. Crear tabla de asignaciones de clientes de agentes si no existe
CREATE TABLE IF NOT EXISTS public.agent_client_assignments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    agency_id UUID NOT NULL REFERENCES public.agencies(id) ON DELETE CASCADE,
    agent_id UUID NOT NULL REFERENCES public.agents(id) ON DELETE CASCADE,
    cliente_id UUID REFERENCES public.leads(id) ON DELETE CASCADE,
    cliente_nombre TEXT,
    cliente_apellidos TEXT,
    cliente_telefono TEXT,
    cliente_email TEXT,
    tipo_cliente TEXT NOT NULL DEFAULT 'comprador',
    tipo_asignacion TEXT NOT NULL DEFAULT 'principal',
    fecha_asignacion TIMESTAMPTZ DEFAULT now(),
    activo BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- RLS para agent_client_assignments
ALTER TABLE public.agent_client_assignments ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Asignaciones clientes vista agencia" ON public.agent_client_assignments;
CREATE POLICY "Asignaciones clientes vista agencia" ON public.agent_client_assignments
    FOR ALL USING (agency_id = (auth.jwt() ->> 'agency_id')::uuid);
