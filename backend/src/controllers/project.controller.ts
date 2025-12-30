import { Request, Response } from 'express';
import { prisma } from '../lib/prisma';
import { z } from 'zod';

// Schema de validação para criação de projeto
const createProjectSchema = z.object({
  name: z.string().min(1, 'Nome obrigatório'),
  code: z.string().optional(),
  client: z.string().optional(),
  logo: z.string().optional(),
  address: z.string().optional(),
  description: z.string().optional(),
  status: z.enum(['ACTIVE', 'PAUSED', 'COMPLETED', 'CANCELLED']).optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  companyId: z.string().uuid('ID da empresa inválido')
});

// Schema de validação para atualização de projeto
const updateProjectSchema = z.object({
  name: z.string().min(1).optional(),
  code: z.string().optional(),
  client: z.string().optional(),
  logo: z.string().nullable().optional(),
  address: z.string().optional(),
  description: z.string().optional(),
  status: z.enum(['ACTIVE', 'PAUSED', 'COMPLETED', 'CANCELLED']).optional(),
  startDate: z.string().nullable().optional(),
  endDate: z.string().nullable().optional()
});

// Listar projetos
export async function listProjects(req: Request, res: Response) {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Não autenticado' });
    }

    let where: any = {};

    // SUPERADMIN vê todos os projetos
    if (req.user.role === 'SUPERADMIN') {
      // Pode filtrar por empresa se fornecido
      if (req.query.companyId) {
        where.companyId = req.query.companyId;
      }
    }
    // ADMIN vê apenas projetos da sua empresa
    else if (req.user.role === 'ADMIN') {
      where.companyId = req.user.companyId;
    }
    // ENGENHEIRO e LABORATORISTA veem apenas projetos vinculados
    else {
      const userProjects = await prisma.userProject.findMany({
        where: { userId: req.user.userId },
        select: { projectId: true }
      });
      where.id = { in: userProjects.map((up: any) => up.projectId) };
    }

    const projects = await prisma.project.findMany({
      where,
      include: {
        company: {
          select: {
            id: true,
            name: true
          }
        },
        _count: {
          select: {
            userProjects: true,
            submissions: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    return res.json(projects);
  } catch (error) {
    console.error('Erro ao listar projetos:', error);
    return res.status(500).json({ error: 'Erro ao listar projetos' });
  }
}

// Obter projeto por ID
export async function getProject(req: Request, res: Response) {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Não autenticado' });
    }

    const { id } = req.params;

    const project = await prisma.project.findUnique({
      where: { id },
      include: {
        company: {
          select: {
            id: true,
            name: true,
            cnpj: true
          }
        },
        userProjects: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                role: true
              }
            }
          }
        },
        _count: {
          select: {
            submissions: true
          }
        }
      }
    });

    if (!project) {
      return res.status(404).json({ error: 'Projeto não encontrado' });
    }

    // Verificar acesso
    if (req.user.role === 'ADMIN') {
      if (project.companyId !== req.user.companyId) {
        return res.status(403).json({ error: 'Acesso negado' });
      }
    } else if (req.user.role !== 'SUPERADMIN') {
      const hasAccess = await prisma.userProject.findFirst({
        where: {
          userId: req.user.userId,
          projectId: id
        }
      });

      if (!hasAccess) {
        return res.status(403).json({ error: 'Acesso negado' });
      }
    }

    return res.json(project);
  } catch (error) {
    console.error('Erro ao buscar projeto:', error);
    return res.status(500).json({ error: 'Erro ao buscar projeto' });
  }
}

// Criar projeto
export async function createProject(req: Request, res: Response) {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Não autenticado' });
    }

    const data = createProjectSchema.parse(req.body);

    // Verificar permissões
    if (req.user.role === 'ADMIN') {
      // ADMIN só pode criar projetos na sua empresa
      if (data.companyId !== req.user.companyId) {
        return res.status(403).json({ error: 'Você só pode criar projetos na sua empresa' });
      }
    } else if (req.user.role !== 'SUPERADMIN') {
      return res.status(403).json({ error: 'Acesso negado' });
    }

    // Verificar se a empresa existe
    const company = await prisma.company.findUnique({
      where: { id: data.companyId }
    });

    if (!company) {
      return res.status(404).json({ error: 'Empresa não encontrada' });
    }

    // Converter datas se fornecidas
    const projectData: any = { ...data };
    if (data.startDate) {
      projectData.startDate = new Date(data.startDate);
    }
    if (data.endDate) {
      projectData.endDate = new Date(data.endDate);
    }

    const project = await prisma.project.create({
      data: projectData,
      include: {
        company: {
          select: {
            id: true,
            name: true
          }
        }
      }
    });

    return res.status(201).json(project);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors[0].message });
    }
    console.error('Erro ao criar projeto:', error);
    return res.status(500).json({ error: 'Erro ao criar projeto' });
  }
}

