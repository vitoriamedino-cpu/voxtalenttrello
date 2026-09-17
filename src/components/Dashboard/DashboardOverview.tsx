import React from 'react';
import { useApp } from '../../context/AppContext';
import { useWorkspace } from '../../context/WorkspaceContext';
import { ETAPAS_KANBAN, UNIDADES_VOX } from '../../lib/rsConstants';
import { calculateVagaSLA } from '../../lib/formatters';
import {
  Users,
  Briefcase,
  AlertTriangle,
  Video,
  UserX,
  Calendar,
  ChevronRight,
  TrendingUp,
  Award,
  Clock,
  MapPin,
  Sparkles,
  ArrowUpRight,
  GraduationCap,
  FileSpreadsheet,
  RefreshCw,
  ExternalLink,
} from 'lucide-react';

export const DashboardOverview: React.FC = () => {
  const {
    vagas,
    candidatos,
    config,
    setActiveTab,
    setKanbanFilterStatus,
    setKanbanFilterEtapa,
    setSelectedVagaFilter,
    setSelectedUnidade,
    setCandidateModalId,
    setColetivaScheduleVagaId,
    masterSpreadsheetId,
    masterSpreadsheetUrl,
    isSheetsSyncing,
    lastSheetsSyncTime,
    syncWithGoogleSheets,
  } = useApp();
  const { isConnected } = useWorkspace();

  // Metrics
  const vagasAbertas = vagas.filter((v) => v.status === 'Em aberto');
  const candidatosEmAndamento = candidatos.filter((c) => c.status === 'Em andamento');
  const candidatosAprovados = candidatos.filter((c) => c.status === 'Aprovado');

  // Audit Fix #7: Contagem exata de Ausentes e Fila de Vídeo de Apresentação
  const candidatosAusentes = candidatos.filter((c) => c.status === 'Ausente');
  const candidatosFilaVideo = candidatos.filter(
    (c) => c.etapa_processo === 'Vídeo de Apresentação' && c.status === 'Em andamento'
  );

  // Vagas com SLA estourado
  const vagasOverSla = vagasAbertas.filter(
    (v) => calculateVagaSLA(v.data_abertura, v.meta_sla_dias).isOverSla
  );

  // Coletivas no mínimo atingido (Audit Fix #2 logic)
  const coletivaPorVaga: Record<string, number> = {};
  candidatos
    .filter(
      (c) => c.etapa_processo === 'Entrevista Coletiva (RH)' && c.status === 'Em andamento'
    )
    .forEach((c) => {
      coletivaPorVaga[c.vaga_id] = (coletivaPorVaga[c.vaga_id] || 0) + 1;
    });

  const vagasProntasColetiva = Object.entries(coletivaPorVaga)
    .filter(([, count]) => count >= (config.min_coletiva || 5))
    .map(([vagaId]) => vagas.find((v) => v.id === vagaId))
    .filter(Boolean);

  // Quick shortcut helper to Kanban with filters
  const handleGoToAusentes = () => {
    setKanbanFilterStatus('Ausente');
    setKanbanFilterEtapa('TODAS');
    setActiveTab('kanban');
  };

  const handleGoToVideoFila = () => {
    setKanbanFilterStatus('TODOS');
    setKanbanFilterEtapa('Vídeo de Apresentação');
    setActiveTab('kanban');
  };

  return (
    <div className="space-y-6">
      {/* Top Banner / Welcome */}
      <div className="rounded-xl bg-slate-900 p-6 text-white shadow-sm relative overflow-hidden">
        <div className="relative z-10 max-w-2xl">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-[#00A9A1]/20 px-2.5 py-0.5 text-[10px] font-bold text-teal-300 border border-[#00A9A1]/40 mb-2.5">
            <Sparkles className="w-3 h-3" />
            VoxTalent R&S OS • Sistema de Alta Performance
          </span>
          <h1 className="text-xl md:text-2xl font-bold tracking-tight text-white">
            Painel Executivo de Recrutamento & Seleção
          </h1>
          <p className="text-slate-300 text-xs mt-1.5 leading-relaxed">
            Monitoramento de SLAs, pipeline de candidatos, gatilhos de entrevista coletiva e automação de contatos para as 9 unidades da rede Vox2you.
          </p>
        </div>

        {/* Decorative background shape */}
        <div className="absolute right-0 top-0 -mt-12 -mr-12 h-64 w-64 rounded-full bg-[#00A9A1]/10 blur-3xl" />
        <div className="absolute right-32 bottom-0 -mb-12 h-48 w-48 rounded-full bg-[#F7941D]/10 blur-2xl" />
      </div>

      {/* Google Sheets Live Database Connection Status Bar */}
      {isConnected && (
        <div className="rounded-xl border border-emerald-200 dark:border-emerald-800/80 bg-white dark:bg-[#111827] p-3.5 shadow-2xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-emerald-100 dark:bg-emerald-950 text-emerald-600 flex items-center justify-center flex-shrink-0">
              <FileSpreadsheet className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-gray-900 dark:text-white">
                  Google Sheets: Aba &quot;Painel de Controle&quot; Sincronizada
                </span>
                <span className="inline-flex items-center gap-1 px-2 py-0.2 rounded-full text-[9px] font-extrabold uppercase bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Live DB
                </span>
              </div>
              <p className="text-[11px] text-gray-500 dark:text-gray-400">
                Os números deste dashboard alimentam e espelham a planilha mestre central em tempo real.
                {lastSheetsSyncTime && ` (Última sincronização: ${lastSheetsSyncTime})`}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-center flex-shrink-0">
            <button
              type="button"
              disabled={isSheetsSyncing}
              onClick={() => syncWithGoogleSheets(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/60 dark:hover:bg-emerald-900 text-emerald-700 dark:text-emerald-300 text-xs font-semibold border border-emerald-200 dark:border-emerald-800 transition-colors"
            >
              <RefreshCw className={`w-3 h-3 ${isSheetsSyncing ? 'animate-spin' : ''}`} />
              <span>{isSheetsSyncing ? 'Atualizando...' : 'Atualizar Sheets'}</span>
            </button>
            {masterSpreadsheetUrl && (
              <a
                href={masterSpreadsheetUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#00A9A1] hover:bg-[#008f88] text-white text-xs font-semibold shadow-2xs transition-colors"
              >
                <ExternalLink className="w-3 h-3" />
                <span>Ver Planilha</span>
              </a>
            )}
          </div>
        </div>
      )}

      {/* Audit Fix #7: Destaques prioritários com atalhos diretos ao Kanban */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Ausentes para Reagendamento (Audit Fix #7) */}
        <div
          id="stat-card-ausentes"
          onClick={handleGoToAusentes}
          className="group cursor-pointer rounded-lg border border-amber-200 dark:border-amber-900/60 bg-white dark:bg-gray-800/90 p-4 shadow-xs transition-all duration-150 hover:shadow-sm hover:border-[#F7941D] dark:hover:border-[#FFA336]"
        >
          <div className="flex items-center justify-between">
            <div className="flex h-8 w-8 items-center justify-center rounded bg-[#F7941D] dark:bg-[#FFA336] text-white dark:text-gray-950 shadow-xs">
              <UserX className="w-4 h-4" />
            </div>
            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-[#c25e00] dark:text-[#FFA336] group-hover:translate-x-0.5 transition-transform">
              Ver no Kanban <ArrowUpRight className="w-3 h-3" />
            </span>
          </div>
          <div className="mt-3">
            <h4 className="text-2xl font-black text-gray-900 dark:text-white">
              {candidatosAusentes.length}
            </h4>
            <p className="text-xs font-bold text-gray-800 dark:text-gray-200 mt-0.5">
              Candidatos Ausentes
            </p>
            <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-1 leading-snug">
              Necessitam de novo contato para reagendar entrevista.
            </p>
          </div>
        </div>

        {/* Card 2: Fila de Vídeo de Apresentação (Audit Fix #7) */}
        <div
          id="stat-card-video"
          onClick={handleGoToVideoFila}
          className="group cursor-pointer rounded-lg border border-teal-200 dark:border-teal-900/60 bg-white dark:bg-gray-800/90 p-4 shadow-xs transition-all duration-150 hover:shadow-sm hover:border-[#00A9A1] dark:hover:border-[#00C4BB]"
        >
          <div className="flex items-center justify-between">
            <div className="flex h-8 w-8 items-center justify-center rounded bg-[#00A9A1] dark:bg-[#00C4BB] text-white dark:text-gray-950 shadow-xs">
              <Video className="w-4 h-4" />
            </div>
            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-[#00857e] dark:text-[#00C4BB] group-hover:translate-x-0.5 transition-transform">
              Ver Fila <ArrowUpRight className="w-3 h-3" />
            </span>
          </div>
          <div className="mt-3">
            <h4 className="text-2xl font-black text-gray-900 dark:text-white">
              {candidatosFilaVideo.length}
            </h4>
            <p className="text-xs font-bold text-gray-800 dark:text-gray-200 mt-0.5">
              Fila: Vídeo de Apresentação
            </p>
            <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-1 leading-snug">
              Candidatos aguardando envio ou avaliação de pitch.
            </p>
          </div>
        </div>

        {/* Card 3: Vagas com SLA Excedido */}
        <div
          id="stat-card-sla"
          onClick={() => setActiveTab('vagas')}
          className="group cursor-pointer rounded-lg border border-red-200 dark:border-red-900/60 bg-white dark:bg-gray-800/90 p-4 shadow-xs transition-all duration-150 hover:shadow-sm hover:border-red-400"
        >
          <div className="flex items-center justify-between">
            <div className="flex h-8 w-8 items-center justify-center rounded bg-red-600 dark:bg-red-500 text-white shadow-xs">
              <AlertTriangle className="w-4 h-4" />
            </div>
            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-red-600 dark:text-red-400 group-hover:translate-x-0.5 transition-transform">
              Ver Vagas <ArrowUpRight className="w-3 h-3" />
            </span>
          </div>
          <div className="mt-3">
            <h4 className="text-2xl font-black text-gray-900 dark:text-white">
              {vagasOverSla.length}
            </h4>
            <p className="text-xs font-bold text-gray-800 dark:text-gray-200 mt-0.5">
              Vagas em Alerta de SLA
            </p>
            <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-1 leading-snug">
              Vagas que ultrapassaram o tempo limite de fechamento.
            </p>
          </div>
        </div>

        {/* Card 4: Coletivas Prontas para Agendamento */}
        <div
          id="stat-card-coletiva"
          onClick={() => {
            if (vagasProntasColetiva[0]) {
              setColetivaScheduleVagaId(vagasProntasColetiva[0].id);
            } else {
              setActiveTab('kanban');
            }
          }}
          className="group cursor-pointer rounded-lg border border-indigo-200 dark:border-indigo-900/60 bg-white dark:bg-gray-800/90 p-4 shadow-xs transition-all duration-150 hover:shadow-sm hover:border-indigo-400"
        >
          <div className="flex items-center justify-between">
            <div className="flex h-8 w-8 items-center justify-center rounded bg-indigo-600 dark:bg-indigo-500 text-white shadow-xs">
              <Calendar className="w-4 h-4" />
            </div>
            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-indigo-600 dark:text-indigo-400 group-hover:translate-x-0.5 transition-transform">
              Agendar <ArrowUpRight className="w-3 h-3" />
            </span>
          </div>
          <div className="mt-3">
            <h4 className="text-2xl font-black text-gray-900 dark:text-white">
              {vagasProntasColetiva.length}
            </h4>
            <p className="text-xs font-bold text-gray-800 dark:text-gray-200 mt-0.5">
              Gatilhos de Coletiva ({config.min_coletiva}+ cand.)
            </p>
            <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-1 leading-snug">
              Vagas com quórum para abrir sala coletiva.
            </p>
          </div>
        </div>
      </div>

      {/* Main Grid: Funil de Candidatos + Vagas Críticas */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Funil de Candidatos por Etapa */}
        <div className="lg:col-span-2 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-800/90 p-5 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-[#00A9A1] dark:text-[#00C4BB]" />
                Volume de Candidatos por Etapa do Processo
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400">Distribuição ao longo das 8 fases do funil</p>
            </div>
            <button
              type="button"
              onClick={() => setActiveTab('kanban')}
              className="text-xs font-bold text-[#00857e] dark:text-[#00C4BB] hover:underline flex items-center gap-1"
            >
              Abrir Kanban Completo <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-2.5 pt-1">
            {ETAPAS_KANBAN.map((etapa) => {
              const count = candidatos.filter((c) => c.etapa_processo === etapa).length;
              const maxCount = Math.max(1, ...ETAPAS_KANBAN.map((e) => candidatos.filter((c) => c.etapa_processo === e).length));
              const percent = Math.round((count / maxCount) * 100);

              const isVideo = etapa === 'Vídeo de Apresentação';
              const isColetiva = etapa === 'Entrevista Coletiva/Online';

              return (
                <div
                  key={etapa}
                  onClick={() => {
                    setKanbanFilterEtapa(etapa);
                    setKanbanFilterStatus('TODOS');
                    setActiveTab('kanban');
                  }}
                  className="group cursor-pointer rounded-md p-2 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                >
                  <div className="flex items-center justify-between text-xs font-semibold mb-1">
                    <span className="text-gray-800 dark:text-gray-200 flex items-center gap-1.5">
                      {etapa}
                      {isVideo && (
                        <span className="text-[9px] bg-amber-100 dark:bg-amber-900/50 text-[#c25e00] dark:text-[#FFA336] px-1.5 py-0.2 rounded font-bold uppercase">
                          Gargalo
                        </span>
                      )}
                    </span>
                    <span className="text-gray-900 dark:text-gray-100 font-bold">
                      {count} candidatos
                    </span>
                  </div>
                  <div className="w-full bg-gray-100 dark:bg-gray-700 rounded-full h-2 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        isVideo
                          ? 'bg-[#F7941D] dark:bg-[#FFA336]'
                          : isColetiva
                          ? 'bg-indigo-500 dark:bg-indigo-400'
                          : 'bg-[#00A9A1] dark:bg-[#00C4BB]'
                      }`}
                      style={{ width: `${Math.max(6, percent)}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Vagas Ativas & Alertas de SLA */}
        <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-800/90 p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <Clock className="w-4 h-4 text-red-500 dark:text-red-400" />
                Vagas Prioritárias
              </h3>
              <button
                type="button"
                onClick={() => setActiveTab('vagas')}
                className="text-xs font-bold text-[#00857e] dark:text-[#00C4BB] hover:underline"
              >
                Ver Todas
              </button>
            </div>

            <div className="space-y-2.5">
              {vagasAbertas.slice(0, 4).map((vaga) => {
                const sla = calculateVagaSLA(vaga.data_abertura, vaga.meta_sla_dias);
                const candCount = candidatos.filter((c) => c.vaga_id === vaga.id).length;

                return (
                  <div
                    key={vaga.id}
                    className={`p-3 rounded-lg border transition-all ${
                      sla.isOverSla
                        ? 'border-red-200 dark:border-red-900/60 bg-red-50/50 dark:bg-red-950/20'
                        : 'border-gray-200 dark:border-gray-700 bg-gray-50/40 dark:bg-gray-750 hover:border-teal-300 dark:hover:border-teal-600'
                    }`}
                  >
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="font-bold text-gray-900 dark:text-gray-100 truncate pr-2">
                        {vaga.titulo}
                      </span>
                      {sla.isOverSla ? (
                        <span className="text-[9px] bg-red-100 dark:bg-red-900/50 text-red-700 dark:text-red-300 px-1.5 py-0.5 rounded font-bold">
                          SLA +{sla.diasAbertos - sla.metaSla}d
                        </span>
                      ) : (
                        <span className="text-[10px] text-gray-500 dark:text-gray-400 font-medium">
                          {sla.diasRestantes}d restantes
                        </span>
                      )}
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-gray-500 dark:text-gray-400">
                      <span>{vaga.unidade.replace('Vox ', '')} • {vaga.cargo}</span>
                      <span className="font-semibold text-gray-700 dark:text-gray-300">{candCount} no fluxo</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="mt-4 pt-3.5 border-t border-gray-100 dark:border-gray-700/60">
            <div className="rounded-lg bg-teal-50/80 dark:bg-teal-950/30 p-2.5 text-xs text-teal-950 dark:text-teal-200 border border-teal-200/60 dark:border-teal-800/50">
              <span className="font-bold block mb-0.5">💡 Dica de Processo:</span>
              Mantenha o toggle de <strong>Fluxo Simplificado</strong> ativo para vagas de Professores
              para acelerar a avaliação de didática e palco!
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
