import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SERVICE_KEY) {
  console.error('❌ Faltan variables de entorno (URL o SERVICE_KEY)');
  process.exit(1);
}

const mockUsers = [
  { id: '00000000-0000-0000-0000-0000082df588', email: 'carlos@realtopstate.es', rol: 'director_comercial' },
  { id: '00000000-0000-0000-0000-0000082df587', email: 'ana@realtopstate.es', rol: 'agente' },
  { id: '00000000-0000-0000-0000-0000082df586', email: 'david@realtopstate.es', rol: 'agente' },
  { id: '00000000-0000-0000-0000-0000082df585', email: 'laura@realtopstate.es', rol: 'captador' },
  { id: '00000000-0000-0000-0000-0000082df584', email: 'marta@realtopstate.es', rol: 'coordinador_admin' }
];

async function syncAuthUsers() {
  console.log('🔍 Obteniendo lista actual de usuarios en Supabase Auth...');
  try {
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

    for (const mockUser of mockUsers) {
      const existing = users.find(u => u.email === mockUser.email);
      if (existing) {
        if (existing.id === mockUser.id) {
          console.log(`✨ Usuario ${mockUser.email} ya existe en Auth con el UUID correcto (${mockUser.id}).`);
          continue;
        } else {
          console.log(`🗑️ Usuario ${mockUser.email} existe con UUID incorrecto (${existing.id}). Eliminando...`);
          const deleteResponse = await fetch(`${SUPABASE_URL}/auth/v1/admin/users/${existing.id}`, {
            method: 'DELETE',
            headers: {
              'apikey': SERVICE_KEY,
              'Authorization': `Bearer ${SERVICE_KEY}`
            }
          });

          if (!deleteResponse.ok) {
            console.error(`❌ Error al borrar ${mockUser.email}:`, await deleteResponse.text());
            continue;
          }
          console.log(`✅ Usuario ${mockUser.email} eliminado.`);
        }
      }

      console.log(`🚀 Creando usuario ${mockUser.email} con UUID: ${mockUser.id}...`);
      const createResponse = await fetch(`${SUPABASE_URL}/auth/v1/admin/users`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': SERVICE_KEY,
          'Authorization': `Bearer ${SERVICE_KEY}`
        },
        body: JSON.stringify({
          email: mockUser.email,
          password: 'RealTop2026!',
          id: mockUser.id,
          email_confirm: true,
          user_metadata: { agency_id: 'd9b1e7a5-4c6e-4b2a-8f9d-1e0c2b3a4d5e' } // Agencia demo
        })
      });

      if (createResponse.ok) {
        console.log(`✅ Usuario ${mockUser.email} creado con éxito.`);
      } else {
        const createErr = await createResponse.json();
        console.error(`❌ Error al crear usuario ${mockUser.email}:`, createErr.msg || createErr);
      }
    }

    console.log('🎉 Sincronización de usuarios de Auth completada.');
  } catch (error) {
    console.error('❌ Ocurrió un error general:', error.message);
  }
}

syncAuthUsers();
