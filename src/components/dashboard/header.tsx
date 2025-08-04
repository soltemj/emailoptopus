import React from 'react';
import { Search, Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { getCurrentUser } from '@/lib/auth';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import zyLogo from '@/assets/zy-logo.png';

interface HeaderProps {
  userName?: string;
  userEmail?: string;
}

export const Header: React.FC<HeaderProps> = () => {
  const currentUser = getCurrentUser();
  const user = currentUser?.user;
  const userName = user ? `${user.nombre} ${user.apellido}` : "Usuario Demo";
  const userEmail = user?.email || "demo@cliente.com";

  return (
    <header className="bg-card border-b border-border sticky top-0 z-40 shadow-sm">
      <div className="flex items-center justify-between h-16 px-6">
        {/* Sidebar trigger y logo */}
        <div className="flex items-center space-x-4">
          <SidebarTrigger />
          <img src={zyLogo} alt="ZY Solutions" className="h-8 w-auto" />
          <div className="hidden md:block">
            <h1 className="text-xl font-bold gradient-primary bg-clip-text text-transparent">
              Email Marketing Dashboard
            </h1>
            <p className="text-sm text-muted-foreground">ZY Solutions</p>
          </div>
        </div>

        {/* Barra de búsqueda */}
        <div className="hidden md:flex items-center space-x-4 flex-1 max-w-md mx-8">
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Buscar campañas, contactos..."
              className="pl-10"
              onChange={(e) => {
                const searchTerm = e.target.value.toLowerCase();
                
                // Buscar en la página actual según la ruta
                const currentPath = window.location.pathname;
                
                if (currentPath.includes('/campaigns')) {
                  // Buscar en campañas
                  const campaignCards = document.querySelectorAll('[data-campaign-card]');
                  campaignCards.forEach(card => {
                    const campaignName = card.querySelector('[data-campaign-name]')?.textContent?.toLowerCase() || '';
                    const campaignSubject = card.querySelector('[data-campaign-subject]')?.textContent?.toLowerCase() || '';
                    const isVisible = !searchTerm || campaignName.includes(searchTerm) || campaignSubject.includes(searchTerm);
                    (card as HTMLElement).style.display = isVisible ? 'block' : 'none';
                  });
                } else if (currentPath.includes('/contacts')) {
                  // Buscar en contactos
                  const contactRows = document.querySelectorAll('[data-contact-row]');
                  contactRows.forEach(row => {
                    const contactEmail = row.querySelector('[data-contact-email]')?.textContent?.toLowerCase() || '';
                    const contactName = row.querySelector('[data-contact-name]')?.textContent?.toLowerCase() || '';
                    const isVisible = !searchTerm || contactEmail.includes(searchTerm) || contactName.includes(searchTerm);
                    (row as HTMLElement).style.display = isVisible ? 'table-row' : 'none';
                  });
                } else if (currentPath.includes('/reports')) {
                  // Buscar en reportes
                  const reportOptions = document.querySelectorAll('[data-report-option]');
                  reportOptions.forEach(option => {
                    const optionText = option.textContent?.toLowerCase() || '';
                    const isVisible = !searchTerm || optionText.includes(searchTerm);
                    (option as HTMLElement).style.display = isVisible ? 'block' : 'none';
                  });
                }
              }}
            />
          </div>
        </div>

        {/* Acciones del usuario */}
        <div className="flex items-center space-x-2">
          {/* Notificaciones */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="relative">
                <Bell className="h-4 w-4" />
                <span className="absolute -top-1 -right-1 bg-primary text-primary-foreground text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  3
                </span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-80" align="end">
              <DropdownMenuLabel>Notificaciones</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <div className="space-y-2 p-2">
                <div className="p-3 bg-muted/50 rounded-lg">
                  <p className="text-sm font-medium">Nueva campaña completada</p>
                  <p className="text-xs text-muted-foreground">Tu campaña "Newsletter Marzo" se envió exitosamente</p>
                </div>
                <div className="p-3 bg-muted/50 rounded-lg">
                  <p className="text-sm font-medium">Reporte disponible</p>
                  <p className="text-xs text-muted-foreground">El reporte de "Promoción Especial" está listo</p>
                </div>
                <div className="p-3 bg-muted/50 rounded-lg">
                  <p className="text-sm font-medium">Lista actualizada</p>
                  <p className="text-xs text-muted-foreground">Se agregaron 25 nuevos contactos a tu lista</p>
                </div>
              </div>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Menú de usuario */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                <Avatar className="h-8 w-8">
                  <AvatarImage src="/placeholder-avatar.jpg" alt={userName} />
                  <AvatarFallback className="bg-primary text-primary-foreground">
                    {userName.split(' ').map(n => n[0]).join('').toUpperCase()}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">{userName}</p>
                  <p className="text-xs leading-none text-muted-foreground">
                    {userEmail}
                  </p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <span>Perfil</span>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <span>Configuración</span>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <span>Soporte</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <span>Cerrar sesión</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
};