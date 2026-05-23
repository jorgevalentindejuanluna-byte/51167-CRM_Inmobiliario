/* ==========================================================================
   MODELOS DE DATOS — Real Top State CRM
   Basado en el PRD (secciones 5.1-5.13) y reglas crm-inmobiliaria.md
   Toda entidad principal incluye agency_id (regla 3.1)
   ========================================================================== */

// ── Agencia (5.1 PRD) ──
export interface Agency {
  id: string;
  nombre_comercial: string;
  razon_social: string;
  cif: string;
  direccion: string;
  telefono: string;
  email: string;
  dominio?: string;
  subdominio?: string;
  plan_saas: 'starter' | 'professional' | 'enterprise';
  estado_suscripcion: 'activa' | 'suspendida' | 'cancelada' | 'prueba';
  limites_usuarios: number;
  limites_propiedades: number;
  limites_documentos: number;
  branding?: AgencyBranding;
  created_at: string;
  updated_at: string;
}

export interface AgencyBranding {
  logo_url?: string;
  color_primario?: string;
  color_secundario?: string;
}

// ── Roles de usuario (4.1-4.3 PRD) ──
export type UserRole =
  | 'superadmin_saas'
  | 'admin_agencia'
  | 'director_comercial'
  | 'agente'
  | 'captador'
  | 'coordinador_admin'
  | 'gestor_documental'
  | 'responsable_contable'
  | 'solo_lectura';

export type ClientRole =
  | 'comprador'
  | 'vendedor'
  | 'inquilino'
  | 'inversor';

// ── Usuario (5.2 PRD) ──
export interface User {
  id: string;
  agency_id: string;
  nombre: string;
  apellidos: string;
  email: string;
  telefono?: string;
  rol: UserRole;
  estado: 'activo' | 'inactivo' | 'bloqueado';
  ultimo_acceso?: string;
  autenticacion_2fa: boolean;
  avatar_url?: string;
  created_at: string;
  updated_at: string;
}

// ── Lead (5.3 PRD) ──
export type LeadTipo = 'comprador' | 'vendedor' | 'inquilino' | 'inversor';

export type LeadEstado =
  | 'nuevo'
  | 'contactado'
  | 'calificado'
  | 'no_cualificado'
  | 'busqueda_activa'
  | 'perdido';

export type LeadTemperatura = 'caliente' | 'tibio' | 'frio';

export type LeadOrigen =
  | 'web'
  | 'idealista'
  | 'fotocasa'
  | 'habitaclia'
  | 'pisos_com'
  | 'whatsapp'
  | 'llamada'
  | 'referido'
  | 'meta_ads'
  | 'google_ads'
  | 'campana_interna'
  | 'landing_page'
  | 'otro';

export interface Lead {
  id: string;
  agency_id: string;               // Regla 3.1: obligatorio
  nombre: string;
  apellidos: string;
  telefono?: string;
  email?: string;
  whatsapp?: string;
  origen: LeadOrigen;
  campana?: string;
  canal?: string;
  portal_origen?: string;
  tipo_lead: LeadTipo;
  tipo_operacion?: TipoOperacion;
  zona_interes?: string;
  presupuesto_min?: number;
  presupuesto_max?: number;
  urgencia?: 'baja' | 'media' | 'alta' | 'urgente';
  temperatura: LeadTemperatura;
  score: number;                    // 0-100, calculado por IA
  estado: LeadEstado;
  agente_asignado?: string;         // user.id
  proxima_accion?: string;
  fecha_proxima_accion?: string;
  // RGPD (regla 5.2)
  consentimiento_rgpd: boolean;
  canal_consentimiento?: string;
  fecha_consentimiento?: string;
  origen_dato?: string;
  finalidad_tratamiento?: string;
  notas?: string;
  created_at: string;
  updated_at: string;
}

// ── Cliente (5.4 PRD) ──
export type TipoCliente = 'comprador' | 'vendedor' | 'inquilino' | 'inversor';

