// 📧 EMAILOCTOPUS API INTEGRATION
import { supabase } from '@/integrations/supabase/client'

// Función helper para llamar a las Edge Functions
const callEdgeFunction = async (functionName: string, body: any) => {
  const { data, error } = await supabase.functions.invoke(functionName, {
    body
  })
  
  if (error) {
    console.error(`Error calling ${functionName}:`, error)
    throw error
  }
  
  return data
}

export interface EmailOctopusList {
  id: string;
  name: string;
  double_opt_in: boolean;
  fields: {
    tag: string;
    type: string;
    label: string;
    fallback?: string;
  }[];
  counts: {
    pending: number;
    subscribed: number;
    unsubscribed: number;
  };
  created_at: string;
}

export interface EmailOctopusContact {
  id: string;
  email_address: string;
  fields: {
    FirstName?: string;
    LastName?: string;
    [key: string]: any;
  };
  tags: string[];
  status: 'SUBSCRIBED' | 'UNSUBSCRIBED' | 'PENDING';
  created_at: string;
}

export interface EmailOctopusCampaign {
  id: string;
  status: 'DRAFT' | 'SENDING' | 'SENT' | 'SCHEDULED';
  name: string;
  subject: string;
  to: string[];
  from: {
    name: string;
    email_address: string;
  };
  content: {
    html: string;
    plain_text: string;
  };
  created_at: string;
  sent_at?: string;
}

export interface EmailOctopusTemplate {
  id: string;
  name: string;
  subject: string;
  content: {
    html: string;
    plain_text: string;
  };
  created_at: string;
  updated_at: string;
}

export interface CampaignReport {
  sent: number;
  bounced: {
    hard: number;
    soft: number;
  };
  delivered: number;
  opened: {
    total: number;
    unique: number;
  };
  clicked: {
    total: number;
    unique: number;
  };
  unsubscribed: number;
  complained: number;
}

// 📋 OBTENER TODAS LAS LISTAS
export const getLists = async (): Promise<EmailOctopusList[]> => {
  try {
    console.log('🔍 Fetching lists from EmailOctopus...');
    const data = await callEdgeFunction('emailoctopus-proxy', {
      endpoint: '/lists?limit=100'
    });
    
    console.log('📋 Lists received:', data);
    return data.data || [];
  } catch (error) {
    console.error('❌ Error fetching lists:', error);
    return [];
  }
};

// 📋 CREAR NUEVA LISTA
export const createList = async (name: string, fromName: string, fromEmail: string): Promise<EmailOctopusList | null> => {
  try {
    const data = await callEdgeFunction('emailoctopus-proxy', {
      endpoint: '/lists',
      method: 'POST',
      body: {
        name,
        double_opt_in: false,
        fields: [
          {
            tag: 'EmailAddress',
            type: 'EMAIL',
            label: 'Email address'
          },
          {
            tag: 'FirstName',
            type: 'TEXT',
            label: 'First name',
            fallback: ''
          },
          {
            tag: 'LastName',
            type: 'TEXT',
            label: 'Last name',
            fallback: ''
          }
        ]
      }
    });
    
    return data;
  } catch (error) {
    console.error('Error creating list:', error);
    return null;
  }
};

// 👤 OBTENER CONTACTOS DE UNA LISTA
export const getContacts = async (listId: string): Promise<EmailOctopusContact[]> => {
  try {
    const data = await callEdgeFunction('emailoctopus-proxy', {
      endpoint: `/lists/${listId}/contacts?limit=100`
    });
    
    return data.data || [];
  } catch (error) {
    console.error('Error fetching contacts:', error);
    return [];
  }
};

// 👤 CREAR CONTACTO
export const createContact = async (
  listId: string, 
  email: string, 
  firstName?: string, 
  lastName?: string
): Promise<EmailOctopusContact | null> => {
  try {
    const fields: any = {
      EmailAddress: email
    };
    
    if (firstName) fields.FirstName = firstName;
    if (lastName) fields.LastName = lastName;
    
    const data = await callEdgeFunction('emailoctopus-proxy', {
      endpoint: `/lists/${listId}/contacts`,
      method: 'POST',
      body: {
        email_address: email,
        fields,
        status: 'SUBSCRIBED'
      }
    });
    
    return data;
  } catch (error) {
    console.error('Error creating contact:', error);
    return null;
  }
};

// 📧 CREAR CAMPAÑA - NOTA: EmailOctopus API v1.6 NO soporta creación de campañas via API
export const createCampaign = async (
  name: string,
  subject: string,
  fromName: string,
  fromEmail: string,
  listIds: string[],
  htmlContent: string,
  plainTextContent?: string
): Promise<EmailOctopusCampaign | null> => {
  // EmailOctopus API v1.6 NO permite crear campañas via API
  // Solo permite enviar campañas existentes que ya están en estado DRAFT
  console.error('❌ ERROR: EmailOctopus API v1.6 no permite crear campañas via API');
  console.error('Las campañas deben crearse manualmente en la plataforma de EmailOctopus');
  
  throw new Error('La creación de campañas via API no está soportada por EmailOctopus v1.6. Las campañas deben crearse manualmente en el dashboard de EmailOctopus.');
};

