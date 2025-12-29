# 🧪 Teste das Fórmulas Avançadas

## Como Testar as Novas Funcionalidades

### 1. Via Interface (FormBuilder)

1. **Acesse o FormBuilder:**
   - Navegue até `/forms` e crie um novo formulário
   - Ou edite um formulário existente

2. **Adicione Campos de Teste:**
   ```
   Campo: valor_base (NUMBER)
   Campo: quantidade (NUMBER)
   Campo: tipo_cliente (TEXT)
   Campo: data_pedido (DATE)
   Campo: nome_cliente (TEXT)
   ```

3. **Crie Regras com as Novas Funções:**

   **Clique em "Nova Regra" e você verá um botão "Ver Funções"** que mostra todas as funções disponíveis!

### 2. Exemplos de Regras para Testar

#### Teste 1: Condicionais Simples
```javascript
Nome: Desconto por Quantidade
Chave: desconto_percentual
Fórmula: IF(quantidade >= 100, 15, IF(quantidade >= 50, 10, 5))
```

#### Teste 2: IFS (Múltiplas Condições)
```javascript
Nome: Classificação do Cliente
Chave: classificacao
Fórmula: IFS(valor_base >= 10000, "Premium", valor_base >= 5000, "Gold", valor_base >= 1000, "Silver", "Bronze")
```

#### Teste 3: Operadores Lógicos
```javascript
Nome: Validação de Pedido
Chave: pedido_valido
Fórmula: IF(AND(quantidade > 0, valor_base > 0), "Válido", "Inválido")
```

#### Teste 4: Funções de Texto
```javascript
Nome: Nome Formatado
Chave: nome_formatado
Fórmula: CONCAT(UPPER(nome_cliente), " - ", tipo_cliente)
```

#### Teste 5: Matemática Avançada
```javascript
Nome: Subtotal
Chave: subtotal
Fórmula: valor_base * quantidade

Nome: Valor do Desconto
Chave: valor_desconto
Fórmula: subtotal * (desconto_percentual / 100)

Nome: Total com Desconto
Chave: total_com_desconto
Fórmula: ROUND(subtotal - valor_desconto, 2)
```

#### Teste 6: Funções Estatísticas
```javascript
// Adicione campos: nota1, nota2, nota3 (NUMBER)

Nome: Média das Notas
Chave: media_notas
Fórmula: AVERAGE(nota1, nota2, nota3)

Nome: Nota Máxima
Chave: nota_maxima
Fórmula: MAX(nota1, nota2, nota3)

Nome: Nota Mínima
Chave: nota_minima
Fórmula: MIN(nota1, nota2, nota3)
```

#### Teste 7: Funções de Data
```javascript
Nome: Dias desde o Pedido
Chave: dias_pedido
Fórmula: DAYSDIFF(data_pedido, NOW())

Nome: Ano do Pedido
Chave: ano_pedido
Fórmula: YEAR(data_pedido)

Nome: Status de Entrega
Chave: status_entrega
Fórmula: IF(DAYSDIFF(data_pedido, NOW()) > 30, "Atrasado", "No prazo")
```

#### Teste 8: SWITCH
```javascript
Nome: Frete por Região
Chave: valor_frete
Fórmula: SWITCH(tipo_cliente, "SP", 50, "RJ", 60, "MG", 70, 100)
```

#### Teste 9: Verificações
```javascript
Nome: Validação de Nome
Chave: nome_valido
Fórmula: IF(ISBLANK(nome_cliente), "Nome obrigatório", "OK")

Nome: Validação de Quantidade
Chave: quantidade_valida
Fórmula: IF(ISNUMBER(quantidade), "OK", "Deve ser número")
```

