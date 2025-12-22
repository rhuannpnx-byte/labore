import { Router } from 'express';
import { SubmissionController } from '../controllers/submission.controller';
import { authenticate } from '../middleware/auth.middleware';

export const submissionRoutes = Router();

// Listar todas as submissões de um formulário
submissionRoutes.get('/form/:formId', authenticate, SubmissionController.listByForm);

// Buscar submissão por ID
submissionRoutes.get('/:id', authenticate, SubmissionController.getById);

// Criar nova submissão (preencher formulário) - requer autenticação
submissionRoutes.post('/', authenticate, SubmissionController.create);

// Deletar submissão
submissionRoutes.delete('/:id', authenticate, SubmissionController.delete);

// Obter estatísticas de um formulário
submissionRoutes.get('/form/:formId/stats', authenticate, SubmissionController.getStats);

