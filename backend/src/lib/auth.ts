import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

// Configurações
const JWT_SECRET = process.env.JWT_SECRET || 'sua-chave-secreta-super-segura-mude-em-producao';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '365d'; // 1 ano - expira apenas com logout ativo
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
  // Type assertion para contornar problema de inferência do TypeScript
  return jwt.sign(payload, JWT_SECRET, { 
    expiresIn: JWT_EXPIRES_IN 
  } as jwt.SignOptions);
}

// Verificar token JWT
export function verifyToken(token: string): JWTPayload {
  return jwt.verify(token, JWT_SECRET) as JWTPayload;
}





