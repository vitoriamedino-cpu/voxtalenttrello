import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { UNIDADES_VOX, ETAPAS_KANBAN, CANAIS_DIVULGACAO } from '../../lib/rsConstants';
import { UnidadeVox, EtapaProcesso } from '../../types';
import { X, UserPlus, Sparkles } from 'lucide-react';

interface NewCandidateModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const NewCandidateModal: React.FC<NewCandidateModalProps> = ({ isOpen, onClose }) => {
  const { vagas, addCandidato, config } = useApp();

  const openVagas = vagas.filter((v) => v.status === 'Em aberto');
  const defaultVaga = openVagas[0] || vagas[0];

  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [telefone, setTelefone] = useState('');
  const [vagaId, setVagaId] = useState(defaultVaga?.id || '');
  const [unidade, setUnidade] = useState<UnidadeVox>(defaultVaga?.unidade || 'Vox Cidade Verde');
  const [etapa, setEtapa] = useState<EtapaProcesso>('Triagem');
  const [curriculoUrl, setCurriculoUrl] = useState('');
  const [videoUrl, setVideoUrl] = useState('');
  const [origemCv, setOrigemCv] = useState('LinkedIn');
  const [notas, setNotas] = useState('');

  if (!isOpen) return null;

  const handleVagaChange = (selectedId: string) => {
    setVagaId(selectedId);
    const selectedVaga = vagas.find((v) => v.id === selectedId);
    if (selectedVaga) {
      setUnidade(selectedVaga.unidade);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!vagaId || !unidade) {
      alert('Vínculo obrigatório: Selecione uma vaga e uma unidade Vox.');
      return;
    }

    const selectedVaga = vagas.find((v) => v.id === vagaId);
    const isProfessorCargo =
      selectedVaga?.cargo?.toLowerCase() === (config.fluxo_simplificado_cargo || 'professor').toLowerCase();

    addCandidato({
      nome,
      email,
      telefone,
      vaga_id: vagaId,
      vaga_titulo: selectedVaga?.titulo || 'Vaga Vox',
      unidade,
      etapa_processo: etapa,
      status: 'Em andamento',
      fluxo_simplificado: isProfessorCargo,
      curriculo_url: curriculoUrl || undefined,
      video_url: videoUrl || undefined,
      origem_cv: origemCv,
      notas_entrevista: notas || undefined,
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 dark:bg-black/70 backdrop-blur-xs p-4 overflow-y-auto">
      <div
        id="new-candidate-modal"
        className="relative w-full max-w-xl rounded-xl bg-white dark:bg-gray-800 shadow-xl border border-gray-200 dark:border-gray-700 p-5 animate-in fade-in zoom-in-95 duration-150"
      >
        <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-700 pb-3 mb-3">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded bg-[#00A9A1] dark:bg-[#00C4BB] text-white dark:text-gray-950 shadow-xs">
              <UserPlus className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-gray-900 dark:text-white">Novo Candidato</h3>
              <p className="text-[11px] text-gray-500 dark:text-gray-400">Cadastrar no fluxo de R&S da Vox2you</p>
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

        <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
          {/* Nome */}
          <div>
            <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1 text-[11px]">Nome Completo *</label>
            <input
              type="text"
              required
              placeholder="Ex: Amanda Silva Castro"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              className="w-full rounded-md border border-gray-200 dark:border-gray-700 px-3 py-1.5 text-gray-900 dark:text-white bg-white dark:bg-gray-800 focus:ring-1 focus:ring-[#00A9A1] dark:focus:ring-[#00C4BB] focus:outline-none"
            />
          </div>

          {/* Email & Telefone */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1 text-[11px]">E-mail *</label>
              <input
                type="email"
                required
                placeholder="candidato@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-md border border-gray-200 dark:border-gray-700 px-3 py-1.5 text-gray-900 dark:text-white bg-white dark:bg-gray-800 focus:ring-1 focus:ring-[#00A9A1] dark:focus:ring-[#00C4BB] focus:outline-none"
              />
            </div>
            <div>
              <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1 text-[11px]">WhatsApp / Telefone *</label>
              <input
                type="text"
                required
                placeholder="(84) 99999-8888"
                value={telefone}
                onChange={(e) => setTelefone(e.target.value)}
                className="w-full rounded-md border border-gray-200 dark:border-gray-700 px-3 py-1.5 text-gray-900 dark:text-white bg-white dark:bg-gray-800 focus:ring-1 focus:ring-[#00A9A1] dark:focus:ring-[#00C4BB] focus:outline-none"
              />
            </div>
          </div>

          {/* Mandatory Vaga & Unidade Binding */}
          <div className="rounded-lg border border-teal-200/80 dark:border-teal-800 bg-teal-50/40 dark:bg-teal-950/30 p-3 space-y-2.5">
            <h4 className="text-[10px] font-bold uppercase tracking-wider text-[#00857e] dark:text-[#00C4BB]">
              Vínculo Obrigatório de Vaga & Unidade
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1 text-[11px]">Vaga de Destino *</label>
                <select
                  required
                  value={vagaId}
                  onChange={(e) => handleVagaChange(e.target.value)}
                  className="w-full rounded-md border border-gray-200 dark:border-gray-700 px-3 py-1.5 bg-white dark:bg-gray-800 text-gray-900 dark:text-white font-medium focus:ring-1 focus:ring-[#00A9A1] dark:focus:ring-[#00C4BB] focus:outline-none text-xs"
                >
                  <option value="">Selecione uma Vaga...</option>
                  {vagas.map((v) => (
                    <option key={v.id} value={v.id}>
                      {v.titulo} ({v.unidade.replace('Vox ', '')}) {v.status !== 'Em aberto' ? `[${v.status}]` : ''}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1 text-[11px]">Unidade Vox *</label>
                <select
                  required
                  value={unidade}
                  onChange={(e) => setUnidade(e.target.value as UnidadeVox)}
                  className="w-full rounded-md border border-gray-200 dark:border-gray-700 px-3 py-1.5 bg-white dark:bg-gray-800 text-gray-900 dark:text-white font-medium focus:ring-1 focus:ring-[#00A9A1] dark:focus:ring-[#00C4BB] focus:outline-none text-xs"
                >
                  {UNIDADES_VOX.map((u) => (
                    <option key={u} value={u}>
                      {u}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Etapa & Canal de Origem */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1 text-[11px]">Etapa Inicial *</label>
              <select
                value={etapa}
                onChange={(e) => setEtapa(e.target.value as EtapaProcesso)}
                className="w-full rounded-md border border-gray-200 dark:border-gray-700 px-3 py-1.5 bg-white dark:bg-gray-800 text-gray-900 dark:text-white font-medium focus:ring-1 focus:ring-[#00A9A1] dark:focus:ring-[#00C4BB] focus:outline-none text-xs"
              >
                {ETAPAS_KANBAN.map((et) => (
                  <option key={et} value={et}>
                    {et}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1 text-[11px]">Canal de Origem</label>
              <select
                value={origemCv}
                onChange={(e) => setOrigemCv(e.target.value)}
                className="w-full rounded-md border border-gray-200 dark:border-gray-700 px-3 py-1.5 bg-white dark:bg-gray-800 text-gray-900 dark:text-white font-medium focus:ring-1 focus:ring-[#00A9A1] dark:focus:ring-[#00C4BB] focus:outline-none text-xs"
              >
                {CANAIS_DIVULGACAO.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Links do Currículo & Vídeo */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1 text-[11px]">Link do Currículo (PDF/Drive)</label>
              <input
                type="url"
                placeholder="https://..."
                value={curriculoUrl}
                onChange={(e) => setCurriculoUrl(e.target.value)}
                className="w-full rounded-md border border-gray-200 dark:border-gray-700 px-3 py-1.5 text-gray-900 dark:text-white bg-white dark:bg-gray-800 focus:ring-1 focus:ring-[#00A9A1] dark:focus:ring-[#00C4BB] focus:outline-none"
              />
            </div>
            <div>
              <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1 text-[11px]">Link do Vídeo Pitch (Opcional)</label>
              <input
                type="url"
                placeholder="https://..."
                value={videoUrl}
                onChange={(e) => setVideoUrl(e.target.value)}
                className="w-full rounded-md border border-gray-200 dark:border-gray-700 px-3 py-1.5 text-gray-900 dark:text-white bg-white dark:bg-gray-800 focus:ring-1 focus:ring-[#00A9A1] dark:focus:ring-[#00C4BB] focus:outline-none"
              />
            </div>
          </div>

          {/* Notas Iniciais */}
          <div>
            <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1 text-[11px]">Observações Iniciais</label>
            <textarea
              rows={2}
              placeholder="Anotações da triagem inicial..."
              value={notas}
              onChange={(e) => setNotas(e.target.value)}
              className="w-full rounded-md border border-gray-200 dark:border-gray-700 px-3 py-1.5 text-gray-900 dark:text-white bg-white dark:bg-gray-800 focus:ring-1 focus:ring-[#00A9A1] dark:focus:ring-[#00C4BB] focus:outline-none"
            />
          </div>

          {/* Submit */}
          <div className="flex items-center justify-end gap-2 pt-3 border-t border-gray-100 dark:border-gray-700">
            <button
              type="button"
              onClick={onClose}
              className="rounded-md border border-gray-200 dark:border-gray-700 px-3.5 py-1.5 font-semibold text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 text-xs"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="rounded-md bg-[#00A9A1] hover:bg-[#008f88] dark:bg-[#00A9A1] dark:hover:bg-[#00C4BB] px-4 py-1.5 font-bold text-white shadow-xs text-xs active:scale-[0.98] transition-all"
            >
              Cadastrar Candidato
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
