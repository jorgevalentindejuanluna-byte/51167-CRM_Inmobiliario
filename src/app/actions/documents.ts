'use server';

import { supabaseServer } from '@/lib/supabase-server';

export async function uploadFile(formData: FormData) {
  try {
    const file = formData.get('file') as File;
    const bucket = formData.get('bucket') as string;
    const path = formData.get('path') as string;

    if (!file || !bucket || !path) {
      throw new Error('Faltan parámetros requeridos');
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const { error, data } = await supabaseServer.storage
      .from(bucket)
      .upload(path, buffer, {
        contentType: file.type || 'application/octet-stream',
        upsert: true
      });

    if (error) {
      console.error('Error subiendo archivo con Service Key:', error);
      throw new Error(error.message);
    }

    return { success: true, path: data.path };
  } catch (err: any) {
    console.error('uploadFile action failed:', err);
    return { success: false, error: err.message };
  }
}

export async function getSignedUrl(path: string, bucket: string = 'documents') {
  try {
    const { data, error } = await supabaseServer.storage
      .from(bucket)
      .createSignedUrl(path, 3600, { download: false });

    if (error || !data) {
      console.error('Error generando signed URL:', error);
      return { success: false, error: error?.message || 'No se pudo generar la URL firmada' };
    }

    return { success: true, url: data.signedUrl };
  } catch (err: any) {
    console.error('getSignedUrl action failed:', err);
    return { success: false, error: err.message };
  }
}

export async function getSignedUrlIfExists(path: string, bucket: string = 'documents') {
  try {
    const { data: exists } = await supabaseServer.storage
      .from(bucket)
      .list(getParentFolder(path), { search: getFileName(path), limit: 1 });

    const fileExists = exists?.some(f => f.name === getFileName(path)) ?? false;
    if (!fileExists) {
      return { success: false, error: 'El archivo no existe en el almacenamiento' };
    }

    const { data, error } = await supabaseServer.storage
      .from(bucket)
      .createSignedUrl(path, 3600, { download: false });

    if (error || !data) {
      console.error('Error generando signed URL:', error);
      return { success: false, error: error?.message || 'No se pudo generar la URL firmada' };
    }

    return { success: true, url: data.signedUrl };
  } catch (err: any) {
    console.error('getSignedUrl action failed:', err);
    return { success: false, error: err.message };
  }
}

function getParentFolder(filePath: string): string {
  const lastSlash = filePath.lastIndexOf('/');
  return lastSlash > 0 ? filePath.slice(0, lastSlash) : '';
}

function getFileName(filePath: string): string {
  const lastSlash = filePath.lastIndexOf('/');
  return lastSlash >= 0 ? filePath.slice(lastSlash + 1) : filePath;
}

export async function saveDocument(documentData: any) {
  try {
    const { error, data } = await supabaseServer
      .from('documents')
      .insert([documentData])
      .select()
      .single();

    if (error) {
      console.error('Error insertando documento con Service Key:', error);
      throw new Error(error.message);
    }

    return { success: true, data };
  } catch (err: any) {
    console.error('saveDocument action failed:', err);
    return { success: false, error: err.message };
  }
}

export async function updateDocument(docId: string, documentData: any) {
  try {
    const { error, data } = await supabaseServer
      .from('documents')
      .update(documentData)
      .eq('id', docId)
      .select()
      .single();

    if (error) {
      console.error('Error actualizando documento con Service Key:', error);
      throw new Error(error.message);
    }

    return { success: true, data };
  } catch (err: any) {
    console.error('updateDocument action failed:', err);
    return { success: false, error: err.message };
  }
}

export async function deleteDocument(docId: string) {
  try {
    const { error, data } = await supabaseServer
      .from('documents')
      .delete()
      .eq('id', docId);

    if (error) {
      console.error('Error borrando documento con Service Key:', error);
      throw new Error(error.message);
    }

    return { success: true, data };
  } catch (err: any) {
    console.error('deleteDocument action failed:', err);
    return { success: false, error: err.message };
  }
}

export async function getDocuments(filters?: Record<string, string>) {
  try {
    let query = supabaseServer.from('documents').select('*');

    if (filters) {
      for (const [key, value] of Object.entries(filters)) {
        if (value) query = query.eq(key, value);
      }
    }

    const { data, error } = await query.order('created_at', { ascending: false });

    if (error) throw new Error(error.message);

    return { success: true, data };
  } catch (err: any) {
    console.error('getDocuments action failed:', err);
    return { success: false, error: err.message, data: [] };
  }
}
