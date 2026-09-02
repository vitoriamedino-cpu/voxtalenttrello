import React, { useState, useMemo } from 'react';
import { useDroppable } from '@dnd-kit/core';
import { Candidato, Vaga, EtapaProcesso } from '../../types';
import { ETAPAS_KANBAN } from '../../lib/rsConstants';
import { useApp } from '../../context/AppContext';
import {
  CheckCircle2,
  Search,
  Filter,
  MessageCircle,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  RotateCcw,
  Sparkles,
  MapPin,
  FileText,
  Video,
  Star,
  Printer,
  CalendarCheck,
  Award,
} from 'lucide-react';

interface KanbanAprovadosColumnProps {
  candidatos: Candidato[];
  vagas: Vaga[];
  onOpenModal: (id: string) => void;
  onOpenWhatsApp: (cand: Candidato) => void;
  onReativarCandidato: (id: string, novaEtapa: EtapaProcesso) => void;
}

export const KanbanAprovadosColumn: React.FC<KanbanAprovadosColumnProps> = ({
  candidatos,
  vagas,
  onOpenModal,
  onOpenWhatsApp,
  onReativarCandidato,
}) => {
  const { setCandidatePdfModalId } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterEtapa, setFilterEtapa] = useState<string>('TODAS');
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [reativarMenuId, setReativarMenuId] = useState<string | null>(null);

  // Droppable setup
  const { setNodeRef, isOver } = useDroppable({
    id: 'column-aprovados',
    data: {
      type: 'aprovados-column',
      isAprovados: true,
    },
  });

  // Filter approved candidates
  const filteredAprovados = useMemo(() => {
    return candidatos.filter((cand) => {
      if (cand.status !== 'Aprovado') return false;

      if (filterEtapa !== 'TODAS' && cand.etapa_processo !== filterEtapa) {
        return false;
      }

      if (searchTerm.trim()) {
        const term = searchTerm.toLowerCase();
        const matchesName = cand.nome.toLowerCase().includes(term);
        const matchesVaga = cand.vaga_titulo.toLowerCase().includes(term);
        const matchesUnidade = cand.unidade.toLowerCase().includes(term);
        const matchesEmail = cand.email.toLowerCase().includes(term);
        if (!matchesName && !matchesVaga && !matchesUnidade && !matchesEmail) {
          return false;
        }
      }

      return true;
    });
  }, [candidatos, filterEtapa, searchTerm]);

  const totalAprovados = candidatos.filter((c) => c.status === 'Aprovado').length;

  return (
    <div
      ref={setNodeRef}
      id="kanban-col-aprovados-suspensa"
      className={`flex flex-col flex-shrink-0 rounded-xl transition-all duration-200 h-full max-h-full overflow-hidden ${
        isCollapsed ? 'w-[68px] min-w-[68px]' : 'min-w-[280px] max-w-[310px] w-[295px]'
      } ${
        isOver
          ? 'bg-emerald-50/80 dark:bg-emerald-950/50 border-2 border-emerald-500 dark:border-emerald-400 ring-2 ring-emerald-500/30 scale-[1.01]'
          : 'bg-emerald-50/30 dark:bg-gray-800/70 border border-emerald-300/80 dark:border-emerald-900/60 shadow-xs'
      }`}
    >
      {/* Smaller & Suspended Column Header */}
      <div
        className={`sticky top-0 z-10 px-2.5 py-1.5 bg-white/95 dark:bg-gray-800/95 backdrop-blur-xs rounded-t-xl flex items-center justify-between border-b-2 flex-shrink-0 shadow-2xs ${
          isOver
            ? 'border-emerald-500 dark:border-emerald-400 bg-emerald-50/40 dark:bg-emerald-950/40'
            : 'border-emerald-500 dark:border-emerald-400'
        }`}
      >
        <div className="flex items-center gap-1.5 truncate">
          <div className="p-0.5 rounded bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 flex items-center justify-center">
            <CheckCircle2 className="w-3.5 h-3.5" />
          </div>
          {!isCollapsed && (
            <div className="truncate">
              <h3
                className="font-bold text-[11px] uppercase tracking-wider text-emerald-900 dark:text-emerald-200 truncate flex items-center gap-1"
                title="Candidatos Aprovados (Lista Suspensa)"
              >
                <span>Aprovados</span>
                <span className="text-[9px] font-normal text-emerald-600 dark:text-emerald-400 capitalize">
                  (Suspensa)
                </span>
              </h3>
            </div>
          )}
        </div>

        <div className="flex items-center gap-1">
          <span
            className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full transition-colors ${
              totalAprovados > 0
                ? 'bg-emerald-600 dark:bg-emerald-500 text-white'
                : 'bg-gray-200/60 dark:bg-gray-700 text-gray-500'
            }`}
          >
            {totalAprovados}
          </span>

          <button
            type="button"
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400 transition-colors"
            title={isCollapsed ? 'Expandir coluna de aprovados' : 'Minimizar coluna de aprovados'}
          >
            {isCollapsed ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronUp className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* Column Content */}
      {isCollapsed ? (
        <div
          onClick={() => setIsCollapsed(false)}
          className="flex-1 flex flex-col items-center justify-center p-3 cursor-pointer hover:bg-emerald-50/50 dark:hover:bg-emerald-950/30 transition-colors"
        >
          <span className="[writing-mode:vertical-rl] rotate-180 text-xs font-bold text-emerald-700 dark:text-emerald-300 tracking-wider uppercase py-2">
            Aprovados ({totalAprovados})
          </span>
        </div>
      ) : (
        <div className="flex flex-col flex-1 overflow-hidden min-h-0">
          {/* Subheader Filters */}
          <div className="p-1.5 space-y-1 bg-emerald-50/30 dark:bg-emerald-950/20 border-b border-emerald-100 dark:border-emerald-900/40 flex-shrink-0">
            <div className="relative">
              <Search className="w-3 h-3 text-gray-400 dark:text-gray-500 absolute left-2 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Buscar em aprovados..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-7 pr-2 py-1 rounded bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white text-[11px] focus:ring-1 focus:ring-emerald-500 focus:outline-none"
              />
            </div>

            <div className="flex items-center gap-1 text-[10px]">
              <Filter className="w-2.5 h-2.5 text-gray-400" />
              <select
                value={filterEtapa}
                onChange={(e) => setFilterEtapa(e.target.value)}
                className="w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-200 rounded px-1.5 py-0.5 text-[10px] focus:ring-1 focus:ring-emerald-500 focus:outline-none"
              >
                <option value="TODAS">Todas etapas aprovadas</option>
                {ETAPAS_KANBAN.map((et) => (
                  <option key={et} value={et}>
                    {et}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Candidates Scrollable List */}
          <div className="flex-1 overflow-y-auto space-y-2 p-1.5 min-h-0">
            {filteredAprovados.length === 0 ? (
              <div className="py-8 px-3 text-center border-2 border-dashed border-emerald-200 dark:border-emerald-900/50 rounded-lg bg-emerald-50/20 dark:bg-emerald-950/20">
                <CheckCircle2 className="w-6 h-6 text-emerald-400 mx-auto mb-1.5 opacity-60" />
                <p className="text-xs font-semibold text-emerald-900 dark:text-emerald-300">
                  Nenhum candidato aprovado
                </p>
                <p className="text-[10px] text-emerald-700/80 dark:text-emerald-400/80 mt-0.5">
                  Arraste cards para cá para registrar aprovação imediata
                </p>
              </div>
            ) : (
              filteredAprovados.map((cand) => {
                const isMenuOpen = reativarMenuId === cand.id;

                return (
                  <div
                    key={cand.id}
                    className="p-2.5 rounded bg-white dark:bg-gray-800 border border-emerald-200/80 dark:border-emerald-900/60 shadow-2xs hover:border-emerald-400 dark:hover:border-emerald-600 transition-all text-xs"
                  >
                    {/* Header */}
                    <div className="flex items-center justify-between gap-1 text-[10px] mb-1">
                      <div className="flex items-center gap-1 text-gray-500 dark:text-gray-400 font-semibold truncate">
                        <MapPin className="w-2.5 h-2.5 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
                        <span className="truncate">{cand.unidade.replace('Vox ', '')}</span>
                      </div>

                      <span className="inline-flex items-center gap-0.5 px-1.5 py-0.2 rounded bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 font-extrabold text-[9px]">
                        <CheckCircle2 className="w-2.5 h-2.5" />
                        Aprovado
                      </span>
                    </div>

                    {/* Name & Job */}
                    <div className="cursor-pointer" onClick={() => onOpenModal(cand.id)}>
                      <h4 className="font-bold text-gray-900 dark:text-white hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors truncate text-xs">
                        {cand.nome}
                      </h4>
                      <p className="text-[10px] text-gray-500 dark:text-gray-400 truncate mt-0.5">
                        {cand.vaga_titulo} • Etapa: <strong className="text-gray-700 dark:text-gray-300">{cand.etapa_processo}</strong>
                      </p>
                    </div>

                    {/* Quick Badges: CV, Video, Rating */}
                    <div className="flex items-center gap-1 mt-1.5 text-[10px]">
                      {cand.curriculo_url && (
                        <a
                          href={cand.curriculo_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-0.5 px-1 py-0.2 rounded bg-gray-100 dark:bg-gray-700 font-bold text-gray-700 dark:text-gray-200 text-[9px]"
                        >
                          <FileText className="w-2.5 h-2.5" /> CV
                        </a>
                      )}
                      {cand.video_url && (
                        <a
                          href={cand.video_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-0.5 px-1 py-0.2 rounded bg-teal-50 dark:bg-teal-950/50 text-[#00857e] dark:text-[#00C4BB] font-bold text-[9px]"
                        >
                          <Video className="w-2.5 h-2.5" /> Vídeo
                        </a>
                      )}
                      {cand.avaliacao_geral && (
                        <span className="inline-flex items-center gap-0.5 text-amber-600 font-bold text-[9px] ml-auto">
                          <Star className="w-2.5 h-2.5 fill-amber-400 text-amber-400" />
                          {cand.avaliacao_geral}/5
                        </span>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="mt-2 pt-2 border-t border-gray-100 dark:border-gray-700 flex items-center justify-between gap-1 text-[10px]">
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => onOpenWhatsApp(cand)}
                          className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 font-bold border border-emerald-200/50 dark:border-emerald-800/40 hover:bg-emerald-100 transition-colors"
                          title="Enviar WhatsApp de aprovação / boas-vindas"
                        >
                          <MessageCircle className="w-2.5 h-2.5" />
                          <span>WhatsApp</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => setCandidatePdfModalId(cand.id)}
                          className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 font-bold border border-blue-200/50 dark:border-blue-800/40 hover:bg-blue-100 transition-colors"
                          title="Gerar PDF com ficha completa do aprovado"
                        >
                          <Printer className="w-2.5 h-2.5" />
                          <span>PDF</span>
                        </button>
                      </div>

                      {/* Reativar / Alterar Etapa Menu */}
                      <div className="relative">
                        <button
                          type="button"
                          onClick={() => setReativarMenuId(isMenuOpen ? null : cand.id)}
                          className="inline-flex items-center gap-0.5 text-gray-500 dark:text-gray-400 hover:text-emerald-700 dark:hover:text-emerald-400 font-semibold"
                        >
                          <RotateCcw className="w-2.5 h-2.5" />
                          <span>Mover</span>
                          <ChevronDown className="w-2.5 h-2.5" />
                        </button>

                        {isMenuOpen && (
                          <div className="absolute right-0 bottom-full mb-1 z-30 w-44 rounded-md bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-lg py-1 animate-in fade-in zoom-in-95">
                            <div className="px-2 py-1 text-[9px] font-bold text-gray-400 uppercase tracking-wider border-b border-gray-100 dark:border-gray-700">
                              Mover para Etapa:
                            </div>
                            {ETAPAS_KANBAN.map((et) => (
                              <button
                                key={et}
                                type="button"
                                onClick={() => {
                                  onReativarCandidato(cand.id, et);
                                  setReativarMenuId(null);
                                }}
                                className="w-full text-left px-2.5 py-1 text-[10px] text-gray-700 dark:text-gray-200 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 hover:text-emerald-800 dark:hover:text-emerald-300 transition-colors truncate"
                              >
                                {et}
                              </button>
                            ))}
                          </div>
                        )}
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
