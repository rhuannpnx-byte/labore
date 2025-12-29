import { Request, Response } from 'express';
import { prisma } from '../lib/prisma';

// Listar todos os relatórios (com filtros opcionais)
export const listReports = async (req: Request, res: Response) => {
  try {
    const { projectId, status } = req.query;
    const user = req.user!;

    const where: any = {};

    // Filtro por projeto
    if (projectId) {
      where.projectId = projectId as string;
    }

    // Filtro por status - converter 'ACTIVE' para 'PUBLISHED' (compatibilidade)
    if (status) {
      where.status = status === 'ACTIVE' ? 'PUBLISHED' : status;
    }

    // Se não for SUPERADMIN, filtrar por empresa
    if (user.role !== 'SUPERADMIN') {
      where.OR = [
        { createdById: user.userId }, // Relatórios criados pelo usuário
        { projectId: null }, // Relatórios globais
      ];

      // Se tiver projetos vinculados, incluir relatórios desses projetos
      if (projectId) {
        where.OR.push({
          project: {
            userProjects: {
              some: { userId: user.userId }
            }
          }
        });
      }
    }

    const reports = await prisma.report.findMany({
      where,
      include: {
        createdBy: {
          select: { id: true, name: true, email: true }
        },
        form: {
          select: { id: true, title: true }
        },
        project: {
          select: { id: true, name: true }
        },
        _count: {
          select: { elements: true, generations: true }
        }
      },
      orderBy: { updatedAt: 'desc' }
    });

    res.json(reports);
  } catch (error) {
    console.error('Error listing reports:', error);
    res.status(500).json({ error: 'Erro ao listar relatórios' });
  }
};

// Obter um relatório específico
export const getReport = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const user = req.user!;

    const report = await prisma.report.findUnique({
      where: { id },
      include: {
        createdBy: {
          select: { id: true, name: true, email: true }
        },
        form: {
          include: {
            fields: {
              orderBy: { order: 'asc' }
            },
            rules: {
              orderBy: { order: 'asc' }
            }
          }
        },
        project: {
          select: { id: true, name: true, companyId: true }
        },
        elements: {
          orderBy: { order: 'asc' }
        },
        _count: {
          select: { elements: true, generations: true }
        }
      }
    });

    if (!report) {
      return res.status(404).json({ error: 'Relatório não encontrado' });
    }

    // Verificar permissões
    if (user.role !== 'SUPERADMIN') {
      // Se tem projeto vinculado, verificar acesso ao projeto
      if (report.projectId) {
        const hasAccess = await prisma.userProject.findFirst({
          where: {
            userId: user.userId,
            projectId: report.projectId
          }
        });

        if (!hasAccess && report.createdById !== user.userId) {
          return res.status(403).json({ error: 'Acesso negado' });
        }
      } else if (report.createdById !== user.userId) {
        // Se não tem projeto e não é o criador, negar acesso
        return res.status(403).json({ error: 'Acesso negado' });
      }
    }

    res.json(report);
  } catch (error) {
    console.error('Error getting report:', error);
    res.status(500).json({ error: 'Erro ao buscar relatório' });
  }
};

// Criar novo relatório
export const createReport = async (req: Request, res: Response) => {
  try {
    const { title, description, formId, projectId, status } = req.body;
    const user = req.user!;

    // Validação básica
    if (!title) {
      return res.status(400).json({ error: 'Título é obrigatório' });
    }

    if (!formId) {
      return res.status(400).json({ error: 'Formulário é obrigatório' });
    }

    // Verificar permissões
    if (user.role !== 'SUPERADMIN' && user.role !== 'ENGENHEIRO' && user.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Apenas Engenheiros e Administradores podem criar relatórios' });
    }

    // Verificar se o formulário existe
    const form = await prisma.form.findUnique({
      where: { id: formId }
    });

    if (!form) {
      return res.status(404).json({ error: 'Formulário não encontrado' });
    }

    // Se especificou projeto, verificar acesso
    if (projectId) {
      const hasAccess = await prisma.userProject.findFirst({
        where: {
          userId: user.userId,
          projectId
        }
      });

      if (!hasAccess && user.role !== 'SUPERADMIN') {
        return res.status(403).json({ error: 'Você não tem acesso a este projeto' });
      }
    }

    // Converter 'ACTIVE' para 'PUBLISHED' (compatibilidade)
    const normalizedStatus = status === 'ACTIVE' ? 'PUBLISHED' : (status || 'DRAFT');

    const report = await prisma.report.create({
      data: {
        title,
        description,
        formId,
        projectId: projectId || null,
        status: normalizedStatus,
        createdById: user.userId
      },
      include: {
        createdBy: {
          select: { id: true, name: true, email: true }
        },
        form: {
          select: { id: true, title: true }
        },
        project: {
          select: { id: true, name: true }
        }
      }
    });

    res.status(201).json(report);
  } catch (error) {
    console.error('Error creating report:', error);
    res.status(500).json({ error: 'Erro ao criar relatório' });
  }
};

