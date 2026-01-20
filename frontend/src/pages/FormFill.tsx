import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Send, AlertCircle, CheckCircle } from 'lucide-react';
import { formsApi, submissionsApi } from '../services/api';
import { useProjectContext } from '../services/project-context';
import type { Form } from '../types';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';

export default function FormFill() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { selectedProject } = useProjectContext();
  
  const [form, setForm] = useState<Form | null>(null);
  const [responses, setResponses] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  
  useEffect(() => {
    if (id) {
      loadForm();
    }
  }, [id]);
  
  const loadForm = async () => {
    try {
      const response = await formsApi.getById(id!);
      const formData = response.data;
      
      if (formData.status !== 'ACTIVE') {
        setError('Este formulário não está ativo para preenchimento');
      }
      
      setForm(formData);
      
      // Inicializa respostas vazias
      const initialResponses: Record<string, string> = {};
      formData.fields.forEach(field => {
        initialResponses[field.id] = '';
      });
      setResponses(initialResponses);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Erro ao carregar formulário');
    } finally {
      setLoading(false);
    }
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!form) return;
    
    // Valida campos obrigatórios
    const missingFields = form.fields
      .filter(field => field.required && !responses[field.id]?.trim())
      .map(field => field.label);
    
    if (missingFields.length > 0) {
      alert(`Por favor, preencha os campos obrigatórios:\n- ${missingFields.join('\n- ')}`);
      return;
    }
    
    try {
      setSubmitting(true);
      
      const submissionData = {
        formId: form.id,
        projectId: selectedProject?.id, // Vincula à obra selecionada
        responses: form.fields
          .filter(field => responses[field.id]?.trim())
          .map(field => ({
            fieldId: field.id,
            value: responses[field.id]
          }))
      };
      
      const response = await submissionsApi.create(submissionData);
      
      // Verifica se foi salvo offline
      const isPending = (response.data as any).__pending;
      
      if (isPending) {
        alert(
          '✅ Formulário salvo localmente!\n\n' +
          'Você está offline. O formulário será sincronizado automaticamente ' +
          'quando a conexão for restabelecida.'
        );
        navigate('/forms');
      } else {
        navigate(`/submissions/${response.data.id}`);
      }
    } catch (err: any) {
      alert(err.response?.data?.error || 'Erro ao enviar formulário');
    } finally {
      setSubmitting(false);
    }
  };
  
  const renderField = (field: any, index: number) => {
    const value = responses[field.id] || '';
    const onChange = (newValue: string) => {
      setResponses({ ...responses, [field.id]: newValue });
    };
    
    const fieldNumber = index + 1;
    const fieldLabel = `${fieldNumber}. ${field.label}`;
    
    switch (field.type) {
      case 'TEXT':
      case 'EMAIL':
      case 'PHONE':
        return (
          <Input
            label={fieldLabel}
            type={field.type === 'EMAIL' ? 'email' : field.type === 'PHONE' ? 'tel' : 'text'}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={`Digite ${field.label.toLowerCase()}`}
            required={field.required}
          />
        );
      
      case 'NUMBER':
        return (
          <Input
            label={fieldLabel}
            type="number"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={`Digite ${field.label.toLowerCase()}`}
            required={field.required}
          />
        );
      
      case 'DATE':
        return (
          <Input
            label={fieldLabel}
            type="date"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            required={field.required}
          />
        );
      
      case 'TEXTAREA':
        return (
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              {fieldLabel}
              {field.required && <span className="text-red-500 ml-1">*</span>}
            </label>
            <textarea
              value={value}
              onChange={(e) => onChange(e.target.value)}
              placeholder={`Digite ${field.label.toLowerCase()}`}
              required={field.required}
              rows={4}
              className="input"
            />
          </div>
        );
      
      case 'CHECKBOX':
        // Se houver opções configuradas, renderiza checkboxes múltiplos
        if (field.config?.options && Array.isArray(field.config.options)) {
          const selectedValues = value ? JSON.parse(value) : [];
          
          const toggleOption = (option: string) => {
            const newValues = selectedValues.includes(option)
              ? selectedValues.filter((v: string) => v !== option)
              : [...selectedValues, option];
            onChange(JSON.stringify(newValues));
          };
          
          return (
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                {fieldLabel}
                {field.required && <span className="text-red-500 ml-1">*</span>}
              </label>
              <div className="space-y-2">
                {field.config.options.map((option: string) => (
                  <label
                    key={option}
                    className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={selectedValues.includes(option)}
                      onChange={() => toggleOption(option)}
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                    />
                    <span className="text-sm font-medium text-gray-900">{option}</span>
                  </label>
                ))}
              </div>
              {field.required && selectedValues.length === 0 && (
                <input
                  type="text"
                  value=""
                  required
                  style={{ position: 'absolute', opacity: 0, pointerEvents: 'none' }}
                  tabIndex={-1}
                />
              )}
            </div>
          );
        }
        
        // Checkbox único (sim/não) - para compatibilidade com campos antigos
        return (
          <label className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
            <input
              type="checkbox"
              checked={value === 'true'}
              onChange={(e) => onChange(e.target.checked ? 'true' : 'false')}
              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
              required={field.required}
            />
            <span className="text-sm font-medium text-gray-900">
              {fieldNumber}. {field.label}
              {field.required && <span className="text-red-500 ml-1">*</span>}
            </span>
          </label>
        );
      
      case 'SELECT':
        return (
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              {fieldLabel}
              {field.required && <span className="text-red-500 ml-1">*</span>}
            </label>
            <select
              value={value}
              onChange={(e) => onChange(e.target.value)}
              required={field.required}
              className="input"
            >
              <option value="">Selecione uma opção...</option>
              {field.config?.options?.map((option: string) => (
                <option key={option} value={option}>{option}</option>
              ))}
            </select>
          </div>
        );
      
      default:
        return (
          <Input
            label={fieldLabel}
            type="text"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={`Digite ${field.label.toLowerCase()}`}
            required={field.required}
          />
        );
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
  
  if (error || !form) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-8">
        <Link to="/forms">
          <Button variant="ghost" size="sm" icon={<ArrowLeft size={16} />} className="mb-4">
            Voltar
          </Button>
        </Link>
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
          <div className="flex items-start gap-2">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <span>{error || 'Formulário não encontrado'}</span>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gray-50 py-4 sm:py-8">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <Link to={`/forms/${id}`}>
          <Button variant="ghost" size="sm" icon={<ArrowLeft size={16} />} className="mb-4">
            Voltar
          </Button>
        </Link>
        
        <Card>
          <CardHeader>
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1">
                <CardTitle className="text-xl sm:text-2xl">{form.title}</CardTitle>
                {form.description && (
                  <CardDescription className="mt-2">{form.description}</CardDescription>
                )}
              </div>
              <Badge variant="success" dot>Ativo</Badge>
            </div>
          </CardHeader>
          
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-5">
              {form.fields.map((field, index) => (
                <div key={field.id}>
                  {renderField(field, index)}
                </div>
              ))}
              
              <div className="pt-6 border-t border-gray-200">
                <Button
                  type="submit"
                  variant="primary"
                  size="lg"
                  fullWidth
                  isLoading={submitting}
                  icon={<Send size={18} />}
                >
                  {submitting ? 'Enviando...' : 'Enviar Formulário'}
                </Button>
                <p className="text-xs text-center text-gray-500 mt-3">
                  Ao enviar, você concorda que as informações fornecidas são verdadeiras.
                </p>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
