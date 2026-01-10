import { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware';
import * as reportController from '../controllers/report.controller';

const router = Router();

// Todas as rotas requerem autenticação
router.use(authenticate);

// ====== ROTAS DE RELATÓRIOS ======

// Listar todos os relatórios
router.get('/', reportController.listReports);

// Obter relatório específico
router.get('/:id', reportController.getReport);

// Criar novo relatório
router.post('/', reportController.createReport);

// Atualizar relatório
router.put('/:id', reportController.updateReport);

// Deletar relatório
router.delete('/:id', reportController.deleteReport);

// Duplicar relatório
router.post('/:id/duplicate', reportController.duplicateReport);

// Compartilhar relatório
router.post('/:id/share', reportController.shareReport);

// ====== ROTAS DE ELEMENTOS ======

// Adicionar elemento ao relatório
router.post('/:reportId/elements', reportController.addElement);

// Atualizar elemento
router.put('/elements/:elementId', reportController.updateElement);

// Deletar elemento
router.delete('/elements/:elementId', reportController.deleteElement);

// ====== ROTAS DE GERAÇÕES ======

// Gerar relatório com dados reais
router.post('/:reportId/generate', reportController.generateReport);

// Listar gerações de relatório
router.get('/:reportId/generations', reportController.listGenerations);

// Obter geração específica
router.get('/generations/:generationId', reportController.getGeneration);

export default router;





