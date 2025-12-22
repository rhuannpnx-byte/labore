# 🧪 Teste Offline - Passo a Passo

## 📋 Pré-requisitos

- ✅ Backend rodando em `http://localhost:3000`
- ✅ Frontend rodando em `http://localhost:5173`
- ✅ Banco de dados configurado e com seed executado

---

## 🧪 Teste 1: Funcionalidade Básica Online

### Objetivo
Verificar que tudo funciona normalmente quando online.

### Passos

1. **Abra a aplicação**
   ```
   http://localhost:5173
   ```

2. **Verifique o header**
   - Deve mostrar "Labore Forms"
   - Botão "Formulários" deve estar visível
   - **NÃO** deve haver botão "Pendentes" (nenhum pendente ainda)

3. **Liste os formulários**
   - Clique em "Formulários"
   - Deve mostrar 2 formulários (do seed)
   - ✅ **PASSOU:** Lista aparece normalmente

4. **Visualize um formulário**
   - Clique em "Visualizar" em qualquer formulário
   - Deve mostrar campos e regras
   - ✅ **PASSOU:** Formulário carrega normalmente

5. **Preencha o formulário**
   - Clique em "Preencher Formulário"
   - Preencha os campos
   - Clique em "Enviar Formulário"
   - Deve redirecionar para visualização da submission
   - ✅ **PASSOU:** Submission criada online

---

## 🧪 Teste 2: Detecção de Offline

### Objetivo
Verificar que a aplicação detecta quando fica offline.

### Passos

1. **Abra DevTools**
   - Pressione `F12`
   - Vá para aba **Network**

2. **Ative modo offline**
   - Dropdown "Throttling" (ou "No throttling")
   - Selecione **"Offline"**

3. **Verifique o indicador**
   - No canto inferior direito, deve aparecer:
   ```
   ┌─────────────────────────────┐
   │ 📴 Modo Offline            │
   │ Você pode continuar...     │
   └─────────────────────────────┘
   ```
   - ✅ **PASSOU:** Indicador apareceu

4. **Teste console**
   - Abra aba **Console**
   - Deve ver log: `📴 Status: OFFLINE`
   - ✅ **PASSOU:** Evento detectado

---

## 🧪 Teste 3: Salvar Formulário Offline

### Objetivo
Preencher e salvar formulário sem internet.

### Passos (ainda offline)

1. **Volte para a lista de formulários**
   - Clique em "Formulários" no header
   - **Nota:** Deve funcionar pois está em cache!
   - ✅ **PASSOU:** Lista carregou do cache

2. **Abra um formulário**
   - Clique em "Visualizar"
   - **Nota:** Se já visitou antes, carrega do cache
   - ✅ **PASSOU:** Formulário carregou do cache

3. **Preencha o formulário**
   - Clique em "Preencher Formulário"
   - Preencha os campos obrigatórios
   - Exemplo: Inspeção de Qualidade
     - Item Inspecionado: "Produto XYZ"
     - Unidades Defeituosas: "5"
     - Total de Unidades: "100"
     - Notas: "Teste offline"

4. **Envie o formulário**
   - Clique em "Enviar Formulário"
   - Deve aparecer alert:
   ```
   ✅ Formulário salvo localmente!
   
   Você está offline. O formulário será sincronizado
   automaticamente quando a conexão for restabelecida.
   ```
   - ✅ **PASSOU:** Alert apareceu

5. **Verifique o indicador**
   - Deve agora mostrar badge: `[1]`
   ```
   ┌─────────────────────────────┐
   │ 📴 Modo Offline       [1]  │
   │ 1 formulário pendente      │
   └─────────────────────────────┘
   ```
   - ✅ **PASSOU:** Badge com contador

6. **Verifique o header**
   - Deve aparecer novo botão: **"Pendentes (1)"**
   - ✅ **PASSOU:** Botão apareceu

---

## 🧪 Teste 4: Múltiplas Submissions Offline

### Objetivo
Salvar múltiplos formulários offline.

### Passos (ainda offline)

1. **Preencha outro formulário**
   - Volte para lista
   - Escolha outro formulário
   - Preencha e envie
   - Alert deve aparecer novamente

2. **Verifique contador**
   - Indicador deve mostrar: `[2]`
   - Header deve mostrar: "Pendentes (2)"
   - ✅ **PASSOU:** Contador incrementou

3. **Verifique página de pendentes**
   - Clique em "Pendentes (2)"
   - Deve listar 2 submissions
   - Mostra detalhes de cada uma
   - ✅ **PASSOU:** Lista de pendentes funciona

---

## 🧪 Teste 5: Persistência (Fechar/Reabrir)

### Objetivo
Verificar que dados persistem ao fechar o navegador.

