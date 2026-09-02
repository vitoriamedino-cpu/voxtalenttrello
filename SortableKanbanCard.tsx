import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Candidato, Vaga, EtapaProcesso } from '../../types';
import { KanbanCard } from './KanbanCard';

interface SortableKanbanCardProps {
  candidato: Candidato;
  vaga?: Vaga;
  fluxoSimplificadoCargo: string;
  isSelected?: boolean;
  onToggleSelect?: (id: string, e: React.MouseEvent) => void;
  onOpenModal: (id: string) => void;
  onOpenWhatsApp: (cand: Candidato) => void;
  onMoveEtapa: (id: string, nextEtapa: EtapaProcesso) => void;
  onToggleFluxo: (id: string) => void;
  onSetStatus: (id: string, status: any) => void;
}

export const SortableKanbanCard: React.FC<SortableKanbanCardProps> = ({
  candidato,
  vaga,
  fluxoSimplificadoCargo,
  isSelected,
  onToggleSelect,
  onOpenModal,
  onOpenWhatsApp,
  onMoveEtapa,
  onToggleFluxo,
  onSetStatus,
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: candidato.id,
    data: {
      type: 'candidate',
      candidato,
      etapa: candidato.etapa_processo,
    },
  });

  const style: React.CSSProperties = {
    transform: CSS.Translate.toString(transform),
    transition,
    opacity: isDragging ? 0.35 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`touch-none select-none transition-all duration-150 ${
        isDragging ? 'cursor-grabbing z-0' : 'cursor-grab active:cursor-grabbing'
      }`}
    >
      <KanbanCard
        candidato={candidato}
        vaga={vaga}
        fluxoSimplificadoCargo={fluxoSimplificadoCargo}
        isSelected={isSelected}
        onToggleSelect={onToggleSelect}
        onOpenModal={onOpenModal}
        onOpenWhatsApp={onOpenWhatsApp}
        onMoveEtapa={onMoveEtapa}
        onToggleFluxo={onToggleFluxo}
        onSetStatus={onSetStatus}
        isDragging={isDragging}
      />
    </div>
  );
};
