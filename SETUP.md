# 🚀 Guia de Instalação Rápida - Labore Forms

## ⚡ Instalação Rápida (Windows)

### 1. Pré-requisitos

Certifique-se de ter instalado:
- ✅ Node.js 18+ ([Download](https://nodejs.org))
- ✅ PostgreSQL 14+ ([Download](https://www.postgresql.org/download/windows/))

### 2. Clone o projeto
```powershell
cd D:\Arquivos\rhuann_nunes\Documents\Projetos\Labore
```

### 3. Configure o PostgreSQL

Abra o pgAdmin ou psql e execute:

```sql
-- Criar banco de dados
CREATE DATABASE labore_forms;

-- Criar usuário (opcional, pode usar o postgres padrão)
CREATE USER labore WITH PASSWORD 'labore123';

-- Dar permissões
GRANT ALL PRIVILEGES ON DATABASE labore_forms TO labore;
```

### 4. Configure as variáveis de ambiente

Crie o arquivo `backend\.env`:

```env
DATABASE_URL="postgresql://labore:labore123@localhost:5432/labore_forms?schema=public"
PORT=3000
NODE_ENV=development
```

**Nota:** Se estiver usando o usuário `postgres` padrão, ajuste a URL:
```env
DATABASE_URL="postgresql://postgres:sua_senha@localhost:5432/labore_forms?schema=public"
```

### 5. Instale as dependências

```powershell
# Instalar dependências do backend
cd backend
npm install

# Instalar dependências do frontend
cd ..\frontend
npm install

# Voltar para a raiz
cd ..
```

### 6. Configure o banco de dados

```powershell
cd backend

# Gerar o Prisma Client
npx prisma generate

# Executar migrations
npx prisma migrate dev --name init

# Popular com dados de exemplo (opcional)
npm run prisma:seed

cd ..
```

### 7. Inicie a aplicação

**Opção 1: Dois terminais separados**

Terminal 1 (Backend):
```powershell
cd backend
npm run dev
```

Terminal 2 (Frontend):
```powershell
cd frontend
npm run dev
```

**Opção 2: Tudo junto (requer instalar concurrently na raiz)**
```powershell
npm install
npm run dev
```

### 8. Acesse a aplicação

- 🌐 **Frontend**: http://localhost:5173
- 🔌 **Backend**: http://localhost:3000
- ✅ **Health Check**: http://localhost:3000/api/health

## 🔧 Comandos Úteis

### Backend

```powershell
cd backend

# Desenvolvimento
npm run dev

# Build
npm run build

# Produção
npm start

# Prisma Studio (visualizador do banco)
npx prisma studio

# Gerar migrations
npx prisma migrate dev --name nome_da_migration

# Resetar banco de dados
npx prisma migrate reset
```

### Frontend

```powershell
cd frontend

# Desenvolvimento
npm run dev

# Build
npm run build

# Preview da build
npm run preview
```

## 🐛 Troubleshooting

### Erro: "Can't reach database server"

1. Verifique se o PostgreSQL está rodando:
   ```powershell
   # Windows: Abra o Services e procure por PostgreSQL
   # Ou inicie manualmente
   ```

2. Teste a conexão:
   ```powershell
   psql -U labore -d labore_forms
   # Ou com o usuário postgres
   psql -U postgres -d labore_forms
   ```

3. Verifique a DATABASE_URL no `.env`

### Erro: "Port 3000 already in use"

Mude a porta no `backend\.env`:
```env
PORT=3001
```

### Erro: "Port 5173 already in use"

Mude a porta em `frontend\vite.config.ts`:
```typescript
server: {
  port: 5174,
  // ...
}
```

### Erro de permissões no PostgreSQL

Execute no psql:
```sql
-- Dar todas as permissões
GRANT ALL ON SCHEMA public TO labore;
GRANT ALL ON ALL TABLES IN SCHEMA public TO labore;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO labore;
```

### Limpar e recomeçar

```powershell
cd backend

# Resetar banco de dados completamente
npx prisma migrate reset

# Recriar tudo
npx prisma generate
npx prisma migrate dev
npm run prisma:seed
```

## 📊 Visualizando o Banco de Dados

### Prisma Studio (Recomendado)

```powershell
cd backend
npx prisma studio
```

Abre em: http://localhost:5555

### pgAdmin

1. Abra o pgAdmin
2. Conecte ao servidor PostgreSQL
3. Navegue até: Servers → PostgreSQL → Databases → labore_forms

## ✅ Verificação da Instalação

Execute estes comandos para verificar se tudo está funcionando:

```powershell
# Verificar Node.js
node --version  # Deve ser 18+

# Verificar npm
npm --version

# Verificar PostgreSQL
psql --version

# Testar backend
curl http://localhost:3000/api/health

# Ou no PowerShell
Invoke-WebRequest -Uri http://localhost:3000/api/health
```

## 🎯 Próximos Passos

1. ✅ Acesse http://localhost:5173
2. 📝 Crie seu primeiro formulário
3. ➕ Adicione campos
4. 🧮 Configure regras de processamento
5. ✏️ Preencha o formulário
6. 📊 Visualize os resultados

## 📚 Documentação

- [README.md](./README.md) - Documentação completa
- [Prisma Docs](https://www.prisma.io/docs)
- [React Router](https://reactrouter.com)
- [Vite](https://vitejs.dev)

---

💡 **Dica:** Se você popular o banco com o seed (`npm run prisma:seed`), já terá 2 formulários de exemplo prontos para testar!



