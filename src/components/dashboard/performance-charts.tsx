
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CircularProgress } from '@/components/charts/circular-progress';
import { getCampaigns, getCampaignReport } from '@/lib/emailoctopus';
import { getCurrentUser } from '@/lib/auth';

export const PerformanceCharts: React.FC = () => {
  const [performanceData, setPerformanceData] = useState([
    {
      title: 'Emails Enviados',
      percentage: 0,
      value: '0',
      color: 'hsl(var(--primary))'
    },
    {
      title: 'Abiertos',
      percentage: 0,
      value: '0',
      color: 'hsl(var(--success))'
    },
    {
      title: 'Clics',
      percentage: 0,
      value: '0',
      color: 'hsl(var(--accent))'
    },
    {
      title: 'Desuscritos',
      percentage: 0,
      value: '0',
      color: 'hsl(var(--destructive))'
    },
    {
      title: 'Rebotados',
      percentage: 0,
      value: '0',
      color: 'hsl(var(--warning))'
    }
  ]);
  
  const [loading, setLoading] = useState(true);
  const currentUser = getCurrentUser();

  useEffect(() => {
    loadPerformanceData();
  }, []);

  const loadPerformanceData = async () => {
    try {
      setLoading(true);
      
      const campaigns = await getCampaigns();
      console.log('📊 Campañas obtenidas para performance charts:', campaigns);
      const userCampaigns = campaigns.filter(campaign => 
        campaign.status === 'SENT'
      );

      let totalSent = 0;
      let totalOpened = 0;
      let totalClicked = 0;
      let totalUnsubscribed = 0;
      let totalBounced = 0;
      
      for (const campaign of userCampaigns) {
        try {
          const report = await getCampaignReport(campaign.id);
          if (report) {
            totalSent += report.sent;
            totalOpened += report.opened.unique;
            totalClicked += report.clicked.unique;
            totalUnsubscribed += report.unsubscribed;
            totalBounced += (report.bounced.hard + report.bounced.soft);
          }
        } catch (error) {
          console.error(`Error loading report for campaign ${campaign.id}:`, error);
        }
      }

      const newPerformanceData = [
        {
          title: 'Emails Enviados',
          percentage: 100,
          value: totalSent.toLocaleString(),
          color: 'hsl(var(--primary))'
        },
        {
          title: 'Abiertos',
          percentage: totalSent > 0 ? Math.round((totalOpened / totalSent) * 100) : 0,
          value: totalOpened.toLocaleString(),
          color: 'hsl(var(--success))'
        },
        {
          title: 'Clics',
          percentage: totalSent > 0 ? Math.round((totalClicked / totalSent) * 100) : 0,
          value: totalClicked.toLocaleString(),
          color: 'hsl(var(--accent))'
        },
        {
          title: 'Desuscritos',
          percentage: totalSent > 0 ? Math.round((totalUnsubscribed / totalSent) * 100) : 0,
          value: totalUnsubscribed.toLocaleString(),
          color: 'hsl(var(--destructive))'
        },
        {
          title: 'Rebotados',
          percentage: totalSent > 0 ? Math.round((totalBounced / totalSent) * 100) : 0,
          value: totalBounced.toLocaleString(),
          color: '#f97316'
        }
      ];

      setPerformanceData(newPerformanceData);
    } catch (error) {
      console.error('Error loading performance data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Rendimiento General</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
            {[...Array(5)].map((_, index) => (
              <div key={index} className="animate-pulse">
                <div className="w-24 h-24 bg-muted rounded-full mx-auto mb-2"></div>
                <div className="h-4 bg-muted rounded mb-1"></div>
                <div className="h-3 bg-muted rounded w-3/4 mx-auto"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Rendimiento General</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
          {performanceData.map((item, index) => (
            <CircularProgress
              key={index}
              title={item.title}
              percentage={item.percentage}
              value={item.value}
              color={item.color}
            />
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
