import React, { useMemo, useState } from 'react';
import {
  DndContext,
  DragOverlay,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragStartEvent,
  DragEndEvent,
} from '@dnd-kit/core';
import { sortableKeyboardCoordinates } from '@dnd-kit/sortable';
import { useApp } from '../../context/AppContext';
import { ETAPAS_KANBAN, UNIDADES_VOX } from '../../lib/rsConstants';
import { KanbanColumn } from './KanbanColumn';
import { KanbanAprovadosColumn } from './KanbanAprovadosColumn';
import { KanbanReprovadosColumn } from './KanbanReprovadosColumn';
import { KanbanCard } from './KanbanCard';
import { KanbanStatistics } from './KanbanStatistics';
import { KanbanBatchActionBar } from './KanbanBatchActionBar';
import { EtapaProcesso, Candidato, StatusCandidato, Vaga } from '../../types';
import { calculateVagaSLA } from '../../lib/formatters';
import {
  Filter,
  Plus,
  Search,
  Users,
  Video,
  UserX,
  AlertCircle,
  Sparkles,
  Layers,
  CheckCircle2,
  ArrowRight,
  ArrowUpDown,
  CheckSquare,
  BarChart3,
} from 'lucide-react';

export type KanbanSortOption = 'padrao' | 'sla' | 'interacao' | 'score';

