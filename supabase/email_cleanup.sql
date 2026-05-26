-- Eliminar todas las cuentas duplicadas
DELETE FROM public.email_accounts;

-- Añadir constraint único para evitar duplicados futuros
ALTER TABLE public.email_accounts
ADD CONSTRAINT email_accounts_agency_email_key UNIQUE (agency_id, email);
