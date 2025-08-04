-- Cambiar el tipo de columna user_id de UUID a TEXT para usar emails
ALTER TABLE public.email_templates 
ALTER COLUMN user_id TYPE TEXT;