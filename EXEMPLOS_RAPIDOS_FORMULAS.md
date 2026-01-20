# ⚡ Exemplos Rápidos de Fórmulas

## 📋 Copie e Cole - Exemplos Prontos

### 🔢 Matemática Básica

```javascript
// Cálculo simples
total = valor * quantidade

// Com arredondamento
total = ROUND(valor * quantidade, 2)

// Porcentagem
desconto = valor * (percentual / 100)

// Potência
area = lado ^ 2
volume = lado ^ 3

// Raiz quadrada
diagonal = sqrt(lado1^2 + lado2^2)
```

### 🧠 Condicionais

```javascript
// IF simples
status = IF(nota >= 7, "Aprovado", "Reprovado")

// IF aninhado
conceito = IF(nota >= 9, "A", IF(nota >= 7, "B", IF(nota >= 5, "C", "D")))

// IFS (mais limpo)
conceito = IFS(
  nota >= 9, "A",
  nota >= 7, "B",
  nota >= 5, "C",
  "D"
)

// SWITCH
frete = SWITCH(
  regiao,
  "SP", 50,
  "RJ", 60,
  "MG", 70,
  100
)
```

### 🔵 Lógica

```javascript
// AND - Todas as condições devem ser verdadeiras
aprovado = IF(AND(nota >= 7, frequencia >= 75), "Sim", "Não")

// OR - Pelo menos uma condição deve ser verdadeira
urgente = IF(OR(prioridade == "alta", prazo < 3), "Sim", "Não")

// NOT - Inverte o valor
inativo = NOT(ativo)

// Combinado
valido = IF(
  AND(
    valor > 0,
    OR(tipo == "A", tipo == "B")
  ),
  "Válido",
  "Inválido"
)
```

### 📝 Texto

```javascript
// Maiúsculas/Minúsculas
nome_upper = UPPER(nome)
nome_lower = LOWER(nome)

// Concatenar
nome_completo = CONCAT(nome, " ", sobrenome)
codigo = CONCAT("OBRA-", numero, "-", ano)

// Extrair partes
iniciais = LEFT(nome, 3)
final = RIGHT(codigo, 4)

// Tamanho
tamanho = LEN(texto)

// Limpar espaços
nome_limpo = TRIM(nome)

// Formatação complexa
etiqueta = CONCAT(
  UPPER(LEFT(nome, 3)),
  "-",
  codigo,
  " (",
  status,
  ")"
)
```

### 📅 Data e Hora

```javascript
// Data atual
hoje = NOW()
hoje_meia_noite = TODAY()

// Extrair componentes
ano = YEAR(data)
mes = MONTH(data)
dia = DAY(data)

// Diferença em dias
dias_corridos = DAYSDIFF(data_inicio, data_fim)
dias_desde_inicio = DAYSDIFF(data_inicio, NOW())

// Idade aproximada
idade = ROUNDDOWN(DAYSDIFF(data_nascimento, NOW()) / 365, 0)

// Status de prazo
status_prazo = IF(
  DAYSDIFF(NOW(), data_entrega) < 0,
  "Atrasado",
  "No prazo"
)
```

### 📊 Estatística

```javascript
// Média
media = AVERAGE(nota1, nota2, nota3, nota4)

// Soma
total = SUM(valor1, valor2, valor3)

// Mínimo e Máximo
menor = MIN(valor1, valor2, valor3)
maior = MAX(valor1, valor2, valor3)

// Contar
quantidade = COUNT(campo1, campo2, campo3)
preenchidos = COUNTA(campo1, campo2, campo3)

// Análise de resistências
media_resistencia = AVERAGE(res_1, res_2, res_3)
resistencia_minima = MIN(res_1, res_2, res_3)
resistencia_maxima = MAX(res_1, res_2, res_3)
```

### ✅ Verificação

