import { Request, Response, NextFunction } from 'express';
import { verifyToken, JWTPayload } from '../lib/auth';
import { prisma } from '../lib/prisma';

// Middleware de autenticação - verifica se o usuário está autenticado
export async function authenticate(req: Request, res: Response, next: NextFunction) {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Token não fornecido' });
    }

    const token = authHeader.substring(7);
    const decoded = verifyToken(token);
    
    // Verificar se o usuário ainda existe e está ativo
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: { id: true, email: true, role: true, isActive: true, companyId: true }
    });

    if (!user || !user.isActive) {
      return res.status(401).json({ error: 'Usuário inválido ou inativo' });
    }

    req.user = {
      userId: user.id,
      email: user.email,
      role: user.role,
      companyId: user.companyId || undefined
    };

    next();
  } catch (error) {
    return res.status(401).json({ error: 'Token inválido ou expirado' });
  }
}

// Middleware de autorização - verifica se o usuário tem a permissão necessária
export function authorize(...allowedRoles: string[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Não autenticado' });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Acesso negado' });
    }

    next();
  };
}

// Middleware para verificar se o usuário tem acesso a uma empresa específica
export async function checkCompanyAccess(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Não autenticado' });
    }

    const companyId = req.params.companyId || req.body.companyId;

    // SUPERADMIN tem acesso a tudo
    if (req.user.role === 'SUPERADMIN') {
      return next();
    }

    // Outros usuários só podem acessar sua própria empresa
    if (req.user.companyId !== companyId) {
      return res.status(403).json({ error: 'Acesso negado a esta empresa' });
    }

    next();
  } catch (error) {
    return res.status(500).json({ error: 'Erro ao verificar acesso' });
  }
}

// Middleware para verificar se o usuário tem acesso a um projeto específico
export async function checkProjectAccess(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Não autenticado' });
    }

    const projectId = req.params.projectId || req.body.projectId;

    // SUPERADMIN tem acesso a tudo
    if (req.user.role === 'SUPERADMIN') {
      return next();
    }

    // Verificar se o projeto pertence à empresa do usuário (para ADMIN)
    if (req.user.role === 'ADMIN') {
      const project = await prisma.project.findFirst({
        where: {
          id: projectId,
          companyId: req.user.companyId!
        }
      });

      if (!project) {
        return res.status(403).json({ error: 'Acesso negado a este projeto' });
      }

      return next();
    }

    // Para ENGENHEIRO e LABORATORISTA, verificar se tem vínculo com o projeto
    const userProject = await prisma.userProject.findFirst({
      where: {
        userId: req.user.userId,
        projectId: projectId
      }
    });

    if (!userProject) {
      return res.status(403).json({ error: 'Acesso negado a este projeto' });
    }

    next();
  } catch (error) {
    return res.status(500).json({ error: 'Erro ao verificar acesso' });
  }
}





