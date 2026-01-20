# 🔌 Exemplos de Uso da API - Labore Forms

## Base URL
```
http://localhost:3000/api
```

## 📋 Formulários

### Listar todos os formulários
```bash
GET /forms

curl http://localhost:3000/api/forms
```

**Resposta:**
```json
[
  {
    "id": "uuid",
    "title": "Inspeção de Qualidade",
    "description": "Formulário para inspeção",
    "status": "ACTIVE",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z",
    "fields": [...],
    "rules": [...],
    "_count": {
      "submissions": 5
    }
  }
]
```

### Buscar formulário específico
```bash
GET /forms/:id

curl http://localhost:3000/api/forms/{form-id}
```

### Criar novo formulário
```bash
POST /forms
Content-Type: application/json

curl -X POST http://localhost:3000/api/forms \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Meu Formulário",
    "description": "Descrição do formulário",
    "status": "DRAFT"
  }'
```

**Body:**
```json
{
  "title": "Avaliação de Qualidade",
  "description": "Formulário para avaliar qualidade",
  "status": "DRAFT"
}
```

**Resposta:**
```json
{
  "id": "uuid-gerado",
  "title": "Avaliação de Qualidade",
  "description": "Formulário para avaliar qualidade",
  "status": "DRAFT",
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-01T00:00:00.000Z",
  "fields": [],
  "rules": []
}
```

### Atualizar formulário
```bash
PUT /forms/:id
Content-Type: application/json

curl -X PUT http://localhost:3000/api/forms/{form-id} \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Título Atualizado",
    "status": "ACTIVE"
  }'
```

### Deletar formulário
```bash
DELETE /forms/:id

curl -X DELETE http://localhost:3000/api/forms/{form-id}
```

## 📝 Campos

### Adicionar campo ao formulário
```bash
POST /forms/:id/fields
Content-Type: application/json

curl -X POST http://localhost:3000/api/forms/{form-id}/fields \
  -H "Content-Type: application/json" \
  -d '{
    "label": "Temperatura",
    "fieldKey": "temperatura",
    "type": "NUMBER",
    "required": true,
    "order": 0
  }'
```

**Body:**
```json
{
  "label": "Temperatura (°C)",
  "fieldKey": "temperatura",
  "type": "NUMBER",
  "required": true,
  "order": 0,
  "config": {}
}
```

**Tipos disponíveis:**
- `TEXT`
- `NUMBER`
- `DATE`
- `SELECT`
- `MULTI_SELECT`
- `CHECKBOX`
- `TEXTAREA`
- `EMAIL`
- `PHONE`

### Atualizar campo
```bash
PUT /forms/:id/fields/:fieldId
Content-Type: application/json

curl -X PUT http://localhost:3000/api/forms/{form-id}/fields/{field-id} \
  -H "Content-Type: application/json" \
  -d '{
    "label": "Novo Label",
    "required": false
  }'
```

### Deletar campo
```bash
DELETE /forms/:id/fields/:fieldId

curl -X DELETE http://localhost:3000/api/forms/{form-id}/fields/{field-id}
```

## 🧮 Regras de Processamento

### Adicionar regra
```bash
POST /forms/:id/rules
Content-Type: application/json

curl -X POST http://localhost:3000/api/forms/{form-id}/rules \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Área Total",
    "ruleKey": "area_total",
    "formula": "largura * altura",
    "order": 0
  }'
```

**Body:**
```json
{
  "name": "Cálculo de Área",
  "ruleKey": "area_total",
  "formula": "largura * altura * quantidade",
  "order": 0
}
```

**Exemplos de fórmulas:**
```javascript
// Multiplicação simples
"largura * altura"

// Com divisão e constante
"(campo1 * campo2) / 3.14"

// Fórmula complexa
"(largura * altura / 3.14159) * 30 * profundidade"

// Com funções matemáticas
"sqrt(campo1^2 + campo2^2)"

// Média ponderada
"(nota1 * 2 + nota2 * 3 + nota3 * 5) / 10"
```

### Atualizar regra
```bash
PUT /forms/:id/rules/:ruleId
Content-Type: application/json

curl -X PUT http://localhost:3000/api/forms/{form-id}/rules/{rule-id} \
  -H "Content-Type: application/json" \
  -d '{
    "formula": "nova_formula * 2"
  }'
```

### Deletar regra
```bash
DELETE /forms/:id/rules/:ruleId

curl -X DELETE http://localhost:3000/api/forms/{form-id}/rules/{rule-id}
```

### Validar fórmula
```bash
POST /forms/validate-formula
Content-Type: application/json

curl -X POST http://localhost:3000/api/forms/validate-formula \
  -H "Content-Type: application/json" \
  -d '{
    "formula": "campo1 * campo2",
    "formId": "form-id-opcional"
  }'
```

**Body:**
```json
{
  "formula": "(largura * altura) / 2",
  "formId": "uuid-do-formulario"
}
```

**Resposta (válida):**
```json
{
  "valid": true,
  "message": "Fórmula válida",
  "referencedFields": ["largura", "altura"]
}
```

**Resposta (inválida):**
```json
{
  "valid": false,
  "error": "Campos não encontrados no formulário: campo_inexistente"
}
```

## 📨 Submissões (Respostas)

### Listar submissões de um formulário
```bash
GET /submissions/form/:formId

curl http://localhost:3000/api/submissions/form/{form-id}
```

