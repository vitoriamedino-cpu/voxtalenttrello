import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { useWorkspace } from '../../context/WorkspaceContext';
import { exportFinancialsToSheets } from '../../lib/googleSheetsService';
import { UNIDADES_VOX, CANAIS_DIVULGACAO } from '../../lib/rsConstants';
import { AcaoCusto, VolumeCV, UnidadeVox } from '../../types';
import { formatCurrency, formatDateBR } from '../../lib/formatters';
import {
  TrendingUp,
  DollarSign,
  FileSpreadsheet,
  Plus,
  Trash2,
  Filter,
  Search,
  PieChart,
  BarChart3,
  Calendar,
  Building,
  Briefcase,
  Layers,
  ArrowUpRight,
  ExternalLink,
  Sparkles,
} from 'lucide-react';

export const RelatoriosView: React.FC = () => {
  const { custos, volumeCvs, vagas, addCusto, deleteCusto, addVolumeCV, deleteVolumeCV } = useApp();
  const { isConnected, login, confirmAction } = useWorkspace();
  const [isExportingSheets, setIsExportingSheets] = useState(false);
  const [sheetsResultUrl, setSheetsResultUrl] = useState<string | null>(null);

  const [activeTab, setActiveTab] = useState<'custos' | 'volumecvs'>('custos');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCanal, setSelectedCanal] = useState('TODOS');

  // Modals for adding
  const [isAddCustoOpen, setIsAddCustoOpen] = useState(false);
  const [isAddVolumeOpen, setIsAddVolumeOpen] = useState(false);

  // New Custo Form State
  const [custoVagaId, setCustoVagaId] = useState(vagas[0]?.id || '');
  const [custoCanal, setCustoCanal] = useState('LinkedIn');
  const [custoValor, setCustoValor] = useState<number>(300);
  const [custoData, setCustoData] = useState(new Date().toISOString().split('T')[0]);
  const [custoObs, setCustoObs] = useState('');

  // New VolumeCV Form State
  const [volSemana, setVolSemana] = useState('2026-W33 (10/Ago - 16/Ago)');
  const [volVagaId, setVolVagaId] = useState(vagas[0]?.id || '');
  const [volCanal, setVolCanal] = useState('InfoJobs');
  const [volQtdCvs, setVolQtdCvs] = useState<number>(40);
  const [volQtdTriados, setVolQtdTriados] = useState<number>(15);
  const [volQtdAprovados, setVolQtdAprovados] = useState<number>(4);

  // Computed Metrics
  const totalInvestido = custos.reduce((sum, c) => sum + c.valor, 0);
  const totalCvsRecebidos = volumeCvs.reduce((sum, v) => sum + v.quantidade_cvs, 0);
  const totalCvsTriados = volumeCvs.reduce((sum, v) => sum + v.quantidade_triados, 0);
  const totalCvsAprovados = volumeCvs.reduce((sum, v) => sum + v.quantidade_aprovados, 0);
  const custoPorCv = totalCvsRecebidos > 0 ? totalInvestido / totalCvsRecebidos : 0;
  const taxaConversaoTriagem = totalCvsRecebidos > 0 ? Math.round((totalCvsTriados / totalCvsRecebidos) * 100) : 0;

  // Filtered lists
  const filteredCustos = custos.filter((c) => {
    if (selectedCanal !== 'TODOS' && c.canal !== selectedCanal) return false;
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      const matchVaga = c.vaga_titulo.toLowerCase().includes(term);
      const matchUnid = c.unidade.toLowerCase().includes(term);
      const matchCanal = c.canal.toLowerCase().includes(term);
      if (!matchVaga && !matchUnid && !matchCanal) return false;
    }
    return true;
  });

  const filteredVolumeCvs = volumeCvs.filter((v) => {
    if (selectedCanal !== 'TODOS' && v.canal !== selectedCanal) return false;
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      const matchVaga = v.vaga_titulo.toLowerCase().includes(term);
      const matchUnid = v.unidade.toLowerCase().includes(term);
      const matchSemana = v.semana.toLowerCase().includes(term);
      if (!matchVaga && !matchUnid && !matchSemana) return false;
    }
    return true;
  });

  const handleSaveCusto = (e: React.FormEvent) => {
    e.preventDefault();
    const selVaga = vagas.find((v) => v.id === custoVagaId);
    if (!selVaga) return;

    addCusto({
      vaga_id: selVaga.id,
      vaga_titulo: selVaga.titulo,
      unidade: selVaga.unidade,
      canal: custoCanal,
      valor: Number(custoValor),
      data: custoData,
      observacoes: custoObs || undefined,
    });

    setIsAddCustoOpen(false);
    setCustoObs('');
  };

  const handleSaveVolume = (e: React.FormEvent) => {
    e.preventDefault();
    const selVaga = vagas.find((v) => v.id === volVagaId);
    if (!selVaga) return;

    addVolumeCV({
      semana: volSemana,
      vaga_id: selVaga.id,
      vaga_titulo: selVaga.titulo,
      unidade: selVaga.unidade,
      canal: volCanal,
      quantidade_cvs: Number(volQtdCvs),
      quantidade_triados: Number(volQtdTriados),
      quantidade_aprovados: Number(volQtdAprovados),
    });

    setIsAddVolumeOpen(false);
  };

  const handleExportGoogleSheets = () => {
    if (!isConnected) {
      login();
      return;
    }
    confirmAction('Criar uma nova planilha com o relatório financeiro de custos e conversão no Google Sheets?', async () => {
      setIsExportingSheets(true);
      try {
        const result = await exportFinancialsToSheets(custos, volumeCvs);
        setSheetsResultUrl(result.spreadsheetUrl || `https://docs.google.com/spreadsheets/d/${result.spreadsheetId}`);
      } catch (err: any) {
        alert(`Erro ao exportar: ${err?.message}`);
      } finally {
        setIsExportingSheets(false);
      }
    });
  };

  return (
    <div className="space-y-3.5">
      {/* Top Header */}
      <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-4 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-[#00A9A1] dark:text-[#00C4BB]" />
              Relatórios de R&S: Custos de Divulgação e Volume de CVs
            </h2>
            <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5">
              Acompanhamento financeiro por canal de aquisição (AcaoCusto) e conversão semanal (VolumeCV).
            </p>
          </div>

          <div className="flex items-center gap-2">
            {sheetsResultUrl ? (
              <a
                href={sheetsResultUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 rounded-md bg-emerald-600 hover:bg-emerald-700 px-3 py-1.5 text-xs font-bold text-white shadow-xs transition-all"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>Abrir Google Planilhas</span>
              </a>
            ) : (
              <button
                type="button"
                disabled={isExportingSheets}
                onClick={handleExportGoogleSheets}
                className="inline-flex items-center gap-1.5 rounded-md border border-emerald-300 dark:border-emerald-700 bg-emerald-50 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-200 hover:bg-emerald-100 dark:hover:bg-emerald-900 px-3 py-1.5 text-xs font-bold shadow-2xs transition-all"
                title="Exportar dados para o Google Sheets"
              >
                <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
                <span>{isExportingSheets ? 'Exportando...' : 'Exportar Sheets'}</span>
              </button>
            )}

            {activeTab === 'custos' ? (
              <button
                type="button"
                onClick={() => setIsAddCustoOpen(true)}
                className="inline-flex items-center gap-1.5 rounded-md bg-[#00A9A1] hover:bg-[#008f88] dark:bg-[#00A9A1] dark:hover:bg-[#00C4BB] px-3 py-1.5 text-xs font-bold text-white shadow-xs active:scale-[0.98] transition-all"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Registrar Custo</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setIsAddVolumeOpen(true)}
                className="inline-flex items-center gap-1.5 rounded-md bg-[#00A9A1] hover:bg-[#008f88] dark:bg-[#00A9A1] dark:hover:bg-[#00C4BB] px-3 py-1.5 text-xs font-bold text-white shadow-xs active:scale-[0.98] transition-all"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Registrar Volume CV</span>
              </button>
            )}
          </div>
        </div>

        {/* Global Summary Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mt-3.5 pt-3 border-t border-gray-100 dark:border-gray-700 text-xs">
          <div className="rounded-lg bg-gray-50/70 dark:bg-gray-850 p-2.5 border border-gray-200 dark:border-gray-700">
            <span className="text-gray-500 dark:text-gray-400 font-medium text-[11px]">Investimento Total</span>
            <p className="text-base font-bold text-gray-900 dark:text-white mt-0.5">{formatCurrency(totalInvestido)}</p>
          </div>

          <div className="rounded-lg bg-teal-50/50 dark:bg-teal-950/40 p-2.5 border border-teal-100 dark:border-teal-800">
            <span className="text-teal-800 dark:text-teal-300 font-medium text-[11px]">CVs Registrados</span>
            <p className="text-base font-bold text-teal-950 dark:text-teal-100 mt-0.5">{totalCvsRecebidos} CVs</p>
          </div>

          <div className="rounded-lg bg-indigo-50/50 dark:bg-indigo-950/40 p-2.5 border border-indigo-100 dark:border-indigo-800">
            <span className="text-indigo-800 dark:text-indigo-300 font-medium text-[11px]">Custo Médio / CV</span>
            <p className="text-base font-bold text-indigo-950 dark:text-indigo-100 mt-0.5">{formatCurrency(custoPorCv)}</p>
          </div>

          <div className="rounded-lg bg-emerald-50/50 dark:bg-emerald-950/40 p-2.5 border border-emerald-100 dark:border-emerald-800">
            <span className="text-emerald-800 dark:text-emerald-300 font-medium text-[11px]">Conversão Triagem</span>
            <p className="text-base font-bold text-emerald-950 dark:text-emerald-100 mt-0.5">{taxaConversaoTriagem}%</p>
          </div>
        </div>
      </div>

      {/* Tabs & Filters */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
        <div className="flex bg-gray-200/80 dark:bg-gray-700/80 p-0.5 rounded-lg text-xs font-semibold w-fit">
          <button
            type="button"
            onClick={() => setActiveTab('custos')}
            className={`px-3 py-1.5 rounded-md transition-all text-xs ${
              activeTab === 'custos'
                ? 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white shadow-2xs font-bold'
                : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            💰 Custos por Vaga (AcaoCusto)
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('volumecvs')}
            className={`px-3 py-1.5 rounded-md transition-all text-xs ${
              activeTab === 'volumecvs'
                ? 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white shadow-2xs font-bold'
                : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            📊 Volume Semanal de Currículos (VolumeCV)
          </button>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <div className="relative min-w-[180px]">
            <Search className="w-3.5 h-3.5 text-gray-400 dark:text-gray-500 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar..."
              className="w-full pl-8 pr-2.5 py-1.5 rounded-md border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-xs focus:ring-1 focus:ring-[#00A9A1] dark:focus:ring-[#00C4BB] focus:outline-none"
            />
          </div>

          <select
            value={selectedCanal}
            onChange={(e) => setSelectedCanal(e.target.value)}
            className="py-1.5 px-2.5 rounded-md border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 font-medium text-gray-700 dark:text-gray-200 focus:ring-1 focus:ring-[#00A9A1] dark:focus:ring-[#00C4BB] text-xs"
          >
            <option value="TODOS">Todos os Canais</option>
            {CANAIS_DIVULGACAO.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Tab 1: AcaoCusto Table */}
      {activeTab === 'custos' && (
        <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-gray-600 dark:text-gray-300">
              <thead className="bg-gray-50 dark:bg-gray-850 border-b border-gray-200 dark:border-gray-700 text-[10px] font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                <tr>
                  <th className="px-4 py-2.5">Data</th>
                  <th className="px-3 py-2.5">Vaga Vinculada</th>
                  <th className="px-3 py-2.5">Unidade</th>
                  <th className="px-3 py-2.5">Canal de Divulgação</th>
                  <th className="px-3 py-2.5">Valor Investido</th>
                  <th className="px-3 py-2.5">Observações</th>
                  <th className="px-4 py-2.5 text-right">Ação</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                {filteredCustos.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-6 text-center text-gray-400 dark:text-gray-500 font-medium">
                      Nenhum custo registrado para este filtro.
                    </td>
                  </tr>
                ) : (
                  filteredCustos.map((item) => (
                    <tr key={item.id} className="hover:bg-gray-50/70 dark:hover:bg-gray-750 transition-colors">
                      <td className="px-4 py-3 font-medium text-gray-700 dark:text-gray-300">
                        {formatDateBR(item.data)}
                      </td>
                      <td className="px-3 py-3 font-bold text-gray-900 dark:text-white">{item.vaga_titulo}</td>
                      <td className="px-3 py-3 text-gray-700 dark:text-gray-300">{item.unidade}</td>
                      <td className="px-3 py-3">
                        <span className="inline-block rounded bg-teal-50 dark:bg-teal-950/60 px-1.5 py-0.5 text-[10px] font-semibold text-[#00A9A1] dark:text-[#00C4BB]">
                          {item.canal}
                        </span>
                      </td>
                      <td className="px-3 py-3 font-bold text-gray-900 dark:text-white">
                        {formatCurrency(item.valor)}
                      </td>
                      <td className="px-3 py-3 text-gray-500 dark:text-gray-400 max-w-xs truncate text-[11px]">
                        {item.observacoes || '-'}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <button
                          type="button"
                          onClick={() => deleteCusto(item.id)}
                          className="p-1 rounded text-gray-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/50 transition-colors"
                          title="Excluir Custo"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 2: VolumeCV Table */}
      {activeTab === 'volumecvs' && (
        <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-gray-600 dark:text-gray-300">
              <thead className="bg-gray-50 dark:bg-gray-850 border-b border-gray-200 dark:border-gray-700 text-[10px] font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                <tr>
                  <th className="px-4 py-2.5">Semana</th>
                  <th className="px-3 py-2.5">Vaga</th>
                  <th className="px-3 py-2.5">Unidade</th>
                  <th className="px-3 py-2.5">Canal</th>
                  <th className="px-3 py-2.5">Recebidos</th>
                  <th className="px-3 py-2.5">Triados</th>
                  <th className="px-3 py-2.5">Aprovados</th>
                  <th className="px-3 py-2.5">Conversão</th>
                  <th className="px-4 py-2.5 text-right">Ação</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                {filteredVolumeCvs.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="px-4 py-6 text-center text-gray-400 dark:text-gray-500 font-medium">
                      Nenhum volume registrado para este filtro.
                    </td>
                  </tr>
                ) : (
                  filteredVolumeCvs.map((vol) => {
                    const conv =
                      vol.quantidade_cvs > 0
                        ? Math.round((vol.quantidade_aprovados / vol.quantidade_cvs) * 100)
                        : 0;

                    return (
                      <tr key={vol.id} className="hover:bg-gray-50/70 dark:hover:bg-gray-750 transition-colors">
                        <td className="px-4 py-3 font-semibold text-gray-900 dark:text-white">{vol.semana}</td>
                        <td className="px-3 py-3 font-medium text-gray-800 dark:text-gray-200">{vol.vaga_titulo}</td>
                        <td className="px-3 py-3 text-gray-700 dark:text-gray-300">{vol.unidade}</td>
                        <td className="px-3 py-3">
                          <span className="inline-block rounded bg-indigo-50 dark:bg-indigo-950/60 px-1.5 py-0.5 text-[10px] font-semibold text-indigo-700 dark:text-indigo-300">
                            {vol.canal}
                          </span>
                        </td>
                        <td className="px-3 py-3 font-bold text-gray-900 dark:text-white">{vol.quantidade_cvs}</td>
                        <td className="px-3 py-3 text-gray-700 dark:text-gray-300">{vol.quantidade_triados}</td>
                        <td className="px-3 py-3 font-bold text-emerald-700 dark:text-emerald-400">
                          {vol.quantidade_aprovados}
                        </td>
                        <td className="px-3 py-3 font-medium text-gray-700 dark:text-gray-300">{conv}%</td>
                        <td className="px-4 py-3 text-right">
                          <button
                            type="button"
                            onClick={() => deleteVolumeCV(vol.id)}
                            className="p-1 rounded text-gray-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/50 transition-colors"
                            title="Excluir Registro"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal: Adicionar Custo (AcaoCusto) */}
      {isAddCustoOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 dark:bg-black/70 backdrop-blur-xs p-4">
          <div className="w-full max-w-md rounded-xl bg-white dark:bg-gray-800 p-5 shadow-xl border border-gray-200 dark:border-gray-700 text-xs">
            <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-3 border-b border-gray-100 dark:border-gray-700 pb-2.5">
              Registrar Custo de Divulgação (AcaoCusto)
            </h3>
            <form onSubmit={handleSaveCusto} className="space-y-3">
              <div>
                <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1 text-[11px]">Vaga Vinculada *</label>
                <select
                  required
                  value={custoVagaId}
                  onChange={(e) => setCustoVagaId(e.target.value)}
                  className="w-full rounded-md border border-gray-200 dark:border-gray-700 px-3 py-1.5 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-xs focus:ring-1 focus:ring-[#00A9A1] dark:focus:ring-[#00C4BB] focus:outline-none"
                >
                  {vagas.map((v) => (
                    <option key={v.id} value={v.id}>
                      {v.titulo} ({v.unidade})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1 text-[11px]">Canal de Divulgação *</label>
                <select
                  value={custoCanal}
                  onChange={(e) => setCustoCanal(e.target.value)}
                  className="w-full rounded-md border border-gray-200 dark:border-gray-700 px-3 py-1.5 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-xs focus:ring-1 focus:ring-[#00A9A1] dark:focus:ring-[#00C4BB] focus:outline-none"
                >
                  {CANAIS_DIVULGACAO.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1 text-[11px]">Valor (R$) *</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    required
                    value={custoValor}
                    onChange={(e) => setCustoValor(Number(e.target.value))}
                    className="w-full rounded-md border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white px-3 py-1.5 text-xs focus:ring-1 focus:ring-[#00A9A1] dark:focus:ring-[#00C4BB] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1 text-[11px]">Data *</label>
                  <input
                    type="date"
                    required
                    value={custoData}
                    onChange={(e) => setCustoData(e.target.value)}
                    className="w-full rounded-md border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white px-3 py-1.5 text-xs focus:ring-1 focus:ring-[#00A9A1] dark:focus:ring-[#00C4BB] focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1 text-[11px]">Observações</label>
                <textarea
                  rows={2}
                  placeholder="Ex: Campanha de 7 dias com foco em Closer..."
                  value={custoObs}
                  onChange={(e) => setCustoObs(e.target.value)}
                  className="w-full rounded-md border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white px-3 py-1.5 text-xs focus:ring-1 focus:ring-[#00A9A1] dark:focus:ring-[#00C4BB] focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2.5 border-t border-gray-100 dark:border-gray-700">
                <button
                  type="button"
                  onClick={() => setIsAddCustoOpen(false)}
                  className="px-3.5 py-1.5 rounded-md border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 font-semibold hover:bg-gray-50 dark:hover:bg-gray-700 text-xs"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-md bg-[#00A9A1] hover:bg-[#008f88] dark:bg-[#00A9A1] dark:hover:bg-[#00C4BB] font-bold text-white shadow-xs text-xs"
                >
                  Salvar Custo
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Adicionar VolumeCV */}
      {isAddVolumeOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 dark:bg-black/70 backdrop-blur-xs p-4">
          <div className="w-full max-w-md rounded-xl bg-white dark:bg-gray-800 p-5 shadow-xl border border-gray-200 dark:border-gray-700 text-xs">
            <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-3 border-b border-gray-100 dark:border-gray-700 pb-2.5">
              Registrar Lote Semanal de CVs (VolumeCV)
            </h3>
            <form onSubmit={handleSaveVolume} className="space-y-3">
              <div>
                <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1 text-[11px]">Semana de Referência *</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: 2026-W33 (10/Ago - 16/Ago)"
                  value={volSemana}
                  onChange={(e) => setVolSemana(e.target.value)}
                  className="w-full rounded-md border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white px-3 py-1.5 text-xs focus:ring-1 focus:ring-[#00A9A1] dark:focus:ring-[#00C4BB] focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1 text-[11px]">Vaga Vinculada *</label>
                <select
                  required
                  value={volVagaId}
                  onChange={(e) => setVolVagaId(e.target.value)}
                  className="w-full rounded-md border border-gray-200 dark:border-gray-700 px-3 py-1.5 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-xs focus:ring-1 focus:ring-[#00A9A1] dark:focus:ring-[#00C4BB] focus:outline-none"
                >
                  {vagas.map((v) => (
                    <option key={v.id} value={v.id}>
                      {v.titulo} ({v.unidade})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1 text-[11px]">Canal de Origem *</label>
                <select
                  value={volCanal}
                  onChange={(e) => setVolCanal(e.target.value)}
                  className="w-full rounded-md border border-gray-200 dark:border-gray-700 px-3 py-1.5 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-xs focus:ring-1 focus:ring-[#00A9A1] dark:focus:ring-[#00C4BB] focus:outline-none"
                >
                  {CANAIS_DIVULGACAO.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1 text-[11px]">Recebidos *</label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={volQtdCvs}
                    onChange={(e) => setVolQtdCvs(Number(e.target.value))}
                    className="w-full rounded-md border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white px-3 py-1.5 text-xs focus:ring-1 focus:ring-[#00A9A1] dark:focus:ring-[#00C4BB] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1 text-[11px]">Triados *</label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={volQtdTriados}
                    onChange={(e) => setVolQtdTriados(Number(e.target.value))}
                    className="w-full rounded-md border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white px-3 py-1.5 text-xs focus:ring-1 focus:ring-[#00A9A1] dark:focus:ring-[#00C4BB] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1 text-[11px]">Aprovados *</label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={volQtdAprovados}
                    onChange={(e) => setVolQtdAprovados(Number(e.target.value))}
                    className="w-full rounded-md border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white px-3 py-1.5 text-xs focus:ring-1 focus:ring-[#00A9A1] dark:focus:ring-[#00C4BB] focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2.5 border-t border-gray-100 dark:border-gray-700">
                <button
                  type="button"
                  onClick={() => setIsAddVolumeOpen(false)}
                  className="px-3.5 py-1.5 rounded-md border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 font-semibold hover:bg-gray-50 dark:hover:bg-gray-700 text-xs"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-md bg-[#00A9A1] hover:bg-[#008f88] dark:bg-[#00A9A1] dark:hover:bg-[#00C4BB] font-bold text-white shadow-xs text-xs"
                >
                  Salvar Volume
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