export interface Client {
  id: string;
  agency_id: string;
  tipo_cliente: TipoCliente;
  nombre: string;
  apellidos: string;
  telefono?: string;
  email?: string;
  documento_identidad?: string;     // Dato sensible (regla 5.3)
  direccion?: string;
  ciudad?: string;
  provincia?: string;
  codigo_postal?: string;
  preferencias?: ClientPreferences;
  presupuesto?: number;
  zonas_preferidas?: string[];
  financiacion_aprobada?: boolean;
  estado_cliente: 'activo' | 'inactivo' | 'archivado';
  portal_activo: boolean;
  ultimo_acceso_portal?: string;
  created_at: string;
  updated_at: string;
}

export interface ClientPreferences {
  tipo_inmueble?: TipoInmueble[];
  habitaciones_min?: number;
  habitaciones_max?: number;
  superficie_min?: number;
  superficie_max?: number;
  planta_preferida?: string;
  ascensor?: boolean;
  garaje?: boolean;
  terraza?: boolean;
  piscina?: boolean;
}

// ── Propiedad (5.5 PRD) ──
export type TipoInmueble =
  | 'piso'
  | 'casa'
  | 'chalet'
  | 'local'
  | 'oficina'
  | 'nave'
  | 'terreno'
  | 'garaje'
  | 'obra_nueva'
  | 'edificio'
  | 'activo_inversion';

export type TipoOperacion =
  | 'compra'
  | 'venta'
  | 'alquiler'
  | 'captacion'
  | 'inversion'
  | 'alquiler_opcion_compra';

export type PropertyEstado =
  | 'disponible'
  | 'reservado'
  | 'vendido'
  | 'alquilado'
  | 'retirado'
  | 'en_captacion'
  | 'pendiente';

export interface Property {
  id: string;
  agency_id: string;
  referencia: string;
  titulo: string;
  tipo_inmueble: TipoInmueble;
  operacion: TipoOperacion;
  estado: PropertyEstado;
  direccion: string;
  zona?: string;
  ciudad: string;
  provincia: string;
  codigo_postal?: string;
  referencia_catastral?: string;
  precio: number;
  precio_negociable?: boolean;
  superficie: number;
  habitaciones?: number;
  banos?: number;
  planta?: string;
  ascensor?: boolean;
  garaje?: boolean;
  terraza?: boolean;
  piscina?: boolean;
  calefaccion?: boolean;
  aire_acondicionado?: boolean;
  trastero?: boolean;
  acceso_minusvalidos?: boolean;
  gimnasio?: boolean;
  seguridad_24h?: boolean;
  jardin?: boolean;
  balcon?: boolean;
  armarios_empotrados?: boolean;
  amueblado?: boolean;
  mascotas_permitidas?: boolean;
  certificado_energetico?: string;
  descripcion?: string;
  propietario_id?: string;
  agente_responsable?: string;
  fotos?: string[];
  portales_publicados?: string[];
  fecha_alta: string;
  created_at: string;
  updated_at: string;
}

// ── Operación (5.6 PRD) ──
export type OperationEstado =
  | 'inicio'
  | 'calificacion'
  | 'busqueda'
  | 'visitas'
  | 'oferta'
  | 'negociacion'
  | 'reserva'
  | 'documentacion'
  | 'firma'
  | 'cierre'
  | 'facturado'
  | 'cobrado'
  | 'cerrada'
  | 'cancelada';

export interface Operation {
  id: string;
  agency_id: string;
  tipo_operacion: TipoOperacion;
  cliente_id?: string;
  comprador_id?: string;
  vendedor_id?: string;
  propietario_id?: string;
  propiedad_id?: string;
  agente_id?: string;
  estado: OperationEstado;
  precio_salida?: number;
  precio_oferta?: number;
  precio_cierre?: number;
  honorarios_agencia?: number;
  fecha_inicio?: string;
  fecha_reserva?: string;
  fecha_contrato?: string;
  fecha_firma?: string;
  fecha_cierre?: string;
  firma_digital_estado?: string;
  firma_biometrica_estado?: string;
  estado_facturacion?: string;
  notas?: string;
  created_at: string;
  updated_at: string;
}

