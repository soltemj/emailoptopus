// 📊 GOOGLE SHEETS API INTEGRATION
import { CONFIG, GOOGLE_SHEETS_BASE_URL } from './config';

export interface Usuario {
  email: string;
  password: string;
  nombre: string;
  apellido: string;
  telefono: string;
  empresa: string;
  direccion: string;
  ciudad: string;
  pais: string;
  fecha_registro: string;
}

export interface Campana {
  id: string;
  cliente_email: string;
  nombre: string;
  asunto: string;
  estado: string;
  fecha_creacion: string;
  fecha_envio: string;
  lista_id: string;
  enviados: number;
  abiertos: number;
  clicks: number;
  desuscripciones: number;
}

export interface NotificacionesUsuario {
  cliente_email: string;
  email_facturas: boolean;
  email_soporte: boolean;
  email_marketing: boolean;
  alertas_criticas: boolean;
  recordatorios_pago: boolean;
}

export interface Servicio {
  cliente_email: string;
  servicio: string;
  estado: string;
  fecha_contratacion: string;
  costo_mensual: number;
  consumo_actual: number;
  limite: number;
}

export interface Ticket {
  id: string;
  cliente_email: string;
  asunto: string;
  categoria: string;
  estado: string;
  fecha_creacion: string;
  ultima_actualizacion: string;
  mensajes: string;
}

export interface Factura {
  id: string;
  cliente_email: string;
  descripcion: string;
  monto: number;
  fecha_emision: string;
  fecha_vencimiento: string;
  estado: string;
}

export interface ReporteLlamada {
  fecha: string;
  extension: string;
  numero_destino: string;
  duracion: string;
  costo: number;
  tipo: string;
}

// 🔐 AUTENTICACIÓN
export const authenticateUser = async (email: string, password: string): Promise<Usuario | null> => {
  try {
    const response = await fetch(
      `${GOOGLE_SHEETS_BASE_URL}/${CONFIG.GOOGLE_SHEETS.RANGES.usuarios}?key=${CONFIG.GOOGLE_SHEETS.API_KEY}`
    );
    const data = await response.json();
    
    if (data.values) {
      const usuarios = data.values.slice(1); // Skip header row
      const usuario = usuarios.find((row: string[]) => row[0] === email && row[1] === password);
      
      if (usuario) {
        return {
          email: usuario[0],
          password: usuario[1],
          nombre: usuario[2],
          apellido: usuario[3] || '',
          telefono: usuario[4] || '',
          empresa: usuario[5] || '',
          direccion: usuario[6] || '',
          ciudad: usuario[7] || '',
          pais: usuario[8] || '',
          fecha_registro: usuario[9] || ''
        };
      }
    }
    return null;
  } catch (error) {
    console.error('Error authenticating user:', error);
    return null;
  }
};

// 📧 OBTENER CAMPAÑAS DEL USUARIO
export const getUserCampaigns = async (email: string): Promise<Campana[]> => {
  try {
    const response = await fetch(
      `${GOOGLE_SHEETS_BASE_URL}/${CONFIG.GOOGLE_SHEETS.RANGES.campanas}?key=${CONFIG.GOOGLE_SHEETS.API_KEY}`
    );
    const data = await response.json();
    
    if (data.values) {
      const campanas = data.values.slice(1); // Skip header row
      return campanas
        .filter((row: string[]) => row[1] === email)
        .map((row: string[]) => ({
          id: row[0],
          cliente_email: row[1],
          nombre: row[2],
          asunto: row[3],
          estado: row[4],
          fecha_creacion: row[5],
          fecha_envio: row[6],
          lista_id: row[7],
          enviados: parseInt(row[8]) || 0,
          abiertos: parseInt(row[9]) || 0,
          clicks: parseInt(row[10]) || 0,
          desuscripciones: parseInt(row[11]) || 0
        }));
    }
    return [];
  } catch (error) {
    console.error('Error fetching user campaigns:', error);
    return [];
  }
};

// 📋 OBTENER SERVICIOS DEL USUARIO
export const getUserServices = async (email: string): Promise<Servicio[]> => {
  try {
    const response = await fetch(
      `${GOOGLE_SHEETS_BASE_URL}/${CONFIG.GOOGLE_SHEETS.RANGES.servicios}?key=${CONFIG.GOOGLE_SHEETS.API_KEY}`
    );
    const data = await response.json();
    
    if (data.values) {
      const servicios = data.values.slice(1); // Skip header row
      return servicios
        .filter((row: string[]) => row[0] === email)
        .map((row: string[]) => ({
          cliente_email: row[0],
          servicio: row[1],
          estado: row[2],
          fecha_contratacion: row[3],
          costo_mensual: parseFloat(row[4]) || 0,
          consumo_actual: parseFloat(row[5]) || 0,
          limite: parseFloat(row[6]) || 0
        }));
    }
    return [];
  } catch (error) {
    console.error('Error fetching user services:', error);
    return [];
  }
};

