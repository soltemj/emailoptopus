
import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/dashboard/layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Plus, Search, FileText, Copy, Edit, Trash2, Eye } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { getTemplates, deleteTemplate, incrementTemplateUsage, createTemplate, EmailTemplate } from '@/lib/templates';
import { useToast } from '@/hooks/use-toast';

const TemplatesPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [templates, setTemplates] = useState<EmailTemplate[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTemplates();
  }, []);

  const loadTemplates = async () => {
    try {
      setLoading(true);
      const userTemplates = await getTemplates();
      console.log('📋 Plantillas locales cargadas:', userTemplates);
      setTemplates(userTemplates);
    } catch (error) {
      console.error('Error loading templates:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "No se pudieron cargar las plantillas"
      });
    } finally {
      setLoading(false);
    }
  };


  const handleDeleteTemplate = async (id: string, name: string) => {
    if (!confirm(`¿Estás seguro de que quieres eliminar la plantilla "${name}"?`)) {
      return;
    }

    const success = await deleteTemplate(id);
    if (success) {
      toast({
        title: "Plantilla eliminada",
        description: "La plantilla se eliminó correctamente"
      });
      loadTemplates(); // Recargar la lista
    } else {
      toast({
        variant: "destructive",
        title: "Error",
        description: "No se pudo eliminar la plantilla"
      });
    }
  };

  const handleUseTemplate = async (template: EmailTemplate) => {
    const success = await incrementTemplateUsage(template.id);
    if (success) {
      toast({
        title: "Plantilla seleccionada",
        description: "Redirigiendo a crear campaña con esta plantilla..."
      });
      // Navegar a crear campaña con la plantilla seleccionada
      navigate('/campaigns/new', { 
        state: { 
          templateData: {
            subject: template.subject,
            content: template.html_content || template.content
          }
        }
      });
    }
  };

  const handleViewTemplate = (template: EmailTemplate) => {
    // Crear una ventana modal o nueva ventana para vista previa
    const previewWindow = window.open('', '_blank', 'width=800,height=600');
    if (previewWindow) {
      previewWindow.document.write(`
        <html>
          <head>
            <title>Vista Previa: ${template.name}</title>
            <style>
              body { font-family: Arial, sans-serif; margin: 20px; }
              .header { border-bottom: 1px solid #ccc; margin-bottom: 20px; padding-bottom: 10px; }
              .content { max-width: 600px; }
            </style>
          </head>
          <body>
            <div class="header">
              <h1>${template.name}</h1>
              <p><strong>Asunto:</strong> ${template.subject}</p>
              <p><strong>Categoría:</strong> ${template.category}</p>
            </div>
            <div class="content">
              ${template.html_content || template.content}
            </div>
          </body>
        </html>
      `);
      previewWindow.document.close();
    }
  };

  const filteredTemplates = templates.filter(template =>
    template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    template.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
    template.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getCategoryColor = (category: string) => {
    switch (category.toLowerCase()) {
      case 'onboarding': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
      case 'newsletter': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case 'promociones': return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300';
      case 'transaccional': return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300';
      case 'seguimiento': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300';
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p>Cargando plantillas...</p>
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
            <h1 className="text-3xl font-bold">Plantillas de Email</h1>
            <p className="text-muted-foreground">
              Gestiona y reutiliza tus plantillas de email
            </p>
          </div>
          <Button onClick={() => navigate('/templates/new')}>
            <Plus className="h-4 w-4 mr-2" />
            Nueva Plantilla
          </Button>
        </div>

        {/* Search */}
        <Card>
          <CardContent className="pt-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Buscar plantillas..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </CardContent>
        </Card>

        {/* Mis Plantillas */}
        <div className="space-y-4">
          <h2 className="text-2xl font-semibold">Mis Plantillas</h2>
          {filteredTemplates.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <FileText className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">
                  {searchTerm ? 'No se encontraron plantillas' : 'No hay plantillas'}
                </h3>
                <p className="text-muted-foreground text-center mb-4">
                  {searchTerm 
                    ? 'No se encontraron plantillas con esos criterios de búsqueda.' 
                    : 'Crea tu primera plantilla para comenzar a reutilizar contenido.'
                  }
                </p>
                {!searchTerm && (
                  <Button onClick={() => navigate('/templates/new')}>
                    <Plus className="h-4 w-4 mr-2" />
                    Crear Primera Plantilla
                  </Button>
                )}
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {filteredTemplates.map((template) => (
                <Card key={template.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div className="space-y-1 flex-1">
                        <CardTitle className="text-lg">{template.name}</CardTitle>
                        <p className="text-sm text-muted-foreground">{template.subject}</p>
                      </div>
                      <Badge className={getCategoryColor(template.category)}>
                        {template.category}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="text-sm text-muted-foreground">
                        <p>Creado: {new Date(template.created_at).toLocaleDateString()}</p>
                        <p>Usado: {template.usage_count} veces</p>
                      </div>
                      
                      <div className="flex flex-wrap gap-2">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleViewTemplate(template)}
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          Ver
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => navigate(`/templates/edit/${template.id}`)}
                        >
                          <Edit className="h-4 w-4 mr-1" />
                          Editar
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleUseTemplate(template)}
                        >
                          <Copy className="h-4 w-4 mr-1" />
                          Usar
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleDeleteTemplate(template.id, template.name)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

      </div>
    </DashboardLayout>
  );
};

export default TemplatesPage;
