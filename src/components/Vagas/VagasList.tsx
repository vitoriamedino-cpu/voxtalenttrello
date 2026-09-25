import React, { useState, useMemo, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { Vaga, UnidadeVox, StatusVaga, Candidato } from '../../types';
import { UNIDADES_VOX, CARGOS_PRESET, STATUS_VAGA } from '../../lib/rsConstants';
import { calculateVagaSLA, formatCurrency, formatDateBR } from '../../lib/formatters';
import {
  Briefcase,
  Plus,
  Search,
  Filter,
  Clock,
  AlertTriangle,
  Users,
  Edit2,
  Trash2,
  MapPin,
  CheckCircle2,
  XCircle,
  PauseCircle,
  Slash,
  Calendar,
  CalendarCheck,
  UserCheck,
  History,
  PhoneCall,
  Video,
  ExternalLink,
  MessageCircle,
  Printer,
  Sparkles,
} from 'lucide-react';

interface VagaModalProps {
  vagaId: string | null;
  isOpen: boolean;
  onClose: () => void;
}

export const VagaModal: React.FC<VagaModalProps> = ({ vagaId, isOpen, onClose }) => {
  const { vagas, addVaga, updateVaga, deleteVaga, config } = useApp();
  const existingVaga = vagas.find((v) => v.id === vagaId);

  // Form State with Audit Fix #4: structured `cargo`
  const [titulo, setTitulo] = useState(existingVaga?.titulo || '');
  const [cargo, setCargo] = useState(existingVaga?.cargo || 'Professor');
  const [customCargo, setCustomCargo] = useState('');
  const [unidade, setUnidade] = useState<UnidadeVox>(existingVaga?.unidade || 'Vox Cidade Verde');
  const [status, setStatus] = useState<StatusVaga>(existingVaga?.status || 'Em aberto');
  const [dataAbertura, setDataAbertura] = useState(
    existingVaga?.data_abertura || new Date().toISOString().split('T')[0]
  );
  const [metaSlaDias, setMetaSlaDias] = useState<number>(
    existingVaga?.meta_sla_dias || config.sla_padrao['Professor'] || 30
  );
  const [prioridade, setPrioridade] = useState(existingVaga?.prioridade || 'Média');
  const [regime, setRegime] = useState(existingVaga?.regime || 'CLT');
  const [salarioRange, setSalarioRange] = useState(existingVaga?.salario_range || '');
  const [descricao, setDescricao] = useState(existingVaga?.descricao || '');
  const [responsavel, setResponsavel] = useState(existingVaga?.responsavel || '');
  const [quantidadeVagas, setQuantidadeVagas] = useState(existingVaga?.quantidade_vagas || 1);
useEffect(() => {
  if (!isOpen) return;

  setTitulo(existingVaga?.titulo || '');
  setCargo(existingVaga?.cargo || 'Professor');
  setCustomCargo('');
  setUnidade(existingVaga?.unidade || 'Vox Cidade Verde');
  setStatus(existingVaga?.status || 'Em aberto');
  setDataAbertura(
    existingVaga?.data_abertura ||
      new Date().toISOString().split('T')[0]
  );
  setMetaSlaDias(
    existingVaga?.meta_sla_dias ||
      config.sla_padrao[existingVaga?.cargo || 'Professor'] ||
      30
  );
  setPrioridade(existingVaga?.prioridade || 'Média');
  setRegime(existingVaga?.regime || 'CLT');
  setSalarioRange(existingVaga?.salario_range || '');
  setDescricao(existingVaga?.descricao || '');
  setResponsavel(existingVaga?.responsavel || '');
  setQuantidadeVagas(existingVaga?.quantidade_vagas || 1);
}, [vagaId, isOpen, existingVaga, config.sla_padrao]);

  if (!isOpen) return null;

  // Set SLA based on chosen cargo if creating new
  const handleCargoChange = (newCargo: string) => {
    setCargo(newCargo);
    if (!existingVaga) {
      const defaultSla = config.sla_padrao[newCargo] || config.sla_padrao['Geral'] || 30;
      setMetaSlaDias(defaultSla);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const finalCargo = cargo === 'Outro' ? customCargo : cargo;

    if (!titulo.trim() || !finalCargo.trim() || !unidade) {
      alert('Preencha os campos obrigatórios: Título, Cargo e Unidade Vox.');
      return;
    }

    if (existingVaga) {
      updateVaga(existingVaga.id, {
        titulo,
        cargo: finalCargo,
        unidade,
        status,
        data_abertura: dataAbertura,
        meta_sla_dias: metaSlaDias,
        prioridade,
        regime,
        salario_range: salarioRange,
        descricao,
        responsavel,
        quantidade_vagas: quantidadeVagas,
      });
    } else {
      addVaga({
        titulo,
        cargo: finalCargo,
        unidade,
        status,
        data_abertura: dataAbertura,
        meta_sla_dias: metaSlaDias,
        prioridade,
        regime,
        salario_range: salarioRange,
        descricao,
        responsavel,
        quantidade_vagas: quantidadeVagas,
      });
    }

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 dark:bg-black/70 backdrop-blur-xs p-4 overflow-y-auto">
      <div
        id="vaga-form-modal"
        className="relative w-full max-w-2xl rounded-xl bg-white dark:bg-gray-800 shadow-xl border border-gray-200 dark:border-gray-700 p-5 animate-in fade-in zoom-in-95 duration-150"
      >
        <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-700 pb-3 mb-3">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded bg-[#00A9A1] dark:bg-[#00C4BB] text-white dark:text-gray-950 shadow-xs">
              <Briefcase className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-gray-900 dark:text-white">
                {existingVaga ? 'Editar Vaga' : 'Nova Vaga de Processo Seletivo'}
              </h3>
              <p className="text-[11px] text-gray-500 dark:text-gray-400">Fluxo de R&S Vox2you</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-600 dark:hover:text-gray-200"
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
          {/* Título da Vaga */}
          <div>
            <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1 text-[11px]">Título da Vaga *</label>
            <input
              type="text"
              required
              placeholder="Ex: Professor de Oratória & Liderança"
              value={titulo}
              onChange={(e) => setTitulo(e.target.value)}
              className="w-full rounded-md border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white px-3 py-1.5 text-xs focus:ring-1 focus:ring-[#00A9A1] dark:focus:ring-[#00C4BB] focus:outline-none"
            />
          </div>

          {/* Audit Fix #4: Campo Cargo estruturado e obrigatório com presets */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1 text-[11px]">
                Cargo Estruturado (POP) *
              </label>
              <select
                required
                value={cargo}
                onChange={(e) => handleCargoChange(e.target.value)}
                className="w-full rounded-md border border-gray-200 dark:border-gray-700 px-3 py-1.5 bg-white dark:bg-gray-800 text-gray-900 dark:text-white font-medium focus:ring-1 focus:ring-[#00A9A1] dark:focus:ring-[#00C4BB] focus:outline-none text-xs"
              >
                {CARGOS_PRESET.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
                <option value="Outro">Outro cargo...</option>
              </select>
              {cargo === 'Outro' && (
                <input
                  type="text"
                  required
                  placeholder="Especifique o cargo..."
                  value={customCargo}
                  onChange={(e) => setCustomCargo(e.target.value)}
                  className="w-full mt-2 rounded-md border border-gray-200 dark:border-gray-700 px-3 py-1.5 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-1 focus:ring-[#00A9A1] dark:focus:ring-[#00C4BB] focus:outline-none text-xs"
                />
              )}
            </div>

            {/* Unidade Vox (Obrigatório) */}
            <div>
              <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1 text-[11px]">Unidade Vox (Obrigatório) *</label>
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

          {/* Audit Fix #1: Status com "Cancelada" incluído */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1 text-[11px]">Status da Vaga *</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as StatusVaga)}
                className="w-full rounded-md border border-gray-200 dark:border-gray-700 px-3 py-1.5 bg-white dark:bg-gray-800 text-gray-900 dark:text-white font-medium focus:ring-1 focus:ring-[#00A9A1] dark:focus:ring-[#00C4BB] focus:outline-none text-xs"
              >
                {STATUS_VAGA.map((st) => (
                  <option key={st} value={st}>
                    {st === 'Cancelada' ? '❌ Cancelada' : st === 'Fechada' ? '✅ Fechada' : st}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1 text-[11px]">Data de Abertura *</label>
              <input
                type="date"
                required
                value={dataAbertura}
                onChange={(e) => setDataAbertura(e.target.value)}
                className="w-full rounded-md border border-gray-200 dark:border-gray-700 px-3 py-1.5 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-1 focus:ring-[#00A9A1] dark:focus:ring-[#00C4BB] focus:outline-none text-xs"
              />
            </div>

            <div>
              <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1 text-[11px]">Meta SLA (Dias) *</label>
              <input
                type="number"
                min="1"
                max="120"
                required
                value={metaSlaDias}
                onChange={(e) => setMetaSlaDias(Number(e.target.value))}
                className="w-full rounded-md border border-gray-200 dark:border-gray-700 px-3 py-1.5 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-1 focus:ring-[#00A9A1] dark:focus:ring-[#00C4BB] focus:outline-none text-xs"
              />
            </div>
          </div>

          {/* Regime, Prioridade, Salário */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1 text-[11px]">Regime</label>
              <select
                value={regime}
                onChange={(e) => setRegime(e.target.value as any)}
                className="w-full rounded-md border border-gray-200 dark:border-gray-700 px-3 py-1.5 bg-white dark:bg-gray-800 text-gray-900 dark:text-white font-medium focus:ring-1 focus:ring-[#00A9A1] dark:focus:ring-[#00C4BB] focus:outline-none text-xs"
              >
                <option value="CLT">CLT</option>
                <option value="PJ">PJ</option>
                <option value="Estágio">Estágio</option>
                <option value="Freelancer">Freelancer</option>
              </select>
            </div>

            <div>
              <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1 text-[11px]">Prioridade</label>
              <select
                value={prioridade}
                onChange={(e) => setPrioridade(e.target.value as any)}
                className="w-full rounded-md border border-gray-200 dark:border-gray-700 px-3 py-1.5 bg-white dark:bg-gray-800 text-gray-900 dark:text-white font-medium focus:ring-1 focus:ring-[#00A9A1] dark:focus:ring-[#00C4BB] focus:outline-none text-xs"
              >
                <option value="Baixa">Baixa</option>
                <option value="Média">Média</option>
                <option value="Alta">Alta</option>
                <option value="Urgente">🚨 Urgente</option>
              </select>
            </div>

            <div>
              <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1 text-[11px]">Faixa Salarial</label>
              <input
                type="text"
                placeholder="Ex: R$ 3.000 - R$ 4.500"
                value={salarioRange}
                onChange={(e) => setSalarioRange(e.target.value)}
                className="w-full rounded-md border border-gray-200 dark:border-gray-700 px-3 py-1.5 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-1 focus:ring-[#00A9A1] dark:focus:ring-[#00C4BB] focus:outline-none text-xs"
              />
            </div>
          </div>

          {/* Descrição e Responsável */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1 text-[11px]">Recrutador Responsável</label>
              <input
                type="text"
                placeholder="Ex: Vitória Medino"
                value={responsavel}
                onChange={(e) => setResponsavel(e.target.value)}
                className="w-full rounded-md border border-gray-200 dark:border-gray-700 px-3 py-1.5 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-1 focus:ring-[#00A9A1] dark:focus:ring-[#00C4BB] focus:outline-none text-xs"
              />
            </div>
            <div>
              <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1 text-[11px]">Vagas em Aberto (Qtd)</label>
              <input
                type="number"
                min="1"
                max="20"
                value={quantidadeVagas}
                onChange={(e) => setQuantidadeVagas(Number(e.target.value))}
                className="w-full rounded-md border border-gray-200 dark:border-gray-700 px-3 py-1.5 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-1 focus:ring-[#00A9A1] dark:focus:ring-[#00C4BB] focus:outline-none text-xs"
              />
            </div>
          </div>

          <div>
            <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1 text-[11px]">Descrição / Requisitos</label>
            <textarea
              rows={2}
              placeholder="Principais atribuições e competências esperadas..."
              value={descricao}
              onChange={(e) => setDescricao(e.target.value)}
              className="w-full rounded-md border border-gray-200 dark:border-gray-700 px-3 py-1.5 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-1 focus:ring-[#00A9A1] dark:focus:ring-[#00C4BB] focus:outline-none text-xs"
            />
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-between pt-3 border-t border-gray-100 dark:border-gray-700">
            {existingVaga ? (
              <button
                type="button"
                onClick={() => {
                  if (confirm(`Excluir vaga "${existingVaga.titulo}"?`)) {
                    deleteVaga(existingVaga.id);
                    onClose();
                  }
                }}
                className="inline-flex items-center gap-1 text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 font-semibold text-xs"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Excluir Vaga
              </button>
            ) : (
              <span />
            )}

            <div className="flex items-center gap-2">
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
                {existingVaga ? 'Salvar Alterações' : 'Criar Vaga'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export const VagasList: React.FC = () => {
  const {
    vagas,
    candidatos,
    setVagaModalId,
    setIsNewVagaOpen,
    selectedUnidade,
    setSelectedUnidade,
    setCandidateModalId,
    setWhatsAppModalCandidate,
    setCandidatePdfModalId,
  } = useApp();

  const [activeTab, setActiveTab] = useState<'vagas_sla' | 'entrevistas_rh'>('vagas_sla');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('TODOS');
  const [rhTypeFilter, setRhTypeFilter] = useState<'TODOS' | 'Coletiva' | 'Individual'>('TODOS');
  const [rhStatusFilter, setRhStatusFilter] = useState<'TODOS' | 'Agendada' | 'Realizada' | 'Ausente'>('TODOS');

  // Filtered Vagas
  const filteredVagas = vagas.filter((v) => {
    if (selectedUnidade !== 'TODAS' && v.unidade !== selectedUnidade) return false;
    if (statusFilter !== 'TODOS' && v.status !== statusFilter) return false;
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      const matchTit = v.titulo.toLowerCase().includes(term);
      const matchCargo = v.cargo.toLowerCase().includes(term);
      const matchUnid = v.unidade.toLowerCase().includes(term);
      if (!matchTit && !matchCargo && !matchUnid) return false;
    }
    return true;
  });

  // Calculate RH Interviews (Strictly RH: Coletiva e Individual pelo RH)
  const rhInterviewRecords = useMemo(() => {
    return candidatos
      .map((c) => {
        // Entrevista coletiva pelo RH
        const isColetiva =
          c.etapa_processo === 'Entrevista Coletiva (RH)' ||
          c.historico_etapas?.some(
            (h) => h.etapa === 'Entrevista Coletiva (RH)'
          );

        // Entrevista individual pelo RH
        const isIndividualRH =
          !isColetiva &&
          (c.etapa_processo === 'Entrevista Individual (RH)' ||
            c.etapa_processo === '1º Contato' ||
            !!c.data_entrevista);

        // Se não houver nenhuma indicação de entrevista RH, ignora
        if (!isColetiva && !isIndividualRH) {
          return null;
        }

        // Gestor/Diretoria entram apenas se houver histórico de entrevista RH
        if (
          c.etapa_processo === 'Gestor' ||
          c.etapa_processo === 'Diretoria'
        ) {
          const hadRHHistory = c.historico_etapas?.some(
            (h) =>
              h.etapa === 'Entrevista Coletiva (RH)' ||
              h.etapa === 'Entrevista Individual (RH)' ||
              h.etapa === '1º Contato'
          );

          if (!hadRHHistory) return null;
        }

        const interviewType: 'Coletiva' | 'Individual' =
          isColetiva ? 'Coletiva' : 'Individual';

        // Interview Status
        let interviewStatus: 'Agendada' | 'Realizada' | 'Ausente' = 'Agendada';

        if (c.status === 'Ausente') {
          interviewStatus = 'Ausente';
        } else if (
          c.status === 'Aprovado' ||
          c.etapa_processo === 'Etapa Prática' ||
          c.etapa_processo === 'Gestor' ||
          c.etapa_processo === 'Diretoria' ||
          (c.historico_etapas && c.historico_etapas.length > 2)
        ) {
          interviewStatus = 'Realizada';
        } else if (c.data_entrevista) {
          interviewStatus = 'Agendada';
        }

        const vaga = vagas.find((v) => v.id === c.vaga_id);

        return {
          candidato: c,
          vaga,
          type: interviewType,
          status: interviewStatus,
          data: c.data_entrevista || c.atualizado_em || c.criado_em,
          hora: c.hora_entrevista || '14:00',
          meetLink: c.google_meet_link,
          responsavelRH: 'RH Vox2you',
          observacoes:
            c.notas_entrevista ||
            'Entrevista realizada pelo setor de R&S.',
        };
      })
      .filter((rec): rec is NonNullable<typeof rec> => rec !== null);
  }, [candidatos, vagas]);

  // Filtered RH interview records
  const filteredRHInterviews = useMemo(() => {
    return rhInterviewRecords.filter((item) => {
      if (selectedUnidade !== 'TODAS' && item.candidato.unidade !== selectedUnidade) return false;
      if (rhTypeFilter !== 'TODOS' && item.type !== rhTypeFilter) return false;
      if (rhStatusFilter !== 'TODOS' && item.status !== rhStatusFilter) return false;
      if (searchTerm.trim()) {
        const term = searchTerm.toLowerCase();
        const matchName = item.candidato.nome.toLowerCase().includes(term);
        const matchJob = item.candidato.vaga_titulo.toLowerCase().includes(term);
        const matchObs = item.observacoes.toLowerCase().includes(term);
        if (!matchName && !matchJob && !matchObs) return false;
      }
      return true;
    });
  }, [rhInterviewRecords, selectedUnidade, rhTypeFilter, rhStatusFilter, searchTerm]);

  // Aggregated RH totals
  const totalColetivasRH = rhInterviewRecords.filter((r) => r.type === 'Coletiva').length;
  const totalIndividuaisRH = rhInterviewRecords.filter((r) => r.type === 'Individual').length;
  const totalRHInterviews = rhInterviewRecords.length;
  const totalRealizadasRH = rhInterviewRecords.filter((r) => r.status === 'Realizada').length;

  return (
    <div className="space-y-3.5">
      {/* Top Header with Tab Switcher */}
      <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-4 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <Briefcase className="w-4 h-4 text-[#00A9A1] dark:text-[#00C4BB]" />
              Gestão de Vagas, Controle de SLA & Histórico de Entrevistas
            </h2>
            <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5">
              Acompanhamento de SLA, metas por cargo e histórico consolidado de entrevistas conduzidas pelo RH.
            </p>
          </div>

          <div className="flex items-center gap-2">
            {/* Tab Switcher */}
            <div className="flex items-center rounded-lg bg-gray-100 dark:bg-gray-700/80 p-1 border border-gray-200 dark:border-gray-600">
              <button
                type="button"
                id="tab-vagas-sla"
                onClick={() => setActiveTab('vagas_sla')}
                className={`inline-flex items-center gap-1.5 px-3 py-1 text-xs font-bold rounded-md transition-all ${
                  activeTab === 'vagas_sla'
                    ? 'bg-white dark:bg-gray-800 text-[#00A9A1] dark:text-[#00C4BB] shadow-xs'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                <Briefcase className="w-3.5 h-3.5" />
                <span>Vagas & SLA ({vagas.length})</span>
              </button>

              <button
                type="button"
                id="tab-historico-entrevistas-rh"
                onClick={() => setActiveTab('entrevistas_rh')}
                className={`inline-flex items-center gap-1.5 px-3 py-1 text-xs font-bold rounded-md transition-all ${
                  activeTab === 'entrevistas_rh'
                    ? 'bg-white dark:bg-gray-800 text-[#00A9A1] dark:text-[#00C4BB] shadow-xs'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                <History className="w-3.5 h-3.5" />
                <span>Histórico Entrevistas RH ({totalRHInterviews})</span>
              </button>
            </div>

            {activeTab === 'vagas_sla' && (
              <button
                id="btn-nova-vaga"
                type="button"
                onClick={() => setIsNewVagaOpen(true)}
                className="inline-flex items-center gap-1.5 rounded-md bg-[#00A9A1] hover:bg-[#008f88] dark:bg-[#00A9A1] dark:hover:bg-[#00C4BB] px-3 py-1.5 text-xs font-bold text-white shadow-xs active:scale-[0.98] transition-all"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Abrir Nova Vaga</span>
              </button>
            )}
          </div>
        </div>

        {/* RH Interview KPI Cards when on Histórico tab or as summary bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mt-3.5 pt-3 border-t border-gray-100 dark:border-gray-700">
          <div className="p-2.5 rounded-lg bg-teal-50/60 dark:bg-teal-950/40 border border-teal-200/80 dark:border-teal-800/80">
            <div className="flex items-center justify-between text-[11px] text-teal-800 dark:text-teal-300 font-semibold">
              <span>Total Entrevistas RH</span>
              <Users className="w-3.5 h-3.5 text-[#00A9A1]" />
            </div>
            <div className="text-lg font-black text-gray-900 dark:text-white mt-1">
              {totalRHInterviews}
            </div>
            <span className="text-[9px] text-teal-700 dark:text-teal-400 font-medium">
              Conduzidas pelo setor de RH
            </span>
          </div>

          <div className="p-2.5 rounded-lg bg-indigo-50/60 dark:bg-indigo-950/40 border border-indigo-200/80 dark:border-indigo-800/80">
            <div className="flex items-center justify-between text-[11px] text-indigo-800 dark:text-indigo-300 font-semibold">
              <span>Entrevistas Coletivas (RH)</span>
              <Users className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
            </div>
            <div className="text-lg font-black text-gray-900 dark:text-white mt-1">
              {totalColetivasRH}
            </div>
            <span className="text-[9px] text-indigo-700 dark:text-indigo-400 font-medium">
              Dinâmicas em grupo
            </span>
          </div>

          <div className="p-2.5 rounded-lg bg-sky-50/60 dark:bg-sky-950/40 border border-sky-200/80 dark:border-sky-800/80">
            <div className="flex items-center justify-between text-[11px] text-sky-800 dark:text-sky-300 font-semibold">
              <span>Entrevistas Individuais (RH)</span>
              <PhoneCall className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400" />
            </div>
            <div className="text-lg font-black text-gray-900 dark:text-white mt-1">
              {totalIndividuaisRH}
            </div>
            <span className="text-[9px] text-sky-700 dark:text-sky-400 font-medium">
              1º Contato / Triagem RH
            </span>
          </div>

          <div className="p-2.5 rounded-lg bg-emerald-50/60 dark:bg-emerald-950/40 border border-emerald-200/80 dark:border-emerald-800/80">
            <div className="flex items-center justify-between text-[11px] text-emerald-800 dark:text-emerald-300 font-semibold">
              <span>Realizadas / Concluídas</span>
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div className="text-lg font-black text-gray-900 dark:text-white mt-1">
              {totalRealizadasRH}
            </div>
            <span className="text-[9px] text-emerald-700 dark:text-emerald-400 font-medium">
              {totalRHInterviews > 0 ? `${Math.round((totalRealizadasRH / totalRHInterviews) * 100)}% de taxa` : '0%'}
            </span>
          </div>
        </div>

        {/* Filters Area */}
        <div className="flex flex-wrap items-center gap-2.5 mt-3.5 pt-3 border-t border-gray-100 dark:border-gray-700 text-xs">
          <div className="relative min-w-[200px] flex-1 max-w-xs">
            <Search className="w-3.5 h-3.5 text-gray-400 dark:text-gray-500 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder={activeTab === 'vagas_sla' ? 'Buscar por título, cargo ou unidade...' : 'Buscar por candidato, vaga ou observação...'}
              className="w-full pl-8 pr-2.5 py-1.5 rounded-md border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-xs focus:ring-1 focus:ring-[#00A9A1] dark:focus:ring-[#00C4BB] focus:outline-none"
            />
          </div>

          <select
            value={selectedUnidade}
            onChange={(e) => setSelectedUnidade(e.target.value)}
            className="py-1.5 px-2.5 rounded-md border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 font-medium text-gray-700 dark:text-gray-200 focus:ring-1 focus:ring-[#00A9A1] dark:focus:ring-[#00C4BB] text-xs"
          >
            <option value="TODAS">Todas as Unidades</option>
            {UNIDADES_VOX.map((u) => (
              <option key={u} value={u}>
                {u}
              </option>
            ))}
          </select>

          {activeTab === 'vagas_sla' ? (
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="py-1.5 px-2.5 rounded-md border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 font-medium text-gray-700 dark:text-gray-200 focus:ring-1 focus:ring-[#00A9A1] dark:focus:ring-[#00C4BB] text-xs"
            >
              <option value="TODOS">Todos os Status</option>
              <option value="Em aberto">Em aberto</option>
              <option value="Congelada">Congelada</option>
              <option value="Fechada">Fechada</option>
              <option value="Cancelada">Cancelada</option>
            </select>
          ) : (
            <>
              <select
                value={rhTypeFilter}
                onChange={(e) => setRhTypeFilter(e.target.value as any)}
                className="py-1.5 px-2.5 rounded-md border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 font-medium text-gray-700 dark:text-gray-200 focus:ring-1 focus:ring-[#00A9A1] dark:focus:ring-[#00C4BB] text-xs"
              >
                <option value="TODOS">Todos os Tipos de Entrevista RH</option>
                <option value="Coletiva">👥 Entrevista Coletiva (RH)</option>
                <option value="Individual">👤 Entrevista Individual (RH)</option>
              </select>

              <select
                value={rhStatusFilter}
                onChange={(e) => setRhStatusFilter(e.target.value as any)}
                className="py-1.5 px-2.5 rounded-md border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 font-medium text-gray-700 dark:text-gray-200 focus:ring-1 focus:ring-[#00A9A1] dark:focus:ring-[#00C4BB] text-xs"
              >
                <option value="TODOS">Todos os Status</option>
                <option value="Agendada">📅 Agendada</option>
                <option value="Realizada">✅ Realizada</option>
                <option value="Ausente">⚠️ Ausente</option>
              </select>
            </>
          )}
        </div>
      </div>

      {/* Main View Area: Either Vagas Table OR RH Interview History */}
      {activeTab === 'vagas_sla' ? (
        /* Vagas Table with Audit Fix #1 distinct styling for Cancelada vs Fechada */
        <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-gray-600 dark:text-gray-300">
              <thead className="bg-gray-50 dark:bg-gray-850 border-b border-gray-200 dark:border-gray-700 text-[10px] font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                <tr>
                  <th className="px-4 py-2.5">Título & Cargo</th>
                  <th className="px-3 py-2.5">Unidade</th>
                  <th className="px-3 py-2.5">Status</th>
                  <th className="px-3 py-2.5">Candidatos</th>
                  <th className="px-3 py-2.5">SLA & Prazos</th>
                  <th className="px-3 py-2.5">Responsável</th>
                  <th className="px-4 py-2.5 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                {filteredVagas.map((v) => {
                  const candsVaga = candidatos.filter((c) => c.vaga_id === v.id);
                  const ativos = candsVaga.filter((c) => c.status === 'Em andamento').length;
                  const sla = calculateVagaSLA(v.data_abertura, v.meta_sla_dias);

                  const isCancelada = v.status === 'Cancelada';
                  const isFechada = v.status === 'Fechada';
                  const isCongelada = v.status === 'Congelada';
                  const isEmAberto = v.status === 'Em aberto';

                  return (
                    <tr
                      key={v.id}
                      className={`hover:bg-gray-50/70 dark:hover:bg-gray-750 transition-colors ${
                        isCancelada ? 'bg-gray-50/50 dark:bg-gray-850/50' : ''
                      }`}
                    >
                      {/* Título & Cargo */}
                      <td className="px-4 py-3">
                        <div>
                          <span
                            className={`font-bold text-xs ${
                              isCancelada
                                ? 'text-gray-400 dark:text-gray-500 line-through'
                                : isFechada
                                ? 'text-gray-700 dark:text-gray-300'
                                : 'text-gray-900 dark:text-white'
                            }`}
                          >
                            {v.titulo}
                          </span>
                          <div className="flex items-center gap-1.5 mt-0.5">
                            <span className="inline-block rounded bg-teal-50 dark:bg-teal-950/60 px-1 py-0.2 text-[9px] font-bold text-[#00A9A1] dark:text-[#00C4BB]">
                              {v.cargo}
                            </span>
                            <span className="text-[10px] text-gray-400 dark:text-gray-400">
                              {v.regime} • {v.prioridade}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Unidade */}
                      <td className="px-3 py-3 font-medium text-gray-800 dark:text-gray-200">
                        <div className="flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-[#00A9A1] dark:text-[#00C4BB]" />
                          <span className="text-xs">{v.unidade.replace('Vox ', '')}</span>
                        </div>
                      </td>

                      {/* Status Badge */}
                      <td className="px-3 py-3">
                        {isCancelada ? (
                          <span className="inline-flex items-center gap-1 rounded bg-gray-100 dark:bg-gray-700 px-2 py-0.5 text-[10px] font-bold text-gray-500 dark:text-gray-400 line-through border border-gray-200 dark:border-gray-600">
                            <Slash className="w-2.5 h-2.5" />
                            Cancelada
                          </span>
                        ) : isFechada ? (
                          <span className="inline-flex items-center gap-1 rounded bg-emerald-50 dark:bg-emerald-950/50 px-2 py-0.5 text-[10px] font-bold text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                            <CheckCircle2 className="w-2.5 h-2.5" />
                            Fechada
                          </span>
                        ) : isCongelada ? (
                          <span className="inline-flex items-center gap-1 rounded bg-amber-50 dark:bg-amber-950/50 px-2 py-0.5 text-[10px] font-bold text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
                            <PauseCircle className="w-2.5 h-2.5" />
                            Congelada
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 rounded bg-teal-50 dark:bg-teal-950/50 px-2 py-0.5 text-[10px] font-bold text-teal-700 dark:text-teal-300 border border-teal-200 dark:border-teal-800">
                            🟢 Aberto
                          </span>
                        )}
                      </td>

                      {/* Candidatos */}
                      <td className="px-3 py-3">
                        <div className="font-semibold text-gray-800 dark:text-gray-200 text-xs">
                          {ativos} ativos / {candsVaga.length} total
                        </div>
                        <span className="text-[10px] text-gray-400 dark:text-gray-400">
                          {candsVaga.filter((c) => c.status === 'Aprovado').length} aprovados
                        </span>
                      </td>

                      {/* SLA Calculation */}
                      <td className="px-3 py-3">
                        <div className="flex items-center gap-1.5">
                          <div className="w-20 bg-gray-100 dark:bg-gray-700 rounded-full h-1.5 overflow-hidden">
                            <div
                              className={`h-full rounded-full ${
                                sla.isOverSla && isEmAberto
                                  ? 'bg-red-500'
                                  : sla.percent > 75
                                  ? 'bg-amber-500'
                                  : 'bg-[#00A9A1] dark:bg-[#00C4BB]'
                              }`}
                              style={{ width: `${sla.percent}%` }}
                            />
                          </div>
                          <span className="text-[10px] font-bold text-gray-700 dark:text-gray-300">
                            {sla.diasAbertos}d / {sla.metaSla}d
                          </span>
                        </div>
                        {sla.isOverSla && isEmAberto ? (
                          <span className="inline-flex items-center gap-0.5 text-[9px] font-bold text-red-600 dark:text-red-400 mt-0.5">
                            <AlertTriangle className="w-2.5 h-2.5" /> Estourado (+{sla.diasAbertos - sla.metaSla}d)
                          </span>
                        ) : (
                          <span className="text-[9px] text-gray-400 dark:text-gray-400">
                            Aberta {formatDateBR(v.data_abertura)}
                          </span>
                        )}
                      </td>

                      {/* Responsável */}
                      <td className="px-3 py-3 text-gray-700 dark:text-gray-300 font-medium text-xs">
                        {v.responsavel || 'Equipe R&S'}
                      </td>

                      {/* Ações */}
                      <td className="px-4 py-3 text-right">
                        <button
                          type="button"
                          onClick={() => setVagaModalId(v.id)}
                          className="inline-flex items-center gap-1 rounded border border-gray-200 dark:border-gray-700 px-2 py-1 text-[11px] font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 shadow-xs transition-colors"
                        >
                          <Edit2 className="w-3 h-3" />
                          <span>Editar</span>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* Histórico de Entrevistas do RH */
        <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-xs overflow-hidden">
          <div className="p-3 bg-gray-50/70 dark:bg-gray-850 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <History className="w-4 h-4 text-[#00A9A1] dark:text-[#00C4BB]" />
              <span className="text-xs font-bold text-gray-800 dark:text-gray-200">
                Histórico Consolidado de Entrevistas do RH ({filteredRHInterviews.length} registros)
              </span>
            </div>
            <span className="text-[10px] text-indigo-700 dark:text-indigo-300 font-semibold bg-indigo-50 dark:bg-indigo-950/60 px-2 py-0.5 rounded border border-indigo-100 dark:border-indigo-800">
              Exclusivo Entrevistas RH (Coletivas & Individuais) • Gestores e Diretoria Excluídos
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-gray-600 dark:text-gray-300">
              <thead className="bg-gray-50/50 dark:bg-gray-850 border-b border-gray-200 dark:border-gray-700 text-[10px] font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                <tr>
                  <th className="px-4 py-2.5">Candidato & Vaga</th>
                  <th className="px-3 py-2.5">Unidade</th>
                  <th className="px-3 py-2.5">Tipo de Entrevista</th>
                  <th className="px-3 py-2.5">Data & Horário</th>
                  <th className="px-3 py-2.5">Status</th>
                  <th className="px-3 py-2.5">Considerações RH</th>
                  <th className="px-4 py-2.5 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                {filteredRHInterviews.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-8 text-center text-gray-400 dark:text-gray-500">
                      Nenhuma entrevista do RH encontrada com os filtros selecionados.
                    </td>
                  </tr>
                ) : (
                  filteredRHInterviews.map((item) => (
                    <tr
                      key={item.candidato.id}
                      className="hover:bg-gray-50/70 dark:hover:bg-gray-750 transition-colors"
                    >
                      {/* Candidato & Vaga */}
                      <td className="px-4 py-3">
                        <div
                          className="cursor-pointer"
                          onClick={() => setCandidateModalId(item.candidato.id)}
                        >
                          <span className="font-bold text-xs text-gray-900 dark:text-white hover:text-[#00A9A1] transition-colors">
                            {item.candidato.nome}
                          </span>
                          <div className="text-[10px] text-gray-400 dark:text-gray-400 mt-0.5">
                            {item.candidato.vaga_titulo} • {item.candidato.telefone}
                          </div>
                        </div>
                      </td>

                      {/* Unidade */}
                      <td className="px-3 py-3 font-medium text-gray-800 dark:text-gray-200">
                        <div className="flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-[#00A9A1] dark:text-[#00C4BB]" />
                          <span className="text-xs">{item.candidato.unidade.replace('Vox ', '')}</span>
                        </div>
                      </td>

                      {/* Tipo de Entrevista RH */}
                      <td className="px-3 py-3">
                        {item.type === 'Coletiva' ? (
                          <span className="inline-flex items-center gap-1 rounded bg-indigo-50 dark:bg-indigo-950/60 px-2 py-0.5 text-[10px] font-bold text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                            <Users className="w-3 h-3" />
                            Coletiva (RH)
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 rounded bg-sky-50 dark:bg-sky-950/60 px-2 py-0.5 text-[10px] font-bold text-sky-700 dark:text-sky-300 border border-sky-200 dark:border-sky-800">
                            <PhoneCall className="w-3 h-3" />
                            Individual (RH)
                          </span>
                        )}
                      </td>

                      {/* Data & Horário */}
                      <td className="px-3 py-3">
                        <div className="flex items-center gap-1 font-semibold text-gray-800 dark:text-gray-200 text-xs">
                          <Calendar className="w-3 h-3 text-gray-400" />
                          <span>{formatDateBR(item.data)}</span>
                          <span className="text-gray-400">às {item.hora}</span>
                        </div>
                        {item.meetLink && (
                          <a
                            href={item.meetLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-[10px] font-bold text-[#00A9A1] dark:text-[#00C4BB] hover:underline mt-0.5"
                          >
                            <ExternalLink className="w-2.5 h-2.5" />
                            Link do Google Meet
                          </a>
                        )}
                      </td>

                      {/* Status */}
                      <td className="px-3 py-3">
                        {item.status === 'Realizada' ? (
                          <span className="inline-flex items-center gap-1 rounded bg-emerald-50 dark:bg-emerald-950/50 px-2 py-0.5 text-[10px] font-bold text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                            <CheckCircle2 className="w-2.5 h-2.5" />
                            Realizada
                          </span>
                        ) : item.status === 'Ausente' ? (
                          <span className="inline-flex items-center gap-1 rounded bg-amber-50 dark:bg-amber-950/50 px-2 py-0.5 text-[10px] font-bold text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
                            <AlertTriangle className="w-2.5 h-2.5" />
                            Ausente
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 rounded bg-teal-50 dark:bg-teal-950/50 px-2 py-0.5 text-[10px] font-bold text-teal-700 dark:text-teal-300 border border-teal-200 dark:border-teal-800">
                            <CalendarCheck className="w-2.5 h-2.5" />
                            Agendada
                          </span>
                        )}
                      </td>

                      {/* Considerações RH */}
                      <td className="px-3 py-3 max-w-[220px]">
                        <p className="text-[11px] text-gray-700 dark:text-gray-300 truncate" title={item.observacoes}>
                          {item.observacoes}
                        </p>
                      </td>

                      {/* Ações */}
                      <td className="px-4 py-3 text-right">
                        <div className="inline-flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => setWhatsAppModalCandidate(item.candidato)}
                            className="p-1 rounded text-teal-600 dark:text-teal-400 hover:bg-teal-50 dark:hover:bg-teal-950/50"
                            title="Disparar WhatsApp"
                          >
                            <MessageCircle className="w-3.5 h-3.5" />
                          </button>

                          <button
                            type="button"
                            onClick={() => setCandidatePdfModalId(item.candidato.id)}
                            className="p-1 rounded text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/50"
                            title="Gerar PDF da Ficha do Candidato"
                          >
                            <Printer className="w-3.5 h-3.5" />
                          </button>

                          <button
                            type="button"
                            onClick={() => setCandidateModalId(item.candidato.id)}
                            className="inline-flex items-center gap-1 rounded border border-gray-200 dark:border-gray-700 px-2 py-1 text-[11px] font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 shadow-xs transition-colors"
                          >
                            <span>Ver Ficha</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

