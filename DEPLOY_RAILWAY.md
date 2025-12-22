# 🚀 Guia de Deploy no Railway - Sistema Labore

Este guia explica como fazer o deploy completo do sistema Labore no Railway com 3 serviços separados: Backend, Frontend e PostgreSQL.

## 📋 Pré-requisitos

- Conta no Railway ([railway.app](https://railway.app))
- Git instalado e projeto commitado
- Repositório Git (GitHub, GitLab ou Bitbucket)

## 🏗️ Arquitetura de Deploy

```
┌─────────────────┐
│   Frontend      │ ──→ Vite Build (Static Site)
│   (React/Vite)  │     Porta: Automática
└────────┬────────┘
         │ API Calls
         ↓
┌─────────────────┐
│   Backend       │ ──→ Express + Prisma
│   (Node.js)     │     Porta: $PORT (Railway)
└────────┬────────┘
         │ Database Connection
         ↓
┌─────────────────┐
│   PostgreSQL    │ ──→ Banco Gerenciado
│   (Railway)     │     DATABASE_URL automático
└─────────────────┘
```

## 🔧 Passo 1: Preparar o Projeto

Os arquivos de configuração já foram criados:

### Backend
- ✅ `backend/.env.example` - Template de variáveis
- ✅ `backend/railway.json` - Configuração de build
- ✅ `backend/package.json` - Scripts atualizados

### Frontend
- ✅ `frontend/.env.production` - Configuração de produção
- ✅ `frontend/railway.json` - Configuração de build
- ✅ `frontend/src/config/api.config.ts` - URL dinâmica da API

### Raiz
- ✅ `railway.toml` - Configuração geral
- ✅ `.railwayignore` - Otimização de upload

## 📦 Passo 2: Criar Projeto no Railway

### 2.1. Acessar o Railway

1. Acesse [railway.app](https://railway.app)
2. Faça login com sua conta
3. Clique em **"New Project"**

### 2.2. Criar o Banco de Dados PostgreSQL

1. No novo projeto, clique em **"+ New"**
2. Selecione **"Database"** → **"PostgreSQL"**
3. Aguarde a criação (1-2 minutos)
4. ✅ O Railway criará automaticamente a variável `DATABASE_URL`

## 🔨 Passo 3: Deploy do Backend

### 3.1. Adicionar o Backend

1. No mesmo projeto, clique em **"+ New"**
2. Selecione **"GitHub Repo"** (ou GitLab/Bitbucket)
3. Selecione o repositório **Labore**
4. **IMPORTANTE**: Configure o **Root Directory** para `backend`

### 3.2. Configurar Variáveis de Ambiente

Na aba **"Variables"** do serviço Backend, adicione:

```env
# Database (já deve existir automaticamente)
DATABASE_URL=${{Postgres.DATABASE_URL}}

# JWT Secret - MUDE ESTE VALOR!
JWT_SECRET=seu-secret-jwt-super-seguro-aqui-minimo-32-caracteres

# Configuração do servidor
NODE_ENV=production
PORT=${{PORT}}

# Frontend URL - deixe vazio por enquanto, atualizaremos depois
FRONTEND_URL=
```

### 3.3. Configurar Build e Start

O Railway detectará automaticamente o `railway.json`, mas você pode verificar:

- **Build Command**: `npm run railway:build`
- **Start Command**: `npm start`
- **Healthcheck Path**: `/api/health`

### 3.4. Deploy

1. O deploy iniciará automaticamente
2. Aguarde a conclusão (3-5 minutos)
3. Anote a **URL gerada** (algo como `https://backend-production-xxxx.up.railway.app`)

### 3.5. Testar o Backend

Acesse no navegador:
```
https://sua-url-backend.railway.app/api/health
```

Deve retornar:
```json
{
  "status": "ok",
  "message": "Labore Forms API is running"
}
```

## 🎨 Passo 4: Deploy do Frontend

### 4.1. Adicionar o Frontend

1. No mesmo projeto, clique em **"+ New"**
2. Selecione **"GitHub Repo"**
3. Selecione o mesmo repositório **Labore**
4. **IMPORTANTE**: Configure o **Root Directory** para `frontend`

### 4.2. Configurar Variáveis de Ambiente

Na aba **"Variables"** do serviço Frontend, adicione:

```env
# URL do Backend (use a URL do passo 3.4)
VITE_API_URL=https://sua-url-backend.railway.app/api
```

**⚠️ IMPORTANTE**: Use a URL completa do backend **COM** `/api` no final!

### 4.3. Configurar Build

O Railway detectará automaticamente, mas verifique:

- **Build Command**: `npm install && npm run build`
- **Start Command**: `npm run preview -- --host 0.0.0.0 --port $PORT`

### 4.4. Deploy

1. O deploy iniciará automaticamente
2. Aguarde a conclusão (2-3 minutos)
3. Anote a **URL gerada** (algo como `https://frontend-production-xxxx.up.railway.app`)

## 🔄 Passo 5: Atualizar CORS no Backend

Agora que temos a URL do frontend, precisamos atualizá-la no backend:

1. Volte ao serviço **Backend**
2. Na aba **"Variables"**, atualize:
   ```env
   FRONTEND_URL=https://sua-url-frontend.railway.app
   ```
3. Salve - o Railway fará redeploy automaticamente

## ✅ Passo 6: Testar a Aplicação

### 6.1. Acessar o Frontend

Abra a URL do frontend no navegador:
```
https://sua-url-frontend.railway.app
```

### 6.2. Criar Conta de Teste

1. Acesse a página de registro
2. Crie uma conta de teste
3. Faça login

### 6.3. Verificar Funcionalidades

- ✅ Login/Logout
- ✅ Criar empresa
- ✅ Criar obra
- ✅ Criar formulário
- ✅ Preencher formulário
- ✅ Ver respostas

## 🔍 Passo 7: Monitoramento

### Logs do Backend

1. Acesse o serviço Backend no Railway
2. Clique na aba **"Deployments"**
3. Clique no último deployment
4. Veja os logs em tempo real

### Logs do Frontend

1. Acesse o serviço Frontend no Railway
2. Mesmos passos acima

### Banco de Dados

1. Acesse o serviço PostgreSQL
2. Na aba **"Data"**, você pode ver as tabelas
3. Ou use a aba **"Connect"** para conectar via client local

## 🔐 Configurações Importantes de Segurança

### 1. JWT Secret

⚠️ **NUNCA use valores padrão em produção!**

Gere um JWT Secret seguro:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### 2. Variáveis de Ambiente

Todas as variáveis sensíveis devem estar **APENAS** no Railway, nunca no código.

### 3. CORS

Certifique-se de que `FRONTEND_URL` está corretamente configurada no backend.

## 🎯 URLs Finais

Após o deploy completo, você terá:

| Serviço | URL | Descrição |
|---------|-----|-----------|
| Frontend | `https://frontend-xxxxx.railway.app` | Interface do usuário |
| Backend | `https://backend-xxxxx.railway.app` | API REST |
| Database | `postgresql://...` | PostgreSQL (interno) |

## 🔄 Atualizações Futuras

### Deploy Automático

O Railway está configurado para **deploy automático**:

1. Faça suas alterações no código
2. Commit e push para o repositório
3. Railway detectará e fará deploy automaticamente

### Deploy Manual

Se precisar fazer deploy manual:

```bash
# Instalar Railway CLI
npm install -g @railway/cli

# Login
railway login

# Link com o projeto
railway link

# Deploy do backend
railway up -s backend

# Deploy do frontend
railway up -s frontend
```

## 🐛 Troubleshooting

### Backend não inicia

1. Verifique os logs do deployment
2. Confirme que `DATABASE_URL` existe
3. Verifique se as migrations rodaram:
   ```bash
   railway run -s backend npx prisma migrate deploy
   ```

### Frontend não conecta no Backend

1. Verifique se `VITE_API_URL` está correto
2. Deve incluir `/api` no final
3. Verifique CORS no backend (deve ter `FRONTEND_URL`)

### Erro 502/503

1. Aguarde alguns minutos (serviço iniciando)
2. Verifique se a porta está configurada como `$PORT`
3. Verifique os logs do serviço

### Database Connection Failed

1. Verifique se `DATABASE_URL` está configurada
2. Tente conectar ao PostgreSQL do Railway:
   ```bash
   railway connect -s postgres
   ```

## 📊 Custos Estimados

### Plano Grátis (Trial)
- **$5/mês** de crédito grátis
- Suficiente para testes e desenvolvimento
- Serviços dormem após inatividade

### Plano Hobby ($5/mês)
- **$5/mês** + uso
- ~$0.000463/min de execução
- Sem sleep em inatividade
- Ideal para produção pequena/média

### Estimativa de Uso Mensal

| Componente | Custo Estimado |
|------------|----------------|
| Backend (1 instância) | ~$10-15/mês |
| Frontend (1 instância) | ~$5-10/mês |
| PostgreSQL | ~$5-10/mês |
| **Total** | **~$20-35/mês** |

## 🎉 Pronto!

Seu sistema Labore está agora rodando em produção no Railway! 🚀

### Próximos Passos

1. 📱 Configure um domínio customizado (opcional)
2. 📧 Configure envio de emails (se necessário)
3. 📊 Configure monitoramento (Sentry, LogRocket, etc)
4. 🔒 Configure backup do banco de dados
5. 📈 Configure analytics (Google Analytics, etc)

## 📞 Suporte

- Railway Docs: [docs.railway.app](https://docs.railway.app)
- Railway Discord: [railway.app/discord](https://railway.app/discord)
- Railway Status: [status.railway.app](https://status.railway.app)

---

**Desenvolvido com ❤️ para o Sistema Labore**

