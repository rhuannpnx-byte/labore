import { Request, Response } from 'express';
import { prisma } from '../lib/prisma';
import { hashPassword } from '../lib/auth';
import { z } from 'zod';

// Schema de validação para criação de usuário
const createUserSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'Senha deve ter no mínimo 6 caracteres'),
  name: z.string().min(1, 'Nome obrigatório'),
  phone: z.string().optional(),
  role: z.enum(['SUPERADMIN', 'ADMIN', 'ENGENHEIRO', 'LABORATORISTA']),
  companyId: z.string().uuid().optional(),
  projectIds: z.array(z.string().uuid()).optional()
});

// Schema de validação para atualização de usuário
const updateUserSchema = z.object({
  name: z.string().min(1).optional(),
  phone: z.string().optional(),
  role: z.enum(['SUPERADMIN', 'ADMIN', 'ENGENHEIRO', 'LABORATORISTA']).optional(),
  isActive: z.boolean().optional(),
  companyId: z.string().uuid().nullable().optional(),
  projectIds: z.array(z.string().uuid()).optional()
});

// Listar usuários
export async function listUsers(req: Request, res: Response) {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Não autenticado' });
    }

    let where: any = {};

    // SUPERADMIN vê todos os usuários
    // ADMIN vê apenas usuários da sua empresa
    if (req.user.role === 'ADMIN') {
      where.companyId = req.user.companyId;
    } else if (req.user.role !== 'SUPERADMIN') {
      return res.status(403).json({ error: 'Acesso negado' });
    }

    const users = await prisma.user.findMany({
      where,
      select: {
        id: true,
        email: true,
        name: true,
        phone: true,
        role: true,
        isActive: true,
        companyId: true,
        createdAt: true,
        company: {
          select: {
            id: true,
            name: true
          }
        },
        userProjects: {
          include: {
            project: {
              select: {
                id: true,
                name: true
              }
            }
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    return res.json(users);
  } catch (error) {
    console.error('Erro ao listar usuários:', error);
    return res.status(500).json({ error: 'Erro ao listar usuários' });
  }
}

// Obter usuário por ID
export async function getUser(req: Request, res: Response) {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Não autenticado' });
    }

    const { id } = req.params;

    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        name: true,
        phone: true,
        role: true,
        isActive: true,
        companyId: true,
        createdAt: true,
        updatedAt: true,
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

    // Verificar acesso
    if (req.user.role === 'ADMIN' && user.companyId !== req.user.companyId) {
      return res.status(403).json({ error: 'Acesso negado' });
    }

    return res.json(user);
  } catch (error) {
    console.error('Erro ao buscar usuário:', error);
    return res.status(500).json({ error: 'Erro ao buscar usuário' });
  }
}

// Criar usuário
export async function createUser(req: Request, res: Response) {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Não autenticado' });
    }

    const data = createUserSchema.parse(req.body);

    // Verificar permissões
    if (req.user.role === 'ADMIN') {
      // ADMIN só pode criar usuários da sua empresa
      if (data.companyId && data.companyId !== req.user.companyId) {
        return res.status(403).json({ error: 'Você só pode criar usuários da sua empresa' });
      }
      // ADMIN não pode criar SUPERADMIN
      if (data.role === 'SUPERADMIN') {
        return res.status(403).json({ error: 'Você não pode criar superadministradores' });
      }
      // Forçar companyId do admin
      data.companyId = req.user.companyId;
    } else if (req.user.role !== 'SUPERADMIN') {
      return res.status(403).json({ error: 'Acesso negado' });
    }

    // Verificar se email já existe
    const existingUser = await prisma.user.findUnique({
      where: { email: data.email }
    });

    if (existingUser) {
      return res.status(400).json({ error: 'Email já cadastrado' });
    }

    // Hash da senha
    const hashedPassword = await hashPassword(data.password);

    // Criar usuário
    const { projectIds, ...userData } = data;
    const user = await prisma.user.create({
      data: {
        ...userData,
        password: hashedPassword
      },
      select: {
        id: true,
        email: true,
        name: true,
        phone: true,
        role: true,
        isActive: true,
        companyId: true,
        createdAt: true
      }
    });

    // Vincular projetos se fornecidos
    if (projectIds && projectIds.length > 0) {
      await prisma.userProject.createMany({
        data: projectIds.map(projectId => ({
          userId: user.id,
          projectId
        }))
      });
    }

    return res.status(201).json(user);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors[0].message });
    }
    console.error('Erro ao criar usuário:', error);
    return res.status(500).json({ error: 'Erro ao criar usuário' });
  }
}

// Atualizar usuário
export async function updateUser(req: Request, res: Response) {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Não autenticado' });
    }

    const { id } = req.params;
    const data = updateUserSchema.parse(req.body);

    // Buscar usuário
    const user = await prisma.user.findUnique({
      where: { id }
    });

    if (!user) {
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }

    // Verificar permissões
    if (req.user.role === 'ADMIN') {
      // ADMIN só pode atualizar usuários da sua empresa
      if (user.companyId !== req.user.companyId) {
        return res.status(403).json({ error: 'Acesso negado' });
      }
      // ADMIN não pode alterar role para SUPERADMIN
      if (data.role === 'SUPERADMIN') {
        return res.status(403).json({ error: 'Você não pode promover usuários a superadministrador' });
      }
      // ADMIN não pode mudar companyId
      delete data.companyId;
    } else if (req.user.role !== 'SUPERADMIN') {
      return res.status(403).json({ error: 'Acesso negado' });
    }

    const { projectIds, ...updateData } = data;

    // Atualizar usuário
    const updatedUser = await prisma.user.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        email: true,
        name: true,
        phone: true,
        role: true,
        isActive: true,
        companyId: true,
        updatedAt: true
      }
    });

    // Atualizar projetos se fornecidos
    if (projectIds !== undefined) {
      // Remover todos os vínculos atuais
      await prisma.userProject.deleteMany({
        where: { userId: id }
      });

      // Criar novos vínculos
      if (projectIds.length > 0) {
        await prisma.userProject.createMany({
          data: projectIds.map(projectId => ({
            userId: id,
            projectId
          }))
        });
      }
    }

    return res.json(updatedUser);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors[0].message });
    }
    console.error('Erro ao atualizar usuário:', error);
    return res.status(500).json({ error: 'Erro ao atualizar usuário' });
  }
}

// Deletar usuário
export async function deleteUser(req: Request, res: Response) {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Não autenticado' });
    }

    const { id } = req.params;

    // Buscar usuário
    const user = await prisma.user.findUnique({
      where: { id }
    });

    if (!user) {
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }

    // Não permitir deletar a si mesmo
    if (user.id === req.user.userId) {
      return res.status(400).json({ error: 'Você não pode deletar seu próprio usuário' });
    }

    // Verificar permissões
    if (req.user.role === 'ADMIN') {
      // ADMIN só pode deletar usuários da sua empresa (exceto SUPERADMIN)
      if (user.companyId !== req.user.companyId || user.role === 'SUPERADMIN') {
        return res.status(403).json({ error: 'Acesso negado' });
      }
    } else if (req.user.role !== 'SUPERADMIN') {
      return res.status(403).json({ error: 'Acesso negado' });
    }

    // Deletar usuário
    await prisma.user.delete({
      where: { id }
    });

    return res.json({ message: 'Usuário deletado com sucesso' });
  } catch (error) {
    console.error('Erro ao deletar usuário:', error);
    return res.status(500).json({ error: 'Erro ao deletar usuário' });
  }
}





