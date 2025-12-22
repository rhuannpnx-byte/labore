/**
 * Utilitário para registrar e gerenciar o Service Worker
 */

export function registerServiceWorker(): void {
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker
        .register('/service-worker.js')
        .then((registration) => {
          console.log('✅ Service Worker registrado:', registration.scope);

          // Verifica atualizações periodicamente
          setInterval(() => {
            registration.update();
          }, 60000); // A cada 1 minuto

          // Escuta atualizações
          registration.addEventListener('updatefound', () => {
            const newWorker = registration.installing;
            
            if (newWorker) {
              newWorker.addEventListener('statechange', () => {
                if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                  // Nova versão disponível
                  console.log('🔄 Nova versão disponível!');
                  
                  // Opcional: notificar usuário
                  if (confirm('Nova versão disponível! Deseja atualizar?')) {
                    newWorker.postMessage({ type: 'SKIP_WAITING' });
                    window.location.reload();
                  }
                }
              });
            }
          });
        })
        .catch((error) => {
          console.error('❌ Erro ao registrar Service Worker:', error);
        });

      // Recarrega página quando novo SW tomar controle
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        console.log('🔄 Service Worker atualizado - recarregando...');
        window.location.reload();
      });
    });
  } else {
    console.warn('⚠️ Service Workers não são suportados neste navegador');
  }
}

export function unregisterServiceWorker(): Promise<boolean> {
  if ('serviceWorker' in navigator) {
    return navigator.serviceWorker.ready
      .then((registration) => {
        return registration.unregister();
      })
      .catch((error) => {
        console.error('❌ Erro ao desregistrar Service Worker:', error);
        return false;
      });
  }
  return Promise.resolve(false);
}

export function clearServiceWorkerCache(): void {
  if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
    navigator.serviceWorker.controller.postMessage({ type: 'CLEAR_CACHE' });
  }
}
