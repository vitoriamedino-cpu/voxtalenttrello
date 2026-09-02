import React, { useState, useEffect } from 'react';
import { Candidato, Vaga, EtapaProcesso } from '../../types';
import { useApp } from '../../context/AppContext';
import { useWorkspace } from '../../context/WorkspaceContext';
import {
  createCalendarInterviewEvent,
  listEventsForDate,
  deleteCalendarEvent,
  CalendarEventItem,
} from '../../lib/googleCalendarService';
import { formatMensagemText, buildWhatsAppLink } from '../../lib/formatters';
import {
  Calendar as CalendarIcon,
  Video,
  X,
  Clock,
  Users,
  CheckCircle2,
  ExternalLink,
  Copy,
  Sparkles,
  Send,
  ShieldCheck,
  MapPin,
  Mail,
  AlertCircle,
  RefreshCw,
  Trash2,
  CalendarCheck,
  MessageCircle,
} from 'lucide-react';

interface InterviewScheduleModalProps {
  isOpen: boolean;
  onClose: () => void;
  candidato?: Candidato | null;
  candidatosBatch?: Candidato[];
  vaga?: Vaga | null;
  defaultEtapa?: EtapaProcesso;
  defaultDateProp?: string | null;
  onSuccess?: (event: CalendarEventItem, meetUrl?: string) => void;
}

