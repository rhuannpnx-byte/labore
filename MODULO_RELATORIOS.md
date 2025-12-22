# 📊 Módulo de Relatórios Personalizados - Labore

## Visão Geral

O **Módulo de Relatórios** permite criar relatórios dinâmicos e personalizados com tabelas, gráficos, textos e imagens. Os relatórios podem vincular dados de formulários, projetos e cálculos automáticos, preparados para futura exportação em PDF.

## 🎯 Funcionalidades Principais

### 1. **Criação de Relatórios**
- Interface drag-and-drop intuitiva
- Múltiplos tipos de elementos
- Rascunhos, ativos e arquivados
- Vinculação com projetos específicos

### 2. **Tipos de Elementos**

#### 📝 **Texto**
- Formatação rica (tamanho, cor, peso, alinhamento)
- Suporte a variáveis dinâmicas
- Estilo itálico e sublinhado

#### 📊 **Tabela**
- Adicionar/remover colunas e linhas
- Estilização personalizada (cores, bordas)
- Vinculação de dados de formulários
- Linhas alternadas

#### 📈 **Gráfico**
- Tipos: Barras, Linha, Pizza, Rosca, Área
- Cores personalizáveis
- Legendas e grades
- Dados manuais ou vinculados

#### 🖼️ **Imagem**
- Upload por URL
- Dimensões configuráveis
- Diferentes modos de ajuste

#### ➖ **Divisor**
- Estilos: Sólido, Tracejado, Pontilhado
- Espessura e cor personalizáveis

#### ⬜ **Espaçamento**
- Controle preciso de altura
- Organização visual

### 3. **Vinculação de Dados**

Os relatórios podem vincular dados dinâmicos usando variáveis:

```
{{project.name}}        - Nome da obra/projeto
{{project.code}}        - Código do projeto
{{project.address}}     - Endereço do projeto
{{company.name}}        - Nome da empresa

{{form.title}}          - Título do formulário
{{submittedBy.name}}    - Nome do usuário que preencheu
{{submittedAt}}         - Data/hora da submissão

{{field.fieldKey}}      - Valor de um campo específico
{{calc.ruleKey}}        - Resultado de um cálculo

{{currentUser.name}}    - Nome do usuário atual
{{currentDate}}         - Data atual
{{currentDateTime}}     - Data e hora atual
```

### 4. **Geração de Relatórios**

- Gerar instâncias com dados reais
- Vincular com submissões de formulários
- Snapshot dos dados no momento da geração
- Histórico de gerações

## 🏗️ Arquitetura

### Backend

#### **Database Schema (Prisma)**

```prisma
model Report {
  id          String
  title       String
  description String?
  status      ReportStatus
  elements    ReportElement[]
  generations ReportGeneration[]
  project     Project?
  createdBy   User?
}

model ReportElement {
  id       String
  type     ElementType
  config   Json
  style    Json?
  order    Int
  report   Report
}

model ReportGeneration {
  id           String
  data         Json
  report       Report
  submission   FormSubmission?
  project      Project?
  generatedBy  User?
  generatedAt  DateTime
}
```

#### **Controllers**
- `report.controller.ts` - CRUD de relatórios e elementos
- Processamento de dados dinâmicos
- Geração de instâncias

#### **Routes**
```
GET    /api/reports                          - Listar relatórios
GET    /api/reports/:id                      - Obter relatório
POST   /api/reports                          - Criar relatório
PUT    /api/reports/:id                      - Atualizar relatório
DELETE /api/reports/:id                      - Deletar relatório

POST   /api/reports/:reportId/elements       - Adicionar elemento
PUT    /api/reports/elements/:elementId      - Atualizar elemento
DELETE /api/reports/elements/:elementId      - Deletar elemento

POST   /api/reports/:reportId/generate       - Gerar relatório
GET    /api/reports/:reportId/generations    - Listar gerações
GET    /api/reports/generations/:generationId - Obter geração
```

### Frontend

#### **Páginas**

1. **ReportsList** (`/reports`)
   - Lista todos os relatórios
   - Filtros por status
   - Cards informativos

2. **ReportBuilder** (`/reports/new`, `/reports/:id/edit`)
   - Editor visual de relatórios
   - Adicionar e configurar elementos
   - Reordenar elementos
   - Preview em tempo real

3. **ReportGenerate** (`/reports/:id/generate`)
   - Selecionar dados para vinculação
   - Escolher submissão de formulário
   - Gerar instância

4. **ReportViewer** (`/reports/view/:generationId`)
   - Visualizar relatório gerado
   - Imprimir / Exportar PDF
   - Dados processados

#### **Componentes**

Todos os componentes de elementos suportam modo de **edição** e **visualização**:

- `TextElement.tsx`
- `TableElement.tsx`
- `ChartElement.tsx`
- `ImageElement.tsx`
- `DividerElement.tsx`
- `SpacerElement.tsx`

