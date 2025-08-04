
// 📊 SISTEMA DE LÍMITES DE USO
import { getCurrentUser } from './auth';

export interface UsageLimit {
  emails_sent: number;
  max_emails: number;
  contacts_imported: number;
  max_contacts: number;
  campaigns_created: number;
  max_campaigns: number;
  templates_created: number;
  max_templates: number;
  reset_date: string; // Fecha de reset mensual
}

const USAGE_STORAGE_KEY = 'zy_usage_limits';

// 📋 LÍMITES POR DEFECTO MENSUAL
const DEFAULT_LIMITS: UsageLimit = {
  emails_sent: 5234, // Ejemplo de uso actual
  max_emails: 10000, // 10,000 emails por mes
  contacts_imported: 1247, // Ejemplo de contactos importados
  max_contacts: 2400, // 2,400 contactos
  campaigns_created: 12, // Ejemplo de campañas creadas
  max_campaigns: 50, // 50 campañas por mes
  templates_created: 8, // Ejemplo de plantillas creadas
  max_templates: 20, // 20 plantillas
  reset_date: getNextResetDate()
};

function getNextResetDate(): string {
  const now = new Date();
  const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);
  return nextMonth.toISOString();
}

// 📊 OBTENER LÍMITES ACTUALES
export const getCurrentUsage = (): UsageLimit => {
  const currentUser = getCurrentUser();
  if (!currentUser) return DEFAULT_LIMITS;
  
  const userUsageKey = `${USAGE_STORAGE_KEY}_${currentUser.user.email}`;
  const storedUsage = localStorage.getItem(userUsageKey);
  
  if (!storedUsage) {
    const newUsage = { ...DEFAULT_LIMITS };
    localStorage.setItem(userUsageKey, JSON.stringify(newUsage));
    return newUsage;
  }
  
  const usage: UsageLimit = JSON.parse(storedUsage);
  
  // Verificar si necesita reset mensual
  const now = new Date();
  const resetDate = new Date(usage.reset_date);
  
  if (now >= resetDate) {
    const resetUsage: UsageLimit = {
      ...DEFAULT_LIMITS,
      reset_date: getNextResetDate()
    };
    localStorage.setItem(userUsageKey, JSON.stringify(resetUsage));
    return resetUsage;
  }
  
  return usage;
};

// 📈 INCREMENTAR USO
export const incrementUsage = (type: keyof Pick<UsageLimit, 'emails_sent' | 'contacts_imported' | 'campaigns_created' | 'templates_created'>, amount: number = 1): boolean => {
  const currentUser = getCurrentUser();
  if (!currentUser) return false;
  
  const usage = getCurrentUsage();
  const userUsageKey = `${USAGE_STORAGE_KEY}_${currentUser.user.email}`;
  
  // Verificar límites antes de incrementar
  switch (type) {
    case 'emails_sent':
      if (usage.emails_sent + amount > usage.max_emails) return false;
      break;
    case 'contacts_imported':
      if (usage.contacts_imported + amount > usage.max_contacts) return false;
      break;
    case 'campaigns_created':
      if (usage.campaigns_created + amount > usage.max_campaigns) return false;
      break;
    case 'templates_created':
      if (usage.templates_created + amount > usage.max_templates) return false;
      break;
  }
  
  // Incrementar uso
  usage[type] += amount;
  localStorage.setItem(userUsageKey, JSON.stringify(usage));
  
  console.log(`Usage incremented: ${type} +${amount}. New total: ${usage[type]}/${getMaxForType(usage, type)}`);
  return true;
};

// 🔍 VERIFICAR SI PUEDE USAR FUNCIÓN
export const canUseFeature = (type: keyof Pick<UsageLimit, 'emails_sent' | 'contacts_imported' | 'campaigns_created' | 'templates_created'>, amount: number = 1): boolean => {
  const usage = getCurrentUsage();
  
  switch (type) {
    case 'emails_sent':
      return usage.emails_sent + amount <= usage.max_emails;
    case 'contacts_imported':
      return usage.contacts_imported + amount <= usage.max_contacts;
    case 'campaigns_created':
      return usage.campaigns_created + amount <= usage.max_campaigns;
    case 'templates_created':
      return usage.templates_created + amount <= usage.max_templates;
    default:
      return false;
  }
};

// 📊 OBTENER PORCENTAJE DE USO
export const getUsagePercentage = (type: keyof Pick<UsageLimit, 'emails_sent' | 'contacts_imported' | 'campaigns_created' | 'templates_created'>): number => {
  const usage = getCurrentUsage();
  const current = usage[type];
  const max = getMaxForType(usage, type);
  
  return Math.round((current / max) * 100);
};

// 🔢 OBTENER RESTANTE
export const getRemainingUsage = (type: keyof Pick<UsageLimit, 'emails_sent' | 'contacts_imported' | 'campaigns_created' | 'templates_created'>): number => {
  const usage = getCurrentUsage();
  const current = usage[type];
  const max = getMaxForType(usage, type);
  
  return Math.max(0, max - current);
};

function getMaxForType(usage: UsageLimit, type: keyof Pick<UsageLimit, 'emails_sent' | 'contacts_imported' | 'campaigns_created' | 'templates_created'>): number {
  switch (type) {
    case 'emails_sent': return usage.max_emails;
    case 'contacts_imported': return usage.max_contacts;
    case 'campaigns_created': return usage.max_campaigns;
    case 'templates_created': return usage.max_templates;
    default: return 0;
  }
}

// 📅 DÍAS HASTA RESET
export const getDaysUntilReset = (): number => {
  const usage = getCurrentUsage();
  const resetDate = new Date(usage.reset_date);
  const now = new Date();
  const diffTime = resetDate.getTime() - now.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return Math.max(0, diffDays);
};

// 🎯 OBTENER RESUMEN DE LÍMITES
export const getUsageSummary = () => {
  const usage = getCurrentUsage();
  return {
    emails: {
      used: usage.emails_sent,
      total: usage.max_emails,
      remaining: getRemainingUsage('emails_sent'),
      percentage: getUsagePercentage('emails_sent')
    },
    contacts: {
      used: usage.contacts_imported,
      total: usage.max_contacts,
      remaining: getRemainingUsage('contacts_imported'),
      percentage: getUsagePercentage('contacts_imported')
    },
    campaigns: {
      used: usage.campaigns_created,
      total: usage.max_campaigns,
      remaining: getRemainingUsage('campaigns_created'),
      percentage: getUsagePercentage('campaigns_created')
    },
    templates: {
      used: usage.templates_created,
      total: usage.max_templates,
      remaining: getRemainingUsage('templates_created'),
      percentage: getUsagePercentage('templates_created')
    },
    resetIn: getDaysUntilReset()
  };
};
