import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/dashboard/layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Upload, Download, Users, AlertCircle, CheckCircle } from 'lucide-react';
import { getLists, importContacts, EmailOctopusList } from '@/lib/emailoctopus';
import { getCurrentUser } from '@/lib/auth';
import { useToast } from '@/hooks/use-toast';

const ImportContactsPage = () => {
  const [lists, setLists] = useState<EmailOctopusList[]>([]);
  const [selectedList, setSelectedList] = useState<string>('');
  const [file, setFile] = useState<File | null>(null);
  const [importing, setImporting] = useState(false);
  const [importResult, setImportResult] = useState<{ success: number; failed: number } | null>(null);
  const currentUser = getCurrentUser();
  const { toast } = useToast();

  useEffect(() => {
    loadLists();
  }, []);

  const loadLists = async () => {
    try {
      const allLists = await getLists();
      const userLists = allLists.filter(list => 
        list.name.includes(currentUser?.user.empresa || '')
      );
      setLists(userLists);
    } catch (error) {
      console.error('Error loading lists:', error);
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile) {
      if (selectedFile.type === 'text/csv' || selectedFile.name.endsWith('.csv')) {
        setFile(selectedFile);
      } else {
        toast({
          title: "Formato no válido",
          description: "Por favor selecciona un archivo CSV.",
          variant: "destructive"
        });
      }
    }
  };

  const parseCSV = (csvText: string): { email: string; firstName?: string; lastName?: string }[] => {
    const lines = csvText.split('\n');
    const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
    
    const emailIndex = headers.findIndex(h => h.includes('email') || h.includes('correo'));
    const firstNameIndex = headers.findIndex(h => h.includes('nombre') || h.includes('first') || h.includes('name'));
    const lastNameIndex = headers.findIndex(h => h.includes('apellido') || h.includes('last') || h.includes('surname'));
    
    if (emailIndex === -1) {
      throw new Error('No se encontró una columna de email en el CSV');
    }
    
    const contacts = [];
    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',').map(v => v.trim());
      if (values[emailIndex] && values[emailIndex].includes('@')) {
        contacts.push({
          email: values[emailIndex],
          firstName: firstNameIndex !== -1 ? values[firstNameIndex] : undefined,
          lastName: lastNameIndex !== -1 ? values[lastNameIndex] : undefined
        });
      }
    }
    
    return contacts;
  };

  const handleImport = async () => {
    if (!file || !selectedList) {
      toast({
        title: "Datos incompletos",
        description: "Selecciona una lista y un archivo CSV.",
        variant: "destructive"
      });
      return;
    }

    setImporting(true);
    setImportResult(null);

    try {
      const csvText = await file.text();
      const contacts = parseCSV(csvText);
      
      if (contacts.length === 0) {
        throw new Error('No se encontraron contactos válidos en el archivo');
      }

      const result = await importContacts(selectedList, contacts);
      setImportResult(result);
      
      toast({
        title: "Importación completada",
        description: `${result.success} contactos importados exitosamente. ${result.failed} fallos.`,
      });
      
    } catch (error) {
      console.error('Error importing contacts:', error);
      toast({
        title: "Error de importación",
        description: error instanceof Error ? error.message : "Error desconocido",
        variant: "destructive"
      });
    } finally {
      setImporting(false);
    }
  };

  const downloadTemplate = () => {
    const csvContent = "email,nombre,apellido\nexample@email.com,Juan,Pérez";
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.style.display = 'none';
    a.href = url;
    a.download = 'plantilla_contactos.csv';
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-4xl">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold">Importar Contactos</h1>
          <p className="text-muted-foreground">
            Sube un archivo CSV para agregar contactos a tus listas
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {/* Instructions */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <AlertCircle className="h-5 w-5 mr-2 text-primary" />
                Instrucciones
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <h4 className="font-medium">Formato del archivo CSV:</h4>
                <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
                  <li>El archivo debe tener una columna de email (requerida)</li>
                  <li>Opcionalmente incluye columnas de nombre y apellido</li>
                  <li>La primera fila debe contener los encabezados</li>
                  <li>Máximo 1,000 contactos por importación</li>
                </ul>
              </div>
              
              <div className="space-y-2">
                <h4 className="font-medium">Ejemplo de encabezados válidos:</h4>
                <div className="bg-muted p-3 rounded text-sm font-mono">
                  email,nombre,apellido<br/>
                  correo,first_name,last_name
                </div>
              </div>

              <Button variant="outline" onClick={downloadTemplate} className="w-full">
                <Download className="h-4 w-4 mr-2" />
                Descargar Plantilla CSV
              </Button>
            </CardContent>
          </Card>

          {/* Import Form */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Upload className="h-5 w-5 mr-2 text-primary" />
                Importar Archivo
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="list-select">Lista de destino</Label>
                <Select value={selectedList} onValueChange={setSelectedList}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona una lista" />
                  </SelectTrigger>
                  <SelectContent>
                    {lists.map((list) => (
                      <SelectItem key={list.id} value={list.id}>
                        {list.name} ({list.counts.subscribed} contactos)
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="file-upload">Archivo CSV</Label>
                <Input
                  id="file-upload"
                  type="file"
                  accept=".csv"
                  onChange={handleFileChange}
                  disabled={importing}
                />
                {file && (
                  <p className="text-sm text-muted-foreground">
                    Archivo seleccionado: {file.name}
                  </p>
                )}
              </div>

              <Button 
                onClick={handleImport} 
                disabled={!file || !selectedList || importing}
                className="w-full"
              >
                {importing ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Importando...
                  </>
                ) : (
                  <>
                    <Upload className="h-4 w-4 mr-2" />
                    Importar Contactos
                  </>
                )}
              </Button>

              {importResult && (
                <Card className="border-success">
                  <CardContent className="pt-4">
                    <div className="flex items-start space-x-2">
                      <CheckCircle className="h-5 w-5 text-success mt-0.5" />
                      <div>
                        <h4 className="font-medium text-success">Importación completada</h4>
                        <p className="text-sm text-muted-foreground">
                          {importResult.success} contactos importados exitosamente
                        </p>
                        {importResult.failed > 0 && (
                          <p className="text-sm text-destructive">
                            {importResult.failed} contactos fallaron (emails duplicados o inválidos)
                          </p>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Quick Stats */}
        {lists.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Users className="h-5 w-5 mr-2" />
                Resumen de Listas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-3">
                {lists.map((list) => (
                  <div key={list.id} className="bg-muted/50 p-4 rounded-lg">
                    <h4 className="font-medium">{list.name}</h4>
                    <div className="text-2xl font-bold text-primary">
                      {list.counts.subscribed}
                    </div>
                    <p className="text-sm text-muted-foreground">contactos activos</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
};

export default ImportContactsPage;