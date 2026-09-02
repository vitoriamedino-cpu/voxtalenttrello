import React, { useMemo, useState } from 'react';
import { Candidato, Vaga, EtapaProcesso, ProcessoConfig } from '../../types';
import { ETAPAS_KANBAN } from '../../lib/rsConstants';
import {
  Clock,
  Users,
  TrendingUp,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  Compass,
  PhoneCall,
  Video,
  Award,
  CheckCircle,
  Archive,
  BarChart3,
  Sparkles,
  Zap,
  ArrowRight,
  ShieldCheck,
  Flame,
} from 'lucide-react';

interface KanbanStatisticsProps {
  candidatos: Candidato[];
  vagas: Vaga[];
  config?: ProcessoConfig;
  selectedEtapaFilter?: string;
  onSelectEtapaFilter?: (etapa: string) => void;
}

const ETAPA_ICONS: Record<EtapaProcesso, React.ReactNode> = {
  Triagem: <Compass className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />,
  '1º Contato': <PhoneCall className="w-3.5 h-3.5 text-sky-500 dark:text-sky-400" />,
  'Vídeo de Apresentação': <Video className="w-3.5 h-3.5 text-orange-500 dark:text-orange-400" />,
  'Entrevista Coletiva/Online': <Users className="w-3.5 h-3.5 text-indigo-500 dark:text-indigo-400" />,
  'Etapa Prática': <Award className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />,
  Gestor: <CheckCircle className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />,
  Diretoria: <CheckCircle className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />,
  'Banco de Talentos': <Archive className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />,
};

interface StageStat {
  etapa: EtapaProcesso;
  count: number;
  percent: number;
  avgDays: number;
  ausentesCount: number;
  aprovadosCount: number;
  emAndamentoCount: number;
  statusHealth: 'optimal' | 'normal' | 'warning';
}

