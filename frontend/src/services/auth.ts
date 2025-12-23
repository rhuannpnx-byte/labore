import axios from 'axios';

const API_URL = (import.meta as any).env?.VITE_API_URL || 'https://labore-api.onrender.com/api';

export interface User {
  id: string;
  email: string;
  name: string;
  role: 'SUPERADMIN' | 'ADMIN' | 'ENGENHEIRO' | 'LABORATORISTA';
  companyId?: string;
  company?: {
    id: string;
    name: string;
  };
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

class AuthService {
  private tokenKey = 'labore_token';
  private userKey = 'labore_user';

  // Login
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const response = await axios.post(`${API_URL}/auth/login`, credentials);
    const { token, user } = response.data;

    // Salvar token e usuário
    this.setToken(token);
    this.setUser(user);

    return response.data;
  }

  // Logout
  logout(): void {
    localStorage.removeItem(this.tokenKey);
    localStorage.removeItem(this.userKey);
  }

  // Obter token
  getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  // Salvar token
  setToken(token: string): void {
    localStorage.setItem(this.tokenKey, token);
  }

  // Obter usuário
  getUser(): User | null {
    const userStr = localStorage.getItem(this.userKey);
    return userStr ? JSON.parse(userStr) : null;
  }

  // Salvar usuário
  setUser(user: User): void {
    localStorage.setItem(this.userKey, JSON.stringify(user));
  }

  // Verificar se está autenticado
  isAuthenticated(): boolean {
    return !!this.getToken();
  }

  // Obter dados atualizados do usuário
  async getMe(): Promise<User> {
    const token = this.getToken();
    const response = await axios.get(`${API_URL}/auth/me`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    this.setUser(response.data);
    return response.data;
  }

  // Alterar senha
  async changePassword(currentPassword: string, newPassword: string): Promise<void> {
    const token = this.getToken();
    await axios.post(
      `${API_URL}/auth/change-password`,
      { currentPassword, newPassword },
      { headers: { Authorization: `Bearer ${token}` } }
    );
  }

  // Verificar role
  hasRole(roles: string[]): boolean {
    const user = this.getUser();
    return user ? roles.includes(user.role) : false;
  }

  // Interceptor de requests para adicionar token
  setupInterceptors(): void {
    axios.interceptors.request.use(
      (config) => {
        const token = this.getToken();
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    axios.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          this.logout();
          window.location.href = '/login';
        }
        return Promise.reject(error);
      }
    );
  }
}

export const authService = new AuthService();





