import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SERVICE_KEY) {
  console.error('❌ Faltan variables de entorno (URL o SERVICE_KEY)');
  process.exit(1);
}

const emailToReset = 'carlos@realtopstate.es';

async function resetUser() {
  console.log(`🔍 Buscando usuario Auth con email: ${emailToReset}...`);

  try {
    // 1. Listar usuarios
    const listResponse = await fetch(`${SUPABASE_URL}/auth/v1/admin/users`, {
      method: 'GET',
      headers: {
        'apikey': SERVICE_KEY,
        'Authorization': `Bearer ${SERVICE_KEY}`
      }
    });

    if (!listResponse.ok) {
      const errText = await listResponse.text();
      throw new Error(`Error al listar usuarios: ${errText}`);
    }

    const { users } = await listResponse.json();
    const existingUser = users.find(u => u.email === emailToReset);

    if (existingUser) {
      console.log(`🗑️ Usuario encontrado con ID: ${existingUser.id}. Eliminándolo de Auth...`);
      const deleteResponse = await fetch(`${SUPABASE_URL}/auth/v1/admin/users/${existingUser.id}`, {
        method: 'DELETE',
        headers: {
          'apikey': SERVICE_KEY,
          'Authorization': `Bearer ${SERVICE_KEY}`
        }
      });

      if (deleteResponse.ok) {
        console.log('✅ Usuario eliminado de Supabase Auth con éxito!');
      } else {
        const deleteErr = await deleteResponse.text();
        console.error('❌ Error al eliminar usuario:', deleteErr);
        process.exit(1);
      }
    } else {
      console.log('ℹ️ El usuario no existía en Supabase Auth.');
    }

    // 2. Crear el usuario de nuevo con el UUID correcto
    const targetUuid = '00000000-0000-0000-0000-0000082df588';
    console.log(`🚀 Creando de nuevo el usuario con UUID: ${targetUuid}...`);
    const createResponse = await fetch(`${SUPABASE_URL}/auth/v1/admin/users`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': SERVICE_KEY,
        'Authorization': `Bearer ${SERVICE_KEY}`
      },
      body: JSON.stringify({
        email: emailToReset,
        password: 'RealTop2026!',
        id: targetUuid,
        email_confirm: true,
        user_metadata: { agency_id: 'd9b1e7a5-4c6e-4b2a-8f9d-1e0c2b3a4d5e' } // Agencia demo
      })
    });

    const createData = await createResponse.json();

    if (createResponse.ok) {
      console.log('✅ Usuario Auth creado con éxito con UUID determinista!');
      console.log('ID:', createData.id);
    } else {
      console.error('❌ Error al crear el usuario con UUID:', createData.msg || createData);
    }

  } catch (error) {
    console.error('❌ Ocurrió un error:', error.message);
  }
}

resetUser();
