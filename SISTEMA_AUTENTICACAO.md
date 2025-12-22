# Sistema de Autenticação e Gestão Hierárquica

## 📋 Visão Geral

O sistema Labore Forms agora possui um sistema completo de autenticação e gestão hierárquica com 4 níveis de usuário:

### Hierarquia do Sistema

```
                        EMPRESA
                           |
        _______________________________________
        |                  |                  |
     OBRA 1             OBRA 2            OBRA N
        |                  |                  |
    USUÁRIOS           USUÁRIOS          USUÁRIOS
        |                  |                  |
   FORMULÁRIOS        FORMULÁRIOS       FORMULÁRIOS
```

## 👥 Níveis de Usuário

### 1. SUPERADMIN (Superusuário)
- **Acesso Total**: Pode fazer tudo no sistema
- **Permissões**:
  - ✅ Criar, editar e excluir empresas
  - ✅ Criar, editar e excluir obras
  - ✅ Criar, editar e excluir usuários (de qualquer nível)
  - ✅ Criar e gerenciar formulários
  - ✅ Visualizar e gerenciar todas as respostas
  - ✅ Acesso a todas as empresas e obras

### 2. ADMIN (Administrador do Sistema)
- **Vinculado a UMA empresa específica**
- **Permissões**:
  - ✅ Criar, editar e excluir obras da sua empresa
  - ✅ Criar, editar e excluir usuários (ENGENHEIRO e LABORATORISTA) da sua empresa
  - ✅ Atribuir usuários às obras
  - ✅ Criar e gerenciar formulários
  - ✅ Visualizar todas as respostas da sua empresa
  - ❌ Não pode criar empresas
  - ❌ Não pode criar outros SUPERADMIN ou ADMIN

### 3. ENGENHEIRO
- **Vinculado a uma empresa e a obras específicas**
- **Permissões**:
  - ✅ Criar e editar formulários
  - ✅ Visualizar formulários e relatórios
  - ✅ Preencher formulários nas obras vinculadas
  - ✅ Visualizar respostas das obras vinculadas
  - ❌ Não pode gerenciar usuários ou obras

### 4. LABORATORISTA
- **Vinculado a uma empresa e a obras específicas**
- **Permissões**:
  - ✅ Preencher formulários nas obras vinculadas
  - ✅ Visualizar suas próprias respostas
  - ✅ Visualizar formulários disponíveis
  - ❌ Não pode criar formulários
  - ❌ Não pode gerenciar usuários ou obras

## 🔐 Credenciais Criadas no Seed

Após executar o seed (`npm run prisma:seed`), as seguintes credenciais estarão disponíveis:

### Superusuário
- **Email**: rhuann.nunes@tecpav.com
- **Senha**: Rh021197@
- **Acesso**: Total

### Administrador (Empresa TECPAV)
- **Email**: admin@tecpav.com
- **Senha**: admin123
- **Empresa**: TECPAV Engenharia

### Engenheiro
- **Email**: engenheiro@tecpav.com
- **Senha**: eng123
- **Empresa**: TECPAV Engenharia
- **Obras**: BR-101 e Viaduto Centro

### Laboratorista
- **Email**: laboratorista@tecpav.com
- **Senha**: lab123
- **Empresa**: TECPAV Engenharia
- **Obras**: BR-101

## 🚀 Como Usar

### 1. Iniciar o Sistema

```bash
# Backend
cd backend
npm run dev

# Frontend (em outro terminal)
cd frontend
npm run dev
```

### 2. Primeiro Acesso

1. Acesse: http://localhost:5173
2. Você será redirecionado para a tela de login
3. Use uma das credenciais acima
4. Será redirecionado para o Dashboard

### 3. Fluxo de Trabalho Típico

#### Como SUPERADMIN:
1. Login com rhuann.nunes@tecpav.com
2. Criar empresas em "Empresas"
3. Criar usuários ADMIN para cada empresa
4. O ADMIN gerenciará sua empresa

#### Como ADMIN:
1. Login com admin@tecpav.com
2. Criar obras da empresa em "Obras"
3. Criar usuários (Engenheiros e Laboratoristas) em "Usuários"
4. Vincular usuários às obras
5. Gerenciar formulários

#### Como ENGENHEIRO:
1. Login com engenheiro@tecpav.com
2. Criar formulários em "Formulários"
3. Preencher formulários nas obras vinculadas
4. Visualizar relatórios

#### Como LABORATORISTA:
1. Login com laboratorista@tecpav.com
2. Acessar "Respostas"
3. Preencher formulários das obras vinculadas
4. Visualizar suas respostas

## 🎯 Funcionalidades Principais

### Gestão de Empresas
- ➕ Criar nova empresa (apenas SUPERADMIN)
- ✏️ Editar dados da empresa
- 🗑️ Excluir empresa (cascata: remove obras e usuários)
- 📊 Visualizar estatísticas (obras e usuários)

### Gestão de Obras
- ➕ Criar nova obra
- ✏️ Editar dados da obra
- 🗑️ Excluir obra
- 👥 Vincular/desvincular usuários
- 📍 Status: Ativa, Pausada, Concluída, Cancelada

### Gestão de Usuários
- ➕ Criar novo usuário
- ✏️ Editar dados do usuário
- 🗑️ Excluir usuário
- 🔄 Alterar nível de acesso
- 🏢 Vincular a empresa
- 🏗️ Vincular a obras

