import React, { useState, useRef } from 'react';
import { Form, FormField, ProcessingRule } from '../../types';

interface SmartTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  form?: Form;
  placeholder?: string;
  minHeight?: string;
  className?: string;
  inline?: boolean;
}

interface Suggestion {
  type: '@' | '#';
  key: string;
  label: string;
  description?: string;
}

export const SmartTextEditor: React.FC<SmartTextEditorProps> = ({
  value,
  onChange,
  form,
  placeholder = 'Digite aqui... Use @ para cadastros e # para campos do formulário',
  minHeight = '100px',
  className = '',
  inline = false,
}) => {
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [triggerChar, setTriggerChar] = useState<'@' | '#' | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Sugestões para @ (cadastros)
  const cadastroSuggestions: Suggestion[] = [
    { type: '@', key: 'project.name', label: 'Nome da Obra', description: 'Nome do projeto/obra' },
    { type: '@', key: 'project.code', label: 'Código da Obra', description: 'Código/identificador do projeto' },
    { type: '@', key: 'project.client', label: 'Nome do Cliente', description: 'Nome do cliente da obra' },
    { type: '@', key: 'project.address', label: 'Endereço da Obra', description: 'Endereço do projeto' },
    { type: '@', key: 'company.name', label: 'Nome da Empresa', description: 'Nome da empresa responsável' },
    { type: '@', key: 'company.cnpj', label: 'CNPJ da Empresa', description: 'CNPJ da empresa' },
    { type: '@', key: 'submittedBy.name', label: 'Nome do Usuário', description: 'Usuário que preencheu o formulário' },
    { type: '@', key: 'submittedBy.email', label: 'Email do Usuário', description: 'Email do usuário' },
    { type: '@', key: 'currentUser.name', label: 'Usuário Atual', description: 'Usuário que está gerando o relatório' },
    { type: '@', key: 'currentDate', label: 'Data Atual', description: 'Data de hoje' },
    { type: '@', key: 'currentDateTime', label: 'Data e Hora Atual', description: 'Data e hora atuais' },
    { type: '@', key: 'submittedAt', label: 'Data da Submissão', description: 'Data/hora da submissão do formulário' },
  ];

  // Sugestões para # (campos do formulário)
  const getCampoSuggestions = (): Suggestion[] => {
    if (!form) return [];

    const fieldSuggestions: Suggestion[] = (form.fields || []).map(field => ({
      type: '#',
      key: `field.${field.fieldKey}`,
      label: field.label,
      description: `Campo: ${field.type}`,
    }));

    const ruleSuggestions: Suggestion[] = (form.rules || []).map(rule => ({
      type: '#',
      key: `calc.${rule.ruleKey}`,
      label: rule.name,
      description: `Cálculo: ${rule.formula}`,
    }));

    return [
      { type: '#', key: 'form.title', label: 'Título do Formulário', description: 'Nome do formulário' },
      ...fieldSuggestions,
      ...ruleSuggestions,
    ];
  };

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value;
    const cursorPos = e.target.selectionStart;
    
    onChange(newValue);

    // Verificar se digitou @ ou #
    const textBeforeCursor = newValue.substring(0, cursorPos);
    const lastAtIndex = textBeforeCursor.lastIndexOf('@');
    const lastHashIndex = textBeforeCursor.lastIndexOf('#');

    // Determinar qual gatilho usar (o mais recente)
    let trigger: '@' | '#' | null = null;
    let triggerIndex = -1;

    if (lastAtIndex > lastHashIndex && lastAtIndex !== -1) {
      trigger = '@';
      triggerIndex = lastAtIndex;
    } else if (lastHashIndex !== -1) {
      trigger = '#';
      triggerIndex = lastHashIndex;
    }

    console.log('Trigger detectado:', trigger, 'no índice:', triggerIndex);

    if (trigger && triggerIndex !== -1) {
      // Verificar se há espaço entre o trigger e o cursor
      const textAfterTrigger = textBeforeCursor.substring(triggerIndex + 1);
      
      if (!textAfterTrigger.includes(' ') && !textAfterTrigger.includes('\n')) {
        setTriggerChar(trigger);
        
        // Filtrar sugestões
        const allSuggestions = trigger === '@' ? cadastroSuggestions : getCampoSuggestions();
        const searchTerm = textAfterTrigger.toLowerCase();
        const filtered = allSuggestions.filter(s =>
          s.label.toLowerCase().includes(searchTerm) ||
          s.key.toLowerCase().includes(searchTerm)
        );
        
        console.log('Sugestões filtradas:', filtered.length);
        
        setSuggestions(filtered);
        setShowSuggestions(filtered.length > 0);
        setSelectedIndex(0);
        return;
      }
    }

    // Fechar sugestões
    setShowSuggestions(false);
    setTriggerChar(null);
  };

  const insertSuggestion = (suggestion: Suggestion) => {
    if (!textareaRef.current || !triggerChar) return;

    const textarea = textareaRef.current;
    const text = textarea.value;
    const cursorPos = textarea.selectionStart;

    // Encontrar o índice do gatilho
    const textBeforeCursor = text.substring(0, cursorPos);
    const triggerIndex = triggerChar === '@' 
      ? textBeforeCursor.lastIndexOf('@')
      : textBeforeCursor.lastIndexOf('#');

    if (triggerIndex === -1) return;

    // Construir novo texto
    const before = text.substring(0, triggerIndex);
    const after = text.substring(cursorPos);
    const variable = `${triggerChar}{${suggestion.key}}`;
    const newText = before + variable + after;

    onChange(newText);
    setShowSuggestions(false);
    setTriggerChar(null);

    // Reposicionar cursor
    setTimeout(() => {
      const newCursorPos = triggerIndex + variable.length;
      textarea.setSelectionRange(newCursorPos, newCursorPos);
      textarea.focus();
    }, 0);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (!showSuggestions) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => Math.min(prev + 1, suggestions.length - 1));
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => Math.max(prev - 1, 0));
        break;
      case 'Enter':
      case 'Tab':
        if (suggestions.length > 0) {
          e.preventDefault();
          insertSuggestion(suggestions[selectedIndex]);
        }
        break;
      case 'Escape':
        e.preventDefault();
        setShowSuggestions(false);
        setTriggerChar(null);
        break;
    }
  };

  return (
    <div className={`relative ${className}`}>
      {/* Textarea */}
      <textarea
        ref={textareaRef}
        value={value}
        onChange={handleTextChange}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        className={`relative w-full px-3 py-2 border rounded-lg resize-y ${
          inline ? 'text-sm' : ''
        }`}
        style={{ 
          minHeight,
          fontFamily: 'monospace',
          zIndex: 1,
        }}
      />

      {/* Menu de sugestões - SEMPRE VISÍVEL quando showSuggestions = true */}
      {showSuggestions && suggestions.length > 0 && (
        <div
          className="absolute left-0 w-full bg-white border-2 border-blue-500 rounded-lg shadow-2xl max-h-64 overflow-y-auto"
          style={{
            top: '100%',
            marginTop: '4px',
            zIndex: 999999,
          }}
        >
          <div className="p-2">
            <div className="text-xs font-medium text-gray-500 mb-2 flex items-center gap-2">
              {triggerChar === '@' ? (
                <>
                  <span className="text-blue-600 text-lg">@</span>
                  <span>Dados de Cadastro</span>
                </>
              ) : (
                <>
                  <span className="text-green-600 text-lg">#</span>
                  <span>Campos do Formulário</span>
                </>
              )}
            </div>
            {suggestions.map((suggestion, index) => (
              <button
                key={suggestion.key}
                onClick={() => insertSuggestion(suggestion)}
                onMouseEnter={() => setSelectedIndex(index)}
                className={`w-full text-left px-3 py-2 rounded-md transition-colors ${
                  index === selectedIndex
                    ? 'bg-blue-100 border-2 border-blue-500'
                    : 'hover:bg-gray-50 border-2 border-transparent'
                }`}
              >
                <div className="flex items-start gap-2">
                  <span className={`text-xl ${triggerChar === '@' ? 'text-blue-600' : 'text-green-600'}`}>
                    {triggerChar}
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-sm text-gray-900 truncate">
                      {suggestion.label}
                    </div>
                    {suggestion.description && (
                      <div className="text-xs text-gray-500 truncate">
                        {suggestion.description}
                      </div>
                    )}
                    <div className="text-xs font-mono text-gray-400 truncate mt-1">
                      {triggerChar}{'{'}{suggestion.key}{'}'}
                    </div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Legenda (não mostrar no modo inline) */}
      {!inline && (
        <div className="mt-2 flex flex-wrap items-center gap-4 text-xs text-gray-500">
          <div className="flex items-center gap-1">
            <span className="text-blue-600 font-bold text-base">@</span>
            <span>dados de cadastro</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="text-green-600 font-bold text-base">#</span>
            <span>campos do formulário</span>
          </div>
          <div className="flex items-center gap-1">
            <kbd className="px-1.5 py-0.5 bg-gray-100 border rounded text-xs">↑↓</kbd>
            <span>navegar</span>
          </div>
          <div className="flex items-center gap-1">
            <kbd className="px-1.5 py-0.5 bg-gray-100 border rounded text-xs">Enter</kbd>
            <span>selecionar</span>
          </div>
        </div>
      )}
    </div>
  );
};
