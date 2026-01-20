# 📋 Funcionalidades de Duplicar e Compartilhar Relatórios

## 🎯 Objetivo

Permitir que Administradores e Super Administradores dupliquem relatórios na mesma obra e compartilhem relatórios entre obras da mesma empresa.

## ✨ Funcionalidades Implementadas

### 1. Menu de Três Pontos nos Cards de Relatórios

**Localização**: Canto superior direito do card de relatório, ao lado do badge de status.

**Visibilidade**: Apenas para usuários com role `ADMIN` ou `SUPERADMIN`.

**Opções disponíveis**:
- 🔄 **Duplicar relatório**: Cria uma cópia do relatório na obra atual
- 🔗 **Compartilhar relatório**: Copia o relatório para outra obra da mesma empresa

### 2. Duplicar Relatório

#### Como Funciona

1. Usuário clica nos três pontos ⋮ no card do relatório
2. Seleciona "Duplicar relatório"
3. Confirma a ação no diálogo
4. Uma cópia do relatório é criada na mesma obra

#### Características

- ✅ Copia todos os elementos do relatório
- ✅ Copia todas as configurações (margens, logo, etc.)
- ✅ Mantém vínculo com o mesmo formulário
- ✅ Título recebe sufixo "(Cópia)"
- ✅ Status sempre será "Rascunho" (DRAFT)
- ✅ Mantém na mesma obra do relatório original
- ✅ Usuário logado se torna o criador da cópia

#### Permissões

- ✅ Apenas `ADMIN` e `SUPERADMIN` podem duplicar
- ✅ Usuário deve ter acesso à obra do relatório

### 3. Compartilhar Relatório

#### Como Funciona

1. Usuário clica nos três pontos ⋮ no card do relatório
2. Seleciona "Compartilhar relatório"
3. Modal é aberto mostrando obras disponíveis
4. Seleciona a obra de destino
5. Confirma o compartilhamento
6. Uma cópia do relatório é criada na obra selecionada

#### Características

- ✅ Copia todos os elementos do relatório
- ✅ Copia todas as configurações (margens, logo, etc.)
- ✅ Mantém vínculo com o mesmo formulário
- ✅ Mantém o título original
- ✅ Status sempre será "Rascunho" (DRAFT)
- ✅ Cria relatório na obra de destino
- ✅ Usuário logado se torna o criador da cópia
- ✅ Apenas obras da mesma empresa aparecem na lista

#### Permissões

- ✅ Apenas `ADMIN` e `SUPERADMIN` podem compartilhar
- ✅ Usuário deve ter acesso à obra de origem
- ✅ Usuário deve ter acesso à obra de destino
- ✅ Obras devem ser da mesma empresa

#### Modal de Compartilhamento

**Elementos**:
- Campo de seleção (dropdown) com lista de obras disponíveis
- Mensagem explicativa sobre a ação
- Aviso de que uma cópia será criada
- Botões: "Cancelar" e "Compartilhar"
- Indicador de carregamento enquanto busca obras
- Mensagem quando não há obras disponíveis

**Filtros de Obras**:
- Exclui a obra atual (não pode compartilhar consigo mesma)
- Apenas obras da mesma empresa do usuário
- Apenas obras que o usuário tem acesso

## 🔧 Implementação Técnica

### Frontend

#### Arquivos Modificados

1. **`frontend/src/pages/ReportsList.tsx`**
   - Adicionado menu de três pontos com dropdown
   - Implementado modal de compartilhamento
   - Adicionadas funções `handleDuplicate`, `handleOpenShareModal`, `handleShare`
   - Gerenciamento de estado para menu aberto e modal
   - Click outside para fechar menu
   - Verificação de permissões baseada em role

2. **`frontend/src/services/api.ts`**
   - Adicionada função `duplicate(reportId)`
   - Adicionada função `share(reportId, targetProjectId)`

#### Componentes

**ShareReportModal**:
- Modal dedicado para compartilhamento
- Carrega lista de projetos via API
- Filtra projetos da mesma empresa
- Formulário com select de projetos
- Loading state e empty state

### Backend

#### Arquivos Modificados

1. **`backend/src/routes/report.routes.ts`**
   - Adicionada rota `POST /reports/:id/duplicate`
   - Adicionada rota `POST /reports/:id/share`

2. **`backend/src/controllers/report.controller.ts`**
   - Implementada função `duplicateReport`
   - Implementada função `shareReport`

#### Lógica de Negócio

**duplicateReport**:
```typescript
- Verifica role (ADMIN ou SUPERADMIN)
- Busca relatório original com todos os elementos
- Verifica acesso ao projeto
- Cria novo relatório com título "(Cópia)"
- Copia todos os elementos mantendo ordem
- Define status como DRAFT
- Usuário logado como createdById
```