// Atualizar relatório
export const updateReport = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { title, description, formId, projectId, status } = req.body;
    const user = req.user!;

    // Buscar relatório
    const existingReport = await prisma.report.findUnique({
      where: { id }
    });

    if (!existingReport) {
      return res.status(404).json({ error: 'Relatório não encontrado' });
    }

    // Verificar permissões
    if (user.role !== 'SUPERADMIN' && existingReport.createdById !== user.userId) {
      return res.status(403).json({ error: 'Você não pode editar este relatório' });
    }

    // Se mudou o formId, verificar se existe
    if (formId && formId !== existingReport.formId) {
      const form = await prisma.form.findUnique({
        where: { id: formId }
      });

      if (!form) {
        return res.status(404).json({ error: 'Formulário não encontrado' });
      }
    }

    // Converter 'ACTIVE' para 'PUBLISHED' (compatibilidade)
    const normalizedStatus = status 
      ? (status === 'ACTIVE' ? 'PUBLISHED' : status)
      : existingReport.status;

    const report = await prisma.report.update({
      where: { id },
      data: {
        title: title || existingReport.title,
        description,
        formId: formId || existingReport.formId,
        projectId: projectId !== undefined ? projectId : existingReport.projectId,
        status: normalizedStatus
      },
      include: {
        createdBy: {
          select: { id: true, name: true, email: true }
        },
        form: {
          select: { id: true, title: true }
        },
        project: {
          select: { id: true, name: true }
        }
      }
    });

    res.json(report);
  } catch (error) {
    console.error('Error updating report:', error);
    res.status(500).json({ error: 'Erro ao atualizar relatório' });
  }
};

// Deletar relatório
export const deleteReport = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const user = req.user!;

    const report = await prisma.report.findUnique({
      where: { id }
    });

    if (!report) {
      return res.status(404).json({ error: 'Relatório não encontrado' });
    }

    // Verificar permissões
    if (user.role !== 'SUPERADMIN' && report.createdById !== user.userId) {
      return res.status(403).json({ error: 'Você não pode deletar este relatório' });
    }

    await prisma.report.delete({
      where: { id }
    });

    res.json({ message: 'Relatório deletado com sucesso' });
  } catch (error) {
    console.error('Error deleting report:', error);
    res.status(500).json({ error: 'Erro ao deletar relatório' });
  }
};

// ============ ELEMENTOS DO RELATÓRIO ============

// Adicionar elemento ao relatório
export const addElement = async (req: Request, res: Response) => {
  try {
    const { reportId } = req.params;
    const { type, config, style, order } = req.body;
    const user = req.user!;

    // Verificar se relatório existe e permissões
    const report = await prisma.report.findUnique({
      where: { id: reportId }
    });

    if (!report) {
      return res.status(404).json({ error: 'Relatório não encontrado' });
    }

    if (user.role !== 'SUPERADMIN' && report.createdById !== user.userId) {
      return res.status(403).json({ error: 'Você não pode editar este relatório' });
    }

    // Determinar a ordem (se não especificada, colocar no final)
    let elementOrder = order;
    if (elementOrder === undefined) {
      const lastElement = await prisma.reportElement.findFirst({
        where: { reportId },
        orderBy: { order: 'desc' }
      });
      elementOrder = lastElement ? lastElement.order + 1 : 0;
    }

    const element = await prisma.reportElement.create({
      data: {
        reportId,
        type,
        config,
        style: style || {},
        order: elementOrder
      }
    });

    res.status(201).json(element);
  } catch (error) {
    console.error('Error adding element:', error);
    res.status(500).json({ error: 'Erro ao adicionar elemento' });
  }
};

