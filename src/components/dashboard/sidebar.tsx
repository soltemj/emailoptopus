import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { 
  BarChart3, 
  Users, 
  Mail, 
  Send, 
  FileText, 
  Settings, 
  PlusCircle,
  Upload,
  Download,
  Eye,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { 
  Sidebar, 
  SidebarContent, 
  SidebarGroup, 
  SidebarGroupContent, 
  SidebarGroupLabel, 
  SidebarMenu, 
  SidebarMenuButton, 
  SidebarMenuItem,
  SidebarTrigger,
  useSidebar 
} from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';

const mainNavItems = [
  { title: 'Dashboard', url: '/', icon: BarChart3 },
  { title: 'Campañas', url: '/campaigns', icon: Send },
  { title: 'Contactos', url: '/contacts', icon: Users },
  { title: 'Plantillas', url: '/templates', icon: FileText },
  { title: 'Reportes', url: '/reports', icon: BarChart3 },
];

const actionItems = [
  { title: 'Nueva Campaña', url: '/campaigns/new', icon: PlusCircle },
  { title: 'Importar Contactos', url: '/contacts/import', icon: Upload },
  { title: 'Exportar Datos', url: '/export', icon: Download },
];

const configItems = [
  { title: 'Configuración', url: '/settings', icon: Settings },
];

export const AppSidebar = () => {
  const { state } = useSidebar();
  const location = useLocation();
  const currentPath = location.pathname;
  const isCollapsed = state === 'collapsed';

  const isActive = (path: string) => {
    if (path === '/') return currentPath === path;
    return currentPath.startsWith(path);
  };

  const getNavClasses = (isActiveRoute: boolean) =>
    isActiveRoute 
      ? "bg-primary text-primary-foreground font-medium shadow-sm" 
      : "hover:bg-muted/50 transition-smooth";

  return (
    <Sidebar className={isCollapsed ? "w-16" : "w-64"} collapsible="icon">
      <SidebarContent className="border-r border-border">
        {/* Navegación principal */}
        <SidebarGroup>
          <SidebarGroupLabel className={isCollapsed ? "sr-only" : ""}>
            Navegación Principal
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {mainNavItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink 
                      to={item.url} 
                      className={getNavClasses(isActive(item.url))}
                      title={isCollapsed ? item.title : undefined}
                    >
                      <item.icon className="h-5 w-5" />
                      {!isCollapsed && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Acciones rápidas */}
        <SidebarGroup>
          <SidebarGroupLabel className={isCollapsed ? "sr-only" : ""}>
            Acciones Rápidas
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {actionItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink 
                      to={item.url} 
                      className={getNavClasses(isActive(item.url))}
                      title={isCollapsed ? item.title : undefined}
                    >
                      <item.icon className="h-5 w-5" />
                      {!isCollapsed && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Configuración */}
        <SidebarGroup className="mt-auto">
          <SidebarGroupContent>
            <SidebarMenu>
              {configItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink 
                      to={item.url} 
                      className={getNavClasses(isActive(item.url))}
                      title={isCollapsed ? item.title : undefined}
                    >
                      <item.icon className="h-5 w-5" />
                      {!isCollapsed && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
};