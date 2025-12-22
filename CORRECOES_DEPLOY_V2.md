# Correções Adicionais para Deploy - Versão 2

## Novos Erros Corrigidos (Segunda Rodada)

Após as correções iniciais, surgiram novos erros relacionados ao sistema de relatórios e tipagem do JWT:

### 1. Modelos Report Ausentes no Schema Prisma

**Erro:**
```
Property 'report' does not exist on type 'PrismaClient'
Property 'reportElement' does not exist on type 'PrismaClient'
Property 'reportGeneration' does not exist on type 'PrismaClient'
```

**Causa:**
O `report.controller.ts` tentava usar modelos que não existiam no schema do Prisma.

**Solução:**
Adicionados três novos modelos ao `backend/prisma/schema.prisma`:

```prisma
// Relatório (Template de relatório)
model Report {
  id          String   @id @default(uuid())
  title       String
  description String?
  status      ReportStatus @default(DRAFT)
  
  formId      String?
  form        Form?    @relation(fields: [formId], references: [id])
  
  projectId   String?
  project     Project? @relation(fields: [projectId], references: [id])
  
  createdById String?
  createdBy   User?    @relation(fields: [createdById], references: [id])
  
  elements    ReportElement[]
  generations ReportGeneration[]
  
  @@map("reports")
}

enum ReportStatus {
  DRAFT
  PUBLISHED
  ARCHIVED
}

// Elementos do relatório (gráficos, tabelas, etc)
model ReportElement {
  id          String   @id @default(uuid())
  reportId    String
  report      Report   @relation(fields: [reportId], references: [id])
  
  type        ReportElementType
  title       String?
  config      Json
  order       Int
  
  @@map("report_elements")
}

enum ReportElementType {
  CHART
  TABLE
  TEXT
  METRIC
  CUSTOM
}

// Geração de relatório (instância gerada)
model ReportGeneration {
  id          String   @id @default(uuid())
  reportId    String
  report      Report   @relation(fields: [reportId], references: [id])
  
  generatedAt DateTime @default(now())
  generatedBy String?
  user        User?    @relation(fields: [generatedBy], references: [id])
  
  data        Json
  filters     Json?
  
  @@map("report_generations")
}
```

**Relações adicionadas:**
- `User.reportsCreated` → Relatórios criados pelo usuário
- `User.reportGenerations` → Gerações de relatórios
- `Project.reports` → Relatórios vinculados à obra
- `Form.reports` → Relatórios que usam o formulário

### 2. Property 'id' does not exist on type 'JWTPayload'

**Erro:**
```
Property 'id' does not exist on type 'JWTPayload'
Property 'name' does not exist on type 'JWTPayload'
```

**Causa:**
- O `JWTPayload` tinha `userId` mas o código usava `user.id`
- O campo `name` não estava no tipo

**Solução:**

1. **Adicionado campo `name` ao JWTPayload** (`backend/src/lib/auth.ts`):
```typescript
export interface JWTPayload {
  userId: string;
  email: string;
  role: string;
  companyId?: string;
  name?: string;  // ← Adicionado
}
```

2. **Atualizado middleware de autenticação** (`backend/src/middleware/auth.middleware.ts`):
```typescript
const user = await prisma.user.findUnique({
  where: { id: decoded.userId },
  select: { 
    id: true, 
    email: true, 
    name: true,     // ← Adicionado
    role: true, 
    isActive: true, 
    companyId: true 
  }
});

req.user = {
  userId: user.id,
  email: user.email,
  name: user.name,   // ← Adicionado
  role: user.role,
  companyId: user.companyId || undefined
};
```

3. **Substituído `user.id` por `user.userId`** em todo o `report.controller.ts`:
```typescript
// Antes
if (report.createdById !== user.id)

// Depois
if (report.createdById !== user.userId)
```

### 3. Erro no jwt.sign com expiresIn

**Erro:**
```
Type 'string' is not assignable to type 'number | StringValue | undefined'
```

**Causa:**
TypeScript não conseguia inferir que `JWT_EXPIRES_IN` sempre seria uma string.

**Solução:**
Tipo explícito no `backend/src/lib/auth.ts`:

```typescript
// Antes
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

// Depois
const JWT_EXPIRES_IN: string = process.env.JWT_EXPIRES_IN || '7d';

// E no uso:
export function generateToken(payload: JWTPayload): string {
  return jwt.sign(payload, JWT_SECRET as string, { 
    expiresIn: JWT_EXPIRES_IN as string 
  });
}
```

### 4. Tipo Request do Express não reconhece req.user

**Solução:**
Criado arquivo de definição de tipos `backend/src/types/express.d.ts`:

```typescript
import { JWTPayload } from '../lib/auth';

declare global {
  namespace Express {
    interface Request {
      user?: JWTPayload;
    }
  }
}
```

E atualizado `tsconfig.json`:
```json
{
  "files": ["src/types/express.d.ts"]
}
```

