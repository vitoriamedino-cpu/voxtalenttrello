import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import {
  Vaga,
  Candidato,
  MensagemTemplate,
  AcaoCusto,
  VolumeCV,
  ProcessoConfig,
  UnidadeVox,
  UnidadeVoxInfo,
  EtapaProcesso,
  StatusCandidato,
  ContaUsuario,
} from '../types';
import {
  INITIAL_VAGAS,
  INITIAL_CANDIDATOS,
  DEFAULT_TEMPLATES,
  INITIAL_CUSTOS,
  INITIAL_VOLUME_CVS,
  DEFAULT_CONFIG,
  INITIAL_CONTAS_USUARIOS,
  DADOS_UNIDADES_VOX,
} from '../lib/rsConstants';
import { useWorkspace } from './WorkspaceContext';
import {
  STORAGE_SHEET_ID_KEY,
  initializeMasterSpreadsheet,
  syncAllDataToMasterSheet,
  loadDatabaseFromGoogleSheets,
} from '../lib/googleSheetsService';
import {
  syncEngine,
  SyncEngineState,
  SyncLogEntry,
  SyncActionType,
} from '../lib/syncUtility';

export type KanbanViewMode = 'split' | 'board' | 'stats';

interface AppContextType {
  // State
  vagas: Vaga[];
  candidatos: Candidato[];
  templates: MensagemTemplate[];
  custos: AcaoCusto[];
  volumeCvs: VolumeCV[];
  config: ProcessoConfig;
  contasUsuarios: ContaUsuario[];
  unidades: UnidadeVoxInfo[];

  // Google Sheets Live Database & Sync Utility
  masterSpreadsheetId: string | null;
  masterSpreadsheetUrl: string | null;
  isSheetsSyncing: boolean;
  lastSheetsSyncTime: string | null;
  sheetsSyncMessage: string | null;
  autoSyncEnabled: boolean;
  setAutoSyncEnabled: (enabled: boolean) => void;
  syncEngineState: SyncEngineState;
  clearSyncLogs: () => void;
  syncWithGoogleSheets: (manualTrigger?: boolean) => Promise<void>;
  loadDataFromGoogleSheets: (sheetId?: string) => Promise<boolean>;
  initializeMasterSheet: () => Promise<string>;
  triggerSyncAction: (actionType: SyncActionType, entityName: string, description: string) => void;
  
  // Navigation & Global Filters
  activeTab: string;
  setActiveTab: (tab: string) => void;
  sidebarCollapsed: boolean;
  setSidebarCollapsed: (collapsed: boolean) => void;
  toggleSidebarCollapsed: () => void;
  kanbanViewMode: KanbanViewMode;
  setKanbanViewMode: (mode: KanbanViewMode) => void;
  selectedUnidade: string; // 'TODAS' or UnidadeVox
  setSelectedUnidade: (unidade: string) => void;
  selectedVagaFilter: string; // 'TODAS' or vaga_id
  setSelectedVagaFilter: (vagaId: string) => void;
  kanbanFilterStatus: string; // 'TODOS' or StatusCandidato
  setKanbanFilterStatus: (status: string) => void;
  kanbanFilterEtapa: string; // 'TODAS' or EtapaProcesso
  setKanbanFilterEtapa: (etapa: string) => void;
  searchTerm: string;
  setSearchTerm: (term: string) => void;

  // Selected for Modals
  candidateModalId: string | null;
  setCandidateModalId: (id: string | null) => void;
  candidatePdfModalId: string | null;
  setCandidatePdfModalId: (id: string | null) => void;
  listModalEtapa: EtapaProcesso | null;
  setListModalEtapa: (etapa: EtapaProcesso | null) => void;
  isNewCandidateOpen: boolean;
  setIsNewCandidateOpen: (open: boolean) => void;
  vagaModalId: string | null;
  setVagaModalId: (id: string | null) => void;
  isNewVagaOpen: boolean;
  setIsNewVagaOpen: (open: boolean) => void;
  whatsAppModalCandidate: Candidato | null;
  setWhatsAppModalCandidate: (cand: Candidato | null) => void;
  coletivaScheduleVagaId: string | null;
  setColetivaScheduleVagaId: (vagaId: string | null) => void;
  calendarScheduleCandidate: Candidato | null;
  setCalendarScheduleCandidate: (cand: Candidato | null) => void;
  calendarScheduleDefaultDate: string | null;
  setCalendarScheduleDefaultDate: (date: string | null) => void;

