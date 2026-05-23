/* ==========================================================================
   CONSTANTES — Real Top State CRM
   Estados, tipos y configuraciones definidas en el PRD
   ========================================================================== */

// ── Navegación principal (replicada de los diseños Stitch) ──
export const NAV_ITEMS = [
  { key: 'dashboard', label: 'Dashboard', icon: 'dashboard', path: '/dashboard' },
  { key: 'leads', label: 'Leads', icon: 'person_search', path: '/leads' },
  { key: 'pipeline', label: 'Pipeline', icon: 'account_tree', path: '/pipeline' },
  { key: 'properties', label: 'Inmuebles', icon: 'domain', path: '/properties' },
  { key: 'agents', label: 'Agentes', icon: 'badge', path: '/agents' },
  { key: 'documents', label: 'Documentos', icon: 'description', path: '/documents' },
  { key: 'invoices', label: 'Facturación', icon: 'receipt_long', path: '/invoices' },
  { key: 'ai', label: 'IA Insights', icon: 'psychology', path: '/ai' },
  { key: 'ai-urbanismo', label: 'IA Catastro', icon: 'map', path: '/ai-urbanismo-catastro' },
] as const;

export const NAV_BOTTOM_ITEMS = [
  { key: 'mobile', label: 'App Móvil', icon: 'smartphone', path: '/mobile' },
  { key: 'settings', label: 'Configuración', icon: 'settings', path: '/settings' },
  { key: 'support', label: 'Soporte', icon: 'help', path: '/support' },
] as const;

export const TOP_QUICK_LINKS = [
] as const;

// ── Etiquetas de estados de lead ──
export const LEAD_ESTADO_LABELS: Record<string, string> = {
  nuevo: 'Nuevo',
  contactado: 'Contactado',
  calificado: 'Calificado',
  no_cualificado: 'No cualificado',
  busqueda_activa: 'En búsqueda',
  perdido: 'Perdido',
};

export const LEAD_ESTADO_COLORS: Record<string, string> = {
  nuevo: 'info',
  contactado: 'primary',
  calificado: 'success',
  no_cualificado: 'neutral',
  busqueda_activa: 'warning',
  perdido: 'error',
};

// ── Etiquetas de temperaturas ──
export const LEAD_TEMP_LABELS: Record<string, string> = {
  caliente: 'Caliente',
  tibio: 'Tibio',
  frio: 'Frío',
};

// ── Etiquetas de orígenes ──
export const LEAD_ORIGEN_LABELS: Record<string, string> = {
  web: 'Web',
  idealista: 'Idealista',
  fotocasa: 'Fotocasa',
  habitaclia: 'Habitaclia',
  pisos_com: 'Pisos.com',
  whatsapp: 'WhatsApp',
  llamada: 'Llamada',
  referido: 'Referido',
  meta_ads: 'Meta Ads',
  google_ads: 'Google Ads',
  campana_interna: 'Campaña',
  landing_page: 'Landing',
  otro: 'Otro',
};

// ── Etiquetas de tipos de lead ──
export const LEAD_TIPO_LABELS: Record<string, string> = {
  comprador: 'Comprador',
  vendedor: 'Vendedor',
  inquilino: 'Inquilino',
  inversor: 'Inversor',
};

export const LEAD_TIPO_COLORS: Record<string, string> = {
  comprador: '#e67e22',
  vendedor: '#27ae60',
  inversor: '#2980b9',
  inquilino: '#95a5a6',
};

// ── Tipos de inmueble ──
export const TIPO_INMUEBLE_LABELS: Record<string, string> = {
  piso: 'Piso',
  casa: 'Casa',
  chalet: 'Chalet',
  local: 'Local',
  oficina: 'Oficina',
  nave: 'Nave',
  terreno: 'Terreno',
  garaje: 'Garaje',
  obra_nueva: 'Obra nueva',
  edificio: 'Edificio',
  activo_inversion: 'Activo inversión',
};

// ── Tipos de operación ──
export const TIPO_OPERACION_LABELS: Record<string, string> = {
  compra: 'Compra',
  venta: 'Venta',
  alquiler: 'Alquiler',
  captacion: 'Captación',
  inversion: 'Inversión',
  alquiler_opcion_compra: 'Alq. con opción',
};