### Gestão de Formulários
- ➕ Criar formulário com campos customizados
- ➕ Adicionar regras de cálculo/processamento
- ✏️ Editar formulário
- 📝 Preencher formulário (vinculado a uma obra)
- 📊 Visualizar respostas e resultados calculados

## 🔒 Segurança

### Autenticação
- JWT (JSON Web Token)
- Token válido por 7 dias
- Senha criptografada com bcrypt (10 rounds)
- Token armazenado no localStorage

### Autorização
- Middleware de autenticação em todas as rotas protegidas
- Verificação de permissões por role
- Verificação de acesso a empresa/obra antes de operações

### Validação
- Validação de dados com Zod no backend
- Validação de formulários no frontend
- Prevenção de injeção SQL com Prisma ORM

## 📡 API Endpoints

### Autenticação
- `POST /api/auth/login` - Login
- `GET /api/auth/me` - Dados do usuário autenticado
- `POST /api/auth/change-password` - Alterar senha

### Usuários
- `GET /api/users` - Listar usuários
- `GET /api/users/:id` - Obter usuário
- `POST /api/users` - Criar usuário
- `PUT /api/users/:id` - Atualizar usuário
- `DELETE /api/users/:id` - Excluir usuário

### Empresas
- `GET /api/companies` - Listar empresas
- `GET /api/companies/:id` - Obter empresa
- `POST /api/companies` - Criar empresa
- `PUT /api/companies/:id` - Atualizar empresa
- `DELETE /api/companies/:id` - Excluir empresa

### Obras/Projetos
- `GET /api/projects` - Listar obras
- `GET /api/projects/:id` - Obter obra
- `POST /api/projects` - Criar obra
- `PUT /api/projects/:id` - Atualizar obra
- `DELETE /api/projects/:id` - Excluir obra
- `POST /api/projects/:id/users` - Vincular usuário
- `DELETE /api/projects/:id/users/:userId` - Desvincular usuário

### Formulários
- As rotas de formulários existentes continuam funcionando
- Agora incluem informações de usuário criador e obra vinculada

## 🔄 Migrações Aplicadas

Nova migração: `20251217201725_add_auth_system`

**Modelos Adicionados:**
- Company (Empresa)
- Project (Obra/Projeto)
- User (Usuário)
- UserProject (Vínculo Usuário-Obra)

**Alterações em Modelos Existentes:**
- Form: adicionado `createdById`
- FormSubmission: adicionado `submittedById` e `projectId`

## 📚 Estrutura de Arquivos Backend

```
backend/
├── src/
│   ├── controllers/
│   │   ├── auth.controller.ts      # Autenticação
│   │   ├── user.controller.ts      # Gestão de usuários
│   │   ├── company.controller.ts   # Gestão de empresas
│   │   └── project.controller.ts   # Gestão de obras
│   ├── middleware/
│   │   └── auth.middleware.ts      # Auth e autorização
│   ├── routes/
│   │   ├── auth.routes.ts
│   │   ├── user.routes.ts
│   │   ├── company.routes.ts
│   │   └── project.routes.ts
│   ├── lib/
│   │   └── auth.ts                 # Funções de auth (JWT, bcrypt)
│   └── types/
│       └── express.d.ts            # Tipos TypeScript
├── prisma/
│   ├── schema.prisma               # Schema atualizado
│   └── seed.ts                     # Seed com dados de exemplo
```

## 📚 Estrutura de Arquivos Frontend

```
frontend/
├── src/
│   ├── pages/
│   │   ├── Login.tsx              # Página de login
│   │   ├── Dashboard.tsx          # Dashboard principal
│   │   ├── Companies.tsx          # Gestão de empresas
│   │   ├── Projects.tsx           # Gestão de obras
│   │   └── Users.tsx              # Gestão de usuários
│   ├── components/
│   │   └── ProtectedRoute.tsx     # Componente de rota protegida
│   ├── services/
│   │   ├── auth.ts                # Serviço de autenticação
│   │   └── api-client.ts          # Cliente API com auth
│   └── App.tsx                    # Rotas atualizadas
```

## 🐛 Solução de Problemas

### Erro: "Token inválido ou expirado"
- Faça logout e login novamente
- Verifique se o backend está rodando
- Verifique a variável JWT_SECRET no .env

### Erro: "Acesso negado"
- Verifique se seu usuário tem a permissão necessária
- Verifique se está vinculado à empresa/obra correta

### Erro: "Usuário não encontrado"
- Execute o seed novamente: `npm run prisma:seed`
- Verifique se o banco de dados está rodando

## 📝 Próximos Passos

- [ ] Implementar refresh token
- [ ] Adicionar logs de auditoria
- [ ] Implementar 2FA (autenticação de dois fatores)
- [ ] Adicionar fotos de perfil
- [ ] Implementar recuperação de senha por email
- [ ] Adicionar dashboard com gráficos e estatísticas
- [ ] Implementar notificações em tempo real

## 🎉 Conclusão

O sistema agora está completo com autenticação, hierarquia de usuários e controle de permissões robusto. Todos os níveis de usuário têm suas funcionalidades específicas e o acesso é controlado tanto no backend quanto no frontend.

**Desenvolvido com ❤️ para Labore Forms**





