import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/dashboard/layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, Send, Eye, Upload, Link, Facebook, Instagram, Linkedin, Twitter } from 'lucide-react';
import { createCampaign, getLists, EmailOctopusList, sendCampaignNow } from '@/lib/emailoctopus';
import { getCurrentUser } from '@/lib/auth';
import { useNavigate, useLocation } from 'react-router-dom';
import { saveImageToStorage, validateImageFile, resizeImage } from '@/lib/image-storage';

const NewCampaign = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const currentUser = getCurrentUser();
  
  const [lists, setLists] = useState<EmailOctopusList[]>([]);
  const [campaignData, setCampaignData] = useState({
    name: '',
    subject: '',
    fromName: currentUser?.user.empresa || 'ZY Solutions',
    fromEmail: currentUser?.user.email || '',
    selectedLists: [] as string[],
    htmlContent: '',
    plainTextContent: '',
    isHtml: true,
    companyLogo: '',
    socialLinks: {
      facebook: '',
      instagram: '',
      linkedin: '',
      twitter: ''
    },
    customLink: {
      url: '',
      text: ''
    }
  });
  
  const [isLoading, setIsLoading] = useState(false);
  const [isPreview, setIsPreview] = useState(false);

  useEffect(() => {
    fetchLists();
    
    // Cargar datos de plantilla si se reciben desde navegación
    const templateData = location.state?.templateData;
    if (templateData) {
      console.log('📧 Cargando datos de plantilla:', templateData);
      setCampaignData(prev => ({
        ...prev,
        subject: templateData.subject || '',
        htmlContent: templateData.content || '',
      }));
      
      // Mostrar mensaje de confirmación
      toast({
        title: "Plantilla cargada",
        description: "Los datos de la plantilla se han cargado correctamente"
      });
    }
  }, [location.state, toast]);

  const fetchLists = async () => {
    try {
      const fetchedLists = await getLists();
      setLists(fetchedLists);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "No se pudieron cargar las listas de contactos"
      });
    }
  };

  const handleInputChange = (field: string, value: any) => {
    setCampaignData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSocialLinkChange = (platform: string, value: string) => {
    setCampaignData(prev => ({
      ...prev,
      socialLinks: {
        ...prev.socialLinks,
        [platform]: value
      }
    }));
  };

  const handleCustomLinkChange = (field: 'url' | 'text', value: string) => {
    setCampaignData(prev => ({
      ...prev,
      customLink: {
        ...prev.customLink,
        [field]: value
      }
    }));
  };

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate the file
    const validationError = validateImageFile(file);
    if (validationError) {
      toast({
        variant: "destructive",
        title: "Error de archivo",
        description: validationError
      });
      return;
    }

    try {
      // Resize and save the image
      const resizedImage = await resizeImage(file);
      const savedImageUrl = await saveImageToStorage(file);
      
      setCampaignData(prev => ({
        ...prev,
        companyLogo: resizedImage
      }));
      
      toast({
        title: "Imagen cargada",
        description: "La imagen se ha guardado correctamente"
      });
    } catch (error) {
      console.error('Error processing image:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "No se pudo procesar la imagen"
      });
    }
  };

  const generateEmailTemplate = () => {
    const { companyLogo, socialLinks, customLink, htmlContent } = campaignData;
    
    let template = `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${campaignData.subject}</title>
        <style>
            body { margin: 0; padding: 20px; font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; background: #ffffff; }
            .header { text-align: center; padding: 20px; background: #f8f9fa; }
            .logo { max-width: 200px; height: auto; }
            .content { padding: 30px; }
            .footer { background: #f8f9fa; padding: 20px; text-align: center; }
            .social-links { margin: 20px 0; }
            .social-links a { margin: 0 10px; text-decoration: none; }
            .custom-link { margin: 20px 0; }
            .custom-link a { background: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; }
        </style>
    </head>
    <body>
        <div class="container">
            ${companyLogo ? `
            <div class="header">
                <img src="${companyLogo}" alt="Company Logo" class="logo">
            </div>
            ` : ''}
            
            <div class="content">
                ${htmlContent}
                
                ${customLink.url && customLink.text ? `
                <div class="custom-link">
                    <a href="${customLink.url}" target="_blank">${customLink.text}</a>
                </div>
                ` : ''}
            </div>
            
            <div class="footer">
                ${Object.values(socialLinks).some(link => link) ? `
                <div class="social-links">
                    <p>Síguenos en:</p>
                    ${socialLinks.facebook ? `<a href="${socialLinks.facebook}" target="_blank">Facebook</a>` : ''}
                    ${socialLinks.instagram ? `<a href="${socialLinks.instagram}" target="_blank">Instagram</a>` : ''}
                    ${socialLinks.linkedin ? `<a href="${socialLinks.linkedin}" target="_blank">LinkedIn</a>` : ''}
                    ${socialLinks.twitter ? `<a href="${socialLinks.twitter}" target="_blank">Twitter</a>` : ''}
                </div>
                ` : ''}
                <p>Enviado por ${campaignData.fromName}</p>
                <p><small>Si no deseas recibir más correos, <a href="[UNSUBSCRIBE_URL]">haz clic aquí</a></small></p>
            </div>
        </div>
    </body>
    </html>`;
    
    return template;
  };


  const handleSaveAndSend = async () => {
    if (!campaignData.name || !campaignData.subject || !campaignData.htmlContent) {
      toast({
        variant: "destructive",
        title: "Campos requeridos",
        description: "Por favor completa nombre, asunto y contenido"
      });
      return;
    }

    if (!campaignData.selectedLists.length) {
      toast({
        variant: "destructive",
        title: "Lista requerida",
        description: "Por favor selecciona al menos una lista de contactos"
      });
      return;
    }

    setIsLoading(true);
    
    try {
      // Mostrar mensaje informativo sobre limitaciones de EmailOctopus API
      toast({
        variant: "destructive",
        title: "Limitación de EmailOctopus API",
        description: "EmailOctopus v1.6 no permite crear campañas vía API. Debes crear la campaña manualmente en el dashboard de EmailOctopus y luego enviarla desde la sección de campañas."
      });
      
      console.error('❌ EmailOctopus API v1.6 no soporta creación de campañas');
      
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Error al procesar la solicitud"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const renderPreview = () => {
    if (!isPreview) return null;
    
    return (
      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Eye className="h-5 w-5 mr-2" />
            Vista Previa
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div 
            className="border rounded-lg p-4 max-h-96 overflow-y-auto"
            dangerouslySetInnerHTML={{ __html: generateEmailTemplate() }}
          />
        </CardContent>
      </Card>
    );
  };

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
            <h1 className="text-2xl font-bold">Nueva Campaña</h1>
          </div>
          
          <div className="flex space-x-2">
            <Button
              variant="outline"
              onClick={() => setIsPreview(!isPreview)}
            >
              <Eye className="h-4 w-4 mr-2" />
              {isPreview ? 'Ocultar' : 'Vista Previa'}
            </Button>
            <Button
              onClick={handleSaveAndSend}
              disabled={isLoading || !campaignData.selectedLists.length}
            >
              <Send className="h-4 w-4 mr-2" />
              Enviar Campaña
            </Button>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Información Básica */}
          <Card>
            <CardHeader>
              <CardTitle>Información Básica</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="campaign-name">Nombre de la Campaña *</Label>
                <Input
                  id="campaign-name"
                  value={campaignData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  placeholder="Ej: Newsletter Marzo 2024"
                />
              </div>
              
              <div>
                <Label htmlFor="subject">Asunto del Email *</Label>
                <Input
                  id="subject"
                  value={campaignData.subject}
                  onChange={(e) => handleInputChange('subject', e.target.value)}
                  placeholder="Ej: ¡Nuevas ofertas especiales para ti!"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="from-name">Nombre del Remitente</Label>
                  <Input
                    id="from-name"
                    value={campaignData.fromName}
                    onChange={(e) => handleInputChange('fromName', e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="from-email">Email del Remitente</Label>
                  <Input
                    id="from-email"
                    type="email"
                    value={campaignData.fromEmail}
                    onChange={(e) => handleInputChange('fromEmail', e.target.value)}
                  />
                </div>
              </div>
              
              <div>
                <Label>Listas de Contactos</Label>
                <Select onValueChange={(value) => handleInputChange('selectedLists', [value])}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona una lista" />
                  </SelectTrigger>
                  <SelectContent>
                    {lists.map(list => (
                      <SelectItem key={list.id} value={list.id}>
                        {list.name} ({list.counts.subscribed} contactos)
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Personalización de Marca */}
          <Card>
            <CardHeader>
              <CardTitle>Personalización de Marca</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="company-logo">URL del Logo de la Empresa</Label>
                <div className="flex space-x-2">
                  <Input
                    id="company-logo"
                    value={campaignData.companyLogo}
                    onChange={(e) => handleInputChange('companyLogo', e.target.value)}
                    placeholder="https://tu-sitio.com/logo.png"
                  />
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                    id="logo-upload"
                  />
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => document.getElementById('logo-upload')?.click()}
                  >
                    <Upload className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              
              <div>
                <Label>Enlaces de Redes Sociales</Label>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Facebook className="h-4 w-4 text-blue-600" />
                    <Input
                      placeholder="https://facebook.com/tu-empresa"
                      value={campaignData.socialLinks.facebook}
                      onChange={(e) => handleSocialLinkChange('facebook', e.target.value)}
                    />
                  </div>
                  <div className="flex items-center space-x-2">
                    <Instagram className="h-4 w-4 text-pink-600" />
                    <Input
                      placeholder="https://instagram.com/tu-empresa"
                      value={campaignData.socialLinks.instagram}
                      onChange={(e) => handleSocialLinkChange('instagram', e.target.value)}
                    />
                  </div>
                  <div className="flex items-center space-x-2">
                    <Linkedin className="h-4 w-4 text-blue-700" />
                    <Input
                      placeholder="https://linkedin.com/company/tu-empresa"
                      value={campaignData.socialLinks.linkedin}
                      onChange={(e) => handleSocialLinkChange('linkedin', e.target.value)}
                    />
                  </div>
                  <div className="flex items-center space-x-2">
                    <Twitter className="h-4 w-4 text-blue-400" />
                    <Input
                      placeholder="https://twitter.com/tu-empresa"
                      value={campaignData.socialLinks.twitter}
                      onChange={(e) => handleSocialLinkChange('twitter', e.target.value)}
                    />
                  </div>
                </div>
              </div>
              
              <div>
                <Label>Enlace Personalizado</Label>
                <div className="space-y-2">
                  <Input
                    placeholder="Texto del botón"
                    value={campaignData.customLink.text}
                    onChange={(e) => handleCustomLinkChange('text', e.target.value)}
                  />
                  <Input
                    placeholder="URL del enlace"
                    value={campaignData.customLink.url}
                    onChange={(e) => handleCustomLinkChange('url', e.target.value)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Contenido del Email */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              Contenido del Email
              <div className="flex items-center space-x-2">
                <Label htmlFor="html-toggle" className="text-sm">HTML</Label>
                <Switch
                  id="html-toggle"
                  checked={campaignData.isHtml}
                  onCheckedChange={(checked) => handleInputChange('isHtml', checked)}
                />
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="html-content">
                {campaignData.isHtml ? 'Contenido HTML *' : 'Contenido de Texto *'}
              </Label>
              <Textarea
                id="html-content"
                value={campaignData.htmlContent}
                onChange={(e) => handleInputChange('htmlContent', e.target.value)}
                placeholder={campaignData.isHtml ? 
                  "Escribe tu contenido HTML aquí..." : 
                  "Escribe tu contenido de texto aquí..."
                }
                className="min-h-64"
              />
            </div>
            
            {campaignData.isHtml && (
              <div>
                <Label htmlFor="plain-text">Versión de Texto Plano (opcional)</Label>
                <Textarea
                  id="plain-text"
                  value={campaignData.plainTextContent}
                  onChange={(e) => handleInputChange('plainTextContent', e.target.value)}
                  placeholder="Versión de texto plano del email..."
                  className="min-h-32"
                />
              </div>
            )}
          </CardContent>
        </Card>

        {renderPreview()}
      </div>
    </DashboardLayout>
  );
};

export default NewCampaign;