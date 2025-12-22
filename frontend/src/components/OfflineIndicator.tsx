/**
 * Componente visual que mostra:
 * - Status de conexão (online/offline)
 * - Número de submissions pendentes
 * - Progresso de sincronização
 */

import { WifiOff, Wifi, RefreshCw, AlertCircle } from 'lucide-react';
import { useOnlineStatus } from '../hooks/useOnlineStatus';
import { useSyncStatus } from '../hooks/useSyncStatus';
import { syncService } from '../services/sync';

export default function OfflineIndicator() {
  const isOnline = useOnlineStatus();
  const { isSyncing, pendingCount, lastError } = useSyncStatus();

  // Se está online e não há nada pendente, não mostra nada
  if (isOnline && pendingCount === 0 && !isSyncing) {
    return null;
  }

  const handleForceSync = () => {
    syncService.forcSync();
  };

  return (
    <div className="fixed bottom-5 right-5 z-50 min-w-[280px] max-w-md print:hidden">
      {/* Indicador de status principal */}
      <div
        className={`rounded-lg shadow-lg border-l-4 ${
          isOnline
            ? isSyncing
              ? 'bg-white dark:bg-gray-800 border-blue-600 dark:border-blue-500'
              : pendingCount > 0
              ? 'bg-white dark:bg-gray-800 border-yellow-500'
              : 'bg-white dark:bg-gray-800 border-green-600 dark:border-green-500'
            : 'bg-yellow-500 dark:bg-yellow-600 border-red-600 dark:border-red-500'
        }`}
      >
        <div className="p-3">
          {/* Header */}
          <div className={`flex items-center gap-2 ${pendingCount > 0 || isSyncing ? 'mb-2' : ''}`}>
            {/* Ícone de status */}
            {isOnline ? (
              <Wifi size={18} className="text-green-600 dark:text-green-500" />
            ) : (
              <WifiOff size={18} className="text-white" />
            )}

            {/* Texto de status */}
            <span className={`flex-1 text-sm font-medium ${isOnline ? 'text-gray-900 dark:text-gray-100' : 'text-white'}`}>
              {isOnline ? 'Online' : 'Modo Offline'}
            </span>

            {/* Badge de count */}
            {pendingCount > 0 && (
              <span className="px-2 py-0.5 bg-yellow-500 text-white rounded-full text-xs font-semibold">
                {pendingCount}
              </span>
            )}
          </div>

          {/* Mensagem de submissions pendentes */}
          {pendingCount > 0 && !isSyncing && (
            <div className="flex items-center justify-between gap-2 pt-2 border-t border-gray-200 dark:border-gray-700">
              <span className={`text-xs ${isOnline ? 'text-gray-600 dark:text-gray-400' : 'text-white'}`}>
                {pendingCount === 1
                  ? '1 formulário pendente'
                  : `${pendingCount} formulários pendentes`}
              </span>

              {isOnline && (
                <button
                  onClick={handleForceSync}
                  className="px-2 py-1 bg-blue-600 dark:bg-blue-500 text-white rounded text-xs font-medium hover:bg-blue-700 dark:hover:bg-blue-600 flex items-center gap-1 transition-colors"
                  title="Sincronizar agora"
                >
                  <RefreshCw size={12} />
                  Sync
                </button>
              )}
            </div>
          )}

          {/* Indicador de sincronização */}
          {isSyncing && (
            <div className="flex items-center gap-2 pt-2 border-t border-gray-200 dark:border-gray-700">
              <RefreshCw size={16} className="text-blue-600 dark:text-blue-400 animate-spin" />
              <span className="text-xs text-gray-600 dark:text-gray-400">Sincronizando...</span>
            </div>
          )}

          {/* Mensagem de erro */}
          {lastError && !isSyncing && (
            <div className="flex items-start gap-2 mt-2 p-2 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded">
              <AlertCircle size={16} className="text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
              <span className="text-xs text-red-700 dark:text-red-300">{lastError}</span>
            </div>
          )}

          {/* Mensagem offline */}
          {!isOnline && (
            <div className="pt-2 border-t border-white/20">
              <p className="text-xs text-white/90">
                Você pode continuar preenchendo formulários. Eles serão
                sincronizados quando a conexão for restabelecida.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
