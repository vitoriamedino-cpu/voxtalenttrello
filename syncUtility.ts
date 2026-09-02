import {
  Vaga,
  Candidato,
  AcaoCusto,
  VolumeCV,
  ContaUsuario,
} from '../types';
import {
  syncCandidatosToSheet,
  syncVagasToSheet,
  syncCustosToSheet,
  syncVolumeToSheet,
  syncAllDataToMasterSheet,
  initializeMasterSpreadsheet,
  SHEET_TABS,
} from './googleSheetsService';

export type SyncActionType =
  | 'STATUS_CHANGE'
  | 'ETAPA_CHANGE'
  | 'NEW_CANDIDATO'
  | 'UPDATE_CANDIDATO'
  | 'DELETE_CANDIDATO'
  | 'BATCH_MOVE_ETAPA'
  | 'BATCH_SET_STATUS'
  | 'NEW_VAGA'
  | 'UPDATE_VAGA'
  | 'DELETE_VAGA'
  | 'NEW_CUSTO'
  | 'DELETE_CUSTO'
  | 'NEW_VOLUME'
  | 'DELETE_VOLUME'
  | 'FULL_SYNC';

export type SyncState = 'synced' | 'syncing' | 'pending' | 'error' | 'offline';

export interface SyncLogEntry {
  id: string;
  timestamp: string;
  timeFormatted: string;
  actionType: SyncActionType;
  entityName: string;
  description: string;
  status: 'success' | 'error' | 'pending';
  targetTabs: string[];
  durationMs?: number;
  errorMessage?: string;
}

export interface SyncEngineSnapshot {
  vagas: Vaga[];
  candidatos: Candidato[];
  custos: AcaoCusto[];
  volumeCvs: VolumeCV[];
  contasUsuarios: ContaUsuario[];
}

export interface SyncEngineState {
  status: SyncState;
  lastSyncTime: string | null;
  lastSuccessLog: SyncLogEntry | null;
  pendingCount: number;
  logs: SyncLogEntry[];
  errorMessage: string | null;
}

const STORAGE_SYNC_LOGS_KEY = 'voxtalent_sync_logs_history';
const MAX_LOGS = 50;

/**
 * Loads persisted sync logs from localStorage
 */
function loadPersistedLogs(): SyncLogEntry[] {
  try {
    const saved = localStorage.getItem(STORAGE_SYNC_LOGS_KEY);
    return saved ? JSON.parse(saved) : [];
  } catch {
    return [];
  }
}

/**
 * Saves sync logs to localStorage
 */
function persistLogs(logs: SyncLogEntry[]): void {
  try {
    localStorage.setItem(STORAGE_SYNC_LOGS_KEY, JSON.stringify(logs.slice(0, MAX_LOGS)));
  } catch (e) {
    console.warn('Erro ao salvar logs de sincronização:', e);
  }
}

export class GoogleSheetsSyncEngine {
  private status: SyncState = 'synced';
  private lastSyncTime: string | null = null;
  private lastSuccessLog: SyncLogEntry | null = null;
  private pendingCount = 0;
  private logs: SyncLogEntry[] = loadPersistedLogs();
  private errorMessage: string | null = null;

  private debounceTimer: any = null;
  private queuedActionTypes = new Set<SyncActionType>();
  private queuedDescriptions: string[] = [];
  private listeners: Array<(state: SyncEngineState) => void> = [];

  // Snapshot getter function supplied by AppContext
  private getLatestData: (() => SyncEngineSnapshot) | null = null;
  private getSpreadsheetId: (() => string | null) | null = null;
  private getIsConnected: (() => boolean) | null = null;
  private getAutoSyncEnabled: (() => boolean) | null = null;
  private onMasterSheetCreated: ((id: string) => void) | null = null;

  public init(config: {
    getLatestData: () => SyncEngineSnapshot;
    getSpreadsheetId: () => string | null;
    getIsConnected: () => boolean;
    getAutoSyncEnabled: () => boolean;
    onMasterSheetCreated?: (id: string) => void;
  }) {
    this.getLatestData = config.getLatestData;
    this.getSpreadsheetId = config.getSpreadsheetId;
    this.getIsConnected = config.getIsConnected;
    this.getAutoSyncEnabled = config.getAutoSyncEnabled;
    this.onMasterSheetCreated = config.onMasterSheetCreated || null;
  }

