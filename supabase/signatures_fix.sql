-- Añadir columnas faltantes a la tabla signatures
ALTER TABLE public.signatures ADD COLUMN IF NOT EXISTS token TEXT;
ALTER TABLE public.signatures ADD COLUMN IF NOT EXISTS signature_image_url TEXT;
ALTER TABLE public.signatures ADD COLUMN IF NOT EXISTS signed_document_url TEXT;

-- Cambiar agency_id a TEXT para compatibilidad con IDs del CRM
ALTER TABLE public.signatures ALTER COLUMN agency_id TYPE TEXT USING agency_id::TEXT;
ALTER TABLE public.signatures ALTER COLUMN document_id TYPE TEXT USING document_id::TEXT;
ALTER TABLE public.signatures DROP CONSTRAINT IF EXISTS signatures_agency_id_fkey;
