'use server';

import { supabaseInsert, supabaseUpdate, supabaseSelect } from '@/lib/supabase';
import {
  MOCK_AGENTS,
  MOCK_AGENT_ACTIVITIES,
  MOCK_AGENT_PROPERTIES,
  MOCK_AGENT_CLIENTS,
  MOCK_AGENT_COMMISSIONS,
  toUUID,
} from '@/lib/mock-data';
import type { Agent, AgentActivity, AgentPropertyAssignment, AgentClientAssignment, AgentCommission } from '@/lib/models/types';

export async function createAgent(data: Partial<Agent>, token?: string): Promise<{ success: boolean; error?: string; agent?: Agent }> {
  try {
    try {
      const result = await supabaseInsert<Agent>('agents', data as Record<string, unknown>, token);
      if (result && result.length > 0) {
        return { success: true, agent: result[0] };
      }
    } catch (err) {
      console.warn('[Supabase] Error creando agente, haciendo fallback a mock', err);
    }

    const now = new Date().toISOString();
    const agent: Agent = {
      id: `agt-${Date.now()}`,
      agency_id: data.agency_id || 'ag-001',
      nombre: data.nombre || '',
      apellidos: data.apellidos || '',
      documento_identidad: data.documento_identidad,
      fecha_nacimiento: data.fecha_nacimiento,
      telefono: data.telefono || '',
      email: data.email || '',
      direccion: data.direccion,
      ciudad: data.ciudad,
      provincia: data.provincia,
      codigo_postal: data.codigo_postal,
      foto_url: data.foto_url,
      idiomas: data.idiomas,
      tipo_agente: data.tipo_agente || 'interno',
      codigo_interno: data.codigo_interno,
      oficina: data.oficina,
      equipo: data.equipo,
      responsable_id: data.responsable_id,
      fecha_alta: now,
      estado: data.estado || 'activo',
      zona_principal: data.zona_principal,
      zonas_secundarias: data.zonas_secundarias,
      especializacion: data.especializacion,
      experiencia_anios: data.experiencia_anios,
      numero_colegiado: data.numero_colegiado,
      numero_api: data.numero_api,
      certificaciones: data.certificaciones,
      nivel_comercial: data.nivel_comercial ?? 0,
      tipo_relacion: data.tipo_relacion,
      porcentaje_comision: data.porcentaje_comision,
      comision_fija: data.comision_fija,
      comision_captacion: data.comision_captacion,
      comision_venta: data.comision_venta,
      comision_alquiler: data.comision_alquiler,
      comision_exclusiva: data.comision_exclusiva,
      cuenta_bancaria: data.cuenta_bancaria,
      email_acceso: data.email_acceso,
      rol: data.rol || 'agente',
      ultimo_acceso: data.ultimo_acceso,
      autenticacion_2fa: data.autenticacion_2fa ?? false,
      inmuebles_asignados: data.inmuebles_asignados ?? 0,
      clientes_asignados: data.clientes_asignados ?? 0,
      operaciones_abiertas: data.operaciones_abiertas ?? 0,
      ventas_cerradas: data.ventas_cerradas ?? 0,
      alquileres_cerrados: data.alquileres_cerrados ?? 0,
      comision_generada: data.comision_generada ?? 0,
      objetivo_mensual: data.objetivo_mensual,
      cumplimiento_objetivo: data.cumplimiento_objetivo,
      created_at: now,
      updated_at: now,
    };

    MOCK_AGENTS.push(agent);
    return { success: true, agent };
  } catch (error: any) {
    console.error('Error in createAgent action:', error);
    return { success: false, error: error.message || 'Error desconocido' };
  }
}

