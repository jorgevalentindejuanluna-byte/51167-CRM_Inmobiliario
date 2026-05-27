import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import { resolve } from 'path';
import { MOCK_USERS, toUUID } from '../src/lib/mock-data';

// Cargar variables de entorno locales desde la raíz de app
dotenv.config({ path: resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  console.error('❌ Faltan las credenciales de Supabase en .env.local (NEXT_PUBLIC_SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY)');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false }
});

async function syncAuthUsers() {
  console.log('🚀 Iniciando sincronización de usuarios en Supabase Auth...');
  const agencyId = toUUID('ag-001')!;
  console.log(`- Agency ID determinista: ${agencyId}`);

  try {
    // 1. Obtener la lista completa de usuarios existentes en Supabase Auth
    console.log('- Obteniendo lista de usuarios en Auth...');
    const { data: { users }, error: listError } = await supabase.auth.admin.listUsers({
      page: 1,
      perPage: 1000
    });
    if (listError) throw listError;

    // 2. Iterar sobre MOCK_USERS para sincronizar
    for (const u of MOCK_USERS) {
      const targetUserId = toUUID(u.id)!;
      console.log(`\n--- Procesando: ${u.nombre} ${u.apellidos} (${u.email}) ---`);

      // Buscar si el usuario ya existe por ID o por Email
      const existingByEmail = users.find(usr => usr.email?.toLowerCase() === u.email.toLowerCase());
      const existingById = users.find(usr => usr.id === targetUserId);

      // Si existe por email con un ID distinto, o si existe por ID con un email distinto, borramos para evitar conflictos de claves primarias o emails duplicados
      if (existingByEmail && existingByEmail.id !== targetUserId) {
        console.log(`  ⚠️ Email ya registrado con ID diferente (${existingByEmail.id}). Borrando...`);
        const { error: delErr } = await supabase.auth.admin.deleteUser(existingByEmail.id);
        if (delErr) console.error(`  ❌ Error al borrar usuario antiguo por email: ${delErr.message}`);
      }

      if (existingById && existingById.email?.toLowerCase() !== u.email.toLowerCase()) {
        console.log(`  ⚠️ ID ya registrado con Email diferente (${existingById.email}). Borrando...`);
        const { error: delErr } = await supabase.auth.admin.deleteUser(existingById.id);
        if (delErr) console.error(`  ❌ Error al borrar usuario antiguo por ID: ${delErr.message}`);
      }

      // Si ya existe con el ID y email correctos, actualizamos su metadata y contraseña para asegurarnos de que estén correctos
      const stillExists = users.find(usr => usr.id === targetUserId && usr.email?.toLowerCase() === u.email.toLowerCase());
      if (stillExists) {
        console.log(`  🔄 Usuario ya existe con ID y Email correctos. Actualizando metadatos...`);
        const { data: updData, error: updErr } = await supabase.auth.admin.updateUserById(targetUserId, {
          user_metadata: { agency_id: agencyId },
          password: 'RealTop2026!',
          email_confirm: true
        });
        if (updErr) {
          console.error(`  ❌ Error al actualizar usuario: ${updErr.message}`);
        } else {
          console.log(`  ✅ Usuario actualizado con éxito.`);
        }
      } else {
        // Si no existe, lo creamos de cero con el ID determinista
        console.log(`  ➕ Creando nuevo usuario Auth con ID determinista: ${targetUserId}...`);
        const { data: createData, error: createErr } = await supabase.auth.admin.createUser({
          id: targetUserId,
          email: u.email,
          password: 'RealTop2026!',
          email_confirm: true,
          user_metadata: { agency_id: agencyId }
        });
        if (createErr) {
          console.error(`  ❌ Error al crear usuario: ${createErr.message}`);
        } else {
          console.log(`  ✅ Usuario creado con éxito. ID: ${createData.user.id}`);
        }
      }
    }

    console.log('\n✨ Sincronización de Supabase Auth completada exitosamente.');
  } catch (err: any) {
    console.error('❌ Error general durante la sincronización:', err.message || err);
  }
}

syncAuthUsers();
