import React, { useState, useEffect } from 'react';
import { Eye, Mail, MousePointer, UserMinus, BarChart3 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { getCampaigns, getCampaignReport, EmailOctopusCampaign, CampaignReport } from '@/lib/emailoctopus';
import { useNavigate } from 'react-router-dom';

interface CampaignWithReport extends EmailOctopusCampaign {
  report?: CampaignReport;
}

export const RecentCampaigns: React.FC = () => {
  const [campaigns, setCampaigns] = useState<CampaignWithReport[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    loadCampaigns();
  }, []);

  const loadCampaigns = async () => {
    try {
      setLoading(true);
      console.log('📊 Loading recent campaigns for dashboard...');
      
      const allCampaigns = await getCampaigns();
      console.log('📋 Campaigns received:', allCampaigns);
      
      // Filtrar y ordenar campañas (las más recientes primero)
      const sortedCampaigns = allCampaigns
        .filter(campaign => campaign.name || campaign.subject) // Filtrar campañas válidas
        .sort((a, b) => {
          // Ordenar por fecha de envío o creación
          const dateA = new Date(a.sent_at || a.created_at);
          const dateB = new Date(b.sent_at || b.created_at);
          return dateB.getTime() - dateA.getTime();
        })
        .slice(0, 3); // Solo las 3 más recientes

      // Cargar reportes para campañas enviadas
      const campaignsWithReports = await Promise.all(
        sortedCampaigns.map(async (campaign) => {
          let report = undefined;
          if (campaign.status === 'SENT') {
            try {
              report = await getCampaignReport(campaign.id);
            } catch (error) {
              console.error(`Error loading report for campaign ${campaign.id}:`, error);
            }
          }
          return { ...campaign, report };
        })
      );

      setCampaigns(campaignsWithReports);
      console.log('✅ Recent campaigns loaded:', campaignsWithReports);
      
    } catch (error) {
      console.error('❌ Error loading recent campaigns:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'SENT':
        return <Badge variant="secondary" className="bg-success text-success-foreground">Enviada</Badge>;
      case 'DRAFT':
        return <Badge variant="outline">Borrador</Badge>;
      case 'SENDING':
        return <Badge variant="secondary" className="bg-primary text-primary-foreground">Enviando</Badge>;
      case 'SCHEDULED':
        return <Badge variant="secondary" className="bg-warning text-warning-foreground">Programada</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const handleViewCampaign = (campaignId: string) => {
    navigate(`/campaigns/${campaignId}`);
  };

  const handleViewReports = (campaignId: string) => {
    navigate(`/reports?campaign=${campaignId}`);
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Campañas Recientes</span>
            <Button variant="outline" size="sm" onClick={() => navigate('/campaigns')}>
              <BarChart3 className="h-4 w-4 mr-2" />
              Ver Todas
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(3)].map((_, index) => (
              <div key={index} className="border border-border rounded-lg p-4 animate-pulse">
                <div className="flex items-start justify-between mb-3">
                  <div className="space-y-2 flex-1">
                    <div className="h-4 bg-muted rounded w-3/4"></div>
                    <div className="h-3 bg-muted rounded w-1/2"></div>
                  </div>
                  <div className="h-6 bg-muted rounded w-16"></div>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-3">
                  {[...Array(4)].map((_, i) => (
                    <div key={i} className="text-center space-y-1">
                      <div className="h-5 bg-muted rounded mx-auto w-12"></div>
                      <div className="h-3 bg-muted rounded w-full"></div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (campaigns.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Campañas Recientes</span>
            <Button variant="outline" size="sm" onClick={() => navigate('/campaigns')}>
              <BarChart3 className="h-4 w-4 mr-2" />
              Ver Todas
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <Mail className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No hay campañas</h3>
            <p className="text-muted-foreground mb-4">Crea tu primera campaña para verla aquí.</p>
            <Button onClick={() => navigate('/campaigns/new')}>
              Crear Campaña
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Campañas Recientes</span>
          <Button variant="outline" size="sm" onClick={() => navigate('/campaigns')}>
            <BarChart3 className="h-4 w-4 mr-2" />
            Ver Todas
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {campaigns.map((campaign) => (
            <div key={campaign.id} className="border border-border rounded-lg p-4 transition-smooth hover:shadow-sm">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h4 className="font-medium text-foreground">
                    {campaign.name || `Campaña sin nombre (${campaign.status})`}
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    {campaign.status === 'SENT' && campaign.sent_at 
                      ? `Enviada: ${new Date(campaign.sent_at).toLocaleDateString('es-ES')}`
                      : `Creada: ${new Date(campaign.created_at).toLocaleDateString('es-ES')}`
                    }
                  </p>
                </div>
                {getStatusBadge(campaign.status)}
              </div>
              
              {campaign.report ? (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-3">
                  <div className="text-center">
                    <div className="flex items-center justify-center text-primary mb-1">
                      <Mail className="h-4 w-4 mr-1" />
                      <span className="font-semibold">{campaign.report.sent.toLocaleString()}</span>
                    </div>
                    <p className="text-xs text-muted-foreground">Enviados</p>
                  </div>
                  
                  <div className="text-center">
                    <div className="flex items-center justify-center text-success mb-1">
                      <Eye className="h-4 w-4 mr-1" />
                      <span className="font-semibold">
                        {campaign.report.sent > 0 ? ((campaign.report.opened.unique / campaign.report.sent) * 100).toFixed(1) : 0}%
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground">Abiertos</p>
                  </div>
                  
                  <div className="text-center">
                    <div className="flex items-center justify-center text-accent mb-1">
                      <MousePointer className="h-4 w-4 mr-1" />
                      <span className="font-semibold">
                        {campaign.report.sent > 0 ? ((campaign.report.clicked.unique / campaign.report.sent) * 100).toFixed(1) : 0}%
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground">Clics</p>
                  </div>
                  
                  <div className="text-center">
                    <div className="flex items-center justify-center text-destructive mb-1">
                      <UserMinus className="h-4 w-4 mr-1" />
                      <span className="font-semibold">
                        {campaign.report.sent > 0 ? ((campaign.report.unsubscribed / campaign.report.sent) * 100).toFixed(1) : 0}%
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground">Desuscritos</p>
                  </div>
                </div>
              ) : (
                <div className="text-center py-4 text-muted-foreground text-sm">
                  {campaign.status === 'DRAFT' ? 'Campaña en borrador' : 'Sin datos de reporte disponibles'}
                </div>
              )}
              
              <div className="flex justify-end space-x-2">
                {campaign.status === 'SENT' && (
                  <Button variant="outline" size="sm" onClick={() => handleViewReports(campaign.id)}>
                    Ver Reporte
                  </Button>
                )}
                <Button variant="outline" size="sm" onClick={() => handleViewCampaign(campaign.id)}>
                  Ver Campaña
                </Button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};