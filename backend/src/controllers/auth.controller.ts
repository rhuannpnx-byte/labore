import { Request, Response } from 'express';
import { prisma } from '../lib/prisma';
import { hashPassword, comparePassword, generateToken } from '../lib/auth';
import { z } from 'zod';

// Schema de validação para login
const loginSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(1, 'Senha obrigatória')
});

// Schema de validação para registro (apenas SUPERADMIN pode registrar novos usuários)
const registerSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'Senha deve ter no mínimo 6 caracteres'),
  name: z.string().min(1, 'Nome obrigatório'),
  phone: z.string().optional(),
  role: z.enum(['SUPERADMIN', 'ADMIN', 'ENGENHEIRO', 'LABORATORISTA']),
  companyId: z.string().uuid().optional()
});

// Login
export async function login(req: Request, res: Response) {
  try {
    const { email, password } = loginSchema.parse(req.body);

    // Buscar usuário
    const user = await prisma.user.findUnique({
      where: { email },
      include: { company: true }
    });

    if (!user) {
      return res.status(401).json({ error: 'Credenciais inválidas' });
    }

    if (!user.isActive) {
      return res.status(401).json({ error: 'Usuário inativo' });
    }

    // Verificar senha
    const isValidPassword = await comparePassword(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Credenciais inválidas' });
    }

    // Gerar token
    const token = generateToken({
      userId: user.id,
      email: user.email,
      role: user.role,
      companyId: user.companyId || undefined
    });

    // Retornar dados do usuário e token
    return res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        companyId: user.companyId,
        company: user.company ? {
          id: user.company.id,
          name: user.company.name
        } : null
      }
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors[0].message });
    }
    console.error('Erro no login:', error);
    return res.status(500).json({ error: 'Erro ao fazer login' });
  }
}

// Obter dados do usuário autenticado
export async function getMe(req: Request, res: Response) {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Não autenticado' });
    }

    const user = await prisma.user.findUnique({
      where: { id: req.user.userId },
      select: {
        id: true,
        email: true,
        name: true,
        phone: true,
        role: true,
        isActive: true,
        companyId: true,
        company: {
          select: {
            id: true,
            name: true,
            cnpj: true
          }
        },
        userProjects: {
          include: {
            project: {
              select: {
                id: true,
                name: true,
                code: true,
                status: true
              }
            }
          }
        }
      }
    });

    if (!user) {
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }

    return res.json(user);
  } catch (error) {
    console.error('Erro ao buscar usuário:', error);
    return res.status(500).json({ error: 'Erro ao buscar dados do usuário' });
  }
}

// Alterar senha
export async function changePassword(req: Request, res: Response) {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Não autenticado' });
    }

    const { currentPassword, newPassword } = z.object({
      currentPassword: z.string().min(1, 'Senha atual obrigatória'),
      newPassword: z.string().min(6, 'Nova senha deve ter no mínimo 6 caracteres')
    }).parse(req.body);

    // Buscar usuário
    const user = await prisma.user.findUnique({
      where: { id: req.user.userId }
    });

    if (!user) {
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }

    // Verificar senha atual
    const isValidPassword = await comparePassword(currentPassword, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Senha atual incorreta' });
    }

    // Hash da nova senha
    const hashedPassword = await hashPassword(newPassword);

    // Atualizar senha
    await prisma.user.update({
      where: { id: req.user.userId },
      data: { password: hashedPassword }
    });

    return res.json({ message: 'Senha alterada com sucesso' });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors[0].message });
    }
    console.error('Erro ao alterar senha:', error);
    return res.status(500).json({ error: 'Erro ao alterar senha' });
  }
}