export const KanbanBoard: React.FC = () => {
  const {
    vagas,
    candidatos,
    config,
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
    setCandidateModalId,
    setIsNewCandidateOpen,
    setWhatsAppModalCandidate,
    setColetivaScheduleVagaId,
    moveCandidatoEtapa,
    setCandidatoStatus,
    updateCandidato,
    toggleFluxoSimplificado,
    batchMoveEtapa,
    batchSetStatus,
  } = useApp();

  // Multi-selection state
  const [selectedCandidateIds, setSelectedCandidateIds] = useState<Set<string>>(new Set());

  // Sorting state
  const [sortBy, setSortBy] = useState<KanbanSortOption>('padrao');

  // Toggle for suspended statistics drawer
  const [showStatistics, setShowStatistics] = useState<boolean>(false);

  // Active dragged card state for Dnd-kit DragOverlay
  const [activeId, setActiveId] = useState<string | null>(null);
  const [feedbackToast, setFeedbackToast] = useState<{
    candName: string;
    fromEtapa: string;
    toEtapa: string;
  } | null>(null);
  const [batchFeedbackToast, setBatchFeedbackToast] = useState<string | null>(null);

  // Setup sensors with distance threshold to distinguish click from drag
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Map of vagas for fast lookups
  const vagasMap = useMemo(() => {
    const map = new Map<string, Vaga>();
    vagas.forEach((v) => map.set(v.id, v));
    return map;
  }, [vagas]);

  // Filter candidates
  const filteredCandidatos = useMemo(() => {
    return candidatos.filter((cand) => {
      // Unidade filter
      if (selectedUnidade !== 'TODAS' && cand.unidade !== selectedUnidade) {
        return false;
      }
      // Vaga filter
      if (selectedVagaFilter !== 'TODAS' && cand.vaga_id !== selectedVagaFilter) {
        return false;
      }
      // Status filter
      if (kanbanFilterStatus !== 'TODOS' && cand.status !== kanbanFilterStatus) {
        return false;
      }
      // Search term
      if (searchTerm.trim()) {
        const term = searchTerm.toLowerCase();
        const matchesName = cand.nome.toLowerCase().includes(term);
        const matchesEmail = cand.email.toLowerCase().includes(term);
        const matchesVaga = cand.vaga_titulo.toLowerCase().includes(term);
        const matchesPhone = cand.telefone.toLowerCase().includes(term);
        if (!matchesName && !matchesEmail && !matchesVaga && !matchesPhone) {
          return false;
        }
      }
      return true;
    });
  }, [candidatos, selectedUnidade, selectedVagaFilter, kanbanFilterStatus, searchTerm]);

  // Candidate sorting function
  const sortCandidatesList = (cands: Candidato[]): Candidato[] => {
    if (sortBy === 'padrao') return cands;

    return [...cands].sort((a, b) => {
      if (sortBy === 'sla') {
        const vagaA = vagasMap.get(a.vaga_id);
        const vagaB = vagasMap.get(b.vaga_id);
        const slaA = calculateVagaSLA(vagaA?.data_abertura || '', vagaA?.meta_sla_dias || 30);
        const slaB = calculateVagaSLA(vagaB?.data_abertura || '', vagaB?.meta_sla_dias || 30);

        // Overdue candidates come first
        if (slaA.isOverSla && !slaB.isOverSla) return -1;
        if (!slaA.isOverSla && slaB.isOverSla) return 1;

        // Higher SLA urgency first
        const diffA = slaA.diasAbertos - slaA.metaSla;
        const diffB = slaB.diasAbertos - slaB.metaSla;
        if (diffA !== diffB) return diffB - diffA;

        return (slaB.diasAbertos || 0) - (slaA.diasAbertos || 0);
      }

      if (sortBy === 'interacao') {
        const timeA = a.atualizado_em
          ? new Date(a.atualizado_em).getTime()
          : a.historico_etapas?.length
          ? new Date(a.historico_etapas[a.historico_etapas.length - 1].data).getTime()
          : new Date(a.criado_em || 0).getTime();

        const timeB = b.atualizado_em
          ? new Date(b.atualizado_em).getTime()
          : b.historico_etapas?.length
          ? new Date(b.historico_etapas[b.historico_etapas.length - 1].data).getTime()
          : new Date(b.criado_em || 0).getTime();

        return timeB - timeA;
      }

      if (sortBy === 'score') {
        const scoreA = (a.avaliacao_geral || 0) * 2 + (a.aula_teste_nota || 0);
        const scoreB = (b.avaliacao_geral || 0) * 2 + (b.aula_teste_nota || 0);
        if (scoreA !== scoreB) return scoreB - scoreA;
        return (b.avaliacao_geral || 0) - (a.avaliacao_geral || 0);
      }

      return 0;
    });
  };

  // Selection toggle handlers
  const handleToggleSelectCandidate = (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setSelectedCandidateIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const handleToggleSelectColumn = (etapa: EtapaProcesso) => {
    const columnCands = filteredCandidatos.filter((c) => c.etapa_processo === etapa);
    if (columnCands.length === 0) return;

    setSelectedCandidateIds((prev) => {
      const next = new Set(prev);
      const allSelected = columnCands.every((c) => next.has(c.id));
      if (allSelected) {
        columnCands.forEach((c) => next.delete(c.id));
      } else {
        columnCands.forEach((c) => next.add(c.id));
      }
      return next;
    });
  };

  const handleSelectAllFiltered = () => {
    const allIds = new Set(filteredCandidatos.map((c) => c.id));
    setSelectedCandidateIds(allIds);
  };

  const handleClearSelection = () => {
    setSelectedCandidateIds(new Set());
  };

  // Batch actions
  const handleBatchMove = (ids: string[], novaEtapa: EtapaProcesso) => {
    batchMoveEtapa(ids, novaEtapa);
    setBatchFeedbackToast(`${ids.length} candidato(s) movido(s) para "${novaEtapa}" com sucesso.`);
    setSelectedCandidateIds(new Set());
    setTimeout(() => setBatchFeedbackToast(null), 4000);
  };

  const handleBatchStatus = (ids: string[], status: StatusCandidato) => {
    batchSetStatus(ids, status);
    setBatchFeedbackToast(`Status de ${ids.length} candidato(s) alterado para "${status}".`);
    setSelectedCandidateIds(new Set());
    setTimeout(() => setBatchFeedbackToast(null), 4000);
  };

  // Active candidate being dragged for overlay
  const activeCandidate = useMemo(() => {
    if (!activeId) return null;
    return candidatos.find((c) => c.id === activeId) || null;
  }, [activeId, candidatos]);

  const activeVaga = useMemo(() => {
    if (!activeCandidate) return undefined;
    return vagas.find((v) => v.id === activeCandidate.vaga_id);
  }, [activeCandidate, vagas]);

  // Drag handlers
  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);

    if (!over) return;

    const activeCandId = active.id as string;
    const activeCand = candidatos.find((c) => c.id === activeCandId);
    if (!activeCand) return;

    // Check if dropping onto the Aprovados column
    const isDroppingOnAprovados =
      over.id === 'column-aprovados' ||
      over.data?.current?.isAprovados ||
      over.id === 'aprovados';

    if (isDroppingOnAprovados) {
      if (activeCand.status !== 'Aprovado') {
        setCandidatoStatus(activeCandId, 'Aprovado');
        setFeedbackToast({
          candName: activeCand.nome,
          fromEtapa: activeCand.etapa_processo,
          toEtapa: 'Lista Suspensa de Aprovados',
        });
        setTimeout(() => {
          setFeedbackToast((prev) => (prev?.candName === activeCand.nome ? null : prev));
        }, 3500);
      }
      return;
    }

    // Check if dropping onto the Reprovados column
    const isDroppingOnReprovados =
      over.id === 'column-reprovados' ||
      over.data?.current?.isReprovados ||
      over.id === 'reprovados';

    if (isDroppingOnReprovados) {
      if (activeCand.status !== 'Reprovado') {
        const defaultMotivo =
          activeCand.motivo_reprovacao || `Reprovado durante a etapa "${activeCand.etapa_processo}"`;
        setCandidatoStatus(activeCandId, 'Reprovado', defaultMotivo);
        setFeedbackToast({
          candName: activeCand.nome,
          fromEtapa: activeCand.etapa_processo,
          toEtapa: 'Lista Suspensa de Reprovados',
        });
        setTimeout(() => {
          setFeedbackToast((prev) => (prev?.candName === activeCand.nome ? null : prev));
        }, 3500);
      }
      return;
    }

    let targetEtapa: EtapaProcesso | null = null;

    // Check if over target is a column
    if (ETAPAS_KANBAN.includes(over.id as EtapaProcesso)) {
      targetEtapa = over.id as EtapaProcesso;
    } else if (over.data?.current?.type === 'column') {
      targetEtapa = over.data.current.etapa as EtapaProcesso;
    } else {
      // Over another candidate card in a column
      const overCand = candidatos.find((c) => c.id === over.id);
      if (overCand) {
        targetEtapa = overCand.etapa_processo;
      } else if (over.data?.current?.etapa) {
        targetEtapa = over.data.current.etapa as EtapaProcesso;
      }
    }

    if (targetEtapa) {
      const fromEtapa = activeCand.etapa_processo;
      const wasReprovado = activeCand.status === 'Reprovado';

      if (wasReprovado) {
        setCandidatoStatus(activeCandId, 'Em andamento');
      }

      if (activeCand.etapa_processo !== targetEtapa || wasReprovado) {
        moveCandidatoEtapa(
          activeCandId,
          targetEtapa,
          wasReprovado ? `Reativado para ${targetEtapa}` : undefined
        );

        // Show brief notification toast
        setFeedbackToast({
          candName: activeCand.nome,
          fromEtapa: wasReprovado ? 'Reprovados' : fromEtapa,
          toEtapa: targetEtapa,
        });

        setTimeout(() => {
          setFeedbackToast((prev) => (prev?.candName === activeCand.nome ? null : prev));
        }, 3500);
      }
    }
  };

  // Quick stats
  const totalNoBoard = filteredCandidatos.length;
  const totalVideo = filteredCandidatos.filter(
    (c) => c.etapa_processo === 'Vídeo de Apresentação' && c.status !== 'Reprovado'
  ).length;
  const totalColetiva = filteredCandidatos.filter(
    (c) => c.etapa_processo === 'Entrevista Coletiva/Online' && c.status === 'Em andamento'
  ).length;
  const totalAusentes = filteredCandidatos.filter((c) => c.status === 'Ausente').length;
  const totalReprovados = filteredCandidatos.filter((c) => c.status === 'Reprovado').length;

  const selectedIdsArray = Array.from(selectedCandidateIds);

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="flex flex-col h-full space-y-2 relative overflow-hidden min-h-0">
        {/* Suspended Compact Filter & Action Toolbar */}
        <div
          id="kanban-header-toolbar"
          className="rounded-xl border border-gray-200/90 dark:border-gray-800 bg-white/95 dark:bg-gray-850/95 p-2 sm:p-2.5 shadow-xs backdrop-blur-xs flex-shrink-0 z-20 transition-all"
        >
          <div className="flex flex-wrap items-center justify-between gap-2">
            {/* Left Controls: Search, Selectors & Filters */}
            <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 flex-1 min-w-0">
              {/* Search Input */}
              <div className="relative min-w-[150px] sm:min-w-[190px] flex-1 max-w-xs">
                <Search className="w-3.5 h-3.5 text-gray-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                <input
                  id="search-candidatos-kanban"
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Buscar candidato, vaga..."
                  className="w-full pl-7 pr-6 py-1 text-xs rounded-lg border border-gray-200 dark:border-gray-700 focus:outline-none focus:ring-1 focus:ring-[#00A9A1] dark:focus:ring-[#00C4BB] focus:border-transparent bg-gray-50/70 dark:bg-gray-750 text-gray-900 dark:text-gray-100 font-medium"
                />
                {searchTerm && (
                  <button
                    type="button"
                    onClick={() => setSearchTerm('')}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 text-xs font-bold"
                  >
                    ×
                  </button>
                )}
              </div>

              {/* Unidade Selector */}
              <select
                id="filter-unidade-kanban"
                value={selectedUnidade}
                onChange={(e) => setSelectedUnidade(e.target.value)}
                aria-label="Filtrar por Unidade"
                className="py-1 px-2.5 text-xs rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 font-semibold text-gray-700 dark:text-gray-200 focus:outline-none focus:ring-1 focus:ring-[#00A9A1] dark:focus:ring-[#00C4BB]"
              >
                <option value="TODAS">🏢 9 Unidades</option>
                {UNIDADES_VOX.map((u) => (
                  <option key={u} value={u}>
                    {u}
                  </option>
                ))}
              </select>

              {/* Vaga Selector */}
              <select
                id="filter-vaga-kanban"
                value={selectedVagaFilter}
                onChange={(e) => setSelectedVagaFilter(e.target.value)}
                aria-label="Filtrar por Vaga"
                className="py-1 px-2.5 text-xs rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 font-semibold text-gray-700 dark:text-gray-200 focus:outline-none focus:ring-1 focus:ring-[#00A9A1] dark:focus:ring-[#00C4BB] max-w-[160px] sm:max-w-[200px] truncate"
              >
                <option value="TODAS">💼 Todas as Vagas</option>
                {vagas
                  .filter((v) => v.status === 'Em aberto')
                  .map((v) => (
                    <option key={v.id} value={v.id}>
                      {v.titulo} ({v.unidade.replace('Vox ', '')})
                    </option>
                  ))}
              </select>

              {/* Status Filter */}
              <select
                id="filter-status-kanban"
                value={kanbanFilterStatus}
                onChange={(e) => setKanbanFilterStatus(e.target.value)}
                aria-label="Filtrar por Status"
                className="py-1 px-2.5 text-xs rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 font-semibold text-gray-700 dark:text-gray-200 focus:outline-none focus:ring-1 focus:ring-[#00A9A1] dark:focus:ring-[#00C4BB]"
              >
                <option value="TODOS">Todos Status</option>
                <option value="Em andamento">🟢 Em andamento</option>
                <option value="Ausente">🟡 Ausente</option>
                <option value="Aprovado">🔵 Aprovado</option>
                <option value="Reprovado">⚪ Reprovado</option>
              </select>

              {/* Sorting Filter Dropdown */}
              <div className="relative flex items-center">
                <ArrowUpDown className="w-3 h-3 text-[#00A9A1] dark:text-[#00C4BB] absolute left-2 pointer-events-none" />
                <select
                  id="filter-sort-kanban"
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as KanbanSortOption)}
                  aria-label="Ordenar candidatos"
                  className="py-1 pl-6 pr-2 text-xs rounded-lg border border-teal-200 dark:border-teal-800 bg-teal-50/50 dark:bg-teal-950/40 font-semibold text-[#00857e] dark:text-[#00C4BB] focus:outline-none focus:ring-1 focus:ring-[#00A9A1] dark:focus:ring-[#00C4BB] cursor-pointer"
                >
                  <option value="padrao">Padrão</option>
                  <option value="sla">⏳ SLA</option>
                  <option value="interacao">💬 Interação</option>
                  <option value="score">⭐ Score</option>
                </select>
              </div>

              {/* Micro Status Indicators */}
              <div className="hidden xl:flex items-center gap-1.5 pl-1 text-[11px]">
                <span className="font-semibold text-gray-500 dark:text-gray-400">
                  Total: <strong className="text-gray-900 dark:text-white">{totalNoBoard}</strong>
                </span>

                <button
                  type="button"
                  onClick={() => setKanbanFilterStatus(kanbanFilterStatus === 'Ausente' ? 'TODOS' : 'Ausente')}
                  className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full font-bold transition-colors ${
                    kanbanFilterStatus === 'Ausente'
                      ? 'bg-[#F7941D] dark:bg-[#FFA336] text-white'
                      : 'bg-amber-100 dark:bg-amber-950/60 text-amber-900 dark:text-amber-300 hover:bg-amber-200'
                  }`}
                  title="Filtrar Ausentes"
                >
                  <UserX className="w-3 h-3" />
                  <span>{totalAusentes}</span>
                </button>

                <button
                  type="button"
                  onClick={() => setKanbanFilterStatus(kanbanFilterStatus === 'Reprovado' ? 'TODOS' : 'Reprovado')}
                  className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full font-bold transition-colors ${
                    kanbanFilterStatus === 'Reprovado'
                      ? 'bg-rose-600 text-white'
                      : 'bg-rose-100 dark:bg-rose-950/60 text-rose-800 dark:text-rose-300 hover:bg-rose-200'
                  }`}
                  title="Filtrar Reprovados"
                >
                  <span>{totalReprovados} Repr.</span>
                </button>
              </div>
            </div>

            {/* Right Action Buttons */}
            <div className="flex items-center gap-1.5 flex-shrink-0">
              {/* Toggle Statistics Drawer Button */}
              <button
                type="button"
                id="btn-toggle-kanban-stats"
                onClick={() => setShowStatistics(!showStatistics)}
                className={`inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-semibold border transition-all ${
                  showStatistics
                    ? 'bg-[#00A9A1] text-white border-[#00A9A1] shadow-2xs'
                    : 'bg-gray-50 dark:bg-gray-750 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 border-gray-200 dark:border-gray-700'
                }`}
                title="Ver/Ocultar painel de estatísticas e métricas de contratação"
              >
                <BarChart3 className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Estatísticas</span>
              </button>

              <button
                id="btn-select-all-filtered"
                type="button"
                onClick={
                  selectedCandidateIds.size === filteredCandidatos.length && filteredCandidatos.length > 0
                    ? handleClearSelection
                    : handleSelectAllFiltered
                }
                className="hidden md:inline-flex items-center gap-1.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-750 hover:bg-gray-100 dark:hover:bg-gray-700 px-2.5 py-1 text-xs font-semibold text-gray-700 dark:text-gray-200 transition-colors"
                title="Selecionar / Desmarcar todos os candidatos visíveis no Kanban"
              >
                <CheckSquare className="w-3.5 h-3.5 text-[#00A9A1] dark:text-[#00C4BB]" />
                <span>
                  {selectedCandidateIds.size > 0 &&
                  selectedCandidateIds.size === filteredCandidatos.length
                    ? 'Desmarcar'
                    : `Sel. Todos (${filteredCandidatos.length})`}
                </span>
              </button>

              <button
                id="btn-novo-candidato-kanban"
                type="button"
                onClick={() => setIsNewCandidateOpen(true)}
                className="inline-flex items-center gap-1.5 rounded-lg bg-[#00A9A1] hover:bg-[#008f88] dark:bg-[#00C4BB] dark:hover:bg-[#00dfd5] dark:text-gray-950 px-3 py-1 text-xs font-bold text-white shadow-xs active:scale-[0.98] transition-all"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Novo Candidato</span>
              </button>
            </div>
          </div>
        </div>

        {/* Kanban Statistics Drawer (Expandable when toggled) */}
        {showStatistics && (
          <div className="flex-shrink-0 animate-slideDown">
            <KanbanStatistics
              candidatos={filteredCandidatos}
              vagas={vagas}
              config={config}
              selectedEtapaFilter={kanbanFilterEtapa}
              onSelectEtapaFilter={(etapa) => setKanbanFilterEtapa(etapa)}
            />
          </div>
        )}

        {/* Active Stage Filter Banner (if an individual stage is selected from Statistics) */}
        {kanbanFilterEtapa && kanbanFilterEtapa !== 'TODAS' && (
          <div className="flex items-center justify-between gap-3 px-3 py-1.5 rounded-lg bg-teal-50 dark:bg-teal-950/50 border border-teal-200 dark:border-teal-800 text-xs font-semibold text-[#00857e] dark:text-[#00C4BB] flex-shrink-0">
            <div className="flex items-center gap-2">
              <Layers className="w-3.5 h-3.5" />
              <span>
                Filtro ativo por coluna: <strong>{kanbanFilterEtapa}</strong>
              </span>
            </div>
            <button
              type="button"
              onClick={() => setKanbanFilterEtapa('TODAS')}
              className="px-2 py-0.5 rounded bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700 text-xs font-bold transition-all shadow-2xs"
            >
              Mostrar Todas as 8 Etapas
            </button>
          </div>
        )}

        {/* Transition Feedback Toast */}
        {feedbackToast && (
          <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 rounded-lg bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 px-4 py-2 text-xs font-semibold shadow-xl border border-teal-500 animate-slideUp">
            <CheckCircle2 className="w-4 h-4 text-[#00A9A1]" />
            <span>
              <strong>{feedbackToast.candName}</strong> movido para <strong>{feedbackToast.toEtapa}</strong>
            </span>
          </div>
        )}

        {/* Batch Feedback Toast */}
        {batchFeedbackToast && (
          <div className="fixed bottom-20 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2.5 rounded-xl bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 px-4 py-2 text-xs font-semibold shadow-2xl border border-[#00A9A1] animate-slideUp">
            <CheckCircle2 className="w-4 h-4 text-[#00A9A1]" />
            <span>{batchFeedbackToast}</span>
          </div>
        )}

        {/* Kanban Columns (Full-Height Trello Board Layout: Horizontal Board Scroll & Column-Level Vertical Scroll) */}
        <div className="flex-1 overflow-x-auto overflow-y-hidden pt-0.5 pb-1 flex items-stretch gap-3 min-h-0">
          <div className="flex items-stretch gap-3 min-w-max h-full">
            {(kanbanFilterEtapa && kanbanFilterEtapa !== 'TODAS'
              ? ETAPAS_KANBAN.filter((e) => e === kanbanFilterEtapa)
              : ETAPAS_KANBAN
            ).map((etapa) => {
              const candidatosEtapa = filteredCandidatos.filter(
                (c) =>
                  c.etapa_processo === etapa &&
                  (kanbanFilterStatus === 'Reprovado' ? c.status === 'Reprovado' : c.status !== 'Reprovado')
              );
              const sortedCandidatosEtapa = sortCandidatesList(candidatosEtapa);

              return (
                <KanbanColumn
                  key={etapa}
                  etapa={etapa}
                  candidatos={sortedCandidatosEtapa}
                  vagas={vagas}
                  fluxoSimplificadoCargo={config.fluxo_simplificado_cargo || 'Professor'}
                  minColetiva={config.min_coletiva || 5}
                  selectedCandidateIds={selectedCandidateIds}
                  onToggleSelectCandidate={handleToggleSelectCandidate}
                  onToggleSelectColumn={handleToggleSelectColumn}
                  onOpenModal={(id) => setCandidateModalId(id)}
                  onOpenWhatsApp={(cand) => setWhatsAppModalCandidate(cand)}
                  onMoveEtapa={(id, nextEtapa) => moveCandidatoEtapa(id, nextEtapa)}
                  onToggleFluxo={(id) => toggleFluxoSimplificado(id)}
                  onSetStatus={(id, status) => setCandidatoStatus(id, status)}
                  onAgendarColetiva={(vagaId) => setColetivaScheduleVagaId(vagaId)}
                />
              );
            })}

            {/* Coluna Suspensa de Candidatos Aprovados */}
            {(!kanbanFilterEtapa ||
              kanbanFilterEtapa === 'TODAS' ||
              kanbanFilterEtapa === 'Banco de Talentos' ||
              kanbanFilterStatus === 'Aprovado') && (
              <KanbanAprovadosColumn
                candidatos={filteredCandidatos}
                vagas={vagas}
                onOpenModal={(id) => setCandidateModalId(id)}
                onOpenWhatsApp={(cand) => setWhatsAppModalCandidate(cand)}
                onReativarCandidato={(id, novaEtapa) => {
                  setCandidatoStatus(id, 'Em andamento');
                  moveCandidatoEtapa(id, novaEtapa, 'Candidato movido da lista suspensa de aprovados.');
                  setBatchFeedbackToast(`Candidato movido com sucesso para "${novaEtapa}".`);
                  setTimeout(() => setBatchFeedbackToast(null), 3500);
                }}
              />
            )}

            {/* Coluna Suspensa de Candidatos Reprovados */}
            {(!kanbanFilterEtapa ||
              kanbanFilterEtapa === 'TODAS' ||
              kanbanFilterEtapa === 'Banco de Talentos' ||
              kanbanFilterStatus === 'Reprovado') && (
              <KanbanReprovadosColumn
                candidatos={filteredCandidatos}
                vagas={vagas}
                onOpenModal={(id) => setCandidateModalId(id)}
                onOpenWhatsApp={(cand) => setWhatsAppModalCandidate(cand)}
                onReativarCandidato={(id, novaEtapa) => {
                  setCandidatoStatus(id, 'Em andamento');
                  moveCandidatoEtapa(id, novaEtapa, 'Candidato reativado da lista suspensa de reprovações.');
                  setBatchFeedbackToast(`Candidato reativado com sucesso para "${novaEtapa}".`);
                  setTimeout(() => setBatchFeedbackToast(null), 3500);
                }}
                onUpdateMotivo={(id, novoMotivo) => {
                  updateCandidato(id, { motivo_reprovacao: novoMotivo });
                  setBatchFeedbackToast('Motivo de reprovação atualizado com sucesso.');
                  setTimeout(() => setBatchFeedbackToast(null), 3000);
                }}
              />
            )}
          </div>
        </div>

        {/* Floating Batch Action Bar for multi-selected candidates */}
        <KanbanBatchActionBar
          selectedIds={selectedIdsArray}
          candidatos={filteredCandidatos}
          totalFilteredCount={filteredCandidatos.length}
          onClearSelection={handleClearSelection}
          onSelectAllFiltered={handleSelectAllFiltered}
          onBatchMoveEtapa={handleBatchMove}
          onBatchSetStatus={handleBatchStatus}
        />

        {/* Smooth DragOverlay for floating dragged card */}
        <DragOverlay dropAnimation={{ duration: 180, easing: 'cubic-bezier(0.18, 0.67, 0.6, 1.22)' }}>
          {activeCandidate ? (
            <div className="w-[274px]">
              <KanbanCard
                candidato={activeCandidate}
                vaga={activeVaga}
                fluxoSimplificadoCargo={config.fluxo_simplificado_cargo || 'Professor'}
                onOpenModal={() => {}}
                onOpenWhatsApp={() => {}}
                onMoveEtapa={() => {}}
                onToggleFluxo={() => {}}
                onSetStatus={() => {}}
                isOverlay
              />
            </div>
          ) : null}
        </DragOverlay>
      </div>
    </DndContext>
  );
};