// Atualizar elemento
export const updateElement = async (req: Request, res: Response) => {
  try {
    const { elementId } = req.params;
    const { config, style, order } = req.body;
    const user = req.user!;

    // Buscar elemento e verificar permissões
    const element = await prisma.reportElement.findUnique({
      where: { id: elementId },
      include: { report: true }
    });

    if (!element) {
      return res.status(404).json({ error: 'Elemento não encontrado' });
    }

    if (user.role !== 'SUPERADMIN' && element.report.createdById !== user.userId) {
      return res.status(403).json({ error: 'Você não pode editar este elemento' });
    }

    const updatedElement = await prisma.reportElement.update({
      where: { id: elementId },
      data: {
        config: config !== undefined ? config : element.config,
        style: style !== undefined ? style : element.style,
        order: order !== undefined ? order : element.order
      }
    });

    res.json(updatedElement);
  } catch (error) {
    console.error('Error updating element:', error);
    res.status(500).json({ error: 'Erro ao atualizar elemento' });
  }
};

// Deletar elemento
export const deleteElement = async (req: Request, res: Response) => {
  try {
    const { elementId } = req.params;
    const user = req.user!;

    const element = await prisma.reportElement.findUnique({
      where: { id: elementId },
      include: { report: true }
    });

    if (!element) {
      return res.status(404).json({ error: 'Elemento não encontrado' });
    }

    if (user.role !== 'SUPERADMIN' && element.report.createdById !== user.userId) {
      return res.status(403).json({ error: 'Você não pode deletar este elemento' });
    }

    await prisma.reportElement.delete({
      where: { id: elementId }
    });

    res.json({ message: 'Elemento deletado com sucesso' });
  } catch (error) {
    console.error('Error deleting element:', error);
    res.status(500).json({ error: 'Erro ao deletar elemento' });
  }
};

// ============ GERAÇÃO DE RELATÓRIOS ============

// Gerar relatório com dados reais
export const generateReport = async (req: Request, res: Response) => {
  try {
    const { reportId } = req.params;
    const { submissionId, projectId } = req.body;
    const user = req.user!;

    // Buscar relatório com elementos
    const report = await prisma.report.findUnique({
      where: { id: reportId },
      include: {
        elements: {
          orderBy: { order: 'asc' }
        }
      }
    });

    if (!report) {
      return res.status(404).json({ error: 'Relatório não encontrado' });
    }

    // Buscar dados da submissão (se especificada)
    let submissionData: any = null;
    if (submissionId) {
      const submission = await prisma.formSubmission.findUnique({
        where: { id: submissionId },
        include: {
          form: true,
          submittedBy: {
            select: { id: true, name: true, email: true }
          },
          project: {
            select: { id: true, name: true, code: true, address: true }
          },
          responses: {
            include: {
              field: true
            }
          },
          processingResults: {
            include: {
              rule: true
            }
          }
        }
      });

      if (submission) {
        submissionData = submission;
      }
    }

    // Buscar dados do projeto (se especificado)
    let projectData: any = null;
    if (projectId) {
      projectData = await prisma.project.findUnique({
        where: { id: projectId },
        include: {
          company: {
            select: { id: true, name: true, cnpj: true, address: true, phone: true }
          }
        }
      });
    }

    // Processar elementos e vincular dados
    const processedElements = report.elements.map((element: any) => {
      const processedElement = {
        ...element,
        processedConfig: element.config
      };

      // Processar vinculação de dados baseado no tipo de elemento
      if (element.type === 'TABLE') {
        processedElement.processedConfig = processTableData(element.config, submissionData, projectData, user);
      } else if (element.type === 'CHART') {
        processedElement.processedConfig = processChartData(element.config, submissionData, projectData, user);
      } else if (element.type === 'TEXT') {
        processedElement.processedConfig = processTextData(element.config, submissionData, projectData, user);
      } else if (element.type === 'IMAGE') {
        processedElement.processedConfig = processImageData(element.config, submissionData, projectData, user);
      } else if (element.type === 'SIGNATURE') {
        processedElement.processedConfig = processSignatureData(element.config, submissionData, projectData, user);
      } else {
        // Para outros elementos (DIVIDER, SPACER, etc), processar qualquer texto que possa conter
        processedElement.processedConfig = processGenericElement(element.config, submissionData, projectData, user);
      }

      return processedElement;
    });

    // Criar snapshot da geração
    const generation = await prisma.reportGeneration.create({
      data: {
        reportId,
        submissionId: submissionId || null,
        projectId: projectId || null,
        generatedBy: user.userId,
        data: {
          report: {
            id: report.id,
            title: report.title,
            description: report.description
          },
          elements: processedElements,
          metadata: {
            generatedBy: user.name,
            generatedAt: new Date().toISOString(),
            submission: submissionData ? {
              id: submissionData.id,
              formTitle: submissionData.form.title,
              submittedBy: submissionData.submittedBy?.name,
              submittedAt: submissionData.submittedAt
            } : null,
            project: projectData ? {
              id: projectData.id,
              name: projectData.name,
              code: projectData.code,
              company: projectData.company?.name
            } : null
          }
        }
      },
      include: {
        report: true,
        submission: true,
        project: true,
        user: {
          select: { id: true, name: true, email: true }
        }
      }
    });

    res.status(201).json(generation);
  } catch (error) {
    console.error('Error generating report:', error);
    res.status(500).json({ error: 'Erro ao gerar relatório' });
  }
};