// 🎫 OBTENER TICKETS DEL USUARIO
export const getUserTickets = async (email: string): Promise<Ticket[]> => {
  try {
    const response = await fetch(
      `${GOOGLE_SHEETS_BASE_URL}/${CONFIG.GOOGLE_SHEETS.RANGES.tickets}?key=${CONFIG.GOOGLE_SHEETS.API_KEY}`
    );
    const data = await response.json();
    
    let sheetsTickets: Ticket[] = [];
    
    if (data.values) {
      const tickets = data.values.slice(1); // Skip header row
      sheetsTickets = tickets
        .filter((row: string[]) => row[1] === email)
        .map((row: string[]) => ({
          id: row[0],
          cliente_email: row[1],
          asunto: row[2],
          categoria: row[3],
          estado: row[4],
          fecha_creacion: row[5],
          ultima_actualizacion: row[6],
          mensajes: row[7]
        }));
    }

    // También obtener tickets del localStorage (tickets creados localmente)
    const localTickets = localStorage.getItem(`userTickets_${email}`);
    const parsedLocalTickets = localTickets ? JSON.parse(localTickets) : [];
    
    // Combinar tickets de Google Sheets y localStorage
    const allTickets = [...sheetsTickets, ...parsedLocalTickets];
    
    return allTickets;
  } catch (error) {
    console.error('Error fetching user tickets:', error);
    return [];
  }
};

// 💰 OBTENER FACTURAS DEL USUARIO
export const getUserBilling = async (email: string): Promise<Factura[]> => {
  try {
    const response = await fetch(
      `${GOOGLE_SHEETS_BASE_URL}/${CONFIG.GOOGLE_SHEETS.RANGES.facturas}?key=${CONFIG.GOOGLE_SHEETS.API_KEY}`
    );
    const data = await response.json();
    
    if (data.values) {
      const facturas = data.values.slice(1); // Skip header row
      return facturas
        .filter((row: string[]) => row[1] === email)
        .map((row: string[]) => ({
          id: row[0],
          cliente_email: row[1],
          descripcion: row[2],
          monto: parseFloat(row[3]) || 0,
          fecha_emision: row[4],
          fecha_vencimiento: row[5],
          estado: row[6]
        }));
    }
    return [];
  } catch (error) {
    console.error('Error fetching user billing:', error);
    return [];
  }
};

// 📞 OBTENER REPORTES DE LLAMADAS
export const getUserCallReports = async (email: string): Promise<ReporteLlamada[]> => {
  try {
    const response = await fetch(
      `${GOOGLE_SHEETS_BASE_URL}/${CONFIG.GOOGLE_SHEETS.RANGES.reportes_llamadas}?key=${CONFIG.GOOGLE_SHEETS.API_KEY}`
    );
    const data = await response.json();
    
    if (data.values) {
      const reportes = data.values.slice(1); // Skip header row
      return reportes
        .filter((row: string[]) => row[0] === email)
        .map((row: string[]) => ({
          fecha: row[1],
          extension: row[2],
          numero_destino: row[3],
          duracion: row[4],
          costo: parseFloat(row[5]) || 0,
          tipo: row[6]
        }));
    }
    return [];
  } catch (error) {
    console.error('Error fetching call reports:', error);
    return [];
  }
};

// ❓ OBTENER FAQs
export const getFAQs = async (): Promise<{categoria: string; pregunta: string; respuesta: string}[]> => {
  try {
    const response = await fetch(
      `${GOOGLE_SHEETS_BASE_URL}/${CONFIG.GOOGLE_SHEETS.RANGES.faqs}?key=${CONFIG.GOOGLE_SHEETS.API_KEY}`
    );
    const data = await response.json();
    
    if (data.values) {
      const faqs = data.values.slice(1); // Skip header row
      return faqs.map((row: string[]) => ({
        categoria: row[0],
        pregunta: row[1],
        respuesta: row[2]
      }));
    }
    return [];
  } catch (error) {
    console.error('Error fetching FAQs:', error);
    return [];
  }
};

// 📊 CREAR NUEVO TICKET
export const createTicket = async (ticket: Omit<Ticket, 'id'>): Promise<boolean> => {
  try {
    // Generate unique ID with timestamp
    const ticketId = `TKT-${Date.now()}`;
    const newTicket = {
      ...ticket,
      id: ticketId,
      fecha_creacion: new Date().toISOString().split('T')[0],
      estado: 'Abierto'
    };
    
    console.log('Creating ticket with ID:', ticketId);
    
    // Save to localStorage for immediate UI update with user-specific key
    const userTicketKey = `userTickets_${ticket.cliente_email}`;
    const existingTickets = JSON.parse(localStorage.getItem(userTicketKey) || '[]');
    existingTickets.unshift(newTicket); // Add to beginning for recent display
    localStorage.setItem(userTicketKey, JSON.stringify(existingTickets));
    
    // In a real implementation, you would also send this to Google Sheets
    // For now, we'll simulate success
    console.log('Ticket created successfully:', newTicket);
    
    return true;
  } catch (error) {
    console.error('Error creating ticket:', error);
    return false;
  }
};

