import { Router } from 'express';
import {
  listUsers,
  getUser,
  createUser,
  updateUser,
  deleteUser
} from '../controllers/user.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';

const router = Router();

// Todas as rotas de usuário requerem autenticação
router.use(authenticate);

// Rotas de usuários
router.get('/', authorize('SUPERADMIN', 'ADMIN'), listUsers);
router.get('/:id', authorize('SUPERADMIN', 'ADMIN'), getUser);
router.post('/', authorize('SUPERADMIN', 'ADMIN'), createUser);
router.put('/:id', authorize('SUPERADMIN', 'ADMIN'), updateUser);
router.delete('/:id', authorize('SUPERADMIN', 'ADMIN'), deleteUser);

export default router;