// Listar gerações de relatório
export const listGenerations = async (req: Request, res: Response) => {
  try {
    const { reportId } = req.params;
    const { projectId, submissionId } = req.query;
    const user = req.user!;

    const where: any = {};

    if (reportId) {
      where.reportId = reportId;
    }

    if (projectId) {
      where.projectId = projectId as string;
    }

    if (submissionId) {
      where.submissionId = submissionId as string;
    }

    const generations = await prisma.reportGeneration.findMany({
      where,
      include: {
        report: {
          select: { id: true, title: true }
        },
        user: {
          select: { id: true, name: true, email: true }
        },
        project: {
          select: { id: true, name: true }
        },
        submission: {
          select: { id: true }
        }
      },
      orderBy: { generatedAt: 'desc' }
    });

    res.json(generations);
  } catch (error) {
    console.error('Error listing generations:', error);
    res.status(500).json({ error: 'Erro ao listar gerações' });
  }
};

// Obter geração específica
export const getGeneration = async (req: Request, res: Response) => {
  try {
    const { generationId } = req.params;

    const generation = await prisma.reportGeneration.findUnique({
      where: { id: generationId },
      include: {
        report: true,
        user: {
          select: { id: true, name: true, email: true }
        },
        project: true,
        submission: {
          include: {
            form: true,
            submittedBy: {
              select: { id: true, name: true }
            }
          }
        }
      }
    });

    if (!generation) {
      return res.status(404).json({ error: 'Geração não encontrada' });
    }

    res.json(generation);
  } catch (error) {
    console.error('Error getting generation:', error);
    res.status(500).json({ error: 'Erro ao buscar geração' });
  }
};

// ============ FUNÇÕES AUXILIARES ============

function processTableData(config: any, submissionData: any, projectData?: any, user?: any): any {
  const processedConfig = { ...config };

  // Se a tabela tem dataSource configurado
  if (config.dataSource && config.dataSource.type === 'form_field' && submissionData) {
    const fieldKey = config.dataSource.fieldKey;
    const response = submissionData.responses.find((r: any) => r.field.fieldKey === fieldKey);
    
    if (response) {
      // Atualizar dados da tabela com valores da submissão
      processedConfig.data = response.value;
    }
  } else if (config.dataSource && config.dataSource.type === 'calculated' && submissionData) {
    const ruleKey = config.dataSource.ruleKey;
    const result = submissionData.processingResults.find((r: any) => r.rule.ruleKey === ruleKey);
    
    if (result) {
      processedConfig.data = result.result;
    }
  }

  // Processar células individuais com vinculação e texto dinâmico
  if (config.rows && Array.isArray(config.rows)) {
    processedConfig.rows = config.rows.map((row: any) => {
      if (row.cells && Array.isArray(row.cells)) {
        return {
          ...row,
          cells: row.cells.map((cell: any) => {
            let processedValue = cell.value;
            
            // Se tem binding, usar ele
            if (cell.binding && submissionData) {
              processedValue = resolveBinding(cell.binding, submissionData);
            }
            // Senão, processar texto com @{} e #{}
            else if (processedValue && typeof processedValue === 'string') {
              processedValue = processTextVariables(processedValue, submissionData, projectData, user);
            }
            
            return {
              ...cell,
              value: processedValue
            };
          })
        };
      }
      return row;
    });
  }

  return processedConfig;
}