export async function updateAgent(agentId: string, updates: Partial<Agent>, token?: string): Promise<{ success: boolean; error?: string; agent?: Agent }> {
  try {
    try {
      const cleanId = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(agentId)
        ? agentId
        : (toUUID(agentId) || agentId);

      const result = await supabaseUpdate<Agent>('agents', cleanId, updates as Record<string, unknown>, token);
      if (result) {
        return { success: true, agent: result };
      }
    } catch (err) {
      console.warn('[Supabase] Error actualizando agente, haciendo fallback a mock', err);
    }

    const agentIndex = MOCK_AGENTS.findIndex(a => a.id === agentId || a.id.includes(agentId) || agentId.includes(a.id));
    if (agentIndex !== -1) {
      MOCK_AGENTS[agentIndex] = { ...MOCK_AGENTS[agentIndex], ...updates, updated_at: new Date().toISOString() };
      return { success: true, agent: MOCK_AGENTS[agentIndex] };
    }

    return { success: true, agent: { id: agentId, ...updates } as Agent };
  } catch (error: any) {
    console.error('Error in updateAgent action:', error);
    return { success: false, error: error.message || 'Error desconocido' };
  }
}

export async function toggleAgentStatus(agentId: string, status: Agent['estado'], token?: string): Promise<{ success: boolean; error?: string; agent?: Agent }> {
  try {
    try {
      const cleanId = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(agentId)
        ? agentId
        : (toUUID(agentId) || agentId);

      const result = await supabaseUpdate<Agent>('agents', cleanId, { estado: status } as Record<string, unknown>, token);
      if (result) {
        return { success: true, agent: result };
      }
    } catch (err) {
      console.warn('[Supabase] Error cambiando estado de agente, haciendo fallback a mock', err);
    }

    const agentIndex = MOCK_AGENTS.findIndex(a => a.id === agentId || a.id.includes(agentId) || agentId.includes(a.id));
    if (agentIndex !== -1) {
      MOCK_AGENTS[agentIndex] = { ...MOCK_AGENTS[agentIndex], estado: status, updated_at: new Date().toISOString() };
      return { success: true, agent: MOCK_AGENTS[agentIndex] };
    }

    return { success: true, agent: { id: agentId, estado: status } as Agent };
  } catch (error: any) {
    console.error('Error in toggleAgentStatus action:', error);
    return { success: false, error: error.message || 'Error desconocido' };
  }
}

export async function createActivity(data: Partial<AgentActivity>, token?: string): Promise<{ success: boolean; error?: string; activity?: AgentActivity }> {
  try {
    try {
      const result = await supabaseInsert<AgentActivity>('agent_activities', data as Record<string, unknown>, token);
      if (result && result.length > 0) {
        return { success: true, activity: result[0] };
      }
    } catch (err) {
      console.warn('[Supabase] Error creando actividad, haciendo fallback a mock', err);
    }

    const now = new Date().toISOString();
    const activity: AgentActivity = {
      id: `aa-${Date.now()}`,
      agency_id: data.agency_id || 'ag-001',
      agent_id: data.agent_id || '',
      tipo: data.tipo || 'nota',
      fecha: data.fecha || now,
      duracion_minutos: data.duracion_minutos,
      cliente_id: data.cliente_id,
      cliente_nombre: data.cliente_nombre,
      propiedad_id: data.propiedad_id,
      propiedad_titulo: data.propiedad_titulo,
      resultado: data.resultado,
      proximo_paso: data.proximo_paso,
      fecha_proximo_seguimiento: data.fecha_proximo_seguimiento,
      prioridad: data.prioridad || 'normal',
      observaciones: data.observaciones,
      created_at: now,
    };

    MOCK_AGENT_ACTIVITIES.push(activity);
    return { success: true, activity };
  } catch (error: any) {
    console.error('Error in createActivity action:', error);
    return { success: false, error: error.message || 'Error desconocido' };
  }
}