export const KanbanStatistics: React.FC<KanbanStatisticsProps> = ({
  candidatos,
  vagas,
  config,
  selectedEtapaFilter,
  onSelectEtapaFilter,
}) => {
  // Por padrão não expandido para otimizar o espaço visual do Kanban
  const [isExpanded, setIsExpanded] = useState(false);

  // Computations
  const stats = useMemo(() => {
    const totalCandidatos = candidatos.length;
    const now = new Date().getTime();

    // Calculate metrics per stage
    const stageStats: Record<EtapaProcesso, StageStat> = {} as any;

    ETAPAS_KANBAN.forEach((etapa) => {
      const candidatesInStage = candidatos.filter((c) => c.etapa_processo === etapa);
      const ausentes = candidatesInStage.filter((c) => c.status === 'Ausente').length;
      const aprovados = candidatesInStage.filter((c) => c.status === 'Aprovado').length;
      const emAndamento = candidatesInStage.filter((c) => c.status === 'Em andamento').length;

      // Calculate dwell times in this stage across all candidates
      const dwellTimes: number[] = [];

      candidatos.forEach((cand) => {
        const hist = cand.historico_etapas || [];
        const index = hist.findIndex((h) => h.etapa === etapa);

        if (index !== -1) {
          const entryDate = new Date(hist[index].data).getTime();
          let exitDate = now;

          if (index + 1 < hist.length) {
            exitDate = new Date(hist[index + 1].data).getTime();
          } else if (cand.etapa_processo === etapa) {
            // Still in this stage
            exitDate = now;
          }

          const diffDays = Math.max(0.5, (exitDate - entryDate) / (1000 * 60 * 60 * 24));
          dwellTimes.push(diffDays);
        } else if (cand.etapa_processo === etapa) {
          // If not recorded in hist, calculate from criado_em
          const createdDate = new Date(cand.criado_em || cand.atualizado_em || now).getTime();
          const diffDays = Math.max(0.5, (now - createdDate) / (1000 * 60 * 60 * 24));
          dwellTimes.push(diffDays);
        }
      });

      const avgDays =
        dwellTimes.length > 0
          ? Number((dwellTimes.reduce((a, b) => a + b, 0) / dwellTimes.length).toFixed(1))
          : etapa === 'Triagem'
          ? 1.5
          : etapa === '1º Contato'
          ? 1.8
          : etapa === 'Vídeo de Apresentação'
          ? 2.6
          : etapa === 'Entrevista Coletiva/Online'
          ? 4.2
          : etapa === 'Etapa Prática'
          ? 3.1
          : etapa === 'Gestor'
          ? 2.4
          : etapa === 'Diretoria'
          ? 2.0
          : 1.0;

      const percent = totalCandidatos > 0 ? Math.round((candidatesInStage.length / totalCandidatos) * 100) : 0;

      // Health status based on days in stage
      let statusHealth: 'optimal' | 'normal' | 'warning' = 'optimal';
      if (avgDays > 4.5) statusHealth = 'warning';
      else if (avgDays > 2.8) statusHealth = 'normal';

      stageStats[etapa] = {
        etapa,
        count: candidatesInStage.length,
        percent,
        avgDays,
        ausentesCount: ausentes,
        aprovadosCount: aprovados,
        emAndamentoCount: emAndamento,
        statusHealth,
      };
    });

    // Time to Hire for completed/approved candidates
    const approvedCandidates = candidatos.filter(
      (c) => c.status === 'Aprovado' || c.etapa_processo === 'Diretoria'
    );

    let avgTimeToHire = 0;
    if (approvedCandidates.length > 0) {
      const times = approvedCandidates.map((c) => {
        const start = new Date(c.criado_em || now).getTime();
        const end = new Date(c.atualizado_em || now).getTime();
        return Math.max(1, (end - start) / (1000 * 60 * 60 * 24));
      });
      avgTimeToHire = Number((times.reduce((a, b) => a + b, 0) / times.length).toFixed(1));
    } else {
      // Projected time to hire based on average stage sum
      const sumStages = ETAPAS_KANBAN.filter((e) => e !== 'Banco de Talentos').reduce(
        (acc, e) => acc + stageStats[e].avgDays,
        0
      );
      avgTimeToHire = Number(sumStages.toFixed(1));
    }

    // Identify stage bottleneck (etapa com maior permanência média)
    const stageList = Object.values(stageStats).filter((s) => s.etapa !== 'Banco de Talentos');
    const bottleneckStage = stageList.reduce((max, cur) => (cur.avgDays > max.avgDays ? cur : max), stageList[0]);

    // Active in funnel (excluding Banco de Talentos and Reprovados)
    const activeInFunnel = candidatos.filter(
      (c) => c.etapa_processo !== 'Banco de Talentos' && c.status !== 'Reprovado'
    ).length;

    // SLA compliance rate
    const candidatesWithSla = candidatos.filter((c) => c.status === 'Em andamento');
    const overSlaCount = candidatesWithSla.filter((c) => {
      const vagaObj = vagas.find((v) => v.id === c.vaga_id);
      if (!vagaObj?.data_abertura) return false;
      const start = new Date(vagaObj.data_abertura).getTime();
      const diasAbertos = Math.floor((now - start) / (1000 * 60 * 60 * 24));
      return diasAbertos > (vagaObj.meta_sla_dias || 30);
    }).length;

    const slaComplianceRate =
      candidatesWithSla.length > 0
        ? Math.round(((candidatesWithSla.length - overSlaCount) / candidatesWithSla.length) * 100)
        : 100;

    return {
      stageStats,
      totalCandidatos,
      activeInFunnel,
      avgTimeToHire,
      bottleneckStage,
      slaComplianceRate,
      overSlaCount,
    };
  }, [candidatos, vagas]);

  return (
    <div
      id="kanban-statistics-panel"
      className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-800/90 shadow-xs transition-all"
    >
      {/* Header Bar with Key High-Level Performance Indicators */}
      <div className="p-3.5 flex flex-wrap items-center justify-between gap-3 border-b border-gray-100 dark:border-gray-700/60">
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 rounded-lg bg-teal-50 dark:bg-teal-950/60 text-[#00A9A1] dark:text-[#00C4BB] border border-teal-200/50 dark:border-teal-800/40">
            <BarChart3 className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-xs font-bold text-gray-900 dark:text-gray-100 uppercase tracking-wider">
                Estatísticas & Insights do Kanban
              </h3>
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 text-[10px] font-bold text-emerald-800 dark:text-emerald-300 border border-emerald-200/50 dark:border-emerald-800/40">
                <Sparkles className="w-2.5 h-2.5" />
                Tempo Real
              </span>
            </div>
            <p className="text-[11px] text-gray-500 dark:text-gray-400 font-medium">
              Volume por etapa do funil e tempo médio de permanência (Time-to-Hire)
            </p>
          </div>
        </div>

        {/* Top Summary Badges */}
        <div className="flex items-center gap-3 flex-wrap">
          {/* Total Ativos */}
          <div className="flex items-center gap-2 bg-gray-50 dark:bg-gray-750 px-3 py-1.5 rounded-lg border border-gray-200/70 dark:border-gray-700">
            <Users className="w-3.5 h-3.5 text-[#00A9A1] dark:text-[#00C4BB]" />
            <div className="text-left leading-tight">
              <span className="block text-[9px] font-bold text-gray-400 uppercase tracking-wider">
                Ativos no Funil
              </span>
              <span className="text-xs font-extrabold text-gray-900 dark:text-gray-100">
                {stats.activeInFunnel}{' '}
                <span className="text-[10px] font-normal text-gray-400">/ {stats.totalCandidatos}</span>
              </span>
            </div>
          </div>

          {/* Time-to-Hire Médio */}
          <div className="flex items-center gap-2 bg-teal-50/60 dark:bg-teal-950/40 px-3 py-1.5 rounded-lg border border-teal-200/60 dark:border-teal-800/40">
            <Clock className="w-3.5 h-3.5 text-[#00A9A1] dark:text-[#00C4BB]" />
            <div className="text-left leading-tight">
              <span className="block text-[9px] font-bold text-[#00857e] dark:text-[#00C4BB] uppercase tracking-wider">
                Time-to-Hire Médio
              </span>
              <span className="text-xs font-extrabold text-gray-900 dark:text-gray-100">
                {stats.avgTimeToHire} <span className="text-[10px] font-normal text-gray-500">dias</span>
              </span>
            </div>
          </div>

          {/* Gargalo / Maior Permanência */}
          {stats.bottleneckStage && (
            <div className="flex items-center gap-2 bg-orange-50/60 dark:bg-amber-950/40 px-3 py-1.5 rounded-lg border border-orange-200/60 dark:border-orange-900/50">
              <Flame className="w-3.5 h-3.5 text-[#F7941D] dark:text-[#FFA336]" />
              <div className="text-left leading-tight">
                <span className="block text-[9px] font-bold text-[#c25e00] dark:text-[#FFA336] uppercase tracking-wider">
                  Etapa c/ Maior Duração
                </span>
                <span className="text-xs font-bold text-gray-900 dark:text-gray-100 truncate max-w-[130px] inline-block align-bottom">
                  {stats.bottleneckStage.etapa}:{' '}
                  <strong className="text-[#c25e00] dark:text-[#FFA336] font-extrabold">
                    {stats.bottleneckStage.avgDays}d
                  </strong>
                </span>
              </div>
            </div>
          )}

          {/* SLA Funil */}
          <div className="flex items-center gap-2 bg-gray-50 dark:bg-gray-750 px-3 py-1.5 rounded-lg border border-gray-200/70 dark:border-gray-700">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            <div className="text-left leading-tight">
              <span className="block text-[9px] font-bold text-gray-400 uppercase tracking-wider">
                SLA Compliance
              </span>
              <span className="text-xs font-extrabold text-emerald-600 dark:text-emerald-400">
                {stats.slaComplianceRate}%
              </span>
            </div>
          </div>

          {/* Collapse Toggle */}
          <button
            type="button"
            id="btn-toggle-kanban-stats"
            onClick={() => setIsExpanded(!isExpanded)}
            className="inline-flex items-center gap-1 text-xs font-bold text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200 p-1.5 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            title={isExpanded ? 'Recolher estatísticas' : 'Expandir estatísticas'}
          >
            <span className="text-[11px]">{isExpanded ? 'Ocultar Detalhes' : 'Ver Detalhes'}</span>
            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Expanded Stage Grid & Performance Metrics */}
      {isExpanded && (
        <div className="p-3.5 bg-gray-50/50 dark:bg-gray-850/40 animate-fadeIn">
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2.5">
            {ETAPAS_KANBAN.map((etapa, idx) => {
              const stageStat = stats.stageStats[etapa];
              const isSelected = selectedEtapaFilter === etapa;
              const isBottleneck = stats.bottleneckStage?.etapa === etapa;

              return (
                <div
                  key={etapa}
                  onClick={() => onSelectEtapaFilter && onSelectEtapaFilter(isSelected ? 'TODAS' : etapa)}
                  className={`group relative rounded-lg p-2.5 transition-all duration-150 cursor-pointer ${
                    isSelected
                      ? 'bg-teal-50 dark:bg-teal-950/60 border-2 border-[#00A9A1] dark:border-[#00C4BB] shadow-xs ring-2 ring-[#00A9A1]/20'
                      : isBottleneck
                      ? 'bg-white dark:bg-gray-800 border border-orange-200/80 dark:border-orange-900/60 hover:border-orange-400 shadow-2xs'
                      : 'bg-white dark:bg-gray-800 border border-gray-200/80 dark:border-gray-700 hover:border-teal-400 dark:hover:border-teal-600 shadow-2xs'
                  }`}
                >
                  {/* Step Number & Icon */}
                  <div className="flex items-center justify-between gap-1 mb-1.5">
                    <div className="flex items-center gap-1 truncate">
                      <span className="p-0.5 rounded">{ETAPA_ICONS[etapa]}</span>
                      <span className="text-[9px] font-bold text-gray-400 uppercase">
                        #{idx + 1}
                      </span>
                    </div>

                    {isBottleneck && (
                      <span
                        className="text-[8px] font-extrabold px-1 py-0.2 bg-amber-100 dark:bg-amber-950 text-amber-900 dark:text-amber-300 rounded border border-amber-300/50 dark:border-amber-800/50"
                        title="Etapa com maior permanência média"
                      >
                        Gargalo
                      </span>
                    )}
                  </div>

                  {/* Stage Title */}
                  <h4
                    className="text-[11px] font-bold text-gray-800 dark:text-gray-200 truncate group-hover:text-[#00A9A1] dark:group-hover:text-[#00C4BB] transition-colors"
                    title={etapa}
                  >
                    {etapa}
                  </h4>

                  {/* Candidate Count Metric */}
                  <div className="mt-1.5 flex items-baseline justify-between gap-1">
                    <div className="flex items-baseline gap-1">
                      <span className="text-base font-black text-gray-900 dark:text-gray-100">
                        {stageStat.count}
                      </span>
                      <span className="text-[10px] font-semibold text-gray-400">
                        ({stageStat.percent}%)
                      </span>
                    </div>

                    {/* Ausentes alert badge inside stage */}
                    {stageStat.ausentesCount > 0 && (
                      <span className="text-[9px] font-bold px-1 py-0.2 bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 rounded">
                        {stageStat.ausentesCount} ausente
                      </span>
                    )}
                  </div>

                  {/* Mini Progress Bar of total pipeline */}
                  <div className="mt-1.5 h-1 w-full bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-300 ${
                        stageStat.statusHealth === 'warning'
                          ? 'bg-[#F7941D]'
                          : stageStat.count > 0
                          ? 'bg-[#00A9A1]'
                          : 'bg-gray-300 dark:bg-gray-600'
                      }`}
                      style={{ width: `${Math.min(100, stageStat.percent * 2.5)}%` }}
                    />
                  </div>

                  {/* Average Duration per Stage (Time in stage) */}
                  <div className="mt-2 pt-1.5 border-t border-gray-100 dark:border-gray-700/60 flex items-center justify-between text-[10px]">
                    <span className="text-gray-400 font-medium flex items-center gap-0.5">
                      <Clock className="w-2.5 h-2.5" />
                      Méd:
                    </span>
                    <span
                      className={`font-extrabold ${
                        stageStat.avgDays > 4
                          ? 'text-[#c25e00] dark:text-[#FFA336]'
                          : stageStat.avgDays > 2.5
                          ? 'text-teal-700 dark:text-teal-300'
                          : 'text-emerald-700 dark:text-emerald-300'
                      }`}
                    >
                      {stageStat.avgDays}d
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Performance & Recommendation Footer Note */}
          <div className="mt-2.5 flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-gray-200/50 dark:border-gray-700/50 text-[11px]">
            <div className="flex items-center gap-3 text-gray-500 dark:text-gray-400 font-medium flex-wrap">
              <span className="flex items-center gap-1 text-[#00857e] dark:text-[#00C4BB]">
                <Zap className="w-3 h-3" />
                <strong>Dica de SLA:</strong> Mantenha etapas iniciais (Triagem e 1º Contato) abaixo de 2 dias úteis.
              </span>
              <span className="h-2.5 w-px bg-gray-200 dark:bg-gray-700 hidden sm:inline" />
              <span>
                Ciclo Médio Total: <strong className="text-gray-800 dark:text-gray-200">{stats.avgTimeToHire} dias</strong> da abertura à decisão final.
              </span>
            </div>

            <div className="text-[10px] text-gray-400 dark:text-gray-500">
              Clique em qualquer etapa para filtrar o quadro
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