// ── Visita (5.7 PRD) ──
export type VisitEstado =
  | 'programada'
  | 'confirmada'
  | 'realizada'
  | 'cancelada'
  | 'no_asistio'
  | 'reprogramada';

export interface Visit {
  id: string;
  agency_id: string;
  cliente_id: string;
  propiedad_id: string;
  agente_id: string;
  fecha: string;
  hora: string;
  estado: VisitEstado;
  feedback_cliente?: string;
  feedback_agente?: string;
  nivel_interes?: 'bajo' | 'medio' | 'alto' | 'muy_alto';
  proxima_accion?: string;
  notas?: string;
}

// ── Tarea (5.13 PRD) ──
export type TaskTipo =
  | 'llamada'
  | 'whatsapp'
  | 'email'
  | 'visita'
  | 'documentacion'
  | 'firma'
  | 'facturacion'
  | 'seguimiento'
  | 'valoracion'
  | 'negociacion';

export interface Task {
  id: string;
  agency_id: string;
  titulo: string;
  descripcion?: string;
  tipo: TaskTipo;
  prioridad: 'baja' | 'media' | 'alta' | 'urgente';
  fecha_vencimiento?: string;
  estado: 'pendiente' | 'en_progreso' | 'completada' | 'cancelada';
  asignado_a?: string;
  relacionado_con?: string;
  entidad_id?: string;
  created_at: string;
  updated_at: string;
}

// ── Documento (Regla 6) ──
export type DocumentStatus = 'pendiente' | 'subido' | 'revisado' | 'aprobado' | 'rechazado';
export type DocumentVisibility = 'interno' | 'publico';

export interface CRMDocument {
  id: string;
  agency_id: string;
  lead_id?: string;
  operation_id?: string;
  property_id?: string;
  name: string;
  type: string;
  url: string;
  size?: number;
  status: DocumentStatus;
  visibility: DocumentVisibility;
  metadata?: Record<string, any>;
  uploaded_by?: string;
  reviewed_by?: string;
  created_at: string;
  updated_at: string;
}

// ── Firma (Regla 7) ──
export type SignatureStatus = 'borrador' | 'enviado' | 'firmado' | 'rechazado' | 'caducado';
export type SignatureType = 'digital' | 'biometric';

export interface CRMSignature {
  id: string;
  agency_id: string;
  operation_id: string;
  document_id?: string;
  title: string;
  type: SignatureType;
  status: SignatureStatus;
  signer_name: string;
  signer_id?: string;
  signer_email?: string;
  biometric_data?: {
    strokes: { x: number; y: number; t: number; p?: number }[];
    device?: string;
    userAgent?: string;
  };
  hash_documento?: string;
  hash_firmado?: string;
  created_at: string;
  signed_at?: string;
  expires_at?: string;
}

// ── Agente inmobiliario (PRD Módulo Agentes) ──
export type AgentType = 'interno' | 'externo' | 'colaborador' | 'captador' | 'freelance';
export type AgentStatus = 'activo' | 'inactivo' | 'pendiente_validacion' | 'en_formacion' | 'suspendido' | 'baja_temporal' | 'baja_definitiva' | 'bloqueado';

export interface Agent {
  id: string;
  agency_id: string;
  // Personales
  nombre: string;
  apellidos: string;
  documento_identidad?: string;
  fecha_nacimiento?: string;
  telefono: string;
  email: string;
  direccion?: string;
  ciudad?: string;
  provincia?: string;
  codigo_postal?: string;
  foto_url?: string;
  idiomas?: string[];
  // Profesionales
  tipo_agente: AgentType;
  codigo_interno?: string;
  oficina?: string;
  equipo?: string;
  responsable_id?: string;
  fecha_alta: string;
  fecha_baja?: string;
  estado: AgentStatus;
  zona_principal?: string;
  zonas_secundarias?: string[];
  especializacion?: string[];
  experiencia_anios?: number;
  numero_colegiado?: string;
  numero_api?: string;
  certificaciones?: string[];
  nivel_comercial?: number;
  // Económicos
  tipo_relacion?: 'autonomo' | 'laboral' | 'freelance' | 'colaborador_externo';
  porcentaje_comision?: number;
  comision_fija?: number;
  comision_captacion?: number;
  comision_venta?: number;
  comision_alquiler?: number;
  comision_exclusiva?: number;
  cuenta_bancaria?: string;
  // Acceso
  email_acceso?: string;
  rol: UserRole;
  ultimo_acceso?: string;
  autenticacion_2fa?: boolean;
  // Métricas
  inmuebles_asignados: number;
  clientes_asignados: number;
  operaciones_abiertas: number;
  ventas_cerradas: number;
  alquileres_cerrados: number;
  comision_generada: number;
  objetivo_mensual?: number;
  cumplimiento_objetivo?: number;
  created_at: string;
  updated_at: string;
}

// ── Actividad de agente ──
export type AgentActivityTipo =
  | 'llamada'
  | 'email'
  | 'whatsapp'
  | 'visita'
  | 'reunion'
  | 'captacion'
  | 'valoracion'
  | 'oferta'
  | 'reserva'
  | 'seguimiento'
  | 'nota'
  | 'tarea';

export interface AgentActivity {
  id: string;
  agency_id: string;
  agent_id: string;
  tipo: AgentActivityTipo;
  fecha: string;
  duracion_minutos?: number;
  cliente_id?: string;
  cliente_nombre?: string;
  propiedad_id?: string;
  propiedad_titulo?: string;
  resultado?: string;
  proximo_paso?: string;
  fecha_proximo_seguimiento?: string;
  prioridad: 'baja' | 'normal' | 'alta' | 'urgente';
  observaciones?: string;
  created_at: string;
}

// ── Asignación agente-inmueble ──
export type AgentAssignmentTipo = 'principal' | 'secundario' | 'captador' | 'comercial_venta' | 'comercial_alquiler';

export interface AgentPropertyAssignment {
  id: string;
  agency_id: string;
  agent_id: string;
  property_id: string;
  property_titulo?: string;
  property_zona?: string;
  property_precio?: number;
  property_operacion?: string;
  tipo_asignacion: AgentAssignmentTipo;
  porcentaje_comision?: number;
  fecha_asignacion: string;
  fecha_desasignacion?: string;
  activo: boolean;
  created_at: string;
}

// ── Asignación agente-cliente ──
export interface AgentClientAssignment {
  id: string;
  agency_id: string;
  agent_id: string;
  cliente_id: string;
  cliente_nombre?: string;
  cliente_apellidos?: string;
  cliente_telefono?: string;
  cliente_email?: string;
  tipo_cliente: string;
  tipo_asignacion: 'principal' | 'colaborador';
  fecha_asignacion: string;
  activo: boolean;
  created_at: string;
}

// ── Comisión de agente ──
export type CommissionEstado = 'calculada' | 'pendiente' | 'validada' | 'aprobada' | 'liquidada' | 'retenida' | 'anulada';

export interface AgentCommission {
  id: string;
  agency_id: string;
  agent_id: string;
  operation_id?: string;
  operation_titulo?: string;
  property_id?: string;
  property_titulo?: string;
  tipo_comision: 'captacion' | 'venta' | 'alquiler' | 'exclusiva' | 'colaboracion' | 'compartida' | 'objetivo' | 'bonus';
  concepto: string;
  base_calculo: number;
  porcentaje: number;
  importe: number;
  estado: CommissionEstado;
  fecha_generacion: string;
  fecha_liquidacion?: string;
  notas?: string;
  created_at: string;
  updated_at: string;
}
