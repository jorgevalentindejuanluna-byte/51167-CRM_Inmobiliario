/**
 * UTILERÍA: CREAR USUARIO DE AUTH
 * Permite crear un usuario real en Supabase Auth para pruebas del CRM.
 * Requiere SUPABASE_SERVICE_ROLE_KEY.
 */

import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SERVICE_KEY) {
  console.error('❌ Faltan variables de entorno (URL o SERVICE_KEY)');
  process.exit(1);
}

const args = process.argv.slice(2);
const email = args[0] || 'carlos@realtopstate.es';
const password = args[1] || 'RealTop2026!';
const userId = args[2]; // Opcional: ID específico para vincular con public.users

async function createAuthUser() {
  console.log(`🚀 Creando usuario Auth para: ${email}...`);

  const response = await fetch(`${SUPABASE_URL}/auth/v1/admin/users`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'apikey': SERVICE_KEY,
      'Authorization': `Bearer ${SERVICE_KEY}`
    },
    body: JSON.stringify({
      email,
      password,
      id: userId, // Vincular directamente con el ID del seed si se proporciona
      email_confirm: true,
      user_metadata: { agency_id: 'd9b1e7a5-4c6e-4b2a-8f9d-1e0c2b3a4d5e' } // Agencia demo
    })
  });

  const data = await response.json();

  if (response.ok) {
    console.log('✅ Usuario Auth creado con éxito!');
    console.log('ID:', data.id);
  } else {
    console.error('❌ Error al crear usuario:', data.msg || data);
  }
}

createAuthUser();
