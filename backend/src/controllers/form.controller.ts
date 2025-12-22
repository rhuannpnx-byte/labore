import { Request, Response } from 'express';
import { prisma } from '../lib/prisma';
import { FormulaEngine } from '../lib/formula-engine';
import { z } from 'zod';

const createFormSchema = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
  status: z.enum(['DRAFT', 'ACTIVE', 'ARCHIVED']).optional(),
  projectId: z.string().uuid().optional(),
});

const createFieldSchema = z.object({
  label: z.string().min(1),
  fieldKey: z.string().min(1).regex(/^[a-zA-Z_][a-zA-Z0-9_]*$/, 'fieldKey deve começar com letra e conter apenas letras, números e underscore'),
  type: z.enum(['TEXT', 'NUMBER', 'DATE', 'SELECT', 'MULTI_SELECT', 'CHECKBOX', 'TEXTAREA', 'EMAIL', 'PHONE']),
  required: z.boolean().optional(),
  order: z.number().int().optional(),
  config: z.any().optional(),
});

const createRuleSchema = z.object({
  name: z.string().min(1),
  ruleKey: z.string().min(1).regex(/^[a-zA-Z_][a-zA-Z0-9_]*$/, 'ruleKey deve começar com letra e conter apenas letras, números e underscore'),
  formula: z.string().min(1),
  order: z.number().int().optional(),
});

export class FormController {
  // Listar todos os formulários
  static async list(req: Request, res: Response) {
    try {
      const { projectId } = req.query;
      
      // Filtro por projeto se fornecido
      const where: any = {};
      if (projectId) {
        where.projectId = projectId as string;
      }
      
      const forms = await prisma.form.findMany({
        where,
        include: {
          fields: {
            orderBy: { order: 'asc' }
          },
          rules: {
            orderBy: { order: 'asc' }
          },
          project: {
            select: {
              id: true,
              name: true,
              code: true
            }
          },
          createdBy: {
            select: {
              id: true,
              name: true,
              email: true
            }
          },
          _count: {
            select: { submissions: true }
          }
        },
        orderBy: { createdAt: 'desc' }
      });
      
      res.json(forms);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }
  
  // Buscar formulário por ID
  static async getById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      
      const form = await prisma.form.findUnique({
        where: { id },
        include: {
          fields: {
            orderBy: { order: 'asc' }
          },
          rules: {
            orderBy: { order: 'asc' }
          }
        }
      });
      
      if (!form) {
        return res.status(404).json({ error: 'Formulário não encontrado' });
      }
      
      res.json(form);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }
  
  // Criar novo formulário
  static async create(req: Request, res: Response) {
    try {
      const data = createFormSchema.parse(req.body);
      
      const form = await prisma.form.create({
        data: {
          ...data,
          status: data.status || 'DRAFT',
          createdById: (req as any).user?.userId // Usuário que criou
        },
        include: {
          fields: true,
          rules: true,
          project: {
            select: {
              id: true,
              name: true,
              code: true
            }
          },
          createdBy: {
            select: {
              id: true,
              name: true,
              email: true
            }
          }
        }
      });
      
      res.status(201).json(form);
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      res.status(500).json({ error: error.message });
    }
  }
  