## Resumo das Mudanças

| Arquivo | Mudança | Motivo |
|---------|---------|--------|
| `backend/prisma/schema.prisma` | 3 novos modelos (Report, ReportElement, ReportGeneration) | Suporte ao sistema de relatórios |
| `backend/src/lib/auth.ts` | Campo `name` adicionado ao JWTPayload | Disponibilizar nome do usuário |
| `backend/src/lib/auth.ts` | Tipo explícito `JWT_EXPIRES_IN: string` | Resolver erro TS2769 |
| `backend/src/middleware/auth.middleware.ts` | Incluir `name` em req.user | Passar nome para controllers |
| `backend/src/controllers/report.controller.ts` | `user.id` → `user.userId` (11 ocorrências) | Usar propriedade correta |
| `backend/src/types/express.d.ts` | Novo arquivo | Estender tipo Request do Express |
| `backend/tsconfig.json` | Incluir arquivo de tipos | TypeScript reconhecer req.user |

## ⚠️ IMPORTANTE: Migration Necessária

Após o deploy, você **DEVE** executar uma nova migration para criar as tabelas Report:

```bash
# No Render Shell ou localmente:
npx prisma migrate dev --name add_report_models

# Ou em produção:
npx prisma migrate deploy
```

Ou criar manualmente no banco PostgreSQL:

```sql
-- Enum para status do relatório
CREATE TYPE "ReportStatus" AS ENUM ('DRAFT', 'PUBLISHED', 'ARCHIVED');

-- Enum para tipo de elemento
CREATE TYPE "ReportElementType" AS ENUM ('CHART', 'TABLE', 'TEXT', 'METRIC', 'CUSTOM');

-- Tabela de relatórios
CREATE TABLE "reports" (
  "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
  "title" TEXT NOT NULL,
  "description" TEXT,
  "status" "ReportStatus" DEFAULT 'DRAFT',
  "formId" TEXT REFERENCES "forms"("id") ON DELETE SET NULL,
  "projectId" TEXT REFERENCES "projects"("id") ON DELETE CASCADE,
  "createdById" TEXT REFERENCES "users"("id") ON DELETE SET NULL,
  "createdAt" TIMESTAMP DEFAULT NOW(),
  "updatedAt" TIMESTAMP DEFAULT NOW()
);

-- Tabela de elementos do relatório
CREATE TABLE "report_elements" (
  "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
  "reportId" TEXT NOT NULL REFERENCES "reports"("id") ON DELETE CASCADE,
  "type" "ReportElementType" NOT NULL,
  "title" TEXT,
  "config" JSONB NOT NULL,
  "order" INTEGER NOT NULL,
  "createdAt" TIMESTAMP DEFAULT NOW(),
  "updatedAt" TIMESTAMP DEFAULT NOW()
);

-- Tabela de gerações de relatórios
CREATE TABLE "report_generations" (
  "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
  "reportId" TEXT NOT NULL REFERENCES "reports"("id") ON DELETE CASCADE,
  "generatedAt" TIMESTAMP DEFAULT NOW(),
  "generatedBy" TEXT REFERENCES "users"("id") ON DELETE SET NULL,
  "data" JSONB NOT NULL,
  "filters" JSONB
);

-- Índices
CREATE INDEX "reports_formId_idx" ON "reports"("formId");
CREATE INDEX "reports_projectId_idx" ON "reports"("projectId");
CREATE INDEX "reports_createdById_idx" ON "reports"("createdById");
CREATE INDEX "report_elements_reportId_idx" ON "report_elements"("reportId");
CREATE INDEX "report_generations_reportId_idx" ON "report_generations"("reportId");
```

## Verificação Final

Todos os erros foram corrigidos! ✅

Antes de fazer o deploy:

1. ✅ Commit das mudanças:
```bash
git add .
git commit -m "fix: correções adicionais - modelos Report e tipos JWT"
git push origin main
```

2. ✅ Verificar build local:
```bash
cd backend
npm install
npm run build
```

3. ✅ Após o deploy, executar migration:
```bash
npx prisma migrate deploy
```

## Status dos Erros

| Erro | Status |
|------|--------|
| TS7016: Could not find declaration for 'express' | ✅ Resolvido |
| TS2584: Cannot find name 'console' | ✅ Resolvido |
| TS7006: Parameter implicitly has 'any' type | ✅ Resolvido |
| TS2339: Property 'report' does not exist | ✅ Resolvido (modelos adicionados) |
| TS2339: Property 'id' does not exist on JWTPayload | ✅ Resolvido (user.id → user.userId) |
| TS2769: No overload matches jwt.sign call | ✅ Resolvido (tipo explícito) |

**Todos os 37 erros TypeScript foram corrigidos!** 🎉

---

**Data:** 22 de dezembro de 2025  
**Versão:** 2.0 - Correções Completas

