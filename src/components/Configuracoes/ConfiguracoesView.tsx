import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { useTheme } from '../../context/ThemeContext';
import { ContasAcessosTab } from './ContasAcessosTab';
import { POP_METADATA, POP_ATIVIDADES, ETAPAS_KANBAN } from '../../lib/rsConstants';
import { EtapaProcesso, UnidadeVoxInfo } from '../../types';
import { DEFAULT_STAGE_SLA_DAYS } from '../../lib/formatters';
import {
  Settings,
  ShieldCheck,
  Clock,
  Users,
  CheckCircle,
  RotateCcw,
  Sparkles,
  MapPin,
  HelpCircle,
  BookOpen,
  Building2,
  Calendar,
  Layers,
  FileCheck,
  Search,
  Sun,
  Moon,
  Monitor,
  KeyRound,
  AlertTriangle,
  Plus,
  Edit2,
  Trash2,
  X,
  Save,
} from 'lucide-react';

export const ConfiguracoesView: React.FC = () => {
  const { config, updateConfig, resetAllData, unidades, addUnidade, updateUnidade, deleteUnidade } = useApp();
  const { theme, setTheme, isDark } = useTheme();

  const [activeTab, setActiveTab] = useState<'parametros' | 'contas' | 'pop' | 'unidades'>('parametros');
  const [minColetiva, setMinColetiva] = useState(config.min_coletiva || 5);
  const [fluxoSimplificadoCargo, setFluxoSimplificadoCargo] = useState(
    config.fluxo_simplificado_cargo || 'Professor'
  );
  const [slaPadrao, setSlaPadrao] = useState(config.sla_padrao || {});
  const [slaEtapas, setSlaEtapas] = useState<Record<EtapaProcesso, number>>(
    config.sla_etapas_dias || DEFAULT_STAGE_SLA_DAYS
  );
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [searchTermUnit, setSearchTermUnit] = useState('');

  // Unit Modal Form State
  const [isUnitModalOpen, setIsUnitModalOpen] = useState(false);
  const [editingUnitKey, setEditingUnitKey] = useState<string | null>(null);
  const [unitFormData, setUnitFormData] = useState<UnidadeVoxInfo>({
    apelido: '',
    razaoSocial: '',
    endereco: '',
    cidade: '',
    uf: '',
    cnpj: '',
    gestor: '',
    telefone: '',
  });

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateConfig({
      min_coletiva: Number(minColetiva),
      fluxo_simplificado_cargo: fluxoSimplificadoCargo,
      sla_padrao: slaPadrao,
      sla_etapas_dias: slaEtapas,
    });
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  const handleSlaChange = (cargo: string, days: number) => {
    setSlaPadrao((prev) => ({
      ...prev,
      [cargo]: days,
    }));
  };

  const handleStageSlaChange = (etapa: EtapaProcesso, days: number) => {
    setSlaEtapas((prev) => ({
      ...prev,
      [etapa]: days,
    }));
  };

  // Open Add Unit Modal
  const handleOpenAddUnit = () => {
    setEditingUnitKey(null);
    setUnitFormData({
      apelido: '',
      razaoSocial: '',
      endereco: '',
      cidade: '',
      uf: '',
      cnpj: '',
      gestor: '',
      telefone: '',
    });
    setIsUnitModalOpen(true);
  };

  // Open Edit Unit Modal
  const handleOpenEditUnit = (unit: UnidadeVoxInfo) => {
    setEditingUnitKey(unit.apelido);
    setUnitFormData({ ...unit });
    setIsUnitModalOpen(true);
  };

  // Save Unit (Add or Edit)
  const handleSaveUnit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!unitFormData.apelido.trim()) {
      alert('Por favor, informe o apelido/nome da unidade.');
      return;
    }

    if (editingUnitKey) {
      updateUnidade(editingUnitKey, unitFormData);
    } else {
      addUnidade(unitFormData);
    }

    setIsUnitModalOpen(false);
  };

  // Delete Unit
  const handleDeleteUnit = (apelido: string) => {
    if (window.confirm(`Tem certeza que deseja excluir a unidade "${apelido}"?`)) {
      deleteUnidade(apelido);
    }
  };

  const filteredUnits = (unidades || []).filter((info) => {
    const term = searchTermUnit.toLowerCase();
    return (
      (info.apelido || '').toLowerCase().includes(term) ||
      (info.razaoSocial || '').toLowerCase().includes(term) ||
      (info.cidade || '').toLowerCase().includes(term) ||
      (info.uf || '').toLowerCase().includes(term) ||
      (info.cnpj || '').includes(term) ||
      (info.gestor || '').toLowerCase().includes(term)
    );
  });

  return (
    <div className="space-y-3.5 max-w-5xl">
      {/* Top Header */}
      <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-800/90 p-4 shadow-xs">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <Settings className="w-4 h-4 text-[#00A9A1] dark:text-[#00C4BB]" />
              Painel de Governança R&S, Contas, POP & Unidades
            </h2>
            <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5">
              Parâmetros operacionais, gestão de contas & níveis de acesso, Procedimento Operacional Padrão (POP Nº 1 v1.1) e gestão de Unidades.
            </p>
          </div>

          {/* Navigation Tabs */}
          <div className="flex items-center rounded-lg bg-gray-100 dark:bg-gray-700/60 p-1 gap-1 text-xs flex-wrap">
            <button
              type="button"
              onClick={() => setActiveTab('parametros')}
              className={`rounded-md px-3 py-1.5 font-bold transition-all ${
                activeTab === 'parametros'
                  ? 'bg-white dark:bg-gray-800 text-[#00857e] dark:text-[#00C4BB] shadow-2xs'
                  : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              Parâmetros & SLA
            </button>
            <button
              type="button"
              id="tab-contas-acessos"
              onClick={() => setActiveTab('contas')}
              className={`rounded-md px-3 py-1.5 font-bold flex items-center gap-1.5 transition-all ${
                activeTab === 'contas'
                  ? 'bg-white dark:bg-gray-800 text-[#00857e] dark:text-[#00C4BB] shadow-2xs'
                  : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              <KeyRound className="w-3.5 h-3.5" />
              Contas & Acessos
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('pop')}
              className={`rounded-md px-3 py-1.5 font-bold flex items-center gap-1.5 transition-all ${
                activeTab === 'pop'
                  ? 'bg-white dark:bg-gray-800 text-[#00857e] dark:text-[#00C4BB] shadow-2xs'
                  : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              POP Nº 1 (v1.1)
            </button>
            <button
              type="button"
              id="tab-unidades-gestao"
              onClick={() => setActiveTab('unidades')}
              className={`rounded-md px-3 py-1.5 font-bold flex items-center gap-1.5 transition-all ${
                activeTab === 'unidades'
                  ? 'bg-white dark:bg-gray-800 text-[#00857e] dark:text-[#00C4BB] shadow-2xs'
                  : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              <Building2 className="w-3.5 h-3.5" />
              Gestão de Unidades ({(unidades || []).length})
            </button>
          </div>
        </div>
      </div>

      {/* Tab: Contas & Acessos */}
      {activeTab === 'contas' && <ContasAcessosTab />}

      {/* Tab 1: Parâmetros & Regras */}
      {activeTab === 'parametros' && (
        <form onSubmit={handleSave} className="space-y-3.5 text-xs">
          {/* Section 0: Tema Visual (Light / Dark Mode Accessibility) */}
          <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-800/90 p-4 shadow-xs space-y-3">
            <h3 className="text-xs font-bold text-gray-900 dark:text-white flex items-center gap-2 border-b border-gray-100 dark:border-gray-700/60 pb-2.5">
              <Sun className="w-3.5 h-3.5 text-amber-500" />
              Aparência e Contraste Visual (Acessibilidade)
            </h3>
            <p className="text-[11px] text-gray-500 dark:text-gray-400">
              Alterne entre o tema Claro e Escuro. As cores da marca Teal (<span className="font-semibold text-[#00A9A1] dark:text-[#00C4BB]">#00A9A1</span>) e Laranja (<span className="font-semibold text-[#F7941D] dark:text-[#FFA336]">#F7941D</span>) são calibradas para conformidade WCAG AA em ambos os modos.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-md">
              <button
                type="button"
                onClick={() => setTheme('light')}
                className={`flex items-center gap-3 p-3 rounded-lg border text-left transition-all ${
                  theme === 'light'
                    ? 'border-[#00A9A1] ring-2 ring-[#00A9A1]/30 bg-teal-50/20 dark:bg-teal-950/20'
                    : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                }`}
              >
                <div className="w-8 h-8 rounded-full bg-amber-100 dark:bg-amber-950 flex items-center justify-center text-amber-600 dark:text-amber-400">
                  <Sun className="w-4 h-4" />
                </div>
                <div>
                  <p className="font-bold text-gray-900 dark:text-white text-xs">Modo Claro (Padrão)</p>
                  <p className="text-[10px] text-gray-500 dark:text-gray-400">Fundo claro com alto contraste</p>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setTheme('dark')}
                className={`flex items-center gap-3 p-3 rounded-lg border text-left transition-all ${
                  theme === 'dark'
                    ? 'border-[#00A9A1] dark:border-[#00C4BB] ring-2 ring-[#00A9A1]/30 dark:ring-[#00C4BB]/30 bg-teal-50/20 dark:bg-teal-950/20'
                    : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                }`}
              >
                <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-cyan-300">
                  <Moon className="w-4 h-4" />
                </div>
                <div>
                  <p className="font-bold text-gray-900 dark:text-white text-xs">Modo Escuro (Dark)</p>
                  <p className="text-[10px] text-gray-500 dark:text-gray-400">Conforto visual e tons profundos</p>
                </div>
              </button>
            </div>
          </div>

          {/* Section 1: Gatilhos & Automações de Processo */}
          <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-800/90 p-4 shadow-xs space-y-3">
            <h3 className="text-xs font-bold text-gray-900 dark:text-white flex items-center gap-2 border-b border-gray-100 dark:border-gray-700/60 pb-2.5">
              <Users className="w-3.5 h-3.5 text-[#00A9A1] dark:text-[#00C4BB]" />
              Gatilhos de Entrevista Coletiva e Fluxos Especiais
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-750 p-3">
                <label className="block font-bold text-gray-800 dark:text-gray-200 mb-1 text-[11px]">
                  Gatilho de Coletiva (Mínimo de Candidatos por Vaga)
                </label>
                <p className="text-[10px] text-gray-500 dark:text-gray-400 mb-2 leading-relaxed">
                  Dispara o banner de alerta "Mínimo atingido: Agendar Coletiva" na coluna do Kanban quando uma vaga específica acumular esta quantidade de candidatos.
                </p>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min="1"
                    max="50"
                    required
                    value={minColetiva}
                    onChange={(e) => setMinColetiva(Number(e.target.value))}
                    className="w-20 rounded-md border border-gray-200 dark:border-gray-700 px-2.5 py-1.5 text-xs font-bold text-gray-900 dark:text-white bg-white dark:bg-gray-800 focus:ring-1 focus:ring-[#00A9A1] dark:focus:ring-[#00C4BB] focus:outline-none"
                  />
                  <span className="text-[11px] font-semibold text-gray-600 dark:text-gray-300">candidatos na vaga</span>
                </div>
              </div>

              <div className="rounded-lg border border-teal-200/80 dark:border-teal-800/60 bg-teal-50/30 dark:bg-teal-950/20 p-3">
                <label className="block font-bold text-teal-950 dark:text-teal-200 mb-1 text-[11px]">
                  Cargo com Fluxo Simplificado
                </label>
                <p className="text-[10px] text-teal-800 dark:text-teal-300/80 mb-2 leading-relaxed">
                  Cargos cujo termo corresponda a este valor exibirão o toggle de Fluxo Simplificado nos cards e modais, priorizando Vídeo de Apresentação e Aula Teste.
                </p>
                <input
                  type="text"
                  required
                  value={fluxoSimplificadoCargo}
                  onChange={(e) => setFluxoSimplificadoCargo(e.target.value)}
                  className="w-full rounded-md border border-gray-200 dark:border-gray-700 px-2.5 py-1.5 text-xs font-bold text-gray-900 dark:text-white bg-white dark:bg-gray-800 focus:ring-1 focus:ring-[#00A9A1] dark:focus:ring-[#00C4BB] focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Metas de SLA por Etapa (Aciona o SLA Alert Badge Vermelho) */}
          <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-800/90 p-4 shadow-xs space-y-3">
            <h3 className="text-xs font-bold text-gray-900 dark:text-white flex items-center gap-2 border-b border-gray-100 dark:border-gray-700/60 pb-2.5">
              <AlertTriangle className="w-3.5 h-3.5 text-rose-500 dark:text-rose-400" />
              SLA de Permanência por Etapa (Limites para Alerta Vermelho nos Cards)
            </h3>
            <p className="text-[11px] text-gray-500 dark:text-gray-400">
              Tempo máximo recomendado de permanência de um candidato em cada etapa do Kanban. Quando excedido, o card exibe o badge pulsante vermelho <strong>SLA Alerta</strong>.
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {ETAPAS_KANBAN.map((etapa) => (
                <div
                  key={etapa}
                  className="rounded-lg border border-gray-200 dark:border-gray-700 p-2.5 bg-gray-50/40 dark:bg-gray-750"
                >
                  <label
                    className="block font-semibold text-gray-700 dark:text-gray-300 text-[11px] truncate mb-1"
                    title={etapa}
                  >
                    {etapa}
                  </label>
                  <div className="flex items-center gap-1.5">
                    <input
                      type="number"
                      min="1"
                      max="120"
                      value={slaEtapas[etapa] || DEFAULT_STAGE_SLA_DAYS[etapa] || 3}
                      onChange={(e) => handleStageSlaChange(etapa, Number(e.target.value))}
                      className="w-full rounded-md border border-gray-200 dark:border-gray-700 px-2 py-1 text-xs font-bold text-gray-900 dark:text-white bg-white dark:bg-gray-800 focus:ring-1 focus:ring-[#00A9A1]"
                    />
                    <span className="text-[10px] text-gray-400 dark:text-gray-400">dias</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Section 3: Metas de SLA Total por Cargo */}
          <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-800/90 p-4 shadow-xs space-y-3">
            <h3 className="text-xs font-bold text-gray-900 dark:text-white flex items-center gap-2 border-b border-gray-100 dark:border-gray-700/60 pb-2.5">
              <Clock className="w-3.5 h-3.5 text-rose-500 dark:text-rose-400" />
              Metas de SLA Padrão por Cargo (Fechamento Total da Vaga em Dias)
            </h3>
            <p className="text-[11px] text-gray-500 dark:text-gray-400">
              Tempo limite total para preenchimento da vaga desde a data de abertura.
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5">
              {Object.entries(slaPadrao).map(([cargoName, days]) => (
                <div key={cargoName} className="rounded-lg border border-gray-200 dark:border-gray-700 p-2.5 bg-gray-50/40 dark:bg-gray-750">
                  <label className="block font-semibold text-gray-700 dark:text-gray-300 text-[11px] truncate mb-1" title={cargoName}>
                    {cargoName}
                  </label>
                  <div className="flex items-center gap-1.5">
                    <input
                      type="number"
                      min="1"
                      max="180"
                      value={days}
                      onChange={(e) => handleSlaChange(cargoName, Number(e.target.value))}
                      className="w-full rounded-md border border-gray-200 dark:border-gray-700 px-2 py-1 text-xs font-bold text-gray-900 dark:text-white bg-white dark:bg-gray-800"
                    />
                    <span className="text-[10px] text-gray-400 dark:text-gray-400">dias</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Save Button */}
          <div className="flex items-center justify-between pt-2">
            <button
              type="button"
              onClick={() => {
                if (confirm('Deseja restaurar todos os dados e configurações para o padrão inicial?')) {
                  resetAllData();
                  alert('Dados restaurados com sucesso!');
                }
              }}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-gray-400 hover:text-rose-600 dark:hover:text-rose-400 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Restaurar Dados de Fábrica
            </button>

            <div className="flex items-center gap-2.5">
              {savedSuccess && (
                <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
                  <CheckCircle className="w-4 h-4" />
                  Configurações salvas com sucesso!
                </span>
              )}
              <button
                type="submit"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#00A9A1] hover:bg-[#008f88] text-white font-bold text-xs shadow-xs transition-all"
              >
                <Save className="w-3.5 h-3.5" />
                Salvar Alterações
              </button>
            </div>
          </div>
        </form>
      )}

      {/* Tab 2: POP Nº 1 */}
      {activeTab === 'pop' && (
        <div className="space-y-3.5 text-xs">
          <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-800/90 p-4 shadow-xs">
            <h3 className="text-xs font-bold text-gray-900 dark:text-white flex items-center gap-2 mb-3">
              <BookOpen className="w-4 h-4 text-[#00A9A1]" />
              {POP_METADATA.codigo}: {POP_METADATA.titulo} (Versão {POP_METADATA.versao})
            </h3>
            <p className="text-[11px] text-gray-600 dark:text-gray-300 leading-relaxed mb-4">
              {POP_METADATA.empresa} • {POP_METADATA.setor} ({POP_METADATA.gestao}). Elaborado por {POP_METADATA.elaboradoPor} sob gestão de {POP_METADATA.gestor}.
            </p>

            <div className="space-y-2.5">
              {POP_ATIVIDADES.map((ativ) => (
                <div
                  key={ativ.numero}
                  className="rounded-lg border border-gray-200 dark:border-gray-700 p-3 hover:border-teal-200 dark:hover:border-teal-700 transition-colors bg-white dark:bg-gray-800/70"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2 mb-1.5">
                    <div className="flex items-center gap-2">
                      <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#00A9A1] dark:bg-[#00C4BB] text-white dark:text-gray-950 font-bold text-[10px]">
                        {ativ.numero}
                      </span>
                      <h5 className="font-bold text-gray-900 dark:text-white text-xs">Atividade #{ativ.numero}</h5>
                    </div>

                    <div className="flex items-center gap-2 text-[10px]">
                      <span className="font-semibold text-gray-500 dark:text-gray-400">Resp: <strong className="text-gray-800 dark:text-gray-200">{ativ.responsavel}</strong></span>
                      <span className="bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-2 py-0.5 rounded font-medium">Prazo: {ativ.prazo}</span>
                    </div>
                  </div>

                  <p className="text-[11px] text-gray-600 dark:text-gray-300 leading-relaxed mb-2">
                    {ativ.descricao}
                  </p>

                  {ativ.anexoRef && (
                    <div className="pt-2 border-t border-gray-50 dark:border-gray-700/60 text-[10px] text-teal-700 dark:text-teal-300 font-semibold">
                      Referência: <span className="bg-teal-50 dark:bg-teal-950/50 px-1.5 py-0.2 rounded">{ativ.anexoRef}</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Gestão de Unidades (Adicionar & Editar Unidades) */}
      {activeTab === 'unidades' && (
        <div className="space-y-3.5 text-xs">
          {/* Action and Filter Bar */}
          <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-800/90 p-3.5 shadow-xs flex flex-wrap items-center justify-between gap-3">
            <div className="relative flex-1 min-w-[220px] max-w-md">
              <Search className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Buscar por unidade, cidade, estado ou CNPJ..."
                value={searchTermUnit}
                onChange={(e) => setSearchTermUnit(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 rounded-md border border-gray-200 dark:border-gray-700 text-xs text-gray-900 dark:text-white bg-white dark:bg-gray-800 focus:ring-1 focus:ring-[#00A9A1] dark:focus:ring-[#00C4BB] focus:outline-none"
              />
            </div>

            <div className="flex items-center gap-3">
              <span className="text-[11px] font-bold text-gray-500 dark:text-gray-400">
                {filteredUnits.length} de {(unidades || []).length} unidades
              </span>

              <button
                type="button"
                id="btn-add-new-unidade"
                onClick={handleOpenAddUnit}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-[#00A9A1] hover:bg-[#008f88] text-white text-xs font-bold shadow-xs active:scale-95 transition-all"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Adicionar Nova Unidade</span>
              </button>
            </div>
          </div>

          {/* Units Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {filteredUnits.map((info) => (
              <div
                key={info.apelido}
                className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800/90 p-4 shadow-xs flex flex-col justify-between space-y-3 hover:border-[#00A9A1] dark:hover:border-[#00C4BB] transition-all"
              >
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-extrabold text-gray-900 dark:text-white text-xs">
                      {info.apelido}
                    </span>
                    <span className="rounded bg-teal-50 dark:bg-teal-950/50 text-[#00857e] dark:text-[#00C4BB] font-bold text-[10px] px-1.5 py-0.5">
                      {info.uf || 'BR'}
                    </span>
                  </div>
                  <p className="text-[10px] text-gray-400 dark:text-gray-500 font-mono mb-2 truncate">
                    {info.razaoSocial || 'Razão Social não informada'}
                  </p>

                  <div className="space-y-1.5 text-[11px] text-gray-600 dark:text-gray-300">
                    <p className="flex items-start gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-[#00A9A1] dark:text-[#00C4BB] flex-shrink-0 mt-0.5" />
                      <span>{info.endereco || 'Endereço a preencher'}</span>
                    </p>
                    {info.cnpj && (
                      <p className="text-[10px] text-gray-400 dark:text-gray-400 font-mono">
                        CNPJ: <strong className="text-gray-700 dark:text-gray-200">{info.cnpj}</strong>
                      </p>
                    )}
                    {info.gestor && (
                      <p className="text-[10px] text-gray-500 dark:text-gray-400">
                        Gestor: <strong className="text-gray-700 dark:text-gray-200">{info.gestor}</strong>
                      </p>
                    )}
                  </div>
                </div>

                <div className="pt-2.5 border-t border-gray-100 dark:border-gray-700/60 flex items-center justify-between">
                  <span className="text-[10px] text-gray-400 font-medium">
                    {info.cidade} - {info.uf}
                  </span>

                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => handleOpenEditUnit(info)}
                      className="p-1 rounded-md border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-[#00A9A1] transition-colors"
                      title="Editar dados da unidade"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteUnit(info.apelido)}
                      className="p-1 rounded-md border border-red-200 dark:border-red-900/50 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors"
                      title="Excluir unidade"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Add / Edit Unit Modal */}
          {isUnitModalOpen && (
            <div
              id="unit-form-modal"
              className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs"
              onClick={() => setIsUnitModalOpen(false)}
            >
              <div
                className="relative w-full max-w-lg bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-800 p-6 space-y-4"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-gray-800">
                  <h3 className="text-sm font-extrabold text-gray-900 dark:text-white flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-[#00A9A1]" />
                    {editingUnitKey ? `Editar Unidade: ${editingUnitKey}` : 'Cadastrar Nova Unidade'}
                  </h3>
                  <button
                    type="button"
                    onClick={() => setIsUnitModalOpen(false)}
                    className="p-1 rounded-lg text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <form onSubmit={handleSaveUnit} className="space-y-3 text-xs">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1 text-[11px]">
                        Nome / Apelido da Unidade *
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="Ex: BH - SAVASSI, SP - PAULISTA"
                        value={unitFormData.apelido}
                        onChange={(e) => setUnitFormData({ ...unitFormData, apelido: e.target.value.toUpperCase() })}
                        disabled={!!editingUnitKey}
                        className="w-full rounded-md border border-gray-200 dark:border-gray-700 px-3 py-1.5 text-xs text-gray-900 dark:text-white bg-gray-50 dark:bg-gray-800 focus:ring-1 focus:ring-[#00A9A1] focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1 text-[11px]">
                        CNPJ
                      </label>
                      <input
                        type="text"
                        placeholder="00.000.000/0000-00"
                        value={unitFormData.cnpj}
                        onChange={(e) => setUnitFormData({ ...unitFormData, cnpj: e.target.value })}
                        className="w-full rounded-md border border-gray-200 dark:border-gray-700 px-3 py-1.5 text-xs text-gray-900 dark:text-white bg-gray-50 dark:bg-gray-800 focus:ring-1 focus:ring-[#00A9A1] focus:outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1 text-[11px]">
                      Razão Social da Empresa
                    </label>
                    <input
                      type="text"
                      placeholder="Ex: VOX2YOU ESCOLA DE ORATORIA LTDA"
                      value={unitFormData.razaoSocial}
                      onChange={(e) => setUnitFormData({ ...unitFormData, razaoSocial: e.target.value })}
                      className="w-full rounded-md border border-gray-200 dark:border-gray-700 px-3 py-1.5 text-xs text-gray-900 dark:text-white bg-gray-50 dark:bg-gray-800 focus:ring-1 focus:ring-[#00A9A1] focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1 text-[11px]">
                      Endereço Completo
                    </label>
                    <input
                      type="text"
                      placeholder="Ex: Av. Afonso Pena, 1234 - Savassi"
                      value={unitFormData.endereco}
                      onChange={(e) => setUnitFormData({ ...unitFormData, endereco: e.target.value })}
                      className="w-full rounded-md border border-gray-200 dark:border-gray-700 px-3 py-1.5 text-xs text-gray-900 dark:text-white bg-gray-50 dark:bg-gray-800 focus:ring-1 focus:ring-[#00A9A1] focus:outline-none"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1 text-[11px]">
                        Cidade
                      </label>
                      <input
                        type="text"
                        placeholder="Ex: Belo Horizonte"
                        value={unitFormData.cidade}
                        onChange={(e) => setUnitFormData({ ...unitFormData, cidade: e.target.value })}
                        className="w-full rounded-md border border-gray-200 dark:border-gray-700 px-3 py-1.5 text-xs text-gray-900 dark:text-white bg-gray-50 dark:bg-gray-800 focus:ring-1 focus:ring-[#00A9A1] focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1 text-[11px]">
                        UF (Estado)
                      </label>
                      <input
                        type="text"
                        maxLength={2}
                        placeholder="Ex: MG, SP"
                        value={unitFormData.uf}
                        onChange={(e) => setUnitFormData({ ...unitFormData, uf: e.target.value.toUpperCase() })}
                        className="w-full rounded-md border border-gray-200 dark:border-gray-700 px-3 py-1.5 text-xs text-gray-900 dark:text-white bg-gray-50 dark:bg-gray-800 focus:ring-1 focus:ring-[#00A9A1] focus:outline-none uppercase"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1 text-[11px]">
                        Gestor / Responsável
                      </label>
                      <input
                        type="text"
                        placeholder="Ex: Fabrício Oliveira"
                        value={unitFormData.gestor || ''}
                        onChange={(e) => setUnitFormData({ ...unitFormData, gestor: e.target.value })}
                        className="w-full rounded-md border border-gray-200 dark:border-gray-700 px-3 py-1.5 text-xs text-gray-900 dark:text-white bg-gray-50 dark:bg-gray-800 focus:ring-1 focus:ring-[#00A9A1] focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1 text-[11px]">
                        Telefone / WhatsApp Local
                      </label>
                      <input
                        type="text"
                        placeholder="(11) 98765-4321"
                        value={unitFormData.telefone || ''}
                        onChange={(e) => setUnitFormData({ ...unitFormData, telefone: e.target.value })}
                        className="w-full rounded-md border border-gray-200 dark:border-gray-700 px-3 py-1.5 text-xs text-gray-900 dark:text-white bg-gray-50 dark:bg-gray-800 focus:ring-1 focus:ring-[#00A9A1] focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-3 border-t border-gray-100 dark:border-gray-800">
                    <button
                      type="button"
                      onClick={() => setIsUnitModalOpen(false)}
                      className="px-3 py-1.5 rounded-lg border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 text-xs font-semibold hover:bg-gray-50 dark:hover:bg-gray-800"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-1.5 rounded-lg bg-[#00A9A1] hover:bg-[#008f88] text-white text-xs font-bold shadow-xs"
                    >
                      {editingUnitKey ? 'Salvar Alterações' : 'Cadastrar Unidade'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};