### Passos (ainda offline)

1. **Feche a aba**
   - Feche completamente a aba do navegador
   - (Não apenas recarregue)

2. **Reabra a aplicação**
   ```
   http://localhost:5173
   ```

3. **Verifique persistência**
   - Indicador deve mostrar: `[2]`
   - Header deve mostrar: "Pendentes (2)"
   - Page de pendentes deve listar as 2 submissions
   - ✅ **PASSOU:** Dados persistiram

---

## 🧪 Teste 6: Sincronização Automática

### Objetivo
Verificar sincronização quando volta online.

### Passos

1. **Volte para aba Network**
   - DevTools → Network

2. **Volte online**
   - Throttling → **"Online"**

3. **Observe o indicador**
   - Deve mudar para:
   ```
   ┌─────────────────────────────┐
   │ 🌐 Online           [2]    │
   │ 🔄 Sincronizando...        │
   └─────────────────────────────┘
   ```
   - ✅ **PASSOU:** Status mudou para sincronizando

4. **Observe o console**
   - Deve ver logs:
   ```
   🌐 Status: ONLINE
   ✅ Conexão restabelecida - iniciando sincronização...
   🔄 Iniciando sincronização de 2 submission(s)...
   📤 Enviando submission pending_...
   ✅ Submission pending_... sincronizada com sucesso
   📤 Enviando submission pending_...
   ✅ Submission pending_... sincronizada com sucesso
   ✅ Sincronização concluída: 2 sucesso, 0 falhas
   ```
   - ✅ **PASSOU:** Logs de sincronização

5. **Aguarde alguns segundos**
   - Contador deve zerar: `[0]`
   - Indicador deve desaparecer completamente
   - Botão "Pendentes" deve sumir do header
   - ✅ **PASSOU:** Tudo sincronizado

6. **Verifique no backend**
   - Vá para `/submissions` (ou visual no banco)
   - As 2 submissions devem estar lá!
   - ✅ **PASSOU:** Dados no servidor

---

## 🧪 Teste 7: Sincronização Manual

### Objetivo
Testar botão de sincronização manual.

### Passos

1. **Crie uma submission offline**
   - DevTools → Network → Offline
   - Preencha e envie um formulário
   - Indicador deve aparecer com `[1]`

2. **Volte online**
   - Throttling → Online
   - **MAS:** Não aguarde a sincronização automática

3. **Force sincronização**
   - No indicador, clique no botão **"Sync"**
   - Deve sincronizar imediatamente
   - ✅ **PASSOU:** Sync manual funciona

---

## 🧪 Teste 8: Página de Administração

### Objetivo
Testar interface de gerenciamento de pendentes.

### Passos

1. **Crie 3 submissions offline**
   - Fique offline
   - Preencha e envie 3 formulários

2. **Acesse página de pendentes**
   - Clique em "Pendentes (3)"
   - Deve listar as 3 submissions
   - Mostra detalhes: ID, Form ID, Data, Número de tentativas

3. **Expanda detalhes**
   - Clique em "Ver respostas" em uma submission
   - Deve mostrar todas as respostas
   - ✅ **PASSOU:** Detalhes expandem

4. **Sincronize pela página**
   - Clique em "Sincronizar Agora" (ainda offline)
   - Deve mostrar aviso de offline
   - Volte online
   - Clique em "Sincronizar Agora"
   - Deve sincronizar todas
   - ✅ **PASSOU:** Botão de sync funciona

5. **Remova uma pendente**
   - Crie uma submission offline
   - Vá para pendentes
   - Clique no botão de lixeira
   - Confirme
   - Deve remover da lista
   - ✅ **PASSOU:** Remoção funciona

---

## 🧪 Teste 9: Service Worker

### Objetivo
Verificar cache de assets.

### Passos

1. **Verifique registro**
   - DevTools → Application → Service Workers
   - Deve mostrar SW registrado com status "activated"
   - ✅ **PASSOU:** SW registrado

2. **Verifique cache**
   - Application → Cache Storage
   - Deve ter cache: `labore-forms-v1`
   - Deve conter: index.html, manifest.json
   - ✅ **PASSOU:** Assets em cache

3. **Teste offline completo**
   - Feche o navegador
   - Desconecte WiFi/Ethernet (offline real)
   - Abra navegador
   - Acesse `http://localhost:5173`
   - **Nota:** Não vai funcionar (localhost precisa de conexão)
   - **Alternativa:** Em produção com domínio real, funcionaria
   - ✅ **PASSOU:** (teste em produção)

---

## 🧪 Teste 10: IndexedDB

### Objetivo
Verificar dados no banco local.

### Passos

1. **Abra IndexedDB viewer**
   - DevTools → Application → Storage → IndexedDB
   - Expanda: `labore_forms_offline`

