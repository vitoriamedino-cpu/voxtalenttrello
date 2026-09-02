import React, { useState, useMemo } from 'react';
import { useDroppable } from '@dnd-kit/core';
import { Candidato, Vaga, EtapaProcesso } from '../../types';
import { ETAPAS_KANBAN, MOTIVOS_REPROVACAO_PRESET } from '../../lib/rsConstants';
import {
  UserX,
  Search,
  Filter,
  RefreshCw,
  MessageCircle,
  ChevronRight,
  AlertCircle,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  RotateCcw,
  Sparkles,
  Edit2,
  Check,
  X,
  Compass,
  PhoneCall,
  Video,
  Users,
  Award,
  CheckCircle,
  Archive,
} from 'lucide-react';

interface KanbanReprovadosColumnProps {
  candidatos: Candidato[];
  vagas: Vaga[];
  onOpenModal: (id: string) => void;
  onOpenWhatsApp: (cand: Candidato) => void;
  onReativarCandidato: (id: string, novaEtapa: EtapaProcesso) => void;
  onUpdateMotivo: (id: string, novoMotivo: string) => void;
}

const ETAPA_ICONS: Record<EtapaProcesso, React.ReactNode> = {
  Triagem: <Compass className="w-3.5 h-3.5 text-slate-500" />,
  '1º Contato': <PhoneCall className="w-3.5 h-3.5 text-sky-500" />,
  'Vídeo de Apresentação': <Video className="w-3.5 h-3.5 text-orange-500" />,
  'Entrevista Coletiva/Online': <Users className="w-3.5 h-3.5 text-indigo-500" />,
  'Etapa Prática': <Award className="w-3.5 h-3.5 text-teal-600" />,
  Gestor: <CheckCircle className="w-3.5 h-3.5 text-blue-600" />,
  Diretoria: <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />,
  'Banco de Talentos': <Archive className="w-3.5 h-3.5 text-amber-600" />,
};

