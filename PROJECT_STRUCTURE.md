# 📁 Estrutura do Projeto - Labore Forms

## 🗂️ Visão Geral

```
Labore/
├── backend/                    # Backend Node.js + Express
│   ├── prisma/                # Configuração do Prisma ORM
│   │   ├── schema.prisma      # Schema do banco de dados
│   │   └── seed.ts            # Dados de exemplo
│   ├── src/
│   │   ├── controllers/       # Controladores da API
│   │   │   ├── form.controller.ts
│   │   │   └── submission.controller.ts
│   │   ├── routes/            # Rotas da API
│   │   │   ├── form.routes.ts
│   │   │   └── submission.routes.ts
│   │   ├── lib/               # Bibliotecas e utilitários
│   │   │   ├── prisma.ts      # Cliente Prisma
│   │   │   └── formula-engine.ts  # Motor de fórmulas
│   │   └── index.ts           # Entrada da aplicação
│   ├── .env                   # Variáveis de ambiente
│   ├── package.json
│   └── tsconfig.json
│
├── frontend/                  # Frontend React + TypeScript
│   ├── src/
│   │   ├── components/        # Componentes reutilizáveis
│   │   │   └── Layout.tsx     # Layout principal
│   │   ├── pages/             # Páginas da aplicação
│   │   │   ├── FormsList.tsx      # Lista de formulários
│   │   │   ├── FormBuilder.tsx    # Criar/editar formulário
│   │   │   ├── FormView.tsx       # Visualizar formulário
│   │   │   ├── FormFill.tsx       # Preencher formulário
│   │   │   ├── SubmissionsList.tsx    # Lista de respostas
│   │   │   └── SubmissionView.tsx     # Ver resposta
│   │   ├── services/          # Serviços de API
│   │   │   └── api.ts         # Cliente HTTP
│   │   ├── types/             # Tipos TypeScript
│   │   │   └── index.ts       # Definições de tipos
│   │   ├── App.tsx            # Componente raiz
│   │   ├── main.tsx           # Entrada da aplicação
│   │   └── index.css          # Estilos globais
│   ├── index.html
│   ├── package.json
│   ├── tsconfig.json
│   └── vite.config.ts
│
├── .gitignore
├── docker-compose.yml         # Docker para PostgreSQL
├── package.json               # Workspaces raiz
├── README.md                  # Documentação principal
├── SETUP.md                   # Guia de instalação
├── QUICKSTART.md             # Início rápido
├── FEATURES.md               # Funcionalidades detalhadas
├── API_EXAMPLES.md           # Exemplos de API
└── PROJECT_STRUCTURE.md      # Este arquivo
```

## 🔍 Detalhamento dos Arquivos

### Backend

#### `prisma/schema.prisma`
**Propósito**: Define o schema do banco de dados
- Models: Form, FormField, ProcessingRule, FormSubmission, etc.
- Relações entre tabelas
- Enums para tipos e status

#### `src/lib/formula-engine.ts`
**Propósito**: Motor de processamento de fórmulas
- **Métodos principais:**
  - `evaluate()` - Avalia fórmula com valores
  - `validate()` - Valida sintaxe da fórmula
  - `extractFieldReferences()` - Extrai campos referenciados
- Usa mathjs para cálculos matemáticos

#### `src/controllers/form.controller.ts`
**Propósito**: Lógica de negócio para formulários
- **Endpoints:**
  - Listar, criar, atualizar, deletar formulários
  - Gerenciar campos (CRUD)
  - Gerenciar regras (CRUD)
  - Validar fórmulas

#### `src/controllers/submission.controller.ts`
**Propósito**: Lógica de negócio para submissões
- **Endpoints:**
  - Criar submissões (com cálculo automático)
  - Listar submissões
  - Ver detalhes
  - Estatísticas

#### `src/routes/*.routes.ts`
**Propósito**: Definição de rotas HTTP
- Mapeia endpoints para controllers
- Define métodos HTTP (GET, POST, PUT, DELETE)

