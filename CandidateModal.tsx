import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { UNIDADES_VOX, ETAPAS_KANBAN, STATUS_CANDIDATO, CANAIS_DIVULGACAO } from '../../lib/rsConstants';
import { Candidato, EtapaProcesso, StatusCandidato, UnidadeVox } from '../../types';
import { formatMensagemText, buildWhatsAppLink, formatDateBR } from '../../lib/formatters';
import {
  X,
  User,
  Mail,
  Phone,
  Briefcase,
  MapPin,
  FileText,
  Video,
  Star,
  MessageCircle,
  Clock,
  History,
  GraduationCap,
  Copy,
  ExternalLink,
  CheckCircle,
  Trash2,
  Send,
  AlertTriangle,
  Sparkles,
  FolderGit2,
  Calendar as CalendarIcon,
  Printer,
} from 'lucide-react';
import { useWorkspace } from '../../context/WorkspaceContext';
import { uploadTextFileToDrive } from '../../lib/googleDriveService';
import { sendGmailMessage } from '../../lib/googleGmailService';
import { InterviewScheduleModal } from './InterviewScheduleModal';

interface CandidateModalProps {
  candidateId: string | null;
  isOpen: boolean;
  onClose: () => void;
}

export const CandidateModal: React.FC<CandidateModalProps> = ({
  candidateId,
  isOpen,
  onClose,
}) => {
  const {
    candidatos,
    vagas,
    templates,
    config,
    updateCandidato,
    deleteCandidato,
    moveCandidatoEtapa,
    setCandidatoStatus,
    toggleFluxoSimplificado,
    getVagaById,
    setCandidatePdfModalId,
  } = useApp();

  const candidato = candidatos.find((c) => c.id === candidateId);
  const vaga = candidato ? getVagaById(candidato.vaga_id) : undefined;
  const { isConnected, confirmAction, login } = useWorkspace();
  const [isWorkspaceActionLoading, setIsWorkspaceActionLoading] = useState(false);
  const [workspaceToast, setWorkspaceToast] = useState<string | null>(null);
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);

  // Audit Fix #4: Usa o campo estruturado vaga?.cargo
  const cargoEstruturado = vaga?.cargo || '';
  const isCargoFluxoSimplificado =
    cargoEstruturado.toLowerCase() === (config.fluxo_simplificado_cargo || 'professor').toLowerCase();

  // Local editing form state
  const [formData, setFormData] = useState<Partial<Candidato>>({});
  const [activeTab, setActiveTab] = useState<'info' | 'historico' | 'whatsapp'>('info');
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>('');
  const [customMsgText, setCustomMsgText] = useState<string>('');
  const [copiedMsg, setCopiedMsg] = useState(false);

  useEffect(() => {
    if (candidato) {
      setFormData(candidato);
      // Pick template relevant to current stage
      const matchingTmpl = templates.find((t) => t.etapa === candidato.etapa_processo) || templates[0];
      if (matchingTmpl) {
        setSelectedTemplateId(matchingTmpl.id);
        const formatted = formatMensagemText(matchingTmpl, candidato, vaga);
        setCustomMsgText(formatted);
      }
    }
  }, [candidato, templates, vaga]);

  // Handle template change
  const handleTemplateSelect = (tmplId: string) => {
    setSelectedTemplateId(tmplId);
    const tmpl = templates.find((t) => t.id === tmplId);
    if (tmpl && candidato) {
      const formatted = formatMensagemText(tmpl, candidato, vaga);
      setCustomMsgText(formatted);
    }
  };

  const handleDriveExport = () => {
    if (!isConnected) {
      login();
      return;
    }
    confirmAction(`Salvar o dossiê completo de ${candidato?.nome} no Google Drive?`, async () => {
      if (!candidato) return;
      setIsWorkspaceActionLoading(true);
      try {
        const textContent =
          `Dossiê do Candidato - VoxTalent R&S\n` +
          `===================================\n` +
          `Nome: ${candidato.nome}\n` +
          `Vaga: ${candidato.vaga_titulo}\n` +
          `Unidade: ${candidato.unidade}\n` +
          `Etapa Atual: ${candidato.etapa_processo}\n` +
          `Status: ${candidato.status}\n` +
          `Telefone: ${candidato.telefone || 'N/A'}\n` +
          `Email: ${candidato.email || 'N/A'}\n` +
          `Origem: ${candidato.origem || 'N/A'}\n` +
          `Data de Inscrição: ${candidato.data_inscricao}\n` +
          `Avaliação Geral: ${candidato.avaliacao_geral || 'N/A'}/5\n\n` +
          `Notas da Entrevista:\n${candidato.notas_entrevista || 'Nenhuma nota registrada.'}\n\n` +
          `Histórico de Mensagens WhatsApp:\n${(candidato.historico_whatsapp || []).map((h) => `[${h.data_envio}] (${h.tipo}) ${h.template_nome}: ${h.texto_enviado}`).join('\n')}`;

        await uploadTextFileToDrive(`Dossie_${candidato.nome.replace(/\s+/g, '_')}.txt`, textContent);
        setWorkspaceToast('Dossiê salvo com sucesso no Google Drive!');
        setTimeout(() => setWorkspaceToast(null), 3000);
      } catch (err: any) {
        alert(`Erro ao salvar no Drive: ${err?.message}`);
      } finally {
        setIsWorkspaceActionLoading(false);
      }
    });
  };

  const handleGmailQuickSend = () => {
    if (!isConnected) {
      login();
      return;
    }
    if (!candidato?.email) {
      alert('Candidato não possui e-mail cadastrado.');
      return;
    }
    confirmAction(`Enviar convite por e-mail para ${candidato.nome} (${candidato.email}) via Gmail?`, async () => {
      setIsWorkspaceActionLoading(true);
      try {
        const subject = `Processo Seletivo Vox2you - ${candidato.vaga_titulo}`;
        const body = `<p>Olá, <strong>${candidato.nome}</strong>!</p><p>Agradecemos seu interesse na vaga de <strong>${candidato.vaga_titulo}</strong> na unidade <strong>${candidato.unidade}</strong>.</p><p>Sua etapa atual é: <strong>${candidato.etapa_processo}</strong>.</p><p>Em breve entraremos em contato para os próximos passos.</p><br/><p>Atenciosamente,<br/><strong>Equipe R&S Vox2you</strong></p>`;
        await sendGmailMessage(candidato.email, subject, body);
        setWorkspaceToast('E-mail enviado com sucesso via Gmail!');
        setTimeout(() => setWorkspaceToast(null), 3000);
      } catch (err: any) {
        alert(`Erro ao enviar e-mail: ${err?.message}`);
      } finally {
        setIsWorkspaceActionLoading(false);
      }
    });
  };

  const handleOpenScheduleModal = () => {
    setIsScheduleModalOpen(true);
  };

  const handleScheduleSuccess = (event: any, meetUrl?: string) => {
    setWorkspaceToast(
      meetUrl
        ? 'Entrevista agendada no Google Agenda com sala do Meet gerada!'
        : 'Entrevista agendada com sucesso no Google Agenda!'
    );
    setTimeout(() => setWorkspaceToast(null), 3500);

    // Update custom WhatsApp message with Meet link if available
    if (meetUrl && candidato) {
      const currentTmpl = templates.find((t) => t.id === selectedTemplateId) || templates[0];
      const updatedText = formatMensagemText(currentTmpl, candidato, vaga, {
        'Link do Google Meet': meetUrl,
      });
      setCustomMsgText(updatedText);
    }
  };


  if (!isOpen || !candidato) return null;

  const handleSaveInfo = (e: React.FormEvent) => {
    e.preventDefault();
    updateCandidato(candidato.id, formData);
    onClose();
  };

  const handleCopyMessage = () => {
    navigator.clipboard.writeText(customMsgText);
    setCopiedMsg(true);
    setTimeout(() => setCopiedMsg(false), 2500);
  };

  const handleOpenWhatsApp = () => {
    const link = buildWhatsAppLink(candidato.telefone, customMsgText);
    window.open(link, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 dark:bg-black/70 backdrop-blur-xs p-4 overflow-y-auto">
      <div
        id="candidate-detail-modal"
        className="relative w-full max-w-3xl rounded-xl bg-white dark:bg-gray-800 shadow-xl border border-gray-200 dark:border-gray-700 flex flex-col max-h-[92vh] overflow-hidden animate-in fade-in zoom-in-95 duration-150"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-200 dark:border-gray-700 px-6 py-4 bg-gray-50/80 dark:bg-gray-850">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#00A9A1]/10 dark:bg-[#00C4BB]/20 text-[#00857e] dark:text-[#00C4BB] font-bold text-base">
              {candidato.nome.charAt(0).toUpperCase()}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-gray-900 dark:text-white">{candidato.nome}</h3>
                <span
                  className={`rounded-md px-2 py-0.5 text-[10px] font-bold ${
                    candidato.status === 'Aprovado'
                      ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300'
                      : candidato.status === 'Ausente'
                      ? 'bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300'
                      : candidato.status === 'Reprovado'
                      ? 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                      : 'bg-teal-100 dark:bg-teal-950/60 text-teal-800 dark:text-teal-300'
                  }`}
                >
                  {candidato.status}
                </span>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">
                {candidato.vaga_titulo} • <strong className="text-gray-700 dark:text-gray-200">{candidato.unidade}</strong>
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-md p-1.5 text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 hover:text-gray-700 dark:hover:text-gray-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-gray-200 dark:border-gray-700 px-6 bg-white dark:bg-gray-800 gap-4 text-xs font-semibold">
          <button
            type="button"
            onClick={() => setActiveTab('info')}
            className={`py-3 border-b-2 transition-colors ${
              activeTab === 'info'
                ? 'border-[#00A9A1] dark:border-[#00C4BB] text-[#00857e] dark:text-[#00C4BB]'
                : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200'
            }`}
          >
            Dados & Avaliação
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('whatsapp')}
            className={`py-3 border-b-2 flex items-center gap-1.5 transition-colors ${
              activeTab === 'whatsapp'
                ? 'border-[#00A9A1] dark:border-[#00C4BB] text-[#00857e] dark:text-[#00C4BB]'
                : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200'
            }`}
          >
            <MessageCircle className="w-3.5 h-3.5" />
            <span>Motor WhatsApp</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('historico')}
            className={`py-3 border-b-2 flex items-center gap-1.5 transition-colors ${
              activeTab === 'historico'
                ? 'border-[#00A9A1] dark:border-[#00C4BB] text-[#00857e] dark:text-[#00C4BB]'
                : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200'
            }`}
          >
            <History className="w-3.5 h-3.5" />
            <span>Histórico de Etapas ({candidato.historico_etapas.length})</span>
          </button>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5 bg-white dark:bg-gray-800">
          {/* Workspace Toast Notification */}
          {workspaceToast && (
            <div className="p-3 rounded-xl bg-teal-50 dark:bg-teal-950/50 border border-teal-200 dark:border-teal-800 text-xs text-teal-800 dark:text-teal-200 flex items-center gap-2 animate-in fade-in">
              <CheckCircle className="w-4 h-4 text-[#00A9A1]" />
              <span className="font-semibold">{workspaceToast}</span>
            </div>
          )}

          {/* Google Workspace Direct Action Ribbon */}
          <div className="rounded-xl border border-gray-200 dark:border-gray-700/80 bg-gray-50 dark:bg-gray-850 p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-lg bg-teal-100 dark:bg-teal-950 text-[#00A9A1] flex items-center justify-center">
                <Sparkles className="w-3.5 h-3.5" />
              </div>
              <div>
                <p className="text-xs font-bold text-gray-900 dark:text-white">
                  Google Workspace
                </p>
                <p className="text-[10px] text-gray-500 dark:text-gray-400">
                  Ações diretas integradas ao Google Drive, Gmail e Agenda
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                disabled={isWorkspaceActionLoading}
                onClick={handleDriveExport}
                className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 text-[11px] font-bold text-gray-700 dark:text-gray-200 shadow-2xs transition-colors"
                title="Salvar dossiê e histórico no Google Drive"
              >
                <FolderGit2 className="w-3.5 h-3.5 text-teal-600" />
                <span>Salvar no Drive</span>
              </button>

              <button
                type="button"
                disabled={isWorkspaceActionLoading}
                onClick={handleGmailQuickSend}
                className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 text-[11px] font-bold text-gray-700 dark:text-gray-200 shadow-2xs transition-colors"
                title="Enviar e-mail para o candidato pelo Gmail"
              >
                <Mail className="w-3.5 h-3.5 text-red-500" />
                <span>Gmail</span>
              </button>

              <button
                type="button"
                disabled={isWorkspaceActionLoading}
                onClick={handleOpenScheduleModal}
                className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-teal-200 dark:border-teal-800 bg-teal-50 dark:bg-teal-950/50 hover:bg-teal-100 dark:hover:bg-teal-900/60 text-[11px] font-bold text-teal-800 dark:text-teal-200 shadow-2xs transition-colors"
                title="Agendar entrevista no Google Agenda com link Google Meet automático"
              >
                <CalendarIcon className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
                <span>Agenda + Meet</span>
              </button>

              <button
                type="button"
                onClick={() => setCandidatePdfModalId(candidato.id)}
                className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-950/50 hover:bg-blue-100 dark:hover:bg-blue-900/60 text-[11px] font-bold text-blue-700 dark:text-blue-300 shadow-2xs transition-colors"
                title="Gerar PDF completo do candidato para visualização ou impressão"
              >
                <Printer className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                <span>Gerar PDF</span>
              </button>
            </div>
          </div>

          {activeTab === 'info' && (
            <form onSubmit={handleSaveInfo} className="space-y-5">
              {/* Quick Stage Progression Bar */}
              <div className="rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-750 p-3.5">
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-2">
                  Etapa Atual do Processo:
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {ETAPAS_KANBAN.map((et) => {
                    const isCurrent = candidato.etapa_processo === et;
                    return (
                      <button
                        key={et}
                        type="button"
                        onClick={() => moveCandidatoEtapa(candidato.id, et)}
                        className={`rounded-md px-2.5 py-1 text-xs font-semibold transition-all ${
                          isCurrent
                            ? 'bg-[#00A9A1] dark:bg-[#00C4BB] text-white dark:text-gray-950 shadow-xs'
                            : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700'
                        }`}
                      >
                        {et}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Status Switcher */}
              <div className="flex items-center gap-2">
                <label className="text-xs font-bold text-gray-700 dark:text-gray-300">Status:</label>
                <div className="flex flex-wrap gap-1.5">
                  {STATUS_CANDIDATO.map((st) => (
                    <button
                      key={st}
                      type="button"
                      onClick={() => setCandidatoStatus(candidato.id, st)}
                      className={`rounded-md px-2.5 py-1 text-xs font-medium transition-colors ${
                        candidato.status === st
                          ? st === 'Aprovado'
                            ? 'bg-emerald-600 dark:bg-emerald-500 text-white font-bold'
                            : st === 'Ausente'
                            ? 'bg-[#F7941D] dark:bg-[#FFA336] text-white dark:text-gray-950 font-bold'
                            : st === 'Reprovado'
                            ? 'bg-gray-700 dark:bg-gray-600 text-white font-bold'
                            : 'bg-gray-900 dark:bg-gray-200 dark:text-gray-900 text-white font-bold'
                          : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                      }`}
                    >
                      {st}
                    </button>
                  ))}
                </div>
              </div>

              {/* Audit Fix #3 & #4: Toggle "Fluxo Simplificado (Professor)" configurável */}
              {isCargoFluxoSimplificado && (
                <div className="rounded-lg border border-teal-200 dark:border-teal-800 bg-teal-50/60 dark:bg-teal-950/30 p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <GraduationCap className="w-5 h-5 text-[#00A9A1] dark:text-[#00C4BB]" />
                      <div>
                        <h4 className="text-xs font-bold text-teal-900 dark:text-teal-200">
                          Fluxo Simplificado ({config.fluxo_simplificado_cargo || 'Professor'})
                        </h4>
                        <p className="text-[11px] text-teal-700 dark:text-teal-300">
                          Oculta burocracias de formulário e prioriza Vídeo de Apresentação e Aula Teste. A Coletiva permanece aberta para escolha do RH.
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => toggleFluxoSimplificado(candidato.id)}
                      className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                        candidato.fluxo_simplificado ? 'bg-[#00A9A1] dark:bg-[#00C4BB]' : 'bg-gray-300 dark:bg-gray-600'
                      }`}
                    >
                      <span
                        className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                          candidato.fluxo_simplificado ? 'translate-x-5' : 'translate-x-0'
                        }`}
                      />
                    </button>
                  </div>
                </div>
              )}

              {/* Contact Info & Unit (Mandatory Vaga & Unidade) */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="block font-semibold text-gray-700 dark:text-gray-300 mb-1">
                    Nome Completo *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.nome || ''}
                    onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                    className="w-full rounded-md border border-gray-200 dark:border-gray-700 px-3 py-2 text-xs text-gray-900 dark:text-white bg-white dark:bg-gray-800 focus:ring-1 focus:ring-[#00A9A1] dark:focus:ring-[#00C4BB] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-gray-700 dark:text-gray-300 mb-1">
                    Telefone / WhatsApp *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.telefone || ''}
                    onChange={(e) => setFormData({ ...formData, telefone: e.target.value })}
                    className="w-full rounded-md border border-gray-200 dark:border-gray-700 px-3 py-2 text-xs text-gray-900 dark:text-white bg-white dark:bg-gray-800 focus:ring-1 focus:ring-[#00A9A1] dark:focus:ring-[#00C4BB] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-gray-700 dark:text-gray-300 mb-1">
                    E-mail *
                  </label>
                  <input
                    type="email"
                    required
                    value={formData.email || ''}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full rounded-md border border-gray-200 dark:border-gray-700 px-3 py-2 text-xs text-gray-900 dark:text-white bg-white dark:bg-gray-800 focus:ring-1 focus:ring-[#00A9A1] dark:focus:ring-[#00C4BB] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-gray-700 dark:text-gray-300 mb-1">
                    Unidade Vox (Obrigatório) *
                  </label>
                  <select
                    required
                    value={formData.unidade || 'Vox Cidade Verde'}
                    onChange={(e) => setFormData({ ...formData, unidade: e.target.value as UnidadeVox })}
                    className="w-full rounded-md border border-gray-200 dark:border-gray-700 px-3 py-2 text-xs font-medium text-gray-900 dark:text-white focus:ring-1 focus:ring-[#00A9A1] dark:focus:ring-[#00C4BB] focus:outline-none bg-white dark:bg-gray-800"
                  >
                    {UNIDADES_VOX.map((u) => (
                      <option key={u} value={u}>
                        {u}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-gray-700 dark:text-gray-300 mb-1">
                    Vaga Vinculada (Obrigatório) *
                  </label>
                  <select
                    required
                    value={formData.vaga_id || ''}
                    onChange={(e) => {
                      const selVaga = vagas.find((v) => v.id === e.target.value);
                      setFormData({
                        ...formData,
                        vaga_id: e.target.value,
                        vaga_titulo: selVaga?.titulo || formData.vaga_titulo,
                        unidade: selVaga?.unidade || formData.unidade,
                      });
                    }}
                    className="w-full rounded-md border border-gray-200 dark:border-gray-700 px-3 py-2 text-xs font-medium text-gray-900 dark:text-white focus:ring-1 focus:ring-[#00A9A1] dark:focus:ring-[#00C4BB] focus:outline-none bg-white dark:bg-gray-800"
                  >
                    {vagas.map((v) => (
                      <option key={v.id} value={v.id}>
                        {v.titulo} ({v.unidade})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-gray-700 dark:text-gray-300 mb-1">
                    Canal de Origem do CV
                  </label>
                  <select
                    value={formData.origem_cv || 'LinkedIn'}
                    onChange={(e) => setFormData({ ...formData, origem_cv: e.target.value })}
                    className="w-full rounded-md border border-gray-200 dark:border-gray-700 px-3 py-2 text-xs font-medium text-gray-900 dark:text-white focus:ring-1 focus:ring-[#00A9A1] dark:focus:ring-[#00C4BB] focus:outline-none bg-white dark:bg-gray-800"
                  >
                    {CANAIS_DIVULGACAO.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Material Links: Currículo, Vídeo Pitch & Perfil Sólides */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs pt-2 border-t border-gray-100 dark:border-gray-700">
                <div>
                  <label className="block font-semibold text-gray-700 dark:text-gray-300 mb-1">
                    Link do Currículo (PDF/Drive)
                  </label>
                  <div className="flex gap-1.5">
                    <input
                      type="url"
                      placeholder="https://..."
                      value={formData.curriculo_url || ''}
                      onChange={(e) => setFormData({ ...formData, curriculo_url: e.target.value })}
                      className="w-full rounded-md border border-gray-200 dark:border-gray-700 px-2.5 py-1.5 text-xs text-gray-900 dark:text-white bg-white dark:bg-gray-800 focus:ring-1 focus:ring-[#00A9A1] dark:focus:ring-[#00C4BB] focus:outline-none"
                    />
                    {formData.curriculo_url && (
                      <a
                        href={formData.curriculo_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-1.5 rounded-md bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 flex items-center justify-center"
                        title="Abrir Currículo"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-gray-700 dark:text-gray-300 mb-1">
                    Link do Vídeo Pitch
                  </label>
                  <div className="flex gap-1.5">
                    <input
                      type="url"
                      placeholder="https://youtube.com/... ou drive"
                      value={formData.video_url || ''}
                      onChange={(e) => setFormData({ ...formData, video_url: e.target.value })}
                      className="w-full rounded-md border border-gray-200 dark:border-gray-700 px-2.5 py-1.5 text-xs text-gray-900 dark:text-white bg-white dark:bg-gray-800 focus:ring-1 focus:ring-[#00A9A1] dark:focus:ring-[#00C4BB] focus:outline-none"
                    />
                    {formData.video_url && (
                      <a
                        href={formData.video_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-1.5 rounded-md bg-teal-50 dark:bg-teal-950 hover:bg-teal-100 dark:hover:bg-teal-900 text-[#00857e] dark:text-[#00C4BB] flex items-center justify-center"
                        title="Abrir Vídeo"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-gray-700 dark:text-gray-300 mb-1">
                    Perfil / Teste Sólides
                  </label>
                  <div className="flex gap-1.5">
                    <input
                      type="url"
                      placeholder="https://vox2you.vagas.solides.com.br/..."
                      value={formData.solides_profile_url || ''}
                      onChange={(e) => setFormData({ ...formData, solides_profile_url: e.target.value })}
                      className="w-full rounded-md border border-gray-200 dark:border-gray-700 px-2.5 py-1.5 text-xs text-gray-900 dark:text-white bg-white dark:bg-gray-800 focus:ring-1 focus:ring-[#00A9A1] dark:focus:ring-[#00C4BB] focus:outline-none"
                    />
                    {formData.solides_profile_url && (
                      <a
                        href={formData.solides_profile_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-1.5 rounded-md bg-amber-50 dark:bg-amber-950 hover:bg-amber-100 dark:hover:bg-amber-900 text-amber-700 dark:text-amber-300 flex items-center justify-center"
                        title="Abrir Perfil Sólides"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    )}
                  </div>
                </div>
              </div>

              {/* Evaluation and Notes */}
              <div className="space-y-3 pt-2 border-t border-gray-100 dark:border-gray-700 text-xs">
                <div className="flex items-center justify-between">
                  <label className="font-semibold text-gray-700 dark:text-gray-300">
                    Avaliação Geral (1 a 5 estrelas):
                  </label>
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setFormData({ ...formData, avaliacao_geral: star })}
                        className="p-1 text-gray-300 dark:text-gray-600 hover:text-amber-400"
                      >
                        <Star
                          className={`w-5 h-5 ${
                            (formData.avaliacao_geral || 0) >= star
                              ? 'fill-[#F7941D] text-[#F7941D]'
                              : 'text-gray-300 dark:text-gray-600'
                          }`}
                        />
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-gray-700 dark:text-gray-300 mb-1">
                    Notas da Entrevista / Parecer de R&S
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Pontos fortes, oratória, dicção, fit com a cultura Vox..."
                    value={formData.notas_entrevista || ''}
                    onChange={(e) => setFormData({ ...formData, notas_entrevista: e.target.value })}
                    className="w-full rounded-md border border-gray-200 dark:border-gray-700 px-3 py-2 focus:ring-1 focus:ring-[#00A9A1] dark:focus:ring-[#00C4BB] focus:outline-none text-xs text-gray-900 dark:text-white bg-white dark:bg-gray-800"
                  />
                </div>
              </div>

              {/* Footer Save & Delete */}
              <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
                <button
                  type="button"
                  onClick={() => {
                    if (confirm(`Tem certeza que deseja excluir ${candidato.nome}?`)) {
                      deleteCandidato(candidato.id);
                      onClose();
                    }
                  }}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300"
                >
                  <Trash2 className="w-4 h-4" />
                  Excluir Candidato
                </button>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={onClose}
                    className="rounded-md border border-gray-200 dark:border-gray-700 px-4 py-2 text-xs font-semibold text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="rounded-md bg-[#00A9A1] hover:bg-[#008f88] dark:bg-[#00A9A1] dark:hover:bg-[#00C4BB] px-5 py-2 text-xs font-bold text-white shadow-xs active:scale-[0.98] transition-all"
                  >
                    Salvar Alterações
                  </button>
                </div>
              </div>
            </form>
          )}

          {/* Tab: Motor WhatsApp com Audit Fix 5 & 6 */}
          {activeTab === 'whatsapp' && (
            <div className="space-y-4">
              <div className="rounded-lg bg-gray-50 dark:bg-gray-750 p-3 border border-gray-200 dark:border-gray-700">
                <label className="block text-xs font-bold text-gray-800 dark:text-gray-200 mb-2">
                  Selecione o Modelo de Mensagem do Guia de Comunicação:
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {templates.map((tmpl) => {
                    const isSel = tmpl.id === selectedTemplateId;
                    return (
                      <button
                        key={tmpl.id}
                        type="button"
                        onClick={() => handleTemplateSelect(tmpl.id)}
                        className={`text-left p-2.5 rounded-lg border text-xs transition-all ${
                          isSel
                            ? 'border-[#00A9A1] dark:border-[#00C4BB] bg-teal-50/70 dark:bg-teal-950/50 font-semibold text-teal-950 dark:text-teal-200 shadow-xs'
                            : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-750 text-gray-700 dark:text-gray-300'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="truncate">{tmpl.titulo}</span>
                          {tmpl.confidencial && (
                            <span className="text-[10px] bg-indigo-100 dark:bg-indigo-950 text-indigo-800 dark:text-indigo-300 font-bold px-1.5 py-0.2 rounded">
                              Sigiloso
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-gray-400 dark:text-gray-400 font-normal mt-0.5 truncate">
                          {tmpl.descricao}
                        </p>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Audit Fix #5 & #6 Notice */}
              {templates.find((t) => t.id === selectedTemplateId)?.confidencial && (
                <div className="rounded-lg bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800 p-3 text-xs text-indigo-900 dark:text-indigo-200 flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-indigo-600 dark:text-indigo-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <strong className="font-bold">Regra de Confidencialidade Ativa:</strong> O texto
                    gerado utiliza o modelo confidencial, garantindo que o candidato nunca receba menção
                    a entrevista coletiva ou em grupo.
                  </div>
                </div>
              )}

              {/* Preview and Edit Message Box */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-bold text-gray-700 dark:text-gray-300">
                    Texto Formatado (Variáveis já substituídas para {candidato.nome}):
                  </label>
                  <span className="text-[11px] text-gray-400">
                    Variáveis: [Nome do Candidato], [Nome da Vaga], [unidade]
                  </span>
                </div>
                <textarea
                  rows={8}
                  value={customMsgText}
                  onChange={(e) => setCustomMsgText(e.target.value)}
                  className="w-full rounded-md border border-gray-200 dark:border-gray-700 p-3 text-xs font-mono text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-1 focus:ring-[#00A9A1] dark:focus:ring-[#00C4BB] bg-white dark:bg-gray-850 leading-relaxed"
                />
              </div>

              {/* Actions */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleCopyMessage}
                    className="inline-flex items-center gap-1.5 rounded-md border border-gray-300 dark:border-gray-600 px-4 py-2 text-xs font-bold text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors shadow-xs"
                  >
                    <Copy className="w-4 h-4" />
                    <span>{copiedMsg ? 'Copiado para Área de Transferência!' : 'Copiar Texto'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleOpenScheduleModal}
                    className="inline-flex items-center gap-1.5 rounded-md border border-teal-300 dark:border-teal-700 bg-teal-50 dark:bg-teal-950/50 hover:bg-teal-100 dark:hover:bg-teal-900 px-3 py-2 text-xs font-bold text-teal-800 dark:text-teal-200 transition-colors shadow-xs"
                  >
                    <Video className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
                    <span>Agendar & Gerar Meet</span>
                  </button>
                </div>

                <button
                  type="button"
                  onClick={handleOpenWhatsApp}
                  className="inline-flex items-center gap-2 rounded-md bg-[#00A9A1] hover:bg-[#008f88] dark:bg-[#00A9A1] dark:hover:bg-[#00C4BB] px-5 py-2 text-xs font-bold text-white shadow-xs active:scale-[0.98] transition-all"
                >
                  <Send className="w-4 h-4" />
                  <span>Disparar WhatsApp ({candidato.telefone})</span>
                </button>
              </div>
            </div>
          )}

          {/* Tab: Histórico de Etapas */}
          {activeTab === 'historico' && (
            <div className="space-y-4">
              <h4 className="text-xs font-bold text-gray-800 dark:text-gray-200">
                Linha do Tempo no Processo Seletivo:
              </h4>
              <div className="relative pl-6 space-y-4 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-gray-200 dark:before:bg-gray-700">
                {candidato.historico_etapas.map((item, idx) => (
                  <div key={idx} className="relative">
                    <span className="absolute -left-6 top-1 flex h-4 w-4 items-center justify-center rounded-full bg-[#00A9A1] dark:bg-[#00C4BB] ring-4 ring-white dark:ring-gray-850" />
                    <div className="rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-750 p-3">
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span className="font-bold text-gray-900 dark:text-white">{item.etapa}</span>
                        <span className="text-gray-400 dark:text-gray-400 font-medium">{formatDateBR(item.data)}</span>
                      </div>
                      {item.observacao && (
                        <p className="text-xs text-gray-600 dark:text-gray-300">{item.observacao}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Integrated Google Calendar & Meet Scheduling Modal */}
      {isScheduleModalOpen && (
        <InterviewScheduleModal
          isOpen={isScheduleModalOpen}
          onClose={() => setIsScheduleModalOpen(false)}
          candidato={candidato}
          vaga={vaga}
          onScheduled={handleScheduleSuccess}
        />
      )}
    </div>
  );
};