export async function getAgentActivities(agentId: string, token?: string): Promise<{ success: boolean; error?: string; activities?: AgentActivity[] }> {
  try {
    try {
      const cleanId = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(agentId)
        ? agentId
        : (toUUID(agentId) || agentId);

      const result = await supabaseSelect<AgentActivity>('agent_activities', {
        eq: ['agent_id', cleanId],
        order: { column: 'fecha', ascending: false },
        token,
      });
      if (result && result.length > 0) {
        return { success: true, activities: result };
      }
    } catch (err) {
      console.warn('[Supabase] Error obteniendo actividades, haciendo fallback a mock', err);
    }

    const activities = MOCK_AGENT_ACTIVITIES
      .filter(a => a.agent_id === agentId || a.agent_id.includes(agentId) || agentId.includes(a.agent_id))
      .sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime());

    return { success: true, activities };
  } catch (error: any) {
    console.error('Error in getAgentActivities action:', error);
    return { success: false, error: error.message || 'Error desconocido' };
  }
}

export async function assignProperty(data: Partial<AgentPropertyAssignment>, token?: string): Promise<{ success: boolean; error?: string; assignment?: AgentPropertyAssignment }> {
  try {
    try {
      const result = await supabaseInsert<AgentPropertyAssignment>('agent_properties', data as Record<string, unknown>, token);
      if (result && result.length > 0) {
        return { success: true, assignment: result[0] };
      }
    } catch (err) {
      console.warn('[Supabase] Error asignando propiedad, haciendo fallback a mock', err);
    }

    const now = new Date().toISOString();
    const assignment: AgentPropertyAssignment = {
      id: `apa-${Date.now()}`,
      agency_id: data.agency_id || 'ag-001',
      agent_id: data.agent_id || '',
      property_id: data.property_id || '',
      property_titulo: data.property_titulo,
      property_zona: data.property_zona,
      property_precio: data.property_precio,
      property_operacion: data.property_operacion,
      tipo_asignacion: data.tipo_asignacion || 'principal',
      porcentaje_comision: data.porcentaje_comision,
      fecha_asignacion: now,
      fecha_desasignacion: data.fecha_desasignacion,
      activo: true,
      created_at: now,
    };

    MOCK_AGENT_PROPERTIES.push(assignment);
    return { success: true, assignment };
  } catch (error: any) {
    console.error('Error in assignProperty action:', error);
    return { success: false, error: error.message || 'Error desconocido' };
  }
}

export async function unassignProperty(assignmentId: string, token?: string): Promise<{ success: boolean; error?: string; assignment?: AgentPropertyAssignment }> {
  try {
    try {
      const cleanId = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(assignmentId)
        ? assignmentId
        : (toUUID(assignmentId) || assignmentId);

      const result = await supabaseUpdate<AgentPropertyAssignment>('agent_properties', cleanId, { activo: false, fecha_desasignacion: new Date().toISOString() } as Record<string, unknown>, token);
      if (result) {
        return { success: true, assignment: result };
      }
    } catch (err) {
      console.warn('[Supabase] Error desasignando propiedad, haciendo fallback a mock', err);
    }

    const index = MOCK_AGENT_PROPERTIES.findIndex(a => a.id === assignmentId || a.id.includes(assignmentId) || assignmentId.includes(a.id));
    if (index !== -1) {
      MOCK_AGENT_PROPERTIES[index] = { ...MOCK_AGENT_PROPERTIES[index], activo: false, fecha_desasignacion: new Date().toISOString() };
      return { success: true, assignment: MOCK_AGENT_PROPERTIES[index] };
    }

    return { success: true, assignment: { id: assignmentId, activo: false } as AgentPropertyAssignment };
  } catch (error: any) {
    console.error('Error in unassignProperty action:', error);
    return { success: false, error: error.message || 'Error desconocido' };
  }
}

