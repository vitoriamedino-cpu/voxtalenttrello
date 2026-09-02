import React, { useState, useRef, useEffect } from 'react';
import { Candidato, EtapaProcesso, StatusCandidato } from '../../types';
import { ETAPAS_KANBAN } from '../../lib/rsConstants';
import {
  CheckSquare,
  ArrowRight,
  UserCheck,
  UserX,
  X,
  Layers,
  Archive,
  ChevronDown,
  CheckCircle2,
  AlertCircle,
  Sparkles,
} from 'lucide-react';

interface KanbanBatchActionBarProps {
  selectedIds: string[];
  candidatos: Candidato[];
  totalFilteredCount: number;
  onClearSelection: () => void;
  onSelectAllFiltered: () => void;
  onBatchMoveEtapa: (ids: string[], novaEtapa: EtapaProcesso) => void;
  onBatchSetStatus: (ids: string[], status: StatusCandidato) => void;
}

export const KanbanBatchActionBar: React.FC<KanbanBatchActionBarProps> = ({
  selectedIds,
  candidatos,
  totalFilteredCount,
  onClearSelection,
  onSelectAllFiltered,
  onBatchMoveEtapa,
  onBatchSetStatus,
}) => {
  const [isMoveMenuOpen, setIsMoveMenuOpen] = useState(false);
  const [isStatusMenuOpen, setIsStatusMenuOpen] = useState(false);

  const moveMenuRef = useRef<HTMLDivElement>(null);
  const statusMenuRef = useRef<HTMLDivElement>(null);

  // Close menus on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (moveMenuRef.current && !moveMenuRef.current.contains(e.target as Node)) {
        setIsMoveMenuOpen(false);
      }
      if (statusMenuRef.current && !statusMenuRef.current.contains(e.target as Node)) {
        setIsStatusMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (selectedIds.length === 0) return null;

  const handleMove = (etapa: EtapaProcesso) => {
    onBatchMoveEtapa(selectedIds, etapa);
    setIsMoveMenuOpen(false);
  };

  const handleStatus = (status: StatusCandidato) => {
    onBatchSetStatus(selectedIds, status);
    setIsStatusMenuOpen(false);
  };

  return (
    <div
      id="kanban-floating-action-bar"
      className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 bg-gray-900/95 dark:bg-gray-800/95 text-white backdrop-blur-md px-4 py-2.5 rounded-2xl shadow-2xl border border-gray-700/80 dark:border-gray-600 flex items-center gap-3 sm:gap-4 max-w-[95vw] sm:max-w-xl animate-slideUp flex-wrap justify-center"
    >
      {/* Selected Counter & Clear */}
      <div className="flex items-center gap-2 pr-2 border-r border-gray-700 dark:border-gray-600">
        <span className="flex items-center justify-center w-6 h-6 rounded-full bg-[#00A9A1] text-white text-xs font-bold shadow-xs">
          {selectedIds.length}
        </span>
        <div className="flex flex-col text-left">
          <span className="text-xs font-bold leading-tight">
            {selectedIds.length === 1 ? '1 selecionado' : `${selectedIds.length} selecionados`}
          </span>
          <div className="flex items-center gap-1 text-[10px] text-gray-400">
            {selectedIds.length < totalFilteredCount ? (
              <button
                type="button"
                onClick={onSelectAllFiltered}
                className="text-[#00C4BB] hover:underline font-semibold"
              >
                Selecionar todos ({totalFilteredCount})
              </button>
            ) : (
              <span>Todos selecionados</span>
            )}
          </div>
        </div>
      </div>

      {/* Batch Move Stage Button & Dropdown */}
      <div ref={moveMenuRef} className="relative">
        <button
          id="btn-batch-move-etapa"
          type="button"
          onClick={() => {
            setIsMoveMenuOpen(!isMoveMenuOpen);
            setIsStatusMenuOpen(false);
          }}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#00A9A1] hover:bg-[#008f88] text-white text-xs font-bold transition-all shadow-xs active:scale-95"
        >
          <Layers className="w-3.5 h-3.5" />
          <span>Mover Etapa</span>
          <ChevronDown className="w-3 h-3" />
        </button>

        {isMoveMenuOpen && (
          <div
            id="batch-move-dropdown"
            className="absolute bottom-full left-0 mb-2 w-64 rounded-xl bg-white dark:bg-gray-850 text-gray-900 dark:text-gray-100 shadow-2xl border border-gray-200 dark:border-gray-700 py-1.5 z-50 animate-fadeIn"
          >
            <div className="px-3 py-1.5 border-b border-gray-100 dark:border-gray-700/70 text-[10px] font-bold text-gray-400 dark:text-gray-400 uppercase tracking-wider">
              Mover {selectedIds.length} candidato(s) para:
            </div>
            <div className="max-h-60 overflow-y-auto py-1">
              {ETAPAS_KANBAN.map((etapa) => (
                <button
                  key={etapa}
                  type="button"
                  onClick={() => handleMove(etapa)}
                  className="w-full text-left px-3 py-1.5 text-xs font-medium hover:bg-teal-50 dark:hover:bg-gray-800 hover:text-[#00857e] dark:hover:text-[#00C4BB] flex items-center justify-between transition-colors"
                >
                  <span>{etapa}</span>
                  <ArrowRight className="w-3 h-3 opacity-40 group-hover:opacity-100" />
                </button>
              ))}
              <div className="border-t border-gray-100 dark:border-gray-700/70 my-1" />
              <button
                type="button"
                onClick={() => handleMove('Banco de Talentos')}
                className="w-full text-left px-3 py-1.5 text-xs font-semibold text-amber-700 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950/50 flex items-center gap-1.5 transition-colors"
              >
                <Archive className="w-3.5 h-3.5" />
                <span>Banco de Talentos</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Batch Status Button & Dropdown */}
      <div ref={statusMenuRef} className="relative">
        <button
          id="btn-batch-set-status"
          type="button"
          onClick={() => {
            setIsStatusMenuOpen(!isStatusMenuOpen);
            setIsMoveMenuOpen(false);
          }}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gray-800 hover:bg-gray-700 dark:bg-gray-700 dark:hover:bg-gray-650 text-white text-xs font-bold transition-all border border-gray-700 dark:border-gray-600 active:scale-95"
        >
          <UserCheck className="w-3.5 h-3.5 text-emerald-400" />
          <span>Alterar Status</span>
          <ChevronDown className="w-3 h-3" />
        </button>

        {isStatusMenuOpen && (
          <div
            id="batch-status-dropdown"
            className="absolute bottom-full left-0 mb-2 w-56 rounded-xl bg-white dark:bg-gray-850 text-gray-900 dark:text-gray-100 shadow-2xl border border-gray-200 dark:border-gray-700 py-1.5 z-50 animate-fadeIn"
          >
            <div className="px-3 py-1.5 border-b border-gray-100 dark:border-gray-700/70 text-[10px] font-bold text-gray-400 dark:text-gray-400 uppercase tracking-wider">
              Definir status para {selectedIds.length} selecionado(s):
            </div>
            <div className="py-1 space-y-0.5">
              <button
                type="button"
                onClick={() => handleStatus('Em andamento')}
                className="w-full text-left px-3 py-1.5 text-xs font-medium hover:bg-teal-50 dark:hover:bg-teal-950/50 text-teal-700 dark:text-teal-300 flex items-center gap-2 transition-colors"
              >
                <span className="w-2 h-2 rounded-full bg-[#00A9A1]" />
                <span>Em andamento</span>
              </button>
              <button
                type="button"
                onClick={() => handleStatus('Aprovado')}
                className="w-full text-left px-3 py-1.5 text-xs font-medium hover:bg-emerald-50 dark:hover:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 flex items-center gap-2 transition-colors"
              >
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                <span>Aprovado</span>
              </button>
              <button
                type="button"
                onClick={() => handleStatus('Ausente')}
                className="w-full text-left px-3 py-1.5 text-xs font-medium hover:bg-amber-50 dark:hover:bg-amber-950/50 text-amber-700 dark:text-amber-300 flex items-center gap-2 transition-colors"
              >
                <span className="w-2 h-2 rounded-full bg-[#F7941D]" />
                <span>Ausente (Reagendar)</span>
              </button>
              <button
                type="button"
                onClick={() => handleStatus('Reprovado')}
                className="w-full text-left px-3 py-1.5 text-xs font-medium hover:bg-rose-50 dark:hover:bg-rose-950/50 text-rose-700 dark:text-rose-300 flex items-center gap-2 transition-colors"
              >
                <span className="w-2 h-2 rounded-full bg-rose-500" />
                <span>Reprovado</span>
              </button>
              <button
                type="button"
                onClick={() => handleStatus('Desistente')}
                className="w-full text-left px-3 py-1.5 text-xs font-medium hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300 flex items-center gap-2 transition-colors"
              >
                <span className="w-2 h-2 rounded-full bg-gray-400" />
                <span>Desistente</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Clear Selection Button */}
      <button
        type="button"
        onClick={onClearSelection}
        className="p-1 rounded-lg hover:bg-gray-800 dark:hover:bg-gray-700 text-gray-400 hover:text-white transition-colors"
        title="Desmarcar todos"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
};
