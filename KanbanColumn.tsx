import React from 'react';
import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { EtapaProcesso, Candidato, Vaga } from '../../types';
import { SortableKanbanCard } from './SortableKanbanCard';
import { Users, Calendar, Video, CheckCircle, Award, Archive, Compass, PhoneCall, ListFilter } from 'lucide-react';
import { useApp } from '../../context/AppContext';

interface KanbanColumnProps {
  etapa: EtapaProcesso;
  candidatos: Candidato[];
  vagas: Vaga[];
  fluxoSimplificadoCargo: string;
  minColetiva: number;
  selectedCandidateIds: Set<string>;
  onToggleSelectCandidate: (id: string, e?: React.MouseEvent) => void;
  onToggleSelectColumn?: (etapa: EtapaProcesso) => void;
  onOpenModal: (id: string) => void;
  onOpenWhatsApp: (cand: Candidato) => void;
  onMoveEtapa: (id: string, nextEtapa: EtapaProcesso) => void;
  onToggleFluxo: (id: string) => void;
  onSetStatus: (id: string, status: any) => void;
  onAgendarColetiva?: (vagaId: string) => void;
}

const ETAPA_ICONS: Record<EtapaProcesso, React.ReactNode> = {
  Triagem: <Compass className="w-4 h-4 text-slate-500" />,
  '1º Contato': <PhoneCall className="w-4 h-4 text-sky-500" />,
  'Vídeo de Apresentação': <Video className="w-4 h-4 text-orange-500" />,
  'Entrevista Coletiva/Online': <Users className="w-4 h-4 text-indigo-500" />,
  'Etapa Prática': <Award className="w-4 h-4 text-teal-600" />,
  Gestor: <CheckCircle className="w-4 h-4 text-blue-600" />,
  Diretoria: <CheckCircle className="w-4 h-4 text-emerald-600" />,
  'Banco de Talentos': <Archive className="w-4 h-4 text-amber-600" />,
};

