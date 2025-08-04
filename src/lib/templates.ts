import { supabase } from '@/integrations/supabase/client';
import { getCurrentUser } from '@/lib/auth';

export interface EmailTemplate {
  id: string;
  user_id: string;
  name: string;
  subject: string;
  category: string;
  content: string;
  html_content?: string;
  usage_count: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateTemplateData {
  name: string;
  subject: string;
  category: string;
  content: string;
  html_content?: string;
}

// 📧 OBTENER PLANTILLAS DEL USUARIO
export const getTemplates = async (): Promise<EmailTemplate[]> => {
  try {
    console.log('🔍 Fetching templates from database...');
    const currentUser = getCurrentUser();
    
    if (!currentUser?.user?.email) {
      console.error('❌ No user authenticated');
      return [];
    }

    const userId = currentUser.user.email; // Usar email como identificador

    const { data, error } = await supabase
      .from('email_templates')
      .select('*')
      .eq('user_id', userId)
      .eq('is_active', true)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('❌ Error fetching templates:', error);
      return [];
    }

    console.log('📊 Templates received:', data);
    return data || [];
  } catch (error) {
    console.error('❌ Error fetching templates:', error);
    return [];
  }
};

// 📝 CREAR NUEVA PLANTILLA
export const createTemplate = async (templateData: CreateTemplateData): Promise<EmailTemplate | null> => {
  try {
    console.log('📝 Creating new template:', templateData);
    const currentUser = getCurrentUser();
    
    if (!currentUser?.user?.email) {
      console.error('❌ No user authenticated');
      return null;
    }

    const userId = currentUser.user.email;

    const { data, error } = await supabase
      .from('email_templates')
      .insert({
        user_id: userId,
        name: templateData.name,
        subject: templateData.subject,
        category: templateData.category,
        content: templateData.content,
        html_content: templateData.html_content || templateData.content,
        usage_count: 0,
        is_active: true
      })
      .select()
      .single();

    if (error) {
      console.error('❌ Error creating template:', error);
      return null;
    }

    console.log('✅ Template created successfully:', data);
    return data;
  } catch (error) {
    console.error('❌ Error creating template:', error);
    return null;
  }
};

// ✏️ ACTUALIZAR PLANTILLA
export const updateTemplate = async (id: string, templateData: Partial<CreateTemplateData>): Promise<EmailTemplate | null> => {
  try {
    console.log('✏️ Updating template:', id, templateData);
    const currentUser = getCurrentUser();
    
    if (!currentUser?.user?.email) {
      console.error('❌ No user authenticated');
      return null;
    }

    const userId = currentUser.user.email;

    const { data, error } = await supabase
      .from('email_templates')
      .update(templateData)
      .eq('id', id)
      .eq('user_id', userId)
      .select()
      .single();

    if (error) {
      console.error('❌ Error updating template:', error);
      return null;
    }

    console.log('✅ Template updated successfully:', data);
    return data;
  } catch (error) {
    console.error('❌ Error updating template:', error);
    return null;
  }
};

// 🗑️ ELIMINAR PLANTILLA (soft delete)
export const deleteTemplate = async (id: string): Promise<boolean> => {
  try {
    console.log('🗑️ Deleting template:', id);
    const currentUser = getCurrentUser();
    
    if (!currentUser?.user?.email) {
      console.error('❌ No user authenticated');
      return false;
    }

    const userId = currentUser.user.email;

    const { error } = await supabase
      .from('email_templates')
      .update({ is_active: false })
      .eq('id', id)
      .eq('user_id', userId);

    if (error) {
      console.error('❌ Error deleting template:', error);
      return false;
    }

    console.log('✅ Template deleted successfully');
    return true;
  } catch (error) {
    console.error('❌ Error deleting template:', error);
    return false;
  }
};

// 📊 INCREMENTAR CONTADOR DE USO
export const incrementTemplateUsage = async (id: string): Promise<boolean> => {
  try {
    console.log('📊 Incrementing template usage:', id);
    const currentUser = getCurrentUser();
    
    if (!currentUser?.user?.email) {
      console.error('❌ No user authenticated');
      return false;
    }

    const userId = currentUser.user.email;

    const { error } = await supabase
      .from('email_templates')
      .update({ 
        usage_count: 1 // Simplificado por ahora
      })
      .eq('id', id)
      .eq('user_id', userId);

    if (error) {
      console.error('❌ Error incrementing template usage:', error);
      return false;
    }

    console.log('✅ Template usage incremented successfully');
    return true;
  } catch (error) {
    console.error('❌ Error incrementing template usage:', error);
    return false;
  }
};

// 🔍 OBTENER PLANTILLA POR ID
export const getTemplate = async (id: string): Promise<EmailTemplate | null> => {
  try {
    console.log('🔍 Fetching template by ID:', id);
    const currentUser = getCurrentUser();
    
    if (!currentUser?.user?.email) {
      console.error('❌ No user authenticated');
      return null;
    }

    const userId = currentUser.user.email;

    const { data, error } = await supabase
      .from('email_templates')
      .select('*')
      .eq('id', id)
      .eq('user_id', userId)
      .eq('is_active', true)
      .single();

    if (error) {
      console.error('❌ Error fetching template:', error);
      return null;
    }

    console.log('✅ Template fetched successfully:', data);
    return data;
  } catch (error) {
    console.error('❌ Error fetching template:', error);
    return null;
  }
};