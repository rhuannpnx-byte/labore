# 🚀 Guia Rápido - Módulo de Relatórios

## ⚡ Início Rápido (5 minutos)

### 1️⃣ Criar Relatório Básico

1. Acesse **http://localhost:5173/reports**
2. Clique em **"+ Novo Relatório"**
3. Preencha:
   - Título: "Meu Primeiro Relatório"
   - Descrição: "Relatório de teste"
   - Status: "Rascunho"
4. Clique em **"Salvar Relatório"**

### 2️⃣ Adicionar Elementos

#### Adicionar Texto
1. Clique em **"+ Adicionar Elemento"**
2. Escolha **"📝 Texto"**
3. Digite: 
   ```
   Obra: {{project.name}}
   Data: {{currentDate}}
   ```
4. Configure estilo (tamanho, cor, alinhamento)
5. Clique em **"Fechar"**

#### Adicionar Tabela
1. Clique em **"+ Adicionar Elemento"**
2. Escolha **"📊 Tabela"**
3. Adicione colunas/linhas conforme necessário
4. Preencha dados ou use variáveis como `{{field.valor}}`
5. Configure cores e bordas

#### Adicionar Gráfico
1. Clique em **"+ Adicionar Elemento"**
2. Escolha **"📈 Gráfico"**
3. Selecione tipo (Barras, Linha, Pizza)
4. Cole dados JSON:
   ```json
   {
     "labels": ["Jan", "Fev", "Mar"],
     "datasets": [{
       "label": "Vendas",
       "data": [10, 20, 15],
       "backgroundColor": "#3b82f6"
     }]
   }
   ```
5. Ajuste título, cores e legendas

### 3️⃣ Gerar Relatório com Dados Reais

1. Volte para lista de relatórios (`/reports`)
2. No card do relatório, clique em **"Gerar"**
3. Selecione:
   - **Projeto**: Escolha o projeto ativo
   - **Submissão** (opcional): Escolha uma submissão de formulário
4. Clique em **"🚀 Gerar Relatório"**
5. Visualize o relatório com dados reais
6. Use **"🖨️ Imprimir / PDF"** para exportar

## 📋 Variáveis Mais Usadas

### Projeto/Obra
```
{{project.name}}       - Nome da obra
{{project.code}}       - Código da obra
{{project.address}}    - Endereço
{{company.name}}       - Nome da empresa
```

### Formulário
```
{{form.title}}         - Título do formulário
{{submittedBy.name}}   - Quem preencheu
{{submittedAt}}        - Quando foi preenchido
```

### Campos e Cálculos
```
{{field.CHAVE_DO_CAMPO}}      - Ex: {{field.resistencia}}
{{calc.CHAVE_DO_CALCULO}}     - Ex: {{calc.total}}
```

### Sistema
```
{{currentDate}}        - Data atual
{{currentDateTime}}    - Data e hora atual
{{currentUser.name}}   - Usuário logado
```

## 🎯 Exemplos Práticos

### Exemplo 1: Cabeçalho de Relatório
```
=== RELATÓRIO DE INSPEÇÃO ===

Obra: {{project.name}}
Endereço: {{project.address}}
Data: {{currentDate}}
Inspetor: {{submittedBy.name}}

---
```

### Exemplo 2: Tabela de Medições
```
| Item          | Quantidade      | Unidade |
|---------------|-----------------|---------|
| Concreto      | {{field.qtd_concreto}} | m³      |
| Aço           | {{field.qtd_aco}}      | kg      |
| Forma         | {{field.qtd_forma}}    | m²      |
```

### Exemplo 3: Resultado de Ensaio
```
Corpo de Prova: {{field.cp_numero}}
Resistência: {{field.resistencia}} MPa
Status: {{calc.aprovado}}

Conclusão: O corpo de prova apresentou resistência 
de {{field.resistencia}} MPa, sendo {{calc.status_texto}}.
```

## 🎨 Dicas de Design

### ✅ Boas Práticas
- Use **títulos em negrito** para seções
- Adicione **divisores** entre seções
- Use **espaçamento** para organizar conteúdo
- Tabelas com **linhas alternadas** são mais legíveis
- Cores **consistentes** para identidade visual

### ❌ Evite
- Muitos elementos sem organização
- Cores muito vibrantes que dificultam impressão
- Tabelas muito largas (considere dividir)
- Gráficos sem título ou legenda

## 🔧 Solução Rápida de Problemas

### ❓ Variável aparece como texto
**Causa**: Relatório não foi "gerado", apenas visualizado no editor
**Solução**: Use o botão "Gerar" para criar instância com dados reais

### ❓ Gráfico não aparece
**Causa**: Dados JSON inválidos
**Solução**: Valide JSON em jsonlint.com antes de colar

### ❓ Tabela desalinhada
**Causa**: Colunas com larguras fixas muito pequenas
**Solução**: Aumente largura das colunas ou use "auto"

### ❓ Não consigo adicionar elementos
**Causa**: Relatório ainda não foi salvo
**Solução**: Salve o relatório primeiro

## 📊 Tipos de Gráficos

### Barras
Ideal para: Comparar valores entre categorias
```json
{
  "labels": ["Cat A", "Cat B", "Cat C"],
  "datasets": [{
    "label": "Valores",
    "data": [10, 20, 15]
  }]
}
```

### Linha
Ideal para: Mostrar evolução temporal
```json
{
  "labels": ["Jan", "Fev", "Mar", "Abr"],
  "datasets": [{
    "label": "Evolução",
    "data": [10, 15, 13, 20],
    "borderColor": "#3b82f6"
  }]
}
```

### Pizza
Ideal para: Mostrar proporções
```json
{
  "labels": ["Item 1", "Item 2", "Item 3"],
  "datasets": [{
    "data": [30, 50, 20],
    "backgroundColor": ["#ef4444", "#3b82f6", "#10b981"]
  }]
}
```

## 🎯 Casos de Uso Comuns

### 1. Relatório de Ensaio
- ✅ Cabeçalho com dados da obra
- ✅ Tabela com parâmetros do ensaio
- ✅ Gráfico de comparação com norma
- ✅ Texto com parecer técnico

### 2. Boletim de Medição
- ✅ Período e projeto
- ✅ Tabela com serviços e quantidades
- ✅ Gráfico de evolução física
- ✅ Total acumulado

### 3. Check-list Diário
- ✅ Data e responsável
- ✅ Tabela de itens verificados
- ✅ Fotos (imagens)
- ✅ Observações finais

## 🚀 Próximos Passos

1. ✅ Crie seu primeiro relatório de teste
2. ✅ Adicione diferentes tipos de elementos
3. ✅ Use variáveis dinâmicas
4. ✅ Gere uma instância com dados reais
5. ✅ Compartilhe com sua equipe

## 💡 Dica Final

**Crie templates reutilizáveis!**

Crie relatórios "modelo" no status "Ativo" e duplique-os quando precisar de um novo relatório similar. Isso economiza tempo e garante padronização.

---

**Dúvidas?** Consulte a documentação completa em `MODULO_RELATORIOS.md`





