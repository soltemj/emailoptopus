
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, Mail, Users, Zap, RefreshCw } from 'lucide-react';
import { getRealUsageData, type RealUsageData } from '@/lib/usage-tracking';

export const UsageWidget: React.FC = () => {
  const [usage, setUsage] = useState<RealUsageData | null>(null);
  const [loading, setLoading] = useState(true);
  const [lastRefresh, setLastRefresh] = useState<string>('');

  const loadUsageData = async () => {
    try {
      setLoading(true);
      const data = await getRealUsageData();
      setUsage(data);
      setLastRefresh(new Date().toLocaleTimeString());
    } catch (error) {
      console.error('Error loading usage data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsageData();
  }, []);
  
  const getProgressColor = (percentage: number) => {
    if (percentage >= 90) return 'bg-destructive';
    if (percentage >= 75) return 'bg-warning';
    return 'bg-primary';
  };

  const getStatusBadge = (percentage: number) => {
    if (percentage >= 90) return <Badge variant="destructive">Límite Alto</Badge>;
    if (percentage >= 75) return <Badge className="bg-warning text-warning-foreground">Precaución</Badge>;
    return <Badge variant="secondary">Normal</Badge>;
  };

  if (loading || !usage) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <TrendingUp className="h-5 w-5 mr-2" />
            Límites de Uso
          </CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center py-8">
          <RefreshCw className="h-6 w-6 animate-spin mr-2" />
          <span>Cargando datos reales...</span>
        </CardContent>
      </Card>
    );
  }

  const emailsPercentage = (usage.emails.sent / usage.emails.limit) * 100;
  const contactsPercentage = (usage.contacts.total / usage.contacts.limit) * 100;
  const campaignsPercentage = (usage.campaigns.created / usage.campaigns.limit) * 100;
  const maxPercentage = Math.max(emailsPercentage, contactsPercentage, campaignsPercentage);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center">
            <TrendingUp className="h-5 w-5 mr-2" />
            Límites de Uso
            {getStatusBadge(maxPercentage)}
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">
              Actualizado: {lastRefresh}
            </span>
            <button 
              onClick={loadUsageData}
              disabled={loading}
              className="p-1 hover:bg-muted rounded"
            >
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Emails */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Mail className="h-4 w-4 mr-2 text-primary" />
              <span className="text-sm font-medium">Emails Enviados</span>
            </div>
            <span className="text-sm text-muted-foreground">
              {usage.emails.sent.toLocaleString()} / {usage.emails.limit.toLocaleString()}
            </span>
          </div>
          <Progress 
            value={emailsPercentage} 
            className={`h-2 ${getProgressColor(emailsPercentage)}`}
          />
          <p className="text-xs text-muted-foreground">
            {usage.emails.remaining.toLocaleString()} restantes
          </p>
        </div>

        {/* Contactos */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Users className="h-4 w-4 mr-2 text-success" />
              <span className="text-sm font-medium">Contactos</span>
            </div>
            <span className="text-sm text-muted-foreground">
              {usage.contacts.total.toLocaleString()} / {usage.contacts.limit.toLocaleString()}
            </span>
          </div>
          <Progress 
            value={contactsPercentage} 
            className={`h-2 ${getProgressColor(contactsPercentage)}`}
          />
          <p className="text-xs text-muted-foreground">
            {usage.contacts.remaining.toLocaleString()} restantes
          </p>
        </div>

        {/* Campañas */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Zap className="h-4 w-4 mr-2 text-accent" />
              <span className="text-sm font-medium">Campañas</span>
            </div>
            <span className="text-sm text-muted-foreground">
              {usage.campaigns.created} / {usage.campaigns.limit}
            </span>
          </div>
          <Progress 
            value={campaignsPercentage} 
            className={`h-2 ${getProgressColor(campaignsPercentage)}`}
          />
          <p className="text-xs text-muted-foreground">
            {usage.campaigns.remaining} restantes
          </p>
        </div>

        {/* Update Info */}
        <div className="pt-4 border-t">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Datos obtenidos de EmailOctopus</span>
            <Badge variant="outline">En tiempo real</Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