2. **Verifique stores**
   - Deve ter 2 stores:
     - `pending_submissions`
     - `cached_forms`
   - ✅ **PASSOU:** Stores existem

3. **Inspeção pending_submissions**
   - Crie uma submission offline
   - Clique em `pending_submissions`
   - Deve mostrar a submission
   - Verifique campos: id, formId, data, timestamp, attempts
   - ✅ **PASSOU:** Dados corretos

4. **Inspeção cached_forms**
   - Clique em `cached_forms`
   - Deve mostrar formulários visitados
   - Verifique campos: id, title, fields, rules
   - ✅ **PASSOU:** Formulários em cache

---

## 🧪 Teste 11: Ferramenta de Teste

### Objetivo
Usar a página de teste automatizada.

### Passos

1. **Abra ferramenta de teste**
   ```
   http://localhost:5173/test-offline.html
   ```
   - Ou abra o arquivo: `frontend/test-offline.html`

2. **Execute cada teste**
   - Clique em cada botão
   - Verifique resultados
   - Todos devem mostrar ✅

3. **Verifique métricas**
   - Clique em "Atualizar Métricas"
   - Deve mostrar status, pendentes, cache
   - ✅ **PASSOU:** Métricas corretas

---

## 🧪 Teste 12: Erro e Retry

### Objetivo
Simular erro de servidor e testar retry.

### Passos

1. **Pare o backend**
   ```bash
   # No terminal do backend, pressione Ctrl+C
   ```

2. **Crie submission (online)**
   - Preencha formulário
   - Envie
   - Deve falhar (backend parado)
   - Deve salvar offline automaticamente
   - ✅ **PASSOU:** Salvou offline ao falhar

3. **Reinicie backend**
   ```bash
   npm run dev
   ```

4. **Aguarde sincronização**
   - Após ~30 segundos (ou force)
   - Deve sincronizar automaticamente
   - ✅ **PASSOU:** Retry funcionou

---

## 📊 Checklist Final

Marque todos os testes que passaram:

- [ ] Teste 1: Funcionalidade online ✅
- [ ] Teste 2: Detecção de offline ✅
- [ ] Teste 3: Salvar formulário offline ✅
- [ ] Teste 4: Múltiplas submissions offline ✅
- [ ] Teste 5: Persistência (fechar/reabrir) ✅
- [ ] Teste 6: Sincronização automática ✅
- [ ] Teste 7: Sincronização manual ✅
- [ ] Teste 8: Página de administração ✅
- [ ] Teste 9: Service Worker ✅
- [ ] Teste 10: IndexedDB ✅
- [ ] Teste 11: Ferramenta de teste ✅
- [ ] Teste 12: Erro e retry ✅

---

## 🎯 Resultados Esperados

### ✅ Se tudo passou:

```
🎉 SUCESSO!

A funcionalidade offline-first está 100% funcional:
- ✅ Salva formulários offline
- ✅ Sincroniza automaticamente
- ✅ Interface visual clara
- ✅ Dados persistem
- ✅ Service Worker ativo
- ✅ Cache funcionando
- ✅ Retry inteligente

Status: PRONTO PARA PRODUÇÃO
```

### ❌ Se algo falhou:

1. Verifique console do navegador (F12)
2. Verifique console do backend
3. Verifique conexão com banco de dados
4. Consulte [OFFLINE_FIRST.md](./OFFLINE_FIRST.md) seção Troubleshooting
5. Ou abra uma issue com:
   - Qual teste falhou
   - Mensagens de erro
   - Screenshots
   - Logs do console

---

## 🔧 Comandos Úteis Durante Testes

### Console do Navegador

```javascript
// Ver pendentes
await offlineDB.getPendingSubmissions()

// Contar pendentes
await offlineDB.countPendingSubmissions()

// Ver cache de formulários
await offlineDB.getAllCachedForms()

// Forçar sync
await syncService.forcSync()

// Limpar tudo
await offlineDB.clearAll()
```

### Shortcuts DevTools

- `F12` - Abrir/fechar DevTools
- `Ctrl+Shift+P` - Command palette
- `Ctrl+R` - Reload normal
- `Ctrl+Shift+R` - Hard reload (ignora cache)
- `Ctrl+Shift+Delete` - Limpar dados do navegador

---

## 📝 Notas

- **Modo Anônimo:** IndexedDB não persiste, não use para testar
- **Múltiplas Abas:** Service Worker é compartilhado, ok usar
- **Produção:** Em produção (domínio real + HTTPS), offline funciona melhor
- **Performance:** IndexedDB é assíncrono, pode ter pequeno delay

---

**Tempo estimado de teste completo:** 20-30 minutos

**Boa sorte! 🚀**





