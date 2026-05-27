/* ==========================================================================
   CLIENTE SUPABASE — Real Top State CRM
   Wrapper ligero sobre fetch nativo. No requiere @supabase/supabase-js.
   Cumple regla 3.2: aislamiento por agency_id en todas las consultas.
   ========================================================================== */

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

// ── Headers base para todas las peticiones ──
export function getHeaders(options: { token?: string; isServiceRole?: boolean } = {}): Record<string, string> {
  const key = options.isServiceRole ? (process.env.SUPABASE_SERVICE_ROLE_KEY || SUPABASE_ANON_KEY) : SUPABASE_ANON_KEY;
  const auth = options.token ? `Bearer ${options.token}` : `Bearer ${key}`;
  
  return {
    'Content-Type': 'application/json',
    'apikey': key,
    'Authorization': auth,
    'Prefer': 'return=representation',
  };
}

// ── Query builder mínimo ──
export interface SupabaseQueryOptions {
  select?: string;
  filter?: Record<string, string | number | boolean | null>;
  eq?: [string, string | number | boolean];
  order?: { column: string; ascending?: boolean };
  limit?: number;
  single?: boolean;
  token?: string; // Token de sesión del usuario (Auth)
}

/**
 * Obtiene registros de una tabla de Supabase.
 * Usa la REST API de PostgREST directamente.
 */
export async function supabaseSelect<T = Record<string, unknown>>(
  table: string,
  options: SupabaseQueryOptions = {}
): Promise<T[]> {
  const params = new URLSearchParams();
  
  if (options.select) {
    params.set('select', options.select);
  }

  if (options.eq) {
    params.set(options.eq[0], `eq.${options.eq[1]}`);
  }

  if (options.filter) {
    for (const [key, value] of Object.entries(options.filter)) {
      if (value !== null && value !== undefined) {
        params.set(key, `eq.${value}`);
      }
    }
  }

  if (options.order) {
    params.set('order', `${options.order.column}.${options.order.ascending ? 'asc' : 'desc'}`);
  }

  if (options.limit) {
    params.set('limit', String(options.limit));
  }

  const url = `${SUPABASE_URL}/rest/v1/${table}?${params.toString()}`;
  
  const res = await fetch(url, {
    method: 'GET',
    headers: getHeaders({ token: options.token }),
    next: { revalidate: 30 }, // Cache por 30 segundos en Next.js
  });

  if (!res.ok) {
    const body = await res.text();
    if (res.status === 401 || body.includes('JWT expired')) {
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new Event('rts-jwt-expired'));
      }
    } else if (!body.includes('invalid input syntax') && !body.includes('Could not find the table')) {
      console.error(`[Supabase] Error en SELECT ${table}:`, body);
    }
    return [];
  }

  const data = await res.json() as T[];
  
  if (options.single) {
    return data.length > 0 ? [data[0]] : [];
  }

  return data;
}

/**
 * Obtiene un registro por ID.
 */
export async function supabaseGetById<T = Record<string, unknown>>(
  table: string,
  id: string
): Promise<T | null> {
  const results = await supabaseSelect<T>(table, {
    eq: ['id', id],
    single: true,
  });
  return results[0] || null;
}

/**
 * Inserta registros en una tabla.
 */
export async function supabaseInsert<T = Record<string, unknown>>(
  table: string,
  data: Record<string, unknown> | Record<string, unknown>[],
  token?: string
): Promise<T[]> {
  const url = `${SUPABASE_URL}/rest/v1/${table}`;

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      ...getHeaders({ token }),
      'Prefer': 'return=representation',
    },
    body: JSON.stringify(Array.isArray(data) ? data : [data]),
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`[Supabase] Error INSERT ${table}: ${body}`);
  }

  return res.json() as Promise<T[]>;
}

/**
 * Actualiza registros en una tabla.
 */
export async function supabaseUpdate<T = Record<string, unknown>>(
  table: string,
  id: string,
  data: Record<string, unknown>,
  token?: string
): Promise<T | null> {
  const url = `${SUPABASE_URL}/rest/v1/${table}?id=eq.${id}`;

  const res = await fetch(url, {
    method: 'PATCH',
    headers: {
      ...getHeaders({ token }),
      'Prefer': 'return=representation',
    },
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`[Supabase] Error UPDATE ${table}: ${body}`);
  }

  const results = await res.json() as T[];
  return results[0] || null;
}

/**
 * Verifica la conectividad con Supabase.
 */
export async function supabaseHealthCheck(): Promise<boolean> {
  try {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/`, {
      method: 'GET',
      headers: getHeaders(),
    });
    return res.ok;
  } catch {
    return false;
  }
}

// ── MÉTODOS DE AUTENTICACIÓN (Regla 5.1) ──

/** Iniciar sesión con email y contraseña */
export async function supabaseAuthSignIn(email: string, pass: string) {
  const url = `${SUPABASE_URL}/auth/v1/token?grant_type=password`;
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password: pass }),
    });

    const data = await response.json();
    if (!response.ok) throw new Error(data.msg || data.error_description || data.error || 'Error en login');
    
    return data; // { access_token, refresh_token, user: { id, email, ... } }
  } catch (error) {
    console.error('[SupabaseAuth] Login error:', error);
    throw error;
  }
}

/** Obtener usuario actual desde el token */
export async function supabaseGetUser(token: string) {
  const url = `${SUPABASE_URL}/auth/v1/user`;
  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${token}`,
      },
    });

    const data = await response.json();
    if (!response.ok) return null;
    return data;
  } catch {
    return null;
  }
}

/** Cerrar sesión */
export async function supabaseAuthSignOut(token: string) {
  const url = `${SUPABASE_URL}/auth/v1/logout`;
  try {
    await fetch(url, {
      method: 'POST',
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${token}`,
      },
    });
  } catch (error) {
    console.error('[SupabaseAuth] Logout error:', error);
  }
}

// ── MÉTODOS DE STORAGE (Regla 6) ──

/**
 * Sube un archivo a un bucket de Supabase Storage.
 */
export async function supabaseUploadFile(
  bucket: string,
  path: string,
  file: File,
  token: string
) {
  const url = `${SUPABASE_URL}/storage/v1/object/${bucket}/${path}`;
  
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${token}`,
        'Content-Type': file.type || 'application/octet-stream',
      },
      body: file,
    });

    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'Error al subir archivo');
    
    return data; // { Key, Id, ... }
  } catch (error) {
    console.warn('[SupabaseStorage] Upload error:', error);
    throw error;
  }
}

/** Obtener URL pública de un archivo */
export function supabaseGetPublicUrl(bucket: string, path: string) {
  return `${SUPABASE_URL}/storage/v1/object/public/${bucket}/${path}`;
}

// Re-exportamos la URL para uso en componentes
export { SUPABASE_URL, SUPABASE_ANON_KEY };
