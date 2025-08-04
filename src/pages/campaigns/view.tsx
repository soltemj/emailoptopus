import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { DashboardLayout } from '@/components/dashboard/layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, Send, Eye, Calendar, Users, Mail, AlertTriangle } from 'lucide-react';
import { getCampaigns, EmailOctopusCampaign, canSendCampaign, sendCampaignNow, getLists } from '@/lib/emailoctopus';

const ViewCampaign = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [campaign, setCampaign] = useState<EmailOctopusCampaign | null>(null);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [canSend, setCanSend] = useState(false);
  const [sendReason, setSendReason] = useState<string | undefined>();
  const [lists, setLists] = useState<any[]>([]);

  useEffect(() => {
    if (id) {
      loadCampaign();
      loadLists();
    }
  }, [id]);

  const loadCampaign = async () => {
    try {
      setLoading(true);
      const campaigns = await getCampaigns();
      const foundCampaign = campaigns.find(c => c.id === id);
      
      if (foundCampaign) {
        setCampaign(foundCampaign);
        
        // Verificar si se puede enviar
        if (foundCampaign.status === 'DRAFT') {
          const validation = await canSendCampaign(id!);
          setCanSend(validation.canSend);
          setSendReason(validation.reason);
        }
      } else {
        toast({
          variant: "destructive",
          title: "Error",
          description: "No se encontró la campaña"
        });
        navigate('/campaigns');
      }
    } catch (error) {
      console.error('Error loading campaign:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Error al cargar la campaña"
      });
    } finally {
      setLoading(false);
    }
  };

  const loadLists = async () => {
    try {
      const fetchedLists = await getLists();
      setLists(fetchedLists);
    } catch (error) {
      console.error('Error loading lists:', error);
    }
  };

  const handleSendCampaign = async () => {
    if (!campaign || !id) return;

    try {
      setSending(true);
      const success = await sendCampaignNow(id);
      
      if (success) {
        toast({
          title: "¡Campaña enviada!",
          description: "La campaña se ha enviado exitosamente"
        });
        // Recargar la campaña para ver el nuevo estado
        await loadCampaign();
      } else {
        throw new Error('Error al enviar la campaña');
      }
    } catch (error) {
      console.error('Error sending campaign:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "No se pudo enviar la campaña"
      });
    } finally {
      setSending(false);
    }
  };

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

  const getCampaignLists = () => {
    if (!campaign || !lists.length) return [];
    return lists.filter(list => campaign.to.includes(list.id));
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p>Cargando campaña...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (!campaign) {
    return (
      <DashboardLayout>
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold mb-4">Campaña no encontrada</h2>
          <Button onClick={() => navigate('/campaigns')}>
            Volver a Campañas
          </Button>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate('/campaigns')}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Volver
            </Button>
            <div>
              <h1 className="text-2xl font-bold">{campaign.name}</h1>
              <div className="flex items-center space-x-2 mt-1">
                <Badge className={getStatusColor(campaign.status)}>
                  {getStatusText(campaign.status)}
                </Badge>
                <span className="text-muted-foreground text-sm">
                  Creada el {new Date(campaign.created_at).toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>
          
          {campaign.status === 'DRAFT' && (
            <div className="flex space-x-2">
              {canSend ? (
                <Button
                  onClick={handleSendCampaign}
                  disabled={sending}
                  className="flex items-center"
                >
                  <Send className="h-4 w-4 mr-2" />
                  {sending ? 'Enviando...' : 'Enviar Campaña'}
                </Button>
              ) : (
                <div className="text-right">
                  <Button
                    variant="outline"
                    disabled
                    className="flex items-center text-destructive border-destructive"
                  >
                    <AlertTriangle className="h-4 w-4 mr-2" />
                    No se puede enviar
                  </Button>
                  {sendReason && (
                    <p className="text-sm text-destructive mt-1">{sendReason}</p>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Información de la Campaña */}
          <div className="lg:col-span-1 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Mail className="h-5 w-5 mr-2" />
                  Detalles de la Campaña
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Asunto</label>
                  <p className="font-medium">{campaign.subject}</p>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Remitente</label>
                  <p className="font-medium">{campaign.from.name}</p>
                  <p className="text-sm text-muted-foreground">{campaign.from.email_address}</p>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Fecha de creación</label>
                  <div className="flex items-center">
                    <Calendar className="h-4 w-4 mr-1 text-muted-foreground" />
                    <span>{new Date(campaign.created_at).toLocaleDateString()}</span>
                  </div>
                </div>

                {campaign.sent_at && (
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Fecha de envío</label>
                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 mr-1 text-muted-foreground" />
                      <span>{new Date(campaign.sent_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Users className="h-5 w-5 mr-2" />
                  Listas de Destinatarios
                </CardTitle>
              </CardHeader>
              <CardContent>
                {getCampaignLists().length > 0 ? (
                  <div className="space-y-2">
                    {getCampaignLists().map(list => (
                      <div key={list.id} className="flex items-center justify-between p-2 bg-muted/50 rounded">
                        <span className="font-medium">{list.name}</span>
                        <span className="text-sm text-muted-foreground">
                          {list.counts.subscribed} contactos
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground">No se encontraron listas</p>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Vista Previa del Contenido */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Eye className="h-5 w-5 mr-2" />
                  Vista Previa del Email
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="border rounded-lg">
                  {/* Header del email simulado */}
                  <div className="border-b bg-muted/50 p-4">
                    <div className="text-sm text-muted-foreground">
                      <strong>De:</strong> {campaign.from.name} &lt;{campaign.from.email_address}&gt;
                    </div>
                    <div className="text-sm text-muted-foreground">
                      <strong>Asunto:</strong> {campaign.subject}
                    </div>
                  </div>
                  
                  {/* Contenido del email */}
                  <div className="p-4 max-h-96 overflow-y-auto">
                    {campaign.content?.html ? (
                      <div 
                        dangerouslySetInnerHTML={{ __html: campaign.content.html }}
                        className="prose max-w-none"
                      />
                    ) : campaign.content?.plain_text ? (
                      <pre className="whitespace-pre-wrap font-sans">
                        {campaign.content.plain_text}
                      </pre>
                    ) : (
                      <p className="text-muted-foreground italic">
                        No hay contenido disponible para mostrar
                      </p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default ViewCampaign;