# 🏗️ Sistema de Gerenciamento por Obras

## 📋 Como Funciona

O sistema agora implementa um controle rigoroso baseado em **Obras/Projetos**:

### 🎯 Conceito

- **Formulários** são templates reutilizáveis (podem ser usados em qualquer obra)
- **Submissões** (respostas preenchidas) são **sempre vinculadas a uma obra específica**
- Cada usuário vê apenas os dados das obras que tem permissão

### 🔄 Fluxo de Trabalho

```
1. Usuário faz login
   ↓
2. Seleciona uma OBRA no seletor (cabeçalho)
   ↓
3. Acessa formulários e preenche
   ↓
4. Submissão fica vinculada à obra selecionada
   ↓
5. Ao trocar de obra, vê apenas dados daquela obra
```

## 👥 Permissões por Nível

### SUPERADMIN
- ✅ Vê todas as obras de todas as empresas
- ✅ Pode selecionar qualquer obra
- ✅ Acessa todos os dados

### ADMIN
- ✅ Vê apenas obras da sua empresa
- ✅ Pode criar novas obras
- ✅ Vincula usuários às obras

### ENGENHEIRO
- ✅ Vê apenas obras vinculadas a ele
- ✅ Precisa selecionar uma obra para trabalhar
- ✅ Pode criar formulários (templates)
- ✅ Pode preencher formulários nas suas obras

### LABORATORISTA
- ✅ Vê apenas obras vinculadas a ele
- ✅ **OBRIGATÓRIO** selecionar uma obra
- ✅ Pode apenas preencher formulários
- ✅ Vê apenas respostas das suas obras

## 🎨 Interface - Seletor de Obras

### Localização
No cabeçalho do Dashboard, ao lado dos botões de Configurações e Sair

### Aparência
- **Nenhuma obra selecionada**: Badge amarelo com aviso
- **Obra selecionada**: Badge azul mostrando o nome da obra
- **Dropdown**: Lista todas as obras disponíveis

### Funcionalidades
- 🔍 Ver todas as obras disponíveis
- ✅ Selecionar uma obra (fica persistida no navegador)
- ❌ Limpar seleção (botão X)
- 🔄 Trocar de obra a qualquer momento

## 📊 Isolamento de Dados

### O que é Isolado por Obra:
- ✅ **Submissões/Respostas** - Cada obra tem suas próprias respostas
- ✅ **Resultados de Cálculos** - Vinculados à submissão da obra
- ✅ **Listagens de Respostas** - Filtradas automaticamente

### O que é Compartilhado:
- 📝 **Formulários** (templates) - Reutilizáveis em todas as obras
- 👥 **Usuários** - Podem ter acesso a múltiplas obras
- 🏢 **Empresas** - Estrutura organizacional

## ⚠️ Validações Implementadas

### Frontend
1. **Alerta Visual**: Se nenhuma obra selecionada e usuário é ENGENHEIRO/LABORATORISTA
2. **Seletor Obrigatório**: Destaque visual para selecionar obra
3. **Persistência**: Obra selecionada salva no localStorage

### Backend
1. **Submissões**: Sempre vinculadas ao `projectId`
2. **Listagens**: Filtradas automaticamente por projeto quando aplicável
3. **Permissões**: Verificação se usuário tem acesso àquele projeto

## 🔧 Componentes Criados

### `ProjectSelector.tsx`
Seletor de obras no cabeçalho com dropdown

**Props**: Nenhuma (usa contexto)

**Funcionalidades**:
- Lista obras do usuário
- Mostra obra ativa
- Permite trocar ou limpar seleção

### `project-context.ts`
Gerenciamento de estado da obra selecionada

**Store (Zustand)**:
```typescript
{
  selectedProject: Project | null,
  setSelectedProject: (project) => void,
  clearSelectedProject: () => void,
  hasSelectedProject: () => boolean
}
```

**Persistência**: LocalStorage automático

## 📱 Comportamento nas Páginas

