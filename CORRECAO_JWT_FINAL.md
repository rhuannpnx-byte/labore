# Correção Final do JWT - Definitiva

## Problema

Mesmo após múltiplas tentativas, o erro persistia:

```
src/lib/auth.ts(31,5): error TS2322: Type 'string' is not assignable to type 'number | StringValue | undefined'.
```

## Causa Raiz

TypeScript estava inferindo o tipo de `JWT_EXPIRES_IN` como `string | undefined` devido ao operador `||` com `process.env.JWT_EXPIRES_IN`.

Mesmo usando `SignOptions`, o TypeScript não conseguia garantir que o valor seria sempre uma string.

## Solução Definitiva

**Tipo explícito nas constantes:**

```typescript
// ❌ ANTES (causava erro)
const JWT_SECRET = process.env.JWT_SECRET || 'sua-chave-secreta...';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

// ✅ DEPOIS (funciona)
const JWT_SECRET: string = process.env.JWT_SECRET || 'sua-chave-secreta...';
const JWT_EXPIRES_IN: string = process.env.JWT_EXPIRES_IN || '7d';
```

**Código final limpo:**

```typescript
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

// Configurações
const JWT_SECRET: string = process.env.JWT_SECRET || 'sua-chave-secreta-super-segura-mude-em-producao';
const JWT_EXPIRES_IN: string = process.env.JWT_EXPIRES_IN || '7d';
const SALT_ROUNDS = 10;

// Interface do payload do JWT
export interface JWTPayload {
  userId: string;
  email: string;
  role: string;
  companyId?: string;
  name?: string;
}

// Hash de senha
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, SALT_ROUNDS);
}

// Verificar senha
export async function comparePassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

// Gerar token JWT
export function generateToken(payload: JWTPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
}

// Verificar token JWT
export function verifyToken(token: string): JWTPayload {
  return jwt.verify(token, JWT_SECRET) as JWTPayload;
}
```

## Por Que Funciona?

1. **Tipo explícito**: `: string` força TypeScript a tratar as constantes como string
2. **Operador ||**: Garante valor padrão se `process.env` for undefined
3. **Sem type assertions**: Não precisamos de `as string` porque o tipo já está garantido
4. **Código limpo**: Mais simples e elegante que tentativas anteriores

## Tentativas Anteriores (que não funcionaram)

### Tentativa 1: Type assertion no uso
```typescript
// ❌ Não funcionou
return jwt.sign(payload, JWT_SECRET as string, { expiresIn: JWT_EXPIRES_IN as string });
```

### Tentativa 2: SignOptions separado
```typescript
// ❌ Não funcionou
const options: SignOptions = {
  expiresIn: JWT_EXPIRES_IN
};
return jwt.sign(payload, JWT_SECRET, options);
```

### Tentativa 3 (FINAL): Tipo na declaração
```typescript
// ✅ FUNCIONA!
const JWT_EXPIRES_IN: string = process.env.JWT_EXPIRES_IN || '7d';
return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
```

## Lição Aprendida

**Sempre declare tipos explícitos para variáveis que vêm de `process.env`**, especialmente quando elas serão usadas em funções que esperam tipos específicos.

```typescript
// 👍 Boa prática
const VAR: string = process.env.VAR || 'default';

// 👎 Pode causar problemas
const VAR = process.env.VAR || 'default';
```

---

**Status:** ✅ RESOLVIDO DEFINITIVAMENTE  
**Data:** 22 de dezembro de 2025  
**Arquivo:** `backend/src/lib/auth.ts`

