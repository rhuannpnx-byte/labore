# 🚀 Guia Rápido - Sistema de Autenticação

## ⚡ Início Rápido (5 minutos)

### 1. Iniciar o Sistema

```bash
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend  
cd frontend
npm run dev
```

### 2. Acessar o Sistema

1. Abra o navegador em: **http://localhost:5173**
2. Você verá a tela de login

### 3. Fazer Login

Use uma das credenciais de teste:

**SUPERADMIN (Acesso Total)**
- Email: `rhuann.nunes@tecpav.com`
- Senha: `Rh021197@`

**ADMIN (Gerente da Empresa)**
- Email: `admin@tecpav.com`
- Senha: `admin123`

**ENGENHEIRO**
- Email: `engenheiro@tecpav.com`
- Senha: `eng123`

**LABORATORISTA**
- Email: `laboratorista@tecpav.com`
- Senha: `lab123`

## 📊 O Que Cada Usuário Pode Fazer

### 🔴 SUPERADMIN
Dashboard mostra:
- ✅ Empresas
- ✅ Obras
- ✅ Usuários
- ✅ Formulários
- ✅ Respostas

### 🟣 ADMIN (Administrador da Empresa)
Dashboard mostra:
- ✅ Obras (da sua empresa)
- ✅ Usuários (da sua empresa)
- ✅ Formulários
- ✅ Respostas

### 🔵 ENGENHEIRO
Dashboard mostra:
- ✅ Formulários (criar e editar)
- ✅ Respostas (das obras vinculadas)

### 🟢 LABORATORISTA
Dashboard mostra:
- ✅ Respostas (preencher e visualizar)

## 🎯 Cenários de Uso

### Cenário 1: Criar uma Nova Empresa e Obra

1. Login como **SUPERADMIN** (rhuann.nunes@tecpav.com)
2. Clique em "Empresas"
3. Clique em "Nova Empresa"
4. Preencha os dados e salve
5. Clique em "Obras"
6. Clique em "Nova Obra"
7. Selecione a empresa criada
8. Preencha os dados e salve

### Cenário 2: Criar um Usuário ADMIN para a Empresa

1. Login como **SUPERADMIN**
2. Clique em "Usuários"
3. Clique em "Novo Usuário"
4. Preencha:
   - Nome
   - Email
   - Senha
   - Função: **Administrador**
   - Empresa: Selecione a empresa
5. Salve

Agora esse usuário pode gerenciar a empresa dele!

### Cenário 3: ADMIN Cria Usuários e Vincula a Obras

1. Login como **ADMIN** (admin@tecpav.com)
2. Clique em "Obras" e crie uma nova obra
3. Clique em "Usuários" e crie um Engenheiro
4. Ao criar, selecione as obras que ele pode acessar
5. Crie também um Laboratorista e vincule às obras

### Cenário 4: Engenheiro Cria Formulário

1. Login como **ENGENHEIRO** (engenheiro@tecpav.com)
2. Clique em "Formulários"
3. Clique em "Novo Formulário"
4. Adicione campos (nome, tipo, obrigatório)
5. Adicione regras de cálculo (opcional)
6. Salve o formulário

### Cenário 5: Laboratorista Preenche Formulário

1. Login como **LABORATORISTA** (laboratorista@tecpav.com)
2. Clique em "Respostas"
3. Escolha um formulário
4. Clique em "Preencher"
5. Preencha os campos
6. Submeta - os cálculos são feitos automaticamente!

## 🏗️ Estrutura Hierárquica

```
TECPAV Engenharia (Empresa)
│
├── Obra BR-101
│   ├── Engenheiro (acesso)
│   └── Laboratorista (acesso)
│
└── Viaduto Centro
    └── Engenheiro (acesso)
```

## 🔐 Regras de Segurança

### O que cada usuário PODE fazer:

**SUPERADMIN**
- ✅ Tudo

**ADMIN**
- ✅ Gerenciar obras da SUA empresa
- ✅ Criar Engenheiros e Laboratoristas
- ✅ Vincular usuários às obras
- ❌ NÃO pode criar outras empresas
- ❌ NÃO pode criar outros ADMIN ou SUPERADMIN

**ENGENHEIRO**
- ✅ Criar e editar formulários
- ✅ Preencher formulários nas obras vinculadas
- ❌ NÃO pode gerenciar usuários
- ❌ NÃO pode criar obras

**LABORATORISTA**
- ✅ Preencher formulários
- ✅ Ver suas respostas
- ❌ NÃO pode criar formulários
- ❌ NÃO pode gerenciar nada

## 🆘 Problemas Comuns

### "Acesso negado"
- Verifique se você está logado com o usuário correto
- Cada usuário só vê o que tem permissão

### "Token inválido"
- Faça logout e login novamente
- O token expira após 7 dias

### "Nenhuma obra disponível"
- Verifique se você está vinculado a alguma obra
- ADMIN e SUPERADMIN podem vincular usuários

### Backend não inicia
- Verifique se o PostgreSQL está rodando
- Verifique se rodou as migrações: `npm run prisma:migrate`

## 📱 Interface

### Login
- Design moderno com gradiente azul/roxo
- Mostra credenciais de teste na tela
- Validação de formulário

### Dashboard
- Cards coloridos por funcionalidade
- Mostra apenas opções disponíveis para seu nível
- Informações do usuário no topo

### Gestão (Empresas/Obras/Usuários)
- Grid responsivo de cards
- Modais para criar/editar
- Ações rápidas (editar/excluir)
- Estatísticas e contadores

## 🎨 Cores por Módulo

- 🔵 **Empresas**: Azul
- 🟢 **Obras**: Verde
- 🟣 **Usuários**: Roxo
- 🟠 **Formulários**: Laranja
- 🔴 **Respostas**: Índigo

## ✨ Funcionalidades Extras

### Logout
- Clique no botão "Sair" no header
- Remove token e redireciona para login

### Perfil
- Visualize seus dados no dashboard
- Informações de empresa e obras vinculadas

### Filtros
- SUPERADMIN pode filtrar obras por empresa
- Listas ordenadas por data de criação

## 🎉 Pronto para Usar!

O sistema está 100% funcional com:
- ✅ Autenticação JWT
- ✅ 4 níveis de usuário
- ✅ Controle de permissões
- ✅ Interface responsiva
- ✅ CRUD completo
- ✅ Validações
- ✅ Dados de exemplo

Bom uso! 🚀





