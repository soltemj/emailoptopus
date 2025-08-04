import React, { useState, useEffect } from 'react';
import { Eye, MousePointer, Mail, UserPlus } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { getCampaigns, getCampaignReport } from '@/lib/emailoctopus';

interface Activity {
  id: string;
  type: 'opened' | 'clicked' | 'subscribed' | 'sent';
  action: string;
  timestamp: string;
  campaign?: string;
  metric?: number;
}

export const RecentActivity: React.FC = () => {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadRecentActivity();
  }, []);

  const loadRecentActivity = async () => {
    try {
      setLoading(true);
      console.log('📈 Loading recent activity...');
      
      const campaigns = await getCampaigns();
      const sentCampaigns = campaigns.filter(c => c.status === 'SENT').slice(0, 3);
      
      const newActivities: Activity[] = [];
      
      for (const campaign of sentCampaigns) {
        try {
          const report = await getCampaignReport(campaign.id);
          if (report) {
            // Crear actividades basadas en los reportes reales
            if (report.sent > 0) {
              newActivities.push({
                id: `sent-${campaign.id}`,
                type: 'sent',
                action: `Campaña enviada a ${report.sent.toLocaleString()} contactos`,
                campaign: campaign.name || 'Campaña sin nombre',
                timestamp: campaign.sent_at || campaign.created_at,
                metric: report.sent
              });
            }
            
            if (report.opened.unique > 0) {
              newActivities.push({
                id: `opened-${campaign.id}`,
                type: 'opened',
                action: `${report.opened.unique.toLocaleString()} aperturas únicas`,
                campaign: campaign.name || 'Campaña sin nombre',
                timestamp: new Date(new Date(campaign.sent_at || campaign.created_at).getTime() + 30 * 60000).toISOString(), // 30 min después
                metric: report.opened.unique
              });
            }
            
            if (report.clicked.unique > 0) {
              newActivities.push({
                id: `clicked-${campaign.id}`,
                type: 'clicked',
                action: `${report.clicked.unique.toLocaleString()} clics en enlaces`,
                campaign: campaign.name || 'Campaña sin nombre',
                timestamp: new Date(new Date(campaign.sent_at || campaign.created_at).getTime() + 60 * 60000).toISOString(), // 1 hora después
                metric: report.clicked.unique
              });
            }
          }
        } catch (error) {
          console.error(`Error loading report for campaign ${campaign.id}:`, error);
        }
      }
      
      // Ordenar por fecha más reciente
      newActivities.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
      
      setActivities(newActivities.slice(0, 5)); // Solo las 5 más recientes
      console.log('✅ Recent activity loaded:', newActivities);
      
    } catch (error) {
      console.error('❌ Error loading recent activity:', error);
      // Fallback a actividades de ejemplo si hay error
      setActivities([
        {
          id: '1',
          type: 'sent',
          action: 'Sistema iniciado correctamente',
          timestamp: new Date().toISOString()
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'opened':
        return <Eye className="h-4 w-4 text-success" />;
      case 'clicked':
        return <MousePointer className="h-4 w-4 text-accent" />;
      case 'sent':
        return <Mail className="h-4 w-4 text-primary" />;
      case 'subscribed':
        return <UserPlus className="h-4 w-4 text-success" />;
      default:
        return <Mail className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('es-ES', { 
      hour: '2-digit', 
      minute: '2-digit'
    });
  };

  const formatDate = (timestamp: string) => {
    const date = new Date(timestamp);
    const today = new Date();
    const isToday = date.toDateString() === today.toDateString();
    
    if (isToday) {
      return 'Hoy';
    }
    
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const isYesterday = date.toDateString() === yesterday.toDateString();
    
    if (isYesterday) {
      return 'Ayer';
    }
    
    return date.toLocaleDateString('es-ES', { 
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Actividad Reciente</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(5)].map((_, index) => (
              <div key={index} className="flex items-start space-x-3 animate-pulse">
                <div className="flex-shrink-0 mt-1">
                  <div className="h-4 w-4 bg-muted rounded"></div>
                </div>
                <div className="flex-1 min-w-0 space-y-2">
                  <div className="h-4 bg-muted rounded w-3/4"></div>
                  <div className="h-3 bg-muted rounded w-1/2"></div>
                </div>
                <div className="flex-shrink-0 text-right space-y-1">
                  <div className="h-3 bg-muted rounded w-12"></div>
                  <div className="h-3 bg-muted rounded w-10"></div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (activities.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Actividad Reciente</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <Mail className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">No hay actividad reciente</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Actividad Reciente</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {activities.map((activity) => (
            <div key={activity.id} className="flex items-start space-x-3">
              <div className="flex-shrink-0 mt-1">
                {getActivityIcon(activity.type)}
              </div>
              
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground">
                  {activity.action}
                </p>
                {activity.campaign && (
                  <p className="text-sm text-muted-foreground">
                    {activity.campaign}
                  </p>
                )}
              </div>
              
              <div className="flex-shrink-0 text-right">
                <p className="text-xs text-muted-foreground">
                  {formatDate(activity.timestamp)}
                </p>
                <p className="text-xs text-muted-foreground">
                  {formatTime(activity.timestamp)}
                </p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};