/**
 * Formata erros da API para exibição ao usuário
 */
export function formatApiError(error: any): string {
  // Se não houver resposta, erro de rede
  if (!error.response) {
    return 'Erro de conexão. Verifique sua internet.';
  }

  const errorData = error.response?.data?.error;

  // Se não houver erro na resposta
  if (!errorData) {
    return 'Erro desconhecido. Tente novamente.';
  }

  // Se for uma string, retorna diretamente
  if (typeof errorData === 'string') {
    return errorData;
  }

  // Se for um array de erros do Zod
  if (Array.isArray(errorData)) {
    return errorData
      .map((err: any) => {
        if (typeof err === 'string') return err;
        if (err.message) return err.message;
        if (err.path && err.message) {
          return `${err.path.join('.')}: ${err.message}`;
        }
        return JSON.stringify(err);
      })
      .join('\n');
  }

  // Se for um objeto
  if (typeof errorData === 'object') {
    // Tenta extrair mensagem
    if (errorData.message) {
      return errorData.message;
    }
    // Formata como JSON legível
    return JSON.stringify(errorData, null, 2);
  }

  return 'Erro ao processar requisição';
}

/**
 * Exibe um erro formatado ao usuário
 */
export function showError(error: any, defaultMessage: string = 'Erro ao processar requisição') {
  const message = formatApiError(error) || defaultMessage;
  alert(message);
}




