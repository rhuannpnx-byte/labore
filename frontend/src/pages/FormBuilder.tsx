import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Save, Plus, Trash2, ArrowLeft, Calculator, AlertCircle, GripVertical, Settings, Hash, BookOpen, X } from 'lucide-react';
import { formsApi } from '../services/api';
import { useProjectContext } from '../services/project-context';
import { authService } from '../services/auth';
import type { Form, FormField, ProcessingRule, FieldType } from '../types';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { formatApiError } from '../utils/errorHandler';

export default function FormBuilder() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditing = !!id;
  const { selectedProject } = useProjectContext();
  const user = authService.getUser();
  
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState<'DRAFT' | 'ACTIVE' | 'ARCHIVED'>('DRAFT');
  const [fields, setFields] = useState<FormField[]>([]);
  const [rules, setRules] = useState<ProcessingRule[]>([]);
  const [loading, setLoading] = useState(isEditing);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [draggedFieldIndex, setDraggedFieldIndex] = useState<number | null>(null);
  
  // Estados para campo (criar ou editar)
  const [showFieldForm, setShowFieldForm] = useState(false);
  const [editingFieldId, setEditingFieldId] = useState<string | null>(null);
  const [fieldLabel, setFieldLabel] = useState('');
  const [fieldKey, setFieldKey] = useState('');
  const [fieldType, setFieldType] = useState<FieldType>('TEXT');
  const [fieldRequired, setFieldRequired] = useState(false);
  
  // Estados para nova regra
  const [showRuleForm, setShowRuleForm] = useState(false);
  const [ruleName, setRuleName] = useState('');
  const [ruleKey, setRuleKey] = useState('');
  const [ruleFormula, setRuleFormula] = useState('');
  const [showFormulaHelper, setShowFormulaHelper] = useState(false);
  
  useEffect(() => {
    if (isEditing) {
      loadForm();
    }
  }, [id]);
  
  const loadForm = async () => {
    try {
      const response = await formsApi.getById(id!);
      const form = response.data;
      setTitle(form.title);
      setDescription(form.description || '');
      setStatus(form.status);
      setFields(form.fields);
      setRules(form.rules);
    } catch (err: any) {
      console.error('Erro ao carregar formulário:', err);
      setError(formatApiError(err));
    } finally {
      setLoading(false);
    }
  };
  
  const handleSaveForm = async () => {
    if (!title.trim()) {
      alert('Digite um título para o formulário');
      return;
    }
    
    if (!isEditing && (user?.role === 'ENGENHEIRO' || user?.role === 'LABORATORISTA')) {
      if (!selectedProject) {
        alert('Selecione uma obra antes de criar um formulário');
        return;
      }
    }
    
    try {
      setSaving(true);
      if (isEditing) {
        await formsApi.update(id!, { title, description, status });
      } else {
        const response = await formsApi.create({ 
          title, 
          description, 
          status,
          projectId: selectedProject?.id
        });
        navigate(`/forms/${response.data.id}/edit`);
      }
    } catch (err: any) {
      console.error('Erro ao salvar formulário:', err);
      alert(formatApiError(err));
    } finally {
      setSaving(false);
    }
  };
  
  const handleAddField = async () => {
    if (!fieldLabel.trim() || !fieldKey.trim()) {
      alert('Preencha o nome e a chave do campo');
      return;
    }
    
    if (!isEditing) {
      alert('Salve o formulário primeiro antes de adicionar campos');
      return;
    }
    
    try {
      await formsApi.addField(id!, {
        label: fieldLabel,
        fieldKey: fieldKey, // Corrigido: era 'key', agora é 'fieldKey'
        type: fieldType,
        required: fieldRequired,
        order: fields.length // Adiciona ordem automaticamente
      });
      
      setFieldLabel('');
      setFieldKey('');
      setFieldType('TEXT');
      setFieldRequired(false);
      setShowFieldForm(false);
      loadForm();
    } catch (err: any) {
      console.error('Erro ao adicionar campo:', err);
      alert(formatApiError(err));
    }
  };
  
  const handleDeleteField = async (fieldId: string) => {
    if (!confirm('Deseja remover este campo?')) return;
    
    try {
      await formsApi.removeField(id!, fieldId);
      loadForm();
    } catch (err: any) {
      console.error('Erro ao remover campo:', err);
      alert(formatApiError(err));
    }
  };
  
  const handleEditField = (field: FormField) => {
    setEditingFieldId(field.id);
    setFieldLabel(field.label);
    setFieldKey(field.fieldKey);
    setFieldType(field.type);
    setFieldRequired(field.required);
    setShowFieldForm(true);
  };
  
  const handleSaveField = async () => {
    if (!fieldLabel.trim()) {
      alert('Digite um rótulo para o campo');
      return;
    }
    
    if (!fieldKey.trim()) {
      alert('Digite uma chave para o campo');
      return;
    }
    
    try {
      if (editingFieldId) {
        // Atualizar campo existente
        await formsApi.updateField(id!, editingFieldId, {
          label: fieldLabel,
          fieldKey: fieldKey,
          type: fieldType,
          required: fieldRequired,
        });
      } else {
        // Criar novo campo
        await formsApi.addField(id!, {
          label: fieldLabel,
          fieldKey: fieldKey,
          type: fieldType,
          required: fieldRequired,
          order: fields.length
        });
      }
      
      handleCancelField();
      loadForm();
    } catch (err: any) {
      console.error('Erro ao salvar campo:', err);
      alert(formatApiError(err));
    }
  };
  
  const handleCancelField = () => {
    setShowFieldForm(false);
    setEditingFieldId(null);
    setFieldLabel('');
    setFieldKey('');
    setFieldType('TEXT');
    setFieldRequired(false);
  };
  
  const handleAddRule = async () => {
    if (!ruleName.trim() || !ruleKey.trim() || !ruleFormula.trim()) {
      alert('Preencha todos os campos da regra');
      return;
    }
    
    if (!isEditing) {
      alert('Salve o formulário primeiro antes de adicionar regras');
      return;
    }
    
    try {
      await formsApi.addRule(id!, {
        name: ruleName,
        ruleKey: ruleKey, // Corrigido: era 'key', agora é 'ruleKey'
        formula: ruleFormula,
      });
      
      setRuleName('');
      setRuleKey('');
      setRuleFormula('');
      setShowRuleForm(false);
      loadForm();
    } catch (err: any) {
      console.error('Erro ao adicionar regra:', err);
      alert(formatApiError(err));
    }
  };
  
  const handleDeleteRule = async (ruleId: string) => {
    if (!confirm('Deseja remover esta regra?')) return;
    
    try {
      await formsApi.removeRule(id!, ruleId);
      loadForm();
    } catch (err: any) {
      console.error('Erro ao remover regra:', err);
      alert(formatApiError(err));
    }
  };
  
  // Drag and Drop handlers
  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedFieldIndex(index);
    e.dataTransfer.effectAllowed = 'move';
    e.currentTarget.classList.add('opacity-50');
  };
  
  const handleDragEnd = (e: React.DragEvent) => {
    e.currentTarget.classList.remove('opacity-50');
    setDraggedFieldIndex(null);
  };
  
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };
  
  const handleDrop = async (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault();
    
    if (draggedFieldIndex === null || draggedFieldIndex === dropIndex) return;
    
    // Reordena os campos localmente
    const newFields = [...fields];
    const [draggedField] = newFields.splice(draggedFieldIndex, 1);
    newFields.splice(dropIndex, 0, draggedField);
    
    setFields(newFields);
    setDraggedFieldIndex(null);
    
    // Atualiza a ordem no servidor
    try {
      await formsApi.reorderFields(id!, newFields.map(f => f.id));
    } catch (err: any) {
      alert('Erro ao reordenar campos. Recarregando...');
      loadForm();
    }
  };
  
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-gray-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-3" />
          <p className="text-sm text-gray-600">Carregando formulário...</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2 min-w-0">
              <Link to="/forms">
                <Button variant="ghost" size="sm" icon={<ArrowLeft size={16} />} className="flex-shrink-0" />
              </Link>
              <h1 className="text-base sm:text-lg font-bold text-gray-900 truncate">
                {isEditing ? 'Editar Formulário' : 'Novo Formulário'}
              </h1>
            </div>
            <Button
              onClick={handleSaveForm}
              variant="primary"
              size="sm"
              isLoading={saving}
              icon={<Save size={16} />}
              className="flex-shrink-0"
            >
              <span className="hidden sm:inline">Salvar</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
            <div className="flex items-start gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          </div>
        )}

        {/* Form Info */}
        <Card className="mb-4">
          <CardHeader>
            <CardTitle className="text-base sm:text-lg">Informações do Formulário</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input
              label="Título"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ex: Controle de Concreto"
              required
            />
            
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Descrição
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Descreva o propósito deste formulário..."
                className="input min-h-[80px]"
              />
            </div>
            
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as any)}
                className="input"
              >
                <option value="DRAFT">Rascunho</option>
                <option value="ACTIVE">Ativo</option>
                <option value="ARCHIVED">Arquivado</option>
              </select>
            </div>
          </CardContent>
        </Card>

        {/* Fields Section */}
        {isEditing && (
          <>
            <Card className="mb-4">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base sm:text-lg">Campos do Formulário</CardTitle>
                  <Button
                    onClick={() => setShowFieldForm(!showFieldForm)}
                    variant="outline"
                    size="sm"
                    icon={<Plus size={16} />}
                  >
                    <span className="hidden sm:inline">Novo Campo</span>
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {showFieldForm && (
                  <div className="mb-4 p-4 bg-gray-50 rounded-lg border border-gray-200 space-y-3">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-semibold text-gray-900">
                        {editingFieldId ? 'Editando Campo' : 'Novo Campo'}
                      </h4>
                      <button
                        onClick={handleCancelField}
                        className="p-1 text-gray-500 hover:text-gray-700"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                    
                    <Input
                      label="Nome do Campo"
                      value={fieldLabel}
                      onChange={(e) => setFieldLabel(e.target.value)}
                      placeholder="Ex: Resistência do Concreto"
                      size={"sm" as any}
                    />
                    
                    <div>
                      <Input
                        label="Chave (identificador único)"
                        value={fieldKey}
                        onChange={(e) => setFieldKey(e.target.value)}
                        placeholder="Ex: resistencia_concreto"
                        size={"sm" as any}
                      />
                      {editingFieldId && (
                        <div className="mt-2 p-2 bg-yellow-50 border border-yellow-200 rounded flex items-start gap-2">
                          <AlertCircle className="w-4 h-4 text-yellow-600 flex-shrink-0 mt-0.5" />
                          <p className="text-xs text-yellow-800">
                            <strong>Atenção:</strong> Alterar a chave pode afetar fórmulas e dados existentes que a referenciam.
                          </p>
                        </div>
                      )}
                    </div>
                    
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Tipo
                      </label>
                      <select
                        value={fieldType}
                        onChange={(e) => setFieldType(e.target.value as FieldType)}
                        className="input"
                      >
                        <option value="TEXT">Texto</option>
                        <option value="NUMBER">Número</option>
                        <option value="DATE">Data</option>
                        <option value="TEXTAREA">Área de Texto</option>
                        <option value="SELECT">Seleção</option>
                        <option value="CHECKBOX">Checkbox</option>
                      </select>
                    </div>
                    
                    <label className="flex items-center gap-2 text-sm">
                      <input
                        type="checkbox"
                        checked={fieldRequired}
                        onChange={(e) => setFieldRequired(e.target.checked)}
                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                      />
                      <span className="text-gray-700 font-medium">Campo obrigatório</span>
                    </label>
                    
                    <div className="flex gap-2 pt-2">
                      <Button onClick={handleSaveField} variant="primary" size="sm" fullWidth>
                        {editingFieldId ? 'Salvar Alterações' : 'Adicionar Campo'}
                      </Button>
                      <Button onClick={handleCancelField} variant="ghost" size="sm">
                        Cancelar
                      </Button>
                    </div>
                  </div>
                )}

                {fields.length === 0 ? (
                  <div className="text-center py-8 text-gray-500 text-sm">
                    Nenhum campo adicionado. Clique em "Novo Campo" para começar.
                  </div>
                ) : (
                  <div className="space-y-2">
                    <div className="text-xs text-gray-500 mb-3 flex items-center gap-2 px-2">
                      <GripVertical className="w-4 h-4" />
                      <span>Arraste os campos para reordenar</span>
                    </div>
                    {fields.map((field, index) => (
                      <div
                        key={field.id}
                        draggable
                        onDragStart={(e) => handleDragStart(e, index)}
                        onDragEnd={handleDragEnd}
                        onDragOver={handleDragOver}
                        onDrop={(e) => handleDrop(e, index)}
                        className="flex items-start gap-3 p-4 bg-white border-2 border-gray-200 rounded-lg hover:border-blue-300 transition-all cursor-move group"
                      >
                        <GripVertical className="w-5 h-5 text-gray-400 group-hover:text-blue-600 flex-shrink-0 mt-0.5 cursor-grab active:cursor-grabbing" />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-3 mb-2">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 flex-wrap mb-2">
                                <span className="font-semibold text-gray-900">{field.label}</span>
                                <Badge variant="secondary" size="sm">{field.type}</Badge>
                                {field.required && <Badge variant="danger" size="sm">Obrigatório</Badge>}
                              </div>
                              <div className="flex items-center gap-2">
                                <div className="flex items-center gap-1.5 px-2.5 py-1 bg-blue-50 rounded-md border border-blue-200">
                                  <Hash className="w-3.5 h-3.5 text-blue-600" />
                                  <span className="text-sm font-mono font-medium text-blue-700">{field.fieldKey}</span>
                                </div>
                                <span className="text-xs text-gray-500">← Use esta chave nas fórmulas</span>
                              </div>
                            </div>
                            <div className="flex gap-1 flex-shrink-0">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleEditField(field);
                                }}
                                className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                title="Editar campo"
                              >
                                <Settings className="w-4 h-4" />
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDeleteField(field.id);
                                }}
                                className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                title="Excluir campo"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Rules Section */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base sm:text-lg">Regras de Processamento</CardTitle>
                  <Button
                    onClick={() => setShowRuleForm(!showRuleForm)}
                    variant="outline"
                    size="sm"
                    icon={<Calculator size={16} />}
                  >
                    <span className="hidden sm:inline">Nova Regra</span>
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {showRuleForm && (
                  <div className="mb-4 p-4 bg-gray-50 rounded-lg border border-gray-200 space-y-3">
                    <Input
                      label="Nome da Regra"
                      value={ruleName}
                      onChange={(e) => setRuleName(e.target.value)}
                      placeholder="Ex: Cálculo de FCK"
                      size={"sm" as any}
                    />
                    
                    <Input
                      label="Chave"
                      value={ruleKey}
                      onChange={(e) => setRuleKey(e.target.value)}
                      placeholder="Ex: calculo_fck"
                      size={"sm" as any}
                    />
                    
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <label className="block text-sm font-semibold text-gray-700">
                          Fórmula
                        </label>
                        <button
                          onClick={() => setShowFormulaHelper(!showFormulaHelper)}
                          className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-700 font-medium"
                        >
                          <BookOpen className="w-3.5 h-3.5" />
                          {showFormulaHelper ? 'Ocultar' : 'Ver'} Funções
                        </button>
                      </div>
                      <textarea
                        value={ruleFormula}
                        onChange={(e) => setRuleFormula(e.target.value)}
                        placeholder="Ex: IF(campo1 > 100, campo1 * 0.9, campo1)"
                        className="input min-h-[80px] font-mono text-sm"
                      />
                      
                      {showFormulaHelper && (
                        <div className="mt-3 p-3 bg-white border border-gray-200 rounded-lg max-h-96 overflow-y-auto">
                          <div className="flex items-center justify-between mb-3">
                            <h4 className="text-sm font-bold text-gray-900">Funções Disponíveis</h4>
                            <button
                              onClick={() => setShowFormulaHelper(false)}
                              className="text-gray-400 hover:text-gray-600"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                          
                          <div className="space-y-4 text-xs">
                            {/* Condicionais */}
                            <div>
                              <h5 className="font-bold text-purple-700 mb-2">🧠 Condicionais</h5>
                              <div className="space-y-1.5 pl-2">
                                <div>
                                  <code className="bg-purple-50 px-1.5 py-0.5 rounded text-purple-700">IF(condição, se_verdadeiro, se_falso)</code>
                                  <p className="text-gray-600 mt-0.5">Ex: IF(idade &gt;= 18, "Adulto", "Menor")</p>
                                </div>
                                <div>
                                  <code className="bg-purple-50 px-1.5 py-0.5 rounded text-purple-700">IFS(cond1, val1, cond2, val2, padrão)</code>
                                  <p className="text-gray-600 mt-0.5">Ex: IFS(nota &gt;= 9, "A", nota &gt;= 7, "B", "C")</p>
                                </div>
                                <div>
                                  <code className="bg-purple-50 px-1.5 py-0.5 rounded text-purple-700">SWITCH(expr, val1, res1, val2, res2, padrão)</code>
                                  <p className="text-gray-600 mt-0.5">Ex: SWITCH(tipo, "A", 10, "B", 20, 0)</p>
                                </div>
                              </div>
                            </div>

                            {/* Lógica */}
                            <div>
                              <h5 className="font-bold text-blue-700 mb-2">🔵 Operadores Lógicos</h5>
                              <div className="space-y-1.5 pl-2">
                                <div>
                                  <code className="bg-blue-50 px-1.5 py-0.5 rounded text-blue-700">AND(a, b, ...)</code>
                                  <span className="text-gray-600 ml-2">E lógico</span>
                                </div>
                                <div>
                                  <code className="bg-blue-50 px-1.5 py-0.5 rounded text-blue-700">OR(a, b, ...)</code>
                                  <span className="text-gray-600 ml-2">OU lógico</span>
                                </div>
                                <div>
                                  <code className="bg-blue-50 px-1.5 py-0.5 rounded text-blue-700">NOT(a)</code>
                                  <span className="text-gray-600 ml-2">NÃO lógico</span>
                                </div>
                                <div className="text-gray-600 mt-1">
                                  Comparação: ==, !=, &lt;, &gt;, &lt;=, &gt;=
                                </div>
                              </div>
                            </div>

                            {/* Matemática */}
                            <div>
                              <h5 className="font-bold text-green-700 mb-2">🔢 Matemática</h5>
                              <div className="space-y-1.5 pl-2">
                                <div>
                                  <code className="bg-green-50 px-1.5 py-0.5 rounded text-green-700">ROUND(num, decimais)</code>
                                  <span className="text-gray-600 ml-2">Arredondar</span>
                                </div>
                                <div>
                                  <code className="bg-green-50 px-1.5 py-0.5 rounded text-green-700">ROUNDUP(num, decimais)</code>
                                  <span className="text-gray-600 ml-2">Arredondar para cima</span>
                                </div>
                                <div>
                                  <code className="bg-green-50 px-1.5 py-0.5 rounded text-green-700">ROUNDDOWN(num, decimais)</code>
                                  <span className="text-gray-600 ml-2">Arredondar para baixo</span>
                                </div>
                                <div>
                                  <code className="bg-green-50 px-1.5 py-0.5 rounded text-green-700">POWER(base, exp)</code>
                                  <span className="text-gray-600 ml-2">Potência</span>
                                </div>
                                <div>
                                  <code className="bg-green-50 px-1.5 py-0.5 rounded text-green-700">sqrt(num)</code>
                                  <span className="text-gray-600 ml-2">Raiz quadrada</span>
                                </div>
                                <div>
                                  <code className="bg-green-50 px-1.5 py-0.5 rounded text-green-700">abs(num)</code>
                                  <span className="text-gray-600 ml-2">Valor absoluto</span>
                                </div>
                                <div>
                                  <code className="bg-green-50 px-1.5 py-0.5 rounded text-green-700">MOD(num, divisor)</code>
                                  <span className="text-gray-600 ml-2">Resto da divisão</span>
                                </div>
                                <div className="text-gray-600 mt-1">
                                  Básicos: +, -, *, /, ^, pi, e
                                </div>
                              </div>
                            </div>

                            {/* Estatística */}
                            <div>
                              <h5 className="font-bold text-orange-700 mb-2">📊 Estatística</h5>
                              <div className="space-y-1.5 pl-2">
                                <div>
                                  <code className="bg-orange-50 px-1.5 py-0.5 rounded text-orange-700">AVERAGE(a, b, ...)</code>
                                  <span className="text-gray-600 ml-2">Média</span>
                                </div>
                                <div>
                                  <code className="bg-orange-50 px-1.5 py-0.5 rounded text-orange-700">SUM(a, b, ...)</code>
                                  <span className="text-gray-600 ml-2">Soma</span>
                                </div>
                                <div>
                                  <code className="bg-orange-50 px-1.5 py-0.5 rounded text-orange-700">MIN(a, b, ...)</code>
                                  <span className="text-gray-600 ml-2">Mínimo</span>
                                </div>
                                <div>
                                  <code className="bg-orange-50 px-1.5 py-0.5 rounded text-orange-700">MAX(a, b, ...)</code>
                                  <span className="text-gray-600 ml-2">Máximo</span>
                                </div>
                                <div>
                                  <code className="bg-orange-50 px-1.5 py-0.5 rounded text-orange-700">COUNT(a, b, ...)</code>
                                  <span className="text-gray-600 ml-2">Contar valores</span>
                                </div>
                              </div>
                            </div>

                            {/* Texto */}
                            <div>
                              <h5 className="font-bold text-pink-700 mb-2">📝 Texto</h5>
                              <div className="space-y-1.5 pl-2">
                                <div>
                                  <code className="bg-pink-50 px-1.5 py-0.5 rounded text-pink-700">UPPER(texto)</code>
                                  <span className="text-gray-600 ml-2">Maiúsculas</span>
                                </div>
                                <div>
                                  <code className="bg-pink-50 px-1.5 py-0.5 rounded text-pink-700">LOWER(texto)</code>
                                  <span className="text-gray-600 ml-2">Minúsculas</span>
                                </div>
                                <div>
                                  <code className="bg-pink-50 px-1.5 py-0.5 rounded text-pink-700">TRIM(texto)</code>
                                  <span className="text-gray-600 ml-2">Remove espaços</span>
                                </div>
                                <div>
                                  <code className="bg-pink-50 px-1.5 py-0.5 rounded text-pink-700">CONCAT(a, b, ...)</code>
                                  <span className="text-gray-600 ml-2">Concatenar</span>
                                </div>
                                <div>
                                  <code className="bg-pink-50 px-1.5 py-0.5 rounded text-pink-700">LEN(texto)</code>
                                  <span className="text-gray-600 ml-2">Tamanho</span>
                                </div>
                                <div>
                                  <code className="bg-pink-50 px-1.5 py-0.5 rounded text-pink-700">LEFT(texto, n)</code>
                                  <span className="text-gray-600 ml-2">Primeiros N caracteres</span>
                                </div>
                                <div>
                                  <code className="bg-pink-50 px-1.5 py-0.5 rounded text-pink-700">RIGHT(texto, n)</code>
                                  <span className="text-gray-600 ml-2">Últimos N caracteres</span>
                                </div>
                              </div>
                            </div>

                            {/* Data */}
                            <div>
                              <h5 className="font-bold text-indigo-700 mb-2">📅 Data e Hora</h5>
                              <div className="space-y-1.5 pl-2">
                                <div>
                                  <code className="bg-indigo-50 px-1.5 py-0.5 rounded text-indigo-700">NOW()</code>
                                  <span className="text-gray-600 ml-2">Data/hora atual</span>
                                </div>
                                <div>
                                  <code className="bg-indigo-50 px-1.5 py-0.5 rounded text-indigo-700">TODAY()</code>
                                  <span className="text-gray-600 ml-2">Data atual (meia-noite)</span>
                                </div>
                                <div>
                                  <code className="bg-indigo-50 px-1.5 py-0.5 rounded text-indigo-700">YEAR(data)</code>
                                  <span className="text-gray-600 ml-2">Extrair ano</span>
                                </div>
                                <div>
                                  <code className="bg-indigo-50 px-1.5 py-0.5 rounded text-indigo-700">MONTH(data)</code>
                                  <span className="text-gray-600 ml-2">Extrair mês</span>
                                </div>
                                <div>
                                  <code className="bg-indigo-50 px-1.5 py-0.5 rounded text-indigo-700">DAY(data)</code>
                                  <span className="text-gray-600 ml-2">Extrair dia</span>
                                </div>
                                <div>
                                  <code className="bg-indigo-50 px-1.5 py-0.5 rounded text-indigo-700">DAYSDIFF(data1, data2)</code>
                                  <span className="text-gray-600 ml-2">Diferença em dias</span>
                                </div>
                              </div>
                            </div>

                            {/* Verificação */}
                            <div>
                              <h5 className="font-bold text-yellow-700 mb-2">✅ Verificação</h5>
                              <div className="space-y-1.5 pl-2">
                                <div>
                                  <code className="bg-yellow-50 px-1.5 py-0.5 rounded text-yellow-700">ISBLANK(valor)</code>
                                  <span className="text-gray-600 ml-2">Está vazio?</span>
                                </div>
                                <div>
                                  <code className="bg-yellow-50 px-1.5 py-0.5 rounded text-yellow-700">ISNUMBER(valor)</code>
                                  <span className="text-gray-600 ml-2">É número?</span>
                                </div>
                                <div>
                                  <code className="bg-yellow-50 px-1.5 py-0.5 rounded text-yellow-700">ISTEXT(valor)</code>
                                  <span className="text-gray-600 ml-2">É texto?</span>
                                </div>
                              </div>
                            </div>

                            {/* Exemplos */}
                            <div className="pt-2 border-t border-gray-200">
                              <h5 className="font-bold text-gray-900 mb-2">💡 Exemplos Práticos</h5>
                              <div className="space-y-2 pl-2 text-gray-700">
                                <div className="bg-gray-50 p-2 rounded">
                                  <div className="font-medium text-gray-900">Desconto progressivo:</div>
                                  <code className="text-xs">IFS(qtd &gt;= 100, 0.15, qtd &gt;= 50, 0.10, 0.05)</code>
                                </div>
                                <div className="bg-gray-50 p-2 rounded">
                                  <div className="font-medium text-gray-900">Validação de idade:</div>
                                  <code className="text-xs">IF(AND(idade &gt;= 18, idade &lt; 65), "OK", "Fora da faixa")</code>
                                </div>
                                <div className="bg-gray-50 p-2 rounded">
                                  <div className="font-medium text-gray-900">Média de resistências:</div>
                                  <code className="text-xs">AVERAGE(res_1, res_2, res_3)</code>
                                </div>
                                <div className="bg-gray-50 p-2 rounded">
                                  <div className="font-medium text-gray-900">Código formatado:</div>
                                  <code className="text-xs">CONCAT(UPPER(nome), "-", codigo)</code>
                                </div>
                              </div>
                            </div>

                            {/* Referências */}
                            <div className="pt-2 border-t border-gray-200">
                              <h5 className="font-bold text-gray-900 mb-2">🔗 Referências</h5>
                              <div className="space-y-1 pl-2 text-gray-700">
                                <p>• Use <code className="bg-gray-100 px-1 rounded">campo_key</code> para referenciar campos</p>
                                <p>• Use <code className="bg-gray-100 px-1 rounded">regra_key</code> para referenciar outras regras</p>
                                <p>• Strings devem estar entre aspas: <code className="bg-gray-100 px-1 rounded">"texto"</code></p>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                    
                    <div className="flex gap-2 pt-2">
                      <Button onClick={handleAddRule} variant="primary" size="sm" fullWidth>
                        Adicionar Regra
                      </Button>
                      <Button onClick={() => setShowRuleForm(false)} variant="ghost" size="sm">
                        Cancelar
                      </Button>
                    </div>
                  </div>
                )}

                {rules.length === 0 ? (
                  <div className="text-center py-8 text-gray-500 text-sm">
                    Nenhuma regra configurada.
                  </div>
                ) : (
                  <div className="space-y-2">
                    {rules.map((rule) => (
                      <div
                        key={rule.id}
                        className="flex items-start gap-3 p-4 bg-white border-2 border-gray-200 rounded-lg hover:border-purple-300 transition-colors"
                      >
                        <div className="p-2 bg-purple-50 rounded-lg flex-shrink-0">
                          <Calculator className="w-5 h-5 text-purple-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-3 mb-2">
                            <div className="flex-1">
                              <div className="font-semibold text-gray-900 mb-2">{rule.name}</div>
                              <div className="flex items-center gap-2 mb-3">
                                <div className="flex items-center gap-1.5 px-2.5 py-1 bg-purple-50 rounded-md border border-purple-200">
                                  <Hash className="w-3.5 h-3.5 text-purple-600" />
                                  <span className="text-sm font-mono font-medium text-purple-700">{rule.ruleKey}</span>
                                </div>
                                <span className="text-xs text-gray-500">← Chave desta regra</span>
                              </div>
                              <div className="p-3 bg-gray-50 rounded-md border border-gray-200">
                                <div className="text-xs text-gray-600 mb-1 font-medium">Fórmula:</div>
                                <p className="text-sm text-gray-800 font-mono break-all">{rule.formula}</p>
                              </div>
                            </div>
                            <button
                              onClick={() => handleDeleteRule(rule.id)}
                              className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors flex-shrink-0"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </div>
  );
}
