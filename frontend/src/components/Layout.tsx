import { Outlet, Link, useLocation } from 'react-router-dom';
import { FileText, Clock, Settings, LogOut, ChevronDown, User, Moon, Sun, Menu, X } from 'lucide-react';
import { useSyncStatus } from '../hooks/useSyncStatus';
import { useTheme } from '../contexts/ThemeContext';
import { Button } from './ui/Button';
import { Badge } from './ui/Badge';
import { authService, User as UserType } from '../services/auth';
import ProjectSelector from './ProjectSelector';
import { useState, useEffect, useRef } from 'react';

export default function Layout() {
  const location = useLocation();
  const { pendingCount } = useSyncStatus();
  const { theme, toggleTheme } = useTheme();
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [user, setUser] = useState<UserType | null>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const mobileMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const loadUser = async () => {
      try {
        const userData = await authService.getMe();
        setUser(userData);
      } catch (error) {
        console.error('Erro ao carregar usuário:', error);
        const cachedUser = authService.getUser();
        if (cachedUser) {
          setUser(cachedUser);
        }
      }
    };
    loadUser();
  }, []);

  // Close menus on ESC key press
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsUserMenuOpen(false);
        setIsMobileMenuOpen(false);
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, []);

  // Close menus when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setIsUserMenuOpen(false);
      }
      if (mobileMenuRef.current && !mobileMenuRef.current.contains(event.target as Node)) {
        setIsMobileMenuOpen(false);
      }
    };

    if (isUserMenuOpen || isMobileMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isUserMenuOpen, isMobileMenuOpen]);

  const handleLogout = () => {
    authService.logout();
    window.location.href = '/login';
  };

  const getRoleLabel = (role: string) => {
    const labels: Record<string, string> = {
      SUPERADMIN: 'Super Administrador',
      ADMIN: 'Administrador',
      ENGENHEIRO: 'Engenheiro',
      LABORATORISTA: 'Laboratorista'
    };
    return labels[role] || role;
  };

  const getRoleBadgeVariant = (role: string): 'danger' | 'primary' | 'secondary' | 'success' => {
    const variants: Record<string, 'danger' | 'primary' | 'secondary' | 'success'> = {
      SUPERADMIN: 'danger',
      ADMIN: 'primary',
      ENGENHEIRO: 'secondary',
      LABORATORISTA: 'success'
    };
    return variants[role] || 'secondary';
  };
  
  const isActive = (path: string) => {
    return location.pathname.startsWith(path);
  };
  
  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 print:hidden sticky top-0 z-30 backdrop-blur-sm bg-white/95 dark:bg-gray-800/95">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2 flex-shrink-0">
              <div className="p-2 bg-blue-600 dark:bg-blue-500 rounded-lg">
                <FileText className="w-5 h-5 text-white" />
              </div>
              <span className="hidden sm:block text-lg font-bold text-gray-900 dark:text-gray-100">
                Labore
              </span>
            </Link>
            
            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-2">
              {pendingCount > 0 && (
                <Link to="/pending-submissions">
                  <Button
                    variant={isActive('/pending-submissions') ? 'warning' : 'ghost'}
                    size="sm"
                    icon={<Clock size={16} />}
                  >
                    Pendentes
                    <Badge variant="warning" size="sm">
                      {pendingCount}
                    </Badge>
                  </Button>
                </Link>
              )}

              {/* User Menu Desktop */}
              <div className="relative" ref={userMenuRef}>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="flex items-center gap-2"
                >
                  <div className="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center text-white text-xs font-semibold">
                    {user?.name ? user.name.charAt(0).toUpperCase() : <User size={14} />}
                  </div>
                  <ChevronDown className={`w-4 h-4 transition-transform ${isUserMenuOpen ? 'rotate-180' : ''}`} />
                </Button>

                {isUserMenuOpen && (
                    <div className="absolute right-0 mt-2 w-72 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-50">
                      <div className="p-4 border-b border-gray-100 dark:border-gray-700">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white text-lg font-semibold">
                            {user?.name ? user.name.charAt(0).toUpperCase() : <User size={20} />}
                          </div>
                          <div className="flex-1">
                            <p className="font-semibold text-gray-900 dark:text-gray-100 text-sm">
                              {user?.name}
                            </p>
                            {user && (
                              <Badge variant={getRoleBadgeVariant(user.role)} size="sm" className="mt-1">
                                {getRoleLabel(user.role)}
                              </Badge>
                            )}
                            {user?.company && (
                              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                {user.company.name}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="p-3 border-b border-gray-100 dark:border-gray-700">
                        <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2 px-1">
                          OBRA ATIVA
                        </p>
                        <ProjectSelector />
                      </div>

                      <div className="p-2">
                        <Button
                          onClick={toggleTheme}
                          variant="ghost"
                          size="sm"
                          icon={theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
                          fullWidth
                          className="justify-start"
                        >
                          {theme === 'dark' ? 'Modo Claro' : 'Modo Escuro'}
                        </Button>
                        <Link to="/profile" onClick={() => setIsUserMenuOpen(false)}>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            icon={<Settings size={16} />} 
                            fullWidth 
                            className="justify-start mt-1"
                          >
                            Configurações
                          </Button>
                        </Link>
                        <Button
                          onClick={handleLogout}
                          variant="danger"
                          size="sm"
                          icon={<LogOut size={16} />}
                          fullWidth
                          className="justify-start mt-1"
                        >
                          Sair
                        </Button>
                      </div>
                    </div>
                )}
              </div>
            </nav>

            {/* Mobile Menu Button */}
            <div className="flex md:hidden items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                icon={isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
              />
            </div>
          </div>

          {/* Mobile Menu */}
          {isMobileMenuOpen && (
              <div 
                ref={mobileMenuRef}
                className="relative z-50 md:hidden border-t border-gray-200 dark:border-gray-700 py-4 space-y-2"
              >
                {pendingCount > 0 && (
                  <Link to="/pending-submissions" onClick={() => setIsMobileMenuOpen(false)}>
                    <Button
                      variant={isActive('/pending-submissions') ? 'warning' : 'ghost'}
                      size="sm"
                      icon={<Clock size={16} />}
                      fullWidth
                      className="justify-start"
                    >
                      Pendentes
                      <Badge variant="warning" size="sm">
                        {pendingCount}
                      </Badge>
                    </Button>
                  </Link>
                )}

                <div className="border-t border-gray-200 dark:border-gray-700 pt-2 mt-2">
                  <div className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg mb-2">
                    <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2">
                      OBRA ATIVA
                    </p>
                    <ProjectSelector />
                  </div>
                  <Button
                    onClick={toggleTheme}
                    variant="ghost"
                    size="sm"
                    icon={theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
                    fullWidth
                    className="justify-start"
                  >
                    {theme === 'dark' ? 'Modo Claro' : 'Modo Escuro'}
                  </Button>
                  <Link to="/profile" onClick={() => setIsMobileMenuOpen(false)}>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      icon={<Settings size={16} />} 
                      fullWidth 
                      className="justify-start mt-1"
                    >
                      Configurações
                    </Button>
                  </Link>
                  <Button
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      handleLogout();
                    }}
                    variant="danger"
                    size="sm"
                    icon={<LogOut size={16} />}
                    fullWidth
                    className="justify-start mt-1"
                  >
                    Sair
                  </Button>
                </div>
              </div>
          )}
        </div>
      </header>
      
      {/* Main Content */}
      <main className="flex-1 py-6 print:py-0">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 print:max-w-full print:px-0">
          <Outlet />
        </div>
      </main>
      
      {/* Footer */}
      <footer className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 mt-auto print:hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="text-center text-xs text-gray-500 dark:text-gray-400">
            © 2024 Labore Forms - Sistema de Formulários
          </div>
        </div>
      </footer>
    </div>
  );
}
