import React, { useState } from 'react';
import { SignatureElementConfig, SignatureField, Form } from '../../types';
import { Plus, X, AlignLeft, AlignCenter, AlignRight } from 'lucide-react';
import { SmartTextEditor } from './SmartTextEditor';

interface SignatureElementProps {
  config: SignatureElementConfig;
  style?: any;
  editable?: boolean;
  onChange?: (config: SignatureElementConfig) => void;
  form?: Form;
}

export const SignatureElement: React.FC<SignatureElementProps> = ({
  config,
  style = {},
  editable = false,
  onChange,
  form,
}) => {
  const [expandedSignature, setExpandedSignature] = useState<string | null>(null);

  const handleAddSignature = () => {
    if (config.signatures.length >= 3) {
      alert('Máximo de 3 campos de assinatura permitidos');
      return;
    }

    const newSignature: SignatureField = {
      id: Date.now().toString(),
      label: 'Assinatura',
      description: 'Descrição',
      responsibleName: 'Nome do usuário',
      align: config.signatures.length === 0 ? 'left' : 
             config.signatures.length === 1 ? 'center' : 'right',
      lineWidth: 200,
      lineColor: '#000000',
      showDate: true,
    };

    onChange?.({
      ...config,
      signatures: [...config.signatures, newSignature],
    });
  };

  const handleRemoveSignature = (id: string) => {
    onChange?.({
      ...config,
      signatures: config.signatures.filter(sig => sig.id !== id),
    });
  };

  const handleUpdateSignature = (id: string, updates: Partial<SignatureField>) => {
    onChange?.({
      ...config,
      signatures: config.signatures.map(sig =>
        sig.id === id ? { ...sig, ...updates } : sig
      ),
    });
  };

  const getAlignmentClass = (align: 'left' | 'center' | 'right') => {
    switch (align) {
      case 'left': return 'items-start text-left';
      case 'center': return 'items-center text-center';
      case 'right': return 'items-end text-right';
    }
  };

  const getAlignmentIcon = (align: 'left' | 'center' | 'right') => {
    switch (align) {
      case 'left': return <AlignLeft className="w-4 h-4" />;
      case 'center': return <AlignCenter className="w-4 h-4" />;
      case 'right': return <AlignRight className="w-4 h-4" />;
    }
  };

  if (editable) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between mb-4">
          <h4 className="text-sm font-semibold text-gray-700">
            ✍️ Campos de Assinatura ({config.signatures.length}/3)
          </h4>
          <button
            onClick={handleAddSignature}
            disabled={config.signatures.length >= 3}
            className="flex items-center gap-2 px-3 py-1.5 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
          >
            <Plus className="w-4 h-4" />
            Adicionar Assinatura
          </button>
        </div>

        {config.signatures.length === 0 && (
          <div className="text-center py-8 text-gray-500 border-2 border-dashed rounded-lg">
            Clique em "Adicionar Assinatura" para criar um campo de assinatura
          </div>
        )}

        <div className="space-y-4">
          {config.signatures.map((signature, index) => (
            <div
              key={signature.id}
              className="border rounded-lg p-4 bg-gray-50 hover:bg-gray-100 transition-colors"
            >
              <div className="flex items-center justify-between mb-3">
                <h5 className="font-medium text-gray-700 flex items-center gap-2">
                  ✍️ Assinatura {index + 1}
                  <span className="text-xs text-gray-500">
                    ({signature.align === 'left' ? 'Esquerda' : 
                      signature.align === 'center' ? 'Centro' : 'Direita'})
                  </span>
                </h5>
                <button
                  onClick={() => handleRemoveSignature(signature.id)}
                  className="p-1 text-red-600 hover:bg-red-50 rounded transition-colors"
                  title="Remover assinatura"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-3">
                {/* Alinhamento */}
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">
                    📐 Alinhamento
                  </label>
                  <div className="flex gap-2">
                    {(['left', 'center', 'right'] as const).map((align) => (
                      <button
                        key={align}
                        onClick={() => handleUpdateSignature(signature.id, { align })}
                        className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 border rounded transition-colors ${
                          signature.align === align
                            ? 'bg-blue-50 border-blue-500 text-blue-700'
                            : 'bg-white border-gray-300 text-gray-600 hover:bg-gray-50'
                        }`}
                      >
                        {getAlignmentIcon(align)}
                        <span className="text-xs">
                          {align === 'left' ? 'Esquerda' : 
                           align === 'center' ? 'Centro' : 'Direita'}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Descrição */}
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">
                    📝 Descrição (abaixo da linha)
                  </label>
                  <SmartTextEditor
                    value={signature.description}
                    onChange={(description) =>
                      handleUpdateSignature(signature.id, { description })
                    }
                    form={form}
                    inline={true}
                    placeholder="Ex: Responsável Técnico"
                  />
                </div>

                {/* Nome do Responsável */}
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">
                    👤 Nome do Responsável
                  </label>
                  <SmartTextEditor
                    value={signature.responsibleName}
                    onChange={(responsibleName) =>
                      handleUpdateSignature(signature.id, { responsibleName })
                    }
                    form={form}
                    inline={true}
                    placeholder="Ex: @{user.name} ou digite um nome"
                  />
                </div>

                {/* Configurações da Linha */}
                <details className="border-t pt-3">
                  <summary className="text-xs font-medium text-gray-600 cursor-pointer hover:text-gray-800">
                    ⚙️ Configurações Avançadas
                  </summary>
                  <div className="grid grid-cols-2 gap-3 mt-3">
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">
                        📏 Largura da Linha (px)
                      </label>
                      <input
                        type="number"
                        value={signature.lineWidth || 200}
                        onChange={(e) =>
                          handleUpdateSignature(signature.id, {
                            lineWidth: parseInt(e.target.value) || 200,
                          })
                        }
                        className="w-full px-2 py-1.5 text-sm border rounded focus:ring-2 focus:ring-blue-500"
                        min="100"
                        max="400"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">
                        🎨 Cor da Linha
                      </label>
                      <input
                        type="color"
                        value={signature.lineColor || '#000000'}
                        onChange={(e) =>
                          handleUpdateSignature(signature.id, { lineColor: e.target.value })
                        }
                        className="w-full h-9 border rounded cursor-pointer"
                      />
                    </div>
                  </div>

                  <div className="mt-3">
                    <label className="flex items-center gap-2 text-xs text-gray-600 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={signature.showDate !== false}
                        onChange={(e) =>
                          handleUpdateSignature(signature.id, { showDate: e.target.checked })
                        }
                        className="rounded"
                      />
                      📅 Mostrar data na linha de assinatura
                    </label>
                  </div>
                </details>
              </div>

              {/* Preview mini da assinatura */}
              <div className="mt-4 pt-4 border-t">
                <div className="text-xs text-gray-500 mb-2">Preview:</div>
                <div className={`flex flex-col ${getAlignmentClass(signature.align)}`}>
                  <div
                    className="border-t-2 mb-2"
                    style={{
                      width: signature.lineWidth || 200,
                      borderColor: signature.lineColor || '#000000',
                    }}
                  />
                  <div style={{ width: signature.lineWidth || 200, textAlign: 'center' }}>
                    <div className="text-xs text-gray-600">{signature.description}</div>
                    <div className="text-xs font-medium text-gray-800">{signature.responsibleName}</div>
                    {signature.showDate !== false && (
                      <div className="text-xs text-gray-500 mt-1">___/___/______</div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Modo de visualização (não editável)
  return (
    <div className="signature-container flex justify-between items-start gap-8 py-4" style={style}>
      {config.signatures.map((signature) => (
        <div
          key={signature.id}
          className={`signature-field flex flex-col ${getAlignmentClass(signature.align)} flex-1`}
        >
          {/* Linha de assinatura */}
          <div
            className="signature-line border-t-2 mb-2"
            style={{
              width: signature.lineWidth || 200,
              borderColor: signature.lineColor || '#000000',
            }}
          />
          
          {/* Container dos textos - sempre centralizado em relação à linha */}
          <div className="signature-texts" style={{ width: signature.lineWidth || 200, textAlign: 'center' }}>
            {/* Descrição */}
            <div className="signature-description text-sm text-gray-700 font-medium mb-1">
              {signature.description}
            </div>
            
            {/* Nome do responsável */}
            <div className="signature-name text-sm text-gray-900 font-semibold">
              {signature.responsibleName}
            </div>
            
            {/* Data (se habilitada) */}
            {signature.showDate !== false && (
              <div className="signature-date text-xs text-gray-500 mt-2">
                ___/___/______
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

