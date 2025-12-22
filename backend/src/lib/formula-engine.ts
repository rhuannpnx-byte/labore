import { create, all } from 'mathjs';

const math = create(all);

// Configurar mathjs para suportar comparações e lógica
math.import({
  // Funções personalizadas para strings
  UPPER: (str: string) => String(str).toUpperCase(),
  LOWER: (str: string) => String(str).toLowerCase(),
  TRIM: (str: string) => String(str).trim(),
  LEN: (str: string) => String(str).length,
  CONCAT: (...args: any[]) => args.map(String).join(''),
  LEFT: (str: string, n: number) => String(str).substring(0, n),
  RIGHT: (str: string, n: number) => String(str).substring(String(str).length - n),
  MID: (str: string, start: number, len: number) => String(str).substring(start, start + len),
  
  // Funções de data
  NOW: () => new Date().getTime(),
  TODAY: () => new Date().setHours(0, 0, 0, 0),
  YEAR: (timestamp: number) => new Date(timestamp).getFullYear(),
  MONTH: (timestamp: number) => new Date(timestamp).getMonth() + 1,
  DAY: (timestamp: number) => new Date(timestamp).getDate(),
  DAYSDIFF: (date1: number, date2: number) => Math.floor((date2 - date1) / (1000 * 60 * 60 * 24)),
  
  // Funções condicionais avançadas
  IF: (condition: any, trueValue: any, falseValue: any) => condition ? trueValue : falseValue,
  IFS: (...args: any[]) => {
    // IFS(cond1, val1, cond2, val2, ..., defaultVal)
    for (let i = 0; i < args.length - 1; i += 2) {
      if (args[i]) return args[i + 1];
    }
    return args[args.length - 1]; // valor default
  },
  SWITCH: (expr: any, ...args: any[]) => {
    // SWITCH(expr, val1, result1, val2, result2, ..., default)
    for (let i = 0; i < args.length - 1; i += 2) {
      if (expr === args[i]) return args[i + 1];
    }
    return args[args.length - 1]; // valor default
  },
  
  // Funções lógicas
  AND: (...args: any[]) => args.every(Boolean),
  OR: (...args: any[]) => args.some(Boolean),
  NOT: (val: any) => !val,
  XOR: (a: any, b: any) => Boolean(a) !== Boolean(b),
  
  // Funções de verificação
  ISBLANK: (val: any) => val === null || val === undefined || val === '',
  ISNUMBER: (val: any) => typeof val === 'number' && !isNaN(val),
  ISTEXT: (val: any) => typeof val === 'string',
  ISERROR: (val: any) => val instanceof Error,
  
  // Funções matemáticas avançadas
  ROUND: (num: number, decimals: number = 0) => Math.round(num * Math.pow(10, decimals)) / Math.pow(10, decimals),
  ROUNDUP: (num: number, decimals: number = 0) => Math.ceil(num * Math.pow(10, decimals)) / Math.pow(10, decimals),
  ROUNDDOWN: (num: number, decimals: number = 0) => Math.floor(num * Math.pow(10, decimals)) / Math.pow(10, decimals),
  MOD: (num: number, divisor: number) => num % divisor,
  POWER: (base: number, exp: number) => Math.pow(base, exp),
  
  // Funções estatísticas
  AVERAGE: (...args: number[]) => args.reduce((a, b) => a + b, 0) / args.length,
  COUNT: (...args: any[]) => args.filter(v => v !== null && v !== undefined).length,
  COUNTA: (...args: any[]) => args.filter(v => v !== null && v !== undefined && v !== '').length,
  
  // Funções de limite
  CLAMP: (value: number, min: number, max: number) => Math.min(Math.max(value, min), max),
  
  // Funções de conversão
  TEXT: (val: any) => String(val),
  NUMBER: (val: any) => Number(val),
  BOOL: (val: any) => Boolean(val),
}, { override: true });

interface ProcessingRule {
  id: string;
  ruleKey: string;
  formula: string;
  order: number;
}

