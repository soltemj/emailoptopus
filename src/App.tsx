
import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { LoginForm } from '@/components/auth/login-form';
import { isAuthenticated } from '@/lib/auth';
import { Toaster } from '@/components/ui/toaster';

// Pages
import Index from '@/pages/Index';
import CampaignsPage from '@/pages/campaigns/index';
import NewCampaign from '@/pages/campaigns/new';
import CampaignViewPage from '@/pages/campaigns/view';
import ContactsPage from '@/pages/contacts/index';
import ImportContactsPage from '@/pages/contacts/import';
import TemplatesPage from '@/pages/templates/index';
import NewTemplatePage from '@/pages/templates/new';
import ReportsPage from '@/pages/reports/index';

function App() {
  const [authenticated, setAuthenticated] = useState<boolean | null>(null);

  useEffect(() => {
    setAuthenticated(isAuthenticated());
  }, []);

  if (authenticated === null) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!authenticated) {
    return (
      <div className="min-h-screen bg-background">
        <LoginForm onLoginSuccess={() => window.location.reload()} />
        <Toaster />
      </div>
    );
  }

  return (
    <Router>
      <div className="min-h-screen bg-background">
        <Routes>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<Index />} />
          
          {/* Campaigns */}
          <Route path="/campaigns" element={<CampaignsPage />} />
          <Route path="/campaigns/new" element={<NewCampaign />} />
          <Route path="/campaigns/:campaignId" element={<CampaignViewPage />} />
          
          {/* Contacts */}
          <Route path="/contacts" element={<ContactsPage />} />
          <Route path="/contacts/import" element={<ImportContactsPage />} />
          
          {/* Templates */}
          <Route path="/templates" element={<TemplatesPage />} />
          <Route path="/templates/new" element={<NewTemplatePage />} />
          
          {/* Reports */}
          <Route path="/reports" element={<ReportsPage />} />
          
          {/* Redirect unknown routes to campaigns */}
          <Route path="*" element={<Navigate to="/campaigns" replace />} />
        </Routes>
        <Toaster />
      </div>
    </Router>
  );
}

export default App;
