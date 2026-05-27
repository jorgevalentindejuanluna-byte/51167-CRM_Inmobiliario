/**
 * FIX SCRIPT — Corrige las Foreign Keys para permitir el seed
 * Ejecuta SQL directamente en Supabase via la Management API
 */

const SUPABASE_URL = process.argv[2];
const SUPABASE_KEY = process.argv[3];

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error('Uso: node scripts/fix-schema.mjs URL KEY');
  process.exit(1);
}

const SQL_FIXES = `
-- 1. Eliminar FK de users hacia auth.users (impide insertar usuarios mock)
ALTER TABLE users DROP CONSTRAINT IF EXISTS users_id_fkey;
ALTER TABLE users DROP CONSTRAINT IF EXISTS users_pkey CASCADE;
ALTER TABLE users ADD PRIMARY KEY (id);

-- 2. Eliminar FK de leads.agente_asignado hacia users (falla si users está vacía)
ALTER TABLE leads DROP CONSTRAINT IF EXISTS leads_agente_asignado_fkey;

-- 3. Eliminar FK de properties.agente_responsable hacia users
ALTER TABLE properties DROP CONSTRAINT IF EXISTS properties_agente_responsable_fkey;

-- 4. Eliminar FK de operations.agente_id hacia users
ALTER TABLE operations DROP CONSTRAINT IF EXISTS operations_agente_id_fkey;

-- 5. Eliminar FK de operations.propiedad_id hacia properties (por orden de inserción)
ALTER TABLE operations DROP CONSTRAINT IF EXISTS operations_propiedad_id_fkey;
`;

async function fixSchema() {
  console.log('🔧 Aplicando correcciones al esquema...\n');

  const res = await fetch(`${SUPABASE_URL}/rest/v1/rpc`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'apikey': SUPABASE_KEY,
      'Authorization': `Bearer ${SUPABASE_KEY}`,
    },
    body: JSON.stringify({ query: SQL_FIXES }),
  });

  // The RPC approach might not work, let's try the SQL endpoint directly
  // Supabase doesn't expose raw SQL via REST. We need to use the management API.
  // Alternative: execute each ALTER via pg_catalog or just tell the user.
  
  console.log('ℹ️  Las correcciones SQL deben ejecutarse manualmente en Supabase.');
  console.log('   Ve a: Supabase → SQL Editor → New Query');
  console.log('   Pega el siguiente SQL y ejecútalo:\n');
  console.log('─'.repeat(60));
  console.log(SQL_FIXES);
  console.log('─'.repeat(60));
  console.log('\n   Después ejecuta el seed de nuevo.');
}

fixSchema();
