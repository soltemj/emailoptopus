import { HomeIcon, Users, Mail, Send, FileText, BarChart3, Settings, Upload, Download } from "lucide-react";
import Index from "./pages/Index.tsx";
import NotFound from "./pages/NotFound.tsx";
import NewCampaign from "./pages/campaigns/new.tsx";
import CampaignsPage from "./pages/campaigns/index.tsx";
import ViewCampaign from "./pages/campaigns/view.tsx";

export const navItems = [
  {
    title: "Dashboard",
    to: "/dashboard",
    icon: HomeIcon,
    page: <Index />,
  },
  {
    title: "Campañas",
    to: "/campaigns",
    icon: Mail,
    page: <CampaignsPage />,
  },
  {
    title: "Nueva Campaña",
    to: "/campaigns/new",
    icon: Send,
    page: <NewCampaign />,
  },
  {
    title: "Ver Campaña",
    to: "/campaigns/:id",
    icon: Mail,
    page: <ViewCampaign />,
  },
  {
    title: "404",
    to: "*",
    icon: HomeIcon,
    page: <NotFound />,
  },
];