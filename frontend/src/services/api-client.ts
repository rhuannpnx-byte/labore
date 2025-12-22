import axios, { AxiosInstance } from 'axios';
import { authService } from './auth';
import { offlineDB } from './offline';

const API_URL = 'http://localhost:3000/api';

class ApiClient {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: API_URL
    });

    // Interceptor para adicionar token
    this.client.interceptors.request.use(
      (config) => {
        const token = authService.getToken();
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Interceptor para tratamento de erros
    this.client.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          authService.logout();
          window.location.href = '/login';
        }
        return Promise.reject(error);
      }
    );
  }

  // ============ USERS ============
  async getUsers() {
    const response = await this.client.get('/users');
    return response.data;
  }

  async getUser(id: string) {
    const response = await this.client.get(`/users/${id}`);
    return response.data;
  }

  async createUser(data: any) {
    const response = await this.client.post('/users', data);
    return response.data;
  }

  async updateUser(id: string, data: any) {
    const response = await this.client.put(`/users/${id}`, data);
    return response.data;
  }

  async deleteUser(id: string) {
    const response = await this.client.delete(`/users/${id}`);
    return response.data;
  }

  // ============ COMPANIES ============
  async getCompanies() {
    const response = await this.client.get('/companies');
    return response.data;
  }

  async getCompany(id: string) {
    const response = await this.client.get(`/companies/${id}`);
    return response.data;
  }

  async createCompany(data: any) {
    const response = await this.client.post('/companies', data);
    return response.data;
  }

  async updateCompany(id: string, data: any) {
    const response = await this.client.put(`/companies/${id}`, data);
    return response.data;
  }

  async deleteCompany(id: string) {
    const response = await this.client.delete(`/companies/${id}`);
    return response.data;
  }

  // ============ PROJECTS ============
  async getProjects(companyId?: string) {
    try {
      const params = companyId ? { companyId } : {};
      const response = await this.client.get('/projects', { params });
      
      // Cache as obras para acesso offline
      if (response.data && Array.isArray(response.data)) {
        await offlineDB.cacheProjects(response.data).catch((error) => {
          console.error('Erro ao cachear obras (pode ser necessário recarregar a página):', error);
        });
      }
      
      return response.data;
    } catch (error) {
      // Se offline, tenta recuperar do cache
      if (!navigator.onLine) {
        console.log('📴 Offline - buscando obras do cache...');
        const cachedProjects = await offlineDB.getCachedProjects();
        
        if (cachedProjects.length > 0) {
          console.log(`✅ ${cachedProjects.length} obra(s) recuperada(s) do cache`);
          return cachedProjects;
        }
      }
      throw error;
    }
  }

  async getProject(id: string) {
    const response = await this.client.get(`/projects/${id}`);
    return response.data;
  }

  async createProject(data: any) {
    const response = await this.client.post('/projects', data);
    return response.data;
  }

  async updateProject(id: string, data: any) {
    const response = await this.client.put(`/projects/${id}`, data);
    return response.data;
  }

  async deleteProject(id: string) {
    const response = await this.client.delete(`/projects/${id}`);
    return response.data;
  }

  async addUserToProject(projectId: string, userId: string) {
    const response = await this.client.post(`/projects/${projectId}/users`, { userId });
    return response.data;
  }

  async removeUserFromProject(projectId: string, userId: string) {
    const response = await this.client.delete(`/projects/${projectId}/users/${userId}`);
    return response.data;
  }

  // ============ FORMS ============
  async getForms(projectId?: string) {
    try {
      const params = projectId ? { projectId } : {};
      const response = await this.client.get('/forms', { params });
      
      // Cache os formulários para acesso offline
      if (response.data && Array.isArray(response.data)) {
        response.data.forEach((form: any) => {
          offlineDB.cacheForm(form).catch(console.error);
        });
      }
      
      return response.data;
    } catch (error) {
      // Se offline, tenta recuperar do cache
      if (!navigator.onLine) {
        console.log('📴 Offline - buscando formulários do cache...');
        let cachedForms = await offlineDB.getAllCachedForms();
        
        // Filtra por projectId se fornecido
        if (projectId && cachedForms.length > 0) {
          cachedForms = cachedForms.filter(form => form.projectId === projectId);
          console.log(`✅ ${cachedForms.length} formulário(s) da obra encontrado(s) no cache`);
        }
        
        if (cachedForms.length > 0) {
          return cachedForms;
        }
      }
      throw error;
    }
  }

  async getForm(id: string) {
    const response = await this.client.get(`/forms/${id}`);
    return response.data;
  }

  async createForm(data: any) {
    const response = await this.client.post('/forms', data);
    return response.data;
  }

  async updateForm(id: string, data: any) {
    const response = await this.client.put(`/forms/${id}`, data);
    return response.data;
  }

  async deleteForm(id: string) {
    const response = await this.client.delete(`/forms/${id}`);
    return response.data;
  }

  // Form Fields
  async addFormField(formId: string, data: any) {
    const response = await this.client.post(`/forms/${formId}/fields`, data);
    return response.data;
  }

  async updateFormField(formId: string, fieldId: string, data: any) {
    const response = await this.client.put(`/forms/${formId}/fields/${fieldId}`, data);
    return response.data;
  }

  async deleteFormField(formId: string, fieldId: string) {
    const response = await this.client.delete(`/forms/${formId}/fields/${fieldId}`);
    return response.data;
  }

  // Processing Rules
  async addProcessingRule(formId: string, data: any) {
    const response = await this.client.post(`/forms/${formId}/rules`, data);
    return response.data;
  }

  async updateProcessingRule(formId: string, ruleId: string, data: any) {
    const response = await this.client.put(`/forms/${formId}/rules/${ruleId}`, data);
    return response.data;
  }

  async deleteProcessingRule(formId: string, ruleId: string) {
    const response = await this.client.delete(`/forms/${formId}/rules/${ruleId}`);
    return response.data;
  }

  async validateFormula(formula: string, formId?: string) {
    const response = await this.client.post('/forms/validate-formula', { formula, formId });
    return response.data;
  }

  // ============ SUBMISSIONS ============
  async getFormSubmissions(formId: string) {
    try {
      const response = await this.client.get(`/submissions/form/${formId}`);
      return response.data;
    } catch (error) {
      // Se offline, retorna array vazio (submissions ainda não são cacheadas)
      if (!navigator.onLine) {
        console.log('📴 Offline - sem submissions cacheadas para este formulário');
        return [];
      }
      throw error;
    }
  }

  async getSubmission(id: string) {
    const response = await this.client.get(`/submissions/${id}`);
    return response.data;
  }

  async createSubmission(data: any) {
    const response = await this.client.post('/submissions', data);
    return response.data;
  }

  async deleteSubmission(id: string) {
    const response = await this.client.delete(`/submissions/${id}`);
    return response.data;
  }

  async getSubmissionStats(formId: string) {
    const response = await this.client.get(`/submissions/form/${formId}/stats`);
    return response.data;
  }
}

export const apiClient = new ApiClient();

