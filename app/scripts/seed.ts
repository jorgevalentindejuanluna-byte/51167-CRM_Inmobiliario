import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import { resolve } from 'path';

// Cargar variables de entorno locales desde la raíz de app
dotenv.config({ path: resolve(process.cwd(), '.env.local') });

// IMPORTANTE: Necesitamos el Service Role Key para hacer el seed sin que RLS nos bloquee
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Faltan las credenciales de Supabase en el archivo .env.local');
  console.error('Asegúrate de definir NEXT_PUBLIC_SUPABASE_URL y SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: { autoRefreshToken: false, persistSession: false }
});

// Importamos los datos mock
import { MOCK_AGENCY, MOCK_USERS, MOCK_LEADS, MOCK_PROPERTIES, MOCK_OPERATIONS } from '../src/lib/mock-data';

// Función auxiliar para mapear IDs "string" (ej. 'ag-001') a UUIDs válidos.
const idMap = new Map<string, string>();

function toUUID(mockId: string | undefined): string | null {
  if (!mockId) return null;
  if (idMap.has(mockId)) return idMap.get(mockId)!;
  
  let hash = 0;
  for (let i = 0; i < mockId.length; i++) {
    hash = mockId.charCodeAt(i) + ((hash << 5) - hash);
  }
  const hex = Math.abs(hash).toString(16).padStart(12, '0');
  const uuid = `00000000-0000-0000-0000-${hex}`;
  
  idMap.set(mockId, uuid);
  return uuid;
}

async function seed() {
  console.log('🌱 Iniciando Supabase Seeding...');

  try {
    // 1. Insertar Agencia
    console.log(`- Insertando Agencia: ${MOCK_AGENCY.nombre_comercial}`);
    const agencyId = toUUID(MOCK_AGENCY.id)!;
    const { error: errorAg } = await supabase.from('agencies').upsert({
      id: agencyId,
      nombre_comercial: MOCK_AGENCY.nombre_comercial,
      razon_social: MOCK_AGENCY.razon_social,
      cif: MOCK_AGENCY.cif,
      direccion: MOCK_AGENCY.direccion,
      telefono: MOCK_AGENCY.telefono,
      email: MOCK_AGENCY.email,
      dominio: MOCK_AGENCY.dominio,
      plan_saas: MOCK_AGENCY.plan_saas,
      estado_suscripcion: MOCK_AGENCY.estado_suscripcion,
      limites_usuarios: MOCK_AGENCY.limites_usuarios,
      limites_propiedades: MOCK_AGENCY.limites_propiedades,
      branding: MOCK_AGENCY.branding
    });
    if (errorAg) throw errorAg;

    // 2. Insertar Usuarios
    console.log(`- Insertando ${MOCK_USERS.length} Usuarios...`);
    const usersToInsert = MOCK_USERS.map(u => ({
      id: toUUID(u.id),
      agency_id: agencyId,
      nombre: u.nombre,
      apellidos: u.apellidos,
      email: u.email,
      telefono: u.telefono,
      rol: u.rol,
      estado: u.estado,
      autenticacion_2fa: u.autenticacion_2fa,
    }));
    const { error: errorUsr } = await supabase.from('users').upsert(usersToInsert);
    if (errorUsr) {
      console.warn('⚠️ No se pudieron insertar usuarios debido a FK con auth.users.');
      console.warn(errorUsr.message);
    }

    // 3. Insertar Leads
    console.log(`- Insertando ${MOCK_LEADS.length} Leads...`);
    const leadsToInsert = MOCK_LEADS.map(l => ({
      id: toUUID(l.id),
      agency_id: agencyId,
      nombre: l.nombre,
      apellidos: l.apellidos,
      telefono: l.telefono,
      email: l.email,
      origen: l.origen,
      tipo_lead: l.tipo_lead,
      tipo_operacion: l.tipo_operacion,
      zona_interes: l.zona_interes,
      presupuesto_min: l.presupuesto_min,
      presupuesto_max: l.presupuesto_max,
      urgencia: l.urgencia,
      temperatura: l.temperatura,
      score: l.score,
      estado: l.estado,
      agente_asignado: toUUID(l.agente_asignado),
      consentimiento_rgpd: l.consentimiento_rgpd,
      canal_consentimiento: l.canal_consentimiento,
      origen_dato: l.origen_dato,
      finalidad_tratamiento: l.finalidad_tratamiento,
      notas: l.notas
    }));
    const { error: errorLd } = await supabase.from('leads').upsert(leadsToInsert);
    if (errorLd) throw errorLd;

    // 4. Insertar Propiedades
    console.log(`- Insertando ${MOCK_PROPERTIES.length} Propiedades...`);
    const propsToInsert = MOCK_PROPERTIES.map(p => ({
      id: toUUID(p.id),
      agency_id: agencyId,
      referencia: p.referencia,
      titulo: p.titulo,
      tipo_inmueble: p.tipo_inmueble,
      operacion: p.operacion,
      estado: p.estado,
      direccion: p.direccion,
      ciudad: p.ciudad,
      provincia: p.provincia,
      precio: p.precio,
      precio_negociable: p.precio_negociable,
      superficie: p.superficie,
      habitaciones: p.habitaciones,
      banos: p.banos,
      ascensor: p.ascensor,
      garaje: p.garaje,
      terraza: p.terraza,
      piscina: p.piscina,
      certificado_energetico: p.certificado_energetico,
      descripcion: p.descripcion,
      agente_responsable: toUUID(p.agente_responsable),
      fotos: p.fotos
    }));
    const { error: errorProp } = await supabase.from('properties').upsert(propsToInsert);
    if (errorProp) throw errorProp;

    // 5. Insertar Operaciones
    console.log(`- Insertando ${MOCK_OPERATIONS.length} Operaciones...`);
    const opsToInsert = MOCK_OPERATIONS.map(op => ({
      id: toUUID(op.id),
      agency_id: agencyId,
      tipo_operacion: op.tipo_operacion,
      cliente_id: toUUID(op.cliente_id),
      propiedad_id: toUUID(op.propiedad_id),
      agente_id: toUUID(op.agente_id),
      estado: op.estado,
      precio_salida: op.precio_salida,
      precio_oferta: op.precio_oferta,
      precio_cierre: op.precio_cierre,
      notas: op.notas
    }));
    const { error: errorOp } = await supabase.from('operations').upsert(opsToInsert);
    if (errorOp) throw errorOp;

    console.log('✅ Base de datos rellenada exitosamente!');
  } catch (error) {
    console.error('❌ Error durante el seeding:', error);
  }
}

seed();