// Atualizar projeto
export async function updateProject(req: Request, res: Response) {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Não autenticado' });
    }

    const { id } = req.params;
    const data = updateProjectSchema.parse(req.body);

    // Verificar se projeto existe
    const project = await prisma.project.findUnique({
      where: { id }
    });

    if (!project) {
      return res.status(404).json({ error: 'Projeto não encontrado' });
    }

    // Verificar permissões
    if (req.user.role === 'ADMIN') {
      if (project.companyId !== req.user.companyId) {
        return res.status(403).json({ error: 'Acesso negado' });
      }
    } else if (req.user.role !== 'SUPERADMIN') {
      return res.status(403).json({ error: 'Acesso negado' });
    }

    // Converter datas se fornecidas
    const updateData: any = { ...data };
    if (data.startDate !== undefined) {
      updateData.startDate = data.startDate ? new Date(data.startDate) : null;
    }
    if (data.endDate !== undefined) {
      updateData.endDate = data.endDate ? new Date(data.endDate) : null;
    }

    const updatedProject = await prisma.project.update({
      where: { id },
      data: updateData,
      include: {
        company: {
          select: {
            id: true,
            name: true
          }
        }
      }
    });

    return res.json(updatedProject);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors[0].message });
    }
    console.error('Erro ao atualizar projeto:', error);
    return res.status(500).json({ error: 'Erro ao atualizar projeto' });
  }
}

// Deletar projeto
export async function deleteProject(req: Request, res: Response) {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Não autenticado' });
    }

    const { id } = req.params;

    // Verificar se projeto existe
    const project = await prisma.project.findUnique({
      where: { id }
    });

    if (!project) {
      return res.status(404).json({ error: 'Projeto não encontrado' });
    }

    // Verificar permissões
    if (req.user.role === 'ADMIN') {
      if (project.companyId !== req.user.companyId) {
        return res.status(403).json({ error: 'Acesso negado' });
      }
    } else if (req.user.role !== 'SUPERADMIN') {
      return res.status(403).json({ error: 'Acesso negado' });
    }

    // Deletar projeto
    await prisma.project.delete({
      where: { id }
    });

    return res.json({ message: 'Projeto deletado com sucesso' });
  } catch (error) {
    console.error('Erro ao deletar projeto:', error);
    return res.status(500).json({ error: 'Erro ao deletar projeto' });
  }
}

// Vincular usuário a projeto
export async function addUserToProject(req: Request, res: Response) {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Não autenticado' });
    }

    const { id: projectId } = req.params;
    const { userId } = z.object({
      userId: z.string().uuid('ID do usuário inválido')
    }).parse(req.body);

    // Verificar se projeto existe
    const project = await prisma.project.findUnique({
      where: { id: projectId }
    });

    if (!project) {
      return res.status(404).json({ error: 'Projeto não encontrado' });
    }

    // Verificar permissões
    if (req.user.role === 'ADMIN') {
      if (project.companyId !== req.user.companyId) {
        return res.status(403).json({ error: 'Acesso negado' });
      }
    } else if (req.user.role !== 'SUPERADMIN') {
      return res.status(403).json({ error: 'Acesso negado' });
    }

    // Verificar se usuário existe
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user) {
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }

    // Verificar se já está vinculado
    const existingLink = await prisma.userProject.findUnique({
      where: {
        userId_projectId: {
          userId,
          projectId
        }
      }
    });

    if (existingLink) {
      return res.status(400).json({ error: 'Usuário já vinculado a este projeto' });
    }

    // Criar vínculo
    const userProject = await prisma.userProject.create({
      data: {
        userId,
        projectId
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true
          }
        },
        project: {
          select: {
            id: true,
            name: true
          }
        }
      }
    });

    return res.status(201).json(userProject);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors[0].message });
    }
    console.error('Erro ao vincular usuário:', error);
    return res.status(500).json({ error: 'Erro ao vincular usuário ao projeto' });
  }
}

// Remover usuário de projeto
export async function removeUserFromProject(req: Request, res: Response) {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Não autenticado' });
    }

    const { id: projectId, userId } = req.params;

    // Verificar se projeto existe
    const project = await prisma.project.findUnique({
      where: { id: projectId }
    });

    if (!project) {
      return res.status(404).json({ error: 'Projeto não encontrado' });
    }

    // Verificar permissões
    if (req.user.role === 'ADMIN') {
      if (project.companyId !== req.user.companyId) {
        return res.status(403).json({ error: 'Acesso negado' });
      }
    } else if (req.user.role !== 'SUPERADMIN') {
      return res.status(403).json({ error: 'Acesso negado' });
    }

    // Remover vínculo
    await prisma.userProject.delete({
      where: {
        userId_projectId: {
          userId,
          projectId
        }
      }
    });

    return res.json({ message: 'Usuário removido do projeto com sucesso' });
  } catch (error) {
    console.error('Erro ao remover usuário:', error);
    return res.status(500).json({ error: 'Erro ao remover usuário do projeto' });
  }
}





