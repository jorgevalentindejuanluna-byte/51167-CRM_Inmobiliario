'use server';

import { supabaseInsert, supabaseUpdate, supabaseSelect } from '@/lib/supabase';
import { toUUID } from '@/lib/mock-data';
import type { Agent, AgentActivity, AgentPropertyAssignment, AgentClientAssignment, AgentCommission } from '@/lib/models/types';

export async function createAgent(data: Partial<Agent>, token?: string): Promise<{ success: boolean; error?: string; agent?: Agent }> {
  try {
    const result = await supabaseInsert<Agent>('agents', data as Record<string, unknown>, token);
    if (result && result.length > 0) {
      return { success: true, agent: result[0] };
    }
    throw new Error('No se pudo insertar el agente en la base de datos.');
  } catch (error: any) {
    console.error('Error in createAgent action:', error);
    return { success: false, error: error.message || 'Error en la conexión con Supabase' };
  }
}

export async function updateAgent(agentId: string, updates: Partial<Agent>, token?: string): Promise<{ success: boolean; error?: string; agent?: Agent }> {
  try {
    const cleanId = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(agentId)
      ? agentId
      : (toUUID(agentId) || agentId);

    const result = await supabaseUpdate<Agent>('agents', cleanId, updates as Record<string, unknown>, token);
    if (result) {
      return { success: true, agent: result };
    }
    throw new Error('No se encontró el agente para actualizar.');
  } catch (error: any) {
    console.error('Error in updateAgent action:', error);
    return { success: false, error: error.message || 'Error en la conexión con Supabase' };
  }
}

export async function toggleAgentStatus(agentId: string, status: Agent['estado'], token?: string): Promise<{ success: boolean; error?: string; agent?: Agent }> {
  try {
    const cleanId = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(agentId)
      ? agentId
      : (toUUID(agentId) || agentId);

    const result = await supabaseUpdate<Agent>('agents', cleanId, { estado: status } as Record<string, unknown>, token);
    if (result) {
      return { success: true, agent: result };
    }
    throw new Error('No se encontró el agente para actualizar su estado.');
  } catch (error: any) {
    console.error('Error in toggleAgentStatus action:', error);
    return { success: false, error: error.message || 'Error en la conexión con Supabase' };
  }
}

export async function createActivity(data: Partial<AgentActivity>, token?: string): Promise<{ success: boolean; error?: string; activity?: AgentActivity }> {
  try {
    const result = await supabaseInsert<AgentActivity>('agent_activity', data as Record<string, unknown>, token);
    if (result && result.length > 0) {
      return { success: true, activity: result[0] };
    }
    throw new Error('No se pudo registrar la actividad en la base de datos.');
  } catch (error: any) {
    console.error('Error in createActivity action:', error);
    return { success: false, error: error.message || 'Error en la conexión con Supabase' };
  }
}

export async function getAgentActivities(agentId: string, token?: string): Promise<{ success: boolean; error?: string; activities?: AgentActivity[] }> {
  try {
    const cleanId = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(agentId)
      ? agentId
      : (toUUID(agentId) || agentId);

    const result = await supabaseSelect<AgentActivity>('agent_activity', {
      eq: ['agent_id', cleanId],
      order: { column: 'fecha', ascending: false },
      token,
    });
    return { success: true, activities: result || [] };
  } catch (error: any) {
    console.error('Error in getAgentActivities action:', error);
    return { success: false, error: error.message || 'Error en la conexión con Supabase' };
  }
}

export async function assignProperty(data: Partial<AgentPropertyAssignment>, token?: string): Promise<{ success: boolean; error?: string; assignment?: AgentPropertyAssignment }> {
  try {
    const result = await supabaseInsert<AgentPropertyAssignment>('agent_property_assignments', data as Record<string, unknown>, token);
    if (result && result.length > 0) {
      return { success: true, assignment: result[0] };
    }
    throw new Error('No se pudo crear la asignación en la base de datos.');
  } catch (error: any) {
    console.error('Error in assignProperty action:', error);
    return { success: false, error: error.message || 'Error en la conexión con Supabase' };
  }
}

export async function unassignProperty(assignmentId: string, token?: string): Promise<{ success: boolean; error?: string; assignment?: AgentPropertyAssignment }> {
  try {
    const cleanId = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(assignmentId)
      ? assignmentId
      : (toUUID(assignmentId) || assignmentId);

    const result = await supabaseUpdate<AgentPropertyAssignment>('agent_property_assignments', cleanId, { activo: false, fecha_desasignacion: new Date().toISOString() } as Record<string, unknown>, token);
    if (result) {
      return { success: true, assignment: result };
    }
    throw new Error('No se encontró la asignación para desactivar.');
  } catch (error: any) {
    console.error('Error in unassignProperty action:', error);
    return { success: false, error: error.message || 'Error en la conexión con Supabase' };
  }
}

