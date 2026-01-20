import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { reportsApi, formsApi } from '../services/api';
import { Report, ReportElement, ElementType, CreateElementData, Form, PageSettings } from '../types';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Modal } from '../components/ui/Modal';
import {
  TextElement,
  TitleElement,
  TableElement,
  ChartElement,
  ImageElement,
  DividerElement,
  SpacerElement,
  SignatureElement,
} from '../components/report';
import { A4Container } from '../components/report/A4Page';
import { A4PreviewWithPageBreaks } from '../components/report/A4PreviewWithPageBreaks';
import { useProjectContext } from '../services/project-context';

const elementIcons: Record<ElementType, string> = {
  TEXT: '📝',
  TITLE: '📌',
  TABLE: '📊',
  CHART: '📈',
  IMAGE: '🖼️',
  DIVIDER: '➖',
  SPACER: '⬜',
  SIGNATURE: '✍️',
};

const elementLabels: Record<ElementType, string> = {
  TEXT: 'Texto',
  TITLE: 'Título',
  TABLE: 'Tabela',
  CHART: 'Gráfico',
  IMAGE: 'Imagem',
  DIVIDER: 'Divisor',
  SPACER: 'Espaçamento',
  SIGNATURE: 'Assinatura',
};

const defaultConfigs: Record<ElementType, any> = {
  TEXT: { content: '', fontSize: 16, color: '#000000', align: 'left' },
  TITLE: { content: 'Título do Relatório', fontSize: 24, fontWeight: 'bold', color: '#000000', align: 'center' },
  TABLE: { 
    columns: [
      { id: 'col1', label: 'Coluna 1', key: 'col1', width: '100px', align: 'left' },
      { id: 'col2', label: 'Coluna 2', key: 'col2', width: '100px', align: 'left' },
    ],
    rows: [
      { id: 'row1', cells: [{ id: 'cell1', value: '' }, { id: 'cell2', value: '' }] },
    ],
    showBorders: true,
    headerBackground: '#f3f4f6',
    headerColor: '#111827',
  },
  CHART: {
    chartType: 'bar',
    data: {
      labels: ['Jan', 'Fev', 'Mar'],
      datasets: [{
        label: 'Dados',
        data: [10, 20, 15],
        backgroundColor: '#3b82f6',
      }],
    },
    showLegend: true,
    showGrid: true,
  },
  IMAGE: { url: '', alt: '', objectFit: 'contain' },
  DIVIDER: { thickness: 1, color: '#e5e7eb', style: 'solid' },
  SPACER: { height: 20 },
  SIGNATURE: { 
    signatures: [
      {
        id: Date.now().toString(),
        description: 'Descrição',
        responsibleName: 'Nome do usuário',
        align: 'left',
        lineWidth: 200,
        lineColor: '#000000',
        showDate: true,
      }
    ]
  },
};

