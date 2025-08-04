-- Eliminar las políticas RLS existentes
DROP POLICY IF EXISTS "Users can view their own templates" ON public.email_templates;
DROP POLICY IF EXISTS "Users can create their own templates" ON public.email_templates;
DROP POLICY IF EXISTS "Users can update their own templates" ON public.email_templates;
DROP POLICY IF EXISTS "Users can delete their own templates" ON public.email_templates;

-- Crear políticas RLS que usen la función correcta para obtener el email del usuario
CREATE POLICY "Users can view their own templates" 
ON public.email_templates 
FOR SELECT 
USING (user_id = (auth.jwt() ->> 'email')::text);

CREATE POLICY "Users can create their own templates" 
ON public.email_templates 
FOR INSERT 
WITH CHECK (user_id = (auth.jwt() ->> 'email')::text);

CREATE POLICY "Users can update their own templates" 
ON public.email_templates 
FOR UPDATE 
USING (user_id = (auth.jwt() ->> 'email')::text);

CREATE POLICY "Users can delete their own templates" 
ON public.email_templates 
FOR DELETE 
USING (user_id = (auth.jwt() ->> 'email')::text);