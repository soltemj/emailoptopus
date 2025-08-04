// 🔧 CONFIGURACIÓN PRINCIPAL DEL DASHBOARD ZY SOLUTIONS
// Aquí configurarás todas las APIs y conexiones

export const CONFIG = {
  // 📊 GOOGLE SHEETS CONFIGURATION
  GOOGLE_SHEETS: {
    API_KEY: "AIzaSyBE9JqOSm66nzy8At5Hvq6c03hNJqWpiuw", // Obtener de Google Cloud Console
    SHEET_ID: "1fj8600LXxgHcxXQ3a2w7uWgdCly7rTLEiWHI2QsiA7M", // ID del Google Sheet principal
    RANGES: {
      usuarios: "usuarios!A:J",
      servicios: "servicios!A:H", 
      tickets: "tickets!A:H",
      facturas: "facturas!A:G",
      reportes_llamadas: "reportes_llamadas!A:G",
      faqs: "faqs!A:D",
      notificaciones_usuario: "notificaciones_usuario!A:F",
      campanas: "campanas!A:L" // Nueva hoja para campañas
    }
  },

  // 📧 EMAILOCTOPUS CONFIGURATION
  EMAILOCTOPUS: {
    API_KEY: "eo_1b95b7a03a24aca9e1d1a70af5cdbb3bb20830db389187ffe1fdc00fa87f1218",
    BASE_URL: "https://emailoctopus.com/api/1.6", // API v1.6 es la más estable
    BASE_URL_V2: "https://emailoctopus.com/api/2" // API v2 para funciones avanzadas
  },

  // 📞 CENTRAL TELEFÓNICA (PBX)
  PBX: {
    IP_ADDRESS: "https://zyserver21.dyndns.info", // 🔥 AQUÍ PONES LA IP DE TU CENTRAL TELEFÓNICA
    PORT: "",
    PROTOCOL: "http:" // o "https:" según tu configuración
  },


  // 💳 PAYPAL CONFIGURATION
  PAYPAL: {
    CLIENT_ID: "TU_PAYPAL_CLIENT_ID_AQUI", // Obtener de PayPal Developer
    ENVIRONMENT: "sandbox" // cambiar a "live" en producción
  },

  // 🏢 INFORMACIÓN DE LA EMPRESA
  COMPANY: {
    name: "Zy Solutions",
    supportEmail: "info@zysolutions.com",
    phone: "+1 (809) 633-1000"
  }
};

// 🌐 URLs de la API de Google Sheets
export const GOOGLE_SHEETS_BASE_URL = `https://sheets.googleapis.com/v4/spreadsheets/${CONFIG.GOOGLE_SHEETS.SHEET_ID}/values`;