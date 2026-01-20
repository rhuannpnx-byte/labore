import { Router } from 'express';
import { FormController } from '../controllers/form.controller';
import { authenticate } from '../middleware/auth.middleware';

export const formRoutes = Router();

// Todas as rotas requerem autenticação
formRoutes.use(authenticate);

// Listar todos os formulários
formRoutes.get('/', FormController.list);

// Buscar formulário por ID
formRoutes.get('/:id', FormController.getById);

// Criar novo formulário
formRoutes.post('/', FormController.create);

// Atualizar formulário
formRoutes.put('/:id', FormController.update);

// Deletar formulário
formRoutes.delete('/:id', FormController.delete);

// Adicionar campo ao formulário
formRoutes.post('/:id/fields', FormController.addField);

// Reordenar campos (DEVE vir antes de /:fieldId para não ser confundido)
formRoutes.put('/:id/fields/reorder', FormController.reorderFields);

// Atualizar campo
formRoutes.put('/:id/fields/:fieldId', FormController.updateField);

// Deletar campo
formRoutes.delete('/:id/fields/:fieldId', FormController.deleteField);

// Adicionar regra de processamento
formRoutes.post('/:id/rules', FormController.addRule);

// Atualizar regra
formRoutes.put('/:id/rules/:ruleId', FormController.updateRule);

// Deletar regra
formRoutes.delete('/:id/rules/:ruleId', FormController.deleteRule);

// Validar fórmula
formRoutes.post('/validate-formula', FormController.validateFormula);

// Duplicar formulário
formRoutes.post('/:id/duplicate', FormController.duplicate);

// Compartilhar formulário para outro projeto
formRoutes.post('/:id/share', FormController.share);