#### Teste 10: Complexo - Análise de Pedido
```javascript
// Campos necessários:
// - valor_base (NUMBER)
// - quantidade (NUMBER)
// - tipo_cliente (TEXT: "normal" ou "vip")
// - urgente (CHECKBOX: true/false)

// Regra 1: Subtotal
subtotal = valor_base * quantidade

// Regra 2: Desconto base
desconto_base = IFS(
  quantidade >= 100, 20,
  quantidade >= 50, 15,
  quantidade >= 20, 10,
  5
)

// Regra 3: Desconto adicional VIP
desconto_adicional = IF(tipo_cliente == "vip", 5, 0)

// Regra 4: Desconto total
desconto_total = desconto_base + desconto_adicional

// Regra 5: Valor do desconto
valor_desconto = subtotal * (desconto_total / 100)

// Regra 6: Total com desconto
total_com_desconto = subtotal - valor_desconto

// Regra 7: Taxa de urgência
taxa_urgencia = IF(urgente, total_com_desconto * 0.15, 0)

// Regra 8: Total final
total_final = ROUND(total_com_desconto + taxa_urgencia, 2)

// Regra 9: Status do pedido
status_pedido = IFS(
  AND(urgente, total_final > 5000), "Prioritário - Alto Valor",
  urgente, "Prioritário",
  total_final > 10000, "Alto Valor",
  "Normal"
)

// Regra 10: Mensagem
mensagem = CONCAT(
  "Pedido ", 
  status_pedido, 
  " - Desconto: ", 
  TEXT(desconto_total), 
  "%"
)
```

### 3. Teste via API

```bash
# 1. Criar formulário
curl -X POST http://localhost:3000/api/forms \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer SEU_TOKEN" \
  -d '{
    "title": "Teste Fórmulas Avançadas",
    "description": "Testando novas funções",
    "status": "ACTIVE"
  }'

# 2. Adicionar campos
curl -X POST http://localhost:3000/api/forms/{formId}/fields \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer SEU_TOKEN" \
  -d '{
    "label": "Valor Base",
    "fieldKey": "valor_base",
    "type": "NUMBER",
    "required": true,
    "order": 0
  }'

curl -X POST http://localhost:3000/api/forms/{formId}/fields \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer SEU_TOKEN" \
  -d '{
    "label": "Quantidade",
    "fieldKey": "quantidade",
    "type": "NUMBER",
    "required": true,
    "order": 1
  }'

# 3. Adicionar regra com IF
curl -X POST http://localhost:3000/api/forms/{formId}/rules \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer SEU_TOKEN" \
  -d '{
    "name": "Desconto Progressivo",
    "ruleKey": "desconto",
    "formula": "IF(quantidade >= 100, 15, IF(quantidade >= 50, 10, 5))"
  }'

# 4. Adicionar regra com IFS
curl -X POST http://localhost:3000/api/forms/{formId}/rules \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer SEU_TOKEN" \
  -d '{
    "name": "Classificação",
    "ruleKey": "classificacao",
    "formula": "IFS(valor_base >= 10000, \"Premium\", valor_base >= 5000, \"Gold\", \"Bronze\")"
  }'

# 5. Submeter resposta
curl -X POST http://localhost:3000/api/submissions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer SEU_TOKEN" \
  -d '{
    "formId": "{formId}",
    "responses": {
      "valor_base": "8000",
      "quantidade": "75"
    }
  }'

# Resultado esperado:
# - desconto: 10 (porque quantidade >= 50)
# - classificacao: "Gold" (porque valor_base >= 5000)
```

### 4. Cenários de Teste Específicos

#### Teste A: Validação de Concreto
```javascript
// Campos:
// - resistencia_1, resistencia_2, resistencia_3 (NUMBER)
// - fck_projeto (NUMBER)

// Regras:
media = AVERAGE(resistencia_1, resistencia_2, resistencia_3)
minima = MIN(resistencia_1, resistencia_2, resistencia_3)
maxima = MAX(resistencia_1, resistencia_2, resistencia_3)

aprovado = IF(
  AND(media >= fck_projeto, minima >= fck_projeto * 0.9),
  "APROVADO",
  "REPROVADO"
)

desvio = ROUND(((media - fck_projeto) / fck_projeto) * 100, 2)
```

#### Teste B: Gestão de Prazo
```javascript
// Campos:
// - data_inicio (DATE)
// - data_fim_prevista (DATE)
// - percentual_concluido (NUMBER)

// Regras:
dias_totais = DAYSDIFF(data_inicio, data_fim_prevista)
dias_decorridos = DAYSDIFF(data_inicio, NOW())
percentual_tempo = ROUND((dias_decorridos / dias_totais) * 100, 2)

status = IFS(
  percentual_concluido >= percentual_tempo + 10, "Adiantado",
  percentual_concluido >= percentual_tempo - 10, "No prazo",
  "Atrasado"
)

dias_restantes = DAYSDIFF(NOW(), data_fim_prevista)

alerta = IF(
  AND(dias_restantes < 30, percentual_concluido < 80),
  "URGENTE",
  "Normal"
)
```

