/**
 * Hook React para monitorar status de sincronização
 */

import { useState, useEffect } from 'react';
import { syncService, type SyncEvent } from '../services/sync';

export interface SyncStatus {
  isSyncing: boolean;
  pendingCount: number;
  lastError?: string;
}

export function useSyncStatus(): SyncStatus {
  const [status, setStatus] = useState<SyncStatus>({
    isSyncing: false,
    pendingCount: 0,
  });

  useEffect(() => {
    // Carrega contagem inicial
    syncService.getPendingCount()
      .then((count) => {
        setStatus((prev) => ({ ...prev, pendingCount: count }));
      })
      .catch((error) => {
        console.error('Erro ao carregar contagem pendente:', error);
        // Ignora erro silenciosamente
      });

    // Escuta eventos de sincronização
    const unsubscribe = syncService.addListener((event: SyncEvent) => {
      switch (event.type) {
        case 'sync-started':
          setStatus((prev) => ({
            ...prev,
            isSyncing: true,
            pendingCount: event.pendingCount || prev.pendingCount,
          }));
          break;

        case 'sync-completed':
          setStatus((prev) => ({
            ...prev,
            isSyncing: false,
            pendingCount: event.pendingCount || 0,
            lastError: undefined,
          }));
          break;

        case 'sync-failed':
          setStatus((prev) => ({
            ...prev,
            isSyncing: false,
            lastError: event.error,
          }));
          break;

        case 'submission-synced':
          setStatus((prev) => ({
            ...prev,
            pendingCount: event.pendingCount || prev.pendingCount,
          }));
          break;
      }
    });

    return unsubscribe;
  }, []);

  return status;
}

export default useSyncStatus;