## 🚀 Como Usar

### 1. Criar um Novo Relatório

```typescript
// 1. Acessar /reports
// 2. Clicar em "Novo Relatório"
// 3. Preencher informações básicas
// 4. Salvar
```

### 2. Adicionar Elementos

```typescript
// 1. No editor, clicar "Adicionar Elemento"
// 2. Escolher tipo (Texto, Tabela, Gráfico, etc)
// 3. Configurar propriedades
// 4. Usar variáveis dinâmicas conforme necessário
```

### 3. Exemplo: Tabela com Dados Vinculados

```typescript
// Na célula da tabela, inserir:
{{field.resistencia_compressao}}

// Durante a geração, o sistema substituirá pelo valor real
```

### 4. Exemplo: Texto Dinâmico

```typescript
Obra: {{project.name}}
Endereço: {{project.address}}
Responsável: {{submittedBy.name}}
Data: {{currentDate}}

Resultado do ensaio: {{field.resultado}} MPa
Status: {{calc.status_final}}
```

### 5. Gerar Relatório

```typescript
// 1. Acessar relatório criado
// 2. Clicar "Gerar"
// 3. Selecionar projeto e submissão (opcional)
// 4. Gerar instância
// 5. Visualizar e imprimir
```

## 🎨 Exemplo Completo

### Relatório de Ensaio de Concreto

```typescript
// Elemento 1: Texto (Cabeçalho)
Relatório de Ensaio de Compressão de Concreto
Obra: {{project.name}}
Código: {{project.code}}

// Elemento 2: Divisor
---

// Elemento 3: Tabela (Dados do Ensaio)
| Campo              | Valor                       |
|--------------------|----------------------------|
| Data do Ensaio     | {{field.data_ensaio}}      |
| Corpo de Prova     | {{field.corpo_prova}}      |
| Idade (dias)       | {{field.idade}}            |
| Resistência (MPa)  | {{field.resistencia}}      |
| Status             | {{calc.status}}            |

// Elemento 4: Gráfico (Evolução)
Tipo: Linha
Dados vinculados: {{field.historico_resistencias}}

// Elemento 5: Texto (Conclusão)
Responsável Técnico: {{submittedBy.name}}
Data do Relatório: {{currentDate}}
```

## 🔒 Permissões

- **SUPERADMIN**: Acesso total
- **ADMIN**: Criar/editar relatórios da empresa
- **ENGENHEIRO**: Criar/editar relatórios dos projetos
- **LABORATORISTA**: Apenas visualizar

## 📱 Funcionalidades Futuras

### Em Desenvolvimento
- [ ] Exportação para PDF
- [ ] Templates de relatórios
- [ ] Relatórios recorrentes automáticos
- [ ] Envio por email
- [ ] Assinatura digital
- [ ] Gráficos avançados (scatter, radar)
- [ ] Modo de edição colaborativa
- [ ] Versionamento de relatórios

### Planejadas
- [ ] Integração com storage de imagens
- [ ] Editor de fórmulas visual
- [ ] Anexos de arquivos
- [ ] Watermark personalizado
- [ ] QR Code com link de verificação
- [ ] Relatórios em múltiplos idiomas

## 🧪 Testes

### Backend
```bash
cd backend
npm test -- report.controller.spec.ts
```

### Frontend
```bash
cd frontend
npm test -- ReportBuilder.test.tsx
```

## 📚 Exemplos de Uso Real

### 1. Relatório de Inspeção Diária
- Texto: Data e responsável
- Tabela: Checklist de itens inspecionados
- Imagens: Fotos da obra
- Texto: Observações e pendências

### 2. Relatório de Medições Mensais
- Texto: Período e projeto
- Tabela: Serviços executados com quantidades
- Gráfico: Evolução física vs planejado
- Tabela: Resumo financeiro

### 3. Relatório de Ensaios de Laboratório
- Texto: Informações da amostra
- Tabela: Resultados dos ensaios
- Gráfico: Comparação com especificações
- Texto: Parecer técnico

## 🔧 Troubleshooting

### Problema: Variável não é substituída
**Solução**: Verificar se a variável existe na submissão vinculada e se a sintaxe está correta `{{tipo.chave}}`

### Problema: Gráfico não renderiza
**Solução**: Verificar formato JSON dos dados e se Chart.js está instalado

### Problema: Tabela muito grande
**Solução**: Considerar dividir em múltiplas tabelas menores ou usar paginação

## 📞 Suporte

Para dúvidas ou problemas:
1. Consultar documentação completa em `/docs`
2. Verificar exemplos em `/examples`
3. Contatar equipe de desenvolvimento

---

**Desenvolvido por**: Equipe Labore  
**Versão**: 1.0.0  
**Data**: Dezembro 2024





