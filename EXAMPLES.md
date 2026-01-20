# 💡 Exemplos Práticos - Labore Forms

## 📋 Casos de Uso Reais

### 1. 🏭 Inspeção de Qualidade Industrial

**Cenário**: Fábrica precisa inspecionar produtos e calcular metragens automaticamente.

**Campos:**
- `lote` (TEXT) - Número do Lote
- `largura_cm` (NUMBER) - Largura em cm
- `altura_cm` (NUMBER) - Altura em cm
- `profundidade_cm` (NUMBER) - Profundidade em cm
- `quantidade` (NUMBER) - Quantidade de peças
- `defeitos` (SELECT) - Tem defeitos? (Sim/Não)
- `observacoes` (TEXTAREA) - Observações

**Regras:**
```javascript
// 1. Volume unitário (cm³)
largura_cm * altura_cm * profundidade_cm

// 2. Volume total (cm³)
largura_cm * altura_cm * profundidade_cm * quantidade

// 3. Volume em litros
(largura_cm * altura_cm * profundidade_cm * quantidade) / 1000

// 4. Área de superfície (cm²)
2 * (largura_cm * altura_cm + largura_cm * profundidade_cm + altura_cm * profundidade_cm)
```

**Benefícios:**
- ✅ Cálculos automáticos e precisos
- ✅ Reduz erros humanos
- ✅ Histórico completo de inspeções

---

### 2. 👥 Avaliação de Desempenho 360°

**Cenário**: RH precisa avaliar funcionários com média ponderada.

**Campos:**
- `nome` (TEXT) - Nome do Funcionário
- `cargo` (TEXT) - Cargo
- `nota_tecnica` (NUMBER) - Nota Técnica (0-10)
- `nota_comportamental` (NUMBER) - Comportamento (0-10)
- `nota_lideranca` (NUMBER) - Liderança (0-10)
- `nota_inovacao` (NUMBER) - Inovação (0-10)
- `email` (EMAIL) - Email

**Regras:**
```javascript
// 1. Média simples
(nota_tecnica + nota_comportamental + nota_lideranca + nota_inovacao) / 4

// 2. Média ponderada (técnica vale mais)
(nota_tecnica * 4 + nota_comportamental * 2 + nota_lideranca * 3 + nota_inovacao * 1) / 10

// 3. Pontuação total (de 100)
((nota_tecnica + nota_comportamental + nota_lideranca + nota_inovacao) / 4) * 10

// 4. Classificação numérica
((nota_tecnica * 4 + nota_comportamental * 2 + nota_lideranca * 3 + nota_inovacao * 1) / 10) >= 7
```

**Teste:**
- Nota Técnica: 9
- Comportamento: 8
- Liderança: 7
- Inovação: 6

**Resultados:**
- Média Simples: 7.50
- Média Ponderada: 8.10
- Pontuação Total: 75.00

---

### 3. 💰 Orçamento de Vendas

**Cenário**: Loja precisa calcular preços com descontos e impostos.

**Campos:**
- `produto` (TEXT) - Nome do Produto
- `valor_unitario` (NUMBER) - Valor Unitário (R$)
- `quantidade` (NUMBER) - Quantidade
- `desconto_percentual` (NUMBER) - Desconto (%)
- `imposto_percentual` (NUMBER) - Imposto (%)
- `cliente` (TEXT) - Nome do Cliente
- `email_cliente` (EMAIL) - Email

**Regras:**
```javascript
// 1. Subtotal
valor_unitario * quantidade

// 2. Valor do desconto
(valor_unitario * quantidade) * (desconto_percentual / 100)

// 3. Valor após desconto
(valor_unitario * quantidade) - ((valor_unitario * quantidade) * (desconto_percentual / 100))

// 4. Valor do imposto
((valor_unitario * quantidade) - ((valor_unitario * quantidade) * (desconto_percentual / 100))) * (imposto_percentual / 100)

// 5. Total final
((valor_unitario * quantidade) - ((valor_unitario * quantidade) * (desconto_percentual / 100))) + (((valor_unitario * quantidade) - ((valor_unitario * quantidade) * (desconto_percentual / 100))) * (imposto_percentual / 100))
```

