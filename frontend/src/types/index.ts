export type FormStatus = 'DRAFT' | 'ACTIVE' | 'ARCHIVED';
export type ProjectStatus = 'ACTIVE' | 'PAUSED' | 'COMPLETED' | 'CANCELLED';

export interface Project {
  id: string;
  name: string;
  code?: string;
  address?: string;
  description?: string;
  status: ProjectStatus;
  companyId: string;
  startDate?: string;
  endDate?: string;
  createdAt: string;
  updatedAt: string;
}

export type FieldType = 
  | 'TEXT'
  | 'NUMBER'
  | 'DATE'
  | 'SELECT'
  | 'MULTI_SELECT'
  | 'CHECKBOX'
  | 'TEXTAREA'
  | 'EMAIL'
  | 'PHONE';

export interface Form {
  id: string;
  title: string;
  description?: string;
  status: FormStatus;
  projectId?: string;
  createdAt: string;
  updatedAt: string;
  fields: FormField[];
  rules: ProcessingRule[];
  _count?: {
    submissions: number;
  };
}

export interface FormField {
  id: string;
  formId: string;
  label: string;
  fieldKey: string;
  key?: string;
  type: FieldType;
  required: boolean;
  order: number;
  config?: any;
  createdAt: string;
  updatedAt: string;
}

export interface ProcessingRule {
  id: string;
  formId: string;
  name: string;
  ruleKey: string;
  formula: string;
  order: number;
  createdAt: string;
  updatedAt: string;
}

export interface FormSubmission {
  id: string;
  formId: string;
  projectId?: string;
  submittedAt: string;
  submittedBy?: {
    id: string;
    name: string;
    email: string;
  };
  responses: FieldResponse[];
  processingResults: ProcessingResult[];
  form?: Form;
}

export interface FieldResponse {
  id: string;
  submissionId: string;
  fieldId: string;
  value: string;
  createdAt: string;
  field: FormField;
}

export interface ProcessingResult {
  id: string;
  submissionId: string;
  ruleId: string;
  result: string;
  calculatedAt: string;
  rule: ProcessingRule;
}

export interface CreateFormData {
  title: string;
  description?: string;
  status?: FormStatus;
  projectId?: string;
}

export interface CreateFieldData {
  label: string;
  fieldKey: string;
  type: FieldType;
  required?: boolean;
  order: number;
  config?: any;
}

export interface CreateRuleData {
  name: string;
  ruleKey: string;
  formula: string;
  order?: number;
}

export interface CreateSubmissionData {
  formId: string;
  responses: {
    fieldId: string;
    value: string;
  }[];
}

// ====================================
// TIPOS DE RELATÓRIOS
// ====================================

export type ReportStatus = 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
export type ElementType = 'TEXT' | 'CHART' | 'TABLE' | 'IMAGE' | 'SIGNATURE' | 'DIVIDER' | 'SPACER';
export type ChartType = 'bar' | 'line' | 'pie' | 'doughnut' | 'radar' | 'polarArea';

export interface Report {
  id: string;
  title: string;
  description?: string;
  status: ReportStatus;
  formId?: string;
  projectId?: string;
  createdById?: string;
  createdAt: string;
  updatedAt: string;
  form?: Form;
  project?: { id: string; name: string };
  createdBy?: { id: string; name: string; email: string };
  elements?: ReportElement[];
  _count?: {
    elements: number;
    generations: number;
  };
}

export interface ReportElement {
  id: string;
  reportId: string;
  type: ElementType;
  title?: string;
  config: any;
  style?: any;
  order: number;
  createdAt: string;
  updatedAt: string;
}

export interface ReportGeneration {
  id: string;
  reportId: string;
  submissionId?: string;
  projectId?: string;
  generatedAt: string;
  generatedBy?: string;
  data: any;
  filters?: any;
  report?: Report;
  project?: { id: string; name: string };
  user?: {
    id: string;
    name: string;
    email: string;
  };
}

export interface CreateElementData {
  type: ElementType;
  title?: string;
  config: any;
  style?: any;
  order: number;
}

// Configs específicos por tipo de elemento
export interface TextElementConfig {
  content: string;
  fontSize?: 'sm' | 'base' | 'lg' | 'xl' | '2xl' | number | string;
  fontWeight?: 'normal' | 'medium' | 'semibold' | 'bold';
  textAlign?: 'left' | 'center' | 'right' | 'justify';
  align?: 'left' | 'center' | 'right' | 'justify';
  color?: string;
  italic?: boolean;
  underline?: boolean;
  lineHeight?: string | number;
  letterSpacing?: string | number;
  padding?: string | number;
  uppercase?: boolean;
}

export interface ChartElementConfig {
  chartType: ChartType;
  dataSource: 'submission' | 'manual';
  title?: string;
  data?: any;
  datasets: {
    label: string;
    data: number[];
    backgroundColor?: string | string[];
    borderColor?: string | string[];
  }[];
  labels: string[];
  showLegend?: boolean;
  xAxisLabel?: string;
  yAxisLabel?: string;
  showGrid?: boolean;
  width?: string | number;
  height?: string | number;
  options?: any;
}

export interface TableElementConfig {
  columns: TableColumn[];
  rows: TableRow[];
  showHeader?: boolean;
  bordered?: boolean;
  striped?: boolean;
  headerBackground?: string;
  headerColor?: string;
  cellPadding?: string | number;
  showBorders?: boolean;
  headerFontSize?: string | number;
  headerHeight?: string | number;
  cellFontSize?: string | number;
  cellHeight?: string | number;
  alternateRows?: boolean;
}

export interface TableColumn {
  id: string;
  key?: string;
  label: string;
  width?: string;
  align?: 'left' | 'center' | 'right';
}

export interface TableRow {
  id: string;
  cells: TableCell[];
}

export interface TableCell {
  id?: string;
  columnId?: string;
  value: string;
  binding?: any;
  bold?: boolean;
  italic?: boolean;
  color?: string;
  backgroundColor?: string;
  style?: any;
}

export interface ImageElementConfig {
  url: string;
  alt?: string;
  width?: string | number;
  height?: string | number;
  objectFit?: 'contain' | 'cover' | 'fill' | 'none';
  alignment?: 'left' | 'center' | 'right';
}

export interface SignatureElementConfig {
  signatures: SignatureField[];
  layout?: 'vertical' | 'horizontal' | 'grid';
  showDate?: boolean;
  showRole?: boolean;
}

export interface SignatureField {
  id: string;
  label: string;
  name?: string;
  role?: string;
  date?: string;
  imageUrl?: string;
  description?: string;
  align?: 'left' | 'center' | 'right';
  responsibleName?: string;
  lineWidth?: string | number;
  lineColor?: string;
  showDate?: boolean;
}

export interface DividerElementConfig {
  style?: 'solid' | 'dashed' | 'dotted';
  thickness?: 'thin' | 'medium' | 'thick' | number;
  color?: string;
  spacing?: 'sm' | 'md' | 'lg';
}

export interface SpacerElementConfig {
  height: 'sm' | 'md' | 'lg' | 'xl' | number;
}


