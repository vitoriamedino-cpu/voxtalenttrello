import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { Candidato } from '../../types';
import { formatMensagemText, buildWhatsAppLink } from '../../lib/formatters';
import {
  MessageCircle,
  X,
  Send,
  Copy,
  CheckCircle,
  ShieldCheck,
} from 'lucide-react';

interface WhatsAppModalProps {
  candidato: Candidato | null;
  isOpen: boolean;
  onClose: () => void;
}

export const WhatsAppModal: React.FC<WhatsAppModalProps> = ({
  candidato,
  isOpen,
  onClose,
}) => {
  const { templates, vagas } = useApp();

  const vaga = candidato ? vagas.find((v) => v.id === candidato.vaga_id) : undefined;
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>('');
  const [messageText, setMessageText] = useState<string>('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (candidato) {
      const match =
        templates.find((t) => t.etapa === candidato.etapa_processo) || templates[0];
      if (match) {
        setSelectedTemplateId(match.id);
        const formatted = formatMensagemText(match, candidato, vaga);
        setMessageText(formatted);
      }
    }
  }, [candidato, templates, vaga]);

  if (!isOpen || !candidato) return null;

  const handleTemplateChange = (tmplId: string) => {
    setSelectedTemplateId(tmplId);
    const tmpl = templates.find((t) => t.id === tmplId);
    if (tmpl) {
      const formatted = formatMensagemText(tmpl, candidato, vaga);
      setMessageText(formatted);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(messageText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSend = () => {
    const link = buildWhatsAppLink(candidato.telefone, messageText);
    window.open(link, '_blank');
  };

  const currentTemplate = templates.find((t) => t.id === selectedTemplateId);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 dark:bg-black/70 backdrop-blur-xs p-4 overflow-y-auto">
      <div
        id="quick-whatsapp-modal"
        className="relative w-full max-w-xl rounded-xl bg-white dark:bg-gray-800 shadow-xl border border-gray-200 dark:border-gray-700 p-5 animate-in fade-in zoom-in-95 duration-150 text-xs"
      >
        <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-700 pb-3 mb-3">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded bg-[#00A9A1] dark:bg-[#00C4BB] text-white dark:text-gray-950 shadow-xs">
              <MessageCircle className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-gray-900 dark:text-white">
                Disparar WhatsApp para {candidato.nome}
              </h3>
              <p className="text-[11px] text-gray-500 dark:text-gray-400">
                {candidato.vaga_titulo} • <strong className="text-gray-700 dark:text-gray-200">{candidato.unidade}</strong>
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-600 dark:hover:text-gray-200"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-3.5">
          {/* Template Picker */}
          <div>
            <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1 text-[11px]">
              Modelo do Guia de Comunicação:
            </label>
            <select
              value={selectedTemplateId}
              onChange={(e) => handleTemplateChange(e.target.value)}
              className="w-full rounded-md border border-gray-200 dark:border-gray-700 px-3 py-1.5 bg-white dark:bg-gray-800 text-gray-900 dark:text-white font-medium text-xs focus:ring-1 focus:ring-[#00A9A1] dark:focus:ring-[#00C4BB] focus:outline-none"
            >
              {templates.map((tmpl) => (
                <option key={tmpl.id} value={tmpl.id}>
                  {tmpl.titulo} ({tmpl.etapa}) {tmpl.confidencial ? '🔒 Sigiloso' : ''}
                </option>
              ))}
            </select>
          </div>

          {currentTemplate?.confidencial && (
            <div className="rounded-md bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200/80 dark:border-indigo-800 p-2.5 text-indigo-900 dark:text-indigo-200 flex items-center gap-2 text-[11px]">
              <ShieldCheck className="w-4 h-4 text-indigo-600 dark:text-indigo-400 flex-shrink-0" />
              <span>
                <strong>Sigilo Garantido:</strong> O texto omite qualquer menção a formato em grupo.
              </span>
            </div>
          )}

          {/* Editable Text Area */}
          <div>
            <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1 text-[11px]">
              Mensagem Pronta (Variáveis substituídas):
            </label>
            <textarea
              rows={7}
              value={messageText}
              onChange={(e) => setMessageText(e.target.value)}
              className="w-full rounded-md border border-gray-200 dark:border-gray-700 p-3 bg-gray-50/70 dark:bg-gray-850 font-mono text-[11px] text-gray-800 dark:text-gray-200 leading-relaxed focus:ring-1 focus:ring-[#00A9A1] dark:focus:ring-[#00C4BB] focus:outline-none"
            />
          </div>

          {/* Action buttons */}
          <div className="flex items-center justify-between pt-2 border-t border-gray-100 dark:border-gray-700">
            <button
              type="button"
              onClick={handleCopy}
              className="inline-flex items-center gap-1.5 rounded-md border border-gray-200 dark:border-gray-700 px-3 py-1.5 font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 text-xs shadow-xs"
            >
              <Copy className="w-3.5 h-3.5" />
              <span>{copied ? 'Copiado!' : 'Copiar Texto'}</span>
            </button>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="rounded-md border border-gray-200 dark:border-gray-700 px-3 py-1.5 font-semibold text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 text-xs"
              >
                Fechar
              </button>
              <button
                type="button"
                onClick={handleSend}
                className="inline-flex items-center gap-1.5 rounded-md bg-[#00A9A1] hover:bg-[#008f88] dark:bg-[#00A9A1] dark:hover:bg-[#00C4BB] px-4 py-1.5 font-bold text-white shadow-xs text-xs transition-all active:scale-[0.98]"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Abrir WhatsApp ({candidato.telefone})</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
