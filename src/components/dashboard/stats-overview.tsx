
import React, { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, Mail, Users, Eye, MousePointer } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { getCampaigns, getCampaignReport, getLists } from '@/lib/emailoctopus';
import { getCurrentUser } from '@/lib/auth';

interface StatCardProps {
  title: string;
  value: string;
  change: string;
  changeType: 'positive' | 'negative' | 'neutral';
  icon: React.ReactNode;
  loading?: boolean;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, change, changeType, icon, loading }) => {
  const getChangeColor = () => {
    switch (changeType) {
      case 'positive': return 'text-success';
      case 'negative': return 'text-destructive';
      default: return 'text-muted-foreground';
    }
  };

  const getChangeIcon = () => {
    switch (changeType) {
      case 'positive': return <TrendingUp className="h-3 w-3" />;
      case 'negative': return <TrendingDown className="h-3 w-3" />;
      default: return null;
    }
  };

  if (loading) {
    return (
      <Card className="transition-smooth hover:shadow-md">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            {title}
          </CardTitle>
          <div className="h-4 w-4 text-muted-foreground">
            {icon}
          </div>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse">
            <div className="h-8 bg-muted rounded mb-2"></div>
            <div className="h-4 bg-muted rounded w-3/4"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="transition-smooth hover:shadow-md">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        <div className="h-4 w-4 text-muted-foreground">
          {icon}
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <div className={`flex items-center text-xs ${getChangeColor()}`}>
          {getChangeIcon()}
          <span className="ml-1">{change}</span>
        </div>
      </CardContent>
    </Card>
  );
};

export const StatsOverview: React.FC = () => {
  const [stats, setStats] = useState({
    totalSent: 0,
    totalOpened: 0,
    totalClicked: 0,
    totalContacts: 0,
    openRate: 0,
    clickRate: 0
  });
  const [loading, setLoading] = useState(true);
  const [userCampaigns, setUserCampaigns] = useState<any[]>([]);
  const [userLists, setUserLists] = useState<any[]>([]);
  const currentUser = getCurrentUser();

  useEffect(() => {
    loadRealStats();
  }, []);

  const loadRealStats = async () => {
    try {
      setLoading(true);
      
      // Obtener campañas del usuario
      const campaigns = await getCampaigns();
      console.log('📊 Campañas obtenidas para dashboard:', campaigns);
      const filteredCampaigns = campaigns.filter(campaign => 
        campaign.status === 'SENT'
      );
      setUserCampaigns(filteredCampaigns);

      // Obtener listas y contactos
      const lists = await getLists();
      console.log('📋 Listas obtenidas para dashboard:', lists);
      const filteredLists = lists;
      setUserLists(filteredLists);

      let totalSent = 0;
      let totalOpened = 0;
      let totalClicked = 0;
      
      // Obtener reportes de cada campaña
      for (const campaign of filteredCampaigns) {
        try {
          const report = await getCampaignReport(campaign.id);
          if (report) {
            totalSent += report.sent;
            totalOpened += report.opened.unique;
            totalClicked += report.clicked.unique;
          }
        } catch (error) {
          console.error(`Error loading report for campaign ${campaign.id}:`, error);
        }
      }

      const totalContacts = filteredLists.reduce((sum, list) => sum + (list.counts?.subscribed || 0), 0);
      const openRate = totalSent > 0 ? (totalOpened / totalSent) * 100 : 0;
      const clickRate = totalSent > 0 ? (totalClicked / totalSent) * 100 : 0;

      setStats({
        totalSent,
        totalOpened,
        totalClicked,
        totalContacts,
        openRate,
        clickRate
      });
      
    } catch (error) {
      console.error('Error loading real stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const statsData: StatCardProps[] = [
    {
      title: "Emails Enviados",
      value: stats.totalSent.toLocaleString(),
      change: `${userCampaigns.length || 0} campañas`,
      changeType: 'neutral' as const,
      icon: <Mail className="h-4 w-4" />
    },
    {
      title: "Tasa de Apertura",
      value: `${stats.openRate.toFixed(1)}%`,
      change: `${stats.totalOpened.toLocaleString()} aperturas`,
      changeType: (stats.openRate >= 20 ? 'positive' : 'negative') as 'positive' | 'negative',
      icon: <Eye className="h-4 w-4" />
    },
    {
      title: "Tasa de Clics",
      value: `${stats.clickRate.toFixed(1)}%`,
      change: `${stats.totalClicked.toLocaleString()} clics`,
      changeType: (stats.clickRate >= 3 ? 'positive' : 'negative') as 'positive' | 'negative',
      icon: <MousePointer className="h-4 w-4" />
    },
    {
      title: "Total Contactos",
      value: stats.totalContacts.toLocaleString(),
      change: `${userLists.length || 0} listas`,
      changeType: 'neutral' as const,
      icon: <Users className="h-4 w-4" />
    }
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {statsData.map((stat, index) => (
        <StatCard key={index} {...stat} loading={loading} />
      ))}
    </div>
  );
};
