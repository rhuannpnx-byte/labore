/**
 * Serviço de sincronização automática
 * Gerencia o envio de submissions pendentes quando a conexão é restabelecida
 */

import { offlineDB, type PendingSubmission } from './offline';
import { submissionsApi } from './api';

type SyncEventType = 'sync-started' | 'sync-completed' | 'sync-failed' | 'submission-synced';

export interface SyncEvent {
  type: SyncEventType;
  pendingCount?: number;
  error?: string;
  submissionId?: string;
}

type SyncListener = (event: SyncEvent) => void;

class SyncService {
  private listeners: SyncListener[] = [];
  private isSyncing = false;
  private syncInterval: number | null = null;
  private maxRetries = 3;

  constructor() {
    // Escuta mudanças no status de conexão
    if (typeof window !== 'undefined') {
      window.addEventListener('online', () => this.handleOnline());
      
      // Tenta sincronizar periodicamente quando online
      this.startPeriodicSync();
    }
  }

  /**
   * Adiciona listener para eventos de sincronização
   */
  addListener(listener: SyncListener): () => void {
    this.listeners.push(listener);
    
    // Retorna função para remover o listener
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener);
    };
  }

  /**
   * Emite evento para todos os listeners
   */
  private emit(event: SyncEvent): void {
    this.listeners.forEach((listener) => {
      try {
        listener(event);
      } catch (error) {
        console.error('Erro ao executar listener de sync:', error);
      }
    });
  }

  /**
   * Handler para quando a conexão é restabelecida
   */
  private async handleOnline(): Promise<void> {
    console.log('✅ Conexão restabelecida - iniciando sincronização...');
    await this.syncPendingSubmissions();
  }

  /**
   * Inicia sincronização periódica (a cada 30 segundos quando online)
   */
  private startPeriodicSync(): void {
    if (this.syncInterval) return;

    this.syncInterval = window.setInterval(async () => {
      if (navigator.onLine && !this.isSyncing) {
        const count = await offlineDB.countPendingSubmissions();
        if (count > 0) {
          console.log(`🔄 Sync periódico: ${count} submission(s) pendente(s)`);
          await this.syncPendingSubmissions();
        }
      }
    }, 30000); // 30 segundos
  }

  /**
   * Sincroniza todas as submissions pendentes
   */
  async syncPendingSubmissions(): Promise<void> {
    // Evita sincronizações simultâneas
    if (this.isSyncing) {
      console.log('⏳ Sincronização já em andamento...');
      return;
    }

    // Verifica se está online
    if (!navigator.onLine) {
      console.log('📴 Offline - aguardando conexão...');
      return;
    }

    try {
      this.isSyncing = true;
      const pending = await offlineDB.getPendingSubmissions();

      if (pending.length === 0) {
        console.log('✅ Nenhuma submission pendente');
        return;
      }

      console.log(`🔄 Iniciando sincronização de ${pending.length} submission(s)...`);
      this.emit({ type: 'sync-started', pendingCount: pending.length });

      let successCount = 0;
      let failCount = 0;

      // Processa cada submission pendente
      for (const submission of pending) {
        try {
          await this.syncSubmission(submission);
          successCount++;
          
          this.emit({
            type: 'submission-synced',
            submissionId: submission.id,
            pendingCount: pending.length - successCount,
          });
        } catch (error) {
          failCount++;
          console.error(`❌ Erro ao sincronizar ${submission.id}:`, error);
        }
      }

      console.log(
        `✅ Sincronização concluída: ${successCount} sucesso, ${failCount} falhas`
      );
      
      this.emit({
        type: 'sync-completed',
        pendingCount: await offlineDB.countPendingSubmissions(),
      });
    } catch (error) {
      console.error('❌ Erro durante sincronização:', error);
      this.emit({
        type: 'sync-failed',
        error: error instanceof Error ? error.message : 'Erro desconhecido',
      });
    } finally {
      this.isSyncing = false;
    }
  }

  /**
   * Sincroniza uma submission individual
   */
  private async syncSubmission(submission: PendingSubmission): Promise<void> {
    try {
      // Tenta enviar para o servidor
      console.log(`📤 Enviando submission ${submission.id}...`);
      await submissionsApi.create(submission.data);

      // Se sucesso, remove do IndexedDB
      await offlineDB.removePendingSubmission(submission.id);
      console.log(`✅ Submission ${submission.id} sincronizada com sucesso`);
    } catch (error: any) {
      // Incrementa tentativas
      submission.attempts++;
      submission.lastError = error?.response?.data?.error || error?.message || 'Erro desconhecido';

      console.error(
        `❌ Falha na tentativa ${submission.attempts}/${this.maxRetries} para ${submission.id}`
      );

      // Se atingiu o máximo de tentativas, mantém mas loga
      if (submission.attempts >= this.maxRetries) {
        console.error(
          `⚠️ Submission ${submission.id} atingiu o máximo de tentativas. ` +
          `Mantida no banco para retry manual.`
        );
      }

      // Atualiza no IndexedDB
      await offlineDB.updatePendingSubmission(submission);

      // Re-throw para contabilizar como falha
      throw error;
    }
  }

  /**
   * Força uma sincronização imediata
   */
  async forcSync(): Promise<void> {
    console.log('🔄 Sincronização forçada iniciada...');
    
    // Reseta o contador de tentativas de todas as submissions pendentes
    const pendingSubmissions = await offlineDB.getPendingSubmissions();
    for (const submission of pendingSubmissions) {
      if (submission.attempts >= this.maxRetries) {
        submission.attempts = 0; // Reseta para dar nova chance
        await offlineDB.updatePendingSubmission(submission);
        console.log(`🔄 Resetando tentativas de ${submission.id}`);
      }
    }
    
    await this.syncPendingSubmissions();
  }

  /**
   * Retorna o número de submissions pendentes
   */
  async getPendingCount(): Promise<number> {
    return offlineDB.countPendingSubmissions();
  }

  /**
   * Retorna se está sincronizando no momento
   */
  isSyncInProgress(): boolean {
    return this.isSyncing;
  }

  /**
   * Para a sincronização periódica (útil para cleanup)
   */
  stopPeriodicSync(): void {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
      this.syncInterval = null;
    }
  }
}

// Exporta instância singleton
export const syncService = new SyncService();
