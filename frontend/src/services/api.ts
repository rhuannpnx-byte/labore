import axios from 'axios';
import type {
  Form,
  FormSubmission,
  CreateFormData,
  CreateFieldData,
  CreateRuleData,
  CreateSubmissionData,
} from '../types';
import { offlineDB } from './offline';
import { syncService } from './sync';
import { authService } from './auth';

const api = axios.create({
  baseURL: (import.meta as any).env?.VITE_API_URL || 'https://labore-api.onrender.com/api',
});

// Interceptor para adicionar token de autenticação
api.interceptors.request.use((config) => {
  const token = authService.getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  config.timeout = 10000; // 10 segundos
  return config;
});

// Forms API
export const formsApi = {
  list: async (projectId?: string) => {
    try {
      const params = projectId ? { projectId } : {};
      const response = await api.get<Form[]>('/forms', { params });
      
      // Cache os formulários para acesso offline
      if (response.data) {
        response.data.forEach((form) => {
          offlineDB.cacheForm(form).catch(console.error);
        });
      }
      
      return response;
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
          return { data: cachedForms } as any;
        }
      }
      throw error;
    }
  },
  
  getById: async (id: string) => {
    try {
      const response = await api.get<Form>(`/forms/${id}`);
      
      // Cache o formulário para acesso offline
      if (response.data) {
        await offlineDB.cacheForm(response.data);
      }
      
      return response;
    } catch (error) {
      // Se offline, tenta recuperar do cache
      if (!navigator.onLine) {
        console.log(`📴 Offline - buscando formulário ${id} do cache...`);
        const cachedForm = await offlineDB.getCachedForm(id);
        
        if (cachedForm) {
          return { data: cachedForm } as any;
        }
      }
      throw error;
    }
  },
  
  create: (data: CreateFormData) => api.post<Form>('/forms', data),
  update: (id: string, data: Partial<CreateFormData>) => 
    api.put<Form>(`/forms/${id}`, data),
  delete: (id: string) => api.delete(`/forms/${id}`),
  
  // Fields
  addField: (formId: string, data: CreateFieldData) => 
    api.post(`/forms/${formId}/fields`, data),
  updateField: (formId: string, fieldId: string, data: Partial<CreateFieldData>) => 
    api.put(`/forms/${formId}/fields/${fieldId}`, data),
  deleteField: (formId: string, fieldId: string) => 
    api.delete(`/forms/${formId}/fields/${fieldId}`),
  removeField: (formId: string, fieldId: string) => 
    api.delete(`/forms/${formId}/fields/${fieldId}`),
  reorderFields: (formId: string, fieldIds: string[]) =>
    api.put(`/forms/${formId}/fields/reorder`, { fieldIds }),
  
  // Rules
  addRule: (formId: string, data: CreateRuleData) => 
    api.post(`/forms/${formId}/rules`, data),
  updateRule: (formId: string, ruleId: string, data: Partial<CreateRuleData>) => 
    api.put(`/forms/${formId}/rules/${ruleId}`, data),
  deleteRule: (formId: string, ruleId: string) => 
    api.delete(`/forms/${formId}/rules/${ruleId}`),
  removeRule: (formId: string, ruleId: string) => 
    api.delete(`/forms/${formId}/rules/${ruleId}`),
  
  // Formula validation
  validateFormula: (formula: string, formId?: string) => 
    api.post('/forms/validate-formula', { formula, formId }),
};

// Submissions API com suporte offline
export const submissionsApi = {
  listByForm: (formId: string) => 
    api.get<FormSubmission[]>(`/submissions/form/${formId}`),
  getById: (id: string) => api.get<FormSubmission>(`/submissions/${id}`),
  
  /**
   * Cria uma submission com suporte offline
   * Se estiver online, envia normalmente
   * Se estiver offline, salva no IndexedDB para sincronização posterior
   */
  create: async (data: CreateSubmissionData) => {
    try {
      // Se online, tenta enviar normalmente
      if (navigator.onLine) {
        const response = await api.post<FormSubmission>('/submissions', data);
        console.log('✅ Submission enviada com sucesso (online)');
        return response;
      }
    } catch (error: any) {
      // Se falhou por erro de rede, trata como offline
      const isNetworkError = 
        !error.response || 
        error.code === 'ECONNABORTED' || 
        error.code === 'ERR_NETWORK';
      
      if (!isNetworkError) {
        // Se é erro do servidor (validação, etc), propaga o erro
        throw error;
      }
      
      console.log('⚠️ Erro de rede detectado, salvando offline...');
    }
    
    // Se chegou aqui, está offline - salva no IndexedDB
    console.log('💾 Salvando submission offline...');
    const pendingId = await offlineDB.addPendingSubmission(data.formId, data);
    
    // Tenta sincronizar em background (não await para não bloquear)
    setTimeout(() => {
      syncService.syncPendingSubmissions().catch(console.error);
    }, 1000);
    
    // Retorna uma resposta fake para manter a interface funcionando
    return {
      data: {
        id: pendingId,
        formId: data.formId,
        submittedAt: new Date().toISOString(),
        responses: data.responses.map((r) => ({
          id: `temp_${Math.random()}`,
          submissionId: pendingId,
          fieldId: r.fieldId,
          value: r.value,
          createdAt: new Date().toISOString(),
          field: {} as any,
        })),
        processingResults: [],
        __pending: true, // Flag para indicar que está pendente
      } as any,
    };
  },
  
  delete: (id: string) => api.delete(`/submissions/${id}`),
  getStats: (formId: string) => 
    api.get(`/submissions/form/${formId}/stats`),
};

// Reports API
export const reportsApi = {
  // Report CRUD
  list: (params?: any) => api.get('/reports', { params }),
  get: (id: string) => api.get(`/reports/${id}`),
  create: (data: any) => api.post('/reports', data),
  update: (id: string, data: any) => api.put(`/reports/${id}`, data),
  delete: (id: string) => api.delete(`/reports/${id}`),
  
  // Report Elements
  addElement: (reportId: string, data: any) => 
    api.post(`/reports/${reportId}/elements`, data),
  updateElement: (elementId: string, data: any) => 
    api.put(`/reports/elements/${elementId}`, data),
  deleteElement: (elementId: string) => 
    api.delete(`/reports/elements/${elementId}`),
  
  // Report Generation
  generate: (reportId: string, data: any) => 
    api.post(`/reports/${reportId}/generate`, data),
  getGeneration: (generationId: string) => 
    api.get(`/reports/generations/${generationId}`),
  listGenerations: (reportId: string) => 
    api.get(`/reports/${reportId}/generations`),
};