export async function getAgentProperties(agentId: string, token?: string): Promise<{ success: boolean; error?: string; properties?: AgentPropertyAssignment[] }> {
  try {
    try {
      const cleanId = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(agentId)
        ? agentId
        : (toUUID(agentId) || agentId);

      const result = await supabaseSelect<AgentPropertyAssignment>('agent_properties', {
        filter: { agent_id: cleanId, activo: true },
        token,
      });
      if (result && result.length > 0) {
        return { success: true, properties: result };
      }
    } catch (err) {
      console.warn('[Supabase] Error obteniendo propiedades del agente, haciendo fallback a mock', err);
    }

    const properties = MOCK_AGENT_PROPERTIES
      .filter(a => (a.agent_id === agentId || a.agent_id.includes(agentId) || agentId.includes(a.agent_id)) && a.activo);

    return { success: true, properties };
  } catch (error: any) {
    console.error('Error in getAgentProperties action:', error);
    return { success: false, error: error.message || 'Error desconocido' };
  }
}

export async function assignClient(data: Partial<AgentClientAssignment>, token?: string): Promise<{ success: boolean; error?: string; assignment?: AgentClientAssignment }> {
  try {
    try {
      const result = await supabaseInsert<AgentClientAssignment>('agent_clients', data as Record<string, unknown>, token);
      if (result && result.length > 0) {
        return { success: true, assignment: result[0] };
      }
    } catch (err) {
      console.warn('[Supabase] Error asignando cliente, haciendo fallback a mock', err);
    }

    const now = new Date().toISOString();
    const assignment: AgentClientAssignment = {
      id: `aca-${Date.now()}`,
      agency_id: data.agency_id || 'ag-001',
      agent_id: data.agent_id || '',
      cliente_id: data.cliente_id || '',
      cliente_nombre: data.cliente_nombre,
      cliente_apellidos: data.cliente_apellidos,
      cliente_telefono: data.cliente_telefono,
      cliente_email: data.cliente_email,
      tipo_cliente: data.tipo_cliente || 'comprador',
      tipo_asignacion: data.tipo_asignacion || 'principal',
      fecha_asignacion: now,
      activo: true,
      created_at: now,
    };

    MOCK_AGENT_CLIENTS.push(assignment);
    return { success: true, assignment };
  } catch (error: any) {
    console.error('Error in assignClient action:', error);
    return { success: false, error: error.message || 'Error desconocido' };
  }
}

export async function unassignClient(assignmentId: string, token?: string): Promise<{ success: boolean; error?: string; assignment?: AgentClientAssignment }> {
  try {
    try {
      const cleanId = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(assignmentId)
        ? assignmentId
        : (toUUID(assignmentId) || assignmentId);

      const result = await supabaseUpdate<AgentClientAssignment>('agent_clients', cleanId, { activo: false } as Record<string, unknown>, token);
      if (result) {
        return { success: true, assignment: result };
      }
    } catch (err) {
      console.warn('[Supabase] Error desasignando cliente, haciendo fallback a mock', err);
    }

    const index = MOCK_AGENT_CLIENTS.findIndex(a => a.id === assignmentId || a.id.includes(assignmentId) || assignmentId.includes(a.id));
    if (index !== -1) {
      MOCK_AGENT_CLIENTS[index] = { ...MOCK_AGENT_CLIENTS[index], activo: false };
      return { success: true, assignment: MOCK_AGENT_CLIENTS[index] };
    }

    return { success: true, assignment: { id: assignmentId, activo: false } as AgentClientAssignment };
  } catch (error: any) {
    console.error('Error in unassignClient action:', error);
    return { success: false, error: error.message || 'Error desconocido' };
  }
}

export async function getAgentClients(agentId: string, token?: string): Promise<{ success: boolean; error?: string; clients?: AgentClientAssignment[] }> {
  try {
    try {
      const cleanId = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(agentId)
        ? agentId
        : (toUUID(agentId) || agentId);

      const result = await supabaseSelect<AgentClientAssignment>('agent_clients', {
        filter: { agent_id: cleanId, activo: true },
        token,
      });
      if (result && result.length > 0) {
        return { success: true, clients: result };
      }
    } catch (err) {
      console.warn('[Supabase] Error obteniendo clientes del agente, haciendo fallback a mock', err);
    }

    const clients = MOCK_AGENT_CLIENTS
      .filter(a => (a.agent_id === agentId || a.agent_id.includes(agentId) || agentId.includes(a.agent_id)) && a.activo);

    return { success: true, clients };
  } catch (error: any) {
    console.error('Error in getAgentClients action:', error);
    return { success: false, error: error.message || 'Error desconocido' };
  }
}

