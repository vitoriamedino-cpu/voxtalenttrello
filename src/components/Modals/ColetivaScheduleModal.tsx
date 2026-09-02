import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { useWorkspace } from '../../context/WorkspaceContext';
import { createCalendarInterviewEvent } from '../../lib/googleCalendarService';
import { createGoogleMeetSpace } from '../../lib/googleMeetService';
import { formatMensagemText, buildWhatsAppLink } from '../../lib/formatters';
import {
  Calendar,
  X,
  Users,
  ShieldCheck,
  Send,
  Copy,
  CheckCircle2,
  Clock,
  Video,
  ExternalLink,
  Sparkles,
  Mail,
  CalendarCheck,
} from 'lucide-react';

interface ColetivaScheduleModalProps {
  vagaId: string | null;
  isOpen: boolean;
  onClose: () => void;
}

export const ColetivaScheduleModal: React.FC<ColetivaScheduleModalProps> = ({
  vagaId,
  isOpen,
  onClose,
}) => {
  const { vagas, candidatos, templates, updateCandidato, config } = useApp();
  const { isConnected, login, confirmAction } = useWorkspace();

  const vaga = vagas.find((v) => v.id === vagaId);
  const candidatosColetiva = candidatos.filter(
    (c) =>
      c.vaga_id === vagaId &&
      c.etapa_processo === 'Entrevista Coletiva/Online' &&
      c.status === 'Em andamento'
  );

  const coletivaTemplate =
    templates.find((t) => t.etapa === 'Entrevista Coletiva/Online') || templates[0];

  const defaultDateTomorrow = () => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d.toISOString().split('T')[0];
  };

  const [dateIso, setDateIso] = useState(defaultDateTomorrow());
  const [timeStr, setTimeStr] = useState('14:30');
  const [durationMin, setDurationMin] = useState(config.google_calendar_default_duration || 60);
  const [meetLink, setMeetLink] = useState(config.google_meet_fallback_link || 'https://meet.google.com/vox-rse-meet');
  const [autoGenerateMeet, setAutoGenerateMeet] = useState(config.google_calendar_auto_meet !== false);
  const [inviteCandidatesEmail, setInviteCandidatesEmail] = useState(config.google_calendar_notifications !== false);
  const [isSchedulingCalendar, setIsSchedulingCalendar] = useState(false);
  const [isGeneratingOnlyMeet, setIsGeneratingOnlyMeet] = useState(false);
  const [calendarScheduledSuccess, setCalendarScheduledSuccess] = useState(false);
  const [scheduledMeetUri, setScheduledMeetUri] = useState<string | null>(null);

  // Formatted date string for candidate messages
  const getFormattedDataHora = () => {
    try {
      const d = new Date(`${dateIso}T${timeStr}:00`);
      const formatted = d.toLocaleDateString('pt-BR', {
        weekday: 'long',
        day: '2-digit',
        month: '2-digit',
      });
      return `${formatted} às ${timeStr}`;
    } catch {
      return `${dateIso} às ${timeStr}`;
    }
  };

  const dataHoraLabel = getFormattedDataHora();

  // Generate only Google Meet link standalone
  const handleGenerateOnlyMeet = async () => {
    if (!isConnected) {
      login();
      return;
    }
    setIsGeneratingOnlyMeet(true);
    try {
      const result = await createGoogleMeetSpace();
      setMeetLink(result.meetingUri);
      setScheduledMeetUri(result.meetingUri);
    } catch (err: any) {
      alert(`Erro ao gerar link do Google Meet: ${err?.message}`);
    } finally {
      setIsGeneratingOnlyMeet(false);
    }
  };

  // Create Google Calendar event with integrated Meet generation
  const handleCreateCalendarWithMeet = () => {
    if (!isConnected) {
      login();
      return;
    }

    const startIso = `${dateIso}T${timeStr}:00-03:00`;
    const startDt = new Date(`${dateIso}T${timeStr}:00`);
    const endDt = new Date(startDt.getTime() + durationMin * 60 * 1000);
    const endHours = String(endDt.getHours()).padStart(2, '0');
    const endMins = String(endDt.getMinutes()).padStart(2, '0');
    const endIso = `${dateIso}T${endHours}:${endMins}:00-03:00`;

    const candidateEmails = inviteCandidatesEmail
      ? candidatosColetiva.map((c) => c.email).filter(Boolean) as string[]
      : [];

    const confirmMsg = `Criar evento "Entrevista Coletiva / Online - ${vaga?.titulo}" na sua Google Agenda para ${dataHoraLabel}${
      autoGenerateMeet ? ' com geração de link do Google Meet' : ''
    }${candidateEmails.length > 0 ? ` e convidar ${candidateEmails.length} candidato(s) por e-mail` : ''}?`;

    confirmAction(confirmMsg, async () => {
      setIsSchedulingCalendar(true);
      try {
        const descriptionLines = [
          `Entrevista Coletiva / Online - VoxTalent R&S`,
          vaga ? `Vaga: ${vaga.titulo} • Unidade: ${vaga.unidade}` : '',
          `Total de Candidatos Convocados: ${candidatosColetiva.length}`,
          `\nLista de Candidatos:`,
          ...candidatosColetiva.map((c) => `• ${c.nome} - Tel: ${c.telefone || 'N/A'} - Email: ${c.email || 'N/A'}`),
        ].filter(Boolean);

        const created = await createCalendarInterviewEvent({
          summary: `Entrevista Coletiva / Online - ${vaga?.titulo || 'Processo Seletivo'} (${vaga?.unidade || ''})`,
          description: descriptionLines.join('\n'),
          location: autoGenerateMeet ? 'Google Meet (Online)' : `Unidade Vox2you ${vaga?.unidade || ''}`,
          startIso,
          endIso,
          attendeeEmails: candidateEmails,
          createMeetLink: autoGenerateMeet,
        });

        if (created.hangoutLink) {
          setMeetLink(created.hangoutLink);
          setScheduledMeetUri(created.hangoutLink);
        }

        setCalendarScheduledSuccess(true);

        // Update candidates notes
        candidatosColetiva.forEach((cand) => {
          const note = `[Coletiva Agendada]: Entrevista agendada para ${dataHoraLabel}.${
            created.hangoutLink ? ` Meet: ${created.hangoutLink}` : ''
          }`;
          updateCandidato(cand.id, {
            notas_entrevista: cand.notas_entrevista ? `${cand.notas_entrevista}\n\n${note}` : note,
          });
        });
      } catch (err: any) {
        alert(`Erro ao agendar no Google Agenda: ${err?.message}`);
      } finally {
        setIsSchedulingCalendar(false);
      }
    });
  };

  if (!isOpen || !vaga) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 dark:bg-black/75 backdrop-blur-xs p-4 overflow-y-auto">
      <div
        id="coletiva-schedule-modal"
        className="relative w-full max-w-2xl rounded-2xl bg-white dark:bg-gray-800 shadow-2xl border border-gray-200 dark:border-gray-700 p-5 animate-in fade-in zoom-in-95 duration-150"
      >
        <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-700/80 pb-3 mb-3.5">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-teal-600 dark:bg-teal-500 text-white shadow-xs">
              <Calendar className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-gray-900 dark:text-white">
                Agendamento de Entrevista Coletiva / Online
              </h3>
              <p className="text-[11px] text-gray-500 dark:text-gray-400">
                {vaga.titulo} • <strong className="text-gray-700 dark:text-gray-200">{vaga.unidade}</strong>
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-3.5 text-xs">
          {/* Confidentiality Notice */}
          <div className="rounded-xl bg-indigo-50/80 dark:bg-indigo-950/40 border border-indigo-200/80 dark:border-indigo-800/60 p-3 text-indigo-900 dark:text-indigo-200 flex items-start gap-2.5">
            <ShieldCheck className="w-4 h-4 text-indigo-600 dark:text-indigo-400 flex-shrink-0 mt-0.5" />
            <div>
              <strong className="font-bold text-[11px]">Garantia de Sigilo Automática:</strong>
              <p className="mt-0.5 text-[11px] text-indigo-800 dark:text-indigo-300 leading-relaxed">
                As mensagens geradas para WhatsApp são 100% individualizadas para cada candidato, omitindo a presença de outros participantes para preservar a dinâmica.
              </p>
            </div>
          </div>

          {/* Date, Time and Duration Controls */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 bg-gray-50/70 dark:bg-gray-850 p-3 rounded-xl border border-gray-200 dark:border-gray-700">
            <div>
              <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1 text-[11px]">
                Data da Sessão
              </label>
              <input
                type="date"
                value={dateIso}
                onChange={(e) => setDateIso(e.target.value)}
                className="w-full rounded-md border border-gray-200 dark:border-gray-700 px-2.5 py-1.5 text-gray-900 dark:text-white bg-white dark:bg-gray-800 focus:ring-1 focus:ring-[#00A9A1] text-xs font-medium focus:outline-none"
              />
            </div>
            <div>
              <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1 text-[11px]">
                Horário de Início
              </label>
              <input
                type="time"
                value={timeStr}
                onChange={(e) => setTimeStr(e.target.value)}
                className="w-full rounded-md border border-gray-200 dark:border-gray-700 px-2.5 py-1.5 text-gray-900 dark:text-white bg-white dark:bg-gray-800 focus:ring-1 focus:ring-[#00A9A1] text-xs font-medium focus:outline-none"
              />
            </div>
            <div>
              <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1 text-[11px]">
                Duração
              </label>
              <select
                value={durationMin}
                onChange={(e) => setDurationMin(Number(e.target.value))}
                className="w-full rounded-md border border-gray-200 dark:border-gray-700 px-2.5 py-1.5 text-gray-900 dark:text-white bg-white dark:bg-gray-800 focus:ring-1 focus:ring-[#00A9A1] text-xs font-semibold focus:outline-none"
              >
                <option value={45}>45 minutos</option>
                <option value={60}>60 minutos (1h)</option>
                <option value={90}>90 minutos (1h30)</option>
                <option value={120}>120 minutos (2h)</option>
              </select>
            </div>
          </div>

          {/* Integrated Calendar & Meet Options */}
          <div className="rounded-xl border-2 border-teal-500/40 dark:border-teal-500/50 bg-teal-50/60 dark:bg-teal-950/30 p-3.5 space-y-2.5">
            <div className="flex items-start gap-2.5">
              <input
                id="checkbox-coletiva-auto-meet"
                type="checkbox"
                checked={autoGenerateMeet}
                onChange={(e) => setAutoGenerateMeet(e.target.checked)}
                className="mt-0.5 h-4 w-4 rounded border-teal-400 text-teal-600 focus:ring-teal-500"
              />
              <div className="flex-1">
                <label
                  htmlFor="checkbox-coletiva-auto-meet"
                  className="font-extrabold text-xs text-teal-950 dark:text-teal-100 flex items-center gap-1.5 cursor-pointer"
                >
                  <Video className="w-4 h-4 text-[#00A9A1] dark:text-[#00C4BB]" />
                  <span>Gerar Link do Google Meet automaticamente ao criar evento de calendário</span>
                  <span className="px-1.5 py-0.2 bg-teal-200/80 dark:bg-teal-900 text-teal-900 dark:text-teal-200 text-[9px] font-black rounded uppercase">
                    Calendar + Meet
                  </span>
                </label>
                <p className="text-[11px] text-teal-800 dark:text-teal-300 mt-0.5 leading-relaxed">
                  Cria o evento na sua agenda sincronizada, reserva uma sala oficial do <strong>Google Meet</strong> e anexa o link aos convites e mensagens do WhatsApp.
                </p>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-teal-200/60 dark:border-teal-800/60 pl-6">
              <label className="flex items-center gap-1.5 text-[11px] text-teal-900 dark:text-teal-200 font-semibold cursor-pointer">
                <input
                  type="checkbox"
                  checked={inviteCandidatesEmail}
                  onChange={(e) => setInviteCandidatesEmail(e.target.checked)}
                  className="h-3.5 w-3.5 rounded border-teal-300 text-teal-600 focus:ring-teal-500"
                />
                <Mail className="w-3 h-3 text-teal-600 dark:text-teal-400" />
                <span>Incluir e-mails dos candidatos nos convites da agenda</span>
              </label>

              <button
                type="button"
                onClick={handleCreateCalendarWithMeet}
                disabled={isSchedulingCalendar}
                className="inline-flex items-center gap-1.5 rounded-lg bg-[#00A9A1] hover:bg-[#008f88] dark:bg-[#00A9A1] dark:hover:bg-[#00C4BB] px-3 py-1.5 text-xs font-bold text-white shadow-xs transition-colors disabled:opacity-50"
              >
                <CalendarCheck className="w-3.5 h-3.5" />
                <span>{isSchedulingCalendar ? 'Agendando...' : 'Agendar no Google Agenda + Meet'}</span>
              </button>
            </div>

            {calendarScheduledSuccess && (
              <div className="rounded-lg bg-emerald-100 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-800 p-2.5 text-emerald-900 dark:text-emerald-200 flex items-center justify-between text-[11px] font-semibold">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
                  <span>Evento e Sala do Google Meet criados com sucesso na sua Google Agenda!</span>
                </div>
                {scheduledMeetUri && (
                  <a
                    href={scheduledMeetUri}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 font-bold text-teal-700 dark:text-teal-300 hover:underline"
                  >
                    <span>Entrar na Sala</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                )}
              </div>
            )}
          </div>

          {/* Current Meet Link Display */}
          <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-3">
            <div className="flex items-center justify-between mb-1.5">
              <label className="font-bold text-gray-700 dark:text-gray-300 text-[11px] flex items-center gap-1.5">
                <Video className="w-3.5 h-3.5 text-teal-600" />
                <span>Link da Sala Google Meet</span>
              </label>
              <button
                type="button"
                onClick={handleGenerateOnlyMeet}
                disabled={isGeneratingOnlyMeet}
                className="text-[10px] text-[#00A9A1] dark:text-[#00C4BB] font-bold hover:underline inline-flex items-center gap-1"
              >
                <Sparkles className="w-2.5 h-2.5" />
                <span>{isGeneratingOnlyMeet ? 'Gerando...' : 'Gerar Sala Meet Avulsa'}</span>
              </button>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="url"
                value={meetLink}
                onChange={(e) => setMeetLink(e.target.value)}
                placeholder="https://meet.google.com/..."
                className="flex-1 rounded-md border border-gray-200 dark:border-gray-700 px-3 py-1.5 text-gray-900 dark:text-white bg-white dark:bg-gray-800 font-mono text-xs focus:ring-1 focus:ring-[#00A9A1] focus:outline-none"
              />
              <button
                type="button"
                onClick={() => {
                  navigator.clipboard.writeText(meetLink);
                  alert('Link do Google Meet copiado!');
                }}
                className="p-2 rounded-md border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                title="Copiar Link"
              >
                <Copy className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* List of Candidates in Batch */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="font-bold text-gray-800 dark:text-gray-200 flex items-center gap-1.5 text-[11px]">
                <Users className="w-3.5 h-3.5 text-[#00A9A1] dark:text-[#00C4BB]" />
                Candidatos Prontos para Convocação ({candidatosColetiva.length}):
              </label>
            </div>

            <div className="rounded-xl border border-gray-200 dark:border-gray-700 divide-y divide-gray-100 dark:divide-gray-700 max-h-52 overflow-y-auto bg-gray-50/40 dark:bg-gray-850">
              {candidatosColetiva.map((cand) => {
                const msgText = formatMensagemText(coletivaTemplate, cand, vaga, {
                  'Data/Horário': dataHoraLabel,
                  'Link do Google Meet': meetLink,
                });
                const waLink = buildWhatsAppLink(cand.telefone, msgText);

                return (
                  <div
                    key={cand.id}
                    className="p-2.5 flex items-center justify-between gap-3 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors"
                  >
                    <div>
                      <span className="font-bold text-gray-900 dark:text-white block text-xs">
                        {cand.nome}
                      </span>
                      <span className="text-[10px] text-gray-400 dark:text-gray-400 font-mono">
                        {cand.telefone} {cand.email ? `• ${cand.email}` : ''}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          navigator.clipboard.writeText(msgText);
                          alert(`Mensagem com data e link do Meet copiada para ${cand.nome}!`);
                        }}
                        className="p-1.5 rounded-lg border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 text-[10px] font-semibold flex items-center gap-1 shadow-2xs"
                        title="Copiar mensagem individual"
                      >
                        <Copy className="w-3 h-3" />
                        Copiar
                      </button>

                      <a
                        href={waLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 rounded-lg bg-[#00A9A1] hover:bg-[#008f88] dark:bg-[#00A9A1] dark:hover:bg-[#00C4BB] px-2.5 py-1 text-[10px] font-bold text-white shadow-2xs transition-colors"
                      >
                        <Send className="w-3 h-3" />
                        WhatsApp
                      </a>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Footer Action */}
          <div className="flex justify-end gap-2 pt-2.5 border-t border-gray-100 dark:border-gray-700">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-gray-200 dark:border-gray-700 px-4 py-1.5 font-semibold text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 text-xs"
            >
              Fechar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

