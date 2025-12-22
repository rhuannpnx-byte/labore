/**
 * Componente para visualizar e gerenciar submissions pendentes
 * Útil para debug e administração
 */

import { useState, useEffect } from 'react';
import { Trash2, RefreshCw, Clock, AlertCircle, ChevronDown, ChevronUp } from 'lucide-react';
import { offlineDB, type PendingSubmission } from '../services/offline';
import { syncService } from '../services/sync';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Button } from './ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/Card';
import { Badge } from './ui/Badge';

export default function PendingSubmissionsList() {
  const [pending, setPending] = useState<PendingSubmission[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    loadPending();

    // Recarrega quando sincronizar
    const unsubscribe = syncService.addListener((event) => {
      if (event.type === 'sync-completed' || event.type === 'submission-synced') {
        loadPending();
      }
    });

    return unsubscribe;
  }, []);

  const loadPending = async () => {
    try {
      const submissions = await offlineDB.getPendingSubmissions();
      setPending(submissions);
    } catch (error) {
      console.error('Erro ao carregar pendentes:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSync = async () => {
    setSyncing(true);
    try {
      await syncService.forcSync();
    } finally {
      setSyncing(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja remover esta submission pendente?')) {
      return;
    }

    try {
      await offlineDB.removePendingSubmission(id);
      await loadPending();
    } catch (error) {
      alert('Erro ao remover submission');
      console.error(error);
    }
  };

  const toggleExpanded = (id: string) => {
    const newExpanded = new Set(expandedIds);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedIds(newExpanded);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <RefreshCw size={32} className="text-blue-600 animate-spin mx-auto mb-3" />
          <p className="text-sm text-gray-600">Carregando...</p>
        </div>
      </div>
    );
  }

  if (pending.length === 0) {
    return (
      <Card>
        <CardContent className="text-center py-12">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Clock size={32} className="text-green-600" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">✅ Tudo Sincronizado!</h2>
          <p className="text-gray-600">
            Não há submissions pendentes no momento.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Submissions Pendentes</h1>
          <p className="text-sm text-gray-600 mt-1">
            {pending.length} {pending.length === 1 ? 'submission aguardando' : 'submissions aguardando'} sincronização
          </p>
        </div>
        
        <Button
          onClick={handleSync}
          disabled={syncing || !navigator.onLine}
          variant="primary"
          icon={<RefreshCw size={18} className={syncing ? 'animate-spin' : ''} />}
        >
          {syncing ? 'Sincronizando...' : 'Sincronizar Agora'}
        </Button>
      </div>

      {/* Alert offline */}
      {!navigator.onLine && (
        <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-yellow-800">
              Você está offline. A sincronização será feita automaticamente quando a conexão for restabelecida.
            </p>
          </div>
        </div>
      )}

      {/* Lista de pendentes */}
      <div className="space-y-3">
        {pending.map((submission) => {
          const isExpanded = expandedIds.has(submission.id);
          
          return (
            <Card key={submission.id}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    {/* Header da submission */}
                    <div className="flex items-center gap-2 mb-2">
                      <Clock size={16} className="text-yellow-600 flex-shrink-0" />
                      <span className="font-medium text-gray-900">
                        Submission #{submission.id.slice(-8)}
                      </span>
                      
                      {submission.attempts > 0 && (
                        <Badge 
                          variant={submission.attempts >= 3 ? 'danger' : 'warning'}
                          size="sm"
                        >
                          {submission.attempts} {submission.attempts === 1 ? 'tentativa' : 'tentativas'}
                        </Badge>
                      )}
                    </div>

                    {/* Informações */}
                    <div className="space-y-1 text-sm text-gray-600">
                      <div>
                        <strong className="text-gray-700">Form ID:</strong> {submission.formId}
                      </div>
                      <div>
                        <strong className="text-gray-700">Criado em:</strong>{' '}
                        {format(new Date(submission.timestamp), "dd 'de' MMMM 'às' HH:mm", { locale: ptBR })}
                      </div>
                      <div>
                        <strong className="text-gray-700">Respostas:</strong> {submission.data.responses.length} campo(s)
                      </div>
                    </div>

                    {/* Erro */}
                    {submission.lastError && (
                      <div className="mt-3 p-2 bg-red-50 border border-red-200 rounded text-xs text-red-700">
                        <strong>Último erro:</strong> {submission.lastError}
                      </div>
                    )}

                    {/* Detalhes expansíveis */}
                    <button
                      onClick={() => toggleExpanded(submission.id)}
                      className="mt-3 flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700 font-medium"
                    >
                      {isExpanded ? (
                        <>
                          <ChevronUp size={16} />
                          Ocultar respostas
                        </>
                      ) : (
                        <>
                          <ChevronDown size={16} />
                          Ver respostas
                        </>
                      )}
                    </button>

                    {isExpanded && (
                      <div className="mt-3 space-y-2">
                        {submission.data.responses.map((response, idx) => (
                          <div
                            key={idx}
                            className="p-2 bg-gray-50 border border-gray-200 rounded text-sm"
                          >
                            <strong className="text-gray-700">Campo {response.fieldId}:</strong>{' '}
                            <span className="text-gray-600">{response.value}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Botão de remover */}
                  <Button
                    onClick={() => handleDelete(submission.id)}
                    variant="ghost"
                    size="sm"
                    icon={<Trash2 size={16} />}
                    title="Remover"
                  />
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