  // Atualizar formulário
  static async update(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const data = createFormSchema.partial().parse(req.body);
      
      const form = await prisma.form.update({
        where: { id },
        data,
        include: {
          fields: true,
          rules: true
        }
      });
      
      res.json(form);
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      res.status(500).json({ error: error.message });
    }
  }
  
  // Deletar formulário
  static async delete(req: Request, res: Response) {
    try {
      const { id } = req.params;
      
      await prisma.form.delete({
        where: { id }
      });
      
      res.status(204).send();
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }
  
  // Adicionar campo ao formulário
  static async addField(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const data = createFieldSchema.parse(req.body);
      
      // Verifica se o formulário existe e busca campos existentes
      const form = await prisma.form.findUnique({ 
        where: { id },
        include: { fields: true }
      });
      if (!form) {
        return res.status(404).json({ error: 'Formulário não encontrado' });
      }
      
      // Calcula o order automaticamente se não foi fornecido
      const order = data.order !== undefined ? data.order : form.fields.length;
      
      // Cria o campo
      const field = await prisma.formField.create({
        data: {
          ...data,
          order,
          formId: id,
          required: data.required || false
        }
      });
      
      res.status(201).json(field);
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      res.status(500).json({ error: error.message });
    }
  }
  
  // Atualizar campo
  static async updateField(req: Request, res: Response) {
    try {
      const { fieldId } = req.params;
      const data = createFieldSchema.partial().parse(req.body);
      
      const field = await prisma.formField.update({
        where: { id: fieldId },
        data
      });
      
      res.json(field);
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      res.status(500).json({ error: error.message });
    }
  }
  
  // Deletar campo
  static async deleteField(req: Request, res: Response) {
    try {
      const { fieldId } = req.params;
      
      await prisma.formField.delete({
        where: { id: fieldId }
      });
      
      res.status(204).send();
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }
  
  // Reordenar campos
  static async reorderFields(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { fieldIds } = req.body;
      
      if (!Array.isArray(fieldIds)) {
        return res.status(400).json({ error: 'fieldIds deve ser um array' });
      }
      
      // Verifica se o formulário existe
      const form = await prisma.form.findUnique({ 
        where: { id },
        include: { fields: true }
      });
      
      if (!form) {
        return res.status(404).json({ error: 'Formulário não encontrado' });
      }
      
      // Verifica se todos os IDs fornecidos pertencem ao formulário
      const formFieldIds = form.fields.map(f => f.id);
      const invalidIds = fieldIds.filter((fid: string) => !formFieldIds.includes(fid));
      
      if (invalidIds.length > 0) {
        return res.status(400).json({ 
          error: `IDs de campos inválidos: ${invalidIds.join(', ')}` 
        });
      }
      
      // Atualiza a ordem de cada campo
      await Promise.all(
        fieldIds.map((fieldId: string, index: number) =>
          prisma.formField.update({
            where: { id: fieldId },
            data: { order: index }
          })
        )
      );
      
      res.json({ message: 'Ordem atualizada com sucesso' });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }
  
  // Adicionar regra de processamento
  static async addRule(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const data = createRuleSchema.parse(req.body);
      
      // Verifica se o formulário existe
      const form = await prisma.form.findUnique({ 
        where: { id },
        include: { 
          fields: true,
          rules: true 
        }
      });
      
      if (!form) {
        return res.status(404).json({ error: 'Formulário não encontrado' });
      }
      
      // Valida a fórmula
      try {
        FormulaEngine.validate(data.formula);
        
        // Verifica se todas as referências existem (campos ou regras)
        const references = FormulaEngine.extractFieldReferences(data.formula);
        const formFieldKeys = form.fields.map(f => f.fieldKey);
        const formRuleKeys = form.rules.map(r => r.ruleKey);
        const allAvailableKeys = [...formFieldKeys, ...formRuleKeys];
        
        const missingRefs = references.filter(ref => !allAvailableKeys.includes(ref));
        if (missingRefs.length > 0) {
          return res.status(400).json({ 
            error: `Campos ou regras não encontrados no formulário: ${missingRefs.join(', ')}. ` +
                   `Campos disponíveis: ${formFieldKeys.join(', ') || 'nenhum'}. ` +
                   `Regras disponíveis: ${formRuleKeys.join(', ') || 'nenhuma'}.`
          });
        }
        
        // Calcula o order automaticamente se não foi fornecido
        const order = data.order !== undefined ? data.order : form.rules.length;
        
        // Valida se não há dependência circular ao adicionar esta regra
        const testRules = [...form.rules, { 
          id: 'temp', 
          ruleKey: data.ruleKey, 
          formula: data.formula, 
          order: order 
        }];
        
        try {
          FormulaEngine.sortRulesByDependency(testRules as any);
        } catch (sortError: any) {
          return res.status(400).json({ 
            error: sortError.message 
          });
        }
      } catch (error: any) {
        return res.status(400).json({ error: error.message });
      }
      
      // Cria a regra
      const rule = await prisma.processingRule.create({
        data: {
          ...data,
          order: data.order !== undefined ? data.order : form.rules.length,
          formId: id
        }
      });
      
      res.status(201).json(rule);
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      res.status(500).json({ error: error.message });
    }
  }
  
  // Atualizar regra
  static async updateRule(req: Request, res: Response) {
    try {
      const { id, ruleId } = req.params;
      const data = createRuleSchema.partial().parse(req.body);
      
      // Se está atualizando a fórmula, valida
      if (data.formula) {
        const form = await prisma.form.findUnique({ 
          where: { id },
          include: { 
            fields: true,
            rules: true 
          }
        });
        
        if (!form) {
          return res.status(404).json({ error: 'Formulário não encontrado' });
        }
        
        try {
          FormulaEngine.validate(data.formula);
          
          // Verifica se todas as referências existem (campos ou regras)
          const references = FormulaEngine.extractFieldReferences(data.formula);
          const formFieldKeys = form.fields.map(f => f.fieldKey);
          const formRuleKeys = form.rules.filter(r => r.id !== ruleId).map(r => r.ruleKey);
          const allAvailableKeys = [...formFieldKeys, ...formRuleKeys];
          
          const missingRefs = references.filter(ref => !allAvailableKeys.includes(ref));
          if (missingRefs.length > 0) {
            return res.status(400).json({ 
              error: `Campos ou regras não encontrados no formulário: ${missingRefs.join(', ')}. ` +
                     `Campos disponíveis: ${formFieldKeys.join(', ') || 'nenhum'}. ` +
                     `Regras disponíveis: ${formRuleKeys.join(', ') || 'nenhuma'}.`
            });
          }
          
          // Valida dependências circulares com a regra atualizada
          const currentRule = form.rules.find(r => r.id === ruleId);
          if (currentRule) {
            const testRules = form.rules.map(r => 
              r.id === ruleId 
                ? { ...r, formula: data.formula, ruleKey: data.ruleKey || r.ruleKey }
                : r
            );
            
            try {
              FormulaEngine.sortRulesByDependency(testRules as any);
            } catch (sortError: any) {
              return res.status(400).json({ 
                error: sortError.message 
              });
            }
          }
        } catch (error: any) {
          return res.status(400).json({ error: error.message });
        }
      }
      
      const rule = await prisma.processingRule.update({
        where: { id: ruleId },
        data
      });
      
      res.json(rule);
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      res.status(500).json({ error: error.message });
    }
  }
  
  // Deletar regra
  static async deleteRule(req: Request, res: Response) {
    try {
      const { ruleId } = req.params;
      
      await prisma.processingRule.delete({
        where: { id: ruleId }
      });
      
      res.status(204).send();
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }
  
  // Validar fórmula
  static async validateFormula(req: Request, res: Response) {
    try {
      const { formula, formId } = req.body;
      
      if (!formula) {
        return res.status(400).json({ error: 'Fórmula é obrigatória' });
      }
      
      // Valida sintaxe
      FormulaEngine.validate(formula);
      
      // Se formId foi fornecido, valida se os campos e regras existem
      if (formId) {
        const form = await prisma.form.findUnique({ 
          where: { id: formId },
          include: { 
            fields: true,
            rules: true 
          }
        });
        
        if (!form) {
          return res.status(404).json({ error: 'Formulário não encontrado' });
        }
        
        const references = FormulaEngine.extractFieldReferences(formula);
        const formFieldKeys = form.fields.map(f => f.fieldKey);
        const formRuleKeys = form.rules.map(r => r.ruleKey);
        const allAvailableKeys = [...formFieldKeys, ...formRuleKeys];
        
        const missingRefs = references.filter(ref => !allAvailableKeys.includes(ref));
        
        if (missingRefs.length > 0) {
          // Identifica quais são campos e quais são regras
          const availableFields = references.filter(ref => formFieldKeys.includes(ref));
          const availableRules = references.filter(ref => formRuleKeys.includes(ref));
          
          return res.status(400).json({ 
            valid: false,
            error: `Referências não encontradas no formulário: ${missingRefs.join(', ')}`,
            references,
            availableFields,
            availableRules,
            missingRefs,
            hint: {
              campos: formFieldKeys,
              regras: formRuleKeys
            }
          });
        }
        
        // Identifica quais são campos e quais são regras
        const referencedFields = references.filter(ref => formFieldKeys.includes(ref));
        const referencedRules = references.filter(ref => formRuleKeys.includes(ref));
        
        res.json({ 
          valid: true, 
          message: 'Fórmula válida',
          references,
          referencedFields,
          referencedRules
        });
      } else {
        const references = FormulaEngine.extractFieldReferences(formula);
        res.json({ 
          valid: true, 
          message: 'Sintaxe válida',
          references
        });
      }
    } catch (error: any) {
      res.status(400).json({ 
        valid: false,
        error: error.message 
      });
    }
  }
}