export async function getAgentCommissions(agentId: string, token?: string): Promise<{ success: boolean; error?: string; commissions?: AgentCommission[] }> {
  try {
    try {
      const cleanId = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(agentId)
        ? agentId
        : (toUUID(agentId) || agentId);

      const result = await supabaseSelect<AgentCommission>('agent_commissions', {
        eq: ['agent_id', cleanId],
        order: { column: 'fecha_generacion', ascending: false },
        token,
      });
      if (result && result.length > 0) {
        return { success: true, commissions: result };
      }
    } catch (err) {
      console.warn('[Supabase] Error obteniendo comisiones, haciendo fallback a mock', err);
    }

    const commissions = MOCK_AGENT_COMMISSIONS
      .filter(c => c.agent_id === agentId || c.agent_id.includes(agentId) || agentId.includes(c.agent_id))
      .sort((a, b) => new Date(b.fecha_generacion).getTime() - new Date(a.fecha_generacion).getTime());

    return { success: true, commissions };
  } catch (error: any) {
    console.error('Error in getAgentCommissions action:', error);
    return { success: false, error: error.message || 'Error desconocido' };
  }
}

export async function deleteAgent(agentId: string, token?: string): Promise<{ success: boolean; error?: string }> {
  try {
    try {
      const cleanId = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(agentId)
        ? agentId
        : (toUUID(agentId) || agentId);

      const result = await supabaseUpdate<Agent>('agents', cleanId, { estado: 'baja_definitiva' } as Record<string, unknown>, token);
      if (result) {
        return { success: true };
      }
    } catch (err) {
      console.warn('[Supabase] Error eliminando agente, haciendo fallback a mock', err);
    }

    const agentIndex = MOCK_AGENTS.findIndex(a => a.id === agentId || a.id.includes(agentId) || agentId.includes(a.id));
    if (agentIndex !== -1) {
      MOCK_AGENTS[agentIndex] = { ...MOCK_AGENTS[agentIndex], estado: 'baja_definitiva', updated_at: new Date().toISOString() };
      return { success: true };
    }

    return { success: true };
  } catch (error: any) {
    console.error('Error in deleteAgent action:', error);
    return { success: false, error: error.message || 'Error desconocido' };
  }
}

export async function addCommission(data: Partial<AgentCommission>, token?: string): Promise<{ success: boolean; error?: string; commission?: AgentCommission }> {
  try {
    try {
      const result = await supabaseInsert<AgentCommission>('agent_commissions', data as Record<string, unknown>, token);
      if (result && result.length > 0) {
        return { success: true, commission: result[0] };
      }
    } catch (err) {
      console.warn('[Supabase] Error añadiendo comisión, haciendo fallback a mock', err);
    }

    const now = new Date().toISOString();
    const commission: AgentCommission = {
      id: `aco-${Date.now()}`,
      agency_id: data.agency_id || 'ag-001',
      agent_id: data.agent_id || '',
      operation_id: data.operation_id,
      operation_titulo: data.operation_titulo,
      property_id: data.property_id,
      property_titulo: data.property_titulo,
      tipo_comision: data.tipo_comision || 'venta',
      concepto: data.concepto || '',
      base_calculo: data.base_calculo ?? 0,
      porcentaje: data.porcentaje ?? 0,
      importe: data.importe ?? 0,
      estado: data.estado || 'calculada',
      fecha_generacion: now,
      fecha_liquidacion: data.fecha_liquidacion,
      notas: data.notas,
      created_at: now,
      updated_at: now,
    };

    MOCK_AGENT_COMMISSIONS.push(commission);
    return { success: true, commission };
  } catch (error: any) {
    console.error('Error in addCommission action:', error);
    return { success: false, error: error.message || 'Error desconocido' };
  }
}
