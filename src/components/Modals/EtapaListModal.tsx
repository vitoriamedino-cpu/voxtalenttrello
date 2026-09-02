import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { EtapaProcesso, Candidato } from '../../types';
import { formatDateBR, buildWhatsAppLink } from '../../lib/formatters';
import {
  X,
  Copy,
  Download,
  Search,
  MessageCircle,
  Mail,
  Phone,
  Video,
  FileText,
  MapPin,
  CheckCircle2,
  Calendar,
  Layers,
  ExternalLink,
  Users,
} from 'lucide-react';

interface EtapaListModalProps {
  etapa: EtapaProcesso | null;
  isOpen: boolean;
  onClose: () => void;
}

export const EtapaListModal: React.FC<EtapaListModalProps> = ({
  etapa,
  isOpen,
  onClose,
}) => {
  const {
    candidatos,
    vagas,
    selectedUnidade,
    selectedVagaFilter,
    setActiveTab,
    setWhatsAppModalCandidate,
    setCandidateModalId,
    setCandidatePdfModalId,
  } = useApp();

  const [searchTerm, setSearchTerm] = useState('');
  const [copied, setCopied] = useState(false);
  const [filterOnlyActive, setFilterOnlyActive] = useState(true);

  if (!isOpen || !etapa) return null;

  // Filter candidates specifically in this stage
  const stageCandidates = candidatos.filter((c) => {
    if (c.etapa_processo !== etapa) return false;
    if (filterOnlyActive && c.status === 'Reprovado') return false;
    if (selectedUnidade !== 'TODAS' && c.unidade !== selectedUnidade) return false;
    if (selectedVagaFilter !== 'TODAS' && c.vaga_id !== selectedVagaFilter) return false;

    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      return (
        c.nome.toLowerCase().includes(term) ||
        c.email.toLowerCase().includes(term) ||
        c.telefone.toLowerCase().includes(term) ||
        c.vaga_titulo.toLowerCase().includes(term) ||
        c.unidade.toLowerCase().includes(term)
      );
    }
    return true;
  });

  // Copy list to clipboard
  const handleCopyList = () => {
    const header = `LISTA DE CONTATOS - ETAPA: ${etapa.toUpperCase()} (${stageCandidates.length} candidatos)\n========================================================\n`;
    const rows = stageCandidates
      .map(
        (c, idx) =>
          `${idx + 1}. ${c.nome} | WhatsApp: ${c.telefone || 'N/A'} | E-mail: ${c.email || 'N/A'} | Vaga: ${c.vaga_titulo} (${c.unidade}) | Status: ${c.status}${
            c.video_url ? ` | Vídeo: ${c.video_url}` : ''
          }`
      )
      .join('\n');

    navigator.clipboard.writeText(header + rows);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  // Export CSV
  const handleExportCSV = () => {
    const csvHeader = 'Nome,WhatsApp,Email,Vaga,Unidade,Etapa,Status,Video_URL,Curriculo_URL,Data_Inscricao\n';
    const csvRows = stageCandidates
      .map(
        (c) =>
          `"${c.nome.replace(/"/g, '""')}","${c.telefone || ''}","${c.email || ''}","${c.vaga_titulo.replace(/"/g, '""')}","${c.unidade}","${c.etapa_processo}","${c.status}","${c.video_url || ''}","${c.curriculo_url || ''}","${c.criado_em || ''}"`
      )
      .join('\n');

    const blob = new Blob([csvHeader + csvRows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Lista_${etapa.replace(/[^a-zA-Z0-9]/g, '_')}_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div
      id="etapa-list-modal"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-4xl bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-800 flex flex-col max-h-[90vh] overflow-hidden my-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200 dark:border-gray-800 bg-gray-50/80 dark:bg-gray-850">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-teal-50 dark:bg-teal-950/70 border border-teal-200 dark:border-teal-800 text-[#00A9A1] dark:text-[#00C4BB] flex items-center justify-center font-bold shadow-2xs">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-extrabold text-gray-900 dark:text-white">
                  Lista de Contatos: <span className="text-[#00A9A1] dark:text-[#00C4BB]">{etapa}</span>
                </h3>
                <span className="rounded-full bg-teal-100 dark:bg-teal-950 text-[#00857e] dark:text-[#00C4BB] font-bold text-[11px] px-2.5 py-0.5">
                  {stageCandidates.length} candidatos
                </span>
              </div>
              <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5">
                Nomes, WhatsApp, e-mails e materiais exclusivos dos candidatos presentes nesta etapa
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Action Controls & Search Bar */}
        <div className="px-5 py-3 border-b border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="relative flex-1 min-w-[220px] max-w-md">
            <Search className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder={`Filtrar por nome, WhatsApp ou e-mail em ${etapa}...`}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-700 text-xs text-gray-900 dark:text-white bg-gray-50 dark:bg-gray-800 focus:ring-1 focus:ring-[#00A9A1] dark:focus:ring-[#00C4BB] focus:outline-none"
            />
          </div>

          <div className="flex items-center gap-2">
            <label className="flex items-center gap-1.5 text-[11px] font-medium text-gray-600 dark:text-gray-400 cursor-pointer mr-2">
              <input
                type="checkbox"
                checked={filterOnlyActive}
                onChange={(e) => setFilterOnlyActive(e.target.checked)}
                className="rounded border-gray-300 text-[#00A9A1] focus:ring-[#00A9A1]"
              />
              <span>Ocultar Reprovados</span>
            </label>

            <button
              type="button"
              id="btn-copy-etapa-list"
              onClick={handleCopyList}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-xs font-semibold text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors shadow-2xs"
              title="Copiar lista de nomes e contatos"
            >
              <Copy className="w-3.5 h-3.5" />
              <span>{copied ? 'Copiado!' : 'Copiar Lista'}</span>
            </button>

            <button
              type="button"
              id="btn-export-csv-etapa"
              onClick={handleExportCSV}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-teal-50 dark:bg-teal-950/60 border border-teal-200 dark:border-teal-800 text-xs font-bold text-[#00857e] dark:text-[#00C4BB] hover:bg-teal-100 dark:hover:bg-teal-900/60 transition-colors shadow-2xs"
              title="Baixar planilha CSV"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Exportar Planilha</span>
            </button>
          </div>
        </div>

        {/* Candidate Table List */}
        <div className="flex-1 overflow-y-auto p-4 max-h-[60vh]">
          {stageCandidates.length === 0 ? (
            <div className="py-12 text-center text-gray-400 space-y-2">
              <Users className="w-8 h-8 mx-auto opacity-40 text-gray-400" />
              <p className="text-xs font-medium">Nenhum candidato encontrado nesta etapa com os filtros atuais.</p>
            </div>
          ) : (
            <div className="rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden shadow-2xs">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="bg-gray-50 dark:bg-gray-800/80 text-[10px] uppercase font-bold text-gray-500 dark:text-gray-400 border-b border-gray-200 dark:border-gray-700">
                  <tr>
                    <th className="px-3.5 py-2.5">Candidato</th>
                    <th className="px-3.5 py-2.5">WhatsApp / Contato</th>
                    <th className="px-3.5 py-2.5">E-mail</th>
                    <th className="px-3.5 py-2.5">Vaga & Unidade</th>
                    <th className="px-3.5 py-2.5">Status / Materiais</th>
                    <th className="px-3.5 py-2.5 text-right">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-800 bg-white dark:bg-gray-900">
                  {stageCandidates.map((c) => {
                    const waUrl = buildWhatsAppLink(
                      c.telefone,
                      `Olá ${c.nome}, referente ao processo seletivo da Vox2you (${c.vaga_titulo}).`
                    );

                    return (
                      <tr
                        key={c.id}
                        className="hover:bg-gray-50/80 dark:hover:bg-gray-850/60 transition-colors"
                      >
                        {/* Nome */}
                        <td className="px-3.5 py-2.5">
                          <button
                            type="button"
                            onClick={() => {
                              onClose();
                              setCandidateModalId(c.id);
                            }}
                            className="font-bold text-gray-900 dark:text-white hover:text-[#00A9A1] dark:hover:text-[#00C4BB] text-left transition-colors"
                          >
                            {c.nome}
                          </button>
                        </td>

                        {/* WhatsApp */}
                        <td className="px-3.5 py-2.5">
                          <div className="flex items-center gap-1.5">
                            <span className="font-mono text-gray-700 dark:text-gray-300">
                              {c.telefone || 'N/A'}
                            </span>
                            {c.telefone && (
                              <a
                                href={waUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="p-1 rounded bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100 transition-colors"
                                title="Abrir conversa no WhatsApp"
                              >
                                <MessageCircle className="w-3 h-3" />
                              </a>
                            )}
                          </div>
                        </td>

                        {/* Email */}
                        <td className="px-3.5 py-2.5">
                          <div className="flex items-center gap-1.5 text-gray-600 dark:text-gray-300 truncate max-w-[180px]">
                            {c.email ? (
                              <a
                                href={`mailto:${c.email}`}
                                className="truncate hover:underline text-gray-700 dark:text-gray-300"
                                title={c.email}
                              >
                                {c.email}
                              </a>
                            ) : (
                              <span className="text-gray-400">N/A</span>
                            )}
                          </div>
                        </td>

                        {/* Vaga & Unidade */}
                        <td className="px-3.5 py-2.5">
                          <div className="font-semibold text-gray-800 dark:text-gray-200">
                            {c.vaga_titulo}
                          </div>
                          <span className="text-[10px] text-gray-400 dark:text-gray-500">
                            {c.unidade}
                          </span>
                        </td>

                        {/* Status / Materiais */}
                        <td className="px-3.5 py-2.5">
                          <div className="flex items-center gap-1 flex-wrap">
                            <span
                              className={`text-[10px] font-bold px-1.5 py-0.2 rounded ${
                                c.status === 'Aprovado'
                                  ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                                  : c.status === 'Ausente'
                                  ? 'bg-amber-50 text-[#c25e00] dark:bg-amber-950 dark:text-[#FFA336]'
                                  : 'bg-teal-50 text-[#00857e] dark:bg-teal-950 dark:text-[#00C4BB]'
                              }`}
                            >
                              {c.status}
                            </span>

                            {c.video_url && (
                              <a
                                href={c.video_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-0.5 px-1 py-0.2 rounded bg-orange-50 dark:bg-orange-950 text-[9px] font-bold text-orange-700 dark:text-orange-300 hover:underline"
                                title="Assistir vídeo pitch"
                              >
                                <Video className="w-2.5 h-2.5" />
                                Vídeo
                              </a>
                            )}

                            {c.curriculo_url && (
                              <a
                                href={c.curriculo_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-0.5 px-1 py-0.2 rounded bg-gray-100 dark:bg-gray-800 text-[9px] font-bold text-gray-700 dark:text-gray-300 hover:underline"
                                title="Ver currículo"
                              >
                                <FileText className="w-2.5 h-2.5" />
                                CV
                              </a>
                            )}
                          </div>
                        </td>

                        {/* Ações */}
                        <td className="px-3.5 py-2.5 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              type="button"
                              onClick={() => {
                                onClose();
                                setCandidatePdfModalId(c.id);
                              }}
                              className="px-2 py-0.5 rounded border border-gray-200 dark:border-gray-700 text-[10px] font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                              title="Gerar Dossiê PDF"
                            >
                              PDF
                            </button>

                            <button
                              type="button"
                              onClick={() => {
                                onClose();
                                setWhatsAppModalCandidate(c);
                              }}
                              className="px-2 py-0.5 rounded bg-emerald-50 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border border-emerald-200/50 dark:border-emerald-800/50 text-[10px] font-bold hover:bg-emerald-100 transition-colors"
                              title="Disparar modelo WhatsApp"
                            >
                              WhatsApp
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Footer info */}
        <div className="px-5 py-3 border-t border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-850 flex items-center justify-between text-xs text-gray-500">
          <span>Mostrando {stageCandidates.length} contatos extraídos da etapa "{etapa}"</span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-xs font-semibold text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
};
