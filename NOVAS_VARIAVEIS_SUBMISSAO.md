# 📋 Novas Variáveis de Submissão nos Relatórios

## 🎯 Objetivo

Permitir que os usuários acessem informações padrões do preenchimento do formulário usando o símbolo `#` nos relatórios, incluindo dados sobre quem preencheu, quando foi preenchido, etc.

## ✨ Novas Variáveis Disponíveis

### Informações da Submissão (usando `#`)

Agora é possível usar `#` para resgatar as seguintes informações padrões da submissão:

| Variável | Descrição | Formato de Saída |
|----------|-----------|------------------|
| `#{form.title}` | Título do formulário | Texto |
| `#{submittedBy.name}` | Nome de quem preencheu | Texto |
| `#{submittedBy.email}` | Email de quem preencheu | Email |
| `#{submittedAt}` | Data e hora completa | dd/mm/aaaa HH:mm:ss |
| `#{submittedAt.date}` | Somente data | dd/mm/aaaa |
| `#{submittedAt.time}` | Somente hora | HH:mm |
| `#{field.CAMPO}` | Valor de um campo específico | Conforme tipo |
| `#{calc.CALCULO}` | Resultado de um cálculo | Número/Texto |

### Como Funciona

1. **No Editor de Relatórios**: Digite `#` em qualquer elemento de texto (Texto, Título, Tabela, etc.)
2. **Autocomplete Inteligente**: Uma lista suspensa aparece mostrando todas as opções disponíveis
3. **Seleção**: Use as setas ↑↓ para navegar e Enter/Tab para selecionar
4. **Inserção**: A variável é inserida no formato `#{nome.campo}`

### Exemplo Prático

#### Antes (sem informações de submissão):
```
RELATÓRIO DE ENSAIO

Obra: @{project.name}
Resultado: #{field.resistencia}
```

#### Depois (com informações de submissão):
```
RELATÓRIO DE ENSAIO

Obra: @{project.name}
Formulário: #{form.title}
Resultado: #{field.resistencia}

---
INFORMAÇÕES DO PREENCHIMENTO

Preenchido por: #{submittedBy.name}
Email: #{submittedBy.email}
Data do preenchimento: #{submittedAt.date}
Hora do preenchimento: #{submittedAt.time}

---
Relatório gerado em: @{currentDate}
```

## 🔍 Diferença entre @ e #

| Símbolo | Tipo de Dados | Cor no Editor | Exemplos |
|---------|---------------|---------------|----------|
| **@** | Dados de Cadastro (Obra, Empresa, Sistema) | Azul 🔵 | `@{project.name}`, `@{company.cnpj}`, `@{currentDate}` |
| **#** | Dados da Submissão (Formulário preenchido) | Verde 🟢 | `#{submittedBy.name}`, `#{field.campo}`, `#{calc.resultado}` |

## 💡 Casos de Uso

### 1. Identificar Responsável pelo Preenchimento
```
Este formulário foi preenchido por #{submittedBy.name} (#{submittedBy.email})
em #{submittedAt.date} às #{submittedAt.time}.
```

### 2. Cabeçalho de Relatório Completo
```
RELATÓRIO: #{form.title}
OBRA: @{project.name}
CLIENTE: @{project.client}

Preenchido por: #{submittedBy.name}
Data: #{submittedAt.date}
```

### 3. Rodapé com Rastreabilidade
```
---
Documento gerado em: @{currentDateTime}
Baseado em preenchimento de: #{submittedAt}
Responsável: #{submittedBy.name}
Sistema: @{company.name}
```

## 🔧 Implementação Técnica

### Frontend
- **Arquivo**: `frontend/src/components/report/SmartTextEditor.tsx`
- **Mudança**: Adicionadas 6 novas sugestões no array `submissionInfoSuggestions` dentro de `getCampoSuggestions()`

### Backend
- **Arquivo**: `backend/src/controllers/report.controller.ts`
- **Função**: `processTextVariables()`
- **Mudanças**:
  - Adicionadas variáveis `submittedBy.name`, `submittedBy.email`
  - Processamento especial para `submittedAt` com 3 formatos:
    - Completo: Data e hora
    - `.date`: Somente data (dd/mm/aaaa)
    - `.time`: Somente hora (HH:mm)

## 📚 Documentação Atualizada

Os seguintes documentos foram atualizados para incluir as novas variáveis:

1. ✅ `MODULO_RELATORIOS_V2.md` - Documentação completa
2. ✅ `GUIA_RAPIDO_RELATORIOS_V2.md` - Guia rápido

## ✅ Status

**Implementação Concluída** - Todas as novas variáveis estão funcionais e disponíveis tanto no autocomplete quanto na geração de relatórios.

---

**Data de Implementação**: 09/01/2026
**Versão**: 2.1

