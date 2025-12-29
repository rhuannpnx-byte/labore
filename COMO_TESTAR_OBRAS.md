# 🧪 Como Testar o Sistema de Obras

## 🚀 Passo a Passo Completo

### 1. Reiniciar os Servidores

```bash
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend
cd frontend
npm run dev
```

### 2. Acessar o Sistema

Abra o navegador em: **http://localhost:5173**

### 3. Testar com Laboratorista

#### Login
```
Email: laboratorista@tecpav.com
Senha: lab123
```

#### O que Esperar:
- ✅ Dashboard carrega
- ⚠️ **Alerta amarelo aparece**: "Nenhuma obra selecionada"
- 📍 Seletor de obras visível no cabeçalho (badge amarelo)

### 4. Selecionar uma Obra

#### Ações:
1. Clique no badge amarelo "Selecione uma obra"
2. Dropdown abre mostrando obras disponíveis
3. Clique em "Obra Rodovia BR-101"

#### O que Esperar:
- ✅ Alerta amarelo **desaparece**
- ✅ Badge fica **azul** mostrando "Obra Rodovia BR-101"
- ✅ Subtítulo atualiza: "Obra ativa: Obra Rodovia BR-101"
- ✅ Seleção é **salva** (persiste ao recarregar página)

### 5. Preencher um Formulário

#### Ações:
1. Clique em "Respostas"
2. Escolha "Inspeção de Pavimentação"
3. Clique em "Preencher"
4. Preencha os campos:
   - Espessura: `10`
   - Largura: `5`
   - Comprimento: `100`
   - Temperatura: `150`
5. Clique em "Enviar"

#### O que Esperar:
- ✅ Submissão criada com sucesso
- ✅ Cálculos automáticos aparecem
- ✅ Submissão **vinculada à Obra BR-101**

### 6. Trocar de Obra

#### Ações:
1. Clique no seletor novamente
2. Selecione "Viaduto Centro"

#### O que Esperar:
- ✅ Badge atualiza para "Viaduto Centro"
- ✅ Ao ir em "Respostas", **não vê** a submissão anterior
- ✅ Lista está vazia (obra diferente, dados diferentes)

### 7. Voltar para Obra BR-101

#### Ações:
1. Clique no seletor
2. Selecione "Obra Rodovia BR-101" novamente

#### O que Esperar:
- ✅ Vê a submissão que criou antes
- ✅ Dados da obra BR-101 aparecem

### 8. Testar Limpar Seleção

#### Ações:
1. Clique no **X** ao lado do nome da obra

#### O que Esperar:
- ✅ Badge volta para amarelo "Selecione uma obra"
- ⚠️ Alerta amarelo **reaparece**

## 🎭 Testar com Outros Usuários

### ENGENHEIRO
```bash
Email: engenheiro@tecpav.com
Senha: eng123
```

**Comportamento:**
- ✅ Vê alerta se não selecionar obra
- ✅ Tem acesso a 2 obras (BR-101 e Viaduto Centro)
- ✅ Pode criar formulários
- ✅ Pode preencher formulários

### ADMIN
```bash
Email: admin@tecpav.com
Senha: admin123
```

**Comportamento:**
- ✅ **NÃO vê alerta** (opcional para ADMIN)
- ✅ Pode criar novas obras
- ✅ Pode gerenciar usuários
- ✅ Vê todas as obras da empresa

### SUPERADMIN
```bash
Email: rhuann.nunes@tecpav.com
Senha: Rh021197@
```

**Comportamento:**
- ✅ **NÃO vê alerta** (opcional)
- ✅ Vê TODAS as obras de TODAS as empresas
- ✅ Pode fazer tudo
- ✅ Pode criar empresas

## 🔍 Verificar no Backend

### Verificar Submissão no Banco

```bash
cd backend
npx prisma studio
```

1. Abra `FormSubmission`
2. Veja a última submissão criada
3. Verifique os campos:
   - `projectId`: UUID da obra
   - `submittedById`: UUID do usuário

### Verificar no Terminal do Backend

Ao criar uma submissão, você pode ver no terminal:
```
POST /api/submissions
Body: {
  formId: "...",
  projectId: "...",  ← Deve estar presente
  responses: [...]
}
```

