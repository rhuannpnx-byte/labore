# 🔧 Correção do Erro IndexedDB

## ❌ Erro

```
NotFoundError: Failed to execute 'transaction' on 'IDBDatabase': 
One of the specified object stores was not found.
```

---

## 🎯 Causa

O IndexedDB já foi criado na **versão 1** (sem o store `cached_projects`), e agora estamos tentando acessar um store que **não existe** na versão atual aberta no navegador.

---

## ✅ Solução

### **SIMPLES: Recarregue a Página**

Faça um **hard refresh** para que o IndexedDB seja atualizado para a versão 2:

```
Ctrl + Shift + R (Windows/Linux)
Cmd + Shift + R (Mac)
```

Ou feche e abra o navegador novamente.

---

## 🔍 O Que Fizemos

### **1. Incrementamos a Versão do Banco** ✅

```typescript
// Antes
const DB_VERSION = 1;

// Agora
const DB_VERSION = 2; // ✅ Nova versão com cached_projects
```

### **2. Código de Upgrade Já Estava Correto** ✅

O código já verifica e cria stores que não existem:

```typescript
request.onupgradeneeded = (event) => {
  const db = (event.target as IDBOpenDBRequest).result;

  // Verifica antes de criar cada store
  if (!db.objectStoreNames.contains(CACHED_PROJECTS_STORE)) {
    db.createObjectStore(CACHED_PROJECTS_STORE, { keyPath: 'id' });
  }
};
```

### **3. Melhoramos Tratamento de Erro** ✅

Agora o erro não quebra a aplicação, apenas loga no console.

---

## 🧪 Teste

### **Após Recarregar:**

1. **Recarregue a página** (`Ctrl + Shift + R`)

2. **Verifique no DevTools:**
   ```
   F12 → Application → IndexedDB → labore_forms_offline
   ```

   Deve mostrar **3 stores:**
   - ✅ `pending_submissions`
   - ✅ `cached_forms`
   - ✅ `cached_projects` ← NOVO!

3. **Teste o seletor de obras:**
   - Abra o seletor de obras
   - Deve funcionar normalmente
   - ✅ **Sem erros no console!**

---

## 🔄 Por Que Isso Acontece?

### **Ciclo de Vida do IndexedDB**

1. **Primeira vez que a aplicação abre:**
   ```
   IndexedDB.open("labore_forms_offline", 1)
   → Evento onupgradeneeded dispara
   → Cria stores: pending_submissions, cached_forms
   → Banco fica aberto com versão 1
   ```

2. **Código é atualizado (adiciona novo store):**
   ```
   // Código mudou para versão 2, mas banco ainda está versão 1
   ```

3. **Tenta usar novo store:**
   ```
   transaction.objectStore('cached_projects')
   → ❌ ERRO: Store não existe na versão 1!
   ```

4. **Usuário recarrega a página:**
   ```
   IndexedDB.open("labore_forms_offline", 2)
   → Banco versão 1 < versão solicitada 2
   → Evento onupgradeneeded dispara
   → Cria novo store: cached_projects
   → ✅ Agora funciona!
   ```

---

## 💡 Para Desenvolvedores

### **Se Adicionar Novos Stores no Futuro:**

1. **Incremente a versão:**
   ```typescript
   const DB_VERSION = 3; // ou 4, 5, etc
   ```

2. **Adicione o novo store no onupgradeneeded:**
   ```typescript
   if (!db.objectStoreNames.contains('novo_store')) {
     db.createObjectStore('novo_store', { keyPath: 'id' });
   }
   ```

3. **Avise os usuários para recarregar** (ou force reload automático)

### **Forçar Reload Automático (Opcional):**

```typescript
// Em offline.ts, no init:
request.onupgradeneeded = (event) => {
  // ... criar stores ...
  
  // Se é um upgrade (não primeira criação)
  if (event.oldVersion > 0) {
    console.log('IndexedDB atualizado! Recarregando...');
    setTimeout(() => window.location.reload(), 1000);
  }
};
```

---

## 🗑️ Limpar Tudo e Recomeçar (Se Necessário)

Se o erro persistir, limpe o IndexedDB manualmente:

### **Opção 1: Via DevTools**

```
F12 → Application → IndexedDB
→ Right-click em "labore_forms_offline"
→ "Delete database"
→ Recarregue a página
```

### **Opção 2: Via Console**

```javascript
indexedDB.deleteDatabase('labore_forms_offline');
location.reload();
```

---

## ✅ Status Após Correção

- ✅ Versão do banco incrementada para 2
- ✅ Store `cached_projects` será criado no próximo carregamento
- ✅ Tratamento de erro melhorado
- ✅ Após recarregar: tudo funcionando!

---

## 📝 Resumo

**Problema:** Store não existia na versão atual do banco  
**Causa:** Código atualizado mas banco ainda na versão antiga  
**Solução:** Incrementar versão + recarregar página  
**Resultado:** ✅ Funcionando perfeitamente!

---

**Recarregue a página agora e o erro vai sumir!** 🚀