// 👤 OBTENER PERFIL DE USUARIO
export const getUserProfile = async (email: string): Promise<Usuario | null> => {
  try {
    const response = await fetch(
      `${GOOGLE_SHEETS_BASE_URL}/${CONFIG.GOOGLE_SHEETS.RANGES.usuarios}?key=${CONFIG.GOOGLE_SHEETS.API_KEY}`
    );
    const data = await response.json();
    
    if (data.values) {
      const usuarios = data.values.slice(1); // Skip header row
      const usuario = usuarios.find((row: string[]) => row[0] === email);
      
      if (usuario) {
        return {
          email: usuario[0],
          password: usuario[1],
          nombre: usuario[2],
          apellido: usuario[3] || '',
          telefono: usuario[4] || '',
          empresa: usuario[5] || '',
          direccion: usuario[6] || '',
          ciudad: usuario[7] || '',
          pais: usuario[8] || '',
          fecha_registro: usuario[9] || ''
        };
      }
    }
    return null;
  } catch (error) {
    console.error('Error fetching user profile:', error);
    return null;
  }
};

// ✏️ ACTUALIZAR PERFIL DE USUARIO
export const updateUserProfile = async (email: string, userData: Partial<Usuario>): Promise<boolean> => {
  try {
    console.log('Updating user profile for:', email, userData);
    
    // Nota: Google Sheets API requiere OAuth2 para operaciones de escritura
    // Por ahora, simularemos una actualización exitosa y guardaremos en localStorage
    
    // Simular delay de red
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Guardar en localStorage como respaldo
    const currentData = localStorage.getItem(`userProfile_${email}`);
    const profileData = currentData ? JSON.parse(currentData) : {};
    
    const updatedProfile = {
      ...profileData,
      ...userData,
      email,
      lastUpdated: new Date().toISOString()
    };
    
    localStorage.setItem(`userProfile_${email}`, JSON.stringify(updatedProfile));
    
    console.log('Profile updated successfully in localStorage');
    return true;
  } catch (error) {
    console.error('Error updating user profile:', error);
    return false;
  }
};

// 🔔 OBTENER NOTIFICACIONES DE USUARIO
export const getUserNotifications = async (email: string): Promise<NotificacionesUsuario | null> => {
  try {
    const response = await fetch(
      `${GOOGLE_SHEETS_BASE_URL}/${CONFIG.GOOGLE_SHEETS.RANGES.notificaciones_usuario}?key=${CONFIG.GOOGLE_SHEETS.API_KEY}`
    );
    const data = await response.json();
    
    if (data.values) {
      const notificaciones = data.values.slice(1); // Skip header row
      const userNotification = notificaciones.find((row: string[]) => row[0] === email);
      
      if (userNotification) {
        return {
          cliente_email: userNotification[0],
          email_facturas: userNotification[1] === 'true',
          email_soporte: userNotification[2] === 'true',
          email_marketing: userNotification[3] === 'true',
          alertas_criticas: userNotification[4] === 'true',
          recordatorios_pago: userNotification[5] === 'true'
        };
      }
    }
    
    // Retornar configuración por defecto si no existe
    return {
      cliente_email: email,
      email_facturas: true,
      email_soporte: true,
      email_marketing: false,
      alertas_criticas: true,
      recordatorios_pago: true
    };
  } catch (error) {
    console.error('Error fetching user notifications:', error);
    return null;
  }
};

// 🔔 ACTUALIZAR NOTIFICACIONES DE USUARIO
export const updateUserNotifications = async (email: string, notifications: Partial<NotificacionesUsuario>): Promise<boolean> => {
  try {
    console.log('Updating user notifications for:', email, notifications);
    
    // Nota: Google Sheets API requiere OAuth2 para operaciones de escritura
    // Por ahora, simularemos una actualización exitosa y guardaremos en localStorage
    
    // Simular delay de red
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Guardar en localStorage como respaldo
    const currentData = localStorage.getItem(`userNotifications_${email}`);
    const notificationData = currentData ? JSON.parse(currentData) : {};
    
    const updatedNotifications = {
      ...notificationData,
      ...notifications,
      cliente_email: email,
      lastUpdated: new Date().toISOString()
    };
    
    localStorage.setItem(`userNotifications_${email}`, JSON.stringify(updatedNotifications));
    
    console.log('Notifications updated successfully in localStorage');
    return true;
  } catch (error) {
    console.error('Error updating user notifications:', error);
    return false;
  }
};
