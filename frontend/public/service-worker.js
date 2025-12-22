/**
 * Service Worker para cache de assets e funcionalidade offline
 */

const CACHE_NAME = 'labore-forms-v1';
const ASSETS_TO_CACHE = [
  '/',
  '/index.html',
  '/manifest.json',
];

// Instalação - cacheia assets críticos
self.addEventListener('install', (event) => {
  console.log('🔧 Service Worker: Instalando...');
  
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('📦 Service Worker: Cacheando assets...');
      return cache.addAll(ASSETS_TO_CACHE).catch((error) => {
        console.error('❌ Erro ao cachear assets:', error);
      });
    }).then(() => {
      // Força ativação imediata
      return self.skipWaiting();
    })
  );
});

// Ativação - limpa caches antigos
self.addEventListener('activate', (event) => {
  console.log('✅ Service Worker: Ativando...');
  
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME)
          .map((name) => {
            console.log('🗑️ Service Worker: Removendo cache antigo:', name);
            return caches.delete(name);
          })
      );
    }).then(() => {
      // Toma controle de todas as páginas imediatamente
      return self.clients.claim();
    })
  );
});

// Fetch - estratégia Network First com fallback para cache
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);
  
  // Ignora requisições não-GET e de outros domínios
  if (request.method !== 'GET' || url.origin !== self.location.origin) {
    return;
  }
  
  // Ignora API calls - eles devem ser tratados pelo código da aplicação
  if (url.pathname.startsWith('/api/')) {
    return;
  }
  
  // Estratégia: Network First, fallback para Cache
  event.respondWith(
    fetch(request)
      .then((response) => {
        // Se a resposta é válida, clona e cacheia
        if (response && response.status === 200) {
          const responseClone = response.clone();
          
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(request, responseClone);
          });
        }
        
        return response;
      })
      .catch(() => {
        // Se falhou (offline), tenta buscar do cache
        return caches.match(request).then((cachedResponse) => {
          if (cachedResponse) {
            console.log('📦 Service Worker: Servindo do cache:', request.url);
            return cachedResponse;
          }
          
          // Se é navegação e não está no cache, retorna a página principal
          if (request.mode === 'navigate') {
            return caches.match('/index.html');
          }
          
          // Retorna uma resposta vazia para outros recursos
          return new Response('Offline', {
            status: 503,
            statusText: 'Service Unavailable',
          });
        });
      })
  );
});

// Mensagens do cliente
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  
  if (event.data && event.data.type === 'CLEAR_CACHE') {
    event.waitUntil(
      caches.keys().then((cacheNames) => {
        return Promise.all(
          cacheNames.map((name) => caches.delete(name))
        );
      }).then(() => {
        return self.clients.matchAll();
      }).then((clients) => {
        clients.forEach((client) => {
          client.postMessage({ type: 'CACHE_CLEARED' });
        });
      })
    );
  }
});

console.log('🚀 Service Worker: Carregado');
