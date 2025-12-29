# 📴 Funcionalidade Offline First - Labore Forms

## 🎯 Visão Geral

O Labore Forms agora possui **suporte completo offline-first**, permitindo que usuários continuem trabalhando sem conexão com a internet. Todos os formulários preenchidos offline são automaticamente sincronizados quando a conexão é restabelecida.

## ✨ Funcionalidades

### 1. **Preenchimento Offline de Formulários**
- ✅ Preencha formulários mesmo sem internet
- ✅ Dados salvos localmente no navegador (IndexedDB)
- ✅ Validação completa dos campos mantida
- ✅ Feedback visual imediato ao salvar

### 2. **Sincronização Automática**
- ✅ Detecta automaticamente quando a conexão volta
- ✅ Sincroniza submissions pendentes em background
- ✅ Sistema de retry inteligente (até 3 tentativas)
- ✅ Sincronização periódica a cada 30 segundos

### 3. **Indicador Visual de Status**
- ✅ Badge no canto inferior direito mostrando status
- ✅ Contador de formulários pendentes
- ✅ Animação durante sincronização
- ✅ Mensagens de erro quando falhar
- ✅ Botão manual para forçar sincronização

### 4. **Cache de Formulários**
- ✅ Formulários visualizados são armazenados em cache
- ✅ Acesso aos formulários mesmo offline
- ✅ Lista de formulários disponível offline

### 5. **Service Worker**
- ✅ Cache inteligente de assets (HTML, CSS, JS)
- ✅ Estratégia Network First com fallback
- ✅ PWA completo (pode ser instalado)

## 🔧 Como Funciona

### Arquitetura

```
┌─────────────────────────────────────────────────────────┐
│                    Usuário                               │
└───────────────────────┬─────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────┐
│              Interface React (FormFill)                  │
└───────────────────────┬─────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────┐
│           API Service (com suporte offline)              │
│  ┌──────────────────┐    ┌──────────────────┐          │
│  │  Online?         │───▶│ Envia ao Backend │          │
│  └──────────────────┘    └──────────────────┘          │
│           │                                              │
│           ▼                                              │
│  ┌──────────────────┐    ┌──────────────────┐          │
│  │  Offline?        │───▶│ Salva IndexedDB  │          │
│  └──────────────────┘    └──────────────────┘          │
└─────────────────────────────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────┐
│              IndexedDB (Banco Local)                     │
│  • pending_submissions (fila de sincronização)           │
│  • cached_forms (formulários em cache)                   │
└───────────────────────┬─────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────┐
│           Sync Service (Sincronização)                   │
│  • Detecta conexão online                                │
│  • Processa fila de pendentes                            │
│  • Gerencia retries                                      │
│  • Emite eventos para UI                                 │
└───────────────────────┬─────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────┐
│              Backend API (Servidor)                      │
└─────────────────────────────────────────────────────────┘
```

### Fluxo de Dados

#### 📤 Quando ONLINE:
1. Usuário preenche formulário
2. Clica em "Enviar"
3. Tenta enviar para o backend
4. ✅ Sucesso → Redireciona para visualização
5. ❌ Erro de rede → Salva no IndexedDB

#### 📴 Quando OFFLINE:
1. Usuário preenche formulário
2. Clica em "Enviar"
3. Detecta que está offline
4. Salva no IndexedDB
5. Mostra mensagem de sucesso offline
6. Aguarda conexão

#### 🔄 Sincronização:
1. Conexão restabelecida (evento `online`)
2. Sync Service é acionado
3. Busca submissions pendentes no IndexedDB
4. Tenta enviar cada uma para o backend
5. ✅ Sucesso → Remove do IndexedDB
6. ❌ Falha → Incrementa tentativas, mantém no IndexedDB
7. Atualiza UI com status

## 📦 Estrutura de Arquivos

