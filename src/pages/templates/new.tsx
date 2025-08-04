
import React, { useState } from 'react';
import { DashboardLayout } from '@/components/dashboard/layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, Save, Eye, Upload, Image } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { createTemplate, CreateTemplateData } from '@/lib/templates';

const NewTemplatePage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [templateData, setTemplateData] = useState<CreateTemplateData>({
    name: '',
    subject: '',
    category: '',
    content: ''
  });
  
  const [isPreview, setIsPreview] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Para demostración, simularemos una URL de imagen
      const imageUrl = URL.createObjectURL(file);
      const imageTag = `<img src="${imageUrl}" alt="Imagen subida" style="max-width: 100%; height: auto;" />`;
      
      setTemplateData(prev => ({
        ...prev,
        content: prev.content + '\n' + imageTag
      }));
      
      toast({
        title: "Imagen agregada",
        description: "La imagen se agregó al contenido de la plantilla"
      });
    }
  };

  const insertTemplate = (templateType: string) => {
    let templateContent = '';
    
    switch (templateType) {
      case 'newsletter':
        templateContent = `
<div style="max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif;">
  <h1 style="color: #333; text-align: center;">Newsletter Semanal</h1>
  <p>Hola {{FirstName}},</p>
  <p>Aquí tienes las novedades más importantes de esta semana:</p>
  
  <div style="background-color: #f8f9fa; padding: 20px; margin: 20px 0;">
    <h2 style="color: #007bff;">Noticia Destacada</h2>
    <p>Descripción de la noticia principal...</p>
  </div>
  
  <h3>Otras Noticias</h3>
  <ul>
    <li>Primera noticia secundaria</li>
    <li>Segunda noticia secundaria</li>
    <li>Tercera noticia secundaria</li>
  </ul>
  
  <p>¡Gracias por leernos!</p>
</div>`;
        break;
        
      case 'promocional':
        templateContent = `
<div style="max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif; text-align: center;">
  <h1 style="color: #e74c3c;">¡Oferta Especial!</h1>
  <p style="font-size: 18px;">Hola {{FirstName}},</p>
  <p>No te pierdas esta oportunidad única:</p>
  
  <div style="background-color: #fff3cd; border: 2px solid #ffc107; padding: 30px; margin: 20px 0;">
    <h2 style="color: #856404; margin: 0;">50% DE DESCUENTO</h2>
    <p style="font-size: 16px; margin: 10px 0;">En todos nuestros productos</p>
    <p style="color: #dc3545; font-weight: bold;">¡Solo por tiempo limitado!</p>
  </div>
  
  <a href="#" style="background-color: #28a745; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; display: inline-block; margin: 20px 0;">
    COMPRAR AHORA
  </a>
  
  <p style="font-size: 12px; color: #666;">Esta oferta vence el [FECHA]</p>
</div>`;
        break;
        
      case 'bienvenida':
        templateContent = `
<div style="max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif;">
  <h1 style="color: #007bff; text-align: center;">¡Bienvenido!</h1>
  <p>Hola {{FirstName}},</p>
  <p>¡Nos alegra tenerte con nosotros! Gracias por unirte a nuestra comunidad.</p>
  
  <div style="background-color: #e9ecef; padding: 20px; margin: 20px 0; border-radius: 5px;">
    <h3 style="margin-top: 0;">¿Qué puedes esperar?</h3>
    <ul>
      <li>Contenido exclusivo y de calidad</li>
      <li>Ofertas especiales para miembros</li>
      <li>Actualizaciones regulares</li>
      <li>Soporte personalizado</li>
    </ul>
  </div>
  
  <p>Si tienes alguna pregunta, no dudes en contactarnos.</p>
  <p>¡Esperamos verte pronto!</p>
  
  <hr style="margin: 30px 0; border: 1px solid #ddd;">
  <p style="font-size: 12px; color: #666; text-align: center;">
    Equipo de [NOMBRE DE LA EMPRESA]
  </p>
</div>`;
        break;
    }
    
    setTemplateData(prev => ({
      ...prev,
      content: templateContent
    }));
  };

  const handleSave = async () => {
    if (!templateData.name || !templateData.subject || !templateData.content) {
      toast({
        variant: "destructive",
        title: "Campos requeridos",
        description: "Por favor completa todos los campos obligatorios"
      });
      return;
    }

    setIsLoading(true);
    
    try {
      console.log('💾 Saving template:', templateData);
      
      const savedTemplate = await createTemplate({
        ...templateData,
        html_content: templateData.content
      });
      
      if (savedTemplate) {
        toast({
          title: "Plantilla guardada",
          description: "La plantilla se ha guardado correctamente"
        });
        
        navigate('/templates');
      } else {
        throw new Error('No se pudo guardar la plantilla');
      }
    } catch (error) {
      console.error('❌ Error saving template:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "No se pudo guardar la plantilla. Intenta nuevamente."
      });
    } finally {
      setIsLoading(false);
    }
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
              onClick={() => navigate('/templates')}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Volver
            </Button>
            <h1 className="text-2xl font-bold">Nueva Plantilla</h1>
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
              onClick={handleSave}
              disabled={isLoading}
            >
              <Save className="h-4 w-4 mr-2" />
              {isLoading ? 'Guardando...' : 'Guardar Plantilla'}
            </Button>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Form */}
          <Card>
            <CardHeader>
              <CardTitle>Información de la Plantilla</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="template-name">Nombre de la Plantilla *</Label>
                <Input
                  id="template-name"
                  value={templateData.name}
                  onChange={(e) => setTemplateData(prev => ({...prev, name: e.target.value}))}
                  placeholder="Ej: Newsletter Mensual"
                />
              </div>
              
              <div>
                <Label htmlFor="subject">Asunto del Email *</Label>
                <Input
                  id="subject"
                  value={templateData.subject}
                  onChange={(e) => setTemplateData(prev => ({...prev, subject: e.target.value}))}
                  placeholder="Ej: Tu resumen mensual está aquí"
                />
              </div>
              
              <div>
                <Label>Categoría</Label>
                <Select onValueChange={(value) => setTemplateData(prev => ({...prev, category: value}))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona una categoría" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="newsletter">Newsletter</SelectItem>
                    <SelectItem value="onboarding">Onboarding</SelectItem>
                    <SelectItem value="promociones">Promociones</SelectItem>
                    <SelectItem value="transaccional">Transaccional</SelectItem>
                    <SelectItem value="seguimiento">Seguimiento</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Plantillas predefinidas */}
              <div>
                <Label>Plantillas Predefinidas</Label>
                <div className="flex flex-wrap gap-2 mt-2">
                  <Button 
                    type="button"
                    variant="outline" 
                    size="sm"
                    onClick={() => insertTemplate('newsletter')}
                  >
                    Newsletter
                  </Button>
                  <Button 
                    type="button"
                    variant="outline" 
                    size="sm"
                    onClick={() => insertTemplate('promocional')}
                  >
                    Promocional
                  </Button>
                  <Button 
                    type="button"
                    variant="outline" 
                    size="sm"
                    onClick={() => insertTemplate('bienvenida')}
                  >
                    Bienvenida
                  </Button>
                </div>
              </div>

              {/* Subir imagen */}
              <div>
                <Label>Agregar Imagen</Label>
                <div className="mt-2">
                  <input
                    type="file"
                    id="image-upload"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                  <Button 
                    type="button"
                    variant="outline" 
                    onClick={() => document.getElementById('image-upload')?.click()}
                  >
                    <Image className="h-4 w-4 mr-2" />
                    Subir Imagen
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Preview */}
          {isPreview && (
            <Card>
              <CardHeader>
                <CardTitle>Vista Previa</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="border rounded-lg p-4 max-h-96 overflow-y-auto bg-white">
                  <div className="mb-4 border-b pb-2">
                    <h3 className="font-semibold text-lg">{templateData.subject || 'Asunto del email'}</h3>
                    <p className="text-sm text-gray-600">De: tu-email@empresa.com</p>
                  </div>
                  <div 
                    dangerouslySetInnerHTML={{ 
                      __html: templateData.content || '<p class="text-gray-500">El contenido aparecerá aquí...</p>' 
                    }} 
                  />
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Content Editor */}
        <Card>
          <CardHeader>
            <CardTitle>Contenido HTML *</CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea
              value={templateData.content}
              onChange={(e) => setTemplateData(prev => ({...prev, content: e.target.value}))}
              placeholder="Escribe tu contenido HTML aquí..."
              className="min-h-64 font-mono"
            />
            <p className="text-sm text-muted-foreground mt-2">
              Puedes usar variables como {'{'}FirstName{'}'} para personalizar el contenido.
            </p>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default NewTemplatePage;
