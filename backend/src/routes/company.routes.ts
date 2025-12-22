import { Router } from 'express';
import {
  listCompanies,
  getCompany,
  createCompany,
  updateCompany,
  deleteCompany
} from '../controllers/company.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';

const router = Router();

// Todas as rotas de empresa requerem autenticação
router.use(authenticate);

// Rotas de empresas
router.get('/', authorize('SUPERADMIN', 'ADMIN'), listCompanies);
router.get('/:id', authorize('SUPERADMIN', 'ADMIN'), getCompany);
router.post('/', authorize('SUPERADMIN'), createCompany);
router.put('/:id', authorize('SUPERADMIN', 'ADMIN'), updateCompany);
router.delete('/:id', authorize('SUPERADMIN'), deleteCompany);

export default router;





