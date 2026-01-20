# ⚡ Início Rápido - Labore Forms

## 🎯 Objetivo
Este guia vai te ajudar a ter a aplicação rodando em **menos de 10 minutos**.

## ✅ Checklist Pré-Instalação

- [ ] Node.js 18+ instalado
- [ ] PostgreSQL 14+ instalado e rodando
- [ ] Git instalado (se for clonar)

## 🚀 Instalação Express (Windows)

### Opção A: Com Docker (Mais Fácil)

```powershell
# 1. Iniciar PostgreSQL com Docker
docker-compose up -d

# 2. Instalar dependências
cd backend
npm install

cd ..\frontend
npm install

# 3. Configurar backend
cd ..\backend

# Criar arquivo .env
Write-Output "DATABASE_URL=`"postgresql://labore:labore123@localhost:5432/labore_forms?schema=public`"`nPORT=3000`nNODE_ENV=development" > .env

# Configurar banco
npx prisma generate
npx prisma migrate dev --name init
npm run prisma:seed

# 4. Iniciar aplicação
# Terminal 1
npm run dev

# Terminal 2 (nova janela)
cd ..\frontend
npm run dev
```

### Opção B: PostgreSQL Local

```powershell
# 1. Criar banco de dados
# Abra o pgAdmin ou psql e execute:
# CREATE DATABASE labore_forms;

# 2. Instalar dependências
cd backend
npm install

cd ..\frontend
npm install

# 3. Configurar backend
cd ..\backend

# Criar arquivo .env (ajuste a senha)
Write-Output "DATABASE_URL=`"postgresql://postgres:SUA_SENHA@localhost:5432/labore_forms?schema=public`"`nPORT=3000`nNODE_ENV=development" > .env

# Configurar banco
npx prisma generate
npx prisma migrate dev --name init
npm run prisma:seed

# 4. Iniciar aplicação
# Terminal 1
npm run dev

# Terminal 2 (nova janela)
cd ..\frontend
npm run dev
```

## 🌐 Acessar a Aplicação

Abra no navegador:
- **Frontend**: http://localhost:5173
- **Backend**: http://localhost:3000/api/health

## 🎓 Primeiro Uso

### 1. Visualizar Formulários de Exemplo

Após o seed, você terá 2 formulários prontos:
- **Inspeção de Qualidade**
- **Avaliação de Desempenho**

### 2. Preencher um Formulário

1. Clique em "Visualizar" em um dos formulários
2. Clique em "Preencher Formulário"
3. Preencha os campos
4. Clique em "Enviar"
5. Veja os resultados calculados automaticamente!

### 3. Criar Seu Próprio Formulário

1. Clique em "Novo Formulário"
2. Preencha título e descrição
3. Clique em "Salvar Formulário"
4. Adicione campos:
   - Nome do campo
   - Chave (sem espaços, ex: `campo1`)
   - Tipo (TEXT, NUMBER, etc)
   - Marque se é obrigatório
5. Adicione regras:
   - Nome da regra
   - Chave da regra
   - Fórmula usando as chaves dos campos
6. Mude o status para "Ativo"
7. Pronto! Seu formulário está funcionando

## 📊 Exemplo Prático Rápido

### Criar formulário de Orçamento

**Campos:**
1. `valor_unitario` (NUMBER) - Valor Unitário
2. `quantidade` (NUMBER) - Quantidade
3. `desconto_percentual` (NUMBER) - Desconto (%)

**Regras:**
1. Subtotal: `valor_unitario * quantidade`
2. Desconto: `(valor_unitario * quantidade) * (desconto_percentual / 100)`
3. Total: `(valor_unitario * quantidade) - ((valor_unitario * quantidade) * (desconto_percentual / 100))`

**Teste:**
- Valor Unitário: 100
- Quantidade: 5
- Desconto: 10

**Resultado:**
- Subtotal: 500.00
- Desconto: 50.00
- Total: 450.00

## 🔧 Comandos Úteis

### Ver banco de dados visualmente
```powershell
cd backend
npx prisma studio
```
Abre em: http://localhost:5555

### Resetar banco e recriar dados de exemplo
```powershell
cd backend
npx prisma migrate reset
npm run prisma:seed
```

### Ver logs do backend
```powershell
cd backend
npm run dev
```

### Verificar se está tudo rodando
```powershell
# Backend
curl http://localhost:3000/api/health

# Ou no PowerShell
Invoke-WebRequest -Uri http://localhost:3000/api/health
```

## ❌ Problemas Comuns

### "Port 3000 already in use"
```powershell
# Mudar porta no backend\.env
PORT=3001
```

### "Can't reach database server"
```powershell
# Verificar se PostgreSQL está rodando
# Windows: Services → PostgreSQL

# Testar conexão
psql -U postgres
```

### "Module not found"
```powershell
# Reinstalar dependências
cd backend
Remove-Item -Recurse -Force node_modules
npm install

cd ..\frontend
Remove-Item -Recurse -Force node_modules
npm install
```

### Frontend não carrega
```powershell
# Verificar se backend está rodando
curl http://localhost:3000/api/health

# Limpar cache do Vite
cd frontend
Remove-Item -Recurse -Force node_modules\.vite
npm run dev
```

## 📚 Próximos Passos

1. ✅ Aplicação rodando
2. 📖 Ler [README.md](./README.md) para entender todas as funcionalidades
3. 🎯 Ver [FEATURES.md](./FEATURES.md) para casos de uso
4. 🔌 Consultar [API_EXAMPLES.md](./API_EXAMPLES.md) para integração

## 💡 Dicas

- Use **Prisma Studio** para ver os dados no banco
- Teste as **fórmulas** antes de usá-las em produção
- Comece com formulários **simples** e vá incrementando
- **Campos numéricos** são necessários para cálculos
- Status **ACTIVE** permite preenchimento

## 🎉 Pronto!

Sua aplicação está rodando! Agora você pode:
- ✨ Criar formulários ilimitados
- 🧮 Adicionar regras de cálculo complexas
- 📊 Visualizar todas as respostas
- 💾 Tudo salvo no banco de dados

---

**Dúvidas?** Consulte o [README.md](./README.md) completo ou abra uma issue!