  // Actions
  addCandidato: (candidato: Omit<Candidato, 'id' | 'criado_em' | 'atualizado_em' | 'historico_etapas'>) => Candidato;
  updateCandidato: (id: string, updates: Partial<Candidato>) => void;
  deleteCandidato: (id: string) => void;
  moveCandidatoEtapa: (id: string, novaEtapa: EtapaProcesso, observacao?: string) => void;
  batchMoveEtapa: (ids: string[], novaEtapa: EtapaProcesso, observacao?: string) => void;
  setCandidatoStatus: (id: string, status: StatusCandidato, motivo?: string) => void;
  batchSetStatus: (ids: string[], status: StatusCandidato, motivo?: string) => void;
  toggleFluxoSimplificado: (id: string) => void;

  addVaga: (vaga: Omit<Vaga, 'id'>) => Vaga;
  updateVaga: (id: string, updates: Partial<Vaga>) => void;
  deleteVaga: (id: string) => void;

  addCusto: (custo: Omit<AcaoCusto, 'id'>) => void;
  deleteCusto: (id: string) => void;

  addVolumeCV: (vol: Omit<VolumeCV, 'id'>) => void;
  deleteVolumeCV: (id: string) => void;

  addContaUsuario: (conta: Omit<ContaUsuario, 'id' | 'criadoEm'>) => void;
  updateContaUsuario: (id: string, updates: Partial<ContaUsuario>) => void;
  deleteContaUsuario: (id: string) => void;
  toggleStatusContaUsuario: (id: string) => void;

  addUnidade: (unidade: UnidadeVoxInfo) => void;
  updateUnidade: (apelido: string, updates: Partial<UnidadeVoxInfo>) => void;
  deleteUnidade: (apelido: string) => void;

  updateConfig: (updates: Partial<ProcessoConfig>) => void;
  updateTemplate: (id: string, updates: Partial<MensagemTemplate>) => void;
  resetAllData: () => void;

  // Helpers
  getVagaById: (id: string) => Vaga | undefined;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const STORAGE_KEYS = {
  VAGAS: 'voxtalent_vagas_v2',
  CANDIDATOS: 'voxtalent_candidatos_v2',
  TEMPLATES: 'voxtalent_templates_v2',
  CUSTOS: 'voxtalent_custos_v2',
  VOLUME_CVS: 'voxtalent_volumecvs_v2',
  CONFIG: 'voxtalent_config_v2',
  CONTAS: 'voxtalent_contas_v2',
  UNIDADES: 'voxtalent_unidades_v2',
  SIDEBAR_COLLAPSED: 'voxtalent_sidebar_collapsed_v2',
  KANBAN_VIEW_MODE: 'voxtalent_kanban_view_mode_v2',
  LAST_SYNC: 'voxtalent_last_sheets_sync',
  AUTO_SYNC: 'voxtalent_auto_sync_enabled',
};

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isConnected } = useWorkspace();

  // 1. Initial State from localStorage or Constants
  const [vagas, setVagas] = useState<Vaga[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.VAGAS);
return saved ? JSON.parse(saved) : [];
  });

  const [candidatos, setCandidatos] = useState<Candidato[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.CANDIDATOS);
return saved ? JSON.parse(saved) : [];  });

  const [templates, setTemplates] = useState<MensagemTemplate[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.TEMPLATES);
    return saved ? JSON.parse(saved) : DEFAULT_TEMPLATES;
  });

  const [custos, setCustos] = useState<AcaoCusto[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.CUSTOS);
return saved ? JSON.parse(saved) : [];
  });

  const [volumeCvs, setVolumeCvs] = useState<VolumeCV[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.VOLUME_CVS);
