# 📊 Módulo de Relatórios Personalizados V2 - Sistema Inteligente

## 🎯 Novidades da Versão 2.0

### ✨ Melhorias Implementadas

1. **Formulário Obrigatório** - Todo relatório agora é vinculado a um formulário específico
2. **Autocomplete Inteligente** - Sistema de sugestões com `@` e `#`
3. **Destaque Visual** - Variáveis aparecem com cores diferentes
4. **Acesso Direto** - Relatórios agora têm seção própria, fora de formulários
5. **Interface Aprimorada** - Editor mais intuitivo e profissional

## 🚀 Sistema de Autocomplete

### Como Usar

#### 1. **@ - Dados de Cadastro** (Azul)

Digite `@` para acessar informações de cadastro:

```
@{project.name}        - Nome da obra
@{project.code}        - Código da obra
@{project.client}      - Nome do cliente
@{project.address}     - Endereço da obra
@{company.name}        - Nome da empresa
@{company.cnpj}        - CNPJ da empresa
@{submittedBy.name}    - Nome do usuário que preencheu
@{submittedBy.email}   - Email do usuário
@{currentUser.name}    - Usuário que está gerando
@{currentDate}         - Data atual
@{currentDateTime}     - Data e hora atual
@{submittedAt}         - Data da submissão
```

**Cor de destaque**: <span style="color: #1d4ed8; background: #dbeafe">Azul claro</span>

#### 2. **# - Campos do Formulário** (Verde)

Digite `#` para acessar dados do formulário vinculado:

```
#{form.title}          - Título do formulário
#{field.CAMPO}         - Valor de um campo específico
#{calc.CALCULO}        - Resultado de um cálculo
```

**Cor de destaque**: <span style="color: #15803d; background: #dcfce7">Verde claro</span>

### 🎨 Interface do Autocomplete

Ao digitar `@` ou `#`, uma lista inteligente aparece com:

- **Ícone colorido** do tipo de variável
- **Nome amigável** (ex: "Nome da Obra")
- **Descrição** do que a variável representa
- **Código** exato para referência

**Navegação:**
- `↑` `↓` - Navegar pelas opções
- `Enter` ou `Tab` - Selecionar
- `Esc` - Fechar

## 📝 Exemplo Completo

### Criando um Relatório de Ensaio

```
=== RELATÓRIO DE ENSAIO DE CONCRETO ===

Obra: @{project.name}
Código: @{project.code}
Cliente: @{project.client}
Endereço: @{project.address}
Empresa: @{company.name}

---

DADOS DO ENSAIO

Formulário: #{form.title}
Data do Ensaio: #{field.data_ensaio}
Corpo de Prova: #{field.corpo_prova}
Idade: #{field.idade} dias

RESULTADOS

Resistência à Compressão: #{field.resistencia} MPa
Status: #{calc.status_aprovacao}

---

Responsável Técnico: @{submittedBy.name}
Email: @{submittedBy.email}
Data do Relatório: @{currentDate}
```

### Como Fica no Editor

As variáveis aparecem destacadas em cores:
- `@{project.name}` → Fundo azul claro
- `#{field.resistencia}` → Fundo verde claro

### Como Fica Após Gerar

```
=== RELATÓRIO DE ENSAIO DE CONCRETO ===

Obra: Edifício Central Plaza
Código: OBR-2024-001
Endereço: Av. Paulista, 1000 - São Paulo/SP
Empresa: Construtora ABC Ltda

---

DADOS DO ENSAIO

Formulário: Ensaio de Compressão Axial
Data do Ensaio: 15/12/2024
Corpo de Prova: CP-001
Idade: 28 dias

RESULTADOS

Resistência à Compressão: 32.5 MPa
Status: APROVADO

---

Responsável Técnico: João Silva
Email: joao.silva@empresa.com
Data do Relatório: 18/12/2024
```

## 🏗️ Fluxo de Trabalho

### 1. Criar Relatório

1. Acesse **Dashboard** → **Relatórios**
2. Clique em **"+ Novo Relatório"**
3. Preencha:
   - **Título**: Nome do relatório
   - **Descrição**: Opcional
   - **Formulário**: **OBRIGATÓRIO** - Selecione o formulário
   - **Status**: Rascunho/Ativo/Arquivado
4. **Salvar**

### 2. Adicionar Elementos

1. Clique em **"+ Adicionar Elemento"**
2. Escolha o tipo (Texto, Tabela, Gráfico, etc)
3. No editor de texto:
   - Digite `@` para dados de cadastro
   - Digite `#` para dados do formulário
   - Use as setas para navegar
   - Pressione Enter para inserir
4. **Fechar** para salvar

### 3. Gerar Relatório

