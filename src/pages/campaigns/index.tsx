import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { DashboardLayout } from '@/components/dashboard/layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Plus, Search, Mail, Calendar, Users, TrendingUp, Eye, Send } from 'lucide-react';
import { getCampaigns, EmailOctopusCampaign, getCampaignReport, canSendCampaign } from '@/lib/emailoctopus';
import { getCurrentUser } from '@/lib/auth';
import { useNavigate } from 'react-router-dom';

const CampaignsPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [campaigns, setCampaigns] = useState<EmailOctopusCampaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState(searchParams.get('search') || '');
  const [campaignValidation, setCampaignValidation] = useState<Record<string, { canSend: boolean; reason?: string }>>({});
  const navigate = useNavigate();
  const currentUser = getCurrentUser();

  useEffect(() => {
    loadCampaigns();
  }, []);

  // Actualizar término de búsqueda cuando cambie el parámetro URL
  useEffect(() => {
    const urlSearch = searchParams.get('search') || '';
    setSearchTerm(urlSearch);
  }, [searchParams]);

  const loadCampaigns = async () => {
    try {
      setLoading(true);
      console.log('🔄 Loading campaigns for user:', currentUser?.user.empresa);
      const allCampaigns = await getCampaigns();
      
      console.log('📊 Total campaigns found:', allCampaigns.length);
      console.log('📋 Campaign names:', allCampaigns.map(c => c.name));
      
      // Corregir campañas con nombres null o vacíos
      const processedCampaigns = allCampaigns.map(campaign => ({
        ...campaign,
        name: campaign.name || `Campaña sin nombre (${campaign.status})`,
        subject: campaign.subject || 'Sin asunto'
      }));
      
      console.log('✅ Processed campaigns:', processedCampaigns.map(c => ({ 
        id: c.id, 
        name: c.name, 
        status: c.status,
        subject: c.subject,
        created_at: c.created_at,
        to: c.to
      })));
      
      setCampaigns(processedCampaigns);
      
      // Validate DRAFT campaigns
      const validations: Record<string, { canSend: boolean; reason?: string }> = {};
      for (const campaign of processedCampaigns) {
        if (campaign.status === 'DRAFT') {
          try {
            validations[campaign.id] = await canSendCampaign(campaign.id);
          } catch (error) {
            validations[campaign.id] = { canSend: false, reason: "Error de validación" };
          }
        }
      }
      setCampaignValidation(validations);
      
    } catch (error) {
      console.error('❌ Error loading campaigns:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleViewCampaign = (campaignId: string) => {
    // Navegar a la vista detallada de la campaña
    navigate(`/campaigns/${campaignId}`);
  };

  const handleViewReports = (campaignId: string) => {
    navigate(`/reports?campaign=${campaignId}`);
  };

  const filteredCampaigns = campaigns.filter(campaign =>
    (campaign.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (campaign.subject || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'SENT': return 'bg-success text-success-foreground';
      case 'SENDING': return 'bg-accent text-accent-foreground';
      case 'DRAFT': return 'bg-muted text-muted-foreground';
      case 'SCHEDULED': return 'bg-primary text-primary-foreground';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'SENT': return 'Enviada';
      case 'SENDING': return 'Enviando';
      case 'DRAFT': return 'Borrador';
      case 'SCHEDULED': return 'Programada';
      default: return status;
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p>Cargando campañas...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Campañas de Email</h1>
            <p className="text-muted-foreground">
              Gestiona y analiza tus campañas de email marketing
            </p>
          </div>
          <Button onClick={() => navigate('/campaigns/new')} className="flex items-center">
            <Plus className="h-4 w-4 mr-2" />
            Nueva Campaña
          </Button>
        </div>

        {/* Search and filters */}
        <div className="flex items-center space-x-4">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Buscar campañas..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Campaigns Grid */}
        {filteredCampaigns.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Mail className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No hay campañas</h3>
              <p className="text-muted-foreground text-center mb-4">
                {searchTerm ? 'No se encontraron campañas con esos criterios.' : 'Comienza creando tu primera campaña de email marketing.'}
              </p>
              <Button onClick={() => navigate('/campaigns/new')}>
                <Plus className="h-4 w-4 mr-2" />
                Crear Primera Campaña
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredCampaigns.map((campaign) => (
              <Card key={campaign.id} className="hover:shadow-lg transition-shadow" data-campaign-card>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <CardTitle className="text-lg" data-campaign-name>{campaign.name}</CardTitle>
                      <p className="text-sm text-muted-foreground truncate" data-campaign-subject>
                        {campaign.subject}
                      </p>
                    </div>
                    <Badge className={getStatusColor(campaign.status)}>
                      {getStatusText(campaign.status)}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 mr-1 text-muted-foreground" />
                      <span>{new Date(campaign.created_at).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center">
                      <Users className="h-4 w-4 mr-1 text-muted-foreground" />
                      <span>{campaign.to.length} listas</span>
                    </div>
                  </div>

                  {campaign.status === 'SENT' && campaign.sent_at && (
                    <div className="text-sm text-muted-foreground">
                      Enviada: {new Date(campaign.sent_at).toLocaleDateString()}
                    </div>
                  )}

                  <div className="flex space-x-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="flex-1"
                      onClick={() => handleViewCampaign(campaign.id)}
                    >
                      <Eye className="h-4 w-4 mr-1" />
                      Ver
                    </Button>
                    
                    {campaign.status === 'DRAFT' && (
                      <>
                        {campaignValidation[campaign.id]?.canSend ? (
                          <Button 
                            variant="default" 
                            size="sm" 
                            className="flex-1"
                            onClick={() => handleViewCampaign(campaign.id)}
                          >
                            <Send className="h-4 w-4 mr-1" />
                            Enviar
                          </Button>
                        ) : (
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="flex-1 text-destructive border-destructive"
                            onClick={() => handleViewCampaign(campaign.id)}
                            title={campaignValidation[campaign.id]?.reason || "No se puede enviar"}
                          >
                            <Send className="h-4 w-4 mr-1" />
                            No disponible
                          </Button>
                        )}
                      </>
                    )}
                    
                    {campaign.status === 'SENT' && (
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="flex-1"
                        onClick={() => handleViewReports(campaign.id)}
                      >
                        <TrendingUp className="h-4 w-4 mr-1" />
                        Reportes
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default CampaignsPage;