-- Eliminar políticas y constraints que bloquean el cambio
DROP POLICY IF EXISTS "Signatures isolation by agency" ON public.signatures;

DO $$ BEGIN
  EXECUTE (
    SELECT 'ALTER TABLE public.signatures DROP CONSTRAINT ' || conname || ' CASCADE;'
    FROM pg_constraint
    WHERE conrelid = 'public.signatures'::regclass AND contype = 'f'
  );
END $$;

-- Añadir columnas faltantes
ALTER TABLE public.signatures ADD COLUMN IF NOT EXISTS token TEXT;
ALTER TABLE public.signatures ADD COLUMN IF NOT EXISTS signature_image_url TEXT;
ALTER TABLE public.signatures ADD COLUMN IF NOT EXISTS signed_document_url TEXT;

-- Cambiar tipos a TEXT
ALTER TABLE public.signatures ALTER COLUMN agency_id TYPE TEXT USING agency_id::TEXT;
ALTER TABLE public.signatures ALTER COLUMN document_id TYPE TEXT USING document_id::TEXT;
ALTER TABLE public.signatures ALTER COLUMN operation_id TYPE TEXT USING operation_id::TEXT;

CREATE POLICY "Allow all" ON public.signatures
    USING (true) WITH CHECK (true);