export const InterviewScheduleModal: React.FC<InterviewScheduleModalProps> = ({
  isOpen,
  onClose,
  candidato,
  candidatosBatch = [],
  vaga,
  defaultEtapa,
  defaultDateProp,
  onSuccess,
}) => {
  const { templates, updateCandidato, config, setWhatsAppModalCandidate } = useApp();
  const { isConnected, login, confirmAction } = useWorkspace();

  // Targets
  const isBatch = !candidato && candidatosBatch.length > 0;
  const participants = isBatch ? candidatosBatch : candidato ? [candidato] : [];
  const participantsWithEmail = participants.filter((p) => Boolean(p.email));

  const getInitialDate = () => {
    if (defaultDateProp) return defaultDateProp;
    if (candidato?.data_entrevista) return candidato.data_entrevista;
    if (candidato?.aula_teste_data) return candidato.aula_teste_data;
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d.toISOString().split('T')[0];
  };

  const [interviewDate, setInterviewDate] = useState(getInitialDate());
  const [interviewTime, setInterviewTime] = useState(candidato?.hora_entrevista || '14:30');
  const [durationMinutes, setDurationMinutes] = useState(config.google_calendar_default_duration || 60);
  const [generateMeetLink, setGenerateMeetLink] = useState(config.google_calendar_auto_meet !== false);
  const [inviteByEmail, setInviteByEmail] = useState(config.google_calendar_notifications !== false);
  const [meetingTitle, setMeetingTitle] = useState(
    isBatch
      ? `Entrevista Coletiva / Online - ${vaga?.titulo || 'Processo Seletivo'}`
      : `${config.google_calendar_event_prefix || 'Entrevista'} ${defaultEtapa || candidato?.etapa_processo || 'R&S'} - ${candidato?.nome || 'Candidato'}`
  );
  const [locationType, setLocationType] = useState<'online' | 'presencial'>('online');
  const [customLocation, setCustomLocation] = useState(vaga ? `Unidade ${vaga.unidade}` : '');

  // Result state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [createdEvent, setCreatedEvent] = useState<CalendarEventItem | null>(null);
  const [generatedMeetUri, setGeneratedMeetUri] = useState<string | null>(null);
  const [copiedMeetLink, setCopiedMeetLink] = useState(false);

  // Day Agenda Events state
  const [dayEvents, setDayEvents] = useState<CalendarEventItem[]>([]);
  const [isLoadingDayEvents, setIsLoadingDayEvents] = useState(false);
  const [dayEventsError, setDayEventsError] = useState<string | null>(null);

  // Sync initial state when modal opens or candidate changes
  useEffect(() => {
    if (isOpen) {
      const initialD = getInitialDate();
      setInterviewDate(initialD);
      setInterviewTime(candidato?.hora_entrevista || '14:30');
      setMeetingTitle(
        isBatch
          ? `Entrevista Coletiva / Online - ${vaga?.titulo || 'Processo Seletivo'}`
          : `${config.google_calendar_event_prefix || 'Entrevista'} ${defaultEtapa || candidato?.etapa_processo || 'R&S'} - ${candidato?.nome || 'Candidato'}`
      );
      setCreatedEvent(null);
      setGeneratedMeetUri(candidato?.google_meet_link || null);
    }
  }, [isOpen, candidato, defaultDateProp]);

  // Load events for the selected date whenever connected and date changes
  useEffect(() => {
    if (isOpen && isConnected && interviewDate) {
      let isMounted = true;
      setIsLoadingDayEvents(true);
      setDayEventsError(null);

      listEventsForDate(interviewDate, config.google_calendar_id || 'primary')
        .then((events) => {
          if (isMounted) {
            setDayEvents(events);
            setIsLoadingDayEvents(false);
          }
        })
        .catch((err) => {
          if (isMounted) {
            console.warn('Erro ao listar eventos do dia:', err);
            setDayEventsError(err?.message || 'Não foi possível carregar a agenda do dia.');
            setIsLoadingDayEvents(false);
          }
        });

      return () => {
        isMounted = false;
      };
    } else {
      setDayEvents([]);
    }
  }, [isOpen, isConnected, interviewDate, config.google_calendar_id]);

  if (!isOpen) return null;

  const handleScheduleEvent = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isConnected) {
      login();
      return;
    }

    const startIso = `${interviewDate}T${interviewTime}:00-03:00`;
    const startDt = new Date(`${interviewDate}T${interviewTime}:00`);
    const endDt = new Date(startDt.getTime() + durationMinutes * 60 * 1000);
    const endHours = String(endDt.getHours()).padStart(2, '0');
    const endMins = String(endDt.getMinutes()).padStart(2, '0');
    const endIso = `${interviewDate}T${endHours}:${endMins}:00-03:00`;

    const formattedDateBR = new Date(`${interviewDate}T00:00:00`).toLocaleDateString('pt-BR', {
      weekday: 'long',
      day: '2-digit',
      month: '2-digit',
    });

    const attendeeEmails = inviteByEmail ? participantsWithEmail.map((p) => p.email!) : [];

    const actionDescription = `Criar o evento "${meetingTitle}" para ${formattedDateBR} às ${interviewTime} no seu Google Agenda${
      generateMeetLink ? ' com link do Google Meet' : ''
    }${attendeeEmails.length > 0 ? ` e convidar ${attendeeEmails.length} participante(s)` : ''}?`;

    confirmAction(actionDescription, async () => {
      setIsSubmitting(true);
      try {
        const descriptionLines = [
          `Processo Seletivo VoxTalent - Vox2you`,
          vaga ? `Vaga: ${vaga.titulo} (${vaga.unidade})` : '',
          isBatch
            ? `Candidatos Convidados (${participants.length}):\n${participants.map((p) => `• ${p.nome} (${p.telefone})`).join('\n')}`
            : candidato
            ? `Candidato: ${candidato.nome}\nTelefone: ${candidato.telefone}\nE-mail: ${candidato.email || 'N/A'}\nEtapa: ${candidato.etapa_processo}`
            : '',
        ].filter(Boolean);

        const event = await createCalendarInterviewEvent({
          summary: meetingTitle,
          description: descriptionLines.join('\n'),
          location:
            locationType === 'online'
              ? 'Google Meet (Online)'
              : customLocation || (vaga ? `Unidade ${vaga.unidade}` : 'Presencial'),
          startIso,
          endIso,
          attendeeEmails,
          createMeetLink: generateMeetLink,
          calendarId: config.google_calendar_id || 'primary',
          timeZone: config.google_calendar_timezone || 'America/Sao_Paulo',
        });

        const meetUrl = event.hangoutLink;
        setCreatedEvent(event);
        if (meetUrl) {
          setGeneratedMeetUri(meetUrl);
        }

        // Update candidate notes/history if single candidate
        if (candidato) {
          const updatedNotes = [
            candidato.notas_entrevista || '',
            `[Google Agenda ${new Date().toLocaleDateString('pt-BR')}]: Entrevista agendada para ${formattedDateBR} às ${interviewTime}.${
              meetUrl ? ` Link Google Meet: ${meetUrl}` : ''
            }`,
          ]
            .filter(Boolean)
            .join('\n\n');

          updateCandidato(candidato.id, {
            data_entrevista: interviewDate,
            hora_entrevista: interviewTime,
            google_calendar_event_id: event.id,
            google_calendar_event_link: event.htmlLink,
            google_meet_link: meetUrl || undefined,
            notas_entrevista: updatedNotes,
          });
        }

        // Refresh day events list
        listEventsForDate(interviewDate, config.google_calendar_id || 'primary')
          .then((evts) => setDayEvents(evts))
          .catch(() => {});

        if (onSuccess) {
          onSuccess(event, meetUrl);
        }
      } catch (err: any) {
        alert(`Erro ao criar evento na agenda: ${err?.message}`);
      } finally {
        setIsSubmitting(false);
      }
    });
  };

  const handleDeleteExistingEvent = () => {
    if (!candidato?.google_calendar_event_id) return;

    confirmAction('Deseja realmente remover este agendamento do Google Agenda?', async () => {
      setIsDeleting(true);
      try {
        await deleteCalendarEvent(candidato.google_calendar_event_id!);
        updateCandidato(candidato.id, {
          data_entrevista: undefined,
          hora_entrevista: undefined,
          google_calendar_event_id: undefined,
          google_calendar_event_link: undefined,
          google_meet_link: undefined,
        });
        setCreatedEvent(null);
        setGeneratedMeetUri(null);
        // Refresh day events
        listEventsForDate(interviewDate, config.google_calendar_id || 'primary')
          .then((evts) => setDayEvents(evts))
          .catch(() => {});
        alert('Evento removido com sucesso do Google Agenda.');
      } catch (err: any) {
        alert(`Erro ao remover evento: ${err?.message}`);
      } finally {
        setIsDeleting(false);
      }
    });
  };

  const handleCopyMeet = () => {
    if (!generatedMeetUri) return;
    navigator.clipboard.writeText(generatedMeetUri);
    setCopiedMeetLink(true);
    setTimeout(() => setCopiedMeetLink(false), 2500);
  };

  const formatEventTime = (event: CalendarEventItem) => {
    if (event.start?.dateTime) {
      const d = new Date(event.start.dateTime);
      const startH = d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
      if (event.end?.dateTime) {
        const endD = new Date(event.end.dateTime);
        const endH = endD.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
        return `${startH} - ${endH}`;
      }
      return startH;
    }
    return 'Dia todo';
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 dark:bg-black/75 backdrop-blur-xs p-4 overflow-y-auto">
      <div
        id="interview-schedule-modal"
        className="relative w-full max-w-2xl rounded-2xl bg-white dark:bg-[#111827] shadow-2xl border border-gray-200 dark:border-gray-800 overflow-hidden animate-in fade-in zoom-in-95 duration-150 max-h-[92vh] flex flex-col"
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-800 px-5 py-4 bg-gray-50/80 dark:bg-[#151d2f]">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#00A9A1] text-white shadow-xs">
              <CalendarIcon className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <span>Google Agenda & Google Meet</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-teal-100 dark:bg-teal-950 text-[#00857e] dark:text-[#00C4BB]">
                  OAuth 2.0
                </span>
              </h3>
              <p className="text-[11px] text-gray-500 dark:text-gray-400">
                {isBatch
                  ? `Sessão Coletiva com ${participants.length} candidatos • ${vaga?.titulo || ''}`
                  : `Candidato: ${candidato?.nome || ''} • ${vaga?.titulo || candidato?.vaga_titulo || ''} (${candidato?.unidade || ''})`}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body - Scrollable */}
        <div className="p-5 space-y-4 text-xs overflow-y-auto flex-1">
          {/* Connection Status Banner */}
          {!isConnected ? (
            <div className="rounded-xl border border-amber-200 dark:border-amber-900/60 bg-amber-50/80 dark:bg-amber-950/40 p-3.5 flex items-center justify-between gap-3 text-amber-900 dark:text-amber-200">
              <div className="flex items-center gap-2.5">
                <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0" />
                <div>
                  <p className="text-xs font-bold">Autenticação Google Workspace Necessária</p>
                  <p className="text-[11px] text-amber-700 dark:text-amber-300">
                    Conecte sua conta Google para consultar horários livres e criar eventos no Google Agenda com Google Meet.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={login}
                className="px-3.5 py-2 rounded-xl bg-[#00A9A1] hover:bg-[#008f88] text-white font-bold text-xs shadow-xs transition-colors flex-shrink-0 active:scale-95"
              >
                Conectar Google
              </button>
            </div>
          ) : (
            <div className="rounded-xl border border-teal-200/80 dark:border-teal-800/60 bg-teal-50/60 dark:bg-teal-950/30 p-3 flex items-center justify-between text-teal-900 dark:text-teal-200">
              <div className="flex items-center gap-2.5">
                <ShieldCheck className="w-5 h-5 text-[#00A9A1] dark:text-[#00C4BB]" />
                <div>
                  <span className="text-xs font-bold block">
                    Google Workspace Conectado
                  </span>
                  <span className="text-[10px] text-teal-700 dark:text-teal-300">
                    Google Calendar API v3 & Meet Spaces ativos
                  </span>
                </div>
              </div>
              <span className="text-[10px] font-extrabold uppercase tracking-wider bg-teal-100 dark:bg-teal-900/60 text-teal-800 dark:text-teal-300 px-2 py-0.5 rounded">
                Sincronizado
              </span>
            </div>
          )}

          {/* If Candidate Already Has a Scheduled Event */}
          {candidato?.data_entrevista && !createdEvent && (
            <div className="rounded-xl border border-indigo-200 dark:border-indigo-800/60 bg-indigo-50/60 dark:bg-indigo-950/30 p-3.5 text-indigo-950 dark:text-indigo-200 space-y-2.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 font-bold text-xs text-indigo-900 dark:text-indigo-200">
                  <CalendarCheck className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                  <span>
                    Evento já agendado para {new Date(`${candidato.data_entrevista}T00:00:00`).toLocaleDateString('pt-BR')} às {candidato.hora_entrevista || '14:30'}
                  </span>
                </div>

                <button
                  type="button"
                  disabled={isDeleting}
                  onClick={handleDeleteExistingEvent}
                  className="inline-flex items-center gap-1 text-[11px] font-bold text-rose-600 dark:text-rose-400 hover:underline p-1 disabled:opacity-50"
                  title="Excluir este evento do Google Agenda"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>{isDeleting ? 'Excluindo...' : 'Excluir Agendamento'}</span>
                </button>
              </div>

              <div className="flex items-center gap-2 flex-wrap pt-1">
                {candidato.google_calendar_event_link && (
                  <a
                    href={candidato.google_calendar_event_link}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-[11px] shadow-xs"
                  >
                    <ExternalLink className="w-3 h-3" />
                    <span>Ver no Google Agenda</span>
                  </a>
                )}

                {candidato.google_meet_link && (
                  <>
                    <a
                      href={candidato.google_meet_link}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#00A9A1] hover:bg-[#008f88] text-white font-bold text-[11px] shadow-xs"
                    >
                      <Video className="w-3 h-3" />
                      <span>Abrir Google Meet</span>
                    </a>

                    <button
                      type="button"
                      onClick={() => {
                        navigator.clipboard.writeText(candidato.google_meet_link!);
                        alert('Link do Meet copiado para a área de transferência!');
                      }}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg border border-indigo-200 dark:border-indigo-700 bg-white dark:bg-gray-800 text-indigo-900 dark:text-indigo-200 font-bold text-[11px]"
                    >
                      <Copy className="w-3 h-3" />
                      <span>Copiar Meet</span>
                    </button>
                  </>
                )}
              </div>
            </div>
          )}

          {/* Success state after creation */}
          {createdEvent ? (
            <div className="space-y-4 animate-in fade-in duration-150">
              <div className="rounded-xl border border-emerald-200 dark:border-emerald-800 bg-emerald-50/70 dark:bg-emerald-950/30 p-4 text-emerald-950 dark:text-emerald-200">
                <div className="flex items-center gap-2 mb-2 font-bold text-sm text-emerald-800 dark:text-emerald-300">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                  <span>Evento agendado com sucesso no Google Agenda!</span>
                </div>
                <p className="text-xs text-emerald-800 dark:text-emerald-300">
                  O evento <strong>"{createdEvent.summary}"</strong> foi registrado para o dia{' '}
                  <strong>{new Date(`${interviewDate}T00:00:00`).toLocaleDateString('pt-BR')}</strong> às{' '}
                  <strong>{interviewTime}</strong>.
                </p>

                {generatedMeetUri && (
                  <div className="mt-3.5 pt-3 border-t border-emerald-200 dark:border-emerald-800/60">
                    <label className="block text-[11px] font-bold text-emerald-900 dark:text-emerald-200 mb-1 flex items-center gap-1.5">
                      <Video className="w-3.5 h-3.5 text-[#00A9A1] dark:text-[#00C4BB]" />
                      Link da Sala Google Meet:
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        readOnly
                        value={generatedMeetUri}
                        className="flex-1 rounded-lg border border-emerald-300 dark:border-emerald-700 bg-white dark:bg-gray-800 px-3 py-1.5 text-xs font-mono font-bold text-gray-900 dark:text-gray-100 select-all"
                      />
                      <button
                        type="button"
                        onClick={handleCopyMeet}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[#00A9A1] hover:bg-[#008f88] text-white font-bold text-xs shadow-xs transition-colors"
                      >
                        <Copy className="w-3.5 h-3.5" />
                        <span>{copiedMeetLink ? 'Copiado!' : 'Copiar'}</span>
                      </button>
                      <a
                        href={generatedMeetUri}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-xs transition-colors"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        <span>Abrir Meet</span>
                      </a>
                    </div>
                  </div>
                )}

                {createdEvent.htmlLink && (
                  <div className="mt-3 flex items-center gap-2">
                    <a
                      href={createdEvent.htmlLink}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 dark:text-emerald-300 hover:underline"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      <span>Visualizar evento na interface do Google Agenda</span>
                    </a>
                  </div>
                )}
              </div>

              {/* Fast Forward Actions: WhatsApp Trigger */}
              {candidato && (
                <div className="p-3 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50/60 dark:bg-gray-800/40 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <MessageCircle className="w-4 h-4 text-emerald-600" />
                    <span className="text-xs font-semibold text-gray-800 dark:text-gray-200">
                      Notificar {candidato.nome} no WhatsApp agora com os dados do agendamento?
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      setWhatsAppModalCandidate(candidato);
                    }}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Abrir WhatsApp</span>
                  </button>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex items-center justify-between pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setCreatedEvent(null);
                  }}
                  className="text-xs text-gray-500 hover:text-gray-700 dark:text-gray-400 font-semibold"
                >
                  ← Reagendar / Outro Horário
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="rounded-xl bg-[#00A9A1] hover:bg-[#008f88] px-5 py-2 font-bold text-white text-xs shadow-xs"
                >
                  Concluir
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleScheduleEvent} className="space-y-4">
              {/* Event Title */}
              <div>
                <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1 text-[11px]">
                  Título do Evento no Google Agenda
                </label>
                <input
                  type="text"
                  required
                  value={meetingTitle}
                  onChange={(e) => setMeetingTitle(e.target.value)}
                  className="w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-xs font-semibold text-gray-900 dark:text-white focus:ring-1 focus:ring-[#00A9A1] focus:outline-none"
                />
              </div>

              {/* Date & Time Row */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1 text-[11px]">
                    Data Selecionada
                  </label>
                  <input
                    type="date"
                    required
                    value={interviewDate}
                    onChange={(e) => setInterviewDate(e.target.value)}
                    className="w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-xs text-gray-900 dark:text-white focus:ring-1 focus:ring-[#00A9A1] focus:outline-none font-semibold"
                  />
                </div>

                <div>
                  <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1 text-[11px]">
                    Horário de Início
                  </label>
                  <input
                    type="time"
                    required
                    value={interviewTime}
                    onChange={(e) => setInterviewTime(e.target.value)}
                    className="w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-xs text-gray-900 dark:text-white focus:ring-1 focus:ring-[#00A9A1] focus:outline-none font-semibold"
                  />
                </div>

                <div>
                  <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1 text-[11px]">
                    Duração
                  </label>
                  <select
                    value={durationMinutes}
                    onChange={(e) => setDurationMinutes(Number(e.target.value))}
                    className="w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-xs font-semibold text-gray-700 dark:text-gray-200 focus:ring-1 focus:ring-[#00A9A1] focus:outline-none"
                  >
                    <option value={30}>30 minutos</option>
                    <option value={45}>45 minutos</option>
                    <option value={60}>60 minutos (1h)</option>
                    <option value={90}>90 minutos (1h30)</option>
                    <option value={120}>120 minutos (2h)</option>
                  </select>
                </div>
              </div>

              {/* LIVE GOOGLE CALENDAR DAY SCHEDULE INSPECTOR */}
              {isConnected && (
                <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50/70 dark:bg-[#151d2f] p-3.5 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 font-bold text-gray-800 dark:text-gray-200 text-[11px]">
                      <Clock className="w-3.5 h-3.5 text-[#00A9A1]" />
                      <span>
                        Agenda do dia {new Date(`${interviewDate}T00:00:00`).toLocaleDateString('pt-BR')} no Google Agenda:
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        setIsLoadingDayEvents(true);
                        listEventsForDate(interviewDate, config.google_calendar_id || 'primary')
                          .then((evts) => {
                            setDayEvents(evts);
                            setIsLoadingDayEvents(false);
                          })
                          .catch(() => setIsLoadingDayEvents(false));
                      }}
                      className="p-1 rounded text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
                      title="Atualizar agenda do dia"
                    >
                      <RefreshCw className={`w-3 h-3 ${isLoadingDayEvents ? 'animate-spin' : ''}`} />
                    </button>
                  </div>

                  {isLoadingDayEvents ? (
                    <div className="py-3 flex items-center justify-center gap-2 text-[11px] text-gray-500">
                      <RefreshCw className="w-3 h-3 animate-spin text-[#00A9A1]" />
                      <span>Consultando eventos no Google Agenda...</span>
                    </div>
                  ) : dayEvents.length === 0 ? (
                    <div className="p-2 rounded-lg bg-emerald-50/60 dark:bg-emerald-950/30 text-[11px] text-emerald-800 dark:text-emerald-300 font-medium flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Nenhum outro compromisso agendado para este dia. Horário totalmente livre!</span>
                    </div>
                  ) : (
                    <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
                      {dayEvents.map((evt) => (
                        <div
                          key={evt.id}
                          className="flex items-center justify-between p-2 rounded-lg bg-white dark:bg-gray-800 border border-gray-200/80 dark:border-gray-700 text-[11px]"
                        >
                          <div className="flex items-center gap-2 truncate">
                            <span className="px-1.5 py-0.5 rounded bg-gray-100 dark:bg-gray-700 font-mono text-[10px] font-bold text-gray-700 dark:text-gray-300 flex-shrink-0">
                              {formatEventTime(evt)}
                            </span>
                            <span className="font-semibold text-gray-900 dark:text-white truncate">
                              {evt.summary}
                            </span>
                          </div>
                          {evt.hangoutLink && (
                            <span className="flex-shrink-0 text-[10px] font-bold text-[#00A9A1] flex items-center gap-0.5">
                              <Video className="w-3 h-3" />
                              Meet
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Google Meet Automatic Generation Option */}
              <div className="rounded-xl border-2 border-[#00A9A1]/40 dark:border-[#00A9A1]/50 bg-teal-50/70 dark:bg-teal-950/40 p-3.5">
                <label className="flex items-start gap-3 cursor-pointer select-none">
                  <input
                    id="checkbox-generate-meet-link"
                    type="checkbox"
                    checked={generateMeetLink}
                    onChange={(e) => setGenerateMeetLink(e.target.checked)}
                    className="mt-0.5 h-4 w-4 rounded border-teal-400 text-[#00A9A1] focus:ring-[#00A9A1]"
                  />
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <Video className="w-4 h-4 text-[#00A9A1] dark:text-[#00C4BB]" />
                      <span className="font-extrabold text-xs text-teal-950 dark:text-teal-100">
                        Gerar Sala Google Meet automaticamente
                      </span>
                      <span className="px-1.5 py-0.2 bg-teal-200/80 dark:bg-teal-900 text-teal-900 dark:text-teal-200 text-[9px] font-black rounded uppercase">
                        Nativo
                      </span>
                    </div>
                    <p className="mt-1 text-[11px] text-teal-800 dark:text-teal-300 leading-relaxed">
                      Cria uma sala no Google Meet, anexa o link ao evento do calendário e salva nos registros do candidato.
                    </p>
                  </div>
                </label>
              </div>

              {/* Participants & Email Invite Option */}
              <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/40 p-3 space-y-2">
                <label className="flex items-center gap-2 cursor-pointer select-none font-bold text-gray-800 dark:text-gray-200 text-[11px]">
                  <input
                    type="checkbox"
                    checked={inviteByEmail}
                    onChange={(e) => setInviteByEmail(e.target.checked)}
                    className="h-3.5 w-3.5 rounded border-gray-300 text-[#00A9A1] focus:ring-[#00A9A1]"
                  />
                  <Mail className="w-3.5 h-3.5 text-indigo-500" />
                  <span>
                    Convidar por e-mail no Google Agenda ({participantsWithEmail.length} com e-mail cadastrado)
                  </span>
                </label>

                <div className="text-[11px] text-gray-500 dark:text-gray-400 pl-5">
                  {participants.length === 1 ? (
                    <span>
                      {participants[0].nome} • {participants[0].email || 'Sem e-mail cadastrado (notificação será via WhatsApp)'}
                    </span>
                  ) : (
                    <span>
                      {participants.length} candidatos da vaga <strong>{vaga?.titulo}</strong> convocados.
                    </span>
                  )}
                </div>
              </div>

              {/* Location Selector if not online only */}
              {!generateMeetLink && (
                <div>
                  <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1 text-[11px]">
                    Local Presencial da Entrevista
                  </label>
                  <div className="relative">
                    <MapPin className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={customLocation}
                      onChange={(e) => setCustomLocation(e.target.value)}
                      placeholder="Ex: Sala de Reunião 2 - Unidade Savassi"
                      className="w-full pl-8 pr-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-xs text-gray-900 dark:text-white focus:ring-1 focus:ring-[#00A9A1] focus:outline-none"
                    />
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-gray-100 dark:border-gray-800">
                <button
                  type="button"
                  onClick={onClose}
                  className="rounded-xl border border-gray-200 dark:border-gray-700 px-4 py-2 font-semibold text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 text-xs"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-[#00A9A1] hover:bg-[#008f88] px-4 py-2 font-bold text-white text-xs shadow-xs active:scale-95 transition-all disabled:opacity-50"
                >
                  <CalendarIcon className="w-3.5 h-3.5" />
                  <span>
                    {isSubmitting
                      ? 'Agendando no Google Agenda...'
                      : generateMeetLink
                      ? 'Criar Evento no Google Agenda + Meet'
                      : 'Criar Evento no Google Agenda'}
                  </span>
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
