import React from 'react';
import { Candidato, Vaga } from '../../types';
import { calculateVagaSLA, calculateCandidateStageSLA } from '../../lib/formatters';
import { useApp } from '../../context/AppContext';
import {
  FileText,
  Video,
  MessageCircle,
  Clock,
  Sparkles,
  ChevronRight,
  AlertTriangle,
  Star,
  MapPin,
  CheckCircle2,
  XCircle,
  UserX,
  GraduationCap,
  GripVertical,
  Check,
  Flame,
  Calendar as CalendarIcon,
  Printer,
  CalendarCheck,
  CalendarClock,
} from 'lucide-react';

interface KanbanCardProps {
  candidato: Candidato;
  vaga?: Vaga;
  fluxoSimplificadoCargo: string;
  isSelected?: boolean;
  onToggleSelect?: (id: string, e: React.MouseEvent) => void;
  onOpenModal: (id: string) => void;
  onOpenWhatsApp: (cand: Candidato) => void;
  onMoveEtapa: (id: string, nextEtapa: any) => void;
  onToggleFluxo: (id: string) => void;
  onSetStatus: (id: string, status: any) => void;
  isDragging?: boolean;
  isOverlay?: boolean;
}

export const KanbanCard: React.FC<KanbanCardProps> = ({
  candidato,
  vaga,
  fluxoSimplificadoCargo,
  isSelected,
  onToggleSelect,
  onOpenModal,
  onOpenWhatsApp,
  onToggleFluxo,
  isDragging,
  isOverlay,
}) => {
  const { setCalendarScheduleCandidate, setCandidatePdfModalId } = useApp();

  // Audit Fix #4: Usa o campo estruturado vaga?.cargo em vez de regex no título
  const cargoEstruturado = vaga?.cargo || '';
  const isCargoFluxoSimplificado =
    cargoEstruturado.toLowerCase() === (fluxoSimplificadoCargo || 'professor').toLowerCase();

  // SLA Calculation da Vaga e do Tempo na Etapa Atual
  const vagaSlaInfo = calculateVagaSLA(vaga?.data_abertura || '', vaga?.meta_sla_dias || 30);
  const stageSlaInfo = calculateCandidateStageSLA(candidato, undefined, vaga);

  // Status Styling
  const isAusente = candidato.status === 'Ausente';
  const isAprovado = candidato.status === 'Aprovado';
  const isReprovado = candidato.status === 'Reprovado';
  const isOverdueStage = stageSlaInfo.isOverStageSla;
  const isOverdueVaga = vagaSlaInfo.isOverSla && candidato.status === 'Em andamento';
  const hasAnySlaAlert = isOverdueStage || isOverdueVaga;

  // Agendamento Visual Status
  const isInterviewStage = [
    'Entrevista Coletiva/Online',
    'Etapa Prática',
    'Gestor',
    'Diretoria',
  ].includes(candidato.etapa_processo);
  const hasAgendamento = !!candidato.data_entrevista;
  const isAgendamentoPendente = isInterviewStage && !hasAgendamento && candidato.status === 'Em andamento';

  return (
    <div
      id={`cand-card-${candidato.id}`}
      className={`group relative rounded bg-white dark:bg-gray-800 p-3 transition-all duration-150 ${
        isOverlay
          ? 'shadow-2xl ring-2 ring-[#00A9A1] border-[#00A9A1] rotate-1 scale-[1.02] cursor-grabbing z-50'
          : isSelected
          ? 'shadow-md ring-2 ring-[#00A9A1] dark:ring-[#00C4BB] border-[#00A9A1] dark:border-[#00C4BB] bg-teal-50/40 dark:bg-teal-950/40'
          : 'shadow-xs border border-gray-200/80 dark:border-gray-700 hover:shadow-sm'
      } ${
        isOverdueStage
          ? 'border-l-4 border-l-rose-600 bg-rose-50/20 dark:bg-rose-950/20'
          : isOverdueVaga
          ? 'border-l-4 border-l-red-500'
          : isAusente
          ? 'border-l-4 border-l-[#F7941D] dark:border-l-[#FFA336] bg-amber-50/20 dark:bg-amber-950/20'
          : isAprovado
          ? 'border-l-4 border-l-emerald-500 bg-emerald-50/20 dark:bg-emerald-950/20'
          : hasAgendamento
          ? 'border-l-4 border-l-[#00A9A1] dark:border-l-[#00C4BB] bg-teal-50/15 dark:bg-teal-950/15'
          : isAgendamentoPendente
          ? 'border-l-4 border-l-amber-500 bg-amber-50/15 dark:bg-amber-950/15'
          : isCargoFluxoSimplificado && candidato.fluxo_simplificado
          ? 'border-l-4 border-l-[#00A9A1] dark:border-l-[#00C4BB]'
          : 'border-l-4 border-l-gray-300 dark:border-l-gray-600'
      }`}
    >
      {/* Top Header: Select Checkbox, Unidade & Status/SLA Alert Badges */}
      <div className="flex items-center justify-between gap-1 text-[10px] mb-1.5">
        <div className="flex items-center gap-1.5 font-semibold text-gray-500 dark:text-gray-400 truncate">
          {/* Multi-select Checkbox */}
          {onToggleSelect && (
            <button
              type="button"
              id={`select-cand-${candidato.id}`}
              onClick={(e) => {
                e.stopPropagation();
                onToggleSelect(candidato.id, e);
              }}
              className={`w-4 h-4 rounded flex items-center justify-center transition-all cursor-pointer flex-shrink-0 ${
                isSelected
                  ? 'bg-[#00A9A1] dark:bg-[#00C4BB] text-white'
                  : 'border border-gray-300 dark:border-gray-600 hover:border-[#00A9A1] bg-white dark:bg-gray-700 opacity-60 group-hover:opacity-100'
              }`}
              title={isSelected ? 'Desmarcar candidato' : 'Selecionar candidato para ações em massa'}
            >
              {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
            </button>
          )}

          <GripVertical className="w-3 h-3 text-gray-300 dark:text-gray-600 group-hover:text-gray-500 dark:group-hover:text-gray-400 flex-shrink-0 transition-colors" />
          <MapPin className="w-3 h-3 text-[#00A9A1] dark:text-[#00C4BB] flex-shrink-0" />
          <span className="truncate">{candidato.unidade.replace('Vox ', '')}</span>
        </div>

        {/* Visual SLA Alert Badge (Turns Red when threshold exceeded) & Status Badges */}
        <div className="flex items-center gap-1 flex-shrink-0">
          {isOverdueStage ? (
            <span
              id={`sla-alert-badge-${candidato.id}`}
              title={`Tempo na etapa (${stageSlaInfo.diasNaEtapa} dias) excedeu o limite máximo recomendado (${stageSlaInfo.limiteSlaEtapa} dias) para esta etapa`}
              className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-rose-600 dark:bg-rose-700 text-white font-extrabold text-[9px] shadow-xs animate-pulse tracking-tight whitespace-nowrap"
            >
              <AlertTriangle className="w-2.5 h-2.5" />
              SLA Alerta: {stageSlaInfo.diasNaEtapa}d ({stageSlaInfo.limiteSlaEtapa}d)
            </span>
          ) : isOverdueVaga ? (
            <span className="text-[9px] font-bold text-red-500 dark:text-red-400 flex items-center gap-0.5 animate-pulse">
              <AlertTriangle className="w-2.5 h-2.5" />
              Vaga SLA: +{vagaSlaInfo.diasAbertos - vagaSlaInfo.metaSla}d
            </span>
          ) : isAusente ? (
            <span className="text-[10px] font-bold text-[#c25e00] dark:text-[#FFA336] flex items-center gap-0.5">
              <UserX className="w-3 h-3" />
              Ausente
            </span>
          ) : isAprovado ? (
            <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-0.5">
              <CheckCircle2 className="w-3 h-3" />
              Aprovado
            </span>
          ) : isReprovado ? (
            <span className="text-[10px] font-medium text-gray-400 dark:text-gray-500">
              Reprovado
            </span>
          ) : (
            <span
              className="text-[9px] text-gray-400 dark:text-gray-400 font-medium flex items-center gap-0.5"
              title={`Candidato há ${stageSlaInfo.diasNaEtapa} dia(s) nesta etapa (limite: ${stageSlaInfo.limiteSlaEtapa}d)`}
            >
              <Clock className="w-2.5 h-2.5" />
              {stageSlaInfo.diasNaEtapa}d na etapa
            </span>
          )}
        </div>
      </div>

      {/* Candidate Name & Job Title */}
      <div className="mb-2 cursor-pointer" onClick={() => onOpenModal(candidato.id)}>
        <h4 className="text-xs font-bold text-gray-900 dark:text-gray-100 group-hover:text-[#00A9A1] dark:group-hover:text-[#00C4BB] transition-colors truncate">
          {candidato.nome}
        </h4>
        <p className="text-[10px] text-gray-400 dark:text-gray-400 font-medium truncate mt-0.5">
          {candidato.vaga_titulo}
        </p>
      </div>

      {/* Audit Fix #3 & #4: Toggle "Fluxo Simplificado (Professor)" */}
      {isCargoFluxoSimplificado && (
        <div className="mb-2 rounded bg-teal-50/70 dark:bg-teal-950/40 border border-teal-200/60 dark:border-teal-800/40 p-1.5 text-xs">
          <div className="flex items-center justify-between gap-1">
            <span className="flex items-center gap-1 font-semibold text-[#00857e] dark:text-[#00C4BB] text-[10px]">
              <GraduationCap className="w-3 h-3" />
              Simplificado ({fluxoSimplificadoCargo})
            </span>
            <button
              id={`toggle-fluxo-${candidato.id}`}
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onToggleFluxo(candidato.id);
              }}
              className={`relative inline-flex h-3.5 w-6 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                candidato.fluxo_simplificado ? 'bg-[#00A9A1] dark:bg-[#00C4BB]' : 'bg-gray-300 dark:bg-gray-600'
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-2.5 w-2.5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                  candidato.fluxo_simplificado ? 'translate-x-2.5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>
        </div>
      )}

      {/* Scheduled Calendar Event Badge */}
      {candidato.data_entrevista ? (
        <div
          id={`cand-calendar-badge-${candidato.id}`}
          onClick={(e) => {
            e.stopPropagation();
            setCalendarScheduleCandidate(candidato);
          }}
          className="mb-2 p-1.5 rounded-lg bg-teal-50 dark:bg-teal-950/50 border border-teal-200/80 dark:border-teal-800/60 flex items-center justify-between text-[10px] text-teal-900 dark:text-teal-200 cursor-pointer hover:bg-teal-100/90 dark:hover:bg-teal-900/60 transition-colors shadow-2xs group/cal"
          title="Clique para ver, reagendar ou gerenciar no Google Agenda"
        >
          <div className="flex items-center gap-1.5 truncate">
            <CalendarIcon className="w-3.5 h-3.5 text-[#00A9A1] dark:text-[#00C4BB] flex-shrink-0" />
            <span className="font-bold truncate">
              {new Date(`${candidato.data_entrevista}T00:00:00`).toLocaleDateString('pt-BR', {
                day: '2-digit',
                month: '2-digit',
              })}{' '}
              às {candidato.hora_entrevista || '14:30'}
            </span>
          </div>
          {candidato.google_meet_link && (
            <span className="flex-shrink-0 px-1 py-0.2 rounded bg-teal-200/80 dark:bg-teal-900 font-extrabold text-[9px] text-[#00857e] dark:text-[#00C4BB] flex items-center gap-0.5">
              <Video className="w-2.5 h-2.5" />
              Meet
            </span>
          )}
        </div>
      ) : null}

      {/* Materials badges (Resume, Video, Rating) */}
      <div className="flex flex-wrap items-center gap-1 mb-2 text-xs">
        {candidato.curriculo_url ? (
          <a
            href={candidato.curriculo_url}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="inline-flex items-center gap-0.5 px-1.5 py-0.5 bg-[#F3F4F6] dark:bg-gray-700 text-[9px] font-bold rounded text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
            title="Ver Currículo"
          >
            <FileText className="w-2.5 h-2.5 text-gray-500 dark:text-gray-400" />
            CV
          </a>
        ) : (
          <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 bg-amber-50 dark:bg-amber-950/40 text-[9px] font-bold rounded text-amber-800 dark:text-amber-300 border border-amber-200/50 dark:border-amber-800/40">
            Sem CV
          </span>
        )}

        {candidato.video_url ? (
          <a
            href={candidato.video_url}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="inline-flex items-center gap-0.5 px-1.5 py-0.5 bg-teal-50 dark:bg-teal-950/40 text-[9px] font-bold rounded text-[#00857e] dark:text-[#00C4BB] hover:bg-teal-100 dark:hover:bg-teal-900/60 transition-colors border border-teal-200/50 dark:border-teal-800/40"
            title="Assistir Vídeo Pitch"
          >
            <Video className="w-2.5 h-2.5" />
            Vídeo OK
          </a>
        ) : candidato.etapa_processo === 'Vídeo de Apresentação' ? (
          <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 bg-orange-50 dark:bg-orange-950/40 text-[9px] font-bold rounded text-[#c25e00] dark:text-[#FFA336] border border-orange-200/60 dark:border-orange-900/50">
            <Clock className="w-2.5 h-2.5" />
            Aguardando Vídeo
          </span>
        ) : null}

        {candidato.avaliacao_geral ? (
          <span className="inline-flex items-center gap-0.5 text-[10px] font-bold text-amber-600 dark:text-amber-400 ml-auto">
            <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
            {candidato.avaliacao_geral}/5
          </span>
        ) : null}
      </div>

      {/* Footer Actions */}
      <div className="flex items-center justify-between border-t border-gray-100 dark:border-gray-700/60 pt-2 gap-1">
        <div className="flex items-center gap-1">
          <button
            id={`btn-wa-${candidato.id}`}
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onOpenWhatsApp(candidato);
            }}
            className="inline-flex items-center gap-1 rounded bg-emerald-50 dark:bg-emerald-950/40 px-1.5 py-0.5 text-[10px] font-bold text-emerald-800 dark:text-emerald-300 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 transition-colors border border-emerald-200/40 dark:border-emerald-800/40"
            title="Gerar Mensagem WhatsApp"
          >
            <MessageCircle className="w-3 h-3" />
            <span>WhatsApp</span>
          </button>

          <button
            id={`btn-calendar-${candidato.id}`}
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setCalendarScheduleCandidate(candidato);
            }}
            className="inline-flex items-center gap-1 rounded bg-teal-50 dark:bg-teal-950/40 px-1.5 py-0.5 text-[10px] font-bold text-[#00857e] dark:text-[#00C4BB] hover:bg-teal-100 dark:hover:bg-teal-900/60 transition-colors border border-teal-200/40 dark:border-teal-800/40"
            title="Agendar ou visualizar no Google Agenda & Meet"
          >
            <CalendarIcon className="w-3 h-3 text-[#00A9A1]" />
            <span>{candidato.data_entrevista ? 'Agenda' : 'Agendar'}</span>
          </button>

          <button
            id={`btn-pdf-${candidato.id}`}
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setCandidatePdfModalId(candidato.id);
            }}
            className="inline-flex items-center gap-1 rounded bg-blue-50 dark:bg-blue-950/40 px-1.5 py-0.5 text-[10px] font-bold text-blue-700 dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-900/60 transition-colors border border-blue-200/40 dark:border-blue-800/40"
            title="Gerar PDF com Ficha Completa, Vídeo, Pareceres e Contatos"
          >
            <Printer className="w-3 h-3 text-blue-600 dark:text-blue-400" />
            <span>PDF</span>
          </button>
        </div>

        <button
          id={`btn-open-${candidato.id}`}
          type="button"
          onClick={() => onOpenModal(candidato.id)}
          className="inline-flex items-center gap-0.5 text-[10px] font-semibold text-gray-500 dark:text-gray-400 hover:text-[#00A9A1] dark:hover:text-[#00C4BB] transition-colors flex-shrink-0"
        >
          <span>Detalhes</span>
          <ChevronRight className="w-3 h-3" />
        </button>
      </div>
    </div>
  );
};
