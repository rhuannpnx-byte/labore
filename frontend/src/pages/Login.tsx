import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../services/auth';
import { LogIn, Mail, Lock, AlertCircle } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await authService.login({ email, password });
      navigate('/');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Erro ao fazer login');
    } finally {
      setLoading(false);
    }
  };

  const quickLogin = async (testEmail: string, testPassword: string) => {
    setEmail(testEmail);
    setPassword(testPassword);
    setError('');
    setLoading(true);

    try {
      await authService.login({ email: testEmail, password: testPassword });
      navigate('/');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Erro ao fazer login');
      setLoading(false);
    }
  };

  const testAccounts = [
    { email: 'rhuann.nunes@tecpav.com', password: 'Rh021197@', role: 'Superadmin', color: 'text-red-600 bg-red-50' },
    { email: 'admin@tecpav.com', password: 'admin123', role: 'Admin', color: 'text-blue-600 bg-blue-50' },
    { email: 'engenheiro@tecpav.com', password: 'eng123', role: 'Engenheiro', color: 'text-purple-600 bg-purple-50' },
    { email: 'laboratorista@tecpav.com', password: 'lab123', role: 'Laboratorista', color: 'text-green-600 bg-green-50' },
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4 transition-colors duration-200">
      {/* Login Card */}
      <div className="w-full max-w-md">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 mb-4 bg-gradient-to-br from-blue-600 to-blue-500 rounded-xl shadow-lg">
              <LogIn className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-1">
              Labore Forms
            </h1>
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              Sistema de Gestão de Formulários
            </p>
          </div>

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="seu@email.com"
              required
              disabled={loading}
              icon={<Mail size={18} />}
              iconPosition="left"
            />

            <Input
              label="Senha"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              disabled={loading}
              icon={<Lock size={18} />}
              iconPosition="left"
            />

            {error && (
              <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            <Button
              type="submit"
              variant="primary"
              fullWidth
              isLoading={loading}
              icon={!loading ? <LogIn size={18} /> : undefined}
            >
              {loading ? 'Entrando...' : 'Entrar'}
            </Button>
          </form>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200 dark:border-gray-700" />
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="px-2 bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400">
                Ou use uma conta de teste
              </span>
            </div>
          </div>

          {/* Quick Login Buttons */}
          <div className="space-y-2">
            {testAccounts.map((account) => (
              <button
                key={account.email}
                type="button"
                onClick={() => quickLogin(account.email, account.password)}
                disabled={loading}
                className="w-full p-3 border border-gray-200 dark:border-gray-700 rounded-lg text-left transition-all hover:bg-gray-50 dark:hover:bg-gray-700/50 hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                      {account.role}
                    </p>
                    <p className="text-xs text-gray-600 dark:text-gray-400 mt-0.5">
                      {account.email}
                    </p>
                  </div>
                  <LogIn size={14} className="text-gray-400 dark:text-gray-500" />
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="mt-6 text-center">
          <p className="text-xs text-gray-500 dark:text-gray-400">
            © 2024 Labore Forms - Todos os direitos reservados
          </p>
        </div>
      </div>
    </div>
  );
}