#### `src/lib/prisma.ts`
**Propósito**: Cliente singleton do Prisma
- Configuração global
- Logs em desenvolvimento
- Reuso de conexão

### Frontend

#### `src/types/index.ts`
**Propósito**: Definições de tipos TypeScript
- Interfaces para Form, FormField, ProcessingRule
- Tipos de dados da API
- DTOs para criação/atualização

#### `src/services/api.ts`
**Propósito**: Cliente HTTP para API
- Configuração do axios
- Funções tipadas para cada endpoint
- Base URL configurável

#### `src/components/Layout.tsx`
**Propósito**: Layout principal da aplicação
- Header com navegação
- Container para conteúdo
- Footer

#### `src/pages/FormsList.tsx`
**Propósito**: Página de listagem
- Mostra todos os formulários
- Cards com informações resumidas
- Ações: Visualizar, Editar, Excluir

#### `src/pages/FormBuilder.tsx`
**Propósito**: Criação/edição de formulários
- **Funcionalidades:**
  - Editar informações básicas
  - Adicionar/remover campos
  - Adicionar/remover regras
  - Validar fórmulas em tempo real

#### `src/pages/FormView.tsx`
**Propósito**: Visualização detalhada
- Mostra todos os campos
- Mostra todas as regras
- Estatísticas do formulário
- Links para preencher ou ver respostas

#### `src/pages/FormFill.tsx`
**Propósito**: Preenchimento do formulário
- Renderiza campos dinamicamente
- Validação no cliente
- Submit e processamento automático

#### `src/pages/SubmissionsList.tsx`
**Propósito**: Lista de respostas
- Todas as submissões de um formulário
- Data/hora de cada resposta
- Link para ver detalhes

#### `src/pages/SubmissionView.tsx`
**Propósito**: Detalhes da resposta
- Mostra todas as respostas
- Mostra resultados calculados
- Destaque visual para resultados

#### `src/index.css`
**Propósito**: Estilos globais
- CSS Variables para tema
- Classes utilitárias (btn, card, input, etc)
- Estilos base

## 🔄 Fluxo de Dados

### Criar e Preencher Formulário

```
1. Usuário cria formulário
   Frontend (FormBuilder) → POST /api/forms → Backend → Database

2. Usuário adiciona campos
   Frontend (FormBuilder) → POST /api/forms/:id/fields → Backend → Database

3. Usuário adiciona regras
   Frontend (FormBuilder) → POST /api/forms/:id/rules → Backend → Database
   Backend valida fórmula usando FormulaEngine

4. Usuário preenche formulário
   Frontend (FormFill) → POST /api/submissions → Backend
   Backend:
   - Valida campos obrigatórios
   - Salva respostas
   - Calcula regras usando FormulaEngine
   - Salva resultados
   → Database

5. Usuário visualiza resposta
   Frontend (SubmissionView) → GET /api/submissions/:id → Backend → Database
   Mostra respostas + resultados calculados
```

## 🎨 Padrões de Design Utilizados

### Backend
- **MVC Pattern**: Controllers, Routes, Models (Prisma)
- **Singleton**: Prisma Client
- **Strategy Pattern**: Formula Engine
- **Repository Pattern**: Prisma ORM

### Frontend
- **Component-Based**: React components
- **Container/Presenter**: Pages (containers) e Components (presenters)
- **Service Layer**: api.ts centraliza chamadas HTTP
- **Type Safety**: TypeScript em todo o código

## 📦 Dependências Principais

### Backend
- **express**: Framework web
- **@prisma/client**: ORM database
- **zod**: Validação de schemas
- **mathjs**: Cálculos matemáticos
- **typescript**: Type safety
- **tsx**: Executar TypeScript

### Frontend
- **react**: UI library
- **react-router-dom**: Roteamento
- **axios**: Cliente HTTP
- **lucide-react**: Ícones
- **date-fns**: Manipulação de datas
- **vite**: Build tool
- **typescript**: Type safety

## 🗄️ Banco de Dados

