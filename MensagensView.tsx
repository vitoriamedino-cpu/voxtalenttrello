import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { ETAPAS_KANBAN } from '../../lib/rsConstants';
import { MensagemTemplate, EtapaProcesso } from '../../types';
import { formatMensagemText, buildWhatsAppLink } from '../../lib/formatters';
import {
  MessageCircle,
  ShieldCheck,
  Sparkles,
  Copy,
  Edit3,
  Check,
  Send,
  Plus,
  Info,
  Search,
  Filter,
  UserCheck,
} from 'lucide-react';

export const MensagensView: React.FC = () => {
  const { templates, updateTemplate, candidatos, vagas } = useApp();

  // Filtragem estrita: Apenas candidatos 'Em andamento', 'Ausente' ou na etapa 'Banco de Talentos'
  const eligibleCandidates = candidatos.filter(
    (c) =>
      c.status === 'Em andamento' ||
      c.status === 'Ausente' ||
      c.etapa_processo === 'Banco de Talentos'
  );

  const [selectedTemplateId, setSelectedTemplateId] = useState<string>(templates[0]?.id || '');
  const [testCandidateId, setTestCandidateId] = useState<string>(eligibleCandidates[0]?.id || candidatos[0]?.id || '');
  const [copied, setCopied] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [searchFilter, setSearchFilter] = useState('');
  const [stageFilter, setStageFilter] = useState<string>('TODOS');

  const selectedTemplate = templates.find((t) => t.id === selectedTemplateId) || templates[0];
  const testCandidate = eligibleCandidates.find((c) => c.id === testCandidateId) || eligibleCandidates[0] || candidatos[0];
  const testVaga = testCandidate ? vagas.find((v) => v.id === testCandidate.vaga_id) : undefined;

  // Local editing fields
  const [editTexto, setEditTexto] = useState(selectedTemplate?.texto || '');
  const [editTextoConfidencial, setEditTextoConfidencial] = useState(
    selectedTemplate?.texto_confidencial || ''
  );
  const [editConfidencial, setEditConfidencial] = useState(selectedTemplate?.confidencial || false);

  const handleSelectTemplate = (tmpl: MensagemTemplate) => {
    setSelectedTemplateId(tmpl.id);
    setEditTexto(tmpl.texto);
    setEditTextoConfidencial(tmpl.texto_confidencial || '');
    setEditConfidencial(tmpl.confidencial);
    setIsEditing(false);
  };

  const handleSaveTemplate = () => {
    if (!selectedTemplate) return;
    updateTemplate(selectedTemplate.id, {
      texto: editTexto,
      texto_confidencial: editTextoConfidencial,
      confidencial: editConfidencial,
    });
    setIsEditing(false);
  };

  // Preview generated text
  const previewText = selectedTemplate
    ? formatMensagemText(
        {
          ...selectedTemplate,
          texto: editTexto,
          texto_confidencial: editTextoConfidencial,
          confidencial: editConfidencial,
        },
        testCandidate || {},
        testVaga
      )
    : '';

  const handleCopy = () => {
    navigator.clipboard.writeText(previewText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleTestWhatsApp = () => {
    if (!testCandidate) return;
    const url = buildWhatsAppLink(testCandidate.telefone, previewText);
    window.open(url, '_blank');
  };

  const filteredTemplates = templates.filter((t) => {
    const matchesSearch =
      t.titulo.toLowerCase().includes(searchFilter.toLowerCase()) ||
      t.descricao.toLowerCase().includes(searchFilter.toLowerCase()) ||
      (t.objetivo && t.objetivo.toLowerCase().includes(searchFilter.toLowerCase())) ||
      (t.numero && t.numero.toString().includes(searchFilter));

    const matchesStage = stageFilter === 'TODOS' || t.etapa === stageFilter;

    return matchesSearch && matchesStage;
  });

  return (
    <div className="space-y-3.5">
      {/* Top Header */}
      <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-4 shadow-xs">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <h2 className="text-base font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <MessageCircle className="w-4 h-4 text-[#00A9A1] dark:text-[#00C4BB]" />
              Guia de Comunicação Oficial & Gerador de Mensagens (16 Modelos)
            </h2>
            <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5">
              16 modelos cadastrados de acordo com o POP Vox2you v1.1. Substituição automática de variáveis, endereços de unidades e sigilo de dinâmicas.
            </p>
          </div>
          <span className="rounded-full bg-teal-50 dark:bg-teal-950/60 text-[#00A9A1] dark:text-[#00C4BB] font-bold text-xs px-3 py-1 border border-teal-100 dark:border-teal-800">
            16 Templates Ativos
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3.5">
        {/* Left list of templates */}
        <div className="lg:col-span-5 space-y-2.5">
          {/* Search and Category Filter */}
          <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-2.5 shadow-xs space-y-2">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-gray-400 dark:text-gray-500 absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Buscar por número, título ou objetivo..."
                value={searchFilter}
                onChange={(e) => setSearchFilter(e.target.value)}
                className="w-full pl-8 pr-2.5 py-1.5 rounded-md border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-xs focus:ring-1 focus:ring-[#00A9A1] dark:focus:ring-[#00C4BB] focus:outline-none"
              />
            </div>

            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-[11px]">
              <span className="text-gray-400 dark:text-gray-400 font-semibold flex items-center gap-1 flex-shrink-0">
                <Filter className="w-3 h-3" />
                Filtro:
              </span>
              {['TODOS', '1º Contato', 'Vídeo de Apresentação', 'Entrevista Coletiva/Online', 'Etapa Prática', 'Banco de Talentos'].map((et) => (
                <button
                  key={et}
                  type="button"
                  onClick={() => setStageFilter(et)}
                  className={`rounded px-2 py-0.5 font-medium whitespace-nowrap transition-colors ${
                    stageFilter === et
                      ? 'bg-[#00A9A1] dark:bg-[#00A9A1] text-white font-bold'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                >
                  {et}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-1.5 max-h-[calc(100vh-280px)] overflow-y-auto pr-1">
            {filteredTemplates.map((tmpl) => {
              const isSelected = tmpl.id === selectedTemplateId;
              return (
                <div
                  key={tmpl.id}
                  onClick={() => handleSelectTemplate(tmpl)}
                  className={`cursor-pointer rounded-xl p-3 border transition-all text-xs ${
                    isSelected
                      ? 'border-[#00A9A1] dark:border-[#00C4BB] bg-teal-50/50 dark:bg-teal-950/40 shadow-xs'
                      : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-750'
                  }`}
                >
                  <div className="flex items-center justify-between font-bold mb-1">
                    <div className="flex items-center gap-1.5">
                      {tmpl.numero && (
                        <span className="flex h-4.5 min-w-4.5 px-1 items-center justify-center rounded bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 font-bold text-[9px]">
                          #{tmpl.numero < 10 ? `0${tmpl.numero}` : tmpl.numero}
                        </span>
                      )}
                      <span className={isSelected ? 'text-[#00A9A1] dark:text-[#00C4BB]' : 'text-gray-900 dark:text-white'}>
                        {tmpl.titulo}
                      </span>
                    </div>

                    {tmpl.confidencial && (
                      <span className="inline-flex items-center gap-1 text-[9px] font-bold bg-indigo-50 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300 px-1.5 py-0.5 rounded border border-indigo-200 dark:border-indigo-800">
                        <ShieldCheck className="w-2.5 h-2.5" />
                        Sigiloso
                      </span>
                    )}
                  </div>

                  {tmpl.objetivo && (
                    <p className="text-[10px] text-gray-600 dark:text-gray-400 line-clamp-1 mb-1.5">
                      {tmpl.objetivo}
                    </p>
                  )}

                  <div className="flex items-center justify-between text-[10px] text-gray-400 dark:text-gray-500 pt-1 border-t border-gray-100 dark:border-gray-700">
                    <span className="truncate max-w-[150px]">{tmpl.etapa}</span>
                    <div className="flex items-center gap-1.5">
                      {tmpl.canal && (
                        <span className="font-semibold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/50 px-1.5 py-0.2 rounded text-[9px]">
                          {tmpl.canal}
                        </span>
                      )}
                      <span className="font-semibold text-teal-700 dark:text-teal-300 uppercase text-[9px]">
                        {tmpl.tipo}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right editor & preview */}
        <div className="lg:col-span-7 space-y-3.5">
          <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-4 shadow-xs">
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-gray-100 dark:border-gray-700">
              <div>
                <div className="flex items-center gap-2">
                  {selectedTemplate?.numero && (
                    <span className="rounded bg-[#00A9A1] dark:bg-[#00A9A1] text-white font-bold text-[10px] px-1.5 py-0.5">
                      Modelo #{selectedTemplate.numero}
                    </span>
                  )}
                  <h3 className="text-sm font-bold text-gray-900 dark:text-white">
                    {selectedTemplate?.titulo}
                  </h3>
                </div>
                <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5">{selectedTemplate?.descricao}</p>
                {selectedTemplate?.objetivo && (
                  <p className="text-[10px] text-teal-800 dark:text-teal-300 bg-teal-50/60 dark:bg-teal-950/50 rounded px-2 py-0.5 mt-1">
                    <strong>Objetivo:</strong> {selectedTemplate.objetivo}
                  </p>
                )}
              </div>

              <div className="flex items-center gap-2">
                {isEditing ? (
                  <button
                    type="button"
                    onClick={handleSaveTemplate}
                    className="inline-flex items-center gap-1 rounded-md bg-[#00A9A1] hover:bg-[#008f88] dark:bg-[#00A9A1] dark:hover:bg-[#00C4BB] px-3 py-1.5 text-xs font-bold text-white shadow-xs"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>Salvar Modelo</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => setIsEditing(true)}
                    className="inline-flex items-center gap-1 rounded-md border border-gray-200 dark:border-gray-700 px-3 py-1.5 text-xs font-semibold text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 shadow-xs"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>Editar Modelo</span>
                  </button>
                )}
              </div>
            </div>

            {/* Confidentiality Warning if applicable */}
            {selectedTemplate?.confidencial && (
              <div className="mb-3.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200/80 dark:border-indigo-800 p-3 text-xs text-indigo-900 dark:text-indigo-200 flex items-start gap-2">
                <ShieldCheck className="w-4 h-4 text-indigo-600 dark:text-indigo-400 flex-shrink-0 mt-0.5" />
                <div>
                  <strong className="font-bold text-[11px]">Regra de Sigilo da Entrevista Coletiva:</strong>
                  <p className="mt-0.5 text-[11px] text-indigo-800 dark:text-indigo-300">
                    O texto enviado ao candidato utiliza a redação confidencial para jamais expor que a dinâmica será em grupo, preservando o sigilo do processo seletivo da Vox2you.
                  </p>
                </div>
              </div>
            )}

            {/* Template Body */}
            {isEditing ? (
              <div className="space-y-3.5 text-xs">
                <div>
                  <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1 text-[11px]">
                    Texto Padrão da Mensagem
                  </label>
                  <textarea
                    rows={8}
                    value={editTexto}
                    onChange={(e) => setEditTexto(e.target.value)}
                    className="w-full rounded-md border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white p-2.5 font-mono text-xs focus:ring-1 focus:ring-[#00A9A1] dark:focus:ring-[#00C4BB] focus:outline-none leading-relaxed"
                  />
                </div>

                {selectedTemplate?.confidencial && (
                  <div>
                    <label className="block font-bold text-indigo-900 dark:text-indigo-300 mb-1 text-[11px]">
                      Texto Confidencial (Sem menção a entrevista em grupo) *
                    </label>
                    <textarea
                      rows={6}
                      value={editTextoConfidencial}
                      onChange={(e) => setEditTextoConfidencial(e.target.value)}
                      className="w-full rounded-md border border-indigo-200 dark:border-indigo-800 bg-indigo-50/30 dark:bg-indigo-950/30 text-gray-900 dark:text-white p-2.5 font-mono text-xs focus:ring-1 focus:ring-indigo-500 focus:outline-none leading-relaxed"
                    />
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-3.5">
                {/* Live Preview for Candidate Simulation */}
                <div className="rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50/60 dark:bg-gray-850 p-3.5">
                  <div className="flex flex-wrap items-center justify-between gap-2 mb-2.5">
                    <span className="text-[11px] font-bold text-gray-700 dark:text-gray-300">
                      Simulação com Variáveis Preenchidas:
                    </span>
                    <select
                      value={testCandidateId}
                      onChange={(e) => setTestCandidateId(e.target.value)}
                      className="text-xs rounded-md border border-gray-200 dark:border-gray-700 px-2.5 py-1 bg-white dark:bg-gray-800 text-gray-900 dark:text-white font-medium focus:ring-1 focus:ring-[#00A9A1] dark:focus:ring-[#00C4BB]"
                    >
                      {eligibleCandidates.length === 0 ? (
                        <option value="">Nenhum candidato elegível (Em andamento / Ausente / Banco)</option>
                      ) : (
                        eligibleCandidates.map((c) => (
                          <option key={c.id} value={c.id}>
                            {c.nome} ({c.vaga_titulo} • {c.unidade}) [{c.etapa_processo === 'Banco de Talentos' ? 'Banco de Talentos' : c.status}]
                          </option>
                        ))
                      )}
                    </select>
                  </div>

                  <div className="rounded-md bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-3.5 font-mono text-xs text-gray-800 dark:text-gray-200 whitespace-pre-wrap leading-relaxed shadow-2xs max-h-80 overflow-y-auto">
                    {previewText}
                  </div>
                </div>

                {/* Quick Action Buttons */}
                <div className="flex items-center justify-between pt-1">
                  <button
                    type="button"
                    onClick={handleCopy}
                    className="inline-flex items-center gap-1.5 rounded-md border border-gray-200 dark:border-gray-700 px-3 py-1.5 text-xs font-semibold text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 shadow-xs transition-colors"
                  >
                    <Copy className="w-3.5 h-3.5" />
                    <span>{copied ? 'Copiado para Clipboard!' : 'Copiar Texto Formatado'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleTestWhatsApp}
                    className="inline-flex items-center gap-1.5 rounded-md bg-[#00A9A1] hover:bg-[#008f88] dark:bg-[#00A9A1] dark:hover:bg-[#00C4BB] px-3.5 py-1.5 text-xs font-bold text-white shadow-xs active:scale-[0.98] transition-all"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Disparar WhatsApp ({testCandidate?.telefone})</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

