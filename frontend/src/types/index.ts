export type FormStatus = 'DRAFT' | 'ACTIVE' | 'ARCHIVED';

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
  submittedAt: string;
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
  order: number;
}

export interface CreateSubmissionData {
  formId: string;
  responses: {
    fieldId: string;
    value: string;
  }[];
}


