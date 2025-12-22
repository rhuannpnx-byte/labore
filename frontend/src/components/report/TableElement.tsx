import React, { useState } from 'react';
import { TableElementConfig, TableColumn, TableRow, TableCell, Form } from '../../types';
import { Button } from '../ui/Button';
import { SmartTextEditor } from './SmartTextEditor';

interface TableElementProps {
  config: TableElementConfig;
  style?: any;
  editable?: boolean;
  onChange?: (config: TableElementConfig) => void;
  form?: Form;
}

export const TableElement: React.FC<TableElementProps> = ({
  config,
  style = {},
  editable = false,
  onChange,
  form,
}) => {
  const [editingCell, setEditingCell] = useState<{ rowIndex: number; cellIndex: number } | null>(null);

  const addColumn = () => {
    const newColumn: TableColumn = {
      id: `col_${Date.now()}`,
      label: `Coluna ${(config.columns?.length || 0) + 1}`,
      key: `col${(config.columns?.length || 0) + 1}`,
      width: '100px',
      align: 'left',
    };

    const updatedRows = (config.rows || []).map(row => ({
      ...row,
      cells: [
        ...row.cells,
        {
          id: `cell_${Date.now()}_${Math.random()}`,
          value: '',
          binding: undefined,
        },
      ],
    }));

    onChange?.({
      ...config,
      columns: [...(config.columns || []), newColumn],
      rows: updatedRows,
    });
  };

  const addRow = () => {
    const newRow: TableRow = {
      id: `row_${Date.now()}`,
      cells: (config.columns || []).map(() => ({
        id: `cell_${Date.now()}_${Math.random()}`,
        value: '',
        binding: undefined,
      })),
    };

    onChange?.({
      ...config,
      rows: [...(config.rows || []), newRow],
    });
  };

  const updateColumnLabel = (columnIndex: number, label: string) => {
    const updatedColumns = [...(config.columns || [])];
    updatedColumns[columnIndex] = { ...updatedColumns[columnIndex], label };
    onChange?.({ ...config, columns: updatedColumns });
  };

  const updateCellValue = (rowIndex: number, cellIndex: number, value: string) => {
    const updatedRows = [...(config.rows || [])];
    updatedRows[rowIndex].cells[cellIndex] = {
      ...updatedRows[rowIndex].cells[cellIndex],
      value,
    };
    onChange?.({ ...config, rows: updatedRows });
  };

  const deleteColumn = (columnIndex: number) => {
    const updatedColumns = (config.columns || []).filter((_, i) => i !== columnIndex);
    const updatedRows = (config.rows || []).map(row => ({
      ...row,
      cells: row.cells.filter((_, i) => i !== columnIndex),
    }));
    onChange?.({ ...config, columns: updatedColumns, rows: updatedRows });
  };

  const deleteRow = (rowIndex: number) => {
    const updatedRows = (config.rows || []).filter((_, i) => i !== rowIndex);
    onChange?.({ ...config, rows: updatedRows });
  };

  const tableStyle: React.CSSProperties = {
    width: '100%',
    borderCollapse: 'collapse',
    ...style,
  };

  const headerStyle: React.CSSProperties = {
    backgroundColor: config.headerBackground || '#f3f4f6',
    color: config.headerColor || '#111827',
    padding: config.cellPadding || '12px',
    textAlign: 'left',
    fontWeight: 'bold',
    border: config.showBorders !== false ? '1px solid #e5e7eb' : 'none',
    fontSize: config.headerFontSize || 14,
    height: config.headerHeight || 40,
  };

  const cellStyle: React.CSSProperties = {
    padding: config.cellPadding || '12px',
    border: config.showBorders !== false ? '1px solid #e5e7eb' : 'none',
    fontSize: config.cellFontSize || 12,
    height: config.cellHeight || 35,
  };

  if (editable) {
    return (
      <div className="space-y-4">
        {/* Controles de estilo */}
        <div className="border rounded-lg p-4 bg-gray-50">
          <h4 className="text-sm font-semibold text-gray-700 mb-3">⚙️ Configurações de Estilo</h4>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-3">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                📏 Fonte do Cabeçalho
              </label>
              <input
                type="number"
                value={config.headerFontSize || 14}
                onChange={(e) => onChange?.({ ...config, headerFontSize: parseInt(e.target.value) || 14 })}
                className="w-full px-2 py-1.5 text-sm border rounded"
                min="8"
                max="24"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                📐 Altura do Cabeçalho
              </label>
              <input
                type="number"
                value={config.headerHeight || 40}
                onChange={(e) => onChange?.({ ...config, headerHeight: parseInt(e.target.value) || 40 })}
                className="w-full px-2 py-1.5 text-sm border rounded"
                min="20"
                max="100"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                📏 Fonte das Células
              </label>
              <input
                type="number"
                value={config.cellFontSize || 12}
                onChange={(e) => onChange?.({ ...config, cellFontSize: parseInt(e.target.value) || 12 })}
                className="w-full px-2 py-1.5 text-sm border rounded"
                min="8"
                max="20"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                📐 Altura das Células
              </label>
              <input
                type="number"
                value={config.cellHeight || 35}
                onChange={(e) => onChange?.({ ...config, cellHeight: parseInt(e.target.value) || 35 })}
                className="w-full px-2 py-1.5 text-sm border rounded"
                min="20"
                max="80"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                🎨 Cor do Cabeçalho
              </label>
              <input
                type="color"
                value={config.headerBackground || '#f3f4f6'}
                onChange={(e) => onChange?.({ ...config, headerBackground: e.target.value })}
                className="w-full h-9 border rounded cursor-pointer"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                🎨 Cor do Texto (Cabeçalho)
              </label>
              <input
                type="color"
                value={config.headerColor || '#111827'}
                onChange={(e) => onChange?.({ ...config, headerColor: e.target.value })}
                className="w-full h-9 border rounded cursor-pointer"
              />
            </div>

            <div>
              <label className="flex items-center gap-2 cursor-pointer mt-5">
                <input
                  type="checkbox"
                  checked={config.alternateRows !== false}
                  onChange={(e) => onChange?.({ ...config, alternateRows: e.target.checked })}
                  className="rounded w-4 h-4"
                />
                <span className="text-sm">Linhas Alternadas</span>
              </label>
            </div>
          </div>
        </div>

        {/* Controles de estrutura */}
        <div className="flex gap-2">
          <Button onClick={addColumn} size="sm" variant="outline">
            + Adicionar Coluna
          </Button>
          <Button onClick={addRow} size="sm" variant="outline">
            + Adicionar Linha
          </Button>
        </div>

        <div className="overflow-x-auto">
          <table style={tableStyle} className="min-w-full">
            <thead>
              <tr>
                {(config.columns || []).map((column, columnIndex) => (
                  <th key={column.id} style={headerStyle}>
                    <div className="flex items-center justify-between gap-2">
                      <input
                        type="text"
                        value={column.label}
                        onChange={(e) => updateColumnLabel(columnIndex, e.target.value)}
                        className="flex-1 bg-transparent border-none focus:outline-none font-bold"
                        placeholder="Nome da coluna"
                      />
                      <button
                        onClick={() => deleteColumn(columnIndex)}
                        className="text-red-600 hover:text-red-800"
                        title="Deletar coluna"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  </th>
                ))}
                <th style={headerStyle} className="w-12"></th>
              </tr>
            </thead>
            <tbody>
              {(config.rows || []).map((row, rowIndex) => (
                <tr 
                  key={row.id}
                  className={config.alternateRows && rowIndex % 2 === 1 ? 'bg-gray-50' : ''}
                >
                  {row.cells.map((cell, cellIndex) => (
                    <td key={cell.id} style={cellStyle}>
                      <SmartTextEditor
                        value={cell.value}
                        onChange={(value) => updateCellValue(rowIndex, cellIndex, value)}
                        form={form}
                        placeholder="@ # ou valor"
                        minHeight="38px"
                        className="text-sm"
                        inline={true}
                      />
                    </td>
                  ))}
                  <td style={cellStyle}>
                    <button
                      onClick={() => deleteRow(rowIndex)}
                      className="text-red-600 hover:text-red-800"
                      title="Deletar linha"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={config.showBorders !== false}
              onChange={(e) => onChange?.({ ...config, showBorders: e.target.checked })}
              className="rounded"
            />
            <span className="text-sm">Mostrar bordas</span>
          </label>

          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={config.alternateRows || false}
              onChange={(e) => onChange?.({ ...config, alternateRows: e.target.checked })}
              className="rounded"
            />
            <span className="text-sm">Linhas alternadas</span>
          </label>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Cor do cabeçalho
            </label>
            <input
              type="color"
              value={config.headerBackground || '#f3f4f6'}
              onChange={(e) => onChange?.({ ...config, headerBackground: e.target.value })}
              className="w-full h-10 border rounded-lg cursor-pointer"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Cor do texto do cabeçalho
            </label>
            <input
              type="color"
              value={config.headerColor || '#111827'}
              onChange={(e) => onChange?.({ ...config, headerColor: e.target.value })}
              className="w-full h-10 border rounded-lg cursor-pointer"
            />
          </div>
        </div>
      </div>
    );
  }

  // Modo visualização
  return (
    <div className="overflow-x-auto">
      <table style={tableStyle}>
        <thead>
          <tr>
            {(config.columns || []).map((column) => (
              <th
                key={column.id}
                style={{
                  ...headerStyle,
                  textAlign: column.align || 'left',
                  width: column.width,
                }}
              >
                {column.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {(config.rows || []).map((row, rowIndex) => (
            <tr
              key={row.id}
              className={config.alternateRows && rowIndex % 2 === 1 ? 'bg-gray-50' : ''}
            >
              {row.cells.map((cell, cellIndex) => (
                <td
                  key={cell.id}
                  style={{
                    ...cellStyle,
                    textAlign: config.columns?.[cellIndex]?.align || 'left',
                    ...cell.style,
                  }}
                >
                  {cell.value}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