1. Na lista de relatórios, clique em **"Gerar"**
2. Selecione:
   - **Projeto** (obrigatório)
   - **Submissão** do formulário (opcional)
3. Clique em **"🚀 Gerar Relatório"**
4. Visualize com dados reais
5. **Imprimir/PDF** quando pronto

## 🎯 Diferenças das Versões

| Recurso | Versão 1.0 | Versão 2.0 |
|---------|------------|------------|
| Formulário | Opcional | **Obrigatório** |
| Variáveis | `{{nome}}` | `@{nome}` e `#{nome}` |
| Autocomplete | ❌ | ✅ **Sim** |
| Destaque Visual | ❌ | ✅ **Colorido** |
| Navegação | Dentro de Formulários | **Seção Própria** |
| Sugestões | Manual | **Inteligente** |

## 🔧 Tecnologias

### Frontend
- **SmartTextEditor** - Componente com autocomplete
- **React Hooks** - Estado e efeitos
- **Syntax Highlighting** - Destaque de variáveis
- **Keyboard Navigation** - Navegação por teclado

### Backend
- **Processamento Multi-formato** - Suporte a `@{}`, `#{}` e `{{}}`
- **Validação de Formulário** - Obrigatório na criação
- **Include Automático** - Campos e cálculos do formulário

## 💡 Dicas Pro

### 1. Use Atalhos
- `@` + `Enter` - Inserir última sugestão de cadastro
- `#` + `Enter` - Inserir última sugestão de campo
- `Esc` - Fechar sugestões rapidamente

### 2. Organize por Seções
```
=== CABEÇALHO ===
@{project.name}

=== DADOS ===
#{field.valor}

=== CONCLUSÃO ===
@{currentDate}
```

### 3. Combine Variáveis
```
Total: #{calc.total} (Projeto: @{project.code})
```

### 4. Use Tabelas para Dados Estruturados
```
| Campo        | Valor              |
|--------------|-------------------|
| Obra         | @{project.name}   |
| Resistência  | #{field.res}      |
```

## 🐛 Troubleshooting

### Autocomplete não aparece
- **Causa**: Não digitou `@` ou `#`
- **Solução**: Digite o gatilho correto

### Lista de sugestões vazia
- **Causa**: Formulário não selecionado (para `#`)
- **Solução**: Selecione um formulário antes

### Variável não substitui
- **Causa**: Formato incorreto ou dado não existe
- **Solução**: Use o autocomplete para garantir formato correto

### Não consigo criar relatório
- **Causa**: Formulário não selecionado
- **Solução**: Formulário é obrigatório na V2

## 📚 API de Variáveis

### Estrutura
```typescript
// Cadastro (@)
@{tipo.campo}

// Formulário (#)
#{tipo.campo}

// Legado (ainda suportado)
{{tipo.campo}}
```

### Tipos Disponíveis

#### @ Cadastro
- `project.*` - Dados da obra
- `company.*` - Dados da empresa
- `submittedBy.*` - Usuário que preencheu
- `currentUser.*` - Usuário atual
- `current*` - Datas do sistema

#### # Formulário
- `form.*` - Dados do formulário
- `field.*` - Campos do formulário
- `calc.*` - Cálculos/regras

## 🎓 Exemplos Avançados

### 1. Relatório de Inspeção Diária
```
INSPEÇÃO DIÁRIA - @{currentDate}

Obra: @{project.name}
Fiscal: @{submittedBy.name}

ITENS VERIFICADOS:
✓ Estrutura: #{field.estrutura_ok}
✓ Instalações: #{field.instalacoes_ok}
✓ Segurança: #{field.seguranca_ok}

OBSERVAÇÕES:
#{field.observacoes}

Próxima inspeção: #{calc.proxima_data}
```

### 2. Boletim de Medição
```
BOLETIM DE MEDIÇÃO
Período: #{field.periodo}
Obra: @{project.name} (@{project.code})

| Serviço                | Qtd Prev | Qtd Exec | %        |
|-----------------------|----------|----------|----------|
| Fundação              | #{calc.prev_fund} | #{field.exec_fund} | #{calc.perc_fund}% |
| Estrutura             | #{calc.prev_estr} | #{field.exec_estr} | #{calc.perc_estr}% |
| Alvenaria             | #{calc.prev_alv}  | #{field.exec_alv}  | #{calc.perc_alv}%  |

Responsável: @{submittedBy.name}
```

## 🚀 Próximas Funcionalidades

- [ ] Múltiplos formulários por relatório
- [ ] Templates prontos
- [ ] Exportação PDF automática
- [ ] Assinatura digital
- [ ] Compartilhamento por link
- [ ] Histórico de versões

---

**Versão**: 2.0.0  
**Data**: Dezembro 2024  
**Desenvolvido por**: Equipe Labore