export const ReportBuilder: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { selectedProject } = useProjectContext();

  const [report, setReport] = useState<Report | null>(null);
  const [elements, setElements] = useState<ReportElement[]>([]);
  const [form, setForm] = useState<Form | null>(null);
  const [forms, setForms] = useState<Form[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [showAddMenu, setShowAddMenu] = useState(false);
  const [editingElement, setEditingElement] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'edit' | 'preview'>('edit');

  // Form fields
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [formId, setFormId] = useState('');
  const [status, setStatus] = useState<'DRAFT' | 'PUBLISHED' | 'ARCHIVED'>('DRAFT');
  const [pageSettings, setPageSettings] = useState<PageSettings>({
    margins: { top: 20, right: 20, bottom: 20, left: 20 },
    showPageNumbers: true,
  });

  useEffect(() => {
    loadForms();
    if (id && id !== 'new') {
      loadReport();
    }
  }, [id, selectedProject]);

  useEffect(() => {
    if (formId) {
      loadForm();
    }
  }, [formId]);


  const loadForms = async () => {
    try {
      const response = await formsApi.list(selectedProject?.id);
      setForms(response.data);
    } catch (err) {
      console.error('Error loading forms:', err);
    }
  };

  const loadForm = async () => {
    try {
      const response = await formsApi.getById(formId);
      setForm(response.data);
    } catch (err) {
      console.error('Error loading form:', err);
    }
  };

  const loadReport = async () => {
    try {
      setLoading(true);
      const response = await reportsApi.get(id!);
      setReport(response.data);
      setTitle(response.data.title);
      setDescription(response.data.description || '');
      setFormId(response.data.formId);
      setStatus(response.data.status);
      setElements(response.data.elements || []);
      if (response.data.pageSettings) {
        setPageSettings(response.data.pageSettings);
      }
      if (response.data.form) {
        setForm(response.data.form);
      }
    } catch (err: any) {
      console.error('Error loading report:', err);
      setError(err.response?.data?.error || 'Erro ao carregar relatório');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveReport = async () => {
    if (!title.trim()) {
      alert('Por favor, insira um título para o relatório');
      return;
    }

    if (!formId) {
      alert('Por favor, selecione um formulário');
      return;
    }

    try {
      setSaving(true);
      
      if (id && id !== 'new') {
        // Atualizar relatório existente
        await reportsApi.update(id, {
          title,
          description,
          formId,
          status,
          pageSettings,
          projectId: selectedProject?.id,
        });
      } else {
        // Criar novo relatório
        const response = await reportsApi.create({
          title,
          description,
          formId,
          status,
          pageSettings,
          projectId: selectedProject?.id,
        });
        navigate(`/reports/${response.data.id}/edit`, { replace: true });
      }

      alert('Relatório salvo com sucesso!');
    } catch (err: any) {
      alert(err.response?.data?.error || 'Erro ao salvar relatório');
    } finally {
      setSaving(false);
    }
  };

  const handleAddElement = async (type: ElementType) => {
    if (!id || id === 'new') {
      alert('Por favor, salve o relatório antes de adicionar elementos');
      return;
    }

    try {
      // Se for um título, inserir no topo (após outros títulos)
      let insertOrder = elements.length;
      if (type === 'TITLE') {
        // Encontrar o índice do último título
        const lastTitleIndex = elements.findLastIndex(el => el.type === 'TITLE');
        insertOrder = lastTitleIndex >= 0 ? lastTitleIndex + 1 : 0;
      }

      const newElementData: CreateElementData = {
        type,
        config: defaultConfigs[type],
        order: insertOrder,
      };

      const response = await reportsApi.addElement(id, newElementData);
      
      // Inserir na posição correta
      const newElements = [...elements];
      newElements.splice(insertOrder, 0, response.data);
      
      // Reordenar todos os elementos
      const reorderedElements = newElements.map((el, idx) => ({ ...el, order: idx }));
      
      // Atualizar ordens no backend
      await Promise.all(
        reorderedElements.map((el) =>
          reportsApi.updateElement(el.id, { order: el.order })
        )
      );
      
      setElements(reorderedElements);
      setShowAddMenu(false);
      setEditingElement(response.data.id);
    } catch (err: any) {
      alert(err.response?.data?.error || 'Erro ao adicionar elemento');
    }
  };

  const handleUpdateElement = async (elementId: string, config: any) => {
    // Atualizar estado local imediatamente para feedback visual instantâneo
    setElements(prevElements => prevElements.map(el => 
      el.id === elementId ? { ...el, config: { ...config } } : el
    ));
    
    // Salvar no backend
    try {
      await reportsApi.updateElement(elementId, { config });
    } catch (err: any) {
      console.error('Error updating element:', err);
    }
  };

  const handleDeleteElement = async (elementId: string) => {
    if (!window.confirm('Tem certeza que deseja deletar este elemento?')) {
      return;
    }

    try {
      await reportsApi.deleteElement(elementId);
      setElements(elements.filter(el => el.id !== elementId));
    } catch (err: any) {
      alert(err.response?.data?.error || 'Erro ao deletar elemento');
    }
  };

  const handleMoveElement = async (elementId: string, direction: 'up' | 'down') => {
    const index = elements.findIndex(el => el.id === elementId);
    const element = elements[index];
    
    // Prevenir movimentos inválidos
    if (
      (direction === 'up' && index === 0) ||
      (direction === 'down' && index === elements.length - 1)
    ) {
      return;
    }

    // Títulos não podem ser movidos para baixo
    if (element.type === 'TITLE' && direction === 'down') {
      alert('Títulos devem sempre ficar no topo do relatório e não podem ser movidos para baixo.');
      return;
    }

    const newIndex = direction === 'up' ? index - 1 : index + 1;
    const targetElement = elements[newIndex];

    // Elementos não-título não podem ser movidos acima de títulos
    if (element.type !== 'TITLE' && targetElement.type === 'TITLE' && direction === 'up') {
      alert('Elementos não podem ser movidos acima dos títulos.');
      return;
    }

    const newElements = [...elements];
    [newElements[index], newElements[newIndex]] = [newElements[newIndex], newElements[index]];

    // Atualizar ordens
    try {
      await Promise.all(
        newElements.map((el, idx) =>
          reportsApi.updateElement(el.id, { order: idx })
        )
      );
      setElements(newElements.map((el, idx) => ({ ...el, order: idx })));
    } catch (err: any) {
      console.error('Error reordering elements:', err);
    }
  };

  const renderElement = (element: ReportElement, isEditing: boolean) => {
    const commonProps = {
      config: element.config,
      style: element.style,
      editable: isEditing,
      onChange: (config: any) => handleUpdateElement(element.id, config),
      form: form || undefined,
    };

    switch (element.type) {
      case 'TEXT':
        return <TextElement {...commonProps} />;
      case 'TITLE':
        return <TitleElement {...commonProps} />;
      case 'TABLE':
        return <TableElement {...commonProps} />;
      case 'CHART':
        return <ChartElement {...commonProps} />;
      case 'IMAGE':
        return <ImageElement {...commonProps} />;
      case 'DIVIDER':
        return <DividerElement {...commonProps} />;
      case 'SPACER':
        return <SpacerElement {...commonProps} />;
      case 'SIGNATURE':
        return <SignatureElement {...commonProps} />;
      default:
        return <div>Tipo de elemento desconhecido</div>;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg text-gray-600">Carregando...</div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            {id && id !== 'new' ? 'Editar Relatório' : 'Novo Relatório'}
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Configure os elementos e o layout do seu relatório
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => navigate('/reports')}
          >
            Cancelar
          </Button>
          <Button
            onClick={handleSaveReport}
            disabled={saving}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            {saving ? 'Salvando...' : 'Salvar Relatório'}
          </Button>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-sm text-red-800">{error}</p>
        </div>
      )}

      {/* Configurações do relatório */}
      <Card className="p-6">
        <h2 className="text-lg font-semibold mb-4">Informações do Relatório</h2>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Título *
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg"
              placeholder="Ex: Relatório de Ensaios de Concreto"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Descrição
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg"
              rows={3}
              placeholder="Descrição opcional do relatório"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Formulário Vinculado *
            </label>
            <select
              value={formId}
              onChange={(e) => setFormId(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg"
              disabled={id && id !== 'new' && status !== 'DRAFT'}
            >
              <option value="">Selecione um formulário</option>
              {forms.map((f) => (
                <option key={f.id} value={f.id}>
                  {f.title}
                </option>
              ))}
            </select>
            {form && (
              <p className="text-xs text-gray-500 mt-1">
                {form.fields?.length || 0} campos • {form.rules?.length || 0} cálculos
              </p>
            )}
            {id && id !== 'new' && status === 'DRAFT' && (
              <p className="text-xs text-amber-600 mt-1">
                ⚠️ Você pode alterar o formulário enquanto o relatório estiver como rascunho
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Status
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as any)}
              className="w-full px-3 py-2 border rounded-lg"
            >
              <option value="DRAFT">Rascunho</option>
              <option value="PUBLISHED">Ativo</option>
              <option value="ARCHIVED">Arquivado</option>
            </select>
          </div>

          {/* Configurações de Página */}
          <div className="border-t pt-4 mt-4">
            <h3 className="text-sm font-semibold text-gray-700 mb-3">Configurações de Página</h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  Margem Superior (mm)
                </label>
                <input
                  type="number"
                  min="0"
                  max="50"
                  value={pageSettings.margins?.top || 20}
                  onChange={(e) => setPageSettings({
                    ...pageSettings,
                    margins: { ...pageSettings.margins, top: Number(e.target.value) }
                  })}
                  className="w-full px-3 py-2 border rounded-lg text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  Margem Inferior (mm)
                </label>
                <input
                  type="number"
                  min="0"
                  max="50"
                  value={pageSettings.margins?.bottom || 20}
                  onChange={(e) => setPageSettings({
                    ...pageSettings,
                    margins: { ...pageSettings.margins, bottom: Number(e.target.value) }
                  })}
                  className="w-full px-3 py-2 border rounded-lg text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  Margem Esquerda (mm)
                </label>
                <input
                  type="number"
                  min="0"
                  max="50"
                  value={pageSettings.margins?.left || 20}
                  onChange={(e) => setPageSettings({
                    ...pageSettings,
                    margins: { ...pageSettings.margins, left: Number(e.target.value) }
                  })}
                  className="w-full px-3 py-2 border rounded-lg text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  Margem Direita (mm)
                </label>
                <input
                  type="number"
                  min="0"
                  max="50"
                  value={pageSettings.margins?.right || 20}
                  onChange={(e) => setPageSettings({
                    ...pageSettings,
                    margins: { ...pageSettings.margins, right: Number(e.target.value) }
                  })}
                  className="w-full px-3 py-2 border rounded-lg text-sm"
                />
              </div>
            </div>

            <div className="mt-3 space-y-2">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={pageSettings.showPageNumbers !== false}
                  onChange={(e) => setPageSettings({
                    ...pageSettings,
                    showPageNumbers: e.target.checked
                  })}
                  className="rounded"
                />
                <span className="text-sm text-gray-700">Mostrar números de página</span>
              </label>
              
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={pageSettings.showProjectLogo === true}
                  onChange={(e) => setPageSettings({
                    ...pageSettings,
                    showProjectLogo: e.target.checked
                  })}
                  className="rounded"
                />
                <span className="text-sm text-gray-700">Mostrar logo da obra no canto superior esquerdo</span>
              </label>
            </div>
          </div>
        </div>
      </Card>

      {/* Elementos do relatório */}
      <Card className="p-0 overflow-hidden">
        {/* Tabs */}
        <div className="flex border-b border-gray-200 bg-gray-50">
          <button
            onClick={() => setActiveTab('edit')}
            className={`flex-1 px-6 py-4 text-sm font-medium transition-all flex items-center justify-center gap-2 ${
              activeTab === 'edit'
                ? 'bg-white text-blue-600 border-b-2 border-blue-600 -mb-px'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
            }`}
          >
            <span className="text-lg">✏️</span>
            <span>Edição de Elementos</span>
            {elements.length > 0 && (
              <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                activeTab === 'edit' ? 'bg-blue-100 text-blue-700' : 'bg-gray-200 text-gray-700'
              }`}>
                {elements.length}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab('preview')}
            className={`flex-1 px-6 py-4 text-sm font-medium transition-all flex items-center justify-center gap-2 ${
              activeTab === 'preview'
                ? 'bg-white text-blue-600 border-b-2 border-blue-600 -mb-px'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
            }`}
          >
            <span className="text-lg">👁️</span>
            <span>Preview A4</span>
          </button>
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {activeTab === 'edit' ? (
            /* Aba de Edição */
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-base font-semibold text-gray-900">
                  Lista de Elementos
                </h3>
                <Button
                  onClick={() => setShowAddMenu(true)}
                  disabled={!id || id === 'new'}
                  size="sm"
                  className="bg-green-600 hover:bg-green-700 text-white"
                >
                  + Adicionar Elemento
                </Button>
              </div>

              {(!id || id === 'new') && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
                  <p className="text-sm text-yellow-800">
                    💡 Salve o relatório primeiro para poder adicionar elementos
                  </p>
                </div>
              )}

              {elements.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <div className="text-5xl mb-4">📄</div>
                  <p className="font-medium">Nenhum elemento adicionado ainda</p>
                  <p className="text-sm mt-2">Clique em "Adicionar Elemento" para começar</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {elements.map((element, index) => {
                    const isEditing = editingElement === element.id;

                    return (
                      <div
                        key={element.id}
                        className={`border rounded-lg transition-all ${
                          isEditing 
                            ? 'border-blue-500 bg-blue-50 shadow-md' 
                            : element.type === 'TITLE'
                            ? 'border-purple-300 bg-purple-50/30 hover:border-purple-400'
                            : 'border-gray-200 bg-white hover:border-gray-300'
                        }`}
                      >
                        {/* Header do elemento */}
                        <div className="p-4 space-y-3">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <span className="text-2xl">{elementIcons[element.type]}</span>
                              <div>
                                <div className="flex items-center gap-2">
                                  <span className="font-medium text-gray-900">
                                    {elementLabels[element.type]}
                                  </span>
                                  {element.type === 'TITLE' && (
                                    <span className="text-xs px-2 py-0.5 bg-purple-100 text-purple-700 rounded-full font-medium">
                                      📌 Fixo no topo
                                    </span>
                                  )}
                                </div>
                                <p className="text-xs text-gray-500 mt-0.5">
                                  Posição: {index + 1}
                                </p>
                              </div>
                            </div>

                            <div className="flex items-center gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleMoveElement(element.id, 'up')}
                                disabled={
                                  index === 0 || 
                                  (element.type !== 'TITLE' && index > 0 && elements[index - 1].type === 'TITLE')
                                }
                                title={
                                  element.type !== 'TITLE' && index > 0 && elements[index - 1].type === 'TITLE'
                                    ? 'Não pode mover acima de títulos'
                                    : 'Mover para cima'
                                }
                              >
                                ↑
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleMoveElement(element.id, 'down')}
                                disabled={index === elements.length - 1 || element.type === 'TITLE'}
                                title={
                                  element.type === 'TITLE'
                                    ? 'Títulos devem ficar no topo'
                                    : 'Mover para baixo'
                                }
                              >
                                ↓
                              </Button>
                              <Button
                                size="sm"
                                variant={isEditing ? 'primary' : 'outline'}
                                onClick={() => setEditingElement(isEditing ? null : element.id)}
                              >
                                {isEditing ? '✓ Fechar' : '✏️ Editar'}
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleDeleteElement(element.id)}
                                className="text-red-600 hover:bg-red-50"
                                title="Deletar"
                              >
                                🗑️
                              </Button>
                            </div>
                          </div>

                          {/* Controle de espaçamento */}
                          <div className="flex items-center gap-3 bg-purple-50 border border-purple-200 rounded px-3 py-2">
                            <span className="text-xs font-medium text-purple-700">
                              ↕️ Espaçamento abaixo:
                            </span>
                            <input
                              type="range"
                              value={parseInt(element.style?.marginBottom || '24')}
                              onChange={async (e) => {
                                const newStyle = { 
                                  ...element.style, 
                                  marginBottom: `${e.target.value}px` 
                                };
                                // Atualizar elemento com novo estilo
                                setElements(prevElements => prevElements.map(el => 
                                  el.id === element.id ? { ...el, style: newStyle } : el
                                ));
                                // Salvar no backend
                                try {
                                  await reportsApi.updateElement(element.id, { style: newStyle });
                                } catch (err) {
                                  console.error('Error updating spacing:', err);
                                }
                              }}
                              className="flex-1"
                              min="0"
                              max="80"
                              step="4"
                            />
                            <input
                              type="number"
                              value={parseInt(element.style?.marginBottom || '24')}
                              onChange={async (e) => {
                                const newStyle = { 
                                  ...element.style, 
                                  marginBottom: `${e.target.value}px` 
                                };
                                setElements(prevElements => prevElements.map(el => 
                                  el.id === element.id ? { ...el, style: newStyle } : el
                                ));
                                try {
                                  await reportsApi.updateElement(element.id, { style: newStyle });
                                } catch (err) {
                                  console.error('Error updating spacing:', err);
                                }
                              }}
                              className="w-16 px-2 py-1 text-xs border rounded"
                              min="0"
                              max="80"
                              step="4"
                            />
                            <span className="text-xs text-gray-500">px</span>
                          </div>
                        </div>

                        {/* Preview do elemento (sempre visível) */}
                        {!isEditing && (
                          <div 
                            className="p-4 pt-0 border-t border-gray-100 bg-gray-50"
                            style={{ marginBottom: element.style?.marginBottom || '0' }}
                          >
                            <div className="pointer-events-none opacity-80">
                              {renderElement(element, false)}
                            </div>
                          </div>
                        )}

                        {/* Conteúdo editável */}
                        {isEditing && (
                          <div 
                            className="p-4 pt-0 border-t border-blue-200"
                            style={{ marginBottom: element.style?.marginBottom || '0' }}
                          >
                            {renderElement(element, true)}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          ) : (
            /* Aba de Preview */
            <div>
              <div className="mb-4 bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex gap-3">
                  <div className="text-2xl">ℹ️</div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-blue-900 mb-1">Preview em Formato A4</h4>
                    <ul className="text-sm text-blue-800 space-y-1">
                      <li>• As <strong>linhas vermelhas tracejadas</strong> indicam onde as páginas serão quebradas na impressão</li>
                      <li>• A altura disponível por página é de <strong>257mm</strong> (297mm - 40mm de margem)</li>
                      <li>• Elementos grandes (tabelas, gráficos) não serão cortados no meio</li>
                    </ul>
                  </div>
                </div>
              </div>

              {elements.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <div className="text-5xl mb-4">📄</div>
                  <p className="font-medium">Nenhum elemento para visualizar</p>
                  <p className="text-sm mt-2">Adicione elementos na aba "Edição de Elementos"</p>
                </div>
              ) : (
                <A4Container showGrid={false}>
                  <A4PreviewWithPageBreaks 
                    margins={pageSettings.margins}
                    showProjectLogo={pageSettings.showProjectLogo}
                    projectLogo={selectedProject?.logo}
                  >
                    <div>
                      {elements.map((element) => (
                        <div 
                          key={element.id} 
                          className="report-element"
                          style={{ 
                            marginBottom: element.style?.marginBottom || '24px',
                          }}
                        >
                          {renderElement(element, false)}
                        </div>
                      ))}
                    </div>
                  </A4PreviewWithPageBreaks>
                </A4Container>
              )}
            </div>
          )}
        </div>
      </Card>

      {/* Modal para adicionar elemento */}
      <Modal
        isOpen={showAddMenu}
        onClose={() => setShowAddMenu(false)}
        title="Adicionar Elemento"
      >
        <div className="grid grid-cols-2 gap-3">
          {(Object.keys(elementLabels) as ElementType[]).map((type) => (
            <button
              key={type}
              onClick={() => handleAddElement(type)}
              className="flex flex-col items-center gap-2 p-6 border-2 border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors"
            >
              <span className="text-4xl">{elementIcons[type]}</span>
              <span className="font-medium text-gray-900">{elementLabels[type]}</span>
            </button>
          ))}
        </div>
      </Modal>
    </div>
  );
};