### Tabelas (Models)

1. **forms**
   - Armazena formulários
   - Campos: id, title, description, status, timestamps

2. **form_fields**
   - Campos de cada formulário
   - Campos: id, formId, label, fieldKey, type, required, order, config

3. **processing_rules**
   - Regras de processamento
   - Campos: id, formId, name, ruleKey, formula, order

4. **form_submissions**
   - Submissões dos formulários
   - Campos: id, formId, submittedAt

5. **field_responses**
   - Respostas individuais
   - Campos: id, submissionId, fieldId, value

6. **processing_results**
   - Resultados calculados
   - Campos: id, submissionId, ruleId, result, calculatedAt

### Relações
```
Form (1) ─────< (N) FormField
Form (1) ─────< (N) ProcessingRule
Form (1) ─────< (N) FormSubmission
FormSubmission (1) ─────< (N) FieldResponse
FormSubmission (1) ─────< (N) ProcessingResult
FormField (1) ─────< (N) FieldResponse
ProcessingRule (1) ─────< (N) ProcessingResult
```

## 🚀 Scripts Disponíveis

### Raiz
```json
{
  "dev": "Inicia backend e frontend juntos",
  "dev:backend": "Inicia apenas backend",
  "dev:frontend": "Inicia apenas frontend",
  "install:all": "Instala todas as dependências"
}
```

### Backend
```json
{
  "dev": "Desenvolvimento com hot reload",
  "build": "Compila TypeScript",
  "start": "Executa versão compilada",
  "prisma:generate": "Gera Prisma Client",
  "prisma:migrate": "Executa migrations",
  "prisma:studio": "Abre Prisma Studio",
  "prisma:seed": "Popula banco com dados"
}
```

### Frontend
```json
{
  "dev": "Desenvolvimento com hot reload",
  "build": "Build para produção",
  "preview": "Preview da build"
}
```

## 🔐 Variáveis de Ambiente

### Backend (.env)
```env
DATABASE_URL="postgresql://user:password@localhost:5432/db?schema=public"
PORT=3000
NODE_ENV=development
```

## 📊 Métricas do Projeto

- **Linguagens**: TypeScript (100%)
- **Total de arquivos**: ~30
- **Linhas de código**: ~3500+
- **Componentes React**: 7
- **API Endpoints**: ~20
- **Database Tables**: 6
- **Tipos TypeScript**: 10+

## 🎯 Arquitetura

```
┌─────────────┐
│   Browser   │
└─────┬───────┘
      │ HTTP
┌─────▼───────┐
│   Vite Dev  │ (Frontend)
│   Server    │ Port 5173
└─────┬───────┘
      │ Proxy /api
┌─────▼───────┐
│   Express   │ (Backend)
│   Server    │ Port 3000
└─────┬───────┘
      │ Prisma
┌─────▼───────┐
│ PostgreSQL  │ (Database)
│   Database  │ Port 5432
└─────────────┘
```

## 🔮 Extensibilidade

A arquitetura foi projetada para fácil extensão:

1. **Novos tipos de campos**: Adicionar em enum + lógica de renderização
2. **Novas funções matemáticas**: mathjs já suporta várias
3. **Validações customizadas**: Adicionar em controllers
4. **Novos endpoints**: Criar em routes + controllers
5. **Novos módulos**: Adicionar pasta em pages/

## 📝 Boas Práticas Implementadas

- ✅ TypeScript para type safety
- ✅ Separação de concerns (MVC)
- ✅ Validação em ambos os lados (cliente + servidor)
- ✅ ORM para abstração do banco
- ✅ Componentização no frontend
- ✅ API RESTful
- ✅ Tratamento de erros
- ✅ Código documentado
- ✅ Seeds para desenvolvimento
- ✅ Docker para facilitar setup

---

**Próximos passos para evolução:**
- Testes unitários e e2e
- CI/CD pipeline
- Autenticação e autorização
- Rate limiting
- Caching
- Websockets para real-time
- PWA para offline




