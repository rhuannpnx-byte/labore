# 🔗 Regras Dependentes - Referenciando Outras Regras

## 📋 Resumo

Implementada funcionalidade que permite **regras referenciarem outras regras** nas fórmulas, além de referenciar campos. Isso possibilita criar cálculos modulares e complexos de forma organizada.

---

## ✨ O que foi implementado

### 1. **FormulaEngine Atualizado**

O motor de fórmulas agora suporta:
- ✅ **Referências a campos** (como antes): `campo1`, `campo2`
- ✅ **Referências a regras** (novo): `total_bruto`, `total_com_desconto`
- ✅ **Ordenação automática** por dependência (topological sort)
- ✅ **Detecção de dependências circulares**
- ✅ **Validação completa** de referências

### 2. **Métodos Adicionados ao FormulaEngine**

#### `evaluate(formula, fieldValues, ruleResults)`
```typescript
// Agora aceita um terceiro parâmetro: resultados de regras
FormulaEngine.evaluate(
  'total_bruto - desconto',  // fórmula
  { campo1: '100' },          // valores dos campos
  { total_bruto: '1000' }     // resultados de regras anteriores
)
```

#### `sortRulesByDependency(rules)`
```typescript
// Ordena regras por dependência usando Kahn's algorithm
// Regras que dependem de outras vêm depois
const sortedRules = FormulaEngine.sortRulesByDependency(allRules);
```

#### `validateReferences(formula, availableFields, availableRules)`
```typescript
// Valida se todas as referências existem
const validation = FormulaEngine.validateReferences(
  'campo1 + regra1',
  ['campo1', 'campo2'],  // campos disponíveis
  ['regra1', 'regra2']   // regras disponíveis
);
```

---

## 🎯 Como Usar

### Exemplo Prático: Cálculo de Orçamento

#### **Campos do Formulário:**
- `valor_unitario` (NUMBER) - Valor unitário do produto
- `quantidade` (NUMBER) - Quantidade
- `desconto_percentual` (NUMBER) - Desconto (%)
- `imposto_percentual` (NUMBER) - Imposto (%)

#### **Regras (podem referenciar umas às outras):**

```javascript
// Regra 1: Subtotal
ruleKey: 'subtotal'
formula: 'valor_unitario * quantidade'
// Resultado: 1000.00 (se valor=100, quantidade=10)

// Regra 2: Valor do Desconto (referencia subtotal)
ruleKey: 'valor_desconto'
formula: 'subtotal * (desconto_percentual / 100)'
// Resultado: 150.00 (se subtotal=1000, desconto=15%)

// Regra 3: Total com Desconto (referencia subtotal e valor_desconto)
ruleKey: 'total_com_desconto'
formula: 'subtotal - valor_desconto'
// Resultado: 850.00 (1000 - 150)

// Regra 4: Valor do Imposto (referencia total_com_desconto)
ruleKey: 'valor_imposto'
formula: 'total_com_desconto * (imposto_percentual / 100)'
// Resultado: 85.00 (se imposto=10%)

// Regra 5: Total Final (referencia total_com_desconto e valor_imposto)
ruleKey: 'total_final'
formula: 'total_com_desconto + valor_imposto'
// Resultado: 935.00 (850 + 85)
```

#### **Ordem de Execução (Automática):**
O sistema ordena automaticamente:
1. `subtotal` (não depende de nada)
2. `valor_desconto` (depende de subtotal)
3. `total_com_desconto` (depende de subtotal e valor_desconto)
4. `valor_imposto` (depende de total_com_desconto)
5. `total_final` (depende de total_com_desconto e valor_imposto)

---

## 🔄 Fluxo de Processamento

### Antes (sem dependência entre regras):
```
Campo1 ──┐
Campo2 ──┼──> Regra1 ──> Resultado1
Campo3 ──┘

Campo1 ──┐
Campo2 ──┼──> Regra2 ──> Resultado2
Campo4 ──┘
```

