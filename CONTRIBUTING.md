# 🤝 Guia de Contribuição - Labore Forms

Obrigado por considerar contribuir com o Labore Forms! Este documento fornece diretrizes para contribuir com o projeto.

## 📋 Índice

- [Como Contribuir](#como-contribuir)
- [Reportando Bugs](#reportando-bugs)
- [Sugerindo Melhorias](#sugerindo-melhorias)
- [Desenvolvimento](#desenvolvimento)
- [Padrões de Código](#padrões-de-código)
- [Processo de Pull Request](#processo-de-pull-request)

## 🚀 Como Contribuir

### Formas de Contribuir

1. **Reportar bugs** 🐛
2. **Sugerir novos recursos** 💡
3. **Melhorar documentação** 📚
4. **Escrever código** 💻
5. **Revisar pull requests** 👀
6. **Compartilhar o projeto** 📢

## 🐛 Reportando Bugs

Antes de reportar um bug:

1. **Verifique** se já não foi reportado nas issues
2. **Teste** na versão mais recente
3. **Reproduza** o erro de forma consistente

### Template de Bug Report

```markdown
**Descrição do Bug**
Uma descrição clara do que aconteceu.

**Como Reproduzir**
Passos para reproduzir:
1. Vá para '...'
2. Clique em '...'
3. Role até '...'
4. Veja o erro

**Comportamento Esperado**
O que você esperava que acontecesse.

**Screenshots**
Se aplicável, adicione screenshots.

**Ambiente:**
- OS: [ex: Windows 10]
- Browser: [ex: Chrome 120]
- Node Version: [ex: 18.0.0]
- Database: [ex: PostgreSQL 15]

**Informações Adicionais**
Qualquer outra informação relevante.
```

## 💡 Sugerindo Melhorias

### Template de Feature Request

```markdown
**O problema que isso resolve**
Uma descrição clara do problema.

**Solução Proposta**
Uma descrição da solução que você gostaria.

**Alternativas Consideradas**
Outras soluções que você considerou.

**Informações Adicionais**
Contexto adicional, mockups, etc.
```

## 💻 Desenvolvimento

### Setup do Ambiente

```bash
# 1. Fork o repositório
# 2. Clone seu fork
git clone https://github.com/seu-usuario/Labore.git
cd Labore

# 3. Adicione o remote upstream
git remote add upstream https://github.com/original/Labore.git

# 4. Siga o SETUP.md para configurar
```

### Estrutura de Branches

- `main` - Código de produção estável
- `develop` - Desenvolvimento ativo
- `feature/*` - Novos recursos
- `bugfix/*` - Correções de bugs
- `hotfix/*` - Correções urgentes

### Workflow

```bash
# 1. Crie uma branch a partir de develop
git checkout develop
git pull upstream develop
git checkout -b feature/minha-feature

# 2. Faça suas alterações
# 3. Commit com mensagens claras
git add .
git commit -m "feat: adiciona nova funcionalidade"

# 4. Push para seu fork
git push origin feature/minha-feature

# 5. Abra um Pull Request
```

## 📝 Padrões de Código

### TypeScript

```typescript
// ✅ BOM
interface User {
  id: string;
  name: string;
  email: string;
}

function getUser(id: string): Promise<User> {
  // implementação
}

// ❌ EVITE
function getUser(id) {
  // sem tipos
}
```

### Nomenclatura

**Variáveis e Funções:**
```typescript
// camelCase
const userName = 'João';
function getUserName() {}
```

**Componentes React:**
```typescript
// PascalCase
function FormBuilder() {}
export default FormBuilder;
```

**Constantes:**
```typescript
// UPPER_SNAKE_CASE
const MAX_ITEMS = 100;
const API_BASE_URL = 'http://...';
```

**Arquivos:**
```
// kebab-case para utilitários
utils/string-helpers.ts

// PascalCase para componentes
components/FormBuilder.tsx
```

### Comentários

```typescript
// ✅ BOM - Explica o "porquê"
// Usamos setTimeout para evitar race condition com o banco
setTimeout(() => {}, 100);

// ❌ EVITE - Explica o óbvio
// Incrementa i
i++;
```

### React

```tsx
// ✅ BOM - Componente funcional com tipos
interface FormProps {
  id: string;
  title: string;
}

export function Form({ id, title }: FormProps) {
  return <div>{title}</div>;
}

// ✅ BOM - Hooks organizados
export function MyComponent() {
  // 1. State
  const [data, setData] = useState<Data[]>([]);
  
  // 2. Effects
  useEffect(() => {
    loadData();
  }, []);
  
  // 3. Handlers
  const handleClick = () => {};
  
  // 4. Render
  return <div>...</div>;
}
```

### Backend

```typescript
// ✅ BOM - Controller com tratamento de erro
export class UserController {
  static async list(req: Request, res: Response) {
    try {
      const users = await prisma.user.findMany();
      res.json(users);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }
}

// ✅ BOM - Validação com Zod
const createUserSchema = z.object({
  name: z.string().min(1),
  email: z.string().email()
});
```

## 🔍 Testes (Futuro)

Quando implementarmos testes:

```typescript
// Nomenclatura de testes
describe('FormController', () => {
  describe('create', () => {
    it('should create a new form', async () => {
      // Arrange
      const data = { title: 'Test' };
      
      // Act
      const result = await FormController.create(data);
      
      // Assert
      expect(result.title).toBe('Test');
    });
  });
});
```

## 📤 Processo de Pull Request

### Checklist

Antes de abrir um PR, certifique-se:

- [ ] Código segue os padrões do projeto
- [ ] Comentários adicionados onde necessário
- [ ] Documentação atualizada (se aplicável)
- [ ] Sem erros de lint/TypeScript
- [ ] Testado localmente
- [ ] Commit messages são claros

### Commits Semânticos

Use o padrão Conventional Commits:

```bash
# Features
git commit -m "feat: adiciona validação de email"
git commit -m "feat(frontend): implementa dark mode"

# Bug fixes
git commit -m "fix: corrige cálculo de área"
git commit -m "fix(api): resolve erro 500 em /forms"

# Documentação
git commit -m "docs: atualiza README com exemplos"

# Estilo/Formatação
git commit -m "style: formata código com prettier"

# Refatoração
git commit -m "refactor: simplifica lógica de validação"

# Performance
git commit -m "perf: otimiza query do Prisma"

# Testes
git commit -m "test: adiciona testes para FormController"

# Chores
git commit -m "chore: atualiza dependências"
```

### Template de Pull Request

```markdown
## Descrição
Descreva suas alterações de forma clara.

## Tipo de Mudança
- [ ] Bug fix
- [ ] Nova feature
- [ ] Breaking change
- [ ] Documentação

## Como Testar
1. Passo 1
2. Passo 2
3. Passo 3

## Checklist
- [ ] Código segue os padrões
- [ ] Comentários adicionados
- [ ] Documentação atualizada
- [ ] Sem warnings
- [ ] Testado localmente

## Screenshots (se aplicável)
```

## 🎨 Estilo de Código

### CSS/Estilos

```css
/* ✅ BOM - Use CSS Variables */
.button {
  background-color: var(--primary);
  color: var(--text);
}

/* ✅ BOM - Classes descritivas */
.btn-primary { }
.card-header { }
.form-group { }

/* ❌ EVITE - Classes genéricas */
.btn1 { }
.box { }
```

### Imports

```typescript
// ✅ BOM - Ordenados e agrupados
// 1. Externos
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

// 2. Internos - Services
import { api } from '../services/api';

// 3. Internos - Types
import type { Form } from '../types';

// 4. Internos - Components
import { Button } from '../components/Button';

// 5. Estilos
import './styles.css';
```

## 🔒 Segurança

### Nunca Comite:
- ❌ Senhas ou credentials
- ❌ API keys
- ❌ Arquivos `.env`
- ❌ Dados pessoais
- ❌ Tokens de acesso

### Sempre:
- ✅ Use `.env.example` para documentar variáveis
- ✅ Valide inputs no backend
- ✅ Sanitize dados do usuário
- ✅ Use HTTPS em produção

## 📚 Recursos Úteis

- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [React Documentation](https://react.dev)
- [Prisma Documentation](https://www.prisma.io/docs)
- [Conventional Commits](https://www.conventionalcommits.org/)

## ❓ Dúvidas

Se tiver dúvidas:

1. Verifique a [documentação](./README.md)
2. Procure nas [issues existentes](../../issues)
3. Abra uma [nova issue](../../issues/new)

## 🎉 Reconhecimento

Contribuidores serão listados no README e terão nossa gratidão eterna! ❤️

---

**Obrigado por contribuir com o Labore Forms!** 🚀



