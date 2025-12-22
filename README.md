# 📝 Labore Forms

Sistema profissional e escalável para criação e gerenciamento de formulários com regras de processamento customizadas.

## ⭐ **NOVO: Funcionalidade Offline-First!**

A aplicação agora funciona **completamente offline**! 

- ✅ Preencha formulários sem internet
- ✅ Dados salvos localmente no navegador
- ✅ Sincronização automática quando voltar online
- ✅ Indicador visual de status
- ✅ PWA instalável (funciona como app nativo)

**📖 Documentação completa:** [COMO_COMECAR.md](./COMO_COMECAR.md) | [OFFLINE_FIRST.md](./OFFLINE_FIRST.md)

---

## 🚀 Funcionalidades

### ✅ Criação de Formulários
- Interface intuitiva para criar formulários personalizados
- Suporte a múltiplos tipos de campos:
  - Texto simples e longo
  - Números
  - Data
  - Email e Telefone
  - Seleção única e múltipla
  - Checkbox
- Campos obrigatórios e opcionais
- Status de formulário (Rascunho, Ativo, Arquivado)

### 🧮 Regras de Processamento
- **Motor de fórmulas tipo Excel**
- Criação de regras customizadas para cálculos automáticos
- Suporte a operações matemáticas complexas
- Referências a campos usando chaves únicas
- Validação em tempo real de fórmulas

**Exemplo de fórmula:**
```
(campo1 * campo2 / 3.14) * 30 * campo3
```

### 💾 Armazenamento Completo
- Respostas dos formulários armazenadas no banco de dados
- Resultados calculados salvos automaticamente
- Histórico completo de submissões
- Rastreamento de data/hora de cada resposta

### 📊 Visualização e Gestão
- Lista de todos os formulários criados
- Visualização de detalhes do formulário
- Listagem de todas as respostas
- Detalhes completos de cada submissão
- Estatísticas básicas por formulário

## 🛠️ Tecnologias

### Backend
- **Node.js** + **TypeScript**
- **Express** - Framework web
- **Prisma** - ORM moderno e type-safe
- **PostgreSQL** - Banco de dados relacional
- **Zod** - Validação de schemas
- **mathjs** - Processamento de fórmulas matemáticas

### Frontend
- **React** + **TypeScript**
- **Vite** - Build tool moderna
- **React Router** - Roteamento
- **Axios** - Cliente HTTP
- **Lucide React** - Ícones
- **date-fns** - Manipulação de datas

## 📋 Pré-requisitos

- Node.js 18+ 
- PostgreSQL 14+
- npm ou yarn

## 🔧 Instalação

### 1. Clone o repositório
```bash
git clone <url-do-repositorio>
cd Labore
```

### 2. Configure o banco de dados PostgreSQL

Crie um banco de dados:
```sql
CREATE DATABASE labore_forms;
CREATE USER labore WITH PASSWORD 'labore123';
GRANT ALL PRIVILEGES ON DATABASE labore_forms TO labore;
```

### 3. Configure as variáveis de ambiente

Crie um arquivo `.env` na pasta `backend`:
```env
DATABASE_URL="postgresql://labore:labore123@localhost:5432/labore_forms?schema=public"
PORT=3000
NODE_ENV=development
```

### 4. Instale as dependências

```bash
# Instalar dependências de todas as pastas
npm run install:all

# Ou manualmente:
npm install
cd backend && npm install
cd ../frontend && npm install
```

### 5. Configure o banco de dados

```bash
cd backend
npx prisma generate
npx prisma migrate dev --name init
```

### 6. Inicie a aplicação

**Opção 1: Iniciar tudo junto (requer concurrently)**
```bash
npm run dev
```

**Opção 2: Iniciar separadamente**

Terminal 1 (Backend):
```bash
npm run dev:backend
```

Terminal 2 (Frontend):
```bash
npm run dev:frontend
```

### 7. Acesse a aplicação

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:3000
- **API Health Check**: http://localhost:3000/api/health

## 📖 Guia de Uso

### Criando um Formulário

1. Acesse a página inicial e clique em "Novo Formulário"
2. Preencha as informações básicas (título, descrição, status)
3. Salve o formulário
4. Adicione campos clicando em "Adicionar Campo":
   - Nome do campo (ex: "Temperatura")
   - Chave para fórmulas (ex: "temperatura")
   - Tipo do campo
   - Marque se é obrigatório

### Criando Regras de Processamento

1. Após adicionar campos, clique em "Adicionar Regra"
2. Dê um nome para a regra (ex: "Cálculo do Total")
3. Defina uma chave (ex: "total_calculado")
4. Escreva a fórmula usando as chaves dos campos
5. Clique em "Validar Fórmula" para verificar se está correta