#### Teste C: Análise de Custos
```javascript
// Campos:
// - custo_material (NUMBER)
// - custo_mao_obra (NUMBER)
// - custo_equipamento (NUMBER)
// - margem_lucro (NUMBER) // em percentual

// Regras:
custo_total = SUM(custo_material, custo_mao_obra, custo_equipamento)
valor_lucro = custo_total * (margem_lucro / 100)
preco_venda = ROUND(custo_total + valor_lucro, 2)

maior_custo = MAX(custo_material, custo_mao_obra, custo_equipamento)

categoria_maior_custo = SWITCH(
  maior_custo,
  custo_material, "Material",
  custo_mao_obra, "Mão de Obra",
  custo_equipamento, "Equipamento",
  "Indefinido"
)

analise = CONCAT(
  "Custo Total: R$ ",
  TEXT(custo_total),
  " - Maior custo: ",
  categoria_maior_custo
)
```

### 5. Verificação de Resultados

Após submeter uma resposta, verifique:

1. **No banco de dados:**
   ```sql
   SELECT * FROM "Submission" 
   WHERE "formId" = 'seu-form-id' 
   ORDER BY "createdAt" DESC LIMIT 1;
   ```

2. **Via API:**
   ```bash
   curl http://localhost:3000/api/submissions/{submissionId} \
     -H "Authorization: Bearer SEU_TOKEN"
   ```

3. **No frontend:**
   - Acesse a página de respostas do formulário
   - Verifique se os campos calculados aparecem corretamente
   - Confira se os valores estão corretos

### 6. Testes de Erro

Teste também cenários de erro:

```javascript
// Divisão por zero (deve retornar erro ou ser tratado)
resultado = IF(divisor != 0, dividendo / divisor, 0)

// Campo não preenchido
validacao = IF(ISBLANK(campo), "Erro: campo obrigatório", campo)

// Tipo incorreto
conversao = IF(ISNUMBER(campo), campo * 2, 0)

// Dependência circular (deve ser detectada)
// regra_a = regra_b * 2
// regra_b = regra_a / 2
// ❌ Erro esperado: "Dependência circular detectada"
```

### 7. Performance

Teste com múltiplas regras em cascata:

```javascript
// Crie 10-20 regras que dependem umas das outras
regra_1 = campo1 * 2
regra_2 = regra_1 + 10
regra_3 = regra_2 * 1.5
regra_4 = ROUND(regra_3, 2)
// ... e assim por diante

// Verifique:
// - Tempo de resposta (deve ser < 1s)
// - Ordem de execução (deve ser automática)
// - Resultado final correto
```

---

## ✅ Checklist de Testes

- [ ] Funções condicionais (IF, IFS, SWITCH)
- [ ] Operadores lógicos (AND, OR, NOT, XOR)
- [ ] Operadores de comparação (==, !=, <, >, <=, >=)
- [ ] Funções matemáticas (ROUND, POWER, sqrt, abs, etc)
- [ ] Funções estatísticas (AVERAGE, SUM, MIN, MAX, COUNT)
- [ ] Funções de texto (UPPER, LOWER, CONCAT, TRIM, etc)
- [ ] Funções de data (NOW, DAYSDIFF, YEAR, MONTH, DAY)
- [ ] Funções de verificação (ISBLANK, ISNUMBER, ISTEXT)
- [ ] Referências a campos
- [ ] Referências a outras regras
- [ ] Ordenação automática por dependência
- [ ] Detecção de dependência circular
- [ ] Tratamento de erros
- [ ] Helper visual no FormBuilder
- [ ] Performance com múltiplas regras

---

## 🎉 Resultado Esperado

Após implementar e testar, você terá:

1. ✅ **Linguagem de programação completa** para fórmulas
2. ✅ **Interface visual** com helper de funções
3. ✅ **Documentação completa** com exemplos
4. ✅ **Sistema robusto** com validações e tratamento de erros
5. ✅ **Performance otimizada** com ordenação automática

---

**Boa sorte nos testes! 🚀**



