/* ==========================================================================
   DATOS MOCK — Real Top State CRM (PURGADO - SUPABASE-ONLY)
   Se han eliminado todos los datos falsos y fallbacks locales.
   Conserva únicamente las variables exportadas vacías por compatibilidad de tipos.
   ========================================================================== */

import { Lead, User, Property, Agency, Operation, CRMDocument, Agent, AgentActivity, AgentPropertyAssignment, AgentClientAssignment, AgentCommission, EmailMessage, EmailAccount, EmailThread } from '@/lib/models/types';

// ── Agencia base vacía ──
export const MOCK_AGENCY: Agency = {
  id: '00000000-0000-0000-0000-000054b947f6', // UUID de ag-001
  nombre_comercial: '',
  razon_social: '',
  cif: '',
  direccion: '',
  telefono: '',
  email: '',
  dominio: '',
  plan_saas: 'professional',
  estado_suscripcion: 'activa',
  limites_usuarios: 25,
  limites_propiedades: 500,
  limites_documentos: 5000,
  branding: {},
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
};

// ── Colecciones vacías ──
export const MOCK_USERS: User[] = [];
export const MOCK_LEADS: Lead[] = [];
export const MOCK_PROPERTIES: Property[] = [];
export const MOCK_OPERATIONS: Operation[] = [];
export const MOCK_ACTIVITY: any[] = [];

// ── KPIs a cero ──
export const MOCK_DASHBOARD_KPIS = {
  leads_totales: 0,
  leads_nuevos_mes: 0,
  propiedades_activas: 0,
  operaciones_en_curso: 0,
  visitas_semana: 0,
  facturacion_ytd: 0,
  tasa_conversion: 0,
  leads_sin_contactar: 0,
  documentos_pendientes: 0,
  firmas_pendientes: 0,
  facturas_vencidas: 0,
  encargos_proximos_caducar: 0,
};

// ── Usuario actual vacío (la autenticación real proveerá el objeto) ──
export const MOCK_CURRENT_USER: User = {
  id: '',
  agency_id: '',
  nombre: '',
  apellidos: '',
  email: '',
  rol: 'agente',
  estado: 'activo',
  autenticacion_2fa: false,
  created_at: '',
  updated_at: ''
};

export const MOCK_DOCUMENTS: CRMDocument[] = [
  {
    id: 'doc-001',
    agency_id: '00000000-0000-0000-0000-000054b947f6',
    lead_id: 'lead-001',
    name: 'contrato_arras_venta.pdf',
    type: 'Contrato de Arras',
    url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
    size: 85432,
    status: 'aprobado',
    visibility: 'interno',
    metadata: {
      extracted: true,
      signatures: { status: 'firmado', firmante: 'Cliente A', signed_at: '2026-05-20T10:30:00Z', hash_documento: 'a3f2b8c9d1e4f5...' }
    },
    created_at: '2026-05-15T08:00:00Z',
    updated_at: '2026-05-20T10:30:00Z',
  },
  {
    id: 'doc-002',
    agency_id: '00000000-0000-0000-0000-000054b947f6',
    property_id: 'prop-001',
    name: 'informe_registral_propiedad.pdf',
    type: 'Nota Simple',
    url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
    size: 245671,
    status: 'aprobado',
    visibility: 'publico',
    metadata: { extracted: true },
    created_at: '2026-05-10T09:00:00Z',
    updated_at: '2026-05-12T11:00:00Z',
  },
  {
    id: 'doc-003',
    agency_id: '00000000-0000-0000-0000-000054b947f6',
    lead_id: 'lead-002',
    name: 'dni_comprador.pdf',
    type: 'DNI/NIF',
    url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
    size: 128904,
    status: 'revisado',
    visibility: 'interno',
    metadata: { extracted: true },
    created_at: '2026-05-18T14:00:00Z',
    updated_at: '2026-05-19T09:00:00Z',
  },
  {
    id: 'doc-004',
    agency_id: '00000000-0000-0000-0000-000054b947f6',
    operation_id: 'op-001',
    name: 'certificado_eficiencia_energetica.pdf',
    type: 'Certificado Energético',
    url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
    size: 342156,
    status: 'subido',
    visibility: 'publico',
    metadata: {},
    created_at: '2026-05-22T16:00:00Z',
    updated_at: '2026-05-22T16:00:00Z',
  },
  {
    id: 'doc-005',
    agency_id: '00000000-0000-0000-0000-000054b947f6',
    lead_id: 'lead-003',
    name: 'escritura_compraventa.pdf',
    type: 'Escritura',
    url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
    size: 512890,
    status: 'pendiente',
    visibility: 'interno',
    metadata: {},
    created_at: '2026-05-25T10:00:00Z',
    updated_at: '2026-05-25T10:00:00Z',
  },
  {
    id: 'doc-006',
    agency_id: '00000000-0000-0000-0000-000054b947f6',
    property_id: 'prop-002',
    name: 'fotos_interior_vivienda.zip',
    type: 'Reportaje Fotográfico',
    url: '',
    size: 15843200,
    status: 'aprobado',
    visibility: 'publico',
    metadata: { extracted: false },
    created_at: '2026-05-08T11:00:00Z',
    updated_at: '2026-05-09T15:00:00Z',
  },
];
export const MOCK_AGENTS: Agent[] = [];
export const MOCK_AGENT_ACTIVITIES: AgentActivity[] = [];
export const MOCK_AGENT_PROPERTIES: AgentPropertyAssignment[] = [];
export const MOCK_AGENT_CLIENTS: AgentClientAssignment[] = [];
export const MOCK_AGENT_COMMISSIONS: AgentCommission[] = [];
export const MOCK_EMAIL_ACCOUNTS: EmailAccount[] = [];
export const MOCK_EMAIL_THREADS: EmailThread[] = [];
export const MOCK_EMAIL_MESSAGES: EmailMessage[] = [];

// ── Conversión determinista a UUID para compatibilidad de URLs antiguas si se requiere ──
export function toUUID(mockId: string | undefined): string | null {
  if (!mockId) return null;
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  if (uuidRegex.test(mockId)) return mockId;
  
  let hash = 0;
  for (let i = 0; i < mockId.length; i++) {
    hash = mockId.charCodeAt(i) + ((hash << 5) - hash);
  }
  const hex = Math.abs(hash).toString(16).padStart(12, '0');
  const uuid = `00000000-0000-0000-0000-${hex}`;
  
  return uuid;
}
