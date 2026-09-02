import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { useWorkspace } from '../../context/WorkspaceContext';
import { UNIDADES_VOX } from '../../lib/rsConstants';
import { ThemeToggle } from '../Common/ThemeToggle';
import { GoogleSignInButton } from '../Common/GoogleSignInButton';
import { GlobalSearchBar } from './GlobalSearchBar';
import {
  Briefcase,
  UserPlus,
  FileSpreadsheet,
  RefreshCw,
  ExternalLink,
  CheckCircle2,
  AlertTriangle,
  Clock,
  ChevronDown,
  PanelLeftClose,
  PanelLeftOpen,
} from 'lucide-react';

export const Header: React.FC = () => {
  const {
    selectedUnidade,
    setSelectedUnidade,
    setIsNewCandidateOpen,
    setIsNewVagaOpen,
    candidatos,
    setActiveTab,
    setKanbanFilterStatus,
    masterSpreadsheetId,
    masterSpreadsheetUrl,
    isSheetsSyncing,
    lastSheetsSyncTime,
    syncEngineState,
    autoSyncEnabled,
    setAutoSyncEnabled,
    syncWithGoogleSheets,
    sidebarCollapsed,
    toggleSidebarCollapsed,
  } = useApp();
  const { isConnected } = useWorkspace();

  const [showSyncDropdown, setShowSyncDropdown] = useState(false);

  const ausentesCount = candidatos.filter((c) => c.status === 'Ausente').length;
  const videoCount = candidatos.filter((c) => c.etapa_processo === 'Vídeo de Apresentação').length;

  const isSyncing = isSheetsSyncing || syncEngineState.status === 'syncing';
  const hasError = syncEngineState.status === 'error';
  const isPending = syncEngineState.status === 'pending';

  return (
    <header
      id="app-header"
      className="h-16 bg-white dark:bg-[#111827] border-b border-gray-200 dark:border-gray-800 flex items-center justify-between px-3 sm:px-6 lg:px-8 sticky top-0 z-30 flex-shrink-0 transition-colors duration-200 gap-2 sm:gap-4"
    >
      {/* Sidebar Toggle & Indicator Chips on Left with High Accessibility Contrast */}
      <div className="flex items-center gap-2 sm:gap-3 lg:gap-4 flex-shrink-0">
        <button
          type="button"
          onClick={toggleSidebarCollapsed}
          className="p-1.5 rounded-lg text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          title={sidebarCollapsed ? 'Expandir menu lateral' : 'Recolher menu lateral para ícones'}
        >
          {sidebarCollapsed ? (
            <PanelLeftOpen className="w-4 h-4 text-[#00A9A1] dark:text-[#00C4BB]" />
          ) : (
            <PanelLeftClose className="w-4 h-4" />
          )}
        </button>

        <button
          type="button"
          onClick={() => {
            setActiveTab('kanban');
            setKanbanFilterStatus('Ausente');
          }}
          className="hidden md:flex items-center gap-1.5 cursor-pointer hover:opacity-80 transition-opacity focus:outline-none focus:ring-1 focus:ring-[#F7941D] rounded px-1.5 py-1"
          title="Ver candidatos ausentes no Kanban"
        >
          <span className="w-2.5 h-2.5 rounded-full bg-[#F7941D] dark:bg-[#FFA336] shadow-xs"></span>
          <span className="text-xs font-bold text-gray-700 dark:text-gray-200 uppercase tracking-wide whitespace-nowrap">
            {ausentesCount} AUSENTES
          </span>
        </button>

        <button
          type="button"
          onClick={() => {
            setActiveTab('kanban');
            setKanbanFilterStatus('TODOS');
          }}
          className="flex items-center gap-1.5 cursor-pointer hover:opacity-80 transition-opacity focus:outline-none focus:ring-1 focus:ring-[#00A9A1] rounded px-1.5 py-1"
          title="Ver fila de vídeos"
        >
          <span className="w-2.5 h-2.5 rounded-full bg-[#00A9A1] dark:bg-[#00C4BB] shadow-xs"></span>
          <span className="text-xs font-bold text-gray-700 dark:text-gray-200 uppercase tracking-wide whitespace-nowrap">
            {videoCount} FILA VÍDEO
          </span>
        </button>

        {/* Live Sheets Auto-Sync Interactive Dropdown */}
        {isConnected && (
          <div className="relative hidden xl:block">
            <button
              type="button"
              onClick={() => setShowSyncDropdown((v) => !v)}
              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-bold transition-all border shadow-2xs ${
                hasError
                  ? 'bg-rose-50 dark:bg-rose-950/50 border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-300'
                  : isSyncing || isPending
                  ? 'bg-amber-50 dark:bg-amber-950/50 border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-300'
                  : 'bg-emerald-50 dark:bg-emerald-950/50 border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300'
              }`}
            >
              <span
                className={`w-2 h-2 rounded-full ${
                  hasError
                    ? 'bg-rose-500'
                    : isSyncing || isPending
                    ? 'bg-amber-500 animate-spin'
                    : 'bg-emerald-500 animate-pulse'
                }`}
              />
              <span>
                {isSyncing
                  ? 'Sincronizando...'
                  : isPending
                  ? `Sincronizando (${syncEngineState.pendingCount})...`
                  : hasError
                  ? 'Erro no Sync'
                  : 'Sheets Sincronizado'}
              </span>
              {lastSheetsSyncTime && !isSyncing && (
                <span className="text-[10px] font-normal opacity-80">
                  ({lastSheetsSyncTime})
                </span>
              )}
              <ChevronDown className="w-3 h-3 opacity-60 ml-0.5" />
            </button>

            {/* Sync Menu Popover */}
            {showSyncDropdown && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setShowSyncDropdown(false)}
                />
                <div className="absolute left-0 mt-1.5 w-80 bg-white dark:bg-gray-900 rounded-xl shadow-xl border border-gray-200 dark:border-gray-800 p-3.5 z-50 text-xs space-y-3">
                  <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-800 pb-2">
                    <div className="flex items-center gap-1.5 font-bold text-gray-900 dark:text-white">
                      <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
                      <span>Sincronização Google Sheets</span>
                    </div>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-200">
                      Auto-Push Ativo
                    </span>
                  </div>

                  {/* Last Action Synced */}
                  {syncEngineState.lastSuccessLog && (
                    <div className="bg-gray-50 dark:bg-gray-800/60 rounded-lg p-2.5 space-y-1">
                      <div className="flex items-center justify-between text-[10px] text-gray-500 dark:text-gray-400">
                        <span>Último push automático:</span>
                        <span>{syncEngineState.lastSuccessLog.timeFormatted}</span>
                      </div>
                      <p className="text-[11px] font-semibold text-gray-800 dark:text-gray-200 truncate">
                        {syncEngineState.lastSuccessLog.description}
                      </p>
                      <div className="flex items-center gap-1 text-[10px] text-emerald-600 dark:text-emerald-400 font-medium">
                        <CheckCircle2 className="w-3 h-3" />
                        <span>Abas: {syncEngineState.lastSuccessLog.targetTabs.join(', ')}</span>
                      </div>
                    </div>
                  )}

                  {/* Controls */}
                  <div className="flex items-center justify-between gap-2 pt-1">
                    <button
                      type="button"
                      disabled={isSyncing}
                      onClick={() => {
                        syncWithGoogleSheets(true);
                      }}
                      className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] transition-colors disabled:opacity-50"
                    >
                      <RefreshCw className={`w-3 h-3 ${isSyncing ? 'animate-spin' : ''}`} />
                      <span>{isSyncing ? 'Enviando...' : 'Forçar Push'}</span>
                    </button>

                    {masterSpreadsheetUrl && (
                      <a
                        href={masterSpreadsheetUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center justify-center gap-1 px-3 py-1.5 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 font-bold text-[11px] transition-colors"
                      >
                        <ExternalLink className="w-3 h-3" />
                        <span>Abrir</span>
                      </a>
                    )}
                  </div>

                  <div className="border-t border-gray-100 dark:border-gray-800 pt-2 flex items-center justify-between text-[11px]">
                    <span className="text-gray-500 dark:text-gray-400">Push automático de status:</span>
                    <button
                      type="button"
                      onClick={() => setAutoSyncEnabled(!autoSyncEnabled)}
                      className={`font-bold ${
                        autoSyncEnabled ? 'text-emerald-600 dark:text-emerald-400' : 'text-gray-400'
                      }`}
                    >
                      {autoSyncEnabled ? 'Ativado' : 'Pausado'}
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        )}
      </div>

      {/* Global Search Bar (across Kanban & Talent Bank) */}
      <GlobalSearchBar />

      {/* Right Controls: Google Workspace, Theme Toggle, Unit Selector, New Vaga & New Candidate */}
      <div className="flex items-center gap-1.5 sm:gap-2.5 flex-shrink-0">
        {/* Google Workspace Auth Button */}
        <GoogleSignInButton compact />

        {/* Theme Toggle Button */}
        <ThemeToggle />

        {/* Global Unit Switcher */}
        <select
          id="global-unit-select"
          value={selectedUnidade}
          onChange={(e) => setSelectedUnidade(e.target.value)}
          className="hidden sm:block bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-xs font-semibold text-gray-800 dark:text-gray-200 rounded-md px-2.5 py-2 focus:outline-none focus:ring-1 focus:ring-[#00A9A1] dark:focus:ring-[#00C4BB] transition-colors max-w-[140px] md:max-w-none"
        >
          <option value="TODAS">9 Unidades</option>
          {UNIDADES_VOX.map((u) => (
            <option key={u} value={u}>
              {u}
            </option>
          ))}
        </select>

        <button
          type="button"
          onClick={() => setIsNewVagaOpen(true)}
          className="hidden lg:inline-flex items-center gap-1.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-750 text-gray-700 dark:text-gray-200 px-3 py-2 rounded-md text-xs font-semibold shadow-2xs transition-colors"
        >
          <Briefcase className="w-3.5 h-3.5 text-gray-500 dark:text-gray-400" />
          <span>Nova Vaga</span>
        </button>

        <button
          type="button"
          onClick={() => setIsNewCandidateOpen(true)}
          className="bg-[#00A9A1] hover:bg-[#008f88] dark:bg-[#00A9A1] dark:hover:bg-[#00C4BB] text-white px-2.5 sm:px-3.5 py-2 rounded-md text-xs sm:text-sm font-semibold shadow-xs flex items-center gap-1.5 sm:gap-2 transition-all active:scale-[0.98] whitespace-nowrap"
        >
          <UserPlus className="w-4 h-4" />
          <span className="hidden xs:inline sm:inline">+ Novo Candidato</span>
          <span className="xs:hidden sm:hidden">+ Novo</span>
        </button>
      </div>
    </header>
  );
};