### Buscar submissão específica
```bash
GET /submissions/:id

curl http://localhost:3000/api/submissions/{submission-id}
```

**Resposta:**
```json
{
  "id": "uuid",
  "formId": "uuid",
  "submittedAt": "2024-01-01T00:00:00.000Z",
  "responses": [
    {
      "id": "uuid",
      "fieldId": "uuid",
      "value": "10",
      "field": {
        "label": "Largura",
        "fieldKey": "largura",
        "type": "NUMBER"
      }
    }
  ],
  "processingResults": [
    {
      "id": "uuid",
      "ruleId": "uuid",
      "result": "150.00",
      "rule": {
        "name": "Área Total",
        "formula": "largura * altura"
      }
    }
  ]
}
```

### Criar submissão (preencher formulário)
```bash
POST /submissions
Content-Type: application/json

curl -X POST http://localhost:3000/api/submissions \
  -H "Content-Type: application/json" \
  -d '{
    "formId": "form-uuid",
    "responses": [
      {
        "fieldId": "field-uuid-1",
        "value": "10"
      },
      {
        "fieldId": "field-uuid-2",
        "value": "5"
      }
    ]
  }'
```

**Body:**
```json
{
  "formId": "uuid-do-formulario",
  "responses": [
    {
      "fieldId": "uuid-campo-largura",
      "value": "10"
    },
    {
      "fieldId": "uuid-campo-altura",
      "value": "5"
    },
    {
      "fieldId": "uuid-campo-quantidade",
      "value": "3"
    }
  ]
}
```

**Resposta:**
```json
{
  "id": "uuid-gerado",
  "formId": "uuid",
  "submittedAt": "2024-01-01T12:00:00.000Z",
  "responses": [
    {
      "id": "uuid",
      "fieldId": "uuid",
      "value": "10",
      "field": {...}
    }
  ],
  "processingResults": [
    {
      "id": "uuid",
      "ruleId": "uuid",
      "result": "150.00",
      "rule": {...}
    }
  ]
}
```

### Deletar submissão
```bash
DELETE /submissions/:id

curl -X DELETE http://localhost:3000/api/submissions/{submission-id}
```

### Estatísticas do formulário
```bash
GET /submissions/form/:formId/stats

curl http://localhost:3000/api/submissions/form/{form-id}/stats
```

**Resposta:**
```json
{
  "totalSubmissions": 42,
  "recentSubmissions": 7,
  "fieldsCount": 5,
  "rulesCount": 3,
  "formStatus": "ACTIVE"
}
```

## 🔍 Health Check

```bash
GET /health

curl http://localhost:3000/api/health
```

**Resposta:**
```json
{
  "status": "ok",
  "message": "Labore Forms API is running"
}
```

## 📝 Exemplo Completo: Criar Formulário Completo

### Passo 1: Criar formulário
```bash
curl -X POST http://localhost:3000/api/forms \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Inspeção de Produto",
    "description": "Formulário para inspeção",
    "status": "ACTIVE"
  }'
```

Guarde o `id` retornado (ex: `form-123`)

### Passo 2: Adicionar campos
```bash
# Campo 1: Largura
curl -X POST http://localhost:3000/api/forms/form-123/fields \
  -H "Content-Type: application/json" \
  -d '{
    "label": "Largura (cm)",
    "fieldKey": "largura",
    "type": "NUMBER",
    "required": true,
    "order": 0
  }'

# Campo 2: Altura
curl -X POST http://localhost:3000/api/forms/form-123/fields \
  -H "Content-Type: application/json" \
  -d '{
    "label": "Altura (cm)",
    "fieldKey": "altura",
    "type": "NUMBER",
    "required": true,
    "order": 1
  }'

# Campo 3: Quantidade
curl -X POST http://localhost:3000/api/forms/form-123/fields \
  -H "Content-Type: application/json" \
  -d '{
    "label": "Quantidade",
    "fieldKey": "quantidade",
    "type": "NUMBER",
    "required": true,
    "order": 2
  }'
```

Guarde os `id`s dos campos

### Passo 3: Adicionar regra
```bash
curl -X POST http://localhost:3000/api/forms/form-123/rules \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Área Total",
    "ruleKey": "area_total",
    "formula": "largura * altura * quantidade",
    "order": 0
  }'
```

### Passo 4: Submeter resposta
```bash
curl -X POST http://localhost:3000/api/submissions \
  -H "Content-Type: application/json" \
  -d '{
    "formId": "form-123",
    "responses": [
      {
        "fieldId": "field-largura-id",
        "value": "10"
      },
      {
        "fieldId": "field-altura-id",
        "value": "5"
      },
      {
        "fieldId": "field-quantidade-id",
        "value": "3"
      }
    ]
  }'
```

**Resultado esperado:**
- Área Total calculada automaticamente: `150.00` (10 * 5 * 3)

## 🔄 Códigos de Status HTTP

- `200 OK` - Sucesso
- `201 Created` - Recurso criado
- `204 No Content` - Sucesso sem corpo de resposta (delete)
- `400 Bad Request` - Dados inválidos
- `404 Not Found` - Recurso não encontrado
- `500 Internal Server Error` - Erro no servidor

## 💡 Dicas

1. **Sempre valide a fórmula** antes de criar uma regra
2. **Use fieldKey** consistentes e descritivos
3. **Teste com Postman/Insomnia** para desenvolvimento
4. **Campos numéricos** são necessários para fórmulas
5. **Status ACTIVE** é necessário para aceitar submissões