export async function getAgentProperties(agentId: string, token?: string): Promise<{ success: boolean; error?: string; properties?: AgentPropertyAssignment[] }> {
  try {
    const cleanId = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(agentId)
      ? agentId
      : (toUUID(agentId) || agentId);

    const result = await supabaseSelect<AgentPropertyAssignment>('agent_property_assignments', {
      filter: { agent_id: cleanId, activo: true },
      token,
    });
    return { success: true, properties: result || [] };
  } catch (error: any) {
    console.error('Error in getAgentProperties action:', error);
    return { success: false, error: error.message || 'Error en la conexión con Supabase' };
  }
}

export async function assignClient(data: Partial<AgentClientAssignment>, token?: string): Promise<{ success: boolean; error?: string; assignment?: AgentClientAssignment }> {
  try {
    const result = await supabaseInsert<AgentClientAssignment>('agent_client_assignments', data as Record<string, unknown>, token);
    if (result && result.length > 0) {
      return { success: true, assignment: result[0] };
    }
    throw new Error('No se pudo guardar la asignación de cliente en la base de datos.');
  } catch (error: any) {
    console.error('Error in assignClient action:', error);
    return { success: false, error: error.message || 'Error en la conexión con Supabase' };
  }
}

export async function unassignClient(assignmentId: string, token?: string): Promise<{ success: boolean; error?: string; assignment?: AgentClientAssignment }> {
  try {
    const cleanId = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(assignmentId)
      ? assignmentId
      : (toUUID(assignmentId) || assignmentId);

    const result = await supabaseUpdate<AgentClientAssignment>('agent_client_assignments', cleanId, { activo: false } as Record<string, unknown>, token);
    if (result) {
      return { success: true, assignment: result };
    }
    throw new Error('No se encontró la asignación de cliente para desactivar.');
  } catch (error: any) {
    console.error('Error in unassignClient action:', error);
    return { success: false, error: error.message || 'Error en la conexión con Supabase' };
  }
}

export async function getAgentClients(agentId: string, token?: string): Promise<{ success: boolean; error?: string; clients?: AgentClientAssignment[] }> {
  try {
    const cleanId = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(agentId)
      ? agentId
      : (toUUID(agentId) || agentId);

    const result = await supabaseSelect<AgentClientAssignment>('agent_client_assignments', {
      filter: { agent_id: cleanId, activo: true },
      token,
    });
    return { success: true, clients: result || [] };
  } catch (error: any) {
    console.error('Error in getAgentClients action:', error);
    return { success: false, error: error.message || 'Error en la conexión con Supabase' };
  }
}

export async function getAgentCommissions(agentId: string, token?: string): Promise<{ success: boolean; error?: string; commissions?: AgentCommission[] }> {
  try {
    const cleanId = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(agentId)
      ? agentId
      : (toUUID(agentId) || agentId);

    const result = await supabaseSelect<AgentCommission>('agent_commissions', {
      eq: ['agent_id', cleanId],
      order: { column: 'fecha_generacion', ascending: false },
      token,
    });
    return { success: true, commissions: result || [] };
  } catch (error: any) {
    console.error('Error in getAgentCommissions action:', error);
    return { success: false, error: error.message || 'Error en la conexión con Supabase' };
  }
}

export async function deleteAgent(agentId: string, token?: string): Promise<{ success: boolean; error?: string }> {
  try {
    const cleanId = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(agentId)
      ? agentId
      : (toUUID(agentId) || agentId);

    const result = await supabaseUpdate<Agent>('agents', cleanId, { estado: 'baja_definitiva' } as Record<string, unknown>, token);
    if (result) {
      return { success: true };
    }
    throw new Error('No se pudo desactivar el agente.');
  } catch (error: any) {
    console.error('Error in deleteAgent action:', error);
    return { success: false, error: error.message || 'Error en la conexión con Supabase' };
  }
}

export async function addCommission(data: Partial<AgentCommission>, token?: string): Promise<{ success: boolean; error?: string; commission?: AgentCommission }> {
  try {
    const result = await supabaseInsert<AgentCommission>('agent_commissions', data as Record<string, unknown>, token);
    if (result && result.length > 0) {
      return { success: true, commission: result[0] };
    }
    throw new Error('No se pudo registrar la comisión en la base de datos.');
  } catch (error: any) {
    console.error('Error in addCommission action:', error);
    return { success: false, error: error.message || 'Error en la conexión con Supabase' };
  }
}
