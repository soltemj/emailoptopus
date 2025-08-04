import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/dashboard/layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { Plus, Search, Users, Upload, Download, Mail, Trash2, Edit } from 'lucide-react';
import { getLists, getContacts, deleteContact, createContact, EmailOctopusList, EmailOctopusContact } from '@/lib/emailoctopus';
import { getCurrentUser } from '@/lib/auth';
import { useNavigate } from 'react-router-dom';

const ContactsPage = () => {
  const [lists, setLists] = useState<EmailOctopusList[]>([]);
  const [selectedList, setSelectedList] = useState<string>('');
  const [contacts, setContacts] = useState<EmailOctopusContact[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showNewContactModal, setShowNewContactModal] = useState(false);
  const [newContactData, setNewContactData] = useState({
    email: '',
    firstName: '',
    lastName: ''
  });
  const [isCreatingContact, setIsCreatingContact] = useState(false);
  const [showEditContactModal, setShowEditContactModal] = useState(false);
  const [editingContact, setEditingContact] = useState<EmailOctopusContact | null>(null);
  const [editContactData, setEditContactData] = useState({
    email: '',
    firstName: '',
    lastName: ''
  });
  const [isUpdatingContact, setIsUpdatingContact] = useState(false);
  const navigate = useNavigate();
  const currentUser = getCurrentUser();
  const { toast } = useToast();

  useEffect(() => {
    loadLists();
  }, []);

  useEffect(() => {
    if (selectedList) {
      loadContacts(selectedList);
    }
  }, [selectedList]);

  const loadLists = async () => {
    try {
      setLoading(true);
      const allLists = await getLists();
      
      // Filtrar listas del usuario actual
      const userLists = allLists.filter(list => 
        list.name.includes(currentUser?.user.empresa || '')
      );
      
      setLists(userLists);
      if (userLists.length > 0) {
        setSelectedList(userLists[0].id);
      }
    } catch (error) {
      console.error('Error loading lists:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadContacts = async (listId: string) => {
    try {
      const listContacts = await getContacts(listId);
      setContacts(listContacts);
    } catch (error) {
      console.error('Error loading contacts:', error);
    }
  };

  const handleDeleteContact = async (contactId: string) => {
    if (!selectedList) return;
    
    try {
      const success = await deleteContact(selectedList, contactId);
      if (success) {
        setContacts(contacts.filter(c => c.id !== contactId));
        toast({
          title: "Contacto eliminado",
          description: "El contacto ha sido eliminado exitosamente"
        });
      }
    } catch (error) {
      console.error('Error deleting contact:', error);
      toast({
        title: "Error",
        description: "No se pudo eliminar el contacto",
        variant: "destructive"
      });
    }
  };

  const handleCreateContact = async () => {
    if (!selectedList || !newContactData.email || !newContactData.firstName) {
      toast({
        title: "Error",
        description: "Por favor ingresa email y nombre (ambos campos son obligatorios)",
        variant: "destructive"
      });
      return;
    }

    setIsCreatingContact(true);
    try {
      const newContact = await createContact(
        selectedList,
        newContactData.email,
        newContactData.firstName,
        newContactData.lastName
      );

      if (newContact) {
        // Recargar contactos para mostrar el nuevo
        await loadContacts(selectedList);
        setShowNewContactModal(false);
        setNewContactData({ email: '', firstName: '', lastName: '' });
        
        toast({
          title: "Contacto creado",
          description: "El contacto ha sido agregado exitosamente a la lista"
        });
      }
    } catch (error) {
      console.error('Error creating contact:', error);
      toast({
        title: "Error",
        description: "No se pudo crear el contacto",
        variant: "destructive"
      });
    } finally {
      setIsCreatingContact(false);
    }
  };

  const handleEditContact = (contact: EmailOctopusContact) => {
    setEditingContact(contact);
    setEditContactData({
      email: contact.email_address,
      firstName: contact.fields.FirstName || '',
      lastName: contact.fields.LastName || ''
    });
    setShowEditContactModal(true);
  };

  const handleUpdateContact = async () => {
    if (!selectedList || !editContactData.email || !editContactData.firstName || !editingContact) {
      toast({
        title: "Error",
        description: "Por favor ingresa email y nombre (ambos campos son obligatorios)",
        variant: "destructive"
      });
      return;
    }

    setIsUpdatingContact(true);
    try {
      // Eliminar el contacto anterior
      await deleteContact(selectedList, editingContact.id);
      
      // Crear nuevo contacto con datos actualizados
      const updatedContact = await createContact(
        selectedList,
        editContactData.email,
        editContactData.firstName,
        editContactData.lastName
      );

      if (updatedContact) {
        await loadContacts(selectedList);
        setShowEditContactModal(false);
        setEditingContact(null);
        setEditContactData({ email: '', firstName: '', lastName: '' });
        
        toast({
          title: "Contacto actualizado",
          description: "El contacto ha sido actualizado exitosamente"
        });
      }
    } catch (error) {
      console.error('Error updating contact:', error);
      toast({
        title: "Error",
        description: "No se pudo actualizar el contacto",
        variant: "destructive"
      });
    } finally {
      setIsUpdatingContact(false);
    }
  };

  const filteredContacts = contacts.filter(contact =>
    contact.email_address.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (contact.fields.FirstName && contact.fields.FirstName.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (contact.fields.LastName && contact.fields.LastName.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'SUBSCRIBED': return 'bg-success text-success-foreground';
      case 'PENDING': return 'bg-accent text-accent-foreground';
      case 'UNSUBSCRIBED': return 'bg-destructive text-destructive-foreground';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'SUBSCRIBED': return 'Suscrito';
      case 'PENDING': return 'Pendiente';
      case 'UNSUBSCRIBED': return 'Desuscrito';
      default: return status;
    }
  };

  const selectedListData = lists.find(list => list.id === selectedList);

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p>Cargando contactos...</p>
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
            <h1 className="text-3xl font-bold">Gestión de Contactos</h1>
            <p className="text-muted-foreground">
              Administra tus listas de contactos y suscriptores
            </p>
          </div>
          <div className="flex space-x-2">
            <Button variant="outline" onClick={() => navigate('/contacts/import')}>
              <Upload className="h-4 w-4 mr-2" />
              Importar
            </Button>
            <Button variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Exportar
            </Button>
            <Dialog open={showNewContactModal} onOpenChange={setShowNewContactModal}>
              <DialogTrigger asChild>
                <Button disabled={!selectedList}>
                  <Plus className="h-4 w-4 mr-2" />
                  Nuevo Contacto
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>Agregar Nuevo Contacto</DialogTitle>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="email">Email *</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="contacto@ejemplo.com"
                      value={newContactData.email}
                      onChange={(e) => setNewContactData(prev => ({ ...prev, email: e.target.value }))}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="firstName">Nombre *</Label>
                    <Input
                      id="firstName"
                      placeholder="Juan"
                      value={newContactData.firstName}
                      onChange={(e) => setNewContactData(prev => ({ ...prev, firstName: e.target.value }))}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="lastName">Apellido</Label>
                    <Input
                      id="lastName"
                      placeholder="Pérez"
                      value={newContactData.lastName}
                      onChange={(e) => setNewContactData(prev => ({ ...prev, lastName: e.target.value }))}
                    />
                  </div>
                  {selectedListData && (
                    <div className="text-sm text-muted-foreground">
                      Se agregará a la lista: <strong>{selectedListData.name}</strong>
                    </div>
                  )}
                </div>
                <div className="flex justify-end space-x-2">
                  <Button variant="outline" onClick={() => setShowNewContactModal(false)}>
                    Cancelar
                  </Button>
                  <Button onClick={handleCreateContact} disabled={isCreatingContact || !newContactData.email || !newContactData.firstName}>
                    {isCreatingContact ? 'Creando...' : 'Crear Contacto'}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>

            {/* Modal de Edición */}
            <Dialog open={showEditContactModal} onOpenChange={setShowEditContactModal}>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>Editar Contacto</DialogTitle>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="edit-email">Email *</Label>
                    <Input
                      id="edit-email"
                      type="email"
                      placeholder="contacto@ejemplo.com"
                      value={editContactData.email}
                      onChange={(e) => setEditContactData(prev => ({ ...prev, email: e.target.value }))}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="edit-firstName">Nombre *</Label>
                    <Input
                      id="edit-firstName"
                      placeholder="Juan"
                      value={editContactData.firstName}
                      onChange={(e) => setEditContactData(prev => ({ ...prev, firstName: e.target.value }))}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="edit-lastName">Apellido</Label>
                    <Input
                      id="edit-lastName"
                      placeholder="Pérez"
                      value={editContactData.lastName}
                      onChange={(e) => setEditContactData(prev => ({ ...prev, lastName: e.target.value }))}
                    />
                  </div>
                  {selectedListData && (
                    <div className="text-sm text-muted-foreground">
                      Lista: <strong>{selectedListData.name}</strong>
                    </div>
                  )}
                </div>
                <div className="flex justify-end space-x-2">
                  <Button variant="outline" onClick={() => setShowEditContactModal(false)}>
                    Cancelar
                  </Button>
                  <Button onClick={handleUpdateContact} disabled={isUpdatingContact || !editContactData.email || !editContactData.firstName}>
                    {isUpdatingContact ? 'Actualizando...' : 'Actualizar Contacto'}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Lists Overview */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {lists.map((list) => (
            <Card 
              key={list.id} 
              className={`cursor-pointer transition-all ${
                selectedList === list.id ? 'ring-2 ring-primary' : 'hover:shadow-lg'
              }`}
              onClick={() => setSelectedList(list.id)}
            >
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">{list.name}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-primary">
                  {list.counts.subscribed}
                </div>
                <p className="text-xs text-muted-foreground">
                  contactos suscritos
                </p>
                <div className="flex justify-between text-xs text-muted-foreground mt-2">
                  <span>Pendientes: {list.counts.pending}</span>
                  <span>Desuscritos: {list.counts.unsubscribed}</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Selected List Details */}
        {selectedListData && (
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle className="flex items-center">
                    <Users className="h-5 w-5 mr-2" />
                    {selectedListData.name}
                  </CardTitle>
                  <p className="text-muted-foreground">
                    Total de contactos: {selectedListData.counts.subscribed + selectedListData.counts.pending + selectedListData.counts.unsubscribed}
                  </p>
                </div>
                <div className="flex space-x-2">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                    <Input
                      placeholder="Buscar contactos..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 w-64"
                    />
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {filteredContacts.length === 0 ? (
                <div className="text-center py-12">
                  <Mail className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No hay contactos</h3>
                  <p className="text-muted-foreground">
                    {searchTerm ? 'No se encontraron contactos con esos criterios.' : 'Esta lista no tiene contactos aún.'}
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredContacts.map((contact) => (
                    <div key={contact.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50" data-contact-row>
                      <div className="flex items-center space-x-4">
                        <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                          <Mail className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <div className="font-medium" data-contact-name>
                            {contact.fields.FirstName || contact.fields.LastName 
                              ? `${contact.fields.FirstName || ''} ${contact.fields.LastName || ''}`.trim()
                              : 'Sin nombre'}
                          </div>
                          <div className="text-sm text-muted-foreground" data-contact-email>
                            {contact.email_address}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            Agregado: {new Date(contact.created_at).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge className={getStatusColor(contact.status)}>
                          {getStatusText(contact.status)}
                        </Badge>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => handleEditContact(contact)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => handleDeleteContact(contact.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {lists.length === 0 && (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Users className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No hay listas de contactos</h3>
              <p className="text-muted-foreground text-center mb-4">
                Comienza creando una lista para organizar tus contactos.
              </p>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Crear Primera Lista
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
};

export default ContactsPage;