// ── Formato de moneda (España) ──
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('es-ES', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

// ── Formato de fecha (España) ──
export function formatDate(date: string): string {
  return new Intl.DateTimeFormat('es-ES', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(new Date(date));
}

export function formatDateTime(date: string): string {
  return new Intl.DateTimeFormat('es-ES', {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(date));
}

export function formatRelativeTime(date: string): string {
  const now = new Date();
  const d = new Date(date);
  const diffMs = now.getTime() - d.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Ahora mismo';
  if (diffMins < 60) return `Hace ${diffMins} min`;
  if (diffHours < 24) return `Hace ${diffHours}h`;
  if (diffDays < 7) return `Hace ${diffDays}d`;
  return formatDate(date);
}

// ── Agentes ──
export const AGENT_TYPE_LABELS: Record<string, string> = {
  interno: 'Interno',
  externo: 'Externo',
  colaborador: 'Colaborador',
  captador: 'Captador',
  freelance: 'Freelance',
};

export const AGENT_STATUS_LABELS: Record<string, string> = {
  activo: 'Activo',
  inactivo: 'Inactivo',
  pendiente_validacion: 'Pendiente Validación',
  en_formacion: 'En Formación',
  suspendido: 'Suspendido',
  baja_temporal: 'Baja Temporal',
  baja_definitiva: 'Baja Definitiva',
  bloqueado: 'Bloqueado',
};

export const AGENT_STATUS_COLORS: Record<string, string> = {
  activo: 'success',
  inactivo: 'neutral',
  pendiente_validacion: 'warning',
  en_formacion: 'info',
  suspendido: 'error',
  baja_temporal: 'warning',
  baja_definitiva: 'error',
  bloqueado: 'error',
};

export const AGENT_RELACION_LABELS: Record<string, string> = {
  autonomo: 'Autónomo',
  laboral: 'Laboral',
  freelance: 'Freelance',
  colaborador_externo: 'Colaborador Externo',
};

// ── Actividad de agente ──
export const ACTIVITY_TIPO_LABELS: Record<string, string> = {
  llamada: 'Llamada',
  email: 'Email',
  whatsapp: 'WhatsApp',
  visita: 'Visita',
  reunion: 'Reunión',
  captacion: 'Captación',
  valoracion: 'Valoración',
  oferta: 'Oferta',
  reserva: 'Reserva',
  seguimiento: 'Seguimiento',
  nota: 'Nota interna',
  tarea: 'Tarea',
};

export const ACTIVITY_TIPO_ICONS: Record<string, string> = {
  llamada: 'phone',
  email: 'mail',
  whatsapp: 'chat',
  visita: 'home_work',
  reunion: 'groups',
  captacion: 'add_business',
  valoracion: 'price_change',
  oferta: 'request_quote',
  reserva: 'book_online',
  seguimiento: 'track_changes',
  nota: 'note',
  tarea: 'task_alt',
};

export const ACTIVITY_PRIORIDAD_LABELS: Record<string, string> = {
  baja: 'Baja',
  normal: 'Normal',
  alta: 'Alta',
  urgente: 'Urgente',
};

// ── Comisiones ──
export const COMMISSION_TIPO_LABELS: Record<string, string> = {
  captacion: 'Captación',
  venta: 'Venta',
  alquiler: 'Alquiler',
  exclusiva: 'Exclusiva',
  colaboracion: 'Colaboración',
  compartida: 'Compartida',
  objetivo: 'Objetivo',
  bonus: 'Bonus',
};

export const COMMISSION_ESTADO_LABELS: Record<string, string> = {
  calculada: 'Calculada',
  pendiente: 'Pendiente',
  validada: 'Validada',
  aprobada: 'Aprobada',
  liquidada: 'Liquidada',
  retenida: 'Retenida',
  anulada: 'Anulada',
};

export const COMMISSION_ESTADO_COLORS: Record<string, string> = {
  calculada: 'info',
  pendiente: 'warning',
  validada: 'info',
  aprobada: 'success',
  liquidada: 'success',
  retenida: 'error',
  anulada: 'error',
};

// ── Asignaciones ──
export const ASIGNACION_TIPO_LABELS: Record<string, string> = {
  principal: 'Principal',
  secundario: 'Secundario',
  captador: 'Captador',
  comercial_venta: 'Comercial Venta',
  comercial_alquiler: 'Comercial Alquiler',
};

// ── Cliente tipos ──
export const CLIENTE_TIPO_LABELS: Record<string, string> = {
  comprador: 'Comprador',
  vendedor: 'Vendedor',
  inquilino: 'Inquilino',
  inversor: 'Inversor',
  lead: 'Lead',
  propietario: 'Propietario',
};

// ── Resultados de actividad ──
export const ACTIVITY_RESULTADO_LABELS: Record<string, string> = {
  contactado: 'Contactado',
  no_contesta: 'No contesta',
  interesado: 'Interesado',
  no_interesado: 'No interesado',
  solicita_informacion: 'Solicita información',
  solicita_visita: 'Solicita visita',
  pendiente_decision: 'Pendiente de decisión',
  oferta_presentada: 'Oferta presentada',
  oferta_aceptada: 'Oferta aceptada',
  oferta_rechazada: 'Oferta rechazada',
  cliente_perdido: 'Cliente perdido',
  operacion_cerrada: 'Operación cerrada',
  seguimiento_futuro: 'Seguimiento futuro',
};