function processImageData(config: any, submissionData: any, projectData?: any, user?: any): any {
  const processedConfig = { ...config };
  
  // Processar URL e alt text com variáveis dinâmicas
  if (config.url && typeof config.url === 'string') {
    processedConfig.url = processTextVariables(config.url, submissionData, projectData, user);
  }
  
  if (config.alt && typeof config.alt === 'string') {
    processedConfig.alt = processTextVariables(config.alt, submissionData, projectData, user);
  }
  
  return processedConfig;
}

function processSignatureData(config: any, submissionData: any, projectData?: any, user?: any): any {
  const processedConfig = { ...config };
  
  // Processar array de assinaturas
  if (config.signatures && Array.isArray(config.signatures)) {
    processedConfig.signatures = config.signatures.map((signature: any) => {
      const processedSignature = { ...signature };
      
      // Processar descrição
      if (signature.description && typeof signature.description === 'string') {
        processedSignature.description = processTextVariables(signature.description, submissionData, projectData, user);
      }
      
      // Processar nome do responsável
      if (signature.responsibleName && typeof signature.responsibleName === 'string') {
        processedSignature.responsibleName = processTextVariables(signature.responsibleName, submissionData, projectData, user);
      }
      
      return processedSignature;
    });
  }
  
  return processedConfig;
}

function processGenericElement(config: any, submissionData: any, projectData?: any, user?: any): any {
  const processedConfig = { ...config };
  
  // Processar recursivamente todas as propriedades de string
  const processObject = (obj: any): any => {
    if (typeof obj === 'string') {
      return processTextVariables(obj, submissionData, projectData, user);
    } else if (Array.isArray(obj)) {
      return obj.map(item => processObject(item));
    } else if (obj && typeof obj === 'object') {
      const processed: any = {};
      for (const key in obj) {
        processed[key] = processObject(obj[key]);
      }
      return processed;
    }
    return obj;
  };
  
  return processObject(processedConfig);
}

function processChartData(config: any, submissionData: any, projectData?: any, user?: any): any {
  const processedConfig = { ...config };

  // Processar título
  if (config.title && typeof config.title === 'string') {
    processedConfig.title = processTextVariables(config.title, submissionData, projectData, user);
  }

  // Processar xAxisLabel e yAxisLabel
  if (config.xAxisLabel && typeof config.xAxisLabel === 'string') {
    processedConfig.xAxisLabel = processTextVariables(config.xAxisLabel, submissionData, projectData, user);
  }
  if (config.yAxisLabel && typeof config.yAxisLabel === 'string') {
    processedConfig.yAxisLabel = processTextVariables(config.yAxisLabel, submissionData, projectData, user);
  }

  // Processar config.data.labels e config.data.datasets
  if (config.data) {
    processedConfig.data = { ...config.data };
    
    // Processar labels (eixo X)
    if (config.data.labels && Array.isArray(config.data.labels)) {
      processedConfig.data.labels = config.data.labels.map((label: any) => {
        if (typeof label === 'string') {
          return processTextVariables(label, submissionData, projectData, user);
        }
        return label;
      });
    }

    // Processar datasets
    if (config.data.datasets && Array.isArray(config.data.datasets)) {
      processedConfig.data.datasets = config.data.datasets.map((dataset: any) => {
        const processedDataset = { ...dataset };
        
        // Processar label do dataset
        if (dataset.label && typeof dataset.label === 'string') {
          processedDataset.label = processTextVariables(dataset.label, submissionData, projectData, user);
        }
        
        // Processar valores dos dados
        if (dataset.data && Array.isArray(dataset.data)) {
          processedDataset.data = dataset.data.map((value: any) => {
            if (typeof value === 'string') {
              const processed = processTextVariables(value, submissionData, projectData, user);
              // Tentar converter para número se possível
              const num = parseFloat(processed);
              return isNaN(num) ? processed : num;
            }
            return value;
          });
        }
        
        return processedDataset;
      });
    }
  }

  // Processar dataSource do gráfico (compatibilidade com versão antiga)
  if (config.dataSource && submissionData) {
    if (config.dataSource.type === 'form_field') {
      const fieldKey = config.dataSource.fieldKey;
      const response = submissionData.responses.find((r: any) => r.field.fieldKey === fieldKey);
      
      if (response) {
        processedConfig.data = parseChartData(response.value);
      }
    } else if (config.dataSource.type === 'calculated') {
      const ruleKey = config.dataSource.ruleKey;
      const result = submissionData.processingResults.find((r: any) => r.rule.ruleKey === ruleKey);
      
      if (result) {
        processedConfig.data = parseChartData(result.result);
      }
    }
  }

  return processedConfig;
}

