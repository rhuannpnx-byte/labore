# Correções para Deploy no Render

## Problemas Identificados

Durante o processo de deploy no Render, foram identificados os seguintes erros:

1. **Falta de tipos TypeScript**: Os pacotes `@types/express`, `@types/cors`, `@types/bcrypt`, `@types/jsonwebtoken` e `@types/node` não eram instalados em produção
2. **Erro "Cannot find name 'console'"**: TypeScript não reconhecia tipos do Node.js
3. **Parâmetros com tipo 'any' implícito**: Funções map/filter sem tipos explícitos
4. **Cliente Prisma não gerado**: O build falhava porque o Prisma Client não era gerado antes da compilação

## Soluções Implementadas

### 1. Movimentação de Dependências (backend/package.json)

**O que foi feito:**
- Movemos `typescript` e todos os `@types/*` de `devDependencies` para `dependencies`

**Por quê:**
- Em ambientes de produção, o Render executa `npm install` sem as `devDependencies`
- Como precisamos compilar o TypeScript no servidor, essas dependências são essenciais para o build

**Antes:**
```json
"devDependencies": {
  "@types/bcrypt": "^6.0.0",
  "@types/cors": "^2.8.17",
  "@types/express": "^4.17.21",
  "@types/jsonwebtoken": "^9.0.10",
  "@types/node": "^20.10.6",
  "typescript": "^5.3.3"
}
```

**Depois:**
```json
"dependencies": {
  "@types/bcrypt": "^6.0.0",
  "@types/cors": "^2.8.17",
  "@types/express": "^4.17.21",
  "@types/jsonwebtoken": "^9.0.10",
  "@types/node": "^20.10.6",
  "typescript": "^5.3.3",
  ...
}
```

### 2. Configuração do TypeScript (backend/tsconfig.json)

**O que foi feito:**
- Adicionamos `"types": ["node"]` nas `compilerOptions`
- Adicionamos `"noImplicitAny": true` para garantir tipagem estrita

**Por quê:**
- Garante que o TypeScript carregue as definições de tipos do Node.js (console, process, global, etc.)
- Força a especificação explícita de tipos, evitando erros de 'any' implícito

**Mudança:**
```json
{
  "compilerOptions": {
    "types": ["node"],
    "noImplicitAny": true,
    ...
  }
}
```

### 3. Correção de Tipos nos Controllers

**Arquivos modificados:**
- `backend/src/controllers/form.controller.ts`
- `backend/src/controllers/submission.controller.ts`
- `backend/src/controllers/project.controller.ts`
- `backend/src/controllers/report.controller.ts`

**O que foi feito:**
- Adicionamos tipos explícitos `(f: any)`, `(r: any)`, `(element: any)` em funções map/filter
- Usamos type assertions `(rule as any).name` onde o TypeScript não inferia o tipo corretamente

**Exemplos:**
```typescript
// Antes
form.fields.map(f => f.id)

// Depois
form.fields.map((f: any) => f.id)
```

### 4. Script de Build Otimizado (backend/package.json)

**O que foi feito:**
- Modificamos o script `build` para gerar o Prisma Client antes da compilação TypeScript

**Por quê:**
- O TypeScript precisa dos tipos gerados pelo Prisma (@prisma/client) durante a compilação
- Sem o cliente gerado, ocorrem erros de tipos ausentes

**Mudança:**
```json
{
  "scripts": {
    "build": "prisma generate && tsc"
  }
}
```

### 5. Arquivo de Configuração do Render (render.yaml)

**O que foi feito:**
- Criamos um arquivo `render.yaml` com configuração otimizada para o deploy

**Benefícios:**
- Especifica comandos de build e start corretos para workspaces npm
- Define variáveis de ambiente necessárias
- Configura health check endpoint
- Facilita redeploys futuros

## Como Fazer o Deploy

1. **Commit e Push das mudanças:**
```bash
git add .
git commit -m "fix: correções para deploy no Render"
git push origin main
```

2. **No Render Dashboard:**
   - O deploy será acionado automaticamente
   - Ou clique em "Manual Deploy" → "Deploy latest commit"

3. **Configurar Variáveis de Ambiente no Render:**
   - `DATABASE_URL`: URL do PostgreSQL (obrigatório)
   - `JWT_SECRET`: Segredo para tokens JWT (obrigatório)
   - `JWT_EXPIRES_IN`: Tempo de expiração do JWT (opcional, padrão: "7d")

## Verificação Pós-Deploy

Após o deploy bem-sucedido:

1. **Verifique o Health Check:**
```bash
curl https://seu-app.onrender.com/api/health
```

Deve retornar:
```json
{
  "status": "ok",
  "message": "Labore Forms API is running"
}
```

2. **Execute as Migrações do Banco:**
No Render Shell:
```bash
npx prisma migrate deploy
```

3. **Opcional - Popular dados iniciais:**
```bash
npm run prisma:seed --workspace=backend
```

## Resumo das Mudanças

| Arquivo | Mudança | Motivo |
|---------|---------|--------|
| `backend/package.json` | Types movidos para dependencies | Necessários para build em produção |
| `backend/package.json` | Script build atualizado | Gerar Prisma Client antes da compilação |
| `backend/tsconfig.json` | Adicionado `types: ["node"]` | Reconhecer tipos do Node.js |
| `backend/tsconfig.json` | Adicionado `noImplicitAny: true` | Forçar tipagem explícita |
| Controllers (vários) | Tipos explícitos em map/filter | Resolver erros TS7006 |
| `render.yaml` | Novo arquivo | Configuração otimizada do Render |

## Problemas Conhecidos e Soluções

### Erro: "Cannot find name 'console'"
**Solução:** Adicionado `"types": ["node"]` no tsconfig.json ✅

### Erro: "Could not find a declaration file for module 'express'"
**Solução:** Movido `@types/express` para dependencies ✅

### Erro: "Parameter 'f' implicitly has an 'any' type"
**Solução:** Adicionados tipos explícitos `(f: any)` ✅

### Erro: Build falha com erros do Prisma
**Solução:** Script build agora executa `prisma generate` primeiro ✅

## Suporte

Se encontrar problemas durante o deploy:

1. Verifique os logs do Render em tempo real
2. Confirme que todas as variáveis de ambiente estão configuradas
3. Execute o build localmente para testar: `cd backend && npm run build`
4. Verifique se o commit foi enviado para o branch correto (main)

---

**Data das correções:** 22 de dezembro de 2025  
**Versão do Node.js:** 22.16.0  
**Plataforma de Deploy:** Render.com

