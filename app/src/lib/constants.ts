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
  { key: 'documents', label: 'Documentos', icon: 'description', path: '/documents' },
  { key: 'invoices', label: 'Facturación', icon: 'receipt_long', path: '/invoices' },
  { key: 'ai', label: 'IA Insights', icon: 'psychology', path: '/ai' },
] as const;

export const NAV_BOTTOM_ITEMS = [
  { key: 'mobile', label: 'App Móvil', icon: 'smartphone', path: '/mobile' },
  { key: 'settings', label: 'Configuración', icon: 'settings', path: '/settings' },
  { key: 'support', label: 'Soporte', icon: 'help', path: '/support' },
] as const;

export const TOP_QUICK_LINKS = [
  { key: 'leads', label: 'Leads', path: '/leads' },
  { key: 'properties', label: 'Inmuebles', path: '/properties' },
  { key: 'calendar', label: 'Calendario', path: '/calendar' },
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
  propietario: 'Propietario',
  inquilino: 'Inquilino',
  inversor: 'Inversor',
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
