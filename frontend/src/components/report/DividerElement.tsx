import React from 'react';
import { DividerElementConfig } from '../../types';

interface DividerElementProps {
  config: DividerElementConfig;
  style?: any;
  editable?: boolean;
  onChange?: (config: DividerElementConfig) => void;
}

export const DividerElement: React.FC<DividerElementProps> = ({
  config,
  style = {},
  editable = false,
  onChange,
}) => {
  const dividerStyle: React.CSSProperties = {
    height: config.thickness || 1,
    backgroundColor: config.color || '#e5e7eb',
    border: 'none',
    borderStyle: config.style || 'solid',
    ...style,
  };

  if (editable) {
    return (
      <div className="space-y-3">
        <div className="grid grid-cols-3 gap-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Espessura (px)
            </label>
            <input
              type="number"
              value={config.thickness || 1}
              onChange={(e) => onChange?.({ ...config, thickness: parseInt(e.target.value) })}
              className="w-full px-3 py-2 border rounded-lg"
              min="1"
              max="10"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Estilo
            </label>
            <select
              value={config.style || 'solid'}
              onChange={(e) => onChange?.({ ...config, style: e.target.value as any })}
              className="w-full px-3 py-2 border rounded-lg"
            >
              <option value="solid">Sólido</option>
              <option value="dashed">Tracejado</option>
              <option value="dotted">Pontilhado</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Cor
            </label>
            <input
              type="color"
              value={config.color || '#e5e7eb'}
              onChange={(e) => onChange?.({ ...config, color: e.target.value })}
              className="w-full h-10 border rounded-lg cursor-pointer"
            />
          </div>
        </div>

        <div className="border rounded-lg p-4 bg-gray-50">
          <p className="text-sm font-medium text-gray-700 mb-2">Preview:</p>
          <hr style={dividerStyle} />
        </div>
      </div>
    );
  }

  return <hr style={dividerStyle} />;
};





