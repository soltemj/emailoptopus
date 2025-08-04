-- Eliminar políticas RLS
DROP POLICY IF EXISTS "Users can view their own templates" ON public.email_templates;
DROP POLICY IF EXISTS "Users can create their own templates" ON public.email_templates;
DROP POLICY IF EXISTS "Users can update their own templates" ON public.email_templates;
DROP POLICY IF EXISTS "Users can delete their own templates" ON public.email_templates;

-- Eliminar la restricción de clave foránea si existe
ALTER TABLE public.email_templates 
DROP CONSTRAINT IF EXISTS email_templates_user_id_fkey;

-- Cambiar el tipo de columna user_id de UUID a TEXT
ALTER TABLE public.email_templates 
ALTER COLUMN user_id TYPE TEXT;

-- Recrear las políticas RLS para usar TEXT (email) como identificador
CREATE POLICY "Users can view their own templates" 
ON public.email_templates 
FOR SELECT 
USING (user_id = auth.jwt() ->> 'email');

CREATE POLICY "Users can create their own templates" 
ON public.email_templates 
FOR INSERT 
WITH CHECK (user_id = auth.jwt() ->> 'email');

CREATE POLICY "Users can update their own templates" 
ON public.email_templates 
FOR UPDATE 
USING (user_id = auth.jwt() ->> 'email');

CREATE POLICY "Users can delete their own templates" 
ON public.email_templates 
FOR DELETE 
USING (user_id = auth.jwt() ->> 'email');