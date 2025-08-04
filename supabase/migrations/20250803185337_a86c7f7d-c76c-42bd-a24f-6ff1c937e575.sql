-- Cambiar el tipo de user_id de UUID a TEXT para permitir emails
ALTER TABLE public.email_templates ALTER COLUMN user_id TYPE TEXT;

-- Actualizar las políticas RLS para usar TEXT en lugar de UUID
DROP POLICY IF EXISTS "Users can view their own templates" ON public.email_templates;
DROP POLICY IF EXISTS "Users can create their own templates" ON public.email_templates;
DROP POLICY IF EXISTS "Users can update their own templates" ON public.email_templates;
DROP POLICY IF EXISTS "Users can delete their own templates" ON public.email_templates;

-- Recrear las políticas con el tipo correcto
CREATE POLICY "Users can view their own templates" 
ON public.email_templates 
FOR SELECT 
USING ((auth.jwt() ->> 'email')::text = user_id);

CREATE POLICY "Users can create their own templates" 
ON public.email_templates 
FOR INSERT 
WITH CHECK ((auth.jwt() ->> 'email')::text = user_id);

CREATE POLICY "Users can update their own templates" 
ON public.email_templates 
FOR UPDATE 
USING ((auth.jwt() ->> 'email')::text = user_id);

CREATE POLICY "Users can delete their own templates" 
ON public.email_templates 
FOR DELETE 
USING ((auth.jwt() ->> 'email')::text = user_id);