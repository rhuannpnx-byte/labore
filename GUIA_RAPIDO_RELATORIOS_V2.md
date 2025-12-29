# 🚀 Guia Rápido - Relatórios V2 (Sistema Inteligente)

## ⚡ Novidades em 2 Minutos

### 🎯 O que mudou?

1. **Formulário Obrigatório** - Todo relatório agora precisa de um formulário
2. **Autocomplete com @ e #** - Digite e veja sugestões inteligentes
3. **Cores nas Variáveis** - Azul para cadastros, verde para campos
4. **Acesso Direto** - Relatórios têm seção própria no menu

## 📝 Criar Primeiro Relatório (3 minutos)

### Passo 1: Acesse Relatórios
```
Dashboard → Relatórios → + Novo Relatório
```

### Passo 2: Preencha Informações
```
Título: Relatório de Ensaio
Descrição: Relatório automático de ensaios
Formulário: [SELECIONE UM] ← OBRIGATÓRIO
Status: Rascunho
```

### Passo 3: Salvar
```
Botão "Salvar Relatório"
```

### Passo 4: Adicionar Texto
```
1. + Adicionar Elemento → Texto
2. Digite: "Obra: "
3. Digite @ (arroba)
4. Veja lista de sugestões em AZUL
5. Selecione "Nome da Obra" (ou use ↑↓ e Enter)
6. Resultado: @{project.name}
```

### Passo 5: Adicionar Dados do Formulário
```
1. Digite: "Resultado: "
2. Digite # (hashtag/jogo-da-velha)
3. Veja lista de sugestões em VERDE
4. Selecione um campo do formulário
5. Resultado: #{field.nome_do_campo}
```

## 🎨 Sistema de Autocomplete

### @ (Arroba) - Dados de Cadastro 🔵

Digite `@` e veja:

```
@{project.name}        ← Nome da Obra
@{company.name}        ← Nome da Empresa
@{currentDate}         ← Data de Hoje
```

**Cor**: <span style="background: #dbeafe; color: #1d4ed8; padding: 2px 6px; border-radius: 4px;">Azul Claro</span>

### # (Hashtag) - Campos do Formulário 🟢

Digite `#` e veja:

```
#{field.resistencia}   ← Valor do campo
#{calc.aprovado}       ← Resultado calculado
```

**Cor**: <span style="background: #dcfce7; color: #15803d; padding: 2px 6px; border-radius: 4px;">Verde Claro</span>

## ⌨️ Atalhos de Teclado

```
@              - Abre lista de cadastros
#              - Abre lista de campos
↑ ↓            - Navegar nas sugestões
Enter ou Tab   - Selecionar sugestão
Esc            - Fechar lista
```

## 📊 Exemplo Completo

### No Editor:
```
RELATÓRIO DE ENSAIO

Obra: @{project.name}
Endereço: @{project.address}
Empresa: @{company.name}

RESULTADOS
Resistência: #{field.resistencia} MPa
Status: #{calc.status}

Responsável: @{submittedBy.name}
Data: @{currentDate}
```

### Após Gerar:
```
RELATÓRIO DE ENSAIO

Obra: Edifício Central
Endereço: Av. Paulista, 1000
Empresa: Construtora ABC

RESULTADOS
Resistência: 32.5 MPa
Status: APROVADO

Responsável: João Silva
Data: 18/12/2024
```

## 🎯 Dicas Rápidas

### ✅ FAÇA
- Use `@` para dados que não mudam (obra, empresa)
- Use `#` para dados do formulário (campos, cálculos)
- Aproveite o autocomplete (mais rápido e sem erros)
- Veja o preview com cores para confirmar

### ❌ EVITE
- Digitar variáveis manualmente (use o autocomplete!)
- Esquecer de selecionar o formulário
- Misturar formatos antigos `{{}}` com novos

## 🐛 Problemas Comuns

### "Não vejo sugestões ao digitar @"
**Solução**: Certifique-se de estar em um campo de texto editável

### "Lista de # está vazia"
**Solução**: Selecione um formulário primeiro (obrigatório)

### "Variável não substitui ao gerar"
**Solução**: Use o autocomplete para garantir o formato correto

### "Não consigo criar relatório"
**Solução**: Formulário é obrigatório - selecione um na lista

## 📚 Variáveis Mais Usadas

### Top 5 Cadastros (@)
```
1. @{project.name}       - Nome da Obra
2. @{company.name}       - Nome da Empresa
3. @{currentDate}        - Data de Hoje
4. @{submittedBy.name}   - Quem Preencheu
5. @{project.address}    - Endereço da Obra
```

### Top 5 Formulário (#)
```
1. #{field.NOME_CAMPO}   - Valor do Campo
2. #{calc.NOME_CALCULO}  - Resultado do Cálculo
3. #{form.title}         - Nome do Formulário
```

## 🎓 Casos de Uso

### 1. Cabeçalho Padrão
```
=== RELATÓRIO ===
Obra: @{project.name}
Data: @{currentDate}
```

### 2. Dados Técnicos
```
Ensaio: #{form.title}
Valor Medido: #{field.valor}
Status: #{calc.aprovado}
```

### 3. Rodapé com Assinatura
```
___________________________
@{submittedBy.name}
@{currentDate}
```

## 🚀 Fluxo Completo

```
1. Dashboard → Relatórios
2. + Novo Relatório
3. Preencher (título, formulário*)
4. Salvar
5. + Adicionar Elemento → Texto
6. Digitar @ ou # e usar autocomplete
7. Fechar elemento
8. Botão "Gerar"
9. Selecionar projeto e submissão
10. 🚀 Gerar Relatório
11. 🖨️ Imprimir/PDF
```

## 💡 Pro Tips

### Tip 1: Combine Variáveis
```
Total: #{calc.total} (@{project.code})
```

### Tip 2: Use Tabelas
```
| Info      | Valor               |
|-----------|---------------------|
| Obra      | @{project.name}     |
| Resultado | #{field.resultado}  |
```

### Tip 3: Organize por Blocos
```
=== CABEÇALHO (@) ===
@{project.name}

=== DADOS (#) ===
#{field.valor}

=== RODAPÉ (@) ===
@{currentDate}
```

## 🎯 Checklist Rápido

Antes de gerar o relatório:

- [ ] Formulário selecionado
- [ ] Projeto ativo selecionado
- [ ] Variáveis `@` e `#` destacadas em cores
- [ ] Elementos na ordem correta
- [ ] Status = "Ativo" (se for usar em produção)

## 🔗 Links Úteis

- **Documentação Completa**: `MODULO_RELATORIOS_V2.md`
- **Exemplos Avançados**: Seção "Exemplos" na documentação
- **Suporte**: Equipe de desenvolvimento

---

**Versão**: 2.0.0  
**Tempo de Leitura**: 5 minutos  
**Tempo de Prática**: 3 minutos