**Teste:**
- Valor Unitário: 100.00
- Quantidade: 10
- Desconto: 15%
- Imposto: 10%

**Resultados:**
- Subtotal: 1000.00
- Desconto: 150.00
- Após Desconto: 850.00
- Imposto: 85.00
- Total: 935.00

---

### 4. 🏃 Avaliação Física

**Cenário**: Academia precisa calcular IMC e classificação.

**Campos:**
- `nome` (TEXT) - Nome
- `idade` (NUMBER) - Idade
- `peso_kg` (NUMBER) - Peso (kg)
- `altura_m` (NUMBER) - Altura (m)
- `circunferencia_cintura` (NUMBER) - Cintura (cm)
- `circunferencia_quadril` (NUMBER) - Quadril (cm)

**Regras:**
```javascript
// 1. IMC (Índice de Massa Corporal)
peso_kg / (altura_m ^ 2)

// 2. RCQ (Relação Cintura-Quadril)
circunferencia_cintura / circunferencia_quadril

// 3. Peso ideal (fórmula simplificada)
22 * (altura_m ^ 2)

// 4. Diferença do peso ideal
peso_kg - (22 * (altura_m ^ 2))
```

**Teste:**
- Peso: 80 kg
- Altura: 1.75 m
- Cintura: 90 cm
- Quadril: 100 cm

**Resultados:**
- IMC: 26.12
- RCQ: 0.90
- Peso Ideal: 67.38 kg
- Diferença: +12.62 kg

---

### 5. 🏗️ Cálculo de Material de Construção

**Cenário**: Construção precisa calcular quantidade de materiais.

**Campos:**
- `obra` (TEXT) - Nome da Obra
- `comprimento_m` (NUMBER) - Comprimento (m)
- `largura_m` (NUMBER) - Largura (m)
- `altura_m` (NUMBER) - Altura (m)
- `numero_comodos` (NUMBER) - Número de Cômodos

**Regras:**
```javascript
// 1. Área do piso (m²)
comprimento_m * largura_m

// 2. Volume total (m³)
comprimento_m * largura_m * altura_m

// 3. Área de parede (m²) - simplificado
2 * (comprimento_m * altura_m) + 2 * (largura_m * altura_m)

// 4. Tijolos necessários (aproximado: 70 tijolos/m²)
(2 * (comprimento_m * altura_m) + 2 * (largura_m * altura_m)) * 70

// 5. Cimento (kg) - aproximado: 5kg/m²
(comprimento_m * largura_m) * 5

// 6. Tinta (litros) - aproximado: 1L para 10m²
(2 * (comprimento_m * altura_m) + 2 * (largura_m * altura_m)) / 10
```

**Teste:**
- Comprimento: 10 m
- Largura: 8 m
- Altura: 3 m
- Cômodos: 4

**Resultados:**
- Área piso: 80 m²
- Volume: 240 m³
- Área parede: 108 m²
- Tijolos: 7560 unidades
- Cimento: 400 kg
- Tinta: 10.8 litros

---

### 6. 🔬 Experimento Científico

**Cenário**: Laboratório precisa calcular concentrações e diluições.

**Campos:**
- `experimento` (TEXT) - Nome do Experimento
- `concentracao_inicial` (NUMBER) - Concentração Inicial (mol/L)
- `volume_inicial` (NUMBER) - Volume Inicial (mL)
- `volume_final` (NUMBER) - Volume Final (mL)
- `temperatura_celsius` (NUMBER) - Temperatura (°C)

**Regras:**
```javascript
// 1. Concentração final (C1V1 = C2V2)
(concentracao_inicial * volume_inicial) / volume_final

// 2. Volume de diluente a adicionar
volume_final - volume_inicial

// 3. Temperatura em Kelvin
temperatura_celsius + 273.15

// 4. Fator de diluição
volume_final / volume_inicial
```

---

### 7. 🚗 Consumo de Combustível

**Cenário**: Empresa de transporte precisa calcular custos de frota.

