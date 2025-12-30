import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { authService, User } from '../services/auth';
import { useProjectContext } from '../services/project-context';
import { 
  Building2, 
  FolderKanban, 
  Users, 
  FileText, 
  BarChart3,
  AlertCircle,
  FileBarChart,
  ChevronRight,
  Sparkles
} from 'lucide-react';
import { Card, CardContent } from '../components/ui/Card';

export default function Dashboard() {
  const [user, setUser] = useState<User | null>(null);
  const { selectedProject } = useProjectContext();

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

  const canManageCompanies = user?.role === 'SUPERADMIN';
  const canManageProjects = user?.role === 'SUPERADMIN' || user?.role === 'ADMIN';
  const canManageUsers = user?.role === 'SUPERADMIN' || user?.role === 'ADMIN';
  const canManageForms = user?.role === 'SUPERADMIN' || user?.role === 'ADMIN' || user?.role === 'ENGENHEIRO';

  const menuItems = [
    {
      title: 'Empresas',
      description: 'Gerenciar empresas do sistema',
      icon: Building2,
      path: '/companies',
      iconColor: 'text-blue-600 dark:text-blue-400',
      iconBg: 'bg-blue-50 dark:bg-blue-900/20',
      show: canManageCompanies,
    },
    {
      title: 'Obras',
      description: 'Gerenciar projetos e obras',
      icon: FolderKanban,
      path: '/projects',
      iconColor: 'text-green-600 dark:text-green-400',
      iconBg: 'bg-green-50 dark:bg-green-900/20',
      show: canManageProjects,
    },
    {
      title: 'Usuários',
      description: 'Controle de acesso e permissões',
      icon: Users,
      path: '/users',
      iconColor: 'text-purple-600 dark:text-purple-400',
      iconBg: 'bg-purple-50 dark:bg-purple-900/20',
      show: canManageUsers,
    },
    {
      title: 'Formulários',
      description: 'Criar e gerenciar formulários',
      icon: FileText,
      path: '/forms',
      iconColor: 'text-orange-600 dark:text-orange-400',
      iconBg: 'bg-orange-50 dark:bg-orange-900/20',
      show: canManageForms,
    },
    {
      title: 'Respostas',
      description: 'Visualizar e preencher respostas',
      icon: BarChart3,
      path: '/submissions',
      iconColor: 'text-indigo-600 dark:text-indigo-400',
      iconBg: 'bg-indigo-50 dark:bg-indigo-900/20',
      show: true,
    },
    {
      title: 'Relatórios',
      description: 'Gerar relatórios personalizados',
      icon: FileBarChart,
      path: '/reports',
      iconColor: 'text-red-600 dark:text-red-400',
      iconBg: 'bg-red-50 dark:bg-red-900/20',
      show: canManageForms,
    },
  ];

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="relative overflow-hidden bg-gradient-to-br from-blue-500 to-blue-600 dark:from-blue-600 dark:to-blue-700 rounded-2xl p-6 sm:p-8 text-white">
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="w-5 h-5" />
            <span className="text-sm font-medium opacity-90">
              {new Date().getHours() < 12 ? 'Bom dia' : new Date().getHours() < 18 ? 'Boa tarde' : 'Boa noite'}
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold mb-2">
            {user?.name ? `Olá, ${user.name.split(' ')[0]}!` : 'Bem-vindo!'}
        </h1>
          <p className="text-sm sm:text-base text-blue-100">
          {selectedProject 
              ? `Trabalhand o na obra: ${selectedProject.name}` 
              : 'Selecione uma obra para começar a trabalhar'}
        </p>
        </div>
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-black/10 rounded-full translate-y-1/2 -translate-x-1/2" />
      </div>

      {/* Alert */}
      {!selectedProject && (user?.role === 'ENGENHEIRO' || user?.role === 'LABORATORISTA') && (
        <div className="bg-yellow-50 dark:bg-yellow-900/20 border-l-4 border-yellow-400 dark:border-yellow-500 p-4 rounded-lg">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-yellow-400 dark:text-yellow-500 mt-0.5 flex-shrink-0" />
            <div>
              <h3 className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                Nenhuma obra selecionada
              </h3>
              <p className="mt-1 text-sm text-yellow-700 dark:text-yellow-300">
                Selecione uma obra no menu de configurações para acessar os formulários e respostas.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Menu Grid */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
          Acesso Rápido
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {menuItems.filter(item => item.show).map((item) => {
            const IconComponent = item.icon;
            return (
              <Link key={item.path} to={item.path} className="group">
                <Card className="h-full hover:shadow-lg hover:scale-105 transition-all duration-200">
                  <CardContent className="p-5">
                    <div className="flex items-start justify-between mb-3">
                      <div className={`p-3 ${item.iconBg} rounded-xl transition-transform group-hover:scale-110`}>
                        <IconComponent className={`w-6 h-6 ${item.iconColor}`} />
                      </div>
                      <ChevronRight className="w-5 h-5 text-gray-400 dark:text-gray-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                    <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100 mb-1">
                          {item.title}
                        </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                          {item.description}
                        </p>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
