/**
 * Configuração da URL da API
 * 
 * Em desenvolvimento: usa o proxy do Vite (/api)
 * Em produção: usa a variável de ambiente VITE_API_URL
 */
export const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

console.log('🔧 API Base URL:', API_BASE_URL);

