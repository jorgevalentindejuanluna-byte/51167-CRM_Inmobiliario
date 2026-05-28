import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import { resolve } from 'path';
import {
  MOCK_AGENCY,
  MOCK_USERS,
  MOCK_LEADS,
  MOCK_PROPERTIES,
  MOCK_OPERATIONS,
  MOCK_AGENTS,
  MOCK_AGENT_ACTIVITIES,
  MOCK_AGENT_PROPERTIES,
  MOCK_AGENT_CLIENTS,
  MOCK_AGENT_COMMISSIONS,
  toUUID
} from '../src/lib/mock-data';

dotenv.config({ path: resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  console.error('❌ Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false
  }
});

function sanitizeValue(val: any): any {
  if (typeof val === 'string') {
    const mockIdPattern = /^(ag|usr|lead|prop|op|agt|aa|apa|aca|aco|emm|emt|doc)-\d+$/i;
    if (mockIdPattern.test(val)) {
      return toUUID(val);
    }
  }
  if (Array.isArray(val)) {
    return val.map(sanitizeValue);
  }
  if (val !== null && typeof val === 'object') {
    const res: any = {};
    for (const [k, v] of Object.entries(val)) {
      res[k] = sanitizeValue(v);
    }
    return res;
  }
  return val;
}

async function migrateTable(table: string, dataArray: any[], columnCleaner?: (item: any) => any) {
  console.log(`🚀 Migrating table '${table}' (${dataArray.length} items)...`);
  let sanitized = dataArray.map(item => sanitizeValue(item));
  if (columnCleaner) {
    sanitized = sanitized.map(columnCleaner);
  }
  
  const { error } = await supabase.from(table).upsert(sanitized);
  if (error) {
    console.error(`❌ Error migrating '${table}':`, error.message, error.details);
    return false;
  } else {
    console.log(`✅ Table '${table}' migrated successfully.`);
    return true;
  }
}

async function main() {
  try {
    // 1. Agencies
    await migrateTable('agencies', [MOCK_AGENCY]);

    // 2. Users
    await migrateTable('users', MOCK_USERS);

    // 3. Leads
    await migrateTable('leads', MOCK_LEADS);

    // 4. Properties (Clean 'referencia_catastral' if it causes issues)
    await migrateTable('properties', MOCK_PROPERTIES, (item) => {
      const { referencia_catastral, ...rest } = item;
      return rest;
    });

    // 5. Operations
    await migrateTable('operations', MOCK_OPERATIONS);

    // 6. Agents (Clean 'rol')
    const agentsSuccess = await migrateTable('agents', MOCK_AGENTS, (item) => {
      const { rol, ...rest } = item;
      return rest;
    });

    // 7. Agent Activity (Clean cliente_nombre and propiedad_titulo)
    if (agentsSuccess) {
      await migrateTable('agent_activity', MOCK_AGENT_ACTIVITIES, (item) => {
        const { cliente_nombre, propiedad_titulo, ...rest } = item;
        return rest;
      });
    } else {
      console.warn('⚠️ Skipping agent_activity because agents table migration failed.');
    }

    // 8. Agent Property Assignments
    if (agentsSuccess) {
      const sanitizedProperties = MOCK_AGENT_PROPERTIES.map(item => {
        const sanitized = sanitizeValue(item);
        return {
          id: sanitized.id,
          agency_id: sanitized.agency_id,
          agent_id: sanitized.agent_id,
          property_id: sanitized.property_id,
          tipo_asignacion: sanitized.tipo_asignacion,
          porcentaje_comision: sanitized.porcentaje_comision,
          fecha_asignacion: sanitized.fecha_asignacion,
          fecha_desasignacion: sanitized.fecha_desasignacion,
          activo: sanitized.activo,
          created_at: sanitized.created_at || new Date().toISOString()
        };
      });

      console.log(`🚀 Migrating table 'agent_property_assignments'...`);
      const { error: err } = await supabase.from('agent_property_assignments').upsert(sanitizedProperties);
      if (err) console.error(`❌ Error in 'agent_property_assignments':`, err.message);
      else console.log(`✅ Table 'agent_property_assignments' migrated successfully.`);
    }

    // 9. Agent Clients (Table might not exist yet)
    console.log(`🚀 Checking for 'agent_client_assignments' table...`);
    const sanitizedClients = MOCK_AGENT_CLIENTS.map(item => {
      const sanitized = sanitizeValue(item);
      return {
        id: sanitized.id,
        agency_id: sanitized.agency_id,
        agent_id: sanitized.agent_id,
        cliente_id: sanitized.cliente_id,
        tipo_cliente: sanitized.tipo_cliente,
        tipo_asignacion: sanitized.tipo_asignacion,
        fecha_asignacion: sanitized.fecha_asignacion,
        activo: sanitized.activo,
        created_at: sanitized.created_at || new Date().toISOString()
      };
    });
    const { error: clientErr } = await supabase.from('agent_client_assignments').upsert(sanitizedClients);
    if (clientErr) {
      console.warn(`⚠️ Could not migrate agent client assignments: ${clientErr.message}. Make sure to run migrations_missing.sql first.`);
    } else {
      console.log(`✅ Table 'agent_client_assignments' migrated successfully.`);
    }

    // 10. Agent Commissions (Table might not exist yet)
    console.log(`🚀 Checking for 'agent_commissions' table...`);
    const sanitizedCommissions = MOCK_AGENT_COMMISSIONS.map(item => sanitizeValue(item));
    const { error: commErr } = await supabase.from('agent_commissions').upsert(sanitizedCommissions);
    if (commErr) {
      console.warn(`⚠️ Could not migrate agent commissions: ${commErr.message}. Make sure to run migrations_missing.sql first.`);
    } else {
      console.log(`✅ Table 'agent_commissions' migrated successfully.`);
    }

    console.log('\n🎉 Core migration completely finished! Please execute supabase/migrations_missing.sql in your Supabase SQL Editor if you saw any warnings above, and run this script again.');
  } catch (err: any) {
    console.error('❌ Migration failed:', err.message);
  }
}

main();
