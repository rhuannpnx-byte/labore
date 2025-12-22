# 🚀 Linguagem de Fórmulas Avançada - Guia Completo

## 📋 Índice

1. [Visão Geral](#visão-geral)
2. [Operadores](#operadores)
3. [Funções Matemáticas](#funções-matemáticas)
4. [Funções Lógicas e Condicionais](#funções-lógicas-e-condicionais)
5. [Funções de Texto](#funções-de-texto)
6. [Funções de Data](#funções-de-data)
7. [Funções Estatísticas](#funções-estatísticas)
8. [Funções de Verificação](#funções-de-verificação)
9. [Exemplos Práticos](#exemplos-práticos)
10. [Referências a Campos e Regras](#referências-a-campos-e-regras)

---

## 🎯 Visão Geral

O motor de fórmulas agora suporta uma linguagem de programação completa para processamento de dados, similar ao Excel/Google Sheets, mas com recursos adicionais para engenharia e construção civil.

### Características:
- ✅ **Operações matemáticas** completas
- ✅ **Operadores lógicos** (AND, OR, NOT, XOR)
- ✅ **Condicionais** (IF, IFS, SWITCH)
- ✅ **Funções de string** (UPPER, LOWER, CONCAT, etc)
- ✅ **Funções de data** (NOW, DAYSDIFF, etc)
- ✅ **Funções estatísticas** (AVERAGE, SUM, COUNT, etc)
- ✅ **Referências a campos e regras**
- ✅ **Suporte a múltiplos tipos** (número, texto, booleano, data)

---

## ⚙️ Operadores

### Operadores Aritméticos

| Operador | Descrição | Exemplo | Resultado |
|----------|-----------|---------|-----------|
| `+` | Adição | `5 + 3` | `8` |
| `-` | Subtração | `10 - 4` | `6` |
| `*` | Multiplicação | `7 * 6` | `42` |
| `/` | Divisão | `20 / 4` | `5` |
| `^` | Potência | `2 ^ 3` | `8` |
| `%` ou `MOD` | Módulo (resto) | `10 % 3` | `1` |

### Operadores de Comparação

| Operador | Descrição | Exemplo | Resultado |
|----------|-----------|---------|-----------|
| `==` | Igual a | `5 == 5` | `true` |
| `!=` | Diferente de | `5 != 3` | `true` |
| `>` | Maior que | `10 > 5` | `true` |
| `<` | Menor que | `3 < 7` | `true` |
| `>=` | Maior ou igual | `5 >= 5` | `true` |
| `<=` | Menor ou igual | `4 <= 6` | `true` |

### Operadores Lógicos

| Operador | Descrição | Exemplo |
|----------|-----------|---------|
| `AND(a, b, ...)` | E lógico | `AND(true, true)` → `true` |
| `OR(a, b, ...)` | OU lógico | `OR(false, true)` → `true` |
| `NOT(a)` | NÃO lógico | `NOT(false)` → `true` |
| `XOR(a, b)` | OU exclusivo | `XOR(true, false)` → `true` |

---

## 🔢 Funções Matemáticas

### Básicas

```javascript
// Arredondamento
ROUND(3.14159, 2)        // 3.14
ROUNDUP(3.14, 1)         // 3.2
ROUNDDOWN(3.99, 0)       // 3

// Valor absoluto e sinal
abs(-5)                  // 5
sign(-10)                // -1
sign(10)                 // 1

// Potência e raiz
POWER(2, 3)              // 8
sqrt(16)                 // 4
cbrt(27)                 // 3

// Limites
ceil(3.2)                // 4
floor(3.8)               // 3
CLAMP(15, 0, 10)         // 10 (limita entre 0 e 10)
```

### Trigonométricas

```javascript
sin(pi / 2)              // 1
cos(0)                   // 1
tan(pi / 4)              // 1
asin(1)                  // pi/2
acos(1)                  // 0
atan(1)                  // pi/4
```

### Logarítmicas e Exponenciais

```javascript
log(100)                 // 2 (log base 10)
ln(e)                    // 1 (log natural)
log2(8)                  // 3
exp(1)                   // e (2.718...)
```

### Constantes

```javascript
pi                       // 3.14159...
e                        // 2.71828...
tau                      // 6.28318... (2*pi)
phi                      // 1.61803... (proporção áurea)
```

---

## 🧠 Funções Lógicas e Condicionais

### IF - Condicional Simples

```javascript
// Sintaxe: IF(condição, valor_se_verdadeiro, valor_se_falso)

IF(idade >= 18, "Adulto", "Menor")
IF(nota >= 7, "Aprovado", "Reprovado")
IF(valor > 1000, valor * 0.9, valor)
```

### IFS - Múltiplas Condições

```javascript
// Sintaxe: IFS(cond1, val1, cond2, val2, ..., valor_padrão)

IFS(
  nota >= 9, "Excelente",
  nota >= 7, "Bom",
  nota >= 5, "Regular",
  "Insuficiente"
)

IFS(
  resistencia >= 30, "Concreto C30",
  resistencia >= 25, "Concreto C25",
  resistencia >= 20, "Concreto C20",
  "Fora do padrão"
)
```

### SWITCH - Seleção por Valor

```javascript
// Sintaxe: SWITCH(expressão, val1, result1, val2, result2, ..., padrão)

SWITCH(
  tipo_concreto,
  "C20", 20,
  "C25", 25,
  "C30", 30,
  0
)

SWITCH(
  dia_semana,
  1, "Segunda",
  2, "Terça",
  3, "Quarta",
  "Outro dia"
)
```

### Condicionais Aninhadas

```javascript
// Múltiplos IFs aninhados
IF(
  AND(idade >= 18, renda > 2000),
  "Aprovado",
  IF(idade >= 18, "Análise manual", "Negado")
)

// Combinando com operadores lógicos
IF(
  OR(status == "urgente", prioridade > 5),
  "Processar imediatamente",
  "Processar normalmente"
)
```

---

## 📝 Funções de Texto

### Manipulação Básica

```javascript
// Conversão de caso
UPPER("hello")           // "HELLO"
LOWER("WORLD")           // "world"

// Remoção de espaços
TRIM("  texto  ")        // "texto"

// Tamanho
LEN("Hello")             // 5
```

### Extração de Texto

```javascript
// LEFT - Primeiros N caracteres
LEFT("Hello World", 5)   // "Hello"

// RIGHT - Últimos N caracteres
RIGHT("Hello World", 5)  // "World"

// MID - Substring do meio
MID("Hello World", 6, 5) // "World"
```

### Concatenação

```javascript
// CONCAT - Juntar textos
CONCAT("Obra ", codigo, " - ", nome)
// Resultado: "Obra 123 - Edifício Central"

CONCAT(UPPER(nome), " (", status, ")")
// Resultado: "JOÃO SILVA (Ativo)"
```

### Conversão

```javascript
// TEXT - Converter para texto
TEXT(123)                // "123"
TEXT(true)               // "true"
```

---

## 📅 Funções de Data

### Obter Data/Hora Atual

```javascript
// NOW - Data e hora atual (timestamp)
NOW()                    // 1703260800000

// TODAY - Data atual (meia-noite)
TODAY()                  // 1703203200000
```

### Extrair Componentes

```javascript
// YEAR - Ano
YEAR(data_nascimento)    // 1990

// MONTH - Mês (1-12)
MONTH(data_inicio)       // 12

// DAY - Dia do mês (1-31)
DAY(data_fim)            // 25
```

### Cálculos com Datas

```javascript
// DAYSDIFF - Diferença em dias
DAYSDIFF(data_inicio, data_fim)
// Resultado: 30 (se houver 30 dias de diferença)

// Exemplo prático: prazo de obra
IF(
  DAYSDIFF(data_inicio, NOW()) > 90,
  "Atrasado",
  "No prazo"
)
```

### Exemplos Práticos

```javascript
// Idade em anos (aproximado)
ROUNDDOWN(DAYSDIFF(data_nascimento, NOW()) / 365, 0)

// Dias úteis restantes (considerando 5 dias/semana)
ROUNDDOWN(DAYSDIFF(NOW(), data_entrega) * 5 / 7, 0)

// Ano da obra
YEAR(data_inicio)
```

---

## 📊 Funções Estatísticas

### Agregação

```javascript
// SUM - Soma
SUM(10, 20, 30, 40)      // 100

// AVERAGE - Média
AVERAGE(10, 20, 30, 40)  // 25

// MIN - Mínimo
MIN(5, 2, 8, 1, 9)       // 1

// MAX - Máximo
MAX(5, 2, 8, 1, 9)       // 9
```

### Contagem

```javascript
// COUNT - Conta valores não nulos
COUNT(10, 20, null, 30)  // 3

// COUNTA - Conta valores não vazios
COUNTA(10, "", null, 30) // 2
```

### Exemplos Práticos

```javascript
// Média de resistências
AVERAGE(resistencia_1, resistencia_2, resistencia_3)

// Valor máximo entre opções
MAX(orcamento_a, orcamento_b, orcamento_c)

// Quantidade de campos preenchidos
COUNTA(campo1, campo2, campo3, campo4)
```

---

## ✅ Funções de Verificação

### Verificação de Tipo

```javascript
// ISBLANK - Verifica se está vazio
ISBLANK(campo)           // true se vazio

// ISNUMBER - Verifica se é número
ISNUMBER(valor)          // true se for número

// ISTEXT - Verifica se é texto
ISTEXT(nome)             // true se for texto

// ISERROR - Verifica se há erro
ISERROR(resultado)       // true se houver erro
```

### Exemplos Práticos

```javascript
// Validação de campo obrigatório
IF(ISBLANK(nome), "Campo obrigatório", "OK")

// Verificar tipo antes de calcular
IF(ISNUMBER(valor), valor * 1.1, 0)

// Tratamento de erro
IF(ISERROR(calculo), "Erro no cálculo", calculo)
```

---

## 💡 Exemplos Práticos

### 1. Cálculo de Orçamento com Descontos Progressivos

```javascript
// Campos: valor_base, quantidade

// Regra 1: Subtotal
subtotal = valor_base * quantidade

// Regra 2: Percentual de desconto baseado em quantidade
desconto_percentual = IFS(
  quantidade >= 100, 15,
  quantidade >= 50, 10,
  quantidade >= 20, 5,
  0
)

// Regra 3: Valor do desconto
valor_desconto = subtotal * (desconto_percentual / 100)

// Regra 4: Total com desconto
total_com_desconto = subtotal - valor_desconto

// Regra 5: Imposto (10%)
valor_imposto = total_com_desconto * 0.10

// Regra 6: Total final
total_final = total_com_desconto + valor_imposto
```

### 2. Controle de Qualidade de Concreto

```javascript
// Campos: resistencia_1, resistencia_2, resistencia_3, fck_projeto

// Regra 1: Resistência média
resistencia_media = AVERAGE(resistencia_1, resistencia_2, resistencia_3)

// Regra 2: Resistência mínima
resistencia_minima = MIN(resistencia_1, resistencia_2, resistencia_3)

// Regra 3: Desvio da média
desvio_percentual = ROUND(
  ((resistencia_media - fck_projeto) / fck_projeto) * 100,
  2
)

// Regra 4: Status de aprovação
status_aprovacao = IFS(
  AND(resistencia_media >= fck_projeto, resistencia_minima >= fck_projeto * 0.9),
  "APROVADO",
  resistencia_media >= fck_projeto * 0.95,
  "APROVADO COM RESSALVAS",
  "REPROVADO"
)

// Regra 5: Classificação
classificacao = IF(
  resistencia_media >= fck_projeto * 1.2,
  "Excelente",
  IF(
    resistencia_media >= fck_projeto * 1.1,
    "Muito Bom",
    IF(
      resistencia_media >= fck_projeto,
      "Adequado",
      "Inadequado"
    )
  )
)
```

### 3. Gestão de Prazo de Obra

```javascript
// Campos: data_inicio, data_prevista_fim, percentual_concluido

// Regra 1: Dias totais do projeto
dias_totais = DAYSDIFF(data_inicio, data_prevista_fim)

// Regra 2: Dias decorridos
dias_decorridos = DAYSDIFF(data_inicio, NOW())

// Regra 3: Percentual de tempo decorrido
percentual_tempo = ROUND((dias_decorridos / dias_totais) * 100, 2)

// Regra 4: Status do cronograma
status_cronograma = IF(
  percentual_concluido >= percentual_tempo,
  "No prazo",
  IF(
    percentual_concluido >= percentual_tempo - 10,
    "Atenção",
    "Atrasado"
  )
)

// Regra 5: Dias restantes
dias_restantes = DAYSDIFF(NOW(), data_prevista_fim)

// Regra 6: Previsão de conclusão
previsao_conclusao = IF(
  percentual_concluido > 0,
  ROUND((dias_decorridos / percentual_concluido) * 100, 0),
  dias_totais
)

// Regra 7: Alerta de atraso
alerta = IF(
  AND(dias_restantes < 30, percentual_concluido < 90),
  "URGENTE: Risco de não conclusão no prazo",
  IF(
    dias_restantes < 0,
    "ATRASADO: Prazo já vencido",
    "Normal"
  )
)
```

### 4. Cálculo de Área e Volume

```javascript
// Campos: comprimento, largura, altura, tipo_forma

// Regra 1: Área da base
area_base = comprimento * largura

// Regra 2: Volume
volume = SWITCH(
  tipo_forma,
  "retangular", comprimento * largura * altura,
  "cilindrico", pi * POWER(comprimento / 2, 2) * altura,
  "triangular", (comprimento * largura * altura) / 2,
  0
)

// Regra 3: Superfície total
superficie_total = SWITCH(
  tipo_forma,
  "retangular", 2 * (comprimento * largura + comprimento * altura + largura * altura),
  "cilindrico", 2 * pi * (comprimento / 2) * (comprimento / 2 + altura),
  area_base * 2
)

// Regra 4: Quantidade de concreto (m³) com 10% de perda
quantidade_concreto = ROUNDUP(volume * 1.1, 2)

// Regra 5: Quantidade de forma (m²) com 5% de perda
quantidade_forma = ROUNDUP(superficie_total * 1.05, 2)
```

### 5. Validação e Formatação de Dados

```javascript
// Campos: nome, cpf, email, telefone

// Regra 1: Nome formatado
nome_formatado = UPPER(TRIM(nome))

// Regra 2: Validação de CPF (tamanho)
cpf_valido = IF(LEN(cpf) == 11, "Válido", "Inválido")

// Regra 3: Validação de campos obrigatórios
campos_preenchidos = COUNTA(nome, cpf, email, telefone)

// Regra 4: Status de cadastro
status_cadastro = IF(
  campos_preenchidos == 4,
  "Completo",
  CONCAT("Incompleto (", TEXT(campos_preenchidos), "/4)")
)

// Regra 5: Código do cliente
codigo_cliente = CONCAT(
  LEFT(nome_formatado, 3),
  "-",
  RIGHT(cpf, 4)
)
```

### 6. Análise de Custo-Benefício

```javascript
// Campos: custo_opcao_a, custo_opcao_b, qualidade_a, qualidade_b, prazo_a, prazo_b

// Regra 1: Diferença de custo
diferenca_custo = abs(custo_opcao_a - custo_opcao_b)

// Regra 2: Diferença percentual de custo
diferenca_percentual = ROUND(
  (diferenca_custo / MIN(custo_opcao_a, custo_opcao_b)) * 100,
  2
)

// Regra 3: Score Opção A (qualidade + rapidez - custo normalizado)
score_a = qualidade_a + (100 - prazo_a) - (custo_opcao_a / 100)

// Regra 4: Score Opção B
score_b = qualidade_b + (100 - prazo_b) - (custo_opcao_b / 100)

// Regra 5: Melhor opção
melhor_opcao = IF(
  score_a > score_b,
  CONCAT("Opção A (score: ", TEXT(ROUND(score_a, 2)), ")"),
  CONCAT("Opção B (score: ", TEXT(ROUND(score_b, 2)), ")")
)

// Regra 6: Recomendação
recomendacao = IFS(
  abs(score_a - score_b) < 5, "Opções equivalentes - Avaliar outros critérios",
  AND(score_a > score_b, diferenca_percentual < 10), "Opção A recomendada",
  AND(score_b > score_a, diferenca_percentual < 10), "Opção B recomendada",
  "Análise detalhada necessária"
)
```

### 7. Controle de Estoque com Alertas

```javascript
// Campos: quantidade_atual, quantidade_minima, quantidade_maxima, consumo_diario

// Regra 1: Status do estoque
status_estoque = IFS(
  quantidade_atual < quantidade_minima, "CRÍTICO",
  quantidade_atual < quantidade_minima * 1.5, "BAIXO",
  quantidade_atual > quantidade_maxima, "EXCESSO",
  "NORMAL"
)

// Regra 2: Dias de estoque restante
dias_restantes = IF(
  consumo_diario > 0,
  ROUNDDOWN(quantidade_atual / consumo_diario, 0),
  999
)

// Regra 3: Quantidade a comprar
quantidade_comprar = IF(
  quantidade_atual < quantidade_minima,
  quantidade_maxima - quantidade_atual,
  0
)

// Regra 4: Urgência da compra
urgencia = IFS(
  dias_restantes < 3, "URGENTE - Comprar hoje",
  dias_restantes < 7, "Alta - Comprar esta semana",
  dias_restantes < 15, "Média - Programar compra",
  "Baixa - Estoque adequado"
)

// Regra 5: Alerta
alerta_estoque = IF(
  OR(
    quantidade_atual < quantidade_minima,
    dias_restantes < 7
  ),
  CONCAT("⚠️ ", status_estoque, " - ", urgencia),
  "✓ Estoque OK"
)
```

---

## 🔗 Referências a Campos e Regras

### Campos

Campos são referenciados diretamente pelo seu `fieldKey`:

```javascript
// Se você tem um campo com fieldKey = "resistencia_concreto"
resistencia_concreto * 1.2

// Campos podem ser de qualquer tipo
nome                     // texto
idade                    // número
data_nascimento          // data
ativo                    // booleano
```

### Regras

Regras podem referenciar outras regras pelo seu `ruleKey`:

```javascript
// Regra 1
subtotal = valor * quantidade

// Regra 2 (referencia Regra 1)
total_com_desconto = subtotal - desconto

// Regra 3 (referencia Regra 2)
total_final = total_com_desconto + imposto
```

### Ordem de Execução

O sistema **ordena automaticamente** as regras por dependência:

```javascript
// Você pode criar nesta ordem:
Regra C: total_final = total_com_desconto + imposto
Regra A: subtotal = valor * quantidade
Regra B: total_com_desconto = subtotal - desconto

// O sistema executa nesta ordem:
1. Regra A (não depende de nada)
2. Regra B (depende de A)
3. Regra C (depende de B)
```

### Detecção de Ciclos

O sistema detecta e previne dependências circulares:

```javascript
// ❌ ERRO: Dependência circular
Regra A: total = subtotal + regra_b
Regra B: regra_b = total * 0.1

// Erro: "Dependência circular detectada nas regras: regra_a, regra_b"
```

---

## 🎓 Boas Práticas

### 1. Nomeação Clara

```javascript
// ✅ BOM
resistencia_media = AVERAGE(res_1, res_2, res_3)
total_com_desconto = subtotal - desconto

// ❌ EVITE
calc1 = AVERAGE(r1, r2, r3)
x = y - z
```

### 2. Modularização

```javascript
// ✅ BOM - Regras modulares
area_parede = altura * comprimento
area_total = area_parede * 4
quantidade_tinta = area_total / rendimento_tinta

// ❌ EVITE - Tudo em uma regra
quantidade_tinta = (altura * comprimento * 4) / rendimento_tinta
```

### 3. Validação de Dados

```javascript
// ✅ BOM - Valida antes de calcular
resultado = IF(
  AND(ISNUMBER(valor), valor > 0),
  valor * 1.1,
  0
)

// ❌ EVITE - Assume que dados são válidos
resultado = valor * 1.1
```

### 4. Tratamento de Erros

```javascript
// ✅ BOM - Trata divisão por zero
resultado = IF(divisor != 0, dividendo / divisor, 0)

// ❌ EVITE
resultado = dividendo / divisor  // Erro se divisor = 0
```

### 5. Comentários via Nome da Regra

Use o campo `name` da regra para documentar:

```javascript
// Nome: "Cálculo de FCK médio conforme NBR 12655"
fck_medio = AVERAGE(corpo_prova_1, corpo_prova_2, corpo_prova_3)
```

---

## 🚨 Limitações e Cuidados

### 1. Tipos de Dados

- Operações matemáticas requerem números
- Comparações funcionam com qualquer tipo
- Concatenação converte tudo para texto

### 2. Performance

- Evite regras muito complexas (quebre em várias regras)
- Limite o número de regras dependentes em cascata
- Use funções apropriadas (COUNT em vez de múltiplos IFs)

### 3. Precisão Numérica

```javascript
// Números decimais têm precisão limitada
0.1 + 0.2                // 0.30000000000000004

// Use ROUND para controlar
ROUND(0.1 + 0.2, 2)      // 0.30
```

### 4. Datas

- Datas são armazenadas como timestamps (milissegundos)
- Use as funções de data para manipulação
- Cuidado com fusos horários

---

## 📚 Referência Rápida

### Matemática
`+`, `-`, `*`, `/`, `^`, `sqrt`, `abs`, `ROUND`, `POWER`, `MOD`

### Lógica
`==`, `!=`, `<`, `>`, `<=`, `>=`, `AND`, `OR`, `NOT`, `XOR`

### Condicionais
`IF`, `IFS`, `SWITCH`

### Texto
`UPPER`, `LOWER`, `TRIM`, `LEN`, `CONCAT`, `LEFT`, `RIGHT`, `MID`

### Data
`NOW`, `TODAY`, `YEAR`, `MONTH`, `DAY`, `DAYSDIFF`

### Estatística
`SUM`, `AVERAGE`, `MIN`, `MAX`, `COUNT`, `COUNTA`

### Verificação
`ISBLANK`, `ISNUMBER`, `ISTEXT`, `ISERROR`

---

## 🎉 Conclusão

Esta linguagem de fórmulas oferece poder e flexibilidade para criar cálculos complexos de forma organizada e manutenível. Use-a para automatizar processos, validar dados e gerar insights em seus formulários!

**Dica Final:** Comece simples e vá incrementando. Teste cada regra individualmente antes de criar dependências complexas.

---

**Documentação atualizada em:** Dezembro 2024
**Versão:** 2.0 - Linguagem Avançada