return saved ? JSON.parse(saved) : [];
  });

  const [config, setConfig] = useState<ProcessoConfig>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.CONFIG);
    return saved ? JSON.parse(saved) : DEFAULT_CONFIG;
  });

  const [contasUsuarios, setContasUsuarios] = useState<ContaUsuario[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.CONTAS);
    return saved ? JSON.parse(saved) : INITIAL_CONTAS_USUARIOS;
  });

  const [unidades, setUnidades] = useState<UnidadeVoxInfo[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.UNIDADES);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        // Fallback
      }
    }
    return Object.values(DADOS_UNIDADES_VOX);
  });

  // Sidebar Collapsed state (icon-only mode)
  const [sidebarCollapsed, setSidebarCollapsed] = useState<boolean>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.SIDEBAR_COLLAPSED);
    return saved === 'true';
  });

  const toggleSidebarCollapsed = () => {
    setSidebarCollapsed((prev) => {
      const next = !prev;
      localStorage.setItem(STORAGE_KEYS.SIDEBAR_COLLAPSED, String(next));
      return next;
    });
  };

  // Kanban view mode: split, board (maximized), stats
  const [kanbanViewMode, setKanbanViewMode] = useState<KanbanViewMode>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.KANBAN_VIEW_MODE) as KanbanViewMode;
    return saved || 'split';
  });

  // Google Sheets database state
  const [masterSpreadsheetId, setMasterSpreadsheetId] = useState<string | null>(() => {
    return localStorage.getItem(STORAGE_SHEET_ID_KEY);
  });
  const [isSheetsSyncing, setIsSheetsSyncing] = useState<boolean>(false);
  const [lastSheetsSyncTime, setLastSheetsSyncTime] = useState<string | null>(() => {
    return localStorage.getItem(STORAGE_KEYS.LAST_SYNC);
  });
  const [sheetsSyncMessage, setSheetsSyncMessage] = useState<string | null>(null);
  const [autoSyncEnabled, setAutoSyncEnabled] = useState<boolean>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.AUTO_SYNC);
    return saved !== null ? saved === 'true' : true;
  });

  const masterSpreadsheetUrl = masterSpreadsheetId
    ? `https://docs.google.com/spreadsheets/d/${masterSpreadsheetId}`
    : null;

  // Sync Engine State & Subscription
  const [syncEngineState, setSyncEngineState] = useState<SyncEngineState>(() => syncEngine.getState());

  // Mutable Refs for Real-Time Sync Engine Snapshots
  const vagasRef = useRef(vagas);
  vagasRef.current = vagas;
  const candidatosRef = useRef(candidatos);
  candidatosRef.current = candidatos;
  const custosRef = useRef(custos);
  custosRef.current = custos;
  const volumeCvsRef = useRef(volumeCvs);
  volumeCvsRef.current = volumeCvs;
  const contasUsuariosRef = useRef(contasUsuarios);
  contasUsuariosRef.current = contasUsuarios;
  const masterSpreadsheetIdRef = useRef(masterSpreadsheetId);
  masterSpreadsheetIdRef.current = masterSpreadsheetId;
  const isConnectedRef = useRef(isConnected);
  isConnectedRef.current = isConnected;
  const autoSyncEnabledRef = useRef(autoSyncEnabled);
  autoSyncEnabledRef.current = autoSyncEnabled;

  // Initialize and subscribe syncEngine
  useEffect(() => {
    syncEngine.init({
      getLatestData: () => ({
        vagas: vagasRef.current,
        candidatos: candidatosRef.current,
        custos: custosRef.current,
        volumeCvs: volumeCvsRef.current,
        contasUsuarios: contasUsuariosRef.current,
      }),
      getSpreadsheetId: () => masterSpreadsheetIdRef.current,
      getIsConnected: () => isConnectedRef.current,
      getAutoSyncEnabled: () => autoSyncEnabledRef.current,
      onMasterSheetCreated: (id) => {
        setMasterSpreadsheetId(id);
        localStorage.setItem(STORAGE_SHEET_ID_KEY, id);
      },
    });

    const unsubscribe = syncEngine.subscribe((nextState) => {
      setSyncEngineState(nextState);
      if (nextState.lastSyncTime) {
        setLastSheetsSyncTime(nextState.lastSyncTime);
        localStorage.setItem(STORAGE_KEYS.LAST_SYNC, nextState.lastSyncTime);
      }
    });

    return () => unsubscribe();
  }, []);

  // UI state
  const [activeTab, setActiveTab] = useState<string>('kanban');
  const [selectedUnidade, setSelectedUnidade] = useState<string>('TODAS');
  const [selectedVagaFilter, setSelectedVagaFilter] = useState<string>('TODAS');
  const [kanbanFilterStatus, setKanbanFilterStatus] = useState<string>('TODOS');
  const [kanbanFilterEtapa, setKanbanFilterEtapa] = useState<string>('TODAS');
  const [searchTerm, setSearchTerm] = useState<string>('');

  // Modals
  const [candidateModalId, setCandidateModalId] = useState<string | null>(null);
  const [candidatePdfModalId, setCandidatePdfModalId] = useState<string | null>(null);
  const [listModalEtapa, setListModalEtapa] = useState<EtapaProcesso | null>(null);
  const [isNewCandidateOpen, setIsNewCandidateOpen] = useState(false);
  const [vagaModalId, setVagaModalId] = useState<string | null>(null);
  const [isNewVagaOpen, setIsNewVagaOpen] = useState(false);
  const [whatsAppModalCandidate, setWhatsAppModalCandidate] = useState<Candidato | null>(null);
  const [coletivaScheduleVagaId, setColetivaScheduleVagaId] = useState<string | null>(null);
  const [calendarScheduleCandidate, setCalendarScheduleCandidate] = useState<Candidato | null>(null);
  const [calendarScheduleDefaultDate, setCalendarScheduleDefaultDate] = useState<string | null>(null);

  // Sync with LocalStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.VAGAS, JSON.stringify(vagas));
  }, [vagas]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.CANDIDATOS, JSON.stringify(candidatos));
  }, [candidatos]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.TEMPLATES, JSON.stringify(templates));
  }, [templates]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.CUSTOS, JSON.stringify(custos));
  }, [custos]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.VOLUME_CVS, JSON.stringify(volumeCvs));
  }, [volumeCvs]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.CONFIG, JSON.stringify(config));
  }, [config]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.CONTAS, JSON.stringify(contasUsuarios));
  }, [contasUsuarios]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.UNIDADES, JSON.stringify(unidades));
  }, [unidades]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.KANBAN_VIEW_MODE, kanbanViewMode);
  }, [kanbanViewMode]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.VOLUME_CVS, JSON.stringify(volumeCvs));
  }, [volumeCvs]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.CONFIG, JSON.stringify(config));
  }, [config]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.CONTAS, JSON.stringify(contasUsuarios));
  }, [contasUsuarios]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.AUTO_SYNC, String(autoSyncEnabled));
  }, [autoSyncEnabled]);

  // Google Sheets Actions
  const syncWithGoogleSheets = async (manualTrigger = false): Promise<void> => {
    if (!isConnected) return;
    setIsSheetsSyncing(true);
    setSheetsSyncMessage('Sincronizando banco de dados com o Google Sheets...');

    try {
      let sheetId = masterSpreadsheetId;
      if (!sheetId) {
        const initResult = await initializeMasterSpreadsheet({
          vagas,
          candidatos,
          custos,
          volumeCvs,
          contasUsuarios,
        });
        sheetId = initResult.spreadsheetId;
        setMasterSpreadsheetId(sheetId);
      } else {
        await syncAllDataToMasterSheet(sheetId, {
          vagas,
          candidatos,
          custos,
          volumeCvs,
          contasUsuarios,
        });
      }

      const syncTime = new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
      setLastSheetsSyncTime(syncTime);
      localStorage.setItem(STORAGE_KEYS.LAST_SYNC, syncTime);
      setSheetsSyncMessage('Painel de Controle e todas as abas sincronizadas com sucesso!');
      setTimeout(() => setSheetsSyncMessage(null), 4000);
    } catch (err: any) {
      console.error('Erro ao sincronizar com Google Sheets:', err);
      setSheetsSyncMessage(`Falha na sincronização: ${err?.message || 'Erro desconhecido'}`);
      setTimeout(() => setSheetsSyncMessage(null), 6000);
    } finally {
      setIsSheetsSyncing(false);
    }
  };

  const initializeMasterSheet = async (): Promise<string> => {
    setIsSheetsSyncing(true);
    setSheetsSyncMessage(
      'Criando e configurando planilha mestre de R&S...'
    );

    try {
      const result = await initializeMasterSpreadsheet({
        vagas,
        candidatos,
        custos,
        volumeCvs,
        contasUsuarios,
      });

      setMasterSpreadsheetId(result.spreadsheetId);

      const syncTime = new Date().toLocaleTimeString('pt-BR', {
        hour: '2-digit',
        minute: '2-digit',
      });

      setLastSheetsSyncTime(syncTime);

      localStorage.setItem(
        STORAGE_KEYS.LAST_SYNC,
        syncTime
      );

      setSheetsSyncMessage(
        `Planilha "${result.title}" vinculada como banco de dados principal!`
      );

      setTimeout(
        () => setSheetsSyncMessage(null),
        5000
      );

      return result.spreadsheetId;
    } catch (err: any) {
      console.error(
        'Erro ao criar planilha mestre:',
        err
      );

      setSheetsSyncMessage(
        `Erro ao inicializar: ${
          err?.message || 'Erro desconhecido'
        }`
      );

      throw err;
    } finally {
      setIsSheetsSyncing(false);
    }
  };

  // Carrega automaticamente a base real do Google Sheets
  const loadDataFromGoogleSheets = async (
    sheetId?: string
  ): Promise<boolean> => {
    if (!isConnected) return false;

    const targetSheetId = sheetId || masterSpreadsheetId;

    if (!targetSheetId) {
      console.warn('Nenhuma planilha principal configurada.');
      return false;
    }

    setIsSheetsSyncing(true);
    setSheetsSyncMessage('Carregando dados do Google Sheets...');

    try {
      const result = await loadDatabaseFromGoogleSheets(
        targetSheetId
      );

      setVagas(result.vagas ?? []);
      setCandidatos(result.candidatos ?? []);
      setCustos(result.custos ?? []);
      setVolumeCvs(result.volumeCvs ?? []);

      setMasterSpreadsheetId(targetSheetId);
      localStorage.setItem(
        STORAGE_SHEET_ID_KEY,
        targetSheetId
      );

      const syncTime = new Date().toLocaleTimeString('pt-BR', {
        hour: '2-digit',
        minute: '2-digit',
      });

      setLastSheetsSyncTime(syncTime);
      localStorage.setItem(
        STORAGE_KEYS.LAST_SYNC,
        syncTime
      );

      setSheetsSyncMessage(
        'Dados do Google Sheets carregados com sucesso!'
      );

      setTimeout(
        () => setSheetsSyncMessage(null),
        3000
      );

      return true;
    } catch (err: any) {
      console.error(
        'Erro ao carregar dados do Google Sheets:',
        err
      );

      setSheetsSyncMessage(
        `Erro ao carregar dados: ${
          err?.message || 'Erro desconhecido'
        }`
      );

      return false;
    } finally {
      setIsSheetsSyncing(false);
    }
  };

  // Carrega a base automaticamente após o login
  useEffect(() => {
    if (!isConnected || !masterSpreadsheetId) return;

    loadDataFromGoogleSheets(masterSpreadsheetId);
  }, [isConnected, masterSpreadsheetId]);

  const triggerSyncAction = (actionType: SyncActionType, entityName: string, description: string) => {
    syncEngine.enqueueAutoSync(actionType, entityName, description);
  };

  const getVagaById = (id: string) => vagas.find((v) => v.id === id);

  // Candidato Actions with Automatic Google Sheets Sync Push
  const addCandidato = (data: Omit<Candidato, 'id' | 'criado_em' | 'atualizado_em' | 'historico_etapas'>): Candidato => {
    const now = new Date().toISOString();
    const newCand: Candidato = {
      ...data,
      id: `cand-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      criado_em: now,
      atualizado_em: now,
      historico_etapas: [
        {
          etapa: data.etapa_processo,
          data: new Date().toISOString().split('T')[0],
          observacao: 'Candidato cadastrado no sistema.',
        },
      ],
    };
    setCandidatos((prev) => [newCand, ...prev]);

    // Automatically push new candidate to Google Sheets
    syncEngine.enqueueAutoSync(
      'NEW_CANDIDATO',
      newCand.nome,
      `Cadastrado na vaga "${newCand.vaga_titulo}" (${newCand.unidade})`
    );

    return newCand;
  };

  const updateCandidato = (id: string, updates: Partial<Candidato>) => {
    let candName = 'Candidato';
    setCandidatos((prev) =>
      prev.map((c) => {
        if (c.id !== id) return c;
        candName = c.nome;
        const now = new Date().toISOString();
        return {
          ...c,
          ...updates,
          atualizado_em: now,
        };
      })
    );

    syncEngine.enqueueAutoSync(
      'UPDATE_CANDIDATO',
      candName,
      'Informações do candidato atualizadas'
    );
  };

  const deleteCandidato = (id: string) => {
    const cand = candidatos.find((c) => c.id === id);
    const candName = cand?.nome || 'Candidato';
    setCandidatos((prev) => prev.filter((c) => c.id !== id));

    syncEngine.enqueueAutoSync(
      'DELETE_CANDIDATO',
      candName,
      'Candidato removido do banco'
    );
  };

 const moveCandidatoEtapa = (id: string, novaEtapa: EtapaProcesso, observacao?: string) => {
  let candName = 'Candidato';

  setCandidatos((prev) =>
    prev.map((c) => {
      if (c.id !== id) return c;

      candName = c.nome;

      const now = new Date().toISOString();
      const hojeStr = now.split('T')[0];

      const newHist = [
        ...c.historico_etapas,
        {
          etapa: novaEtapa,
          data: hojeStr,
          observacao:
            observacao || `Avançou para ${novaEtapa}`,
        },
      ];

      return {
        ...c,
        etapa_processo: novaEtapa,
        status:
          c.status === 'Banco de Talentos'
            ? 'Em andamento'
            : c.status,
        atualizado_em: now,
        historico_etapas: newHist,
      };
    })
  );

  syncEngine.enqueueAutoSync(
    'ETAPA_CHANGE',
    candName,
    `Movido para a etapa "${novaEtapa}"`
  );
};

  const batchMoveEtapa = (ids: string[], novaEtapa: EtapaProcesso, observacao?: string) => {
    const idSet = new Set(ids);
    const now = new Date().toISOString();
    const hojeStr = now.split('T')[0];
    setCandidatos((prev) =>
      prev.map((c) => {
        if (!idSet.has(c.id)) return c;
        const newHist = [
          ...c.historico_etapas,
          {
            etapa: novaEtapa,
            data: hojeStr,
            observacao: observacao || `Avançou em lote para ${novaEtapa}`,
          },
        ];
        return {
          ...c,
          etapa_processo: novaEtapa,
          atualizado_em: now,
          historico_etapas: newHist,
        };
      })
    );

    syncEngine.enqueueAutoSync(
      'BATCH_MOVE_ETAPA',
      `${ids.length} Candidatos`,
      `Movimentação em lote para "${novaEtapa}"`
    );
  };

  const setCandidatoStatus = (id: string, status: StatusCandidato, motivo?: string) => {
    let candName = 'Candidato';
    setCandidatos((prev) =>
      prev.map((c) => {
        if (c.id !== id) return c;
        candName = c.nome;
        const now = new Date().toISOString();
        return {
          ...c,
          status,
          motivo_reprovacao: motivo || c.motivo_reprovacao,
          atualizado_em: now,
        };
      })
    );

    syncEngine.enqueueAutoSync(
      'STATUS_CHANGE',
      candName,
      `Status alterado para "${status}"${motivo ? ` (${motivo})` : ''}`
    );
  };

  const batchSetStatus = (ids: string[], status: StatusCandidato, motivo?: string) => {
    const idSet = new Set(ids);
    const now = new Date().toISOString();
    setCandidatos((prev) =>
      prev.map((c) => {
        if (!idSet.has(c.id)) return c;
        return {
          ...c,
          status,
          motivo_reprovacao: motivo || c.motivo_reprovacao,
          atualizado_em: now,
        };
      })
    );

    syncEngine.enqueueAutoSync(
      'BATCH_SET_STATUS',
      `${ids.length} Candidatos`,
      `Status em lote alterado para "${status}"${motivo ? ` (${motivo})` : ''}`
    );
  };

  const toggleFluxoSimplificado = (id: string) => {
    let candName = 'Candidato';
    let novoFluxo = false;
    setCandidatos((prev) =>
      prev.map((c) => {
        if (c.id === id) {
          candName = c.nome;
          novoFluxo = !c.fluxo_simplificado;
          return { ...c, fluxo_simplificado: novoFluxo };
        }
        return c;
      })
    );

    syncEngine.enqueueAutoSync(
      'UPDATE_CANDIDATO',
      candName,
      `Fluxo simplificado: ${novoFluxo ? 'Ativado' : 'Desativado'}`
    );
  };

  // Vaga Actions with Automatic Google Sheets Sync Push
  const addVaga = (data: Omit<Vaga, 'id'>): Vaga => {
    const newVaga: Vaga = {
      ...data,
      id: `vaga-${Date.now()}`,
    };
    setVagas((prev) => [newVaga, ...prev]);

    syncEngine.enqueueAutoSync(
      'NEW_VAGA',
      newVaga.titulo,
      `Nova vaga aberta em ${newVaga.unidade} (${newVaga.status})`
    );

    return newVaga;
  };

  const updateVaga = (id: string, updates: Partial<Vaga>) => {
    let vagaTitulo = 'Vaga';
    setVagas((prev) =>
      prev.map((v) => {
        if (v.id !== id) return v;
        vagaTitulo = v.titulo;
        return { ...v, ...updates };
      })
    );

    syncEngine.enqueueAutoSync(
      'UPDATE_VAGA',
      vagaTitulo,
      updates.status ? `Status da vaga atualizado para "${updates.status}"` : 'Dados da vaga atualizados'
    );
  };

  const deleteVaga = (id: string) => {
    const vaga = vagas.find((v) => v.id === id);
    const vagaTitulo = vaga?.titulo || 'Vaga';
    setVagas((prev) => prev.filter((v) => v.id !== id));

    syncEngine.enqueueAutoSync(
      'DELETE_VAGA',
      vagaTitulo,
      'Vaga excluída do sistema'
    );
  };

  // Custos & Volume Actions with Automatic Google Sheets Sync Push
  const addCusto = (custo: Omit<AcaoCusto, 'id'>) => {
    const newCusto: AcaoCusto = {
      ...custo,
      id: `custo-${Date.now()}`,
    };
    setCustos((prev) => [newCusto, ...prev]);

    syncEngine.enqueueAutoSync(
      'NEW_CUSTO',
      newCusto.canal,
      `Investimento de R$ ${newCusto.valor} registrado em ${newCusto.unidade}`
    );
  };

  const deleteCusto = (id: string) => {
    const custo = custos.find((c) => c.id === id);
    setCustos((prev) => prev.filter((c) => c.id !== id));

    syncEngine.enqueueAutoSync(
      'DELETE_CUSTO',
      custo?.canal || 'Custo',
      'Lançamento de custo excluído'
    );
  };

  const addVolumeCV = (vol: Omit<VolumeCV, 'id'>) => {
    const newVol: VolumeCV = {
      ...vol,
      id: `vol-${Date.now()}`,
    };
    setVolumeCvs((prev) => [newVol, ...prev]);

    syncEngine.enqueueAutoSync(
      'NEW_VOLUME',
      newVol.semana,
      `Volume semanal registrado: ${newVol.quantidade_cvs} CVs (${newVol.canal})`
    );
  };

  const deleteVolumeCV = (id: string) => {
    const vol = volumeCvs.find((v) => v.id === id);
    setVolumeCvs((prev) => prev.filter((v) => v.id !== id));

    syncEngine.enqueueAutoSync(
      'DELETE_VOLUME',
      vol?.semana || 'Volume CV',
      'Registro de volume excluído'
    );
  };

  // Config & Template Actions
  const addContaUsuario = (conta: Omit<ContaUsuario, 'id' | 'criadoEm'>) => {
    const novaConta: ContaUsuario = {
      ...conta,
      id: `user-${Date.now()}`,
      criadoEm: new Date().toISOString(),
    };
    setContasUsuarios((prev) => [novaConta, ...prev]);
    syncEngine.enqueueAutoSync('UPDATE_CANDIDATO', novaConta.nome, 'Conta de usuário criada');
  };

  const updateContaUsuario = (id: string, updates: Partial<ContaUsuario>) => {
    let userName = 'Usuário';
    setContasUsuarios((prev) =>
      prev.map((c) => {
        if (c.id === id) {
          userName = c.nome;
          return { ...c, ...updates };
        }
        return c;
      })
    );
    syncEngine.enqueueAutoSync('UPDATE_CANDIDATO', userName, 'Conta de usuário atualizada');
  };

  const deleteContaUsuario = (id: string) => {
    setContasUsuarios((prev) => prev.filter((c) => c.id !== id));
    syncEngine.enqueueAutoSync('DELETE_CANDIDATO', 'Conta', 'Conta de usuário removida');
  };

  const toggleStatusContaUsuario = (id: string) => {
    setContasUsuarios((prev) =>
      prev.map((c) =>
        c.id === id
          ? { ...c, status: c.status === 'Ativo' ? 'Inativo' : 'Ativo' }
          : c
      )
    );
  };

  // Unidades Actions
  const addUnidade = (unidade: UnidadeVoxInfo) => {
    setUnidades((prev) => {
      if (prev.some((u) => u.apelido === unidade.apelido)) {
        return prev.map((u) => (u.apelido === unidade.apelido ? unidade : u));
      }
      return [...prev, unidade];
    });
    syncEngine.enqueueAutoSync('UPDATE_CANDIDATO', unidade.apelido, 'Nova unidade cadastrada');
  };

  const updateUnidade = (apelido: string, updates: Partial<UnidadeVoxInfo>) => {
    setUnidades((prev) =>
      prev.map((u) => (u.apelido === apelido ? { ...u, ...updates } : u))
    );
    syncEngine.enqueueAutoSync('UPDATE_CANDIDATO', apelido, 'Dados da unidade atualizados');
  };

  const deleteUnidade = (apelido: string) => {
    setUnidades((prev) => prev.filter((u) => u.apelido !== apelido));
    syncEngine.enqueueAutoSync('DELETE_CANDIDATO', apelido, 'Unidade removida do sistema');
  };

  const updateConfig = (updates: Partial<ProcessoConfig>) => {
    setConfig((prev) => ({ ...prev, ...updates }));
  };

  const updateTemplate = (id: string, updates: Partial<MensagemTemplate>) => {
    setTemplates((prev) => prev.map((t) => (t.id === id ? { ...t, ...updates } : t)));
  };

  const resetAllData = () => {
    setVagas(INITIAL_VAGAS);
    setCandidatos(INITIAL_CANDIDATOS);
    setTemplates(DEFAULT_TEMPLATES);
    setCustos(INITIAL_CUSTOS);
    setVolumeCvs(INITIAL_VOLUME_CVS);
    setConfig(DEFAULT_CONFIG);
    setContasUsuarios(INITIAL_CONTAS_USUARIOS);
    setUnidades(Object.values(DADOS_UNIDADES_VOX));
    localStorage.clear();
  };

  const clearSyncLogs = () => {
  syncEngine.clearLogs();
};

  return (
    <AppContext.Provider
      value={{
        vagas,
        candidatos,
        templates,
        custos,
        volumeCvs,
        config,
        contasUsuarios,
        unidades,
        masterSpreadsheetId,
        masterSpreadsheetUrl,
        isSheetsSyncing: isSheetsSyncing || syncEngineState.status === 'syncing',
        lastSheetsSyncTime,
        sheetsSyncMessage,
        autoSyncEnabled,
        setAutoSyncEnabled,
        syncEngineState,
        clearSyncLogs,
        triggerSyncAction,
        syncWithGoogleSheets,
        loadDataFromGoogleSheets,
        initializeMasterSheet,
        activeTab,
        setActiveTab,
        sidebarCollapsed,
        setSidebarCollapsed,
        toggleSidebarCollapsed,
        kanbanViewMode,
        setKanbanViewMode,
        selectedUnidade,
        setSelectedUnidade,
        selectedVagaFilter,
        setSelectedVagaFilter,
        kanbanFilterStatus,
        setKanbanFilterStatus,
        kanbanFilterEtapa,
        setKanbanFilterEtapa,
        searchTerm,
        setSearchTerm,
        candidateModalId,
        setCandidateModalId,
        candidatePdfModalId,
        setCandidatePdfModalId,
        listModalEtapa,
        setListModalEtapa,
        isNewCandidateOpen,
        setIsNewCandidateOpen,
        vagaModalId,
        setVagaModalId,
        isNewVagaOpen,
        setIsNewVagaOpen,
        whatsAppModalCandidate,
        setWhatsAppModalCandidate,
        coletivaScheduleVagaId,
        setColetivaScheduleVagaId,
        calendarScheduleCandidate,
        setCalendarScheduleCandidate,
        calendarScheduleDefaultDate,
        setCalendarScheduleDefaultDate,
        addCandidato,
        updateCandidato,
        deleteCandidato,
        moveCandidatoEtapa,
        batchMoveEtapa,
        setCandidatoStatus,
        batchSetStatus,
        toggleFluxoSimplificado,
        addVaga,
        updateVaga,
        deleteVaga,
        addCusto,
        deleteCusto,
        addVolumeCV,
        deleteVolumeCV,
        addContaUsuario,
        updateContaUsuario,
        deleteContaUsuario,
        toggleStatusContaUsuario,
        addUnidade,
        updateUnidade,
        deleteUnidade,
        updateConfig,
        updateTemplate,
        resetAllData,
        getVagaById,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
