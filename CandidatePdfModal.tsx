import React, { useRef } from 'react';
import { useApp } from '../../context/AppContext';
import { Candidato, Vaga } from '../../types';
import { formatDateBR } from '../../lib/formatters';
import {
  X,
  Printer,
  FileText,
  Video,
  Download,
  Copy,
  ExternalLink,
  MapPin,
  Mail,
  Phone,
  Calendar,
  Star,
  CheckCircle2,
  Clock,
  Briefcase,
  Sparkles,
  MessageCircle,
  GraduationCap,
} from 'lucide-react';
import { useWorkspace } from '../../context/WorkspaceContext';
import { uploadTextFileToDrive } from '../../lib/googleDriveService';

interface CandidatePdfModalProps {
  candidateId: string | null;
  isOpen: boolean;
  onClose: () => void;
}

export const CandidatePdfModal: React.FC<CandidatePdfModalProps> = ({
  candidateId,
  isOpen,
  onClose,
}) => {
  const { candidatos, vagas, getVagaById } = useApp();
  const { isConnected, confirmAction, login } = useWorkspace();
  const printRef = useRef<HTMLDivElement>(null);
  const [copied, setCopied] = React.useState(false);
  const [isDriveSaving, setIsDriveSaving] = React.useState(false);
  const [toastMessage, setToastMessage] = React.useState<string | null>(null);

  if (!isOpen || !candidateId) return null;

  const candidato = candidatos.find((c) => c.id === candidateId);
  if (!candidato) return null;

  const vaga = getVagaById(candidato.vaga_id) || vagas.find((v) => v.id === candidato.vaga_id);

  // Trigger print
  const handlePrint = () => {
    window.print();
  };

  // Copy textual dossier
  const handleCopyText = () => {
    const textContent =
      `===================================================\n` +
      `DOSSIÊ COMPLETO DO CANDIDATO - VOXTALENT R&S\n` +
      `===================================================\n\n` +
      `NOME: ${candidato.nome}\n` +
      `VAGA: ${candidato.vaga_titulo}\n` +
      `UNIDADE: ${candidato.unidade}\n` +
      `ETAPA ATUAL: ${candidato.etapa_processo}\n` +
      `STATUS: ${candidato.status}\n` +
      `DATA DE INSCRIÇÃO: ${formatDateBR(candidato.criado_em || candidato.data_inscricao || '')}\n\n` +
      `CONTATOS:\n` +
      `- WhatsApp / Telefone: ${candidato.telefone || 'N/A'}\n` +
      `- E-mail: ${candidato.email || 'N/A'}\n` +
      `- Origem do CV: ${candidato.origem_cv || 'N/A'}\n\n` +
      `LINKS E MATERIAIS:\n` +
      `- Currículo (CV): ${candidato.curriculo_url || 'Não informado'}\n` +
      `- Vídeo de Apresentação: ${candidato.video_url || 'Não informado'}\n` +
      `- Perfil Sólides: ${candidato.solides_profile_url || 'Não informado'}\n\n` +
      `HISTÓRICO DE ENTREVISTAS & AGENDAMENTOS (RH):\n` +
      `- Data da Entrevista: ${candidato.data_entrevista ? formatDateBR(candidato.data_entrevista) : 'Pendente'}\n` +
      `- Horário: ${candidato.hora_entrevista || 'N/A'}\n` +
      `- Google Meet: ${candidato.google_meet_link || 'N/A'}\n\n` +
      `AVALIAÇÃO & DESEMPENHO:\n` +
      `- Avaliação Geral: ${candidato.avaliacao_geral ? `${candidato.avaliacao_geral}/5 Estrelas` : 'Não avaliado'}\n` +
      `- Nota da Aula Teste: ${candidato.aula_teste_nota !== undefined ? `${candidato.aula_teste_nota}/10` : 'N/A'}\n` +
      `- Data Aula Teste: ${candidato.aula_teste_data ? formatDateBR(candidato.aula_teste_data) : 'N/A'}\n\n` +
      `NOTAS DA ENTREVISTA & CONSIDERAÇÕES:\n` +
      `${candidato.notas_entrevista || 'Nenhuma observação registrada.'}\n\n` +
      `HISTÓRICO DE ETAPAS:\n` +
      `${(candidato.historico_etapas || [])
        .map((h, i) => `${i + 1}. [${formatDateBR(h.data)}] ${h.etapa} - ${h.observacao || 'Sem obs'}`)
        .join('\n')}\n` +
      `===================================================`;

    navigator.clipboard.writeText(textContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  // Save dossier to Drive
  const handleSaveToDrive = () => {
    if (!isConnected) {
      login();
      return;
    }
    confirmAction(`Salvar o dossiê PDF/Texto de ${candidato.nome} no Google Drive?`, async () => {
      setIsDriveSaving(true);
      try {
        const textContent =
          `DOSSIÊ DO CANDIDATO - VOXTALENT R&S\n` +
          `===================================\n` +
          `Nome: ${candidato.nome}\n` +
          `Vaga: ${candidato.vaga_titulo}\n` +
          `Unidade: ${candidato.unidade}\n` +
          `Etapa: ${candidato.etapa_processo}\n` +
          `Status: ${candidato.status}\n` +
          `Telefone: ${candidato.telefone}\n` +
          `Email: ${candidato.email}\n` +
          `Currículo: ${candidato.curriculo_url || 'N/A'}\n` +
          `Vídeo: ${candidato.video_url || 'N/A'}\n` +
          `Entrevista RH: ${candidato.data_entrevista || 'Pendente'} ${candidato.hora_entrevista || ''}\n` +
          `Avaliação: ${candidato.avaliacao_geral || 'N/A'}/5\n` +
          `Notas & Observações:\n${candidato.notas_entrevista || 'Nenhuma nota.'}\n`;

        await uploadTextFileToDrive(
          `Dossie_${candidato.nome.replace(/\s+/g, '_')}_${candidato.unidade.replace(/\s+/g, '_')}.txt`,
          textContent
        );
        setToastMessage('Dossiê exportado para o Google Drive!');
        setTimeout(() => setToastMessage(null), 3500);
      } catch (err: any) {
        alert(`Erro ao salvar no Drive: ${err?.message}`);
      } finally {
        setIsDriveSaving(false);
      }
    });
  };

  return (
    <div
      id="candidate-pdf-modal"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-4xl bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-800 flex flex-col max-h-[92vh] overflow-hidden my-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Top Control Bar (Hidden when printing) */}
        <div className="print:hidden flex items-center justify-between px-5 py-3.5 border-b border-gray-200 dark:border-gray-800 bg-gray-50/90 dark:bg-gray-850">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[#00A9A1] text-white flex items-center justify-center font-bold text-sm shadow-xs">
              PDF
            </div>
            <div>
              <h3 className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-2">
                Dossiê Oficial do Candidato (Gerar PDF)
              </h3>
              <p className="text-[11px] text-gray-500 dark:text-gray-400">
                Visualização consolidada para impressão, envio à diretoria e arquivamento
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              id="btn-copy-dossier-text"
              onClick={handleCopyText}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-xs font-semibold text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors shadow-2xs"
              title="Copiar texto formatado"
            >
              <Copy className="w-3.5 h-3.5" />
              <span>{copied ? 'Copiado!' : 'Copiar Texto'}</span>
            </button>

            <button
              type="button"
              id="btn-drive-dossier-save"
              onClick={handleSaveToDrive}
              disabled={isDriveSaving}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-teal-200 dark:border-teal-800 bg-teal-50 dark:bg-teal-950/50 text-xs font-semibold text-[#00857e] dark:text-[#00C4BB] hover:bg-teal-100 dark:hover:bg-teal-900/60 transition-colors shadow-2xs"
              title="Exportar para o Google Drive"
            >
              <Download className="w-3.5 h-3.5" />
              <span>{isDriveSaving ? 'Salvando...' : 'Drive'}</span>
            </button>

            <button
              type="button"
              id="btn-print-candidate-pdf"
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-[#00A9A1] hover:bg-[#008f88] text-white text-xs font-bold shadow-xs active:scale-95 transition-all"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Imprimir / Salvar PDF</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors ml-1"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {toastMessage && (
          <div className="print:hidden px-4 py-2 bg-emerald-50 dark:bg-emerald-950/60 border-b border-emerald-200 dark:border-emerald-800 text-xs font-bold text-emerald-800 dark:text-emerald-300 flex items-center justify-between">
            <span>✓ {toastMessage}</span>
          </div>
        )}

        {/* Printable Document Body */}
        <div
          ref={printRef}
          id="printable-candidate-dossier"
          className="flex-1 overflow-y-auto p-6 sm:p-8 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 font-sans space-y-6 print:p-0 print:m-0 print:overflow-visible print:bg-white print:text-black"
        >
          {/* Header Brand & Title */}
          <div className="border-b-2 border-[#00A9A1] pb-4 flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-[#00A9A1] rounded-lg flex items-center justify-center text-white font-black text-2xl shadow-sm print:border print:border-black">
                V
              </div>
              <div>
                <h1 className="text-xl font-extrabold tracking-tight text-gray-900 dark:text-white print:text-black">
                  VoxTalent R&S
                </h1>
                <p className="text-xs text-gray-500 dark:text-gray-400 print:text-gray-700 font-medium">
                  Procedimento Operacional Padrão • Dossiê Consolidado de Seleção
                </p>
              </div>
            </div>

            <div className="text-right">
              <span className="inline-block text-[11px] font-bold px-2.5 py-1 rounded bg-teal-50 dark:bg-teal-950/60 text-[#00857e] dark:text-[#00C4BB] border border-teal-200 dark:border-teal-800 print:border-gray-400">
                {candidato.status.toUpperCase()}
              </span>
              <p className="text-[10px] text-gray-400 dark:text-gray-500 print:text-gray-600 mt-1">
                Emitido em: {new Date().toLocaleDateString('pt-BR')} às {new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>
          </div>

          {/* Section 1: Candidate Hero Information */}
          <div className="rounded-xl border border-gray-200 dark:border-gray-800 p-5 bg-gray-50/50 dark:bg-gray-850/50 print:bg-white print:border-gray-300">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <h2 className="text-lg font-black text-gray-900 dark:text-white print:text-black">
                  {candidato.nome}
                </h2>
                <div className="flex flex-wrap items-center gap-3 mt-1 text-xs text-gray-600 dark:text-gray-300 print:text-black">
                  <span className="flex items-center gap-1 font-semibold">
                    <Briefcase className="w-3.5 h-3.5 text-[#00A9A1]" />
                    {candidato.vaga_titulo}
                  </span>
                  <span className="flex items-center gap-1 font-semibold">
                    <MapPin className="w-3.5 h-3.5 text-[#00A9A1]" />
                    {candidato.unidade}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-gray-400" />
                    Etapa: <strong className="text-teal-700 dark:text-teal-300">{candidato.etapa_processo}</strong>
                  </span>
                </div>
              </div>

              {candidato.avaliacao_geral ? (
                <div className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-amber-700 dark:text-amber-300 font-bold text-xs">
                  <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                  <span>Avaliação: {candidato.avaliacao_geral}/5</span>
                </div>
              ) : null}
            </div>

            {/* Contact & Registration Data */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-4 pt-3 border-t border-gray-200/80 dark:border-gray-700/60 text-xs">
              <div>
                <span className="text-[10px] text-gray-400 dark:text-gray-500 block uppercase font-bold">
                  WhatsApp / Telefone
                </span>
                <span className="font-semibold text-gray-800 dark:text-gray-200 print:text-black">
                  {candidato.telefone || 'Não informado'}
                </span>
              </div>

              <div>
                <span className="text-[10px] text-gray-400 dark:text-gray-500 block uppercase font-bold">
                  E-mail
                </span>
                <span className="font-semibold text-gray-800 dark:text-gray-200 print:text-black truncate block">
                  {candidato.email || 'Não informado'}
                </span>
              </div>

              <div>
                <span className="text-[10px] text-gray-400 dark:text-gray-500 block uppercase font-bold">
                  Origem do Candidato
                </span>
                <span className="font-semibold text-gray-800 dark:text-gray-200 print:text-black">
                  {candidato.origem_cv || 'Banco Direto / Anúncio'}
                </span>
              </div>
            </div>
          </div>

          {/* Section 2: Materials, Video & Curriculum Links */}
          <div className="rounded-xl border border-gray-200 dark:border-gray-800 p-5 space-y-3 print:border-gray-300">
            <h3 className="text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300 flex items-center gap-1.5 print:text-black">
              <FileText className="w-4 h-4 text-[#00A9A1]" />
              Materiais & Links de Apresentação
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
              {/* CV Box */}
              <div className="p-3 rounded-lg bg-gray-50 dark:bg-gray-850 border border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-bold flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5 text-gray-500" />
                    Currículo (CV)
                  </span>
                  <span
                    className={`text-[10px] font-bold px-1.5 py-0.2 rounded ${
                      candidato.curriculo_url
                        ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                        : 'bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-300'
                    }`}
                  >
                    {candidato.curriculo_url ? 'Disponível' : 'Sem Link'}
                  </span>
                </div>
                {candidato.curriculo_url ? (
                  <a
                    href={candidato.curriculo_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[11px] text-[#00857e] dark:text-[#00C4BB] hover:underline break-all block"
                  >
                    {candidato.curriculo_url}
                  </a>
                ) : (
                  <p className="text-[11px] text-gray-400">Nenhum link de currículo cadastrado.</p>
                )}
              </div>

              {/* Video Pitch Box */}
              <div className="p-3 rounded-lg bg-gray-50 dark:bg-gray-850 border border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-bold flex items-center gap-1.5">
                    <Video className="w-3.5 h-3.5 text-orange-500" />
                    Vídeo de Apresentação (Pitch)
                  </span>
                  <span
                    className={`text-[10px] font-bold px-1.5 py-0.2 rounded ${
                      candidato.video_url
                        ? 'bg-teal-50 text-[#00857e] dark:bg-teal-950 dark:text-[#00C4BB]'
                        : 'bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400'
                    }`}
                  >
                    {candidato.video_url ? 'Vídeo Entregue' : 'Pendente'}
                  </span>
                </div>
                {candidato.video_url ? (
                  <a
                    href={candidato.video_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[11px] text-[#00857e] dark:text-[#00C4BB] hover:underline break-all block"
                  >
                    {candidato.video_url}
                  </a>
                ) : (
                  <p className="text-[11px] text-gray-400">Candidato ainda não enviou o link do vídeo.</p>
                )}
              </div>
            </div>

            {candidato.solides_profile_url && (
              <div className="p-2.5 rounded-lg bg-indigo-50/50 dark:bg-indigo-950/30 border border-indigo-200/60 dark:border-indigo-800/50 text-xs">
                <span className="font-bold text-indigo-900 dark:text-indigo-200 block mb-0.5">
                  Perfil Comportamental Sólides Profiler:
                </span>
                <a
                  href={candidato.solides_profile_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[11px] text-indigo-600 dark:text-indigo-400 hover:underline break-all"
                >
                  {candidato.solides_profile_url}
                </a>
              </div>
            )}
          </div>

          {/* Section 3: RH Interviews & Scheduling History */}
          <div className="rounded-xl border border-gray-200 dark:border-gray-800 p-5 space-y-3 print:border-gray-300">
            <h3 className="text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300 flex items-center gap-1.5 print:text-black">
              <Calendar className="w-4 h-4 text-[#00A9A1]" />
              Histórico de Entrevistas & Agendamentos (RH)
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div className="p-3 rounded-lg bg-gray-50 dark:bg-gray-850 border border-gray-200 dark:border-gray-700">
                <span className="text-[10px] text-gray-400 dark:text-gray-500 block uppercase font-bold">
                  Status do Agendamento RH
                </span>
                <span className="font-bold text-gray-800 dark:text-gray-200 mt-1 block">
                  {candidato.data_entrevista ? '✓ Agendado / Concluído' : 'Pendente de Agendamento'}
                </span>
              </div>

              <div className="p-3 rounded-lg bg-gray-50 dark:bg-gray-850 border border-gray-200 dark:border-gray-700">
                <span className="text-[10px] text-gray-400 dark:text-gray-500 block uppercase font-bold">
                  Data & Horário
                </span>
                <span className="font-bold text-gray-800 dark:text-gray-200 mt-1 block">
                  {candidato.data_entrevista
                    ? `${formatDateBR(candidato.data_entrevista)} às ${candidato.hora_entrevista || '14:30'}`
                    : 'A definir'}
                </span>
              </div>

              <div className="p-3 rounded-lg bg-gray-50 dark:bg-gray-850 border border-gray-200 dark:border-gray-700">
                <span className="text-[10px] text-gray-400 dark:text-gray-500 block uppercase font-bold">
                  Google Meet / Sala
                </span>
                <span className="font-bold text-gray-800 dark:text-gray-200 mt-1 block truncate">
                  {candidato.google_meet_link || 'Link gerado na convocação'}
                </span>
              </div>
            </div>

            {/* Aula Teste (for Professor / Teachers) */}
            {candidato.aula_teste_nota !== undefined && (
              <div className="p-3 rounded-lg bg-teal-50/50 dark:bg-teal-950/40 border border-teal-200 dark:border-teal-800 text-xs flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <GraduationCap className="w-4 h-4 text-[#00A9A1]" />
                  <span className="font-bold text-teal-900 dark:text-teal-200">
                    Avaliação da Aula Teste Prática:
                  </span>
                  {candidato.aula_teste_data && (
                    <span className="text-gray-500">({formatDateBR(candidato.aula_teste_data)})</span>
                  )}
                </div>
                <span className="font-extrabold text-sm text-[#00857e] dark:text-[#00C4BB]">
                  Nota: {candidato.aula_teste_nota}/10
                </span>
              </div>
            )}
          </div>

          {/* Section 4: Interview Notes & Considerations */}
          <div className="rounded-xl border border-gray-200 dark:border-gray-800 p-5 space-y-2 print:border-gray-300">
            <h3 className="text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300 flex items-center gap-1.5 print:text-black">
              <Sparkles className="w-4 h-4 text-[#00A9A1]" />
              Notas da Entrevista & Considerações do Recrutador
            </h3>

            <div className="p-4 rounded-lg bg-gray-50/70 dark:bg-gray-850 border border-gray-200 dark:border-gray-700 text-xs text-gray-800 dark:text-gray-200 whitespace-pre-wrap leading-relaxed min-h-[90px] print:bg-white print:text-black">
              {candidato.notas_entrevista || 'Nenhuma consideração registrada para este candidato até o momento.'}
            </div>
          </div>

          {/* Section 5: Stage History Log */}
          <div className="rounded-xl border border-gray-200 dark:border-gray-800 p-5 space-y-3 print:border-gray-300">
            <h3 className="text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300 flex items-center gap-1.5 print:text-black">
              <Clock className="w-4 h-4 text-[#00A9A1]" />
              Histórico Cronológico de Transição de Etapas
            </h3>

            <div className="space-y-2 text-xs">
              {(candidato.historico_etapas || []).length === 0 ? (
                <p className="text-gray-400 text-xs">Nenhum histórico registrado.</p>
              ) : (
                (candidato.historico_etapas || []).map((h, idx) => (
                  <div
                    key={idx}
                    className="flex items-start justify-between p-2.5 rounded-lg bg-gray-50 dark:bg-gray-850 border border-gray-200/70 dark:border-gray-700/60 print:bg-white print:border-gray-300"
                  >
                    <div className="flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-teal-100 dark:bg-teal-950 text-[#00857e] dark:text-[#00C4BB] font-bold text-[10px] flex items-center justify-center">
                        {idx + 1}
                      </span>
                      <div>
                        <span className="font-bold text-gray-900 dark:text-white print:text-black">
                          {h.etapa}
                        </span>
                        {h.observacao && (
                          <p className="text-[11px] text-gray-500 dark:text-gray-400 print:text-gray-700 mt-0.5">
                            {h.observacao}
                          </p>
                        )}
                      </div>
                    </div>

                    <span className="text-[10px] text-gray-400 font-mono flex-shrink-0">
                      {formatDateBR(h.data)}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Footer Signature & Approval Box */}
          <div className="pt-6 border-t border-gray-200 dark:border-gray-800 grid grid-cols-2 gap-8 text-center text-xs text-gray-500 print:text-black">
            <div>
              <div className="border-b border-gray-400 mb-1 h-8" />
              <p className="font-bold text-gray-800 dark:text-gray-200 print:text-black">
                Recrutador(a) Responsável / RH
              </p>
              <p className="text-[10px]">Vox2you Recrutamento & Seleção</p>
            </div>
            <div>
              <div className="border-b border-gray-400 mb-1 h-8" />
              <p className="font-bold text-gray-800 dark:text-gray-200 print:text-black">
                Gestor Local / Franqueado
              </p>
              <p className="text-[10px]">{candidato.unidade}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
