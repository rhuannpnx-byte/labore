import { useEffect, useState } from 'react';
import { authService, User } from '../services/auth';
import { Card, CardContent } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { User as UserIcon, Mail, Building2, Shield } from 'lucide-react';

export default function Profile() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

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
      } finally {
        setLoading(false);
      }
    };
    loadUser();
  }, []);

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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg text-gray-600">Carregando...</div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg text-gray-600">Usuário não encontrado</div>
      </div>
    );
  }

  return (
    <div>
      {/* Page Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">
          Configurações da Conta
        </h1>
        <p className="text-sm text-gray-600 mt-1">
          Informações do seu perfil e preferências
        </p>
      </div>

      {/* Profile Card */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-start gap-6">
            {/* Avatar */}
            <div className="w-20 h-20 rounded-full bg-blue-500 flex items-center justify-center text-white text-3xl font-semibold flex-shrink-0">
              {user.name ? user.name.charAt(0).toUpperCase() : <UserIcon size={32} />}
            </div>

            {/* User Info */}
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-3">
                <h2 className="text-2xl font-bold text-gray-900">
                  {user.name}
                </h2>
                <Badge variant={getRoleBadgeVariant(user.role)}>
                  {getRoleLabel(user.role)}
                </Badge>
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-3 text-gray-600">
                  <Mail className="w-5 h-5" />
                  <span className="text-sm">{user.email}</span>
                </div>

                {user.company && (
                  <div className="flex items-center gap-3 text-gray-600">
                    <Building2 className="w-5 h-5" />
                    <span className="text-sm">{user.company.name}</span>
                  </div>
                )}

                <div className="flex items-center gap-3 text-gray-600">
                  <Shield className="w-5 h-5" />
                  <span className="text-sm">Nível de Acesso: {getRoleLabel(user.role)}</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Additional Settings Placeholder */}
      <Card className="mt-6">
        <CardContent className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Preferências
          </h3>
          <p className="text-sm text-gray-600">
            Configurações adicionais estarão disponíveis em breve.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}