export const KanbanColumn: React.FC<KanbanColumnProps> = ({
  etapa,
  candidatos,
  vagas,
  fluxoSimplificadoCargo,
  minColetiva,
  selectedCandidateIds,
  onToggleSelectCandidate,
  onToggleSelectColumn,
  onOpenModal,
  onOpenWhatsApp,
  onMoveEtapa,
  onToggleFluxo,
  onSetStatus,
  onAgendarColetiva,
}) => {
  const { setListModalEtapa } = useApp();
  const isColetiva = etapa === 'Entrevista Coletiva/Online';
  const isVideo = etapa === 'Vídeo de Apresentação';

  const allColumnSelected =
    candidatos.length > 0 && candidatos.every((c) => selectedCandidateIds.has(c.id));
  const someColumnSelected =
    candidatos.some((c) => selectedCandidateIds.has(c.id)) && !allColumnSelected;

  // dnd-kit droppable column setup
  const { setNodeRef, isOver } = useDroppable({
    id: etapa,
    data: {
      type: 'column',
      etapa,
    },
  });

  // Audit Fix #2: Contagem de candidatos na Coletiva agrupada por vaga_id
  const coletivaPorVaga: Record<string, { count: number; titulo: string; unidade: string }> = {};
  if (isColetiva) {
    candidatos.forEach((cand) => {
      if (cand.status === 'Em andamento') {
        if (!coletivaPorVaga[cand.vaga_id]) {
          const vagaObj = vagas.find((v) => v.id === cand.vaga_id);
          coletivaPorVaga[cand.vaga_id] = {
            count: 0,
            titulo: vagaObj?.titulo || cand.vaga_titulo,
            unidade: vagaObj?.unidade || cand.unidade,
          };
        }
        coletivaPorVaga[cand.vaga_id].count += 1;
      }
    });
  }

  // Audit Fix #2: Condição corrigida baseada apenas em existir ao menos uma vaga que atingiu o mínimo
  const vagasNoMinimo = Object.entries(coletivaPorVaga).filter(
    ([, info]) => info.count >= minColetiva
  );
  const showColetivaAlert = isColetiva && minColetiva > 0 && vagasNoMinimo.length > 0;

  const candidateIds = candidatos.map((c) => c.id);

  return (
    <div
      ref={setNodeRef}
      id={`kanban-col-${etapa.toLowerCase().replace(/[^a-z0-9]/g, '-')}`}
      className={`flex flex-col min-w-[280px] max-w-[305px] w-[292px] flex-shrink-0 rounded-xl transition-all duration-200 h-full max-h-full overflow-hidden ${
        isOver
          ? 'bg-teal-50/70 dark:bg-teal-950/40 border-2 border-[#00A9A1] dark:border-[#00C4BB] ring-2 ring-[#00A9A1]/30 scale-[1.01]'
          : isColetiva && showColetivaAlert
          ? 'bg-gray-100/80 dark:bg-gray-800/70 border border-[#F7941D] dark:border-[#FFA336] ring-1 ring-[#F7941D]/30 dark:ring-[#FFA336]/30 shadow-xs'
          : isVideo && candidatos.length > 0
          ? 'bg-gray-100/80 dark:bg-gray-800/70 border border-teal-300/80 dark:border-teal-700/80 shadow-xs'
          : 'bg-gray-100/80 dark:bg-gray-800/70 border border-gray-200/90 dark:border-gray-700/80 shadow-xs'
      }`}
    >
      {/* Smaller & Suspended Column Header */}
      <div
        className={`sticky top-0 z-10 px-2.5 py-1.5 bg-white/95 dark:bg-gray-800/95 backdrop-blur-xs rounded-t-xl flex items-center justify-between border-b-2 flex-shrink-0 shadow-2xs ${
          isOver
            ? 'border-[#00A9A1] dark:border-[#00C4BB] bg-teal-50/40 dark:bg-teal-950/40'
            : isVideo
            ? 'border-[#00A9A1] dark:border-[#00C4BB]'
            : isColetiva
            ? 'border-[#F7941D] dark:border-[#FFA336]'
            : 'border-gray-200 dark:border-gray-700'
        }`}
      >
        <div className="flex items-center gap-1.5 truncate">
          <span className="p-0.5 rounded text-gray-500 dark:text-gray-400 flex items-center">{ETAPA_ICONS[etapa]}</span>
          <h3
            className={`font-bold text-[11px] uppercase tracking-wider truncate ${
              isOver || isVideo
                ? 'text-[#00857e] dark:text-[#00C4BB]'
                : isColetiva
                ? 'text-[#c25e00] dark:text-[#FFA336]'
                : 'text-gray-800 dark:text-gray-100'
            }`}
            title={etapa}
          >
            {etapa}
          </h3>
        </div>
        <div className="flex items-center gap-1">
          {candidatos.length > 0 && onToggleSelectColumn && (
            <button
              type="button"
              id={`select-column-${etapa.toLowerCase().replace(/[^a-z0-9]/g, '-')}`}
              onClick={(e) => {
                e.stopPropagation();
                onToggleSelectColumn(etapa);
              }}
              className={`text-[9px] font-bold px-1 py-0.5 rounded transition-all flex items-center gap-0.5 border ${
                allColumnSelected
                  ? 'bg-[#00A9A1] dark:bg-[#00C4BB] text-white border-[#00A9A1] shadow-2xs'
                  : someColumnSelected
                  ? 'bg-teal-50 dark:bg-teal-950/60 text-[#00857e] dark:text-[#00C4BB] border-teal-300 dark:border-teal-700'
                  : 'bg-gray-50 dark:bg-gray-700 text-gray-500 dark:text-gray-400 hover:text-[#00A9A1] border-gray-200 dark:border-gray-600'
              }`}
              title={allColumnSelected ? 'Desmarcar coluna' : 'Selecionar todos os candidatos desta etapa'}
            >
              <span>{allColumnSelected ? '✓' : 'Sel.'}</span>
            </button>
          )}

          <button
            type="button"
            id={`btn-gerar-lista-${etapa.toLowerCase().replace(/[^a-z0-9]/g, '-')}`}
            onClick={(e) => {
              e.stopPropagation();
              setListModalEtapa(etapa);
            }}
            className="p-1 rounded text-gray-500 dark:text-gray-400 hover:text-[#00A9A1] dark:hover:text-[#00C4BB] hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            title={`Gerar lista de contatos da etapa ${etapa} (WhatsApp, E-mail, Vídeo)`}
          >
            <ListFilter className="w-3 h-3" />
          </button>

          <span
            className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full transition-colors ${
              isOver
                ? 'bg-[#00A9A1] dark:bg-[#00C4BB] text-white dark:text-gray-950 scale-105'
                : isVideo
                ? 'bg-[#00A9A1] dark:bg-[#00C4BB] text-white dark:text-gray-950'
                : isColetiva
                ? 'bg-[#F7941D] dark:bg-[#FFA336] text-white dark:text-gray-950'
                : candidatos.length > 0
                ? 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200'
                : 'bg-gray-200/60 dark:bg-gray-750 text-gray-400 dark:text-gray-500'
            }`}
          >
            {candidatos.length}
          </span>
        </div>
      </div>

      {/* Audit Fix #2: Banner de Alerta de Coletiva Quando Mínimo por Vaga é Atingido */}
      {showColetivaAlert && (
        <div className="m-1.5 bg-[#FFF9F2] dark:bg-amber-950/40 p-2 border border-[#F7941D] dark:border-[#FFA336] rounded-lg shadow-xs animate-fadeIn flex-shrink-0">
          <div className="flex items-start gap-1.5">
            <Calendar className="w-3.5 h-3.5 mt-0.5 flex-shrink-0 text-[#F7941D] dark:text-[#FFA336]" />
            <div className="flex-1 text-xs">
              <p className="text-[10px] font-bold text-[#c25e00] dark:text-[#FFA336] uppercase tracking-wider">
                Mínimo Atingido ({minColetiva}+ candidatos)
              </p>
              <div className="mt-1 space-y-1">
                {vagasNoMinimo.map(([vagaId, info]) => (
                  <div
                    key={vagaId}
                    className="flex items-center justify-between rounded bg-white/90 dark:bg-gray-850 px-1.5 py-0.5 text-[10px] font-medium border border-orange-200/50 dark:orange-900/50"
                  >
                    <span className="truncate pr-1 text-gray-700 dark:text-gray-300">
                      {info.titulo} ({info.unidade.replace('Vox ', '')}):
                    </span>
                    <span className="font-bold text-[#c25e00] dark:text-[#FFA336]">{info.count}</span>
                  </div>
                ))}
              </div>
              <button
                id="btn-agendar-coletiva-banner"
                type="button"
                onClick={() => onAgendarColetiva && onAgendarColetiva(vagasNoMinimo[0][0])}
                className="mt-1.5 w-full text-[9px] bg-[#F7941D] dark:bg-[#FFA336] hover:bg-[#e08316] text-white dark:text-gray-950 py-1 rounded font-bold uppercase tracking-wider transition-colors shadow-xs"
              >
                Abrir Agenda Coletiva
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Drop Target Guide Indicator when hovering over column */}
      {isOver && (
        <div className="mx-1.5 mt-1.5 py-1 px-2 bg-[#00A9A1]/15 dark:bg-[#00C4BB]/20 border border-dashed border-[#00A9A1] dark:border-[#00C4BB] rounded text-center animate-pulse flex-shrink-0">
          <p className="text-[10px] font-bold text-[#00857e] dark:text-[#00C4BB]">
            Solte para mover para {etapa}
          </p>
        </div>
      )}

      {/* Candidate Cards List wrapped with SortableContext (Internal Column Scroll) */}
      <div className="flex-1 overflow-y-auto p-1.5 space-y-2 min-h-0">
        {candidatos.length === 0 ? (
          <div
            className={`flex flex-col items-center justify-center h-24 rounded-lg border border-dashed text-center p-2 transition-colors ${
              isOver
                ? 'border-[#00A9A1] dark:border-[#00C4BB] bg-teal-50/50 dark:bg-teal-950/40'
                : 'border-gray-300 dark:border-gray-700 bg-white/50 dark:bg-gray-800/40'
            }`}
          >
            <p className="text-[11px] text-gray-400 dark:text-gray-500 font-medium">
              {isOver ? 'Solte o candidato aqui' : 'Nenhum candidato'}
            </p>
          </div>
        ) : (
          <SortableContext items={candidateIds} strategy={verticalListSortingStrategy}>
            {candidatos.map((cand) => {
              const vagaObj = vagas.find((v) => v.id === cand.vaga_id);
              return (
                <SortableKanbanCard
                  key={cand.id}
                  candidato={cand}
                  vaga={vagaObj}
                  fluxoSimplificadoCargo={fluxoSimplificadoCargo}
                  isSelected={selectedCandidateIds.has(cand.id)}
                  onToggleSelect={onToggleSelectCandidate}
                  onOpenModal={onOpenModal}
                  onOpenWhatsApp={onOpenWhatsApp}
                  onMoveEtapa={onMoveEtapa}
                  onToggleFluxo={onToggleFluxo}
                  onSetStatus={onSetStatus}
                />
              );
            })}
          </SortableContext>
        )}
      </div>
    </div>
  );
};
