# ✅ Checklist de Deploy - Sistema Labore no Railway

## 📦 Arquivos Criados/Atualizados

### Backend
- [x] `backend/.env.example` - Template de variáveis de ambiente
- [x] `backend/railway.json` - Configuração de build e deploy
- [x] `backend/package.json` - Scripts de produção atualizados
- [x] `backend/src/index.ts` - CORS configurado para produção

### Frontend
- [x] `frontend/.env.development` - Configuração de desenvolvimento
- [x] `frontend/.env.production` - Configuração de produção
- [x] `frontend/railway.json` - Configuração de build e deploy
- [x] `frontend/package.json` - Engines Node.js especificadas
- [x] `frontend/src/config/api.config.ts` - **NOVO** - Configuração dinâmica da API
- [x] `frontend/src/services/api.ts` - Atualizado para usar API_BASE_URL
- [x] `frontend/src/services/api-client.ts` - Atualizado para usar API_BASE_URL

### Raiz
- [x] `railway.toml` - Configuração geral do Railway
- [x] `.railwayignore` - Otimização de upload
- [x] `DEPLOY_RAILWAY.md` - **Guia completo de deploy**
- [x] `DEPLOY_CHECKLIST.md` - Este arquivo

## 🚀 Próximos Passos

### 1. Commit e Push
```bash
git add .
git commit -m "feat: Adicionar configurações de deploy para Railway"
git push
```

### 2. Seguir o Guia de Deploy
Abra o arquivo **[DEPLOY_RAILWAY.md](DEPLOY_RAILWAY.md)** e siga os passos:

1. ✅ Criar projeto no Railway
2. ✅ Criar banco PostgreSQL
3. ✅ Deploy do Backend
4. ✅ Deploy do Frontend
5. ✅ Configurar variáveis de ambiente
6. ✅ Testar a aplicação

## 📋 Variáveis de Ambiente Necessárias

### Backend Railway
```env
DATABASE_URL=${{Postgres.DATABASE_URL}}
JWT_SECRET=seu-secret-super-seguro-aqui
NODE_ENV=production
PORT=${{PORT}}
FRONTEND_URL=https://sua-url-frontend.railway.app
```

### Frontend Railway
```env
VITE_API_URL=https://sua-url-backend.railway.app/api
```

## ⚠️ Importante Antes do Deploy

1. **JWT_SECRET**: Gere um valor seguro, não use o valor de exemplo!
   ```bash
   node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
   ```

2. **VITE_API_URL**: Use a URL completa do backend **COM** `/api` no final

3. **FRONTEND_URL**: Use a URL completa do frontend para configurar CORS

## 🔍 Configurações Feitas

### Backend
- ✅ Scripts de build otimizados com Prisma
- ✅ Script `railway:build` que executa migrations
- ✅ CORS dinâmico baseado em `FRONTEND_URL`
- ✅ Healthcheck em `/api/health`

### Frontend
- ✅ Configuração de API dinâmica (dev/prod)
- ✅ Vite preview configurado para Railway
- ✅ Engines Node.js especificadas
- ✅ Build otimizado

## 📊 Estrutura de Deploy

```
Railway Project
├── PostgreSQL (Database)
│   └── Fornece DATABASE_URL automaticamente
│
├── Backend Service (backend/)
│   ├── Build: npm run railway:build
│   ├── Start: npm start
│   └── Health: /api/health
│
└── Frontend Service (frontend/)
    ├── Build: npm install && npm run build
    └── Start: npm run preview -- --host 0.0.0.0 --port $PORT
```

## ✅ Tudo Pronto!

Agora você pode:
1. Fazer commit das alterações
2. Abrir o **[DEPLOY_RAILWAY.md](DEPLOY_RAILWAY.md)**
3. Seguir o guia passo a passo
4. Deploy em ~15 minutos! 🚀

---

**Boa sorte com o deploy! 🎉**

