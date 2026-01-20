# ⚡ Guia Rápido - Funcionalidade Offline

## 🎯 O Que Mudou?

Agora você pode **preencher formulários sem internet**! Tudo é salvo automaticamente e sincronizado quando a conexão voltar.

## ✅ Como Usar

### 1. Preencha Formulários Normalmente
- Abra qualquer formulário
- Preencha os campos
- Clique em "Enviar"

### 2. Funciona Online e Offline
- **Com Internet:** Envia imediatamente (comportamento normal)
- **Sem Internet:** Salva localmente e sincroniza depois

### 3. Acompanhe o Status
Olhe no **canto inferior direito** da tela:

- 🌐 **"Online"** → Tudo normal, conectado
- 📴 **"Modo Offline"** → Sem conexão, salvando localmente
- 🔄 **"Sincronizando..."** → Enviando dados salvos
- **Badge com número** → Quantidade de formulários aguardando sincronização

### 4. Sincronização Automática
Quando a internet voltar:
- ✅ A sincronização acontece automaticamente
- ✅ Você será notificado quando completar
- ✅ Pode forçar clicando no botão "Sync"

## 🧪 Teste Você Mesmo

### Teste Rápido (2 minutos)

1. **Abra a aplicação normalmente**
   ```
   http://localhost:5173
   ```

2. **Desconecte a internet**
   - Desative o WiFi, ou
   - No Chrome DevTools: F12 → Network → Offline

3. **Preencha um formulário**
   - Escolha qualquer formulário
   - Preencha os campos
   - Clique em "Enviar"

4. **Veja a mensagem**
   ```
   ✅ Formulário salvo localmente!
   
   Você está offline. O formulário será sincronizado 
   automaticamente quando a conexão for restabelecida.
   ```

5. **Reconecte a internet**
   - Reative o WiFi, ou
   - DevTools: Network → Online

6. **Veja a sincronização**
   - Badge aparece mostrando "1"
   - Indicador muda para "Sincronizando..."
   - Após alguns segundos, tudo limpa ✅

## 🎨 Interface

### Indicador Offline

```
┌─────────────────────────────────────┐
│ 📴 Modo Offline              [1]    │
├─────────────────────────────────────┤
│ 1 formulário pendente     [Sync]   │
├─────────────────────────────────────┤
│ Você pode continuar preenchendo     │
│ formulários. Eles serão            │
│ sincronizados quando a conexão for │
│ restabelecida.                     │
└─────────────────────────────────────┘
```

### Indicador Sincronizando

```
┌─────────────────────────────────────┐
│ 🌐 Online                    [1]    │
├─────────────────────────────────────┤
│ 🔄 Sincronizando...                │
└─────────────────────────────────────┘
```

### Indicador Online (Normal)

```
(Nenhum indicador aparece quando está 
tudo online e sincronizado)
```

## 🛠️ Comandos Úteis (DevTools Console)

### Ver quantos formulários estão pendentes
```javascript
import { offlineDB } from './services/offline';
await offlineDB.countPendingSubmissions();
```

### Ver detalhes dos pendentes
```javascript
await offlineDB.getPendingSubmissions();
```

### Forçar sincronização
```javascript
import { syncService } from './services/sync';
await syncService.forcSync();
```

### Limpar tudo (reset)
```javascript
await offlineDB.clearAll();
```

## ❓ FAQ Rápido

**P: Perco meus dados se fechar o navegador offline?**
R: Não! Os dados ficam salvos no navegador até sincronizar.

**P: Quantos formulários posso salvar offline?**
R: Depende do navegador, mas geralmente 50MB+ (centenas de formulários).

**P: Funciona no celular?**
R: Sim! Funciona em qualquer navegador moderno (Chrome, Firefox, Safari, Edge).

**P: E se o backend mudar enquanto estou offline?**
R: A sincronização usa a versão mais recente. Se houver conflito, o backend pode rejeitar.

**P: Como desabilito isso?**
R: Não é necessário. Funciona automaticamente quando online e só ativa quando offline.

**P: É seguro?**
R: Sim. Dados ficam apenas no seu navegador, criptografados pelo browser (HTTPS).

## 🚨 Limitações

⚠️ **Não suportado:**
- Navegadores muito antigos (< 2018)
- Modo privado/anônimo (dados não persistem)
- Navegadores sem IndexedDB

⚠️ **Funcionalidades offline limitadas:**
- ✅ Preencher formulários
- ✅ Visualizar formulários já vistos
- ✅ Lista de formulários (cache)
- ❌ Criar novos formulários (requer online)
- ❌ Editar formulários (requer online)
- ❌ Ver estatísticas (requer online)

## 📱 PWA - Instalar como App

Você pode instalar o Labore Forms como um aplicativo:

**Desktop (Chrome):**
1. Olhe o ícone ➕ na barra de endereço
2. Clique em "Instalar"

**Mobile (Android):**
1. Menu → "Adicionar à tela inicial"

**Mobile (iOS):**
1. Compartilhar → "Adicionar à Tela de Início"

## 🎉 Pronto!

Agora você pode trabalhar **em qualquer lugar**, com ou sem internet!

---

📚 **Mais detalhes:** [OFFLINE_FIRST.md](./OFFLINE_FIRST.md)