```javascript
// Verificar se está vazio
validacao = IF(ISBLANK(campo), "Campo obrigatório", "OK")

// Verificar se é número
validacao = IF(ISNUMBER(valor), "OK", "Deve ser número")

// Verificar se é texto
validacao = IF(ISTEXT(nome), "OK", "Deve ser texto")

// Validação completa
status_validacao = IF(
  ISBLANK(nome),
  "Nome obrigatório",
  IF(
    ISBLANK(email),
    "Email obrigatório",
    IF(
      NOT(ISNUMBER(idade)),
      "Idade deve ser número",
      "OK"
    )
  )
)
```

---

## 🏗️ Exemplos para Construção Civil

### Controle de Concreto

```javascript
// Campos: res_1, res_2, res_3, fck_projeto

// Média
fck_medio = AVERAGE(res_1, res_2, res_3)

// Mínimo
fck_minimo = MIN(res_1, res_2, res_3)

// Desvio
desvio = ROUND(((fck_medio - fck_projeto) / fck_projeto) * 100, 2)

// Aprovação
aprovado = IF(
  AND(fck_medio >= fck_projeto, fck_minimo >= fck_projeto * 0.9),
  "APROVADO",
  "REPROVADO"
)

// Classificação
classificacao = IFS(
  fck_medio >= fck_projeto * 1.2, "Excelente",
  fck_medio >= fck_projeto * 1.1, "Muito Bom",
  fck_medio >= fck_projeto, "Adequado",
  "Inadequado"
)
```

### Gestão de Prazo

```javascript
// Campos: data_inicio, data_fim_prevista, percentual_concluido

// Dias totais
dias_totais = DAYSDIFF(data_inicio, data_fim_prevista)

// Dias decorridos
dias_decorridos = DAYSDIFF(data_inicio, NOW())

// Percentual de tempo
percentual_tempo = ROUND((dias_decorridos / dias_totais) * 100, 2)

// Status
status = IFS(
  percentual_concluido >= percentual_tempo + 10, "Adiantado",
  percentual_concluido >= percentual_tempo - 10, "No prazo",
  "Atrasado"
)

// Dias restantes
dias_restantes = DAYSDIFF(NOW(), data_fim_prevista)

// Alerta
alerta = IF(
  AND(dias_restantes < 30, percentual_concluido < 90),
  "URGENTE: Risco de não conclusão",
  IF(dias_restantes < 0, "ATRASADO", "Normal")
)
```

### Cálculo de Área e Volume

```javascript
// Campos: comprimento, largura, altura

// Área
area = comprimento * largura

// Perímetro
perimetro = 2 * (comprimento + largura)

// Volume
volume = comprimento * largura * altura

// Superfície total
superficie = 2 * (comprimento * largura + comprimento * altura + largura * altura)

// Quantidade de concreto (com 10% de perda)
qtd_concreto = ROUNDUP(volume * 1.1, 2)

// Quantidade de forma (com 5% de perda)
qtd_forma = ROUNDUP(superficie * 1.05, 2)
```

### Orçamento com Descontos

```javascript
// Campos: valor_unitario, quantidade, tipo_cliente

// Subtotal
subtotal = valor_unitario * quantidade

// Desconto por quantidade
desconto_qtd = IFS(
  quantidade >= 100, 15,
  quantidade >= 50, 10,
  quantidade >= 20, 5,
  0
)

// Desconto adicional para cliente VIP
desconto_vip = IF(tipo_cliente == "vip", 5, 0)

// Desconto total
desconto_total = desconto_qtd + desconto_vip

// Valor do desconto
valor_desconto = subtotal * (desconto_total / 100)

// Total com desconto
total_com_desconto = subtotal - valor_desconto

// Imposto (10%)
valor_imposto = total_com_desconto * 0.10

// Total final
total_final = ROUND(total_com_desconto + valor_imposto, 2)

// Mensagem
mensagem = CONCAT(
  "Desconto aplicado: ",
  TEXT(desconto_total),
  "% - Total: R$ ",
  TEXT(total_final)
)
```