```
frontend/
├── src/
│   ├── services/
│   │   ├── offline.ts          # Gerenciamento IndexedDB
│   │   ├── sync.ts             # Sincronização automática
│   │   ├── api.ts              # API com suporte offline
│   │   └── serviceWorker.ts    # Registro do SW
│   │
│   ├── hooks/
│   │   ├── useOnlineStatus.ts  # Hook de status de conexão
│   │   └── useSyncStatus.ts    # Hook de status de sync
│   │
│   ├── components/
│   │   └── OfflineIndicator.tsx # Componente visual
│   │
│   └── pages/
│       └── FormFill.tsx         # Formulário com offline
│
└── public/
    ├── service-worker.js        # Service Worker
    └── manifest.json            # PWA Manifest
```

## 🚀 Como Usar

### Para Usuários

1. **Trabalhe Normalmente**
   - Continue preenchendo formulários normalmente
   - Não se preocupe com a conexão

2. **Fique de Olho no Indicador**
   - Se aparecer "Modo Offline" → seus dados estão sendo salvos localmente
   - Se aparecer badge com número → quantidade de formulários aguardando sincronização

3. **Aguarde a Sincronização**
   - Quando voltar online, a sincronização é automática
   - Você verá o indicador de "Sincronizando..."
   - Após sincronizar, o badge desaparece

4. **Sincronização Manual**
   - Se quiser, clique no botão "Sync" para forçar sincronização imediata

### Para Desenvolvedores

#### Testando Offline

**1. Modo Offline do Chrome DevTools:**
```
1. Abra DevTools (F12)
2. Vá para a aba "Network"
3. Selecione "Offline" no dropdown de throttling
```

**2. Desconectar WiFi/Ethernet:**
- Forma mais realista de testar
- Testa todos os aspectos da funcionalidade

**3. Forçar Erro de Rede:**
```typescript
// Em development, você pode simular erro de rede:
api.interceptors.request.use((config) => {
  if (import.meta.env.DEV) {
    throw new Error('Simulated network error');
  }
  return config;
});
```

#### Depurando

**Ver IndexedDB:**
```
1. Chrome DevTools → Application
2. Storage → IndexedDB → labore_forms_offline
3. Visualize:
   - pending_submissions (fila de sync)
   - cached_forms (formulários em cache)
```

**Console Logs:**
```javascript
// Logs automáticos no console:
// ✅ = Sucesso
// 📴 = Offline
// 🔄 = Sincronizando
// ❌ = Erro
// 💾 = Salvando offline
```

**Forçar Sincronização (Console):**
```javascript
import { syncService } from './services/sync';

// Forçar sincronização
await syncService.forcSync();

// Ver quantidade pendente
await syncService.getPendingCount();
```

**Limpar Dados Offline:**
```javascript
import { offlineDB } from './services/offline';

// Limpar tudo
await offlineDB.clearAll();
```

## 🎨 Customização

### Modificar Intervalo de Sincronização

```typescript
// Em src/services/sync.ts, linha ~84:
this.syncInterval = window.setInterval(async () => {
  // ... código
}, 30000); // ← Mudar aqui (em milissegundos)
```

### Modificar Máximo de Tentativas

```typescript
// Em src/services/sync.ts, linha ~21:
private maxRetries = 3; // ← Mudar aqui
```

### Personalizar Mensagem Offline

```typescript
// Em src/pages/FormFill.tsx, linha ~78:
alert(
  '✅ Formulário salvo localmente!\n\n' +
  'Sua mensagem personalizada aqui'
);
```

### Customizar Indicador Visual

```typescript
// Em src/components/OfflineIndicator.tsx
// Modificar estilos, cores, posição, etc.
```

## 📊 Monitoramento

### Eventos de Sincronização

Você pode escutar eventos de sincronização:

```typescript
import { syncService } from './services/sync';

const unsubscribe = syncService.addListener((event) => {
  switch (event.type) {
    case 'sync-started':
      console.log('Sincronização iniciada', event.pendingCount);
      break;
      
    case 'sync-completed':
      console.log('Sincronização completa', event.pendingCount);
      break;
      
    case 'sync-failed':
      console.error('Sincronização falhou', event.error);
      break;
      
    case 'submission-synced':
      console.log('Submission sincronizada', event.submissionId);
      break;
  }
});

// Limpar listener quando não precisar mais
unsubscribe();
```

### Métricas Úteis

```typescript
// Quantidade de submissions pendentes
const count = await offlineDB.countPendingSubmissions();

// Lista de submissions pendentes com detalhes
const pending = await offlineDB.getPendingSubmissions();

// Verificar se está sincronizando
const isSyncing = syncService.isSyncInProgress();
```

## 🔒 Segurança

### Dados Locais
- ✅ Armazenados no **IndexedDB** (banco do navegador)
- ✅ Isolados por origem (mesmo domínio)
- ✅ Não acessíveis por outros sites
- ✅ Limpam automaticamente ao limpar dados do navegador

### Privacidade
- ⚠️ Dados ficam no dispositivo do usuário
- ⚠️ Em computadores compartilhados, outros usuários podem acessar
- 💡 **Recomendação:** Não usar em dispositivos públicos para dados sensíveis

### Sincronização
- ✅ Usa HTTPS em produção
- ✅ Mesmas credenciais/tokens da API normal
- ✅ Validação no backend mantida

## 🐛 Troubleshooting

### Submissions não sincronizam

**Verificar:**
1. Conexão realmente online? (testar em outro site)
2. Backend está acessível? (ver Network tab)
3. Atingiu máximo de tentativas? (ver console logs)

**Solução:**
```javascript
// Forçar retry manualmente
await syncService.forcSync();
```

### IndexedDB não funciona

**Possíveis causas:**
- Modo privado/anônimo do navegador
- Navegador antigo (< 2018)
- Quota de armazenamento excedida

**Verificar:**
```javascript
if (!window.indexedDB) {
  console.error('IndexedDB não suportado');
}
```

### Service Worker não registra

**Verificar:**
```javascript
if (!('serviceWorker' in navigator)) {
  console.error('Service Workers não suportados');
}

// Ver status
navigator.serviceWorker.getRegistrations().then(regs => {
  console.log('Service Workers registrados:', regs);
});
```

**Limpar e re-registrar:**
```javascript
// Desregistrar
await navigator.serviceWorker.getRegistrations().then(regs => {
  regs.forEach(reg => reg.unregister());
});

// Hard refresh
location.reload(true);
```

### Dados não limpam

**Limpar manualmente:**
```javascript
// Via Console do DevTools:

// 1. Limpar IndexedDB
await offlineDB.clearAll();

// 2. Limpar Service Worker cache
await caches.keys().then(names => {
  names.forEach(name => caches.delete(name));
});

// 3. Desregistrar Service Worker
await navigator.serviceWorker.getRegistrations().then(regs => {
  regs.forEach(reg => reg.unregister());
});
```

## 📈 Melhorias Futuras

### Planejado
- [ ] Sincronização em background (Background Sync API)
- [ ] Notificações push quando sincronizar
- [ ] Compressão de dados pendentes
- [ ] Criptografia local de dados sensíveis
- [ ] Sincronização seletiva (escolher quais enviar)
- [ ] Resolução de conflitos (se formulário mudou)
- [ ] Modo offline permanente (trabalhar sempre offline)
- [ ] Estatísticas de uso offline

### Contribuindo
Pull requests são bem-vindos! Veja [CONTRIBUTING.md](./CONTRIBUTING.md)

## 📚 Referências

- [IndexedDB API](https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API)
- [Service Workers](https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API)
- [PWA](https://web.dev/progressive-web-apps/)
- [Online/Offline Events](https://developer.mozilla.org/en-US/docs/Web/API/Navigator/onLine)

---

**Dúvidas?** Abra uma issue ou consulte a documentação principal no [README.md](./README.md)






