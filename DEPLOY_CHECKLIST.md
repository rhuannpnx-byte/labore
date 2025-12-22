# ✅ Checklist de Deploy - Labore Backend

## 🔧 Correções Aplicadas

- ✅ **TypeScript configurado corretamente** (`types: ["node"]` adicionado)
- ✅ **Dependências de tipos movidas para production** (não serão ignoradas pelo Render)
- ✅ **Script de build otimizado** (Prisma Client gerado antes da compilação)
- ✅ **Tipos explícitos nos controllers** (erros TS7006 resolvidos)
- ✅ **Modelos Report adicionados ao schema Prisma** (Report, ReportElement, ReportGeneration)
- ✅ **Interface JWTPayload estendida** (adicionado campo `name`)
- ✅ **Tipo Request do Express estendido** (reconhece `req.user`)
- ✅ **Correções no report.controller** (`user.id` → `user.userId`)
- ✅ **Arquivo render.yaml criado** (configuração otimizada)

## 🚀 Próximos Passos

### 1. Fazer Commit das Mudanças

```bash
git add .
git commit -m "fix: correções TypeScript e otimizações para deploy no Render"
git push origin main
```

### 2. Configurar Variáveis de Ambiente no Render

No painel do Render, configure:

| Variável | Valor | Obrigatório |
|----------|-------|-------------|
| `DATABASE_URL` | URL do PostgreSQL | ✅ Sim |
| `JWT_SECRET` | Chave secreta (mín. 32 chars) | ✅ Sim |
| `JWT_EXPIRES_IN` | "7d" | ⚠️ Opcional |
| `NODE_ENV` | "production" | ⚠️ Opcional |

**Exemplo de DATABASE_URL:**
```
postgresql://usuario:senha@host:5432/nome_banco?sslmode=require
```

**Gerar JWT_SECRET:**
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### 3. Acionar o Deploy

- **Opção 1 (Automático):** O push para `main` acionará o deploy automaticamente
- **Opção 2 (Manual):** No Render Dashboard → "Manual Deploy" → "Deploy latest commit"

### 4. Acompanhar o Build

Verifique os logs em tempo real no Render:
- Deve aparecer: ✅ `added 130+ packages` (ou similar)
- Deve aparecer: ✅ `prisma generate` executado com sucesso
- Deve aparecer: ✅ `Generated Prisma Client` (com modelos Report)
- Deve aparecer: ✅ Build completed successfully

### 5. Executar Migrações do Banco

Após o deploy bem-sucedido, abra o Shell no Render:

```bash
npx prisma migrate deploy
```

### 6. (Opcional) Popular Dados Iniciais

Se precisar de dados de teste:

```bash
npm run prisma:seed --workspace=backend
```

### 7. Verificar o Deploy

Teste o endpoint de health check:

```bash
curl https://seu-app.onrender.com/api/health
```

**Resposta esperada:**
```json
{
  "status": "ok",
  "message": "Labore Forms API is running"
}
```

## 🔍 O Que Mudou?

### Arquivos Modificados:

1. **backend/package.json**
   - Types movidos para `dependencies`
   - Script build: `prisma generate && tsc`

2. **backend/tsconfig.json**
   - Adicionado: `"types": ["node"]`
   - Adicionado: `"noImplicitAny": true`
   - Incluído arquivo de tipos: `express.d.ts`

3. **backend/prisma/schema.prisma**
   - Adicionados modelos: Report, ReportElement, ReportGeneration
   - Relações com User, Project e Form

4. **backend/src/lib/auth.ts**
   - Tipo JWT_EXPIRES_IN explícito
   - Campo `name` adicionado ao JWTPayload

5. **backend/src/middleware/auth.middleware.ts**
   - Campo `name` incluído em req.user

6. **backend/src/types/express.d.ts (novo)**
   - Extensão do tipo Request do Express

7. **Controllers (5 arquivos)**
   - Tipos explícitos em funções map/filter
   - `user.id` → `user.userId` no report.controller

8. **render.yaml (novo)**
   - Configuração otimizada do Render
   - Build command correto para workspaces

## ⚠️ Problemas Comuns

### Build falha com "Cannot find module '@prisma/client'"
**Solução:** O script build agora executa `prisma generate` automaticamente ✅

### Build falha com "Cannot find name 'console'"
**Solução:** Adicionado `"types": ["node"]` no tsconfig.json ✅

### Build falha com erros de tipos do Express
**Solução:** `@types/express` movido para dependencies ✅

### Deploy funciona mas API retorna erro 500
**Causas possíveis:**
- ❌ DATABASE_URL não configurado
- ❌ Migrações não executadas
- ❌ JWT_SECRET não configurado

**Solução:** Configure as variáveis de ambiente e execute as migrações

## 📊 Arquitetura do Deploy

```
GitHub (main branch)
    ↓
Render detecta push
    ↓
npm install (instala TODAS as dependencies, incluindo types)
    ↓
prisma generate (gera Prisma Client)
    ↓
tsc (compila TypeScript → JavaScript)
    ↓
node dist/index.js (inicia servidor)
    ↓
API disponível em https://seu-app.onrender.com
```

## 🎯 Comandos Úteis

### Testar Build Localmente

```bash
cd backend
npm install
npm run build
npm start
```

### Ver Logs do Prisma

```bash
npx prisma studio
```

### Verificar Schema do Banco

```bash
npx prisma db pull
```

### Criar Nova Migration

```bash
npx prisma migrate dev --name nome_da_migration
```

## 📝 Notas Importantes

1. O Render usa **Node.js 22.16.0** (especificado no render.yaml)
2. O banco de dados deve ser **PostgreSQL** (não SQLite)
3. As migrações **não** são automáticas - execute manualmente após o deploy
4. O plano gratuito do Render hiberna após 15 minutos de inatividade
5. O primeiro acesso após hibernação pode demorar ~30 segundos

## 🆘 Suporte

Se o deploy ainda falhar:

1. **Copie os logs completos** do Render
2. **Verifique o commit** atual no GitHub
3. **Teste o build localmente** antes de fazer push
4. **Confirme as variáveis de ambiente** no Render Dashboard

## ✨ Sucesso!

Se tudo correu bem, você verá:

```
🚀 Server running on http://0.0.0.0:PORT
📝 API Documentation: http://0.0.0.0:PORT/api/health
```

Sua API estará disponível em:
- Health: `https://seu-app.onrender.com/api/health`
- Auth: `https://seu-app.onrender.com/api/auth`
- Forms: `https://seu-app.onrender.com/api/forms`
- Etc...

---

**Dúvidas?** Consulte `CORRECOES_DEPLOY.md` para detalhes técnicos completos.