### Controle de Estoque

```javascript
// Campos: qtd_atual, qtd_minima, qtd_maxima, consumo_diario

// Status
status = IFS(
  qtd_atual < qtd_minima, "CRÍTICO",
  qtd_atual < qtd_minima * 1.5, "BAIXO",
  qtd_atual > qtd_maxima, "EXCESSO",
  "NORMAL"
)

// Dias de estoque
dias_estoque = IF(
  consumo_diario > 0,
  ROUNDDOWN(qtd_atual / consumo_diario, 0),
  999
)

// Quantidade a comprar
qtd_comprar = IF(
  qtd_atual < qtd_minima,
  qtd_maxima - qtd_atual,
  0
)

// Urgência
urgencia = IFS(
  dias_estoque < 3, "URGENTE - Comprar hoje",
  dias_estoque < 7, "Alta - Comprar esta semana",
  dias_estoque < 15, "Média - Programar compra",
  "Baixa - Estoque adequado"
)

// Alerta
alerta = IF(
  OR(qtd_atual < qtd_minima, dias_estoque < 7),
  CONCAT("⚠️ ", status, " - ", urgencia),
  "✓ Estoque OK"
)
```

---

## 💼 Exemplos Empresariais

### Análise de Vendas

```javascript
// Campos: valor_venda, meta, mes

// Percentual da meta
percentual_meta = ROUND((valor_venda / meta) * 100, 2)

// Status
status_meta = IFS(
  percentual_meta >= 120, "Superou meta",
  percentual_meta >= 100, "Atingiu meta",
  percentual_meta >= 80, "Próximo da meta",
  "Abaixo da meta"
)

// Comissão progressiva
comissao_percentual = IFS(
  percentual_meta >= 120, 8,
  percentual_meta >= 100, 6,
  percentual_meta >= 80, 4,
  2
)

// Valor da comissão
valor_comissao = valor_venda * (comissao_percentual / 100)

// Relatório
relatorio = CONCAT(
  "Mês: ", TEXT(mes),
  " - Meta: ", TEXT(percentual_meta), "%",
  " - Comissão: R$ ", TEXT(ROUND(valor_comissao, 2))
)
```

### Avaliação de Desempenho

```javascript
// Campos: produtividade, qualidade, pontualidade (0-10)

// Média ponderada (qualidade vale mais)
nota_final = ROUND(
  (produtividade * 3 + qualidade * 4 + pontualidade * 3) / 10,
  2
)

// Conceito
conceito = IFS(
  nota_final >= 9, "Excelente",
  nota_final >= 8, "Muito Bom",
  nota_final >= 7, "Bom",
  nota_final >= 6, "Regular",
  "Insuficiente"
)

// Bônus
bonus_percentual = IFS(
  nota_final >= 9, 15,
  nota_final >= 8, 10,
  nota_final >= 7, 5,
  0
)

// Ponto fraco
ponto_fraco = SWITCH(
  MIN(produtividade, qualidade, pontualidade),
  produtividade, "Produtividade",
  qualidade, "Qualidade",
  pontualidade, "Pontualidade",
  "Nenhum"
)

// Feedback
feedback = CONCAT(
  "Conceito: ", conceito,
  " (", TEXT(nota_final), ")",
  " - Melhorar: ", ponto_fraco
)
```

### Análise de Custos

```javascript
// Campos: custo_fixo, custo_variavel, receita

// Custo total
custo_total = custo_fixo + custo_variavel

// Lucro
lucro = receita - custo_total

// Margem de lucro
margem = ROUND((lucro / receita) * 100, 2)

// Status financeiro
status = IFS(
  margem >= 30, "Excelente",
  margem >= 20, "Bom",
  margem >= 10, "Regular",
  margem > 0, "Baixo",
  "Prejuízo"
)

// Ponto de equilíbrio
ponto_equilibrio = IF(
  receita > custo_total,
  "Acima do ponto de equilíbrio",
  "Abaixo do ponto de equilíbrio"
)

// Relatório
relatorio = CONCAT(
  "Lucro: R$ ", TEXT(ROUND(lucro, 2)),
  " - Margem: ", TEXT(margem), "%",
  " - Status: ", status
)
```