  public subscribe(listener: (state: SyncEngineState) => void): () => void {
    this.listeners.push(listener);
    listener(this.getState());
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener);
    };
  }

  public getState(): SyncEngineState {
    return {
      status: this.status,
      lastSyncTime: this.lastSyncTime,
      lastSuccessLog: this.lastSuccessLog,
      pendingCount: this.pendingCount,
      logs: this.logs,
      errorMessage: this.errorMessage,
    };
  }

  private notify() {
    const state = this.getState();
    this.listeners.forEach((l) => l(state));
  }

  private addLog(entry: SyncLogEntry) {
    this.logs = [entry, ...this.logs.filter((l) => l.id !== entry.id)].slice(0, MAX_LOGS);
    persistLogs(this.logs);
    if (entry.status === 'success') {
      this.lastSuccessLog = entry;
      this.lastSyncTime = entry.timeFormatted;
      this.errorMessage = null;
    } else if (entry.status === 'error') {
      this.errorMessage = entry.errorMessage || 'Erro na sincronização';
    }
    this.notify();
  }

  /**
   * Enqueues an automatic push to Google Sheets with intelligent debouncing.
   */
  public enqueueAutoSync(
    actionType: SyncActionType,
    entityName: string,
    description: string,
    debounceMs: number = 700
  ): void {
    if (!this.getIsConnected || !this.getIsConnected()) {
      return;
    }
    if (!this.getAutoSyncEnabled || !this.getAutoSyncEnabled()) {
      return;
    }

    this.queuedActionTypes.add(actionType);
    this.queuedDescriptions.push(`${entityName}: ${description}`);
    this.pendingCount += 1;
    this.status = 'pending';
    this.notify();

    if (this.debounceTimer) {
      clearTimeout(this.debounceTimer);
    }

    this.debounceTimer = setTimeout(() => {
      this.flushQueue();
    }, debounceMs);
  }

  /**
   * Immediately flushes and processes queued sync actions.
   */
  public async flushQueue(): Promise<void> {
    if (this.debounceTimer) {
      clearTimeout(this.debounceTimer);
      this.debounceTimer = null;
    }

    if (!this.getIsConnected || !this.getIsConnected()) {
      this.status = 'offline';
      this.pendingCount = 0;
      this.notify();
      return;
    }

    if (!this.getLatestData || !this.getSpreadsheetId) {
      return;
    }

    const actionTypes = Array.from(this.queuedActionTypes);
    const descriptions = [...this.queuedDescriptions];
    this.queuedActionTypes.clear();
    this.queuedDescriptions = [];
    this.pendingCount = 0;

    if (actionTypes.length === 0) {
      this.status = 'synced';
      this.notify();
      return;
    }

    const startTime = Date.now();
    this.status = 'syncing';
    this.notify();

    const logId = `sync-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    const now = new Date();
    const timeFormatted = now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', second: '2-digit' });

    // Determine target tabs
    const hasCandidateChanges = actionTypes.some((t) =>
      [
        'STATUS_CHANGE',
        'ETAPA_CHANGE',
        'NEW_CANDIDATO',
        'UPDATE_CANDIDATO',
        'DELETE_CANDIDATO',
        'BATCH_MOVE_ETAPA',
        'BATCH_SET_STATUS',
      ].includes(t)
    );

    const hasVagaChanges = actionTypes.some((t) =>
      ['NEW_VAGA', 'UPDATE_VAGA', 'DELETE_VAGA'].includes(t)
    );

    const hasCustoChanges = actionTypes.some((t) =>
      ['NEW_CUSTO', 'DELETE_CUSTO'].includes(t)
    );

    const hasVolumeChanges = actionTypes.some((t) =>
      ['NEW_VOLUME', 'DELETE_VOLUME'].includes(t)
    );

    const isFullSync = actionTypes.includes('FULL_SYNC') || (hasCandidateChanges && hasVagaChanges && hasCustoChanges);

    const targetTabs: string[] = [SHEET_TABS.PAINEL];
    if (isFullSync) {
      targetTabs.push(SHEET_TABS.VAGAS, SHEET_TABS.CANDIDATOS, SHEET_TABS.CUSTOS, SHEET_TABS.VOLUME, SHEET_TABS.UNIDADES, SHEET_TABS.CONTAS);
    } else {
      if (hasCandidateChanges) targetTabs.push(SHEET_TABS.CANDIDATOS);
      if (hasVagaChanges) targetTabs.push(SHEET_TABS.VAGAS);
      if (hasCustoChanges) targetTabs.push(SHEET_TABS.CUSTOS);
      if (hasVolumeChanges) targetTabs.push(SHEET_TABS.VOLUME);
    }

    const summaryDesc =
      descriptions.length <= 2
        ? descriptions.join(' • ')
        : `${descriptions.length} alterações sincronizadas (${actionTypes.join(', ')})`;

    const pendingLog: SyncLogEntry = {
      id: logId,
      timestamp: now.toISOString(),
      timeFormatted,
      actionType: actionTypes[0] || 'FULL_SYNC',
      entityName: isFullSync ? 'Banco de Dados Completo' : targetTabs.join(', '),
      description: summaryDesc,
      status: 'pending',
      targetTabs,
    };
    this.addLog(pendingLog);

    try {
      let sheetId = this.getSpreadsheetId();
      const appData = this.getLatestData();

      // If no master spreadsheet exists yet, initialize it
      if (!sheetId) {
        const initResult = await initializeMasterSpreadsheet(appData);
        sheetId = initResult.spreadsheetId;
        if (this.onMasterSheetCreated) {
          this.onMasterSheetCreated(sheetId);
        }
      } else {
        // Targeted sync for maximum performance and rate-limit friendliness
        if (isFullSync) {
          await syncAllDataToMasterSheet(sheetId, appData);
        } else {
          const tasks: Promise<any>[] = [];

          if (hasCandidateChanges) {
            tasks.push(
              syncCandidatosToSheet(
                sheetId,
                appData.candidatos,
                appData.vagas,
                appData.custos,
                appData.volumeCvs
              )
            );
          } else if (hasVagaChanges) {
            tasks.push(
              syncVagasToSheet(
                sheetId,
                appData.vagas,
                appData.candidatos,
                appData.custos,
                appData.volumeCvs
              )
            );
          } else if (hasCustoChanges) {
            tasks.push(
              syncCustosToSheet(
                sheetId,
                appData.custos,
                appData.vagas,
                appData.candidatos,
                appData.volumeCvs
              )
            );
          } else if (hasVolumeChanges) {
            tasks.push(
              syncVolumeToSheet(
                sheetId,
                appData.volumeCvs,
                appData.vagas,
                appData.candidatos,
                appData.custos
              )
            );
          }

          await Promise.all(tasks);
        }
      }

      const durationMs = Date.now() - startTime;
      this.status = 'synced';
      this.lastSyncTime = timeFormatted;

      const successLog: SyncLogEntry = {
        ...pendingLog,
        status: 'success',
        durationMs,
      };
      this.addLog(successLog);
    } catch (err: any) {
      console.error('Falha no motor de sincronização automática com Google Sheets:', err);
      const durationMs = Date.now() - startTime;
      this.status = 'error';
      this.errorMessage = err?.message || 'Falha ao sincronizar com Google Sheets';

      const errorLog: SyncLogEntry = {
        ...pendingLog,
        status: 'error',
        durationMs,
        errorMessage: this.errorMessage,
      };
      this.addLog(errorLog);
    }
  }

  /**
   * Forces a full synchronization of all modules to Google Sheets.
   */
  public async forceFullSync(customDescription = 'Sincronização Manual Forçada'): Promise<void> {
    this.enqueueAutoSync('FULL_SYNC', 'Planilha Mestre', customDescription, 50);
    await this.flushQueue();
  }

  /**
   * Clears the sync logs history
   */
  public clearLogs(): void {
    this.logs = [];
    persistLogs([]);
    this.notify();
  }
}

// Singleton global sync engine instance
export const syncEngine = new GoogleSheetsSyncEngine();
