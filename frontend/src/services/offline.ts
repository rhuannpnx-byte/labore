/**
 * Serviço de gerenciamento offline usando IndexedDB
 * Armazena submissions pendentes e formulários em cache
 */

import type { CreateSubmissionData, Form } from '../types';

const DB_NAME = 'labore_forms_offline';
const DB_VERSION = 2; // Incrementado para adicionar cached_projects

// Stores
const PENDING_SUBMISSIONS_STORE = 'pending_submissions';
const CACHED_FORMS_STORE = 'cached_forms';
const CACHED_PROJECTS_STORE = 'cached_projects';

export interface PendingSubmission {
  id: string;
  formId: string;
  data: CreateSubmissionData;
  timestamp: number;
  attempts: number;
  lastError?: string;
}

class OfflineDatabase {
  private db: IDBDatabase | null = null;

  /**
   * Inicializa o banco de dados IndexedDB
   */
  async init(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onerror = (event) => {
        const error = (event.target as IDBOpenDBRequest).error;
        
        // Se for erro de versão, deleta o banco e tenta novamente
        if (error?.name === 'VersionError') {
          console.warn('⚠️ Versão do IndexedDB incompatível, recriando banco...');
          indexedDB.deleteDatabase(DB_NAME);
          // Recarrega a página para reiniciar com banco limpo
          setTimeout(() => window.location.reload(), 500);
          return;
        }
        
        reject(request.error);
      };
      
      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;

        // Store para submissions pendentes
        if (!db.objectStoreNames.contains(PENDING_SUBMISSIONS_STORE)) {
          const store = db.createObjectStore(PENDING_SUBMISSIONS_STORE, {
            keyPath: 'id',
          });
          store.createIndex('formId', 'formId', { unique: false });
          store.createIndex('timestamp', 'timestamp', { unique: false });
        }

        // Store para formulários em cache
        if (!db.objectStoreNames.contains(CACHED_FORMS_STORE)) {
          db.createObjectStore(CACHED_FORMS_STORE, {
            keyPath: 'id',
          });
        }

        // Store para obras/projetos em cache
        if (!db.objectStoreNames.contains(CACHED_PROJECTS_STORE)) {
          db.createObjectStore(CACHED_PROJECTS_STORE, {
            keyPath: 'id',
          });
        }
      };
    });
  }

  /**
   * Garante que o DB está inicializado
   */
  private async ensureDB(): Promise<IDBDatabase> {
    if (!this.db) {
      await this.init();
    }
    return this.db!;
  }

  /**
   * Adiciona uma submission pendente
   */
  async addPendingSubmission(
    formId: string,
    data: CreateSubmissionData
  ): Promise<string> {
    const db = await this.ensureDB();
    const id = `pending_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    const submission: PendingSubmission = {
      id,
      formId,
      data,
      timestamp: Date.now(),
      attempts: 0,
    };

    return new Promise((resolve, reject) => {
      const transaction = db.transaction(
        [PENDING_SUBMISSIONS_STORE],
        'readwrite'
      );
      const store = transaction.objectStore(PENDING_SUBMISSIONS_STORE);
      const request = store.add(submission);

      request.onsuccess = () => resolve(id);
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Lista todas as submissions pendentes
   */
  async getPendingSubmissions(): Promise<PendingSubmission[]> {
    const db = await this.ensureDB();

    return new Promise((resolve, reject) => {
      const transaction = db.transaction(
        [PENDING_SUBMISSIONS_STORE],
        'readonly'
      );
      const store = transaction.objectStore(PENDING_SUBMISSIONS_STORE);
      const request = store.getAll();

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Remove uma submission pendente (após sincronização bem-sucedida)
   */
  async removePendingSubmission(id: string): Promise<void> {
    const db = await this.ensureDB();

    return new Promise((resolve, reject) => {
      const transaction = db.transaction(
        [PENDING_SUBMISSIONS_STORE],
        'readwrite'
      );
      const store = transaction.objectStore(PENDING_SUBMISSIONS_STORE);
      const request = store.delete(id);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Atualiza uma submission pendente (incrementa tentativas, atualiza erro)
   */
  async updatePendingSubmission(submission: PendingSubmission): Promise<void> {
    const db = await this.ensureDB();

    return new Promise((resolve, reject) => {
      const transaction = db.transaction(
        [PENDING_SUBMISSIONS_STORE],
        'readwrite'
      );
      const store = transaction.objectStore(PENDING_SUBMISSIONS_STORE);
      const request = store.put(submission);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Conta o número de submissions pendentes
   */
  async countPendingSubmissions(): Promise<number> {
    const db = await this.ensureDB();

    return new Promise((resolve, reject) => {
      const transaction = db.transaction(
        [PENDING_SUBMISSIONS_STORE],
        'readonly'
      );
      const store = transaction.objectStore(PENDING_SUBMISSIONS_STORE);
      const request = store.count();

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Salva um formulário em cache para acesso offline
   */
  async cacheForm(form: Form): Promise<void> {
    const db = await this.ensureDB();

    return new Promise((resolve, reject) => {
      const transaction = db.transaction([CACHED_FORMS_STORE], 'readwrite');
      const store = transaction.objectStore(CACHED_FORMS_STORE);
      const request = store.put(form);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Recupera um formulário do cache
   */
  async getCachedForm(id: string): Promise<Form | null> {
    const db = await this.ensureDB();

    return new Promise((resolve, reject) => {
      const transaction = db.transaction([CACHED_FORMS_STORE], 'readonly');
      const store = transaction.objectStore(CACHED_FORMS_STORE);
      const request = store.get(id);

      request.onsuccess = () => resolve(request.result || null);
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Lista todos os formulários em cache
   */
  async getAllCachedForms(): Promise<Form[]> {
    const db = await this.ensureDB();

    return new Promise((resolve, reject) => {
      const transaction = db.transaction([CACHED_FORMS_STORE], 'readonly');
      const store = transaction.objectStore(CACHED_FORMS_STORE);
      const request = store.getAll();

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Salva obras em cache para acesso offline
   */
  async cacheProjects(projects: any[]): Promise<void> {
    const db = await this.ensureDB();

    return new Promise((resolve, reject) => {
      const transaction = db.transaction([CACHED_PROJECTS_STORE], 'readwrite');
      const store = transaction.objectStore(CACHED_PROJECTS_STORE);

      // Limpa o store antes de adicionar novos
      store.clear();

      // Adiciona cada projeto
      projects.forEach((project) => {
        store.put(project);
      });

      transaction.oncomplete = () => resolve();
      transaction.onerror = () => reject(transaction.error);
    });
  }

  /**
   * Recupera obras do cache
   */
  async getCachedProjects(): Promise<any[]> {
    const db = await this.ensureDB();

    return new Promise((resolve, reject) => {
      const transaction = db.transaction([CACHED_PROJECTS_STORE], 'readonly');
      const store = transaction.objectStore(CACHED_PROJECTS_STORE);
      const request = store.getAll();

      request.onsuccess = () => resolve(request.result || []);
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Limpa todos os dados offline (útil para debug/reset)
   */
  async clearAll(): Promise<void> {
    const db = await this.ensureDB();

    return new Promise((resolve, reject) => {
      const transaction = db.transaction(
        [PENDING_SUBMISSIONS_STORE, CACHED_FORMS_STORE, CACHED_PROJECTS_STORE],
        'readwrite'
      );

      const pendingStore = transaction.objectStore(PENDING_SUBMISSIONS_STORE);
      const cacheStore = transaction.objectStore(CACHED_FORMS_STORE);
      const projectsStore = transaction.objectStore(CACHED_PROJECTS_STORE);

      pendingStore.clear();
      cacheStore.clear();
      projectsStore.clear();

      transaction.oncomplete = () => resolve();
      transaction.onerror = () => reject(transaction.error);
    });
  }
}

// Exporta instância singleton
export const offlineDB = new OfflineDatabase();

// Auto-inicializa quando o módulo é importado
offlineDB.init().catch(console.error);
