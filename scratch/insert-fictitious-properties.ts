import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import { resolve } from 'path';

dotenv.config({ path: resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  console.error('❌ Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey);

const propertiesToInsert = [
  {
    id: '00000000-0000-0000-0000-0000000000f1',
    agency_id: '00000000-0000-0000-0000-000054b947f6',
    referencia: 'RTS-PROP-001',
    titulo: 'Ático Exclusivo con Terraza en Salamanca',
    tipo_inmueble: 'piso',
    operacion: 'venta',
    estado: 'disponible',
    direccion: 'Calle de Serrano, 45',
    zona: 'Salamanca',
    ciudad: 'Madrid',
    provincia: 'Madrid',
    codigo_postal: '28001',
    precio: 1850000,
    precio_negociable: true,
    superficie: 180,
    habitaciones: 3,
    banos: 3,
    planta: '5',
    ascensor: true,
    garaje: true,
    terraza: true,
    piscina: false,
    descripcion: 'Espectacular ático totalmente reformado con materiales de lujo en la zona más distinguida del barrio de Salamanca. Terraza privada de 40 metros cuadrados con vistas al atardecer madrileño.',
    fotos: ['/properties/prop-001.png'],
    fecha_alta: new Date().toISOString(),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: '00000000-0000-0000-0000-0000000000f2',
    agency_id: '00000000-0000-0000-0000-000054b947f6',
    referencia: 'RTS-PROP-002',
    titulo: 'Villa Moderna Minimalista con Vistas al Mar',
    tipo_inmueble: 'chalet',
    operacion: 'venta',
    estado: 'disponible',
    direccion: 'Avenida de las Cumbres, 12',
    zona: 'Sierra Blanca',
    ciudad: 'Marbella',
    provincia: 'Málaga',
    codigo_postal: '29602',
    precio: 4200000,
    precio_negociable: false,
    superficie: 550,
    habitaciones: 5,
    banos: 6,
    planta: 'Bajo',
    ascensor: true,
    garaje: true,
    terraza: true,
    piscina: true,
    descripcion: 'Exclusiva villa contemporánea en Sierra Blanca con piscina infinity, jardín mediterráneo y vistas panorámicas espectaculares del mar de Marbella y Gibraltar.',
    fotos: ['/properties/prop-002.png'],
    fecha_alta: new Date().toISOString(),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: '00000000-0000-0000-0000-0000000000f3',
    agency_id: '00000000-0000-0000-0000-000054b947f6',
    referencia: 'RTS-PROP-003',
    titulo: 'Loft Industrial Reformado en Poblenou',
    tipo_inmueble: 'piso',
    operacion: 'alquiler',
    estado: 'disponible',
    direccion: 'Carrer de Pujades, 88',
    zona: 'Poblenou',
    ciudad: 'Barcelona',
    provincia: 'Barcelona',
    codigo_postal: '08005',
    precio: 2300,
    precio_negociable: true,
    superficie: 110,
    habitaciones: 1,
    banos: 1,
    planta: '1',
    ascensor: true,
    garaje: false,
    terraza: false,
    piscina: false,
    descripcion: 'Magnífico loft de diseño de estilo neoyorquino en el corazón del Poblenou. Paredes de ladrillo visto, techos altos de más de 4 metros y ventanales industriales de hierro que aportan una gran luminosidad.',
    fotos: ['/properties/prop-003.png'],
    fecha_alta: new Date().toISOString(),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: '00000000-0000-0000-0000-0000000000f4',
    agency_id: '00000000-0000-0000-0000-000054b947f6',
    referencia: 'RTS-PROP-004',
    titulo: 'Finca Rústica Tradicional Mallorquina',
    tipo_inmueble: 'casa',
    operacion: 'venta',
    estado: 'disponible',
    direccion: 'Camino de la Ermita, s/n',
    zona: 'Valldemossa',
    ciudad: 'Valldemossa',
    provincia: 'Baleares',
    codigo_postal: '07170',
    precio: 1650000,
    precio_negociable: true,
    superficie: 320,
    habitaciones: 4,
    banos: 3,
    planta: 'Bajo',
    ascensor: false,
    garaje: true,
    terraza: true,
    piscina: true,
    descripcion: 'Auténtica finca de piedra mallorquina rodeada de naturaleza y tranquilidad en la histórica localidad de Valldemossa. Preciosas fachadas, vigas de madera vistas, piscina y jardín con árboles frutales.',
    fotos: ['/properties/prop-004.png'],
    fecha_alta: new Date().toISOString(),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
];

async function run() {
  console.log('🚀 Insertando 4 propiedades ficticias con imágenes...');
  const { error } = await supabase.from('properties').upsert(propertiesToInsert);

  if (error) {
    console.error('❌ Error al insertar propiedades:', error.message, error.details);
  } else {
    console.log('✅ ¡4 propiedades creadas con éxito en Supabase!');
  }
}

run();