// Função auxiliar para processar variáveis dinâmicas em qualquer texto
function processTextVariables(text: string, submissionData: any, projectData?: any, user?: any): string {
  let content = text;

  // Função auxiliar para substituir múltiplos formatos
  const replaceVariable = (varName: string, value: string) => {
    const escapedName = varName.replace(/\./g, '\\.');
    content = content.replace(new RegExp(`\\{\\{${escapedName}\\}\\}`, 'g'), value);
    content = content.replace(new RegExp(`@\\{${escapedName}\\}`, 'g'), value);
    content = content.replace(new RegExp(`#\\{${escapedName}\\}`, 'g'), value);
  };

  // Variáveis de projeto (@ ou {{)
  if (projectData) {
    replaceVariable('project.name', projectData.name || '');
    replaceVariable('project.code', projectData.code || '');
    replaceVariable('project.address', projectData.address || '');
    replaceVariable('company.name', projectData.company?.name || '');
    replaceVariable('company.cnpj', projectData.company?.cnpj || '');
  }

  // Variáveis de submissão
  if (submissionData) {
    replaceVariable('form.title', submissionData.form?.title || '');
    replaceVariable('submittedBy.name', submissionData.submittedBy?.name || '');
    replaceVariable('submittedBy.email', submissionData.submittedBy?.email || '');
    replaceVariable('submittedAt', submissionData.submittedAt ? new Date(submissionData.submittedAt).toLocaleString('pt-BR') : '');

    // Campos do formulário - formato: #field.fieldKey ou {{field.fieldKey}}
    if (submissionData.responses) {
      submissionData.responses.forEach((response: any) => {
        replaceVariable(`field.${response.field.fieldKey}`, response.value || '');
      });
    }

    // Resultados calculados - formato: #calc.ruleKey ou {{calc.ruleKey}}
    if (submissionData.processingResults) {
      submissionData.processingResults.forEach((result: any) => {
        replaceVariable(`calc.${result.rule.ruleKey}`, result.result || '');
      });
    }
  }

  // Variáveis do sistema (@ ou {{)
  if (user) {
    replaceVariable('currentUser.name', user.name || '');
  }
  replaceVariable('currentDate', new Date().toLocaleDateString('pt-BR'));
  replaceVariable('currentDateTime', new Date().toLocaleString('pt-BR'));

  return content;
}

function processTextData(config: any, submissionData: any, projectData: any, user: any): any {
  const processedConfig = { ...config };
  let content = config.content || '';

  // Usar a função auxiliar para processar variáveis
  content = processTextVariables(content, submissionData, projectData, user);

  processedConfig.content = content;
  return processedConfig;
}

function resolveBinding(binding: any, submissionData: any): string {
  if (binding.type === 'form_field') {
    const response = submissionData.responses.find((r: any) => r.field.fieldKey === binding.fieldKey);
    return response ? response.value : '';
  } else if (binding.type === 'calculated') {
    const result = submissionData.processingResults.find((r: any) => r.rule.ruleKey === binding.ruleKey);
    return result ? result.result : '';
  } else if (binding.type === 'project_info') {
    return submissionData.project?.[binding.field] || '';
  } else if (binding.type === 'user_info') {
    return submissionData.submittedBy?.[binding.field] || '';
  }
  return '';
}

function parseChartData(value: string): any {
  // Tentar parsear valor como JSON
  try {
    return JSON.parse(value);
  } catch {
    // Se não for JSON, retornar valor como está
    return value;
  }
}