/**
 * Motor de processamento de fórmulas - VERSÃO AVANÇADA
 * 
 * Suporta:
 * - Operações matemáticas: +, -, *, /, ^, sqrt, abs, etc
 * - Operadores lógicos: ==, !=, <, >, <=, >=, AND, OR, NOT
 * - Condicionais: IF, IFS, SWITCH
 * - Funções de string: UPPER, LOWER, TRIM, CONCAT, LEN, LEFT, RIGHT, MID
 * - Funções de data: NOW, TODAY, YEAR, MONTH, DAY, DAYSDIFF
 * - Funções estatísticas: SUM, AVERAGE, MIN, MAX, COUNT
 * - Referências a campos e regras
 * 
 * Exemplos:
 * - Matemática: (campo1 * campo2 / 3.14) * 30
 * - Condicional: IF(idade >= 18, "Maior", "Menor")
 * - Lógica: IF(AND(valor > 100, status == "ativo"), valor * 0.9, valor)
 * - String: CONCAT(UPPER(nome), " - ", codigo)
 * - Data: DAYSDIFF(data_inicio, data_fim)
 */
export class FormulaEngine {
  /**
   * Avalia uma fórmula com os valores dos campos e resultados de regras
   * @param formula - Fórmula a ser avaliada
   * @param fieldValues - Mapa de valores dos campos { fieldKey: valor }
   * @param ruleResults - Mapa de resultados de regras já calculadas { ruleKey: resultado }
   * @returns Resultado calculado
   */
  static evaluate(
    formula: string, 
    fieldValues: Record<string, any>,
    ruleResults: Record<string, any> = {}
  ): string {
    try {
      // Substitui referências aos campos e regras pelos seus valores
      let processedFormula = formula;
      
      // Lista de palavras-chave reservadas (funções e constantes)
      const reservedKeywords = [
        // Matemática básica
        'sin', 'cos', 'tan', 'asin', 'acos', 'atan', 'atan2',
        'sinh', 'cosh', 'tanh', 'asinh', 'acosh', 'atanh',
        'log', 'log10', 'log2', 'ln', 'sqrt', 'cbrt', 'abs', 'exp', 
        'pi', 'e', 'tau', 'phi',
        'ceil', 'floor', 'round', 'sign',
        
        // Funções personalizadas - Strings
        'UPPER', 'LOWER', 'TRIM', 'LEN', 'CONCAT', 'LEFT', 'RIGHT', 'MID', 'TEXT',
        
        // Funções personalizadas - Datas
        'NOW', 'TODAY', 'YEAR', 'MONTH', 'DAY', 'DAYSDIFF',
        
        // Funções personalizadas - Condicionais
        'IF', 'IFS', 'SWITCH',
        
        // Funções personalizadas - Lógicas
        'AND', 'OR', 'NOT', 'XOR',
        
        // Funções personalizadas - Verificação
        'ISBLANK', 'ISNUMBER', 'ISTEXT', 'ISERROR',
        
        // Funções personalizadas - Matemática avançada
        'ROUND', 'ROUNDUP', 'ROUNDDOWN', 'MOD', 'POWER', 'CLAMP',
        
        // Funções personalizadas - Estatísticas
        'AVERAGE', 'COUNT', 'COUNTA', 'SUM', 'MIN', 'MAX',
        
        // Conversão
        'NUMBER', 'BOOL',
        
        // Outras constantes mathjs
        'true', 'false', 'null', 'undefined', 'Infinity', 'NaN'
      ];
      
      // Encontra todas as referências na fórmula
      // Suporta: campo1, CAMPO1, campo_1, campoTotal, regra1, etc.
      const references = formula.match(/\b[a-zA-Z_][a-zA-Z0-9_]*\b/g) || [];
      
      // Substitui cada referência pelo valor correspondente
      for (const ref of references) {
        // Ignora palavras-chave reservadas
        if (reservedKeywords.some(kw => kw.toLowerCase() === ref.toLowerCase())) {
          continue;
        }
        
        let value: any;
        let isRule = false;
        
        // Verifica se é uma referência a uma regra
        if (ruleResults[ref] !== undefined) {
          value = ruleResults[ref];
          isRule = true;
        } else if (fieldValues[ref] !== undefined) {
          // Caso contrário, procura nos campos
          value = fieldValues[ref];
        } else {
          // Se não encontrou, pode ser que seja uma palavra em uma string ou condição
          // Não lançamos erro aqui, deixamos o mathjs processar
          continue;
        }
        
        // Se valor estiver vazio/nulo, lança erro
        if (value === undefined || value === null || value === '') {
          throw new Error(`${isRule ? 'Regra' : 'Campo'} "${ref}" não encontrado ou sem valor`);
        }
        
        // Prepara o valor para substituição
        let replacementValue: string;
        
        // Verifica o tipo do valor
        if (typeof value === 'string') {
          // Strings devem ser envolvidas em aspas duplas, escapando aspas internas
          replacementValue = '"' + value.replace(/"/g, '\\"') + '"';
        } else if (typeof value === 'number') {
          replacementValue = value.toString();
        } else if (typeof value === 'boolean') {
          replacementValue = value.toString();
        } else if (value instanceof Date) {
          // Converte data para timestamp
          replacementValue = value.getTime().toString();
        } else {
          // Para outros tipos, tenta converter para string
          replacementValue = '"' + String(value).replace(/"/g, '\\"') + '"';
        }
        
        // Substitui usando regex para garantir que seja a palavra completa
        // Usa negative lookbehind e lookahead para não substituir dentro de strings
        const regex = new RegExp(`\\b${ref}\\b`, 'g');
        processedFormula = processedFormula.replace(regex, replacementValue);
      }
      
      // Avalia a expressão
      const result = math.evaluate(processedFormula);
      
      // Formata o resultado baseado no tipo
      if (typeof result === 'number') {
        // Se for inteiro, retorna sem casas decimais
        if (Number.isInteger(result)) {
          return result.toString();
        }
        // Se for float, retorna com 2 casas decimais
        return result.toFixed(2);
      }
      
      if (typeof result === 'boolean') {
        return result ? 'true' : 'false';
      }
      
      // Para outros tipos, converte para string
      return String(result);
    } catch (error: any) {
      throw new Error(`Erro ao avaliar fórmula: ${error.message}`);
    }
  }
  
  /**
   * Valida se uma fórmula é válida sintaticamente
   * @param formula - Fórmula a ser validada
   * @returns true se válida, lança erro se inválida
   */
  static validate(formula: string): boolean {
    try {
      // Tenta parsear a fórmula
      const node = math.parse(formula);
      
      // Se chegou aqui, a sintaxe é válida
      return true;
    } catch (error: any) {
      throw new Error(`Fórmula inválida: ${error.message}`);
    }
  }
  
  /**
   * Extrai todos os campos e regras referenciados em uma fórmula
   * @param formula - Fórmula a ser analisada
   * @returns Array de chaves referenciadas (campos ou regras)
   */
  static extractFieldReferences(formula: string): string[] {
    // Remove strings literais (entre aspas simples ou duplas) antes de extrair referências
    // Isso evita que conteúdo de strings seja interpretado como referências
    let formulaWithoutStrings = formula
      .replace(/"[^"]*"/g, '""')  // Remove conteúdo de strings com aspas duplas
      .replace(/'[^']*'/g, "''"); // Remove conteúdo de strings com aspas simples
    
    const references = formulaWithoutStrings.match(/\b[a-zA-Z_][a-zA-Z0-9_]*\b/g) || [];
    
    // Lista de palavras-chave reservadas (mesma do método evaluate)
    const reservedKeywords = [
      // Matemática básica
      'sin', 'cos', 'tan', 'asin', 'acos', 'atan', 'atan2',
      'sinh', 'cosh', 'tanh', 'asinh', 'acosh', 'atanh',
      'log', 'log10', 'log2', 'ln', 'sqrt', 'cbrt', 'abs', 'exp', 
      'pi', 'e', 'tau', 'phi',
      'ceil', 'floor', 'round', 'sign',
      'upper', 'lower', 'trim', 'len', 'concat', 'left', 'right', 'mid', 'text',
      'now', 'today', 'year', 'month', 'day', 'daysdiff',
      'if', 'ifs', 'switch',
      'and', 'or', 'not', 'xor',
      'isblank', 'isnumber', 'istext', 'iserror',
      'round', 'roundup', 'rounddown', 'mod', 'power', 'clamp',
      'average', 'count', 'counta', 'sum', 'min', 'max',
      'number', 'bool',
      'true', 'false', 'null', 'undefined', 'infinity', 'nan'
    ];
    
    const uniqueRefs = new Set(references.filter(ref => 
      !reservedKeywords.includes(ref.toLowerCase())
    ));
    return Array.from(uniqueRefs);
  }

  /**
   * Ordena regras por dependência (topological sort)
   * Regras que dependem de outras são executadas depois
   * @param rules - Array de regras a serem ordenadas
   * @returns Array de regras ordenado pela dependência
   */
  static sortRulesByDependency(rules: ProcessingRule[]): ProcessingRule[] {
    // Cria um mapa de ruleKey para regra
    const ruleMap = new Map<string, ProcessingRule>();
    rules.forEach(rule => ruleMap.set(rule.ruleKey, rule));

    // Cria grafo de dependências
    const dependencies = new Map<string, Set<string>>();
    const inDegree = new Map<string, number>();

    // Inicializa
    rules.forEach(rule => {
      dependencies.set(rule.ruleKey, new Set());
      inDegree.set(rule.ruleKey, 0);
    });

    // Constrói o grafo
    rules.forEach(rule => {
      const refs = this.extractFieldReferences(rule.formula);
      
      refs.forEach(ref => {
        // Verifica se a referência é para outra regra
        if (ruleMap.has(ref)) {
          // rule depende de ref
          dependencies.get(ref)!.add(rule.ruleKey);
          inDegree.set(rule.ruleKey, inDegree.get(rule.ruleKey)! + 1);
        }
      });
    });

    // Topological sort usando Kahn's algorithm
    const queue: string[] = [];
    const result: ProcessingRule[] = [];

    // Adiciona regras sem dependências na fila
    inDegree.forEach((degree, ruleKey) => {
      if (degree === 0) {
        queue.push(ruleKey);
      }
    });

    // Processa a fila
    while (queue.length > 0) {
      const current = queue.shift()!;
      result.push(ruleMap.get(current)!);

      // Remove aresta e adiciona novos nós sem dependências
      dependencies.get(current)!.forEach(dependent => {
        const newDegree = inDegree.get(dependent)! - 1;
        inDegree.set(dependent, newDegree);
        
        if (newDegree === 0) {
          queue.push(dependent);
        }
      });
    }

    // Detecta ciclo
    if (result.length !== rules.length) {
      const unprocessed = rules.filter(r => !result.includes(r))
        .map(r => r.ruleKey)
        .join(', ');
      throw new Error(
        `Dependência circular detectada nas regras: ${unprocessed}. ` +
        `Certifique-se de que as regras não referenciam umas às outras em ciclo.`
      );
    }

    return result;
  }

  /**
   * Valida se as referências em uma fórmula existem
   * @param formula - Fórmula a ser validada
   * @param availableFields - Campos disponíveis
   * @param availableRules - Regras disponíveis (opcional)
   * @returns { valid: boolean, missing: string[], type: 'field' | 'rule' }
   */
  static validateReferences(
    formula: string,
    availableFields: string[],
    availableRules: string[] = []
  ): { valid: boolean; missing: string[]; missingType: ('field' | 'rule')[] } {
    const refs = this.extractFieldReferences(formula);
    const allAvailable = new Set([...availableFields, ...availableRules]);
    const missing: string[] = [];
    const missingType: ('field' | 'rule')[] = [];

    refs.forEach(ref => {
      if (!allAvailable.has(ref)) {
        missing.push(ref);
        // Tenta determinar se deveria ser campo ou regra
        missingType.push('field');
      }
    });

    return {
      valid: missing.length === 0,
      missing,
      missingType
    };
  }
}