**shareReport**:
```typescript
- Verifica role (ADMIN ou SUPERADMIN)
- Valida targetProjectId
- Busca relatório original com todos os elementos
- Busca projeto de destino
- Valida que ambos projetos são da mesma empresa
- Verifica acesso aos dois projetos
- Cria novo relatório no projeto de destino
- Copia todos os elementos mantendo ordem
- Define status como DRAFT
- Usuário logado como createdById
```

## 🎨 Interface do Usuário

### Menu de Três Pontos

```
┌─────────────────────────────┐
│  📊 Relatório de Ensaio  📝 │ ⋮  ← Menu
│                             │
│  📋 Formulário de Teste     │
│  🏗️ Obra ABC               │
│  👤 João Silva              │
│                             │
│  🔷 2 elementos  📄 5 gerações│
│                             │
│  [ Editar ] [ Gerar ] [ 🗑️ ]│
└─────────────────────────────┘
```

### Dropdown do Menu

```
⋮
└─────────────────────────┐
  │ 🔄 Duplicar relatório   │
  │ 🔗 Compartilhar relatório│
  └─────────────────────────┘
```

### Modal de Compartilhamento

```
┌─────────────────────────────────────┐
│ Compartilhar Relatório            ✕ │
├─────────────────────────────────────┤
│ Compartilhar o relatório "Ensaio"   │
│ para outra obra da mesma empresa.   │
│                                     │
│ ⚠️ Uma cópia será criada na obra    │
│    selecionada.                     │
│                                     │
│ Selecione a obra de destino:        │
│ ┌─────────────────────────────────┐ │
│ │ Selecione uma obra...        ▼  │ │
│ └─────────────────────────────────┘ │
│                                     │
│ [ Cancelar ]      [ Compartilhar ]  │
└─────────────────────────────────────┘
```

## 📊 Fluxo de Dados

### Duplicar

```
Frontend                Backend              Database
   │                       │                    │
   │──── POST /duplicate ──>│                    │
   │                       │                    │
   │                       │─── Find Original ──>│
   │                       │<─── Report Data ────│
   │                       │                    │
   │                       │─── Create Copy ───>│
   │                       │<─── New Report ────│
   │                       │                    │
   │<──── New Report ──────│                    │
   │                       │                    │
   │  Update List          │                    │
```

### Compartilhar

```
Frontend                Backend              Database
   │                       │                    │
   │──── POST /share ──────>│                    │
   │  { targetProjectId }  │                    │
   │                       │                    │
   │                       │─── Find Original ──>│
   │                       │<─── Report Data ────│
   │                       │                    │
   │                       │── Validate Projects >│
   │                       │<─── Projects Info ──│
   │                       │                    │
   │                       │─── Create Copy ───>│
   │                       │<─── New Report ────│
   │                       │                    │
   │<──── Success ─────────│                    │
```

## 🔒 Segurança

### Validações Implementadas

1. **Autenticação**: Todas as rotas requerem token JWT
2. **Role**: Apenas ADMIN e SUPERADMIN podem usar as funcionalidades
3. **Acesso ao Projeto**: Verifica UserProject para permissão
4. **Mesma Empresa**: Compartilhamento apenas entre obras da mesma empresa
5. **Validação de Projeto**: Verifica se projetos existem antes de compartilhar

### Mensagens de Erro

- `"Apenas Administradores podem duplicar relatórios"`
- `"Apenas Administradores podem compartilhar relatórios"`
- `"Relatório não encontrado"`
- `"Projeto de destino não encontrado"`
- `"Você não tem acesso a este projeto"`
- `"Você não tem acesso a um dos projetos"`
- `"Só é possível compartilhar relatórios entre obras da mesma empresa"`

## ✅ Status

**Implementação Concluída** - Todas as funcionalidades estão implementadas e funcionais.

### Checklist

- ✅ Menu de três pontos adicionado aos cards
- ✅ Visibilidade apenas para ADMIN/SUPERADMIN
- ✅ Opção de duplicar implementada (frontend)
- ✅ Opção de compartilhar implementada (frontend)
- ✅ Modal de compartilhamento criado
- ✅ Rota de duplicar implementada (backend)
- ✅ Rota de compartilhar implementada (backend)
- ✅ Validações de permissão implementadas
- ✅ Validação de empresa implementada
- ✅ Cópia de elementos implementada
- ✅ Click outside para fechar menu
- ✅ Loading e empty states no modal

---

**Data de Implementação**: 09/01/2026
**Versão**: 2.2