// 📧 ENVIAR CAMPAÑA
export const sendCampaign = async (campaignId: string): Promise<boolean> => {
  try {
    const data = await callEdgeFunction('emailoctopus-proxy', {
      endpoint: `/campaigns/${campaignId}/send`,
      method: 'POST'
    });
    
    return !!data;
  } catch (error) {
    console.error('Error sending campaign:', error);
    return false;
  }
};

// 📊 OBTENER REPORTE DE CAMPAÑA
export const getCampaignReport = async (campaignId: string): Promise<CampaignReport | null> => {
  try {
    const data = await callEdgeFunction('emailoctopus-proxy', {
      endpoint: `/campaigns/${campaignId}/reports/summary`
    });
    
    return data;
  } catch (error) {
    console.error('Error fetching campaign report:', error);
    return null;
  }
};

// 📧 OBTENER CAMPAÑAS
export const getCampaigns = async (): Promise<EmailOctopusCampaign[]> => {
  try {
    console.log('🔍 Fetching campaigns from EmailOctopus...');
    const data = await callEdgeFunction('emailoctopus-proxy', {
      endpoint: '/campaigns?limit=100'
    });
    
    console.log('📊 Campaigns received:', data);
    return data.data || [];
  } catch (error) {
    console.error('❌ Error fetching campaigns:', error);
    return [];
  }
};

// 🗑️ ELIMINAR CONTACTO
export const deleteContact = async (listId: string, contactId: string): Promise<boolean> => {
  try {
    const data = await callEdgeFunction('emailoctopus-proxy', {
      endpoint: `/lists/${listId}/contacts/${contactId}`,
      method: 'DELETE'
    });
    
    return !!data;
  } catch (error) {
    console.error('Error deleting contact:', error);
    return false;
  }
};

// 📤 IMPORTAR CONTACTOS EN LOTE
export const importContacts = async (
  listId: string, 
  contacts: { email: string; firstName?: string; lastName?: string }[]
): Promise<{ success: number; failed: number }> => {
  let success = 0;
  let failed = 0;
  
  // EmailOctopus no tiene endpoint para importación masiva en v1.6
  // Procesamos de uno en uno con delay para evitar rate limiting
  for (const contact of contacts) {
    try {
      const result = await createContact(listId, contact.email, contact.firstName, contact.lastName);
      if (result) {
        success++;
      } else {
        failed++;
      }
      
      // Delay para evitar rate limiting
      await new Promise(resolve => setTimeout(resolve, 200));
    } catch (error) {
      failed++;
    }
  }
  
  return { success, failed };
};

/**
 * Check if a campaign can be sent by making a test call
 */
export async function canSendCampaign(campaignId: string): Promise<{ canSend: boolean; reason?: string }> {
  try {
    // Get campaign details to check if it's valid for sending
    const campaigns = await getCampaigns();
    const campaign = campaigns.find(c => c.id === campaignId);
    
    if (!campaign) {
      return { canSend: false, reason: "Campaña no encontrada" };
    }
    
    if (campaign.status !== 'DRAFT') {
      return { canSend: false, reason: "Solo se pueden enviar campañas en estado DRAFT" };
    }
    
    // Check if campaign has basic requirements
    if (!campaign.subject || campaign.subject.trim() === '') {
      return { canSend: false, reason: "La campaña no tiene asunto" };
    }
    
    if (!campaign.to || campaign.to.length === 0) {
      return { canSend: false, reason: "La campaña no tiene listas de destinatarios" };
    }
    
    if (!campaign.content || (!campaign.content.html && !campaign.content.plain_text)) {
      return { canSend: false, reason: "La campaña no tiene contenido" };
    }
    
    return { canSend: true };
  } catch (error) {
    console.error('Error checking if campaign can be sent:', error);
    return { canSend: false, reason: "Error al verificar la campaña" };
  }
}

/**
 * Send a campaign immediately with pre-validation
 */
export async function sendCampaignNow(campaignId: string): Promise<boolean> {
  try {
    console.log('🚀 Attempting to send campaign:', campaignId);
    
    // First check if campaign can be sent
    const validation = await canSendCampaign(campaignId);
    if (!validation.canSend) {
      throw new Error(`No se puede enviar la campaña: ${validation.reason}`);
    }
    
    console.log('✅ Campaign validation passed');
    
    const response = await callEdgeFunction('emailoctopus-proxy', {
      endpoint: `/campaigns/${campaignId}/send`,
      method: 'POST'
    });
    
    console.log('✅ Send campaign response:', response);
    return response !== null;
  } catch (error) {
    console.error('❌ Error sending campaign:', error);
    // Throw the error so the UI can show a more specific message
    throw error;
  }
}

// ⚠️ NOTA: EmailOctopus API v1.6 NO soporta endpoints de creación/duplicación de campañas
// Las campañas solo se pueden crear a través de la interfaz web de EmailOctopus
// La API solo permite:
// - Obtener campañas existentes
// - Obtener reportes de campañas  
// - Enviar campañas DRAFT existentes
// 
// NO permite:
// - Crear nuevas campañas
// - Duplicar campañas
// - Editar campañas existentes
// - Programar envíos (solo envío inmediato)

// ⚠️ NOTA: EmailOctopus API v1.6 NO soporta endpoints de plantillas
// Las plantillas solo están disponibles a través de la interfaz web
// Tampoco soporta programación de fechas a través de API - solo envío inmediato