**Exemplos de Fórmulas:**
```javascript
// Multiplicação simples
valor1 * quantidade

// Cálculo com constante
(largura * altura) / 2

// Fórmula complexa
(campo1 * campo2 / 3.14159) * 30 * campo3

// Operações matemáticas
sqrt(campo1^2 + campo2^2)

// Com funções matemáticas
sin(angulo) * raio + cos(angulo) * altura
```

### Preenchendo um Formulário

1. Na visualização do formulário, clique em "Preencher Formulário"
2. Preencha todos os campos (especialmente os obrigatórios)
3. Clique em "Enviar Formulário"
4. O sistema irá:
   - Validar os campos
   - Salvar as respostas
   - Calcular automaticamente as regras
   - Exibir os resultados

### Visualizando Respostas

1. No formulário, clique em "Ver Respostas"
2. Veja a lista de todas as submissões
3. Clique em "Ver Detalhes" para ver:
   - Todas as respostas do usuário
   - Resultados calculados pelas regras
   - Data e hora da submissão

## 🗄️ Estrutura do Banco de Dados

### Tabelas Principais

- **forms** - Formulários criados
- **form_fields** - Campos de cada formulário
- **processing_rules** - Regras de processamento (fórmulas)
- **form_submissions** - Submissões dos formulários
- **field_responses** - Respostas individuais de cada campo
- **processing_results** - Resultados calculados das regras

## 🔌 API Endpoints

### Formulários
- `GET /api/forms` - Listar formulários
- `GET /api/forms/:id` - Buscar formulário
- `POST /api/forms` - Criar formulário
- `PUT /api/forms/:id` - Atualizar formulário
- `DELETE /api/forms/:id` - Deletar formulário

### Campos
- `POST /api/forms/:id/fields` - Adicionar campo
- `PUT /api/forms/:id/fields/:fieldId` - Atualizar campo
- `DELETE /api/forms/:id/fields/:fieldId` - Deletar campo

### Regras
- `POST /api/forms/:id/rules` - Adicionar regra
- `PUT /api/forms/:id/rules/:ruleId` - Atualizar regra
- `DELETE /api/forms/:id/rules/:ruleId` - Deletar regra
- `POST /api/forms/validate-formula` - Validar fórmula

### Submissões
- `GET /api/submissions/form/:formId` - Listar submissões
- `GET /api/submissions/:id` - Buscar submissão
- `POST /api/submissions` - Criar submissão
- `DELETE /api/submissions/:id` - Deletar submissão
- `GET /api/submissions/form/:formId/stats` - Estatísticas

## 🧪 Exemplo Completo

### Criando um formulário de Inspeção

1. **Crie o formulário:**
   - Título: "Inspeção de Qualidade"
   - Descrição: "Checklist para inspeção de produtos"
   - Status: Ativo

2. **Adicione os campos:**
   - Campo 1: "Largura (cm)" | chave: `largura` | tipo: NUMBER | obrigatório
   - Campo 2: "Altura (cm)" | chave: `altura` | tipo: NUMBER | obrigatório
   - Campo 3: "Quantidade" | chave: `quantidade` | tipo: NUMBER | obrigatório
   - Campo 4: "Observações" | chave: `observacoes` | tipo: TEXTAREA

3. **Adicione regras:**
   - Regra 1: "Área Total" | chave: `area_total`
     - Fórmula: `largura * altura * quantidade`
   
   - Regra 2: "Perímetro" | chave: `perimetro`
     - Fórmula: `2 * (largura + altura)`

4. **Preencha o formulário:**
   - Largura: 10
   - Altura: 5
   - Quantidade: 3
   - Observações: "Produto em bom estado"

5. **Resultados calculados automaticamente:**
   - Área Total: 150.00
   - Perímetro: 30.00

## 🚀 Próximos Passos (Roadmap)

- [ ] Módulo de relatórios visuais com gráficos
- [ ] Exportação de dados (Excel, PDF, CSV)
- [ ] Templates de formulários prontos
- [ ] Permissões e controle de acesso
- [ ] Notificações por email
- [ ] API pública com autenticação
- [ ] Dashboard analytics
- [ ] Temas customizáveis
- [ ] Integração com webhooks
- [ ] Importação de formulários

## 📝 Licença

Este projeto foi criado para fins educacionais e profissionais.

## 🤝 Contribuindo

Contribuições são bem-vindas! Sinta-se à vontade para abrir issues e pull requests.

## 📧 Suporte

Para dúvidas e suporte, abra uma issue no repositório.

---

Desenvolvido com ❤️ para facilitar a gestão de formulários e checklists profissionais.

