-- Configuración del bucket documents (privado + RLS)
-- Ejecutar en Supabase SQL Editor

-- 1. Crear el bucket privado (idempotente)
INSERT INTO storage.buckets (id, name, public, avif_autodetection, file_size_limit, allowed_mime_types)
VALUES ('documents', 'documents', false, false, 52428800, NULL)
ON CONFLICT (id) DO UPDATE SET public = false;

-- 2. Eliminar políticas existentes para el bucket
DROP POLICY IF EXISTS "Give users access to own folder" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated uploads" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated reads" ON storage.objects;
DROP POLICY IF EXISTS "Allow service role all" ON storage.objects;

-- 3. RLS: los usuarios autenticados del CRM pueden leer y subir
CREATE POLICY "Allow authenticated reads" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'documents' AND auth.role() = 'authenticated'
  );

CREATE POLICY "Allow authenticated uploads" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'documents' AND auth.role() = 'authenticated'
  );

CREATE POLICY "Allow authenticated updates" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'documents' AND auth.role() = 'authenticated'
  );

-- 4. Servicio interno (service_role) tiene acceso total
CREATE POLICY "Allow service role all" ON storage.objects
  FOR ALL USING (
    bucket_id = 'documents' AND auth.role() = 'service_role'
  );

-- 5. Verificar
SELECT id, name, public FROM storage.buckets WHERE id = 'documents';
