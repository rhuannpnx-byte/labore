import React from 'react';
import { ImageElementConfig, Form } from '../../types';
import { SmartTextEditor } from './SmartTextEditor';

interface ImageElementProps {
  config: ImageElementConfig;
  style?: any;
  editable?: boolean;
  onChange?: (config: ImageElementConfig) => void;
  form?: Form;
}

export const ImageElement: React.FC<ImageElementProps> = ({
  config,
  style = {},
  editable = false,
  onChange,
  form,
}) => {
  const imageStyle: React.CSSProperties = {
    width: config.width || 'auto',
    height: config.height || 'auto',
    objectFit: config.objectFit || 'contain',
    maxWidth: '100%',
    ...style,
  };

  if (editable) {
    return (
      <div className="space-y-3">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            URL da Imagem (use @ ou # para dados dinâmicos)
          </label>
          <SmartTextEditor
            value={config.url}
            onChange={(url) => onChange?.({ ...config, url })}
            form={form}
            placeholder="URL ou #{field.imagem_url}"
            minHeight="38px"
            inline={true}
          />
          <p className="text-xs text-gray-500 mt-1">
            💡 Pode usar uma URL fixa ou vincular com um campo que contenha a URL
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Texto Alternativo (use @ ou #)
          </label>
          <SmartTextEditor
            value={config.alt || ''}
            onChange={(alt) => onChange?.({ ...config, alt })}
            form={form}
            placeholder="Ex: Foto da obra @{project.name}"
            minHeight="38px"
            inline={true}
          />
        </div>

        <div className="grid grid-cols-3 gap-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Largura (px)
            </label>
            <input
              type="number"
              value={config.width || ''}
              onChange={(e) => onChange?.({ ...config, width: e.target.value ? parseInt(e.target.value) : undefined })}
              className="w-full px-3 py-2 border rounded-lg"
              placeholder="Auto"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Altura (px)
            </label>
            <input
              type="number"
              value={config.height || ''}
              onChange={(e) => onChange?.({ ...config, height: e.target.value ? parseInt(e.target.value) : undefined })}
              className="w-full px-3 py-2 border rounded-lg"
              placeholder="Auto"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Ajuste
            </label>
            <select
              value={config.objectFit || 'contain'}
              onChange={(e) => onChange?.({ ...config, objectFit: e.target.value as any })}
              className="w-full px-3 py-2 border rounded-lg"
            >
              <option value="contain">Conter</option>
              <option value="cover">Cobrir</option>
              <option value="fill">Preencher</option>
              <option value="none">Nenhum</option>
            </select>
          </div>
        </div>

        {config.url && (
          <div className="border rounded-lg p-4 bg-gray-50">
            <p className="text-sm font-medium text-gray-700 mb-2">Preview:</p>
            <div className="flex justify-center">
              <img
                src={config.url}
                alt={config.alt || 'Preview'}
                style={imageStyle}
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = 'none';
                }}
              />
            </div>
          </div>
        )}
      </div>
    );
  }

  if (!config.url) {
    return (
      <div className="text-center text-gray-500 py-8">
        Nenhuma imagem configurada
      </div>
    );
  }

  return (
    <img
      src={config.url}
      alt={config.alt || ''}
      style={imageStyle}
    />
  );
};

