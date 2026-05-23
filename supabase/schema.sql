-- ==========================================================================
-- ESQUEMA DE BASE DE DATOS — Real Top State CRM
-- Basado en PostgreSQL (Supabase) con RLS (Row Level Security)
-- ==========================================================================

-- Habilitar extensiones necesarias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ==========================================
-- 1. AGENCIAS (SaaS Multiagencia)
-- ==========================================
CREATE TABLE agencies (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nombre_comercial TEXT NOT NULL,
    razon_social TEXT NOT NULL,
    cif TEXT NOT NULL,
    direccion TEXT NOT NULL,
    telefono TEXT NOT NULL,
    email TEXT NOT NULL,
    dominio TEXT,
    subdominio TEXT,
    plan_saas TEXT NOT NULL CHECK (plan_saas IN ('starter', 'professional', 'enterprise')),
    estado_suscripcion TEXT NOT NULL CHECK (estado_suscripcion IN ('activa', 'suspendida', 'cancelada', 'prueba')),
    limites_usuarios INTEGER NOT NULL DEFAULT 5,
    limites_propiedades INTEGER NOT NULL DEFAULT 50,
    limites_documentos INTEGER NOT NULL DEFAULT 1000,
    branding JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Habilitar RLS para agencies
ALTER TABLE agencies ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Agencias pueden ver su propio registro" 
    ON agencies FOR SELECT 
    USING (id = (auth.jwt()->'user_metadata'->>'agency_id')::uuid);


-- ==========================================
-- 2. USUARIOS (Empleados de la Agencia)
-- ==========================================
CREATE TABLE users (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    agency_id UUID NOT NULL REFERENCES agencies(id) ON DELETE CASCADE,
    nombre TEXT NOT NULL,
    apellidos TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    telefono TEXT,
    rol TEXT NOT NULL,
    estado TEXT NOT NULL CHECK (estado IN ('activo', 'inactivo', 'bloqueado')),
    ultimo_acceso TIMESTAMP WITH TIME ZONE,
    autenticacion_2fa BOOLEAN DEFAULT FALSE,
    avatar_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE users ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Aislamiento por agencia para usuarios" 
    ON users FOR ALL 
    USING (
        agency_id = (auth.jwt()->'user_metadata'->>'agency_id')::uuid 
        OR auth.uid() = id
    );


-- ==========================================
-- 3. LEADS (Prospectos)
-- ==========================================
CREATE TABLE leads (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    agency_id UUID NOT NULL REFERENCES agencies(id) ON DELETE CASCADE,
    nombre TEXT NOT NULL,
    apellidos TEXT NOT NULL,
    telefono TEXT,
    email TEXT,
    whatsapp TEXT,
    origen TEXT NOT NULL,
    campana TEXT,
    canal TEXT,
    portal_origen TEXT,
    tipo_lead TEXT NOT NULL,
    tipo_operacion TEXT,
    zona_interes TEXT,
    presupuesto_min NUMERIC,
    presupuesto_max NUMERIC,
    urgencia TEXT,
    temperatura TEXT NOT NULL,
    score INTEGER DEFAULT 0,
    estado TEXT NOT NULL,
    agente_asignado UUID REFERENCES users(id) ON DELETE SET NULL,
    proxima_accion TEXT,
    fecha_proxima_accion TIMESTAMP WITH TIME ZONE,
    
    -- RGPD
    consentimiento_rgpd BOOLEAN NOT NULL DEFAULT FALSE,
    canal_consentimiento TEXT,
    fecha_consentimiento TIMESTAMP WITH TIME ZONE,
    origen_dato TEXT,
    finalidad_tratamiento TEXT,
    
    notas TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE leads ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Aislamiento por agencia para leads" 
    ON leads FOR ALL 
    USING (agency_id = (auth.jwt()->'user_metadata'->>'agency_id')::uuid);


-- ==========================================
-- 4. CLIENTES
-- ==========================================
CREATE TABLE clients (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    agency_id UUID NOT NULL REFERENCES agencies(id) ON DELETE CASCADE,
    tipo_cliente TEXT NOT NULL,
    nombre TEXT NOT NULL,
    apellidos TEXT NOT NULL,
    telefono TEXT,
    email TEXT,
    documento_identidad TEXT,
    direccion TEXT,
    ciudad TEXT,
    provincia TEXT,
    codigo_postal TEXT,
    preferencias JSONB DEFAULT '{}'::jsonb,
    presupuesto NUMERIC,
    zonas_preferidas TEXT[],
    financiacion_aprobada BOOLEAN DEFAULT FALSE,
    estado_cliente TEXT NOT NULL,
    portal_activo BOOLEAN DEFAULT FALSE,
    ultimo_acceso_portal TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Aislamiento por agencia para clientes" 
    ON clients FOR ALL 
    USING (agency_id = (auth.jwt()->'user_metadata'->>'agency_id')::uuid);


-- ==========================================
-- 5. PROPIEDADES (Inmuebles)
-- ==========================================
CREATE TABLE properties (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    agency_id UUID NOT NULL REFERENCES agencies(id) ON DELETE CASCADE,
    referencia TEXT NOT NULL,
    titulo TEXT NOT NULL,
    tipo_inmueble TEXT NOT NULL,
    operacion TEXT NOT NULL,
    estado TEXT NOT NULL,
    direccion TEXT NOT NULL,
    zona TEXT,
    ciudad TEXT NOT NULL,
    provincia TEXT NOT NULL,
    codigo_postal TEXT,
    precio NUMERIC NOT NULL,
    precio_negociable BOOLEAN DEFAULT FALSE,
    superficie NUMERIC NOT NULL,
    habitaciones INTEGER,
    banos INTEGER,
    planta TEXT,
    ascensor BOOLEAN DEFAULT FALSE,
    garaje BOOLEAN DEFAULT FALSE,
    terraza BOOLEAN DEFAULT FALSE,
    piscina BOOLEAN DEFAULT FALSE,
    certificado_energetico TEXT,
    descripcion TEXT,
    propietario_id UUID, -- Referencia a lead/cliente propietario
    agente_responsable UUID REFERENCES users(id) ON DELETE SET NULL,
    fotos TEXT[] DEFAULT '{}',
    portales_publicados TEXT[] DEFAULT '{}',
    fecha_alta TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE properties ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Aislamiento por agencia para propiedades" 
    ON properties FOR ALL 
    USING (agency_id = (auth.jwt()->'user_metadata'->>'agency_id')::uuid);


-- ==========================================
-- 6. OPERACIONES (Pipeline Comercial)
-- ==========================================
CREATE TABLE operations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    agency_id UUID NOT NULL REFERENCES agencies(id) ON DELETE CASCADE,
    tipo_operacion TEXT NOT NULL,
    cliente_id UUID, -- Referencia genérica a lead/client comprador/inquilino
    comprador_id UUID,
    vendedor_id UUID,
    propietario_id UUID,
    propiedad_id UUID REFERENCES properties(id) ON DELETE SET NULL,
    agente_id UUID REFERENCES users(id) ON DELETE SET NULL,
    estado TEXT NOT NULL,
    precio_salida NUMERIC,
    precio_oferta NUMERIC,
    precio_cierre NUMERIC,
    honorarios_agencia NUMERIC,
    fecha_inicio TIMESTAMP WITH TIME ZONE,
    fecha_reserva TIMESTAMP WITH TIME ZONE,
    fecha_contrato TIMESTAMP WITH TIME ZONE,
    fecha_firma TIMESTAMP WITH TIME ZONE,
    fecha_cierre TIMESTAMP WITH TIME ZONE,
    firma_digital_estado TEXT,
    firma_biometrica_estado TEXT,
    estado_facturacion TEXT,
    notas TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE operations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Aislamiento por agencia para operaciones" 
    ON operations FOR ALL 
    USING (agency_id = (auth.jwt()->'user_metadata'->>'agency_id')::uuid);


-- ==========================================
-- TRIGGERS DE ACTUALIZACIÓN DE FECHAS
-- ==========================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_agencies_modtime BEFORE UPDATE ON agencies FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_users_modtime BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_leads_modtime BEFORE UPDATE ON leads FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_clients_modtime BEFORE UPDATE ON clients FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_properties_modtime BEFORE UPDATE ON properties FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_operations_modtime BEFORE UPDATE ON operations FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