export const KanbanReprovadosColumn: React.FC<KanbanReprovadosColumnProps> = ({
  candidatos,
  vagas,
  onOpenModal,
  onOpenWhatsApp,
  onReativarCandidato,
  onUpdateMotivo,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterEtapa, setFilterEtapa] = useState<string>('TODAS');
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [editingMotivoId, setEditingMotivoId] = useState<string | null>(null);
  const [tempMotivoText, setTempMotivoText] = useState('');
  const [reativarMenuId, setReativarMenuId] = useState<string | null>(null);

  // Droppable setup
  const { setNodeRef, isOver } = useDroppable({
    id: 'column-reprovados',
    data: {
      type: 'reprovados-column',
      isReprovados: true,
    },
  });

  // Filter rejected candidates
  const filteredReprovados = useMemo(() => {
    return candidatos.filter((cand) => {
      // Must be Reprovado
      if (cand.status !== 'Reprovado') return false;

      // Filter by rejection stage
      if (filterEtapa !== 'TODAS' && cand.etapa_processo !== filterEtapa) {
        return false;
      }

      // Filter by search term
      if (searchTerm.trim()) {
        const term = searchTerm.toLowerCase();
        const matchesName = cand.nome.toLowerCase().includes(term);
        const matchesVaga = cand.vaga_titulo.toLowerCase().includes(term);
        const matchesMotivo = (cand.motivo_reprovacao || '').toLowerCase().includes(term);
        const matchesUnidade = cand.unidade.toLowerCase().includes(term);
        if (!matchesName && !matchesVaga && !matchesMotivo && !matchesUnidade) {
          return false;
        }
      }

      return true;
    });
  }, [candidatos, filterEtapa, searchTerm]);

  const totalReprovados = candidatos.filter((c) => c.status === 'Reprovado').length;

  const handleStartEditMotivo = (cand: Candidato, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingMotivoId(cand.id);
    setTempMotivoText(cand.motivo_reprovacao || '');
  };

  const handleSaveMotivo = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    onUpdateMotivo(id, tempMotivoText.trim());
    setEditingMotivoId(null);
  };

  const handleCancelEditMotivo = (e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingMotivoId(null);
    setTempMotivoText('');
  };

  return (
    <div
      ref={setNodeRef}
      id="kanban-col-reprovados-suspensa"
      className={`flex flex-col flex-shrink-0 rounded-xl transition-all duration-200 h-full max-h-full overflow-hidden ${
        isCollapsed ? 'w-[68px] min-w-[68px]' : 'min-w-[280px] max-w-[310px] w-[295px]'
      } ${
        isOver
          ? 'bg-rose-50/80 dark:bg-rose-950/50 border-2 border-rose-500 dark:border-rose-400 ring-2 ring-rose-500/30 scale-[1.01]'
          : 'bg-slate-50 dark:bg-gray-800/70 border border-slate-300 dark:border-gray-700/90 shadow-xs'
      }`}
    >
      {/* Smaller & Suspended Column Header */}
      <div
        className={`sticky top-0 z-10 px-2.5 py-1.5 bg-white/95 dark:bg-gray-800/95 backdrop-blur-xs rounded-t-xl flex items-center justify-between border-b-2 flex-shrink-0 shadow-2xs ${
          isOver
            ? 'border-rose-500 dark:border-rose-400 bg-rose-50/40 dark:bg-rose-950/40'
            : 'border-slate-400 dark:border-slate-600'
        }`}
      >
        <div className="flex items-center gap-1.5 truncate">
          <div className="p-0.5 rounded bg-rose-100 dark:bg-rose-950/80 text-rose-700 dark:text-rose-300 flex items-center justify-center">
            <UserX className="w-3.5 h-3.5" />
          </div>
          {!isCollapsed && (
            <div className="truncate">
              <h3
                className="font-bold text-[11px] uppercase tracking-wider text-slate-800 dark:text-slate-200 truncate flex items-center gap-1"
                title="Candidatos Reprovados (Lista Suspensa)"
              >
                <span>Reprovados</span>
                <span className="text-[9px] font-normal text-slate-500 dark:text-slate-400 capitalize">
                  (Suspensa)
                </span>
              </h3>
            </div>
          )}
        </div>

        <div className="flex items-center gap-1">
          <span
            className={`text-[10px] font-extrabold px-1.5 py-0.5 rounded-full transition-colors ${
              totalReprovados > 0
                ? 'bg-rose-100 dark:bg-rose-950/80 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800'
                : 'bg-gray-200/60 dark:bg-gray-700 text-gray-500 dark:text-gray-400'
            }`}
          >
            {totalReprovados}
          </span>

          <button
            type="button"
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-1 rounded text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-slate-800 dark:hover:text-slate-200 transition-colors"
            title={isCollapsed ? 'Expandir Lista de Reprovados' : 'Recolher Coluna'}
          >
            {isCollapsed ? <ChevronRight className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* Collapsed View Mini Banner */}
      {isCollapsed ? (
        <div
          onClick={() => setIsCollapsed(false)}
          className="flex-1 flex flex-col items-center justify-center p-3 cursor-pointer hover:bg-rose-50/50 dark:hover:bg-rose-950/30 transition-colors space-y-4"
          title="Clique para expandir a lista de candidatos reprovados"
        >
          <div className="[writing-mode:vertical-lr] rotate-180 font-bold text-xs uppercase tracking-wider text-slate-600 dark:text-slate-300 flex items-center gap-2">
            <UserX className="w-4 h-4 text-rose-600 dark:text-rose-400 rotate-90" />
            <span>Reprovações ({totalReprovados})</span>
          </div>
          <span className="text-[10px] font-semibold text-[#00857e] dark:text-[#00C4BB] underline">
            Expandir
          </span>
        </div>
      ) : (
        <div className="flex flex-col flex-1 overflow-hidden min-h-0">
          {/* Subheader Filters & Search */}
          <div className="p-1.5 bg-slate-50/80 dark:bg-gray-850/80 border-b border-slate-200 dark:border-gray-700/80 space-y-1 flex-shrink-0">
            {/* Search Input */}
            <div className="relative">
              <Search className="w-3 h-3 text-slate-400 absolute left-2 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Buscar por nome, motivo..."
                className="w-full pl-7 pr-2 py-1 text-[11px] rounded border border-slate-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-rose-500 dark:focus:ring-rose-400"
              />
              {searchTerm && (
                <button
                  type="button"
                  onClick={() => setSearchTerm('')}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs font-bold"
                >
                  ×
                </button>
              )}
            </div>

            {/* Filter by Rejection Stage */}
            <div className="flex items-center gap-1 text-[10px]">
              <Filter className="w-2.5 h-2.5 text-slate-400 flex-shrink-0" />
              <select
                value={filterEtapa}
                onChange={(e) => setFilterEtapa(e.target.value)}
                aria-label="Filtrar por etapa de reprovação"
                className="w-full py-0.5 px-1.5 text-[10px] font-semibold rounded border border-slate-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-rose-500"
              >
                <option value="TODAS">Todas etapas reprovadas</option>
                {ETAPAS_KANBAN.map((et) => (
                  <option key={et} value={et}>
                    {et}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Drag over guide indicator */}
          {isOver && (
            <div className="mx-1.5 mt-1.5 py-1 px-2 bg-rose-100 dark:bg-rose-950/70 border border-dashed border-rose-500 rounded text-center animate-pulse flex-shrink-0">
              <p className="text-[10px] font-bold text-rose-700 dark:text-rose-300 flex items-center justify-center gap-1">
                <UserX className="w-3.5 h-3.5" />
                Solte para marcar como Reprovado
              </p>
            </div>
          )}

          {/* Candidates List (Internal Column Scroll) */}
          <div className="flex-1 overflow-y-auto p-1.5 space-y-2 min-h-0">
            {filteredReprovados.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-32 rounded border border-dashed border-slate-300 dark:border-gray-700 bg-white/60 dark:bg-gray-800/40 p-3 text-center">
                <UserX className="w-6 h-6 text-slate-300 dark:text-slate-600 mb-1" />
                <p className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                  {searchTerm || filterEtapa !== 'TODAS'
                    ? 'Nenhum reprovado com os filtros atuais'
                    : 'Nenhum candidato reprovado registrado'}
                </p>
                <p className="text-[9px] text-slate-400 dark:text-slate-500 mt-1">
                  Arraste cards para cá para arquivar com motivo de reprovação
                </p>
              </div>
            ) : (
              filteredReprovados.map((cand) => {
                const vagaObj = vagas.find((v) => v.id === cand.vaga_id);
                const isEditingThis = editingMotivoId === cand.id;
                const isReativarOpen = reativarMenuId === cand.id;

                return (
                  <div
                    key={cand.id}
                    id={`cand-reprovado-card-${cand.id}`}
                    className="group relative rounded-lg bg-white dark:bg-gray-800 p-3 border-l-4 border-l-rose-500 border border-slate-200/90 dark:border-gray-700 shadow-xs hover:shadow-sm transition-all text-xs"
                  >
                    {/* Header: Name, Unit, and Rejection Stage */}
                    <div className="flex items-start justify-between gap-1.5 mb-1.5">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5">
                          <h4
                            onClick={() => onOpenModal(cand.id)}
                            className="font-bold text-xs text-slate-900 dark:text-white truncate hover:text-[#00A9A1] dark:hover:text-[#00C4BB] cursor-pointer"
                            title={cand.nome}
                          >
                            {cand.nome}
                          </h4>
                        </div>
                        <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate mt-0.5">
                          {cand.vaga_titulo} • <strong className="text-slate-700 dark:text-slate-300">{cand.unidade.replace('Vox ', '')}</strong>
                        </p>
                      </div>

                      <span className="flex-shrink-0 px-1.5 py-0.5 rounded bg-rose-100/80 dark:bg-rose-950 text-rose-800 dark:text-rose-300 font-extrabold text-[9px] border border-rose-200 dark:border-rose-900">
                        Reprovado
                      </span>
                    </div>

                    {/* Stage at Rejection (Etapa em que foi Reprovado) */}
                    <div className="mb-2 p-1.5 rounded bg-slate-50 dark:bg-gray-750 border border-slate-200 dark:border-gray-700 flex items-center justify-between text-[10px]">
                      <div className="flex items-center gap-1 text-slate-700 dark:text-slate-300 font-semibold truncate">
                        <span className="p-0.5 rounded bg-white dark:bg-gray-800">
                          {ETAPA_ICONS[cand.etapa_processo] || <UserX className="w-3 h-3 text-rose-500" />}
                        </span>
                        <span className="text-slate-500 dark:text-slate-400 font-normal">Etapa de Reprovação:</span>
                        <strong className="text-slate-900 dark:text-white truncate">{cand.etapa_processo}</strong>
                      </div>
                    </div>

                    {/* Negative Reason Box (Motivo da Reprovação) */}
                    <div className="mb-2.5 rounded bg-rose-50/70 dark:bg-rose-950/40 p-2 border border-rose-200/80 dark:border-rose-900/60">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[9px] font-bold uppercase tracking-wider text-rose-800 dark:text-rose-300 flex items-center gap-1">
                          <AlertCircle className="w-3 h-3 text-rose-600 dark:text-rose-400" />
                          Motivo da Reprovação:
                        </span>
                        {!isEditingThis && (
                          <button
                            type="button"
                            onClick={(e) => handleStartEditMotivo(cand, e)}
                            className="text-[9px] font-semibold text-rose-700 dark:text-rose-300 hover:text-rose-900 dark:hover:text-white flex items-center gap-0.5 transition-colors"
                            title="Editar ou alterar motivo"
                          >
                            <Edit2 className="w-2.5 h-2.5" />
                            <span>Editar</span>
                          </button>
                        )}
                      </div>

                      {isEditingThis ? (
                        <div className="space-y-1.5 mt-1" onClick={(e) => e.stopPropagation()}>
                          {/* Quick Preset Selector */}
                          <select
                            onChange={(e) => {
                              if (e.target.value) setTempMotivoText(e.target.value);
                            }}
                            className="w-full text-[10px] p-1 rounded border border-rose-300 dark:border-rose-700 bg-white dark:bg-gray-800 text-slate-800 dark:text-slate-200 focus:outline-none"
                          >
                            <option value="">-- Selecionar Motivo Padrão --</option>
                            {MOTIVOS_REPROVACAO_PRESET.map((motivo) => (
                              <option key={motivo} value={motivo}>
                                {motivo}
                              </option>
                            ))}
                          </select>

                          <textarea
                            rows={2}
                            value={tempMotivoText}
                            onChange={(e) => setTempMotivoText(e.target.value)}
                            placeholder="Descreva o motivo detalhado..."
                            className="w-full text-[10px] p-1.5 rounded border border-rose-300 dark:border-rose-700 bg-white dark:bg-gray-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-rose-500"
                          />

                          <div className="flex items-center justify-end gap-1">
                            <button
                              type="button"
                              onClick={handleCancelEditMotivo}
                              className="px-2 py-0.5 rounded text-[9px] font-semibold bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200"
                            >
                              Cancelar
                            </button>
                            <button
                              type="button"
                              onClick={(e) => handleSaveMotivo(cand.id, e)}
                              className="px-2 py-0.5 rounded text-[9px] font-bold bg-rose-600 text-white hover:bg-rose-700 flex items-center gap-1 shadow-2xs"
                            >
                              <Check className="w-2.5 h-2.5" />
                              Salvar
                            </button>
                          </div>
                        </div>
                      ) : (
                        <p className="text-[11px] font-medium text-rose-950 dark:text-rose-100 leading-snug">
                          {cand.motivo_reprovacao || (
                            <span className="italic text-rose-400 dark:text-rose-500">
                              Nenhum motivo detalhado registrado.{' '}
                              <button
                                type="button"
                                onClick={(e) => handleStartEditMotivo(cand, e)}
                                className="underline font-bold text-rose-700 dark:text-rose-300"
                              >
                                Informar motivo
                              </button>
                            </span>
                          )}
                        </p>
                      )}
                    </div>

                    {/* Footer Actions: Reativar, WhatsApp & Detalhes */}
                    <div className="pt-2 border-t border-slate-100 dark:border-gray-700/80 flex items-center justify-between gap-1">
                      {/* Reativar Menu Dropdown */}
                      <div className="relative">
                        <button
                          type="button"
                          id={`btn-reativar-${cand.id}`}
                          onClick={(e) => {
                            e.stopPropagation();
                            setReativarMenuId(isReativarOpen ? null : cand.id);
                          }}
                          className="inline-flex items-center gap-1 rounded bg-teal-50 dark:bg-teal-950/60 px-2 py-1 text-[10px] font-bold text-[#00857e] dark:text-[#00C4BB] hover:bg-teal-100 dark:hover:bg-teal-900 border border-teal-200/60 dark:border-teal-800 transition-colors shadow-2xs"
                          title="Reativar candidato e mover para uma etapa ativa"
                        >
                          <RotateCcw className="w-3 h-3" />
                          <span>Reativar</span>
                          <ChevronDown className="w-2.5 h-2.5" />
                        </button>

                        {isReativarOpen && (
                          <div
                            onClick={(e) => e.stopPropagation()}
                            className="absolute left-0 bottom-full mb-1 z-50 w-48 rounded-lg bg-white dark:bg-gray-800 shadow-xl border border-slate-200 dark:border-gray-700 p-1.5 space-y-1 animate-in fade-in zoom-in-95"
                          >
                            <p className="text-[9px] font-bold text-slate-400 dark:text-slate-400 px-1.5 py-0.5 uppercase tracking-wider">
                              Reativar para Etapa:
                            </p>
                            <button
                              type="button"
                              onClick={() => {
                                onReativarCandidato(cand.id, 'Triagem');
                                setReativarMenuId(null);
                              }}
                              className="w-full text-left px-2 py-1 text-[10px] font-semibold text-slate-700 dark:text-slate-200 hover:bg-teal-50 dark:hover:bg-teal-950/60 hover:text-[#00857e] rounded flex items-center justify-between"
                            >
                              <span>Triagem Inicial</span>
                              <Compass className="w-3 h-3 text-slate-400" />
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                onReativarCandidato(cand.id, 'Banco de Talentos');
                                setReativarMenuId(null);
                              }}
                              className="w-full text-left px-2 py-1 text-[10px] font-semibold text-slate-700 dark:text-slate-200 hover:bg-amber-50 dark:hover:bg-amber-950/60 hover:text-amber-700 rounded flex items-center justify-between"
                            >
                              <span>Banco de Talentos</span>
                              <Archive className="w-3 h-3 text-amber-500" />
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                onReativarCandidato(cand.id, cand.etapa_processo);
                                setReativarMenuId(null);
                              }}
                              className="w-full text-left px-2 py-1 text-[10px] font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-gray-700 rounded flex items-center justify-between"
                            >
                              <span className="truncate">Mesma ({cand.etapa_processo})</span>
                              <RotateCcw className="w-3 h-3 text-slate-400" />
                            </button>
                          </div>
                        )}
                      </div>

                      {/* WhatsApp & Details Button */}
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          id={`btn-wa-reprovado-${cand.id}`}
                          onClick={(e) => {
                            e.stopPropagation();
                            onOpenWhatsApp(cand);
                          }}
                          className="inline-flex items-center gap-1 rounded bg-emerald-50 dark:bg-emerald-950/40 px-2 py-1 text-[10px] font-bold text-emerald-800 dark:text-emerald-300 hover:bg-emerald-100 dark:hover:bg-emerald-900 border border-emerald-200/50 dark:border-emerald-800 transition-colors"
                          title="Enviar Mensagem de Feedback de Reprovação (Template 15)"
                        >
                          <MessageCircle className="w-3 h-3" />
                          <span>Feedback</span>
                        </button>

                        <button
                          type="button"
                          id={`btn-modal-reprovado-${cand.id}`}
                          onClick={() => onOpenModal(cand.id)}
                          className="inline-flex items-center gap-0.5 text-[10px] font-semibold text-slate-500 dark:text-slate-400 hover:text-[#00A9A1] dark:hover:text-[#00C4BB] transition-colors p-1"
                          title="Ver Ficha e Dossiê Completo"
                        >
                          <span>Ver</span>
                          <ChevronRight className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
};
