import { Request, Response } from 'express';
import { prisma } from '../lib/prisma';
import { z } from 'zod';

// Schema de validação para criação de empresa
const createCompanySchema = z.object({
  name: z.string().min(1, 'Nome obrigatório'),
  cnpj: z.string().optional(),
  address: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email().optional()
});

// Schema de validação para atualização de empresa
const updateCompanySchema = z.object({
  name: z.string().min(1).optional(),
  cnpj: z.string().optional(),
  address: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email().optional()
});

// Listar empresas
export async function listCompanies(req: Request, res: Response) {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Não autenticado' });
    }

    let where: any = {};

    // ADMIN vê apenas sua empresa
    if (req.user.role === 'ADMIN') {
      where.id = req.user.companyId;
    } else if (req.user.role !== 'SUPERADMIN') {
      return res.status(403).json({ error: 'Acesso negado' });
    }

    const companies = await prisma.company.findMany({
      where,
      include: {
        _count: {
          select: {
            projects: true,
            users: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    return res.json(companies);
  } catch (error) {
    console.error('Erro ao listar empresas:', error);
    return res.status(500).json({ error: 'Erro ao listar empresas' });
  }
}

// Obter empresa por ID
export async function getCompany(req: Request, res: Response) {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Não autenticado' });
    }

    const { id } = req.params;

    // Verificar acesso
    if (req.user.role === 'ADMIN' && id !== req.user.companyId) {
      return res.status(403).json({ error: 'Acesso negado' });
    } else if (req.user.role !== 'SUPERADMIN' && req.user.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Acesso negado' });
    }

    const company = await prisma.company.findUnique({
      where: { id },
      include: {
        projects: {
          select: {
            id: true,
            name: true,
            code: true,
            status: true,
            createdAt: true
          },
          orderBy: { createdAt: 'desc' }
        },
        users: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
            isActive: true
          },
          orderBy: { name: 'asc' }
        },
        _count: {
          select: {
            projects: true,
            users: true
          }
        }
      }
    });

    if (!company) {
      return res.status(404).json({ error: 'Empresa não encontrada' });
    }

    return res.json(company);
  } catch (error) {
    console.error('Erro ao buscar empresa:', error);
    return res.status(500).json({ error: 'Erro ao buscar empresa' });
  }
}

// Criar empresa (apenas SUPERADMIN)
export async function createCompany(req: Request, res: Response) {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Não autenticado' });
    }

    // Apenas SUPERADMIN pode criar empresas
    if (req.user.role !== 'SUPERADMIN') {
      return res.status(403).json({ error: 'Apenas superadministradores podem criar empresas' });
    }

    const data = createCompanySchema.parse(req.body);

    // Verificar se CNPJ já existe (se fornecido)
    if (data.cnpj) {
      const existingCompany = await prisma.company.findUnique({
        where: { cnpj: data.cnpj }
      });

      if (existingCompany) {
        return res.status(400).json({ error: 'CNPJ já cadastrado' });
      }
    }

    const company = await prisma.company.create({
      data
    });

    return res.status(201).json(company);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors[0].message });
    }
    console.error('Erro ao criar empresa:', error);
    return res.status(500).json({ error: 'Erro ao criar empresa' });
  }
}

// Atualizar empresa
export async function updateCompany(req: Request, res: Response) {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Não autenticado' });
    }

    const { id } = req.params;

    // Verificar acesso
    if (req.user.role === 'ADMIN' && id !== req.user.companyId) {
      return res.status(403).json({ error: 'Acesso negado' });
    } else if (req.user.role !== 'SUPERADMIN' && req.user.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Acesso negado' });
    }

    const data = updateCompanySchema.parse(req.body);

    // Verificar se empresa existe
    const company = await prisma.company.findUnique({
      where: { id }
    });

    if (!company) {
      return res.status(404).json({ error: 'Empresa não encontrada' });
    }

    // Verificar se CNPJ já existe em outra empresa (se fornecido)
    if (data.cnpj) {
      const existingCompany = await prisma.company.findFirst({
        where: {
          cnpj: data.cnpj,
          id: { not: id }
        }
      });

      if (existingCompany) {
        return res.status(400).json({ error: 'CNPJ já cadastrado em outra empresa' });
      }
    }

    const updatedCompany = await prisma.company.update({
      where: { id },
      data
    });

    return res.json(updatedCompany);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors[0].message });
    }
    console.error('Erro ao atualizar empresa:', error);
    return res.status(500).json({ error: 'Erro ao atualizar empresa' });
  }
}

// Deletar empresa (apenas SUPERADMIN)
export async function deleteCompany(req: Request, res: Response) {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Não autenticado' });
    }

    // Apenas SUPERADMIN pode deletar empresas
    if (req.user.role !== 'SUPERADMIN') {
      return res.status(403).json({ error: 'Apenas superadministradores podem deletar empresas' });
    }

    const { id } = req.params;

    // Verificar se empresa existe
    const company = await prisma.company.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            projects: true,
            users: true
          }
        }
      }
    });

    if (!company) {
      return res.status(404).json({ error: 'Empresa não encontrada' });
    }

    // Deletar empresa (CASCADE irá deletar projetos e desvincular usuários)
    await prisma.company.delete({
      where: { id }
    });

    return res.json({ message: 'Empresa deletada com sucesso' });
  } catch (error) {
    console.error('Erro ao deletar empresa:', error);
    return res.status(500).json({ error: 'Erro ao deletar empresa' });
  }
}





