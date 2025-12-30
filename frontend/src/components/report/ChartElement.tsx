import React, { useEffect, useRef, useState } from 'react';
import { ChartElementConfig, ChartType, Form } from '../../types';
import { Button } from '../ui/Button';
import { SmartTextEditor } from './SmartTextEditor';

interface ChartElementProps {
  config: ChartElementConfig;
  style?: any;
  editable?: boolean;
  onChange?: (config: ChartElementConfig) => void;
  form?: Form;
}

interface DatasetConfig {
  id: string;
  label: string;
  values: string[]; // Pode ser número ou variável @{} ou #{}
  color: string;
}

export const ChartElement: React.FC<ChartElementProps> = ({
  config,
  style = {},
  editable = false,
  onChange,
  form,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const chartInstanceRef = useRef<any>(null);
  
  // Estado local para configuração visual
  const [labels, setLabels] = useState<string[]>(
    config.data?.labels || ['Label 1', 'Label 2', 'Label 3']
  );
  const [datasets, setDatasets] = useState<DatasetConfig[]>(() => {
    if (config.data?.datasets && config.data.datasets.length > 0) {
      return config.data.datasets.map((ds: any, idx: number) => ({
        id: `ds-${idx}`,
        label: ds.label || `Série ${idx + 1}`,
        values: (ds.data || []).map((v: any) => String(v)),
        color: ds.backgroundColor || '#3b82f6',
      }));
    }
    return [{
      id: 'ds-1',
      label: 'Série 1',
      values: ['10', '20', '15'],
      color: '#3b82f6',
    }];
  });

  // Atualizar config quando labels ou datasets mudarem
  useEffect(() => {
    if (!editable) return;

    const chartData = {
      labels,
      datasets: datasets.map(ds => ({
        label: ds.label,
        data: ds.values.map(v => {
          // Se contém variáveis dinâmicas (@{} ou #{}), manter como string
          if (typeof v === 'string' && (v.includes('@{') || v.includes('#{'))) {
            return v; // Manter como string para processamento posterior
          }
          // Se for número, converter
          const num = parseFloat(v);
          return isNaN(num) ? 0 : num;
        }),
        backgroundColor: ds.color,
        borderColor: ds.color,
        borderWidth: 2,
      })),
    };

    onChange?.({ ...config, data: chartData });
  }, [labels, datasets, editable]);

  useEffect(() => {
    if (!canvasRef.current || !config.data) return;

    // Dinamicamente importar Chart.js apenas quando necessário
    import('chart.js/auto').then((ChartJS) => {
      if (chartInstanceRef.current) {
        chartInstanceRef.current.destroy();
      }

      const ctx = canvasRef.current?.getContext('2d');
      if (!ctx) return;

      // Processar datasets para garantir que os valores sejam números
      const processedData = {
        ...config.data,
        datasets: config.data.datasets?.map((ds: any) => ({
          ...ds,
          data: ds.data?.map((v: any) => {
            // Garantir que o valor é um número
            const num = typeof v === 'number' ? v : parseFloat(String(v));
            return isNaN(num) ? 0 : num;
          }),
        })),
      };

      chartInstanceRef.current = new ChartJS.default(ctx, {
        type: config.chartType as any,
        data: processedData,
        options: {
          responsive: true,
          maintainAspectRatio: !config.height, // Se height definida, não manter aspect ratio
          plugins: {
            legend: {
              display: config.showLegend !== false,
            },
            title: {
              display: !!config.title,
              text: config.title || '',
            },
          },
          scales: config.chartType !== 'pie' && config.chartType !== 'doughnut' ? {
            x: {
              display: true,
              title: {
                display: !!config.xAxisLabel,
                text: config.xAxisLabel || '',
              },
              grid: {
                display: config.showGrid !== false,
              },
            },
            y: {
              display: true,
              title: {
                display: !!config.yAxisLabel,
                text: config.yAxisLabel || '',
              },
              grid: {
                display: config.showGrid !== false,
              },
            },
          } : undefined,
        },
      });
    });

    return () => {
      if (chartInstanceRef.current) {
        chartInstanceRef.current.destroy();
      }
    };
  }, [config]);

  // Funções de manipulação
  const addLabel = () => {
    const newLabels = [...labels, `Label ${labels.length + 1}`];
    setLabels(newLabels);
    // Adicionar valor vazio em todos os datasets
    setDatasets(datasets.map(ds => ({
      ...ds,
      values: [...ds.values, '0'],
    })));
  };

  const removeLabel = (index: number) => {
    if (labels.length <= 1) {
      alert('Precisa ter pelo menos 1 label');
      return;
    }
    setLabels(labels.filter((_, i) => i !== index));
    setDatasets(datasets.map(ds => ({
      ...ds,
      values: ds.values.filter((_, i) => i !== index),
    })));
  };

  const updateLabel = (index: number, value: string) => {
    const newLabels = [...labels];
    newLabels[index] = value;
    setLabels(newLabels);
  };

  const addDataset = () => {
    const colors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];
    const newDataset: DatasetConfig = {
      id: `ds-${Date.now()}`,
      label: `Série ${datasets.length + 1}`,
      values: labels.map(() => '0'),
      color: colors[datasets.length % colors.length],
    };
    setDatasets([...datasets, newDataset]);
  };

  const removeDataset = (id: string) => {
    if (datasets.length <= 1) {
      alert('Precisa ter pelo menos 1 série de dados');
      return;
    }
    setDatasets(datasets.filter(ds => ds.id !== id));
  };

  const updateDataset = (id: string, updates: Partial<DatasetConfig>) => {
    setDatasets(datasets.map(ds => 
      ds.id === id ? { ...ds, ...updates } : ds
    ));
  };

  const updateDatasetValue = (datasetId: string, valueIndex: number, value: string) => {
    setDatasets(datasets.map(ds => {
      if (ds.id === datasetId) {
        const newValues = [...ds.values];
        newValues[valueIndex] = value;
        return { ...ds, values: newValues };
      }
      return ds;
    }));
  };

  if (editable) {
    return (
      <div className="space-y-6">
        {/* Tipo e Título */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tipo de Gráfico
            </label>
            <select
              value={config.chartType}
              onChange={(e) => onChange?.({ ...config, chartType: e.target.value as ChartType })}
              className="w-full px-3 py-2 border rounded-lg"
            >
              <option value="bar">Barras</option>
              <option value="line">Linha</option>
              <option value="pie">Pizza</option>
              <option value="doughnut">Rosca</option>
              <option value="area">Área</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Título do Gráfico (use @ ou #)
            </label>
            <SmartTextEditor
              value={config.title || ''}
              onChange={(title) => onChange?.({ ...config, title })}
              form={form}
              placeholder="Ex: Resultados de #{form.title}"
              minHeight="38px"
              inline={true}
            />
          </div>
        </div>

        {/* Labels do Eixo X */}
        <div className="border rounded-lg p-4 bg-gray-50">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-medium text-gray-900">📊 Labels (Eixo X)</h3>
            <Button onClick={addLabel} size="sm" variant="outline">
              + Adicionar Label
            </Button>
          </div>

          <div className="space-y-2">
            {labels.map((label, index) => (
              <div key={index} className="flex items-center gap-2">
                <span className="text-sm text-gray-500 w-8">#{index + 1}</span>
                <SmartTextEditor
                  value={label}
                  onChange={(value) => updateLabel(index, value)}
                  form={form}
                  placeholder="Ex: @{currentDate} ou Janeiro"
                  minHeight="38px"
                  inline={true}
                  className="flex-1"
                />
                {labels.length > 1 && (
                  <button
                    onClick={() => removeLabel(index)}
                    className="text-red-600 hover:text-red-800 p-2"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Datasets (Séries de Dados) */}
        <div className="border rounded-lg p-4 bg-blue-50">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-medium text-gray-900">📈 Séries de Dados</h3>
            <Button onClick={addDataset} size="sm" className="bg-blue-600 text-white">
              + Adicionar Série
            </Button>
          </div>

          <div className="space-y-4">
            {datasets.map((dataset, dsIndex) => (
              <div key={dataset.id} className="border border-blue-200 rounded-lg p-4 bg-white">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3 flex-1">
                    <input
                      type="color"
                      value={dataset.color}
                      onChange={(e) => updateDataset(dataset.id, { color: e.target.value })}
                      className="w-12 h-10 border rounded cursor-pointer"
                      title="Cor da série"
                    />
                    <SmartTextEditor
                      value={dataset.label}
                      onChange={(label) => updateDataset(dataset.id, { label })}
                      form={form}
                      placeholder="Nome da série"
                      minHeight="38px"
                      inline={true}
                      className="flex-1"
                    />
                  </div>
                  {datasets.length > 1 && (
                    <button
                      onClick={() => removeDataset(dataset.id)}
                      className="text-red-600 hover:text-red-800 p-2"
                      title="Remover série"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  )}
                </div>

                <div className="space-y-2">
                  <p className="text-xs font-medium text-gray-600 mb-2">Valores (use @ # ou números):</p>
                  {dataset.values.map((value, valueIndex) => (
                    <div key={valueIndex} className="flex items-center gap-2">
                      <span className="text-xs text-gray-500 w-20 truncate" title={labels[valueIndex]}>
                        {labels[valueIndex]}:
                      </span>
                      <SmartTextEditor
                        value={value}
                        onChange={(val) => updateDatasetValue(dataset.id, valueIndex, val)}
                        form={form}
                        placeholder="#{field.valor} ou 42"
                        minHeight="38px"
                        inline={true}
                        className="flex-1"
                      />
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Configurações dos Eixos */}
        {config.chartType !== 'pie' && config.chartType !== 'doughnut' && (
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Rótulo Eixo X (use @ ou #)
              </label>
              <SmartTextEditor
                value={config.xAxisLabel || ''}
                onChange={(xAxisLabel) => onChange?.({ ...config, xAxisLabel })}
                form={form}
                placeholder="Ex: Período"
                minHeight="38px"
                inline={true}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Rótulo Eixo Y (use @ ou #)
              </label>
              <SmartTextEditor
                value={config.yAxisLabel || ''}
                onChange={(yAxisLabel) => onChange?.({ ...config, yAxisLabel })}
                form={form}
                placeholder="Ex: Valores em MPa"
                minHeight="38px"
                inline={true}
              />
            </div>
          </div>
        )}

        {/* Opções */}
        <div className="space-y-3">
          <div className="flex gap-4">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={config.showLegend !== false}
                onChange={(e) => onChange?.({ ...config, showLegend: e.target.checked })}
                className="rounded"
              />
              <span className="text-sm">Mostrar legenda</span>
            </label>

            {config.chartType !== 'pie' && config.chartType !== 'doughnut' && (
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={config.showGrid !== false}
                  onChange={(e) => onChange?.({ ...config, showGrid: e.target.checked })}
                  className="rounded"
                />
                <span className="text-sm">Mostrar grade</span>
              </label>
            )}
          </div>

          {/* Controle de altura */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              📐 Altura do Gráfico (px)
            </label>
            <input
              type="number"
              value={config.height || 300}
              onChange={(e) => onChange?.({ ...config, height: parseInt(e.target.value) || 300 })}
              className="w-full max-w-xs px-3 py-2 border rounded-lg text-sm"
              min="100"
              max="800"
              step="50"
            />
            <p className="text-xs text-gray-500 mt-1">
              Altura recomendada: 300px - 400px
            </p>
          </div>
        </div>

        {/* Preview do gráfico */}
        {config.data && (
          <div className="border rounded-lg p-4 bg-white">
            <p className="text-sm font-medium text-gray-700 mb-3">Preview:</p>
            <div style={{ 
              maxWidth: 600, 
              margin: '0 auto',
              height: config.height ? `${config.height}px` : 'auto'
            }}>
              <canvas ref={canvasRef}></canvas>
            </div>
          </div>
        )}

        <div className="bg-green-50 border border-green-200 rounded-lg p-3">
          <p className="text-sm text-green-800">
            💡 <strong>Dica:</strong> Use @ para dados fixos (datas, nomes) e # para valores dinâmicos de formulários
          </p>
        </div>
      </div>
    );
  }

  // Modo visualização
  if (!config.data) {
    return (
      <div className="text-center text-gray-500 py-8">
        Nenhum dado de gráfico configurado
      </div>
    );
  }

  return (
    <div style={{ 
      maxWidth: config.width || '100%', 
      height: config.height ? `${config.height}px` : 'auto', 
      ...style 
    }}>
      <canvas ref={canvasRef}></canvas>
    </div>
  );
};
