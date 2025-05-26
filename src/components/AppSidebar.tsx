
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
} from '@/components/ui/sidebar';
import { 
  BarChart3, 
  Briefcase, 
  Settings, 
  FileText, 
  Workflow,
  FolderOpen,
  Zap,
  Database,
  Upload,
  Tag,
  Image,
  Edit,
  Bot
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

const mainMenuItems = [
  {
    title: "Dashboard",
    url: "/dashboard",
    icon: BarChart3,
  },
  {
    title: "AI Models",
    url: "/models",
    icon: Bot,
  },
];

const projectMenuItems = [
  {
    title: "Projects",
    url: "/projects",
    icon: FolderOpen,
  },
];

const workflowMenuItems = [
  {
    title: "Workflows",
    url: "/workflows",
    icon: Workflow,
  },
  {
    title: "Jobs",
    url: "/jobs",
    icon: Briefcase,
  },
];

const systemMenuItems = [
  {
    title: "Settings",
    url: "/settings",
    icon: Settings,
  },
  {
    title: "API Documentation",
    url: "/api-docs",
    icon: FileText,
  },
];

export function AppSidebar() {
  const location = useLocation();
  const { user } = useAuth();

  const isActiveLink = (url: string) => {
    if (url === '/dashboard') {
      return location.pathname === '/dashboard';
    }
    return location.pathname.startsWith(url);
  };

  return (
    <Sidebar className="border-r">
      <SidebarHeader className="border-b px-6 py-4">
        <Link to="/dashboard" className="flex items-center space-x-2">
          <div className="w-8 h-8 gradient-primary rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-lg">S</span>
          </div>
          <span className="text-xl font-bold text-gradient">SbxAI</span>
        </Link>
      </SidebarHeader>

      <SidebarContent className="px-4 py-6">
        {/* Main Menu */}
        <SidebarGroup>
          <SidebarGroupLabel>Main</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {mainMenuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild isActive={isActiveLink(item.url)}>
                    <Link to={item.url}>
                      <item.icon className="w-4 h-4" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Projects */}
        <SidebarGroup>
          <SidebarGroupLabel>Projects</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {projectMenuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild isActive={isActiveLink(item.url)}>
                    <Link to={item.url}>
                      <item.icon className="w-4 h-4" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Workflows */}
        <SidebarGroup>
          <SidebarGroupLabel>Automation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {workflowMenuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild isActive={isActiveLink(item.url)}>
                    <Link to={item.url}>
                      <item.icon className="w-4 h-4" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* System */}
        <SidebarGroup>
          <SidebarGroupLabel>System</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {systemMenuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild isActive={isActiveLink(item.url)}>
                    <Link to={item.url}>
                      <item.icon className="w-4 h-4" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t px-6 py-4">
        <div className="flex items-center space-x-2 text-sm text-gray-600">
          <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
            {user?.name?.[0] || user?.email[0]}
          </div>
          <div className="flex-1 min-w-0">
            <p className="truncate font-medium">{user?.name}</p>
            <p className="truncate text-xs text-gray-500">{user?.email}</p>
          </div>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