---

## 🎓 Dicas e Truques

### Validação em Cascata

```javascript
// Valida múltiplos campos em sequência
validacao = IF(
  ISBLANK(nome), "Nome obrigatório",
  IF(ISBLANK(email), "Email obrigatório",
    IF(ISBLANK(telefone), "Telefone obrigatório",
      IF(NOT(ISNUMBER(idade)), "Idade inválida",
        "OK"
      )
    )
  )
)
```

### Formatação de Moeda

```javascript
// Simula formatação de moeda
valor_formatado = CONCAT("R$ ", TEXT(ROUND(valor, 2)))
```

### Cálculo de Idade Preciso

```javascript
// Idade em anos completos
idade = ROUNDDOWN(DAYSDIFF(data_nascimento, NOW()) / 365.25, 0)
```

### Classificação por Faixas

```javascript
// Classificação de valores em faixas
faixa = IFS(
  valor <= 1000, "Faixa 1 (até R$ 1.000)",
  valor <= 5000, "Faixa 2 (R$ 1.001 a R$ 5.000)",
  valor <= 10000, "Faixa 3 (R$ 5.001 a R$ 10.000)",
  "Faixa 4 (acima de R$ 10.000)"
)
```

### Semáforo de Status

```javascript
// Status visual com emojis
semaforo = IFS(
  status == "critico", "🔴 Crítico",
  status == "atencao", "🟡 Atenção",
  status == "normal", "🟢 Normal",
  "⚪ Indefinido"
)
```

---

## 📚 Referência Rápida de Funções

### Condicionais
- `IF(condição, verdadeiro, falso)`
- `IFS(cond1, val1, cond2, val2, ..., padrão)`
- `SWITCH(expr, val1, res1, ..., padrão)`

### Lógica
- `AND(a, b, ...)` - E lógico
- `OR(a, b, ...)` - OU lógico
- `NOT(a)` - NÃO lógico
- `==, !=, <, >, <=, >=` - Comparação

### Matemática
- `ROUND(num, decimais)` - Arredondar
- `ROUNDUP(num, decimais)` - Arredondar para cima
- `ROUNDDOWN(num, decimais)` - Arredondar para baixo
- `POWER(base, exp)` - Potência
- `sqrt(num)` - Raiz quadrada
- `abs(num)` - Valor absoluto
- `MOD(num, divisor)` - Resto da divisão

### Estatística
- `AVERAGE(a, b, ...)` - Média
- `SUM(a, b, ...)` - Soma
- `MIN(a, b, ...)` - Mínimo
- `MAX(a, b, ...)` - Máximo
- `COUNT(a, b, ...)` - Contar

### Texto
- `UPPER(texto)` - Maiúsculas
- `LOWER(texto)` - Minúsculas
- `TRIM(texto)` - Remove espaços
- `CONCAT(a, b, ...)` - Concatenar
- `LEN(texto)` - Tamanho
- `LEFT(texto, n)` - Primeiros N caracteres
- `RIGHT(texto, n)` - Últimos N caracteres

### Data
- `NOW()` - Data/hora atual
- `TODAY()` - Data atual (meia-noite)
- `YEAR(data)` - Extrair ano
- `MONTH(data)` - Extrair mês
- `DAY(data)` - Extrair dia
- `DAYSDIFF(data1, data2)` - Diferença em dias

### Verificação
- `ISBLANK(valor)` - Está vazio?
- `ISNUMBER(valor)` - É número?
- `ISTEXT(valor)` - É texto?

---

**💡 Dica:** Salve este arquivo como referência rápida! Copie e cole os exemplos diretamente no FormBuilder.




