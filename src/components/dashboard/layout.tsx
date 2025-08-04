import React from 'react';
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { AppSidebar } from './sidebar';
import { Header } from './header';
import { MessengerBubble } from '@/components/ui/messenger-bubble';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <AppSidebar />
        
        <div className="flex-1 flex flex-col">
          <Header />
          
          <main className="flex-1 p-6">
            {children}
          </main>
        </div>
        
        <MessengerBubble />
      </div>
    </SidebarProvider>
  );
};