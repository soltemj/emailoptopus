import React, { useState } from 'react';
import { DashboardLayout } from '@/components/dashboard/layout';
import { StatsOverview } from '@/components/dashboard/stats-overview';
import { PerformanceCharts } from '@/components/dashboard/performance-charts';
import { RecentCampaigns } from '@/components/dashboard/recent-campaigns';
import { RecentActivity } from '@/components/dashboard/recent-activity';
import { UsageWidget } from '@/components/dashboard/usage-widget';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Index = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();
  
  console.log('🏠 Dashboard component mounted');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      // Navegar a campañas con el término de búsqueda
      navigate(`/campaigns?search=${encodeURIComponent(searchTerm.trim())}`);
    }
  };
  
  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Welcome Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
            <p className="text-muted-foreground">
              Bienvenido a tu panel de control de email marketing
            </p>
          </div>
          
          {/* Search Bar */}
          <form onSubmit={handleSearch} className="flex items-center space-x-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                type="text"
                placeholder="Buscar campañas..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 w-64"
              />
            </div>
          </form>
        </div>

        {/* Stats Overview */}
        <div>
          <h2 className="text-lg font-semibold mb-4">Estadísticas Generales</h2>
          <StatsOverview />
        </div>

        {/* Performance Charts */}
        <div>
          <h2 className="text-lg font-semibold mb-4">Rendimiento</h2>
          <PerformanceCharts />
        </div>

        <div className="grid gap-8 lg:grid-cols-3">
          {/* Recent Campaigns - Takes 2 columns */}
          <div className="lg:col-span-2">
            <RecentCampaigns />
          </div>
          
          {/* Sidebar with Usage and Activity */}
          <div className="space-y-8">
            <UsageWidget />
            <RecentActivity />
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Index;