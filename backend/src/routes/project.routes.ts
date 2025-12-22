import { Router } from 'express';
import {
  listProjects,
  getProject,
  createProject,
  updateProject,
  deleteProject,
  addUserToProject,
  removeUserFromProject
} from '../controllers/project.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';

const router = Router();

// Todas as rotas de projeto requerem autenticação
router.use(authenticate);

// Rotas de projetos
router.get('/', authenticate, listProjects); // Todos os usuários podem listar projetos (com filtros)
router.get('/:id', authenticate, getProject); // Todos os usuários podem ver detalhes (com verificação de acesso)
router.post('/', authorize('SUPERADMIN', 'ADMIN'), createProject);
router.put('/:id', authorize('SUPERADMIN', 'ADMIN'), updateProject);
router.delete('/:id', authorize('SUPERADMIN', 'ADMIN'), deleteProject);

// Gerenciamento de usuários em projetos
router.post('/:id/users', authorize('SUPERADMIN', 'ADMIN'), addUserToProject);
router.delete('/:id/users/:userId', authorize('SUPERADMIN', 'ADMIN'), removeUserFromProject);

export default router;





