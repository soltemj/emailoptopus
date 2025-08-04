import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { 
  Mail, 
  Users, 
  Send, 
  CheckCircle, 
  AlertCircle, 
  Loader,
  ArrowRight,
  List
} from 'lucide-react';
import { getLists, createCampaign, sendCampaign, getCampaigns } from '@/lib/emailoctopus';
import type { EmailOctopusList, EmailOctopusCampaign } from '@/lib/emailoctopus';

export const CampaignSenderGuide: React.FC = () => {
  const [lists, setLists] = useState<EmailOctopusList[]>([]);
  const [campaigns, setCampaigns] = useState<EmailOctopusCampaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedList, setSelectedList] = useState<string>('');
  const [campaignName, setCampaignName] = useState('');
  const [subject, setSubject] = useState('');
  const [content, setContent] = useState('');
  const [sending, setSending] = useState(false);
  const [step, setStep] = useState<'select' | 'create' | 'send' | 'done'>('select');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [listsData, campaignsData] = await Promise.all([
        getLists(),
        getCampaigns()
      ]);
      setLists(listsData);
      setCampaigns(campaignsData);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCampaign = async () => {
    if (!selectedList || !campaignName || !subject || !content) {
      alert('Completa todos los campos');
      return;
    }

    try {
      setSending(true);
      
      // Crear campaña
      const campaign = await createCampaign(
        campaignName,
        subject,
        'ZY Solutions',
        'demo@zysolutions.com',
        [selectedList],
        content,
        content.replace(/<[^>]*>/g, '') // texto plano sin HTML
      );

      if (campaign) {
        setStep('send');
        await loadData(); // Recargar campañas
      }
    } catch (error) {
      console.error('Error creating campaign:', error);
      alert('Error al crear la campaña: ' + error);
    } finally {
      setSending(false);
    }
  };

  const handleSendCampaign = async (campaignId: string) => {
    try {
      setSending(true);
      const success = await sendCampaign(campaignId);
      
      if (success) {
        setStep('done');
        await loadData(); // Recargar para ver estado actualizado
      }
    } catch (error) {
      console.error('Error sending campaign:', error);
      alert('Error al enviar la campaña: ' + error);
    } finally {
      setSending(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <Loader className="h-6 w-6 animate-spin mr-2" />
          <span>Cargando datos...</span>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Información de listas */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <List className="h-5 w-5 mr-2" />
            Listas de Contactos Disponibles
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4">
            {lists.map((list) => (
              <div key={list.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <h3 className="font-medium">{list.name}</h3>
                  <p className="text-sm text-muted-foreground">
                    {list.counts.subscribed} contactos activos
                  </p>
                </div>
                <Badge variant="secondary">
                  {list.counts.subscribed} contactos
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Proceso de envío */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Send className="h-5 w-5 mr-2" />
            Proceso para Enviar Campañas
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Paso 1: Seleccionar lista */}
          <div className="flex items-start space-x-4">
            <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
              step === 'select' ? 'bg-primary text-primary-foreground' : 
              ['create', 'send', 'done'].includes(step) ? 'bg-green-500 text-white' : 'bg-muted'
            }`}>
              1
            </div>
            <div className="flex-1">
              <h3 className="font-medium">Seleccionar Lista de Contactos</h3>
              <p className="text-sm text-muted-foreground mb-3">
                Elige la lista de contactos que recibirá tu campaña
              </p>
              
              {step === 'select' && (
                <div className="space-y-3">
                  <select 
                    value={selectedList} 
                    onChange={(e) => setSelectedList(e.target.value)}
                    className="w-full p-2 border rounded-md"
                  >
                    <option value="">Selecciona una lista</option>
                    {lists.map((list) => (
                      <option key={list.id} value={list.id}>
                        {list.name} ({list.counts.subscribed} contactos)
                      </option>
                    ))}
                  </select>
                  
                  {selectedList && (
                    <Button onClick={() => setStep('create')}>
                      Continuar <ArrowRight className="h-4 w-4 ml-2" />
                    </Button>
                  )}
                </div>
              )}
              
              {selectedList && step !== 'select' && (
                <Badge variant="outline">
                  Lista seleccionada: {lists.find(l => l.id === selectedList)?.name}
                </Badge>
              )}
            </div>
          </div>

          {/* Paso 2: Crear campaña */}
          <div className="flex items-start space-x-4">
            <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
              step === 'create' ? 'bg-primary text-primary-foreground' : 
              ['send', 'done'].includes(step) ? 'bg-green-500 text-white' : 'bg-muted'
            }`}>
              2
            </div>
            <div className="flex-1">
              <h3 className="font-medium">Crear Campaña</h3>
              <p className="text-sm text-muted-foreground mb-3">
                Define el contenido de tu email marketing
              </p>
              
              {step === 'create' && (
                <div className="space-y-3">
                  <input
                    type="text"
                    placeholder="Nombre de la campaña"
                    value={campaignName}
                    onChange={(e) => setCampaignName(e.target.value)}
                    className="w-full p-2 border rounded-md"
                  />
                  
                  <input
                    type="text"
                    placeholder="Asunto del email"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    className="w-full p-2 border rounded-md"
                  />
                  
                  <textarea
                    placeholder="Contenido HTML del email"
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    rows={6}
                    className="w-full p-2 border rounded-md"
                  />
                  
                  <Button 
                    onClick={handleCreateCampaign}
                    disabled={sending || !campaignName || !subject || !content}
                  >
                    {sending ? (
                      <>
                        <Loader className="h-4 w-4 animate-spin mr-2" />
                        Creando...
                      </>
                    ) : (
                      <>
                        Crear Campaña <ArrowRight className="h-4 w-4 ml-2" />
                      </>
                    )}
                  </Button>
                </div>
              )}
            </div>
          </div>

          {/* Paso 3: Enviar campaña */}
          <div className="flex items-start space-x-4">
            <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
              step === 'send' ? 'bg-primary text-primary-foreground' : 
              step === 'done' ? 'bg-green-500 text-white' : 'bg-muted'
            }`}>
              3
            </div>
            <div className="flex-1">
              <h3 className="font-medium">Enviar Campaña</h3>
              <p className="text-sm text-muted-foreground mb-3">
                Revisa y envía tu campaña a los contactos
              </p>
              
              {step === 'send' && (
                <div className="space-y-3">
                  <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      ¿Estás seguro de que quieres enviar esta campaña? 
                      Una vez enviada no se puede cancelar.
                    </AlertDescription>
                  </Alert>
                  
                  {/* Mostrar campañas en borrador */}
                  {campaigns.filter(c => c.status === 'DRAFT').map((campaign) => (
                    <div key={campaign.id} className="p-3 border rounded-lg">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium">{campaign.name}</h4>
                          <p className="text-sm text-muted-foreground">{campaign.subject}</p>
                        </div>
                        <Button 
                          onClick={() => handleSendCampaign(campaign.id)}
                          disabled={sending}
                        >
                          {sending ? (
                            <>
                              <Loader className="h-4 w-4 animate-spin mr-2" />
                              Enviando...
                            </>
                          ) : (
                            <>
                              <Send className="h-4 w-4 mr-2" />
                              Enviar Ahora
                            </>
                          )}
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Paso 4: Completado */}
          {step === 'done' && (
            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-green-500 text-white flex items-center justify-center">
                <CheckCircle className="h-5 w-5" />
              </div>
              <div className="flex-1">
                <h3 className="font-medium text-green-700">¡Campaña Enviada!</h3>
                <p className="text-sm text-muted-foreground">
                  Tu campaña ha sido enviada exitosamente a todos los contactos.
                </p>
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setStep('select');
                    setCampaignName('');
                    setSubject('');
                    setContent('');
                    setSelectedList('');
                  }}
                  className="mt-3"
                >
                  Enviar Otra Campaña
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Campañas recientes */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Mail className="h-5 w-5 mr-2" />
            Campañas Recientes
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {campaigns.length === 0 ? (
              <p className="text-muted-foreground">No hay campañas creadas</p>
            ) : (
              campaigns.slice(0, 5).map((campaign) => (
                <div key={campaign.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <h4 className="font-medium">{campaign.name}</h4>
                    <p className="text-sm text-muted-foreground">{campaign.subject}</p>
                  </div>
                  <Badge variant={campaign.status === 'SENT' ? 'default' : 'secondary'}>
                    {campaign.status === 'SENT' ? 'Enviada' : 
                     campaign.status === 'DRAFT' ? 'Borrador' : campaign.status}
                  </Badge>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};