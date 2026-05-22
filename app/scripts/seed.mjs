/**
 * SEED SCRIPT — Real Top State CRM
 * ══════════════════════════════════
 * CERO DEPENDENCIAS. Solo usa fetch nativo de Node.js 18+.
 *
 * USO:
 *   node scripts/seed.mjs URL KEY
 *
 * EJEMPLO:
 *   node scripts/seed.mjs https://ztslspqqadtftpkdxsvo.supabase.co eyJhbGci...
 */

// ── Configuración ──
const SUPABASE_URL = (process.argv[2] || process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || '').replace(/\/$/, '');
const SUPABASE_KEY = process.argv[3] || process.env.SUPABASE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY || '';

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error(`
❌ Faltan las credenciales de Supabase.

Uso:
  node scripts/seed.mjs https://TU-PROYECTO.supabase.co TU_SERVICE_ROLE_KEY
`);
  process.exit(1);
}

console.log(`🔗 URL: ${SUPABASE_URL}`);
console.log(`🔑 Key: ${SUPABASE_KEY.substring(0, 20)}...`);
console.log('');

// ── Test de conectividad ──
async function testConnection() {
  console.log('🧪 Probando conectividad con Supabase...');
  try {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/`, {
      method: 'GET',
      headers: {
        'apikey': SUPABASE_KEY,
        'Authorization': `Bearer ${SUPABASE_KEY}`,
      },
    });
    console.log(`   HTTP Status: ${res.status} ${res.statusText}`);
    if (res.status === 401 || res.status === 403) {
      console.error('   ❌ La API Key no es válida. Usa la "service_role" key de Supabase.');
      console.error('   Encuéntrala en: Project Settings → API → service_role (secret)');
      console.error('   NOTA: La key debe empezar por "eyJ..." (es un JWT largo)');
      process.exit(1);
    }
    console.log('   ✅ Conexión exitosa\n');
    return true;
  } catch (err) {
    console.error('   ❌ No se pudo conectar a Supabase.');
    console.error(`   Error: ${err.message}`);
    if (err.cause) {
      console.error(`   Causa: ${err.cause.message || JSON.stringify(err.cause)}`);
    }
    console.error('\n   Posibles soluciones:');
    console.error('   1. Verifica que la URL es correcta (debe terminar en .supabase.co)');
    console.error('   2. Comprueba tu conexión a internet');
    console.error('   3. Si usas proxy/VPN, desactívalo temporalmente');
    process.exit(1);
  }
}

// ── Cliente HTTP mínimo para Supabase REST API ──
async function supabaseInsert(table, rows) {
  const url = `${SUPABASE_URL}/rest/v1/${table}`;
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': SUPABASE_KEY,
        'Authorization': `Bearer ${SUPABASE_KEY}`,
        'Prefer': 'resolution=merge-duplicates',
      },
      body: JSON.stringify(Array.isArray(rows) ? rows : [rows]),
    });

    if (!res.ok) {
      const body = await res.text();
      throw new Error(`HTTP ${res.status} en tabla '${table}': ${body}`);
    }
    return true;
  } catch (err) {
    if (err.message.startsWith('HTTP')) throw err;
    throw new Error(`Fallo de red al insertar en '${table}': ${err.message}${err.cause ? ' — ' + err.cause.message : ''}`);
  }
}

// ── UUIDs deterministas ──
const idMap = new Map();
function toUUID(mockId) {
  if (!mockId) return null;
  if (idMap.has(mockId)) return idMap.get(mockId);
  let hash = 0;
  for (let i = 0; i < mockId.length; i++) {
    hash = mockId.charCodeAt(i) + ((hash << 5) - hash);
  }
  const hex = Math.abs(hash).toString(16).padStart(12, '0');
  const uuid = `00000000-0000-0000-0000-${hex}`;
  idMap.set(mockId, uuid);
  return uuid;
}

// ========== DATOS MOCK ==========

const AGENCY = {
  id: 'ag-001',
  nombre_comercial: 'Real Top State',
  razon_social: 'Real Top State Inmobiliaria SL',
  cif: 'B12345678',
  direccion: 'Calle Serrano 55, 28006 Madrid',
  telefono: '+34 91 555 12 34',
  email: 'info@realtopstate.es',
  dominio: 'realtopstate.es',
  plan_saas: 'professional',
  estado_suscripcion: 'activa',
  limites_usuarios: 25,
  limites_propiedades: 500,
  limites_documentos: 5000,
  branding: { color_primario: '#d4a373', color_secundario: '#40efb7' },
};

const LEADS = [
  { id: 'lead-001', nombre: 'Elena', apellidos: 'Vance Moreno', telefono: '+34 612 345 678', email: 'elena.vance@gmail.com', origen: 'idealista', tipo_lead: 'comprador', tipo_operacion: 'compra', zona_interes: 'Salamanca, Madrid', presupuesto_min: 350000, presupuesto_max: 500000, urgencia: 'alta', temperatura: 'caliente', score: 92, estado: 'calificado', agente_asignado: 'usr-002', consentimiento_rgpd: true, canal_consentimiento: 'formulario_web', origen_dato: 'Idealista', finalidad_tratamiento: 'Gestión comercial inmobiliaria', notas: 'Interesada en áticos con terraza en zona Salamanca.' },
  { id: 'lead-002', nombre: 'Marcus', apellidos: 'Reed Blanco', telefono: '+34 623 456 789', email: 'marcus.reed@outlook.es', origen: 'referido', tipo_lead: 'comprador', tipo_operacion: 'compra', zona_interes: 'Chamberí, Madrid', presupuesto_min: 800000, presupuesto_max: 1200000, urgencia: 'media', temperatura: 'caliente', score: 87, estado: 'busqueda_activa', agente_asignado: 'usr-002', consentimiento_rgpd: true, canal_consentimiento: 'presencial', origen_dato: 'Referido', finalidad_tratamiento: 'Gestión comercial inmobiliaria', notas: 'Inversor con presupuesto alto.' },
  { id: 'lead-003', nombre: 'Patricia', apellidos: 'Muñoz Delgado', telefono: '+34 634 567 890', email: 'patricia.munoz@yahoo.es', origen: 'fotocasa', tipo_lead: 'comprador', tipo_operacion: 'compra', zona_interes: 'Retiro, Madrid', presupuesto_min: 250000, presupuesto_max: 350000, urgencia: 'alta', temperatura: 'tibio', score: 68, estado: 'contactado', agente_asignado: 'usr-003', consentimiento_rgpd: true, canal_consentimiento: 'formulario_web', origen_dato: 'Fotocasa', finalidad_tratamiento: 'Gestión comercial inmobiliaria' },
  { id: 'lead-004', nombre: 'Roberto', apellidos: 'Jiménez Torres', telefono: '+34 645 678 901', email: 'r.jimenez@empresa.com', origen: 'google_ads', tipo_lead: 'vendedor', tipo_operacion: 'venta', zona_interes: 'Chamartín, Madrid', urgencia: 'media', temperatura: 'caliente', score: 78, estado: 'calificado', agente_asignado: 'usr-004', consentimiento_rgpd: true, canal_consentimiento: 'formulario_web', origen_dato: 'Google Ads', finalidad_tratamiento: 'Valoración y captación inmobiliaria', notas: 'Chalet adosado en Chamartín.' },
  { id: 'lead-005', nombre: 'Sofía', apellidos: 'Navarro Ruiz', telefono: '+34 656 789 012', email: 'sofia.navarro@hotmail.com', origen: 'web', tipo_lead: 'comprador', tipo_operacion: 'alquiler', zona_interes: 'Malasaña, Madrid', presupuesto_min: 1000, presupuesto_max: 1500, urgencia: 'urgente', temperatura: 'caliente', score: 75, estado: 'busqueda_activa', agente_asignado: 'usr-003', consentimiento_rgpd: true, canal_consentimiento: 'formulario_web', origen_dato: 'Web', finalidad_tratamiento: 'Gestión comercial inmobiliaria' },
  { id: 'lead-006', nombre: 'Fernando', apellidos: 'López Martín', telefono: '+34 667 890 123', email: 'flopez@gmail.com', origen: 'whatsapp', tipo_lead: 'inversor', tipo_operacion: 'inversion', zona_interes: 'Centro, Madrid', presupuesto_min: 500000, presupuesto_max: 2000000, urgencia: 'baja', temperatura: 'tibio', score: 60, estado: 'contactado', agente_asignado: 'usr-002', consentimiento_rgpd: true, canal_consentimiento: 'whatsapp', origen_dato: 'WhatsApp', finalidad_tratamiento: 'Gestión comercial inmobiliaria' },
  { id: 'lead-007', nombre: 'María', apellidos: 'Santos Ibáñez', telefono: '+34 678 901 234', email: 'maria.santos@icloud.com', origen: 'habitaclia', tipo_lead: 'comprador', tipo_operacion: 'compra', zona_interes: 'Argüelles, Madrid', presupuesto_min: 300000, presupuesto_max: 450000, urgencia: 'media', temperatura: 'frio', score: 35, estado: 'nuevo', consentimiento_rgpd: true, canal_consentimiento: 'formulario_web', origen_dato: 'Habitaclia', finalidad_tratamiento: 'Gestión comercial inmobiliaria' },
  { id: 'lead-008', nombre: 'Alejandro', apellidos: 'Rivas Morales', telefono: '+34 689 012 345', email: 'a.rivas@proton.me', origen: 'pisos_com', tipo_lead: 'propietario', tipo_operacion: 'venta', zona_interes: 'Moncloa, Madrid', urgencia: 'alta', temperatura: 'tibio', score: 55, estado: 'contactado', agente_asignado: 'usr-004', consentimiento_rgpd: true, canal_consentimiento: 'telefono', origen_dato: 'Pisos.com', finalidad_tratamiento: 'Captación y valoración inmobiliaria', notas: 'Piso de 3 habitaciones en Moncloa.' },
];

const PROPERTIES = [
  { id: 'prop-001', referencia: 'RTS-2026-001', titulo: 'Ático con terraza en Salamanca', tipo_inmueble: 'piso', operacion: 'venta', estado: 'disponible', direccion: 'Calle Velázquez 42, Ático', zona: 'Salamanca', ciudad: 'Madrid', provincia: 'Madrid', precio: 485000, precio_negociable: true, superficie: 120, habitaciones: 3, banos: 2, ascensor: true, terraza: true, certificado_energetico: 'C', descripcion: 'Espectacular ático con terraza panorámica.', agente_responsable: 'usr-002' },
  { id: 'prop-002', referencia: 'RTS-2026-002', titulo: 'Piso señorial en Chamberí', tipo_inmueble: 'piso', operacion: 'venta', estado: 'disponible', direccion: 'Calle Alonso Cano 15, 3º Izq', zona: 'Chamberí', ciudad: 'Madrid', provincia: 'Madrid', precio: 950000, precio_negociable: true, superficie: 210, habitaciones: 5, banos: 3, ascensor: true, garaje: true, certificado_energetico: 'D', descripcion: 'Piso señorial con techos de 3.5m.', agente_responsable: 'usr-002' },
  { id: 'prop-003', referencia: 'RTS-2026-003', titulo: 'Loft reformado en Malasaña', tipo_inmueble: 'piso', operacion: 'alquiler', estado: 'disponible', direccion: 'Calle Fuencarral 88, Bajo', zona: 'Malasaña', ciudad: 'Madrid', provincia: 'Madrid', precio: 1350, superficie: 65, habitaciones: 1, banos: 1, certificado_energetico: 'B', descripcion: 'Loft de diseño completamente reformado.', agente_responsable: 'usr-003' },
  { id: 'prop-004', referencia: 'RTS-2026-004', titulo: 'Chalet adosado en Chamartín', tipo_inmueble: 'chalet', operacion: 'venta', estado: 'en_captacion', direccion: 'Urbanización Las Rosas', zona: 'Chamartín', ciudad: 'Madrid', provincia: 'Madrid', precio: 720000, superficie: 280, habitaciones: 4, banos: 3, garaje: true, terraza: true, piscina: true, certificado_energetico: 'C', descripcion: 'Chalet adosado con jardín privado y piscina.', agente_responsable: 'usr-004' },
  { id: 'prop-005', referencia: 'RTS-2026-005', titulo: 'Local comercial en Gran Vía', tipo_inmueble: 'local', operacion: 'alquiler', estado: 'disponible', direccion: 'Gran Vía 30, Local', zona: 'Centro', ciudad: 'Madrid', provincia: 'Madrid', precio: 8500, superficie: 150, certificado_energetico: 'E', descripcion: 'Local en plena Gran Vía.', agente_responsable: 'usr-002' },
];

const OPERATIONS = [
  { id: 'op-001', tipo_operacion: 'venta', cliente_id: 'lead-001', propiedad_id: 'prop-001', agente_id: 'usr-002', estado: 'visitas', precio_salida: 485000, notas: 'Primera visita realizada.' },
  { id: 'op-002', tipo_operacion: 'venta', cliente_id: 'lead-002', propiedad_id: 'prop-002', agente_id: 'usr-002', estado: 'oferta', precio_salida: 950000, precio_oferta: 915000, notas: 'Oferta recibida por 915k.' },
  { id: 'op-003', tipo_operacion: 'alquiler', cliente_id: 'lead-005', propiedad_id: 'prop-003', agente_id: 'usr-003', estado: 'reserva', precio_salida: 1350, precio_cierre: 1350, notas: 'Reserva pagada.' },
  { id: 'op-004', tipo_operacion: 'venta', propietario_id: 'lead-004', propiedad_id: 'prop-004', agente_id: 'usr-004', estado: 'documentacion', precio_salida: 720000, precio_cierre: 700000, notas: 'Esperando tasación.' },
  { id: 'op-005', tipo_operacion: 'alquiler', propiedad_id: 'prop-005', agente_id: 'usr-002', estado: 'calificacion', precio_salida: 8500, notas: 'Buscando franquicias interesadas.' },
];

// ========== SEED ==========

async function seed() {
  // Test de conexión primero
  await testConnection();

  console.log('🌱 Iniciando Supabase Seeding...\n');

  const agencyId = toUUID(AGENCY.id);

  // 1. Agencia
  console.log('  📦 Insertando Agencia...');
  await supabaseInsert('agencies', {
    id: agencyId,
    nombre_comercial: AGENCY.nombre_comercial,
    razon_social: AGENCY.razon_social,
    cif: AGENCY.cif,
    direccion: AGENCY.direccion,
    telefono: AGENCY.telefono,
    email: AGENCY.email,
    dominio: AGENCY.dominio,
    plan_saas: AGENCY.plan_saas,
    estado_suscripcion: AGENCY.estado_suscripcion,
    limites_usuarios: AGENCY.limites_usuarios,
    limites_propiedades: AGENCY.limites_propiedades,
    branding: AGENCY.branding,
  });
  console.log('     ✅ Agencia insertada');

  // 2. Leads
  console.log(`  🎯 Insertando ${LEADS.length} Leads...`);
  const leadsData = LEADS.map(l => ({
    id: toUUID(l.id), agency_id: agencyId,
    nombre: l.nombre, apellidos: l.apellidos, telefono: l.telefono, email: l.email,
    origen: l.origen, tipo_lead: l.tipo_lead, tipo_operacion: l.tipo_operacion,
    zona_interes: l.zona_interes, presupuesto_min: l.presupuesto_min || null,
    presupuesto_max: l.presupuesto_max || null, urgencia: l.urgencia,
    temperatura: l.temperatura, score: l.score, estado: l.estado,
    agente_asignado: toUUID(l.agente_asignado),
    consentimiento_rgpd: l.consentimiento_rgpd,
    canal_consentimiento: l.canal_consentimiento,
    origen_dato: l.origen_dato, finalidad_tratamiento: l.finalidad_tratamiento,
    notas: l.notas || null,
  }));
  await supabaseInsert('leads', leadsData);
  console.log('     ✅ Leads insertados');

  // 3. Propiedades
  console.log(`  🏠 Insertando ${PROPERTIES.length} Propiedades...`);
  const propsData = PROPERTIES.map(p => ({
    id: toUUID(p.id), agency_id: agencyId,
    referencia: p.referencia, titulo: p.titulo, tipo_inmueble: p.tipo_inmueble,
    operacion: p.operacion, estado: p.estado, direccion: p.direccion,
    zona: p.zona || null, ciudad: p.ciudad, provincia: p.provincia,
    precio: p.precio, precio_negociable: p.precio_negociable || false,
    superficie: p.superficie, habitaciones: p.habitaciones || null,
    banos: p.banos || null, ascensor: p.ascensor || false,
    garaje: p.garaje || false, terraza: p.terraza || false,
    piscina: p.piscina || false, certificado_energetico: p.certificado_energetico || null,
    descripcion: p.descripcion || null, agente_responsable: toUUID(p.agente_responsable),
  }));
  await supabaseInsert('properties', propsData);
  console.log('     ✅ Propiedades insertadas');

  // 4. Operaciones
  console.log(`  📊 Insertando ${OPERATIONS.length} Operaciones...`);
  const opsData = OPERATIONS.map(op => ({
    id: toUUID(op.id), agency_id: agencyId,
    tipo_operacion: op.tipo_operacion,
    cliente_id: toUUID(op.cliente_id), propietario_id: toUUID(op.propietario_id),
    propiedad_id: toUUID(op.propiedad_id), agente_id: toUUID(op.agente_id),
    estado: op.estado, precio_salida: op.precio_salida || null,
    precio_oferta: op.precio_oferta || null, precio_cierre: op.precio_cierre || null,
    notas: op.notas || null,
  }));
  await supabaseInsert('operations', opsData);
  console.log('     ✅ Operaciones insertadas');

  console.log('\n🎉 ¡Base de datos rellenada exitosamente!');
}

seed().catch(err => {
  console.error('\n❌ Error fatal:', err.message);
  process.exit(1);
});
