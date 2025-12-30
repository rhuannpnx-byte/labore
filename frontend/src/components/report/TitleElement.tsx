import React from 'react';
import { TextElementConfig, Form } from '../../types';
import { SmartTextEditor } from './SmartTextEditor';

interface TitleElementProps {
  config: TextElementConfig;
  style?: any;
  editable?: boolean;
  onChange?: (config: TextElementConfig) => void;
  form?: Form;
}

export const TitleElement: React.FC<TitleElementProps> = ({
  config,
  style = {},
  editable = false,
  onChange,
  form,
}) => {
  const textStyle: React.CSSProperties = {
    fontSize: config.fontSize || 24,
    fontWeight: config.fontWeight || 'bold',
    color: config.color || '#000000',
    textAlign: config.align || 'center',
    fontStyle: config.italic ? 'italic' : 'normal',
    textDecoration: config.underline ? 'underline' : 'none',
    lineHeight: config.lineHeight || 'normal',
    letterSpacing: config.letterSpacing || '0',
    padding: config.padding || '0',
    textTransform: config.uppercase ? 'uppercase' : 'none',
    ...style,
  };

  if (editable) {
    return (
      <div className="space-y-4">
        {/* Editor de texto */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Conteúdo do Texto
          </label>
          <SmartTextEditor
            value={config.content}
            onChange={(content) => onChange?.({ ...config, content })}
            form={form}
            minHeight="120px"
          />
        </div>

        {/* Controles de estilo */}
        <div className="border-t pt-4">
          <h4 className="text-sm font-semibold text-gray-700 mb-3">⚙️ Configurações de Estilo</h4>
          
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-3">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                📏 Tamanho da Fonte
              </label>
              <div className="flex gap-2">
                <input
                  type="number"
                  value={config.fontSize || 24}
                  onChange={(e) => onChange?.({ ...config, fontSize: parseInt(e.target.value) || 24 })}
                  className="w-full px-2 py-1.5 text-sm border rounded focus:ring-2 focus:ring-blue-500"
                  min="8"
                  max="72"
                />
                <span className="flex items-center text-xs text-gray-500">px</span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                💪 Peso da Fonte
              </label>
              <select
                value={config.fontWeight || 'bold'}
                onChange={(e) => onChange?.({ ...config, fontWeight: e.target.value as any })}
                className="w-full px-2 py-1.5 text-sm border rounded focus:ring-2 focus:ring-blue-500"
              >
                <option value="300">Leve (300)</option>
                <option value="normal">Normal (400)</option>
                <option value="500">Médio (500)</option>
                <option value="600">Semi-Negrito (600)</option>
                <option value="bold">Negrito (700)</option>
                <option value="800">Extra-Negrito (800)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                📐 Alinhamento
              </label>
              <select
                value={config.align || 'center'}
                onChange={(e) => onChange?.({ ...config, align: e.target.value as any })}
                className="w-full px-2 py-1.5 text-sm border rounded focus:ring-2 focus:ring-blue-500"
              >
                <option value="left">⬅️ Esquerda</option>
                <option value="center">⬆️ Centro</option>
                <option value="right">➡️ Direita</option>
                <option value="justify">↔️ Justificado</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-3">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                🎨 Cor do Texto
              </label>
              <div className="flex gap-2">
                <input
                  type="color"
                  value={config.color || '#000000'}
                  onChange={(e) => onChange?.({ ...config, color: e.target.value })}
                  className="w-12 h-9 border rounded cursor-pointer"
                />
                <input
                  type="text"
                  value={config.color || '#000000'}
                  onChange={(e) => onChange?.({ ...config, color: e.target.value })}
                  className="flex-1 px-2 py-1.5 text-xs border rounded uppercase font-mono"
                  placeholder="#000000"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                📏 Altura da Linha
              </label>
              <select
                value={config.lineHeight || 'normal'}
                onChange={(e) => onChange?.({ ...config, lineHeight: e.target.value })}
                className="w-full px-2 py-1.5 text-sm border rounded focus:ring-2 focus:ring-blue-500"
              >
                <option value="1">Compacta (1.0)</option>
                <option value="1.25">Confortável (1.25)</option>
                <option value="normal">Normal (1.5)</option>
                <option value="1.75">Espaçada (1.75)</option>
                <option value="2">Dupla (2.0)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                📊 Espaçamento Letras
              </label>
              <input
                type="number"
                value={parseFloat(String(config.letterSpacing || '0'))}
                onChange={(e) => onChange?.({ ...config, letterSpacing: e.target.value + 'px' })}
                className="w-full px-2 py-1.5 text-sm border rounded focus:ring-2 focus:ring-blue-500"
                min="-2"
                max="10"
                step="0.5"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                📦 Padding (interno)
              </label>
              <input
                type="number"
                value={parseInt(String(config.padding || '0'))}
                onChange={(e) => onChange?.({ ...config, padding: e.target.value + 'px' })}
                className="w-full px-2 py-1.5 text-sm border rounded focus:ring-2 focus:ring-blue-500"
                min="0"
                max="50"
              />
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={config.italic || false}
                onChange={(e) => onChange?.({ ...config, italic: e.target.checked })}
                className="rounded w-4 h-4"
              />
              <span className="text-sm italic">Itálico</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={config.underline || false}
                onChange={(e) => onChange?.({ ...config, underline: e.target.checked })}
                className="rounded w-4 h-4"
              />
              <span className="text-sm underline">Sublinhado</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={config.uppercase || false}
                onChange={(e) => onChange?.({ ...config, uppercase: e.target.checked })}
                className="rounded w-4 h-4"
              />
              <span className="text-sm uppercase">MAIÚSCULAS</span>
            </label>
          </div>
        </div>

        {/* Preview em tempo real */}
        {config.content && (
          <div className="border-t pt-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              👁️ Preview em Tempo Real
            </label>
            <div 
              className="p-4 bg-white border rounded-lg whitespace-pre-wrap"
              style={textStyle}
            >
              {config.content}
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div style={textStyle} className="whitespace-pre-wrap">
      {config.content}
    </div>
  );
};

