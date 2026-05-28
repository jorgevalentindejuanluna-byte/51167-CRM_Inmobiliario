'use server';

import { supabaseServer } from '@/lib/supabase-server';

export async function getTableData(
  table: string,
  options?: {
    filters?: Record<string, string>;
    order?: { column: string; ascending?: boolean };
    limit?: number;
  }
) {
  try {
    let query = supabaseServer.from(table).select('*');

    if (options?.filters) {
      for (const [key, value] of Object.entries(options.filters)) {
        if (value) query = query.eq(key, value);
      }
    }

    if (options?.order) {
      query = query.order(options.order.column, { ascending: options.order.ascending ?? false });
    }

    if (options?.limit) {
      query = query.limit(options.limit);
    }

    const { data, error } = await query;

    if (error) throw new Error(error.message);

    return { success: true, data };
  } catch (err: any) {
    console.error(`getTableData action failed for ${table}:`, err);
    return { success: false, error: err.message, data: [] };
  }
}