### Agora (com dependência entre regras):
```
Campo1 ──┐
Campo2 ──┼──> Regra1 ──> Resultado1 ──┐
Campo3 ──┘                             │
                                       ├──> Regra2 ──> Resultado2 ──┐
Campo4 ────────────────────────────────┘                            │
                                                                    ├──> Regra3 ──> Resultado3
Regra2(resultado) ──────────────────────────────────────────────────┘
```

---

## 🛡️ Validações Implementadas

### 1. **Validação de Existência**
```javascript
// Ao criar/atualizar regra, verifica se todas as referências existem
formula: 'campo1 + regra1'
// ✅ OK se campo1 e regra1 existem
// ❌ ERRO: "Campos ou regras não encontrados: regra1"
```

### 2. **Detecção de Dependência Circular**
```javascript
// Regra1: formula = 'regra2 * 2'
// Regra2: formula = 'regra1 / 2'
// ❌ ERRO: "Dependência circular detectada nas regras: regra1, regra2"
```

### 3. **Validação de Sintaxe**
```javascript
formula: 'campo1 + ('
// ❌ ERRO: "Fórmula inválida: Unexpected end of expression"
```

---

## 📊 Resposta da API de Validação

### Endpoint: `POST /api/forms/validate-formula`

#### Request:
```json
{
  "formula": "subtotal - valor_desconto + valor_imposto",
  "formId": "form-uuid"
}
```

#### Response (Sucesso):
```json
{
  "valid": true,
  "message": "Fórmula válida",
  "references": ["subtotal", "valor_desconto", "valor_imposto"],
  "referencedFields": [],
  "referencedRules": ["subtotal", "valor_desconto", "valor_imposto"]
}
```

#### Response (Erro - Referência Não Encontrada):
```json
{
  "valid": false,
  "error": "Referências não encontradas no formulário: regra_inexistente",
  "references": ["subtotal", "regra_inexistente"],
  "availableFields": [],
  "availableRules": ["subtotal", "valor_desconto"],
  "missingRefs": ["regra_inexistente"],
  "hint": {
    "campos": ["campo1", "campo2"],
    "regras": ["subtotal", "valor_desconto"]
  }
}
```

---

## 🔧 Algoritmo de Ordenação

