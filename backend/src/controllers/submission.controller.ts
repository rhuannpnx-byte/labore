import { Request, Response } from 'express';
import { prisma } from '../lib/prisma';
import { FormulaEngine } from '../lib/formula-engine';
import { z } from 'zod';

const createSubmissionSchema = z.object({
  formId: z.string().uuid(),
  projectId: z.string().uuid().optional(), // Obra vinculada
  responses: z.array(z.object({
    fieldId: z.string().uuid(),
    value: z.string()
  }))
});

export class SubmissionController {
  // Listar submissões de um formulário
  static async listByForm(req: Request, res: Response) {
    try {
      const { formId } = req.params;
      const { projectId } = req.query; // Filtro opcional por projeto
      
      const where: any = { formId };
      if (projectId) {
        where.projectId = projectId as string;
      }
      
      const submissions = await prisma.formSubmission.findMany({
        where,
        include: {
          responses: {
            include: {
              field: true
            }
          },
          processingResults: {
            include: {
              rule: true
            }
          },
          project: {
            select: {
              id: true,
              name: true,
              code: true
            }
          },
          submittedBy: {
            select: {
              id: true,
              name: true,
              email: true
            }
          }
        },
        orderBy: { submittedAt: 'desc' }
      });
      
      res.json(submissions);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }
  
  // Buscar submissão por ID
  static async getById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      
      const submission = await prisma.formSubmission.findUnique({
        where: { id },
        include: {
          form: {
            select: {
              id: true,
              title: true,
              description: true
            }
          },
          responses: {
            include: {
              field: true
            },
            orderBy: {
              field: {
                order: 'asc'
              }
            }
          },
          processingResults: {
            include: {
              rule: true
            },
            orderBy: {
              rule: {
                order: 'asc'
              }
            }
          },
          project: {
            select: {
              id: true,
              name: true,
              code: true
            }
          },
          submittedBy: {
            select: {
              id: true,
              name: true,
              email: true,
              role: true
            }
          }
        }
      });
      
      if (!submission) {
        return res.status(404).json({ error: 'Submissão não encontrada' });
      }
      
      res.json(submission);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }
  
  // Criar nova submissão (preencher formulário)
  static async create(req: Request, res: Response) {
    try {
      const data = createSubmissionSchema.parse(req.body);
      
      // Busca o formulário com campos e regras
      const form = await prisma.form.findUnique({
        where: { id: data.formId },
        include: {
          fields: true,
          rules: true
        }
      });
      
      if (!form) {
        return res.status(404).json({ error: 'Formulário não encontrado' });
      }
      
      if (form.status !== 'ACTIVE') {
        return res.status(400).json({ error: 'Formulário não está ativo' });
      }
      
      // Valida campos obrigatórios
      const requiredFields = form.fields.filter((f: any) => f.required);
      const providedFieldIds = data.responses.map((r: any) => r.fieldId);
      
      const missingRequiredFields = requiredFields.filter((f: any) => !providedFieldIds.includes(f.id));
      if (missingRequiredFields.length > 0) {
        return res.status(400).json({ 
          error: 'Campos obrigatórios não preenchidos',
          missingFields: missingRequiredFields.map((f: any) => ({ id: f.id, label: f.label }))
        });
      }
      
      // Valida tipos de campos
      for (const response of data.responses) {
        const field = form.fields.find((f: any) => f.id === response.fieldId);
        if (!field) {
          return res.status(400).json({ error: `Campo ${response.fieldId} não encontrado` });
        }
        
        // Validação básica por tipo
        if (field.type === 'NUMBER') {
          if (isNaN(Number(response.value))) {
            return res.status(400).json({ 
              error: `Campo "${field.label}" deve ser um número` 
            });
          }
        }
        
        if (field.type === 'EMAIL') {
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          if (!emailRegex.test(response.value)) {
            return res.status(400).json({ 
              error: `Campo "${field.label}" deve ser um email válido` 
            });
          }
        }
      }
      
      // Cria a submissão
      const submission = await prisma.formSubmission.create({
        data: {
          formId: data.formId,
          projectId: data.projectId, // Obra vinculada
          submittedById: (req as any).user?.userId, // Usuário que submeteu (se autenticado)
          responses: {
            create: data.responses
          }
        },
        include: {
          responses: {
            include: {
              field: true
            }
          }
        }
      });
      
      // Processa as regras
      const processingResults = [];
      
      if (form.rules.length > 0) {
        try {
          // Monta o mapa de valores dos campos para as fórmulas
          const fieldValues: Record<string, string> = {};
          
          for (const response of submission.responses) {
            fieldValues[response.field.fieldKey] = response.value;
          }
          
          // Ordena regras por dependência (regras que referenciam outras vêm depois)
          const sortedRules = FormulaEngine.sortRulesByDependency(form.rules);
          
          // Mapa para armazenar resultados de regras já processadas
          const ruleResults: Record<string, string> = {};
          
          // Avalia cada regra na ordem correta
          for (const rule of sortedRules) {
            try {
              // Avalia a fórmula passando tanto campos quanto resultados de regras anteriores
              const result = FormulaEngine.evaluate(rule.formula, fieldValues, ruleResults);
              
              // Armazena o resultado para uso em regras seguintes
              ruleResults[rule.ruleKey] = result;
              
              // Salva no banco
              const processingResult = await prisma.processingResult.create({
                data: {
                  submissionId: submission.id,
                  ruleId: rule.id,
                  result
                },
                include: {
                  rule: true
                }
              });
              
              processingResults.push(processingResult);
            } catch (error: any) {
              console.error(`Erro ao processar regra ${(rule as any).name}:`, error);
              // Armazena erro como resultado para não quebrar dependências
              ruleResults[(rule as any).ruleKey] = '0';
            }
          }
        } catch (error: any) {
          console.error('Erro ao ordenar/processar regras:', error);
          // Se houver erro na ordenação (ex: ciclo), retorna erro mais claro
          if (error.message.includes('Dependência circular')) {
            return res.status(400).json({ 
              error: 'Erro nas regras do formulário: ' + error.message 
            });
          }
        }
      }
      
      // Retorna a submissão completa com resultados
      const completeSubmission = await prisma.formSubmission.findUnique({
        where: { id: submission.id },
        include: {
          responses: {
            include: {
              field: true
            }
          },
          processingResults: {
            include: {
              rule: true
            }
          },
          project: {
            select: {
              id: true,
              name: true,
              code: true
            }
          },
          submittedBy: {
            select: {
              id: true,
              name: true,
              email: true
            }
          }
        }
      });
      
      res.status(201).json(completeSubmission);
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      res.status(500).json({ error: error.message });
    }
  }
  
  // Deletar submissão
  static async delete(req: Request, res: Response) {
    try {
      const { id } = req.params;
      
      await prisma.formSubmission.delete({
        where: { id }
      });
      
      res.status(204).send();
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }
  
  // Obter estatísticas de um formulário
  static async getStats(req: Request, res: Response) {
    try {
      const { formId } = req.params;
      
      // Total de submissões
      const totalSubmissions = await prisma.formSubmission.count({
        where: { formId }
      });
      
      // Submissões nos últimos 7 dias
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      
      const recentSubmissions = await prisma.formSubmission.count({
        where: {
          formId,
          submittedAt: {
            gte: sevenDaysAgo
          }
        }
      });
      
      // Busca o formulário
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
      
      res.json({
        totalSubmissions,
        recentSubmissions,
        fieldsCount: form.fields.length,
        rulesCount: form.rules.length,
        formStatus: form.status
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }
}