**Campos:**
- `veiculo` (TEXT) - Placa/Identificação
- `km_inicial` (NUMBER) - KM Inicial
- `km_final` (NUMBER) - KM Final
- `litros_abastecidos` (NUMBER) - Litros
- `valor_por_litro` (NUMBER) - Preço/Litro (R$)

**Regras:**
```javascript
// 1. Distância percorrida (km)
km_final - km_inicial

// 2. Consumo médio (km/L)
(km_final - km_inicial) / litros_abastecidos

// 3. Custo total do abastecimento (R$)
litros_abastecidos * valor_por_litro

// 4. Custo por km (R$/km)
(litros_abastecidos * valor_por_litro) / (km_final - km_inicial)

// 5. Litros por 100km
(litros_abastecidos / (km_final - km_inicial)) * 100
```

**Teste:**
- KM Inicial: 1000
- KM Final: 1500
- Litros: 50
- Preço: 5.50

**Resultados:**
- Distância: 500 km
- Consumo: 10 km/L
- Custo Total: R$ 275.00
- Custo/km: R$ 0.55
- L/100km: 10.00

---

### 8. 📊 Análise de Investimento

**Cenário**: Consultor financeiro calcula retorno de investimento.

**Campos:**
- `investimento_inicial` (NUMBER) - Capital Inicial (R$)
- `taxa_juros_mensal` (NUMBER) - Taxa Mensal (%)
- `periodo_meses` (NUMBER) - Período (meses)
- `aporte_mensal` (NUMBER) - Aporte Mensal (R$)

**Regras:**
```javascript
// 1. Juros simples total
investimento_inicial * (taxa_juros_mensal / 100) * periodo_meses

// 2. Montante com juros simples
investimento_inicial + (investimento_inicial * (taxa_juros_mensal / 100) * periodo_meses)

// 3. Total de aportes
aporte_mensal * periodo_meses

// 4. Valor total investido
investimento_inicial + (aporte_mensal * periodo_meses)

// Nota: Para juros compostos seria necessário função pow mais complexa
```

---

## 🎓 Dicas de Boas Práticas

### Nomenclatura de Campos
✅ **BOM:**
- `valor_unitario`
- `nota_final`
- `temperatura_celsius`

❌ **EVITE:**
- `v1` (não descritivo)
- `valor unitário` (espaços)
- `Valor-Final` (hifens/maiúsculas)

### Organização de Regras
1. **Regras simples primeiro**
2. **Regras complexas depois**
3. **Nomes descritivos**
4. **Comentar fórmulas complexas** (no nome da regra)

### Validação
- Sempre marque **campos usados em fórmulas** como obrigatórios
- Use **tipos corretos** (NUMBER para cálculos)
- **Teste as fórmulas** antes de ativar o formulário

### Performance
- Evite fórmulas **muito complexas** (divida em várias regras)
- Use **parênteses** para clareza
- **Campos numéricos** são mais rápidos que conversões

---

## 🔥 Fórmulas Avançadas

### Distância Euclidiana 2D
```javascript
sqrt((x2 - x1)^2 + (y2 - y1)^2)
```

### Distância Euclidiana 3D
```javascript
sqrt((x2 - x1)^2 + (y2 - y1)^2 + (z2 - z1)^2)
```

### Velocidade Média
```javascript
distancia_km / (tempo_minutos / 60)
```

### Área do Círculo
```javascript
pi * raio^2
```

### Perímetro do Círculo
```javascript
2 * pi * raio
```

### Volume da Esfera
```javascript
(4/3) * pi * raio^3
```

### Conversão Fahrenheit para Celsius
```javascript
(fahrenheit - 32) * (5/9)
```

### Conversão Celsius para Fahrenheit
```javascript
(celsius * 9/5) + 32
```

---

## 💻 Testando os Exemplos

Para testar qualquer exemplo:

1. Crie um novo formulário
2. Adicione os campos listados
3. Adicione as regras com as fórmulas
4. Mude o status para "Ativo"
5. Preencha com os valores de teste
6. Veja os resultados calculados!

---

**Dica Final:** Todos esses exemplos são reais e funcionais. Use-os como base e adapte para suas necessidades! 🚀