Utiliza **Topological Sort (Kahn's Algorithm)**:

### Como funciona:
1. **Constrói grafo de dependências**:
   - Cada regra é um nó
   - Aresta A → B significa "B depende de A"

2. **Calcula in-degree** (quantas dependências cada regra tem):
   - `subtotal`: 0 (não depende de nada)
   - `valor_desconto`: 1 (depende de subtotal)
   - `total_final`: 2 (depende de total_com_desconto e valor_imposto)

3. **Processa em ordem**:
   - Começa com in-degree = 0
   - Remove aresta após processar
   - Adiciona novos nós com in-degree = 0 à fila

4. **Detecta ciclos**:
   - Se nem todas as regras foram processadas
   - Significa que há ciclo
   - Retorna erro claro

### Exemplo Visual:

```
Grafo de Dependências:
┌──────────┐
│ subtotal │──┐
└──────────┘  │
              ↓
         ┌────────────────┐
         │ valor_desconto │──┐
         └────────────────┘  │
                             ↓
                      ┌────────────────────┐
                      │ total_com_desconto │──┐
                      └────────────────────┘  │
                                              ↓
                                         ┌──────────────┐
                                         │ valor_imposto│──┐
                                         └──────────────┘  │
                                                           ↓
                                                     ┌────────────┐
                                                     │total_final │
                                                     └────────────┘

Ordem de Execução: 
subtotal → valor_desconto → total_com_desconto → valor_imposto → total_final
```

---

## 💡 Casos de Uso

### 1. **Cálculos Financeiros**
```javascript
// Campos: valor, quantidade, desconto, imposto
receita_bruta = valor * quantidade
desconto_aplicado = receita_bruta * (desconto / 100)
receita_liquida = receita_bruta - desconto_aplicado
imposto_devido = receita_liquida * (imposto / 100)
receita_final = receita_liquida - imposto_devido
```

### 2. **Avaliações Complexas**
```javascript
// Campos: nota1, nota2, nota3, nota4
media_parcial = (nota1 + nota2) / 2
media_geral = (media_parcial + nota3 + nota4) / 3
conceito_final = media_geral * 10
```

### 3. **Medições Compostas**
```javascript
// Campos: comprimento, largura, altura
area_base = comprimento * largura
volume = area_base * altura
superficie_total = 2 * (comprimento * largura + comprimento * altura + largura * altura)
```

### 4. **Índices e Proporções**
```javascript
// Campos: peso, altura, idade, sexo_fator
imc = peso / (altura ^ 2)
imc_ajustado = imc * sexo_fator
classificacao_numerica = imc_ajustado * 10
```

---

## ⚠️ Limitações e Boas Práticas

### ✅ BOM:
```javascript
// Regras modulares e organizadas
total_sem_desconto = valor * quantidade
total_com_desconto = total_sem_desconto - desconto
total_final = total_com_desconto + imposto
```

### ❌ EVITE:
```javascript
// Dependência circular
regra1 = regra2 * 2
regra2 = regra1 / 2  // ❌ ERRO!

// Referência a regra não criada ainda
// (crie a regra dependente primeiro)
```

### 💡 DICAS:
1. **Nomeie regras descritivamente**: `total_com_desconto` em vez de `calc1`
2. **Crie regras na ordem lógica**: O sistema reordena automaticamente, mas facilita manutenção
3. **Valide a fórmula antes de salvar**: Use o endpoint de validação
4. **Documente fórmulas complexas**: Use o campo `name` da regra para descrever

---

## 🔍 Como Testar

### Via Frontend (FormBuilder):

1. **Crie um formulário** com campos numéricos
2. **Adicione a primeira regra**:
   - Nome: "Subtotal"
   - Chave: `subtotal`
   - Fórmula: `valor * quantidade`
3. **Adicione a segunda regra** (que referencia a primeira):
   - Nome: "Total com Desconto"
   - Chave: `total_com_desconto`
   - Chave: `subtotal - desconto`
   - ✅ Validar Fórmula (mostrará que `subtotal` é uma regra válida)
4. **Preencha o formulário** e veja os resultados em cascata

### Via API:

```bash
# 1. Criar formulário e adicionar campos...

# 2. Adicionar primeira regra
curl -X POST http://localhost:3000/api/forms/{formId}/rules \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Subtotal",
    "ruleKey": "subtotal",
    "formula": "valor * quantidade",
    "order": 0
  }'

# 3. Adicionar segunda regra (que referencia a primeira)
curl -X POST http://localhost:3000/api/forms/{formId}/rules \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Total com Desconto",
    "ruleKey": "total_com_desconto",
    "formula": "subtotal - desconto",
    "order": 1
  }'

# 4. Submeter resposta - os cálculos serão feitos na ordem correta
```

---

## 📈 Performance

### Complexidade:
- **Ordenação Topológica**: O(V + E) onde V = número de regras, E = número de dependências
- **Avaliação**: O(N) onde N = número de regras ordenadas
- **Memória**: O(V) para armazenar resultados intermediários

### Exemplo:
- 100 regras com média de 2 dependências cada
- Ordenação: ~300 operações
- Execução: 100 avaliações sequenciais
- **Tempo total**: < 100ms

---

## ✅ Testes de Validação

### Cenários Testados:
- ✅ Regra sem dependências
- ✅ Regra que depende de campos
- ✅ Regra que depende de outra regra
- ✅ Múltiplas regras em cascata (A→B→C→D)
- ✅ Dependências complexas (diamante: A→B,C ; B,C→D)
- ✅ Detecção de ciclo simples (A→B→A)
- ✅ Detecção de ciclo complexo (A→B→C→A)
- ✅ Validação de referências inexistentes
- ✅ Atualização de regra que cria ciclo

---

## 🎉 Benefícios

1. **📐 Modularidade**: Quebre cálculos complexos em partes menores
2. **🔧 Manutenibilidade**: Mais fácil entender e atualizar
3. **♻️ Reusabilidade**: Reutilize resultados em múltiplas regras
4. **🛡️ Segurança**: Validação automática previne erros
5. **⚡ Eficiência**: Calcula cada regra apenas uma vez

---

**Documentação completa da funcionalidade de Regras Dependentes** 🚀