## 🐛 Testes de Casos Especiais

### Caso 1: Recarregar Página

1. Selecione uma obra
2. Recarregue a página (F5)
3. **Espera**: Obra continua selecionada

### Caso 2: Fechar e Abrir Navegador

1. Selecione uma obra
2. Feche o navegador completamente
3. Abra novamente e faça login
4. **Espera**: Obra continua selecionada

### Caso 3: Usuário Sem Obras

1. Login como ADMIN
2. Crie um novo usuário LABORATORISTA
3. **NÃO** vincule a nenhuma obra
4. Faça login com esse usuário
5. **Espera**: Seletor mostra "Nenhuma obra disponível"

### Caso 4: Filtro de Submissões

1. Login como ENGENHEIRO
2. Selecione Obra BR-101
3. Preencha 2 formulários
4. Troque para Viaduto Centro
5. Preencha 1 formulário
6. Volte para BR-101
7. **Espera**: Vê apenas as 2 submissões da BR-101

### Caso 5: Tentar Preencher Sem Obra

1. Login como LABORATORISTA
2. Limpe a seleção (clique no X)
3. Tente ir em "Respostas"
4. **Espera**: Vê alerta pedindo para selecionar obra

## ✅ Checklist de Testes

- [ ] Laboratorista vê alerta sem obra selecionada
- [ ] Seletor mostra obras disponíveis
- [ ] Selecionar obra atualiza interface
- [ ] Alerta desaparece após selecionar
- [ ] Badge muda de amarelo para azul
- [ ] Subtítulo mostra obra ativa
- [ ] Submissão vinculada à obra
- [ ] Trocar obra mostra dados diferentes
- [ ] Seleção persiste ao recarregar
- [ ] Limpar seleção volta alerta
- [ ] ADMIN não vê alerta
- [ ] SUPERADMIN não vê alerta
- [ ] Usuário sem obras vê mensagem correta
- [ ] Filtro de submissões funciona

## 🎯 O Que Cada Teste Valida

### ✅ Funcionalidade
- Seletor funciona
- Filtros funcionam
- Persistência funciona

### ✅ Segurança
- Isolamento de dados por obra
- Usuários só veem suas obras
- Submissões vinculadas corretamente

### ✅ UX
- Alertas aparecem quando necessário
- Interface intuitiva
- Feedback visual claro

### ✅ Performance
- Carregamento rápido
- Troca de obra instantânea
- Filtros eficientes

## 📊 Métricas de Sucesso

### Tudo Funcionando Se:

- ✅ **Isolamento**: Obras diferentes = dados diferentes
- ✅ **Persistência**: Seleção mantida entre sessões
- ✅ **Validação**: Alertas aparecem quando necessário
- ✅ **Segurança**: Usuários só veem o permitido
- ✅ **UX**: Interface clara e intuitiva

## 🆘 Solução de Problemas

### Problema: Seletor não aparece

**Solução:**
1. Verifique se Zustand foi instalado: `npm list zustand`
2. Reinicie o frontend: `npm run dev`
3. Limpe cache do navegador

### Problema: Alerta não desaparece

**Solução:**
1. Verifique se obra foi realmente selecionada
2. Abra DevTools → Console
3. Digite: `localStorage.getItem('labore-selected-project')`
4. Deve retornar um objeto JSON

### Problema: Submissões não filtram

**Solução:**
1. Verifique no Prisma Studio se `projectId` está preenchido
2. Verifique console do backend para erros
3. Teste a API diretamente: `GET /api/submissions?projectId=uuid`

### Problema: Obras não aparecem

**Solução:**
1. Verifique se usuário tem obras vinculadas
2. Login como ADMIN e vincule o usuário
3. Execute seed novamente se necessário

## 🎉 Teste Completo Passou Se...

Você conseguiu:
1. ✅ Ver o alerta como LABORATORISTA
2. ✅ Selecionar uma obra
3. ✅ Preencher um formulário
4. ✅ Trocar de obra e ver dados diferentes
5. ✅ Voltar e ver dados anteriores
6. ✅ Recarregar e manter seleção
7. ✅ Limpar seleção e ver alerta voltar

**Parabéns! O sistema está 100% funcional! 🚀**

---

**Última atualização**: 17/12/2025