### Dashboard
- Mostra seletor de obras no cabeçalho
- Exibe alerta se nenhuma obra selecionada (ENGENHEIRO/LABORATORISTA)
- Indica obra ativa no subtítulo

### Formulários
- Listagem: Mostra todos os formulários disponíveis
- Criar: Disponível para ENGENHEIRO/ADMIN/SUPERADMIN
- Preencher: **Requer obra selecionada**

### Submissões/Respostas
- Listagem: **Filtrada pela obra selecionada**
- Visualizar: Mostra apenas da obra atual
- Sem obra selecionada: Mensagem de aviso

### Obras
- Gerenciar obras (criar, editar, excluir)
- Vincular usuários às obras
- Definir status (Ativa, Pausada, Concluída, Cancelada)

## 🚀 Como Usar

### Para ADMIN
1. Login no sistema
2. Ir em "Obras" e criar uma obra
3. Ir em "Usuários" e criar ENGENHEIRO/LABORATORISTA
4. Ao criar usuário, vincular às obras necessárias
5. Usuário agora pode selecionar essas obras

### Para ENGENHEIRO
1. Login no sistema
2. Selecionar obra no seletor (cabeçalho)
3. Criar formulários (se necessário)
4. Preencher formulários na obra selecionada
5. Ver respostas da obra

### Para LABORATORISTA
1. Login no sistema
2. **Selecionar obra** (obrigatório - ver o alerta)
3. Ir em "Respostas" → "Preencher"
4. Escolher formulário e preencher
5. Submissão fica vinculada à obra

## 🔄 Mudança de Obra

Ao trocar de obra no seletor:
1. ✅ Contexto atualizado automaticamente
2. ✅ Páginas reagem à mudança
3. ✅ Listagens se atualizam
4. ✅ Dados isolados por obra

## 💾 Persistência

A obra selecionada é salva no **localStorage** com a chave:
```
labore-selected-project
```

Isso significa que:
- ✅ Persiste entre recarregamentos da página
- ✅ Persiste entre sessões
- ❌ Não persiste entre dispositivos
- ❌ Limpa ao fazer logout (recomendado)

## 🎨 Cores e Estados

### Badge da Obra Selecionada
- **Nenhuma**: Fundo amarelo, borda amarela
- **Selecionada**: Fundo azul claro, borda azul

### Status das Obras
- **ACTIVE**: Verde (Ativa)
- **PAUSED**: Amarelo (Pausada)
- **COMPLETED**: Azul (Concluída)
- **CANCELLED**: Cinza (Cancelada)

## 📝 Exemplo de Fluxo Completo

### Cenário: Nova Obra com Laboratorista

1. **ADMIN** cria obra "Rodovia BR-101"
2. **ADMIN** cria usuário "João Laboratorista"
3. **ADMIN** vincula João à obra BR-101
4. **João** faz login
5. **João** vê seletor e seleciona "Rodovia BR-101"
6. **João** vê alerta desaparecer
7. **João** vai em "Respostas" e vê apenas respostas da BR-101
8. **João** preenche novo formulário
9. **Submissão** fica vinculada à BR-101
10. **João** troca para obra "Viaduto Centro"
11. **João** vê dados diferentes (da obra Centro)

## ✅ Benefícios

1. **Isolamento Completo**: Dados de uma obra não aparecem em outra
2. **Segurança**: Usuários só veem obras permitidas
3. **Organização**: Clara separação por projeto
4. **Auditoria**: Sempre sabemos a qual obra pertence cada dado
5. **Flexibilidade**: Fácil adicionar/remover usuários de obras

## 🔜 Melhorias Futuras

- [ ] Dashboard com estatísticas por obra
- [ ] Relatórios filtrados por obra
- [ ] Comparação entre obras
- [ ] Histórico de mudanças de obra
- [ ] Notificações por obra
- [ ] Exportação de dados por obra

---

**Desenvolvido com ❤️ para Labore Forms**





