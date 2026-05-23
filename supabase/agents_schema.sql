-- ==========================================================================
-- MÓDULO DE AGENTES INMOBILIARIOS — Esquema Supabase (PostgreSQL)
-- Basado en PRD módulo_agentes.md
-- ==========================================================================

-- ── Agentes ──
CREATE TABLE IF NOT EXISTS agents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agency_id UUID NOT NULL REFERENCES agencies(id) ON DELETE CASCADE,
  -- Personales
  nombre TEXT NOT NULL,
  apellidos TEXT NOT NULL,
  documento_identidad TEXT,
  fecha_nacimiento DATE,
  telefono TEXT NOT NULL,
  email TEXT NOT NULL,
  direccion TEXT,
  ciudad TEXT,
  provincia TEXT,
  codigo_postal TEXT,
  foto_url TEXT,
  idiomas TEXT[] DEFAULT '{}',
  -- Profesionales
  tipo_agente TEXT NOT NULL CHECK (tipo_agente IN ('interno','externo','colaborador','captador','freelance')),
  codigo_interno TEXT,
  oficina TEXT,
  equipo TEXT,
  responsable_id UUID REFERENCES agents(id),
  fecha_alta TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  fecha_baja TIMESTAMPTZ,
  estado TEXT NOT NULL DEFAULT 'activo' CHECK (estado IN ('activo','inactivo','pendiente_validacion','en_formacion','suspendido','baja_temporal','baja_definitiva','bloqueado')),
  zona_principal TEXT,
  zonas_secundarias TEXT[] DEFAULT '{}',
  especializacion TEXT[] DEFAULT '{}',
  experiencia_anios INTEGER,
  numero_colegiado TEXT,
  numero_api TEXT,
  certificaciones TEXT[] DEFAULT '{}',
  nivel_comercial INTEGER DEFAULT 1 CHECK (nivel_comercial BETWEEN 1 AND 5),
  -- Económicos
  tipo_relacion TEXT CHECK (tipo_relacion IN ('autonomo','laboral','freelance','colaborador_externo')),
  porcentaje_comision NUMERIC(5,2),
  comision_fija NUMERIC(12,2),
  comision_captacion NUMERIC(5,2),
  comision_venta NUMERIC(5,2),
  comision_alquiler NUMERIC(5,2),
  comision_exclusiva NUMERIC(5,2),
  cuenta_bancaria TEXT,
  -- Acceso
  email_acceso TEXT,
  autenticacion_2fa BOOLEAN DEFAULT false,
  ultimo_acceso TIMESTAMPTZ,
  -- Métricas (cálculos periódicos)
  inmuebles_asignados INTEGER DEFAULT 0,
  clientes_asignados INTEGER DEFAULT 0,
  operaciones_abiertas INTEGER DEFAULT 0,
  ventas_cerradas INTEGER DEFAULT 0,
  alquileres_cerrados INTEGER DEFAULT 0,
  comision_generada NUMERIC(14,2) DEFAULT 0,
  objetivo_mensual NUMERIC(12,2),
  cumplimiento_objetivo NUMERIC(5,2) DEFAULT 0,
  -- Auditoría
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Índices
CREATE INDEX idx_agents_agency ON agents(agency_id);
CREATE INDEX idx_agents_estado ON agents(estado);
CREATE INDEX idx_agents_oficina ON agents(oficina);
CREATE INDEX idx_agents_responsable ON agents(responsable_id);
CREATE INDEX idx_agents_zona ON agents(zona_principal);
CREATE INDEX idx_agents_tipo ON agents(tipo_agente);

-- Trigger updated_at
CREATE OR REPLACE FUNCTION trigger_set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_agents_updated_at
  BEFORE UPDATE ON agents
  FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();

-- RLS
ALTER TABLE agents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Agentes vista agencia" ON agents
  FOR ALL USING (agency_id = auth.jwt() ->> 'agency_id');

-- ── Actividad de agente ──
CREATE TABLE IF NOT EXISTS agent_activity (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agency_id UUID NOT NULL REFERENCES agencies(id) ON DELETE CASCADE,
  agent_id UUID NOT NULL REFERENCES agents(id) ON DELETE CASCADE,
  tipo TEXT NOT NULL CHECK (tipo IN ('llamada','email','whatsapp','visita','reunion','captacion','valoracion','oferta','reserva','seguimiento','nota','tarea')),
  fecha TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  duracion_minutos INTEGER,
  cliente_id UUID,
  propiedad_id UUID,
  resultado TEXT,
  proximo_paso TEXT,
  fecha_proximo_seguimiento TIMESTAMPTZ,
  prioridad TEXT DEFAULT 'normal' CHECK (prioridad IN ('baja','normal','alta','urgente')),
  observaciones TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_agent_activity_agent ON agent_activity(agent_id);
CREATE INDEX idx_agent_activity_fecha ON agent_activity(fecha);
ALTER TABLE agent_activity ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Actividad vista agencia" ON agent_activity
  FOR ALL USING (agency_id = auth.jwt() ->> 'agency_id');

-- ── Asignaciones agente-inmueble ──
CREATE TABLE IF NOT EXISTS agent_property_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agency_id UUID NOT NULL REFERENCES agencies(id) ON DELETE CASCADE,
  agent_id UUID NOT NULL REFERENCES agents(id) ON DELETE CASCADE,
  property_id UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
  tipo_asignacion TEXT NOT NULL CHECK (tipo_asignacion IN ('principal','secundario','captador','comercial_venta','comercial_alquiler')),
  porcentaje_comision NUMERIC(5,2),
  fecha_asignacion TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  fecha_desasignacion TIMESTAMPTZ,
  motivo_asignacion TEXT,
  activo BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_agent_prop_assign ON agent_property_assignments(agent_id, property_id);
ALTER TABLE agent_property_assignments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Asignaciones vista agencia" ON agent_property_assignments
  FOR ALL USING (agency_id = auth.jwt() ->> 'agency_id');
