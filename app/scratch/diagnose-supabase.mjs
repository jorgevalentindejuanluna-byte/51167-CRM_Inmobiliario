import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import { resolve } from 'path';

dotenv.config({ path: resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

console.log('Diagnosticando conexión a Supabase...');
console.log(`URL: ${supabaseUrl}`);

if (!supabaseUrl || !anonKey || !serviceRoleKey) {
  console.error('Faltan variables de entorno.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey);

async function run() {
  try {
    console.log('\n--- Probando conexión básica a PostgreSQL (SELECT now()) ---');
    const { data, error } = await supabase.rpc('version');
    if (error) {
      console.warn('RPC version falló, intentando consulta simple a una tabla...', error);
      const { data: usersData, error: usersError } = await supabase.from('users').select('id').limit(1);
      if (usersError) {
        console.error('Error al consultar tabla users:', usersError);
      } else {
        console.log('Conexión a PostgreSQL exitosa. Fila leída:', usersData);
      }
    } else {
      console.log('Conexión a PostgreSQL exitosa. Versión:', data);
    }

    console.log('\n--- Probando listado de usuarios de Auth (Service Role) ---');
    const { data: { users }, error: authError } = await supabase.auth.admin.listUsers({
      page: 1,
      perPage: 5
    });
    if (authError) {
      console.error('Error al listar usuarios de Auth:', authError);
    } else {
      console.log(`Conexión a Auth exitosa. Encontrados ${users.length} usuarios.`);
      users.forEach(u => console.log(`- ${u.email} (${u.id})`));
    }

    console.log('\n--- Probando simulación de Sign In con carlos@realtopstate.es ---');
    // Para probar sign in con la REST API de Auth
    const response = await fetch(`${supabaseUrl}/auth/v1/token?grant_type=password`, {
      method: 'POST',
      headers: {
        'apikey': anonKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email: 'carlos@realtopstate.es', password: 'RealTop2026!' }),
    });

    const responseStatus = response.status;
    const responseText = await response.text();
    console.log(`Sign In status: ${responseStatus}`);
    console.log(`Sign In response: ${responseText}`);

  } catch (err) {
    console.error('Error en diagnóstico:', err);
  }
}

run();
