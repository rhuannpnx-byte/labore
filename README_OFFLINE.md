# 🚀 Labore Forms - Offline First Edition

![Status](https://img.shields.io/badge/status-production--ready-success)
![Offline](https://img.shields.io/badge/offline-enabled-blue)
![PWA](https://img.shields.io/badge/PWA-ready-purple)

Sistema profissional de criação e processamento de formulários **com suporte completo offline-first**.

## 🎯 Principais Funcionalidades Offline

### ✅ O que funciona offline?

- ✅ **Preencher formulários** - Continue preenchendo sem internet
- ✅ **Visualizar formulários** - Formulários já visitados ficam em cache
- ✅ **Lista de formulários** - Cache inteligente da lista
- ✅ **Sincronização automática** - Envia tudo quando voltar online
- ✅ **Indicador visual** - Sempre sabe se está online/offline
- ✅ **Múltiplas submissions** - Pode preencher vários formulários offline
- ✅ **Sistema de retry** - Tenta enviar até 3 vezes se falhar
- ✅ **PWA instalável** - Funciona como aplicativo nativo

### ❌ O que requer internet?

- ❌ Criar novos formulários
- ❌ Editar estrutura de formulários
- ❌ Visualizar estatísticas
- ❌ Primeira visualização de um formulário (depois fica em cache)

## 🏗️ Arquitetura Offline-First

```
┌──────────────────────────────────────────────────────────┐
│                       Frontend                            │
│  ┌────────────────────────────────────────────────────┐  │
│  │              React Application                      │  │
│  │  • Forms, Submissions, Validations                 │  │
│  └────────────────┬───────────────────────────────────┘  │
│                   │                                       │
│  ┌────────────────▼───────────────────────────────────┐  │
│  │           Offline Layer                            │  │
│  │  ┌──────────────┐      ┌──────────────┐          │  │
│  │  │  IndexedDB   │◄────►│  Sync Queue  │          │  │
│  │  │  • Pending   │      │  • Auto sync │          │  │
│  │  │  • Cache     │      │  • Retry     │          │  │
│  │  └──────────────┘      └──────────────┘          │  │
│  └────────────────┬───────────────────────────────────┘  │
│                   │                                       │
│  ┌────────────────▼───────────────────────────────────┐  │
│  │         Service Worker                             │  │
│  │  • Asset cache                                     │  │
│  │  • Network-first strategy                          │  │
│  └────────────────────────────────────────────────────┘  │
└──────────────────┬───────────────────────────────────────┘
                   │ HTTP/REST
                   ▼
┌──────────────────────────────────────────────────────────┐
│                      Backend API                          │
│  • PostgreSQL                                            │
│  • Validation                                            │
│  • Processing Rules                                      │
└──────────────────────────────────────────────────────────┘
```

## 📦 Tecnologias Usadas

### Offline Stack
- **IndexedDB** - Banco de dados local do navegador
- **Service Workers** - Cache de assets e PWA
- **Online/Offline Events** - Detecção de conexão
- **Sync API** - Sincronização inteligente
- **LocalStorage** - Preferências do usuário

### Frontend Stack
- **React 18** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool
- **React Router** - Navegação
- **Axios** - HTTP client (com suporte offline)
- **Zustand** - State management (opcional)
- **Lucide React** - Ícones

### Backend Stack
- **Node.js + Express** - API REST
- **PostgreSQL** - Banco de dados
- **Prisma** - ORM
- **TypeScript** - Type safety
- **Math.js** - Processamento de fórmulas

## 🚀 Instalação Rápida

### 1. Clone e instale dependências
```bash
# Clone o repositório
git clone <seu-repo>
cd labore-forms

# Instale dependências
cd backend && npm install
cd ../frontend && npm install
```

### 2. Configure o banco de dados
```bash
# No backend, crie .env
DATABASE_URL="postgresql://user:password@localhost:5432/labore_forms"
PORT=3000
NODE_ENV=development

# Execute migrations
npx prisma migrate dev
npx prisma generate
npm run prisma:seed  # Dados de exemplo
```

### 3. Inicie a aplicação
```bash
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend
cd frontend
npm run dev
```

### 4. Acesse
- **Frontend:** http://localhost:5173
- **Backend:** http://localhost:3000

## 🧪 Testando Funcionalidade Offline

### Teste Básico (Chrome DevTools)

1. **Abra a aplicação**
   ```
   http://localhost:5173
   ```

2. **Abra DevTools** (F12)

3. **Ative modo offline**
   - Aba Network
   - Dropdown "Throttling"
   - Selecione "Offline"

4. **Preencha um formulário**
   - Escolha qualquer formulário
   - Preencha os campos
   - Clique "Enviar"
   - ✅ Veja a mensagem: "Formulário salvo localmente!"

5. **Volte online**
   - Throttling → "Online"
   - Aguarde alguns segundos
   - ✅ Veja o indicador "Sincronizando..."
   - ✅ Submission enviada automaticamente!

### Teste Avançado (WiFi)

```bash
# 1. Preencha alguns formulários online
# 2. Desconecte o WiFi
# 3. Preencha mais formulários
# 4. Feche o navegador
# 5. Abra novamente (ainda offline)
# 6. Veja que os dados persistem!
# 7. Reconecte o WiFi
# 8. Veja a sincronização automática
```

### Verificar IndexedDB

```
Chrome DevTools → Application → Storage → IndexedDB → labore_forms_offline
```

Você verá:
- `pending_submissions` - Fila de sincronização
- `cached_forms` - Formulários em cache

## 📱 PWA - Instalar como Aplicativo

### Desktop
1. Abra no Chrome
2. Olhe o ícone ➕ na barra de endereço
3. Clique "Instalar"

### Mobile (Android)
1. Menu → "Adicionar à tela inicial"

### Mobile (iOS)
1. Compartilhar → "Adicionar à Tela de Início"

## 📊 Monitoramento e Debug

### Console do Navegador

Os logs seguem um padrão visual:
- ✅ **Verde** - Sucesso
- 📴 **Laranja** - Offline
- 🔄 **Azul** - Sincronizando
- ❌ **Vermelho** - Erro
- 💾 **Roxo** - Salvando offline

### Comandos DevTools

```javascript
// Importar serviços
import { offlineDB } from './services/offline';
import { syncService } from './services/sync';

// Ver submissions pendentes
await offlineDB.getPendingSubmissions();

// Contar pendentes
await offlineDB.countPendingSubmissions();

// Forçar sincronização
await syncService.forcSync();

// Limpar tudo (reset)
await offlineDB.clearAll();

// Ver formulários em cache
await offlineDB.getAllCachedForms();
```

### Página de Administração

Acesse `/pending-submissions` para ver uma interface visual de:
- Todas as submissions pendentes
- Número de tentativas de cada uma
- Erros ocorridos
- Botão para sincronizar manualmente
- Botão para remover pendentes

## 🎨 Interface do Usuário

### Indicador de Status

**Online (sincronizado):**
- Nenhum indicador aparece

**Offline:**
```
┌─────────────────────────────┐
│ 📴 Modo Offline       [2]  │
│ 2 formulários pendentes    │
│ Você pode continuar...     │
└─────────────────────────────┘
```

**Sincronizando:**
```
┌─────────────────────────────┐
│ 🌐 Online           [1]    │
│ 🔄 Sincronizando...        │
└─────────────────────────────┘
```

### Navegação

Quando há submissions pendentes, um botão "Pendentes" com badge aparece no header:

```
[Formulários]  [Pendentes (2)]
```

## 🔒 Segurança

### Dados Locais
- ✅ Isolados por domínio (same-origin policy)
- ✅ Não acessíveis por outros sites
- ✅ Criptografados pelo navegador (depende do SO)
- ⚠️ Limpam ao limpar dados do navegador
- ⚠️ Compartilhados entre usuários do mesmo computador

### Recomendações
- ✅ Use HTTPS em produção
- ✅ Implemente autenticação se necessário
- ⚠️ Não use em computadores públicos para dados sensíveis
- ⚠️ Avisar usuários sobre limpeza de dados do navegador

## 📚 Documentação Completa

- **[OFFLINE_QUICKSTART.md](./OFFLINE_QUICKSTART.md)** - Guia rápido de uso
- **[OFFLINE_FIRST.md](./OFFLINE_FIRST.md)** - Documentação técnica completa
- **[README.md](./README.md)** - Documentação geral do projeto
- **[API_EXAMPLES.md](./API_EXAMPLES.md)** - Exemplos de uso da API

## 🤝 Contribuindo

Contribuições são bem-vindas! Áreas de interesse:

- [ ] Background Sync API (sincronização em background real)
- [ ] Push Notifications (notificar quando sincronizar)
- [ ] Compressão de dados pendentes
- [ ] Criptografia local de dados sensíveis
- [ ] Sincronização seletiva
- [ ] Resolução de conflitos
- [ ] Testes automatizados de funcionalidade offline

Veja [CONTRIBUTING.md](./CONTRIBUTING.md) para mais detalhes.

## 📝 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](./LICENSE) para mais detalhes.

## 👥 Suporte

- 📧 Email: seu@email.com
- 🐛 Issues: [GitHub Issues](seu-repo/issues)
- 💬 Discussões: [GitHub Discussions](seu-repo/discussions)

---

**Desenvolvido com ❤️ para trabalhar em qualquer lugar, com ou sem internet!**

🌐 **Online** → Rápido e sincronizado
📴 **Offline** → Continua funcionando
🔄 **Sincroniza** → Automaticamente quando voltar







