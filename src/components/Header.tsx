
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { AuthDialog } from '@/components/AuthDialog';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { User, LogOut, Settings, BarChart3, FileText, Workflow, Briefcase } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

export const Header = () => {
  const [authOpen, setAuthOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const handleAuthClick = (mode: 'login' | 'register') => {
    setAuthMode(mode);
    setAuthOpen(true);
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-200">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 gradient-primary rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">S</span>
            </div>
            <span className="text-xl font-bold text-gradient">SbxAI</span>
          </Link>

          <nav className="hidden md:flex items-center space-x-8">
            <Link to="/" className="text-gray-600 hover:text-gray-900 transition-colors">
              Home
            </Link>
            <Link to="/models" className="text-gray-600 hover:text-gray-900 transition-colors">
              AI Models
            </Link>
            <Link to="/api-docs" className="text-gray-600 hover:text-gray-900 transition-colors">
              API Docs
            </Link>
            {isAuthenticated && (
              <>
                <Link to="/dashboard" className="text-gray-600 hover:text-gray-900 transition-colors">
                  Dashboard
                </Link>
                <Link to="/workflows" className="text-gray-600 hover:text-gray-900 transition-colors">
                  Workflows
                </Link>
                <Link to="/jobs" className="text-gray-600 hover:text-gray-900 transition-colors">
                  Jobs
                </Link>
              </>
            )}
          </nav>

          <div className="flex items-center space-x-4">
            {isAuthenticated ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={user?.avatar} alt={user?.name || user?.email} />
                      <AvatarFallback className="gradient-primary text-white">
                        {user?.name?.[0] || user?.email[0]}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56 bg-white" align="end" forceMount>
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">{user?.name}</p>
                      <p className="text-xs leading-none text-muted-foreground">
                        {user?.email}
                      </p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => navigate('/dashboard')}>
                    <BarChart3 className="mr-2 h-4 w-4" />
                    Dashboard
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate('/workflows')}>
                    <Workflow className="mr-2 h-4 w-4" />
                    Workflows
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate('/jobs')}>
                    <Briefcase className="mr-2 h-4 w-4" />
                    Jobs
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate('/api-docs')}>
                    <FileText className="mr-2 h-4 w-4" />
                    API Documentation
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate('/settings')}>
                    <Settings className="mr-2 h-4 w-4" />
                    Settings
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout}>
                    <LogOut className="mr-2 h-4 w-4" />
                    Log out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div className="flex items-center space-x-2">
                <Button 
                  variant="ghost" 
                  onClick={() => handleAuthClick('login')}
                  className="hover:bg-gray-100"
                >
                  Login
                </Button>
                <Button 
                  onClick={() => handleAuthClick('register')}
                  className="gradient-primary text-white hover:opacity-90"
                >
                  Get Started
                </Button>
              </div>
            )}
          </div>
        </div>
      </header>

      <AuthDialog 
        open={authOpen} 
        onOpenChange={setAuthOpen} 
        mode={authMode}
        onModeChange={setAuthMode}
      />
    </>
  );
};
