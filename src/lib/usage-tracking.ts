// Real usage tracking based on EmailOctopus data
import { getCampaigns, getLists, getContacts, getCampaignReport } from './emailoctopus';

export interface RealUsageData {
  emails: {
    sent: number;
    remaining: number;
    limit: number;
  };
  contacts: {
    total: number;
    remaining: number;
    limit: number;
  };
  campaigns: {
    created: number;
    remaining: number;
    limit: number;
  };
  lastUpdated: string;
}

// Cache para evitar múltiples llamadas a la API
let usageCache: RealUsageData | null = null;
let lastCacheUpdate = 0;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutos

export const getRealUsageData = async (): Promise<RealUsageData> => {
  // Verificar cache
  const now = Date.now();
  if (usageCache && (now - lastCacheUpdate) < CACHE_DURATION) {
    return usageCache;
  }

  try {
    console.log('🔍 Fetching real usage data from EmailOctopus...');
    
    // Obtener listas y campañas en paralelo
    const [lists, campaigns] = await Promise.all([
      getLists(),
      getCampaigns()
    ]);

    // Contar contactos totales
    let totalContacts = 0;
    for (const list of lists) {
      totalContacts += list.counts.subscribed;
    }

    // Contar emails enviados (de campañas enviadas)
    let totalEmailsSent = 0;
    for (const campaign of campaigns) {
      if (campaign.status === 'SENT') {
        try {
          const report = await getCampaignReport(campaign.id);
          if (report) {
            totalEmailsSent += report.sent || 0;
          }
        } catch (error) {
          console.warn(`Could not get report for campaign ${campaign.id}:`, error);
        }
      }
    }

    // Límites basados en plan (ajustar según tu plan de EmailOctopus)
    const limits = {
      emails: 10000, // 10k emails por mes (ajustar según tu plan)
      contacts: 2500, // 2.5k contactos (ajustar según tu plan)
      campaigns: 50   // 50 campañas por mes
    };

    const usageData: RealUsageData = {
      emails: {
        sent: totalEmailsSent,
        remaining: Math.max(0, limits.emails - totalEmailsSent),
        limit: limits.emails
      },
      contacts: {
        total: totalContacts,
        remaining: Math.max(0, limits.contacts - totalContacts),
        limit: limits.contacts
      },
      campaigns: {
        created: campaigns.length,
        remaining: Math.max(0, limits.campaigns - campaigns.length),
        limit: limits.campaigns
      },
      lastUpdated: new Date().toISOString()
    };

    // Actualizar cache
    usageCache = usageData;
    lastCacheUpdate = now;

    console.log('✅ Real usage data fetched:', usageData);
    return usageData;

  } catch (error) {
    console.error('❌ Error fetching real usage data:', error);
    
    // Retornar datos por defecto en caso de error
    return {
      emails: {
        sent: 0,
        remaining: 10000,
        limit: 10000
      },
      contacts: {
        total: 0,
        remaining: 2500,
        limit: 2500
      },
      campaigns: {
        created: 0,
        remaining: 50,
        limit: 50
      },
      lastUpdated: new Date().toISOString()
    };
  }
};

// Limpiar cache manualmente
export const clearUsageCache = () => {
  usageCache = null;
  lastCacheUpdate = 0;
};