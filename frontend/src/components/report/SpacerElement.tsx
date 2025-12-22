import React from 'react';
import { SpacerElementConfig } from '../../types';

interface SpacerElementProps {
  config: SpacerElementConfig;
  style?: any;
  editable?: boolean;
  onChange?: (config: SpacerElementConfig) => void;
}

export const SpacerElement: React.FC<SpacerElementProps> = ({
  config,
  style = {},
  editable = false,
  onChange,
}) => {
  const spacerStyle: React.CSSProperties = {
    height: config.height || 20,
    ...style,
  };

  if (editable) {
    return (
      <div className="space-y-3">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Altura do Espaçamento (px)
          </label>
          <input
            type="number"
            value={config.height || 20}
            onChange={(e) => onChange?.({ ...config, height: parseInt(e.target.value) })}
            className="w-full px-3 py-2 border rounded-lg"
            min="10"
            max="200"
            step="10"
          />
        </div>

        <div className="border rounded-lg p-4 bg-gray-50">
          <p className="text-sm font-medium text-gray-700 mb-2">Preview:</p>
          <div className="border-l-2 border-dashed border-blue-300" style={spacerStyle}></div>
        </div>
      </div>
    );
  }

  return <div style={spacerStyle}></div>;
};





