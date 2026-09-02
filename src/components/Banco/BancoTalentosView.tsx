import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { UNIDADES_VOX } from '../../lib/rsConstants';
import { Candidato } from '../../types';
import { formatDateBR } from '../../lib/formatters';
import {
  Archive,
  Search,
  Filter,
  Star,
  MapPin,
  FileText,
  Video,
  MessageCircle,
  Clock,
  Briefcase,
  ChevronRight,
} from 'lucide-react';

export const BancoTalentosView: React.FC = () => {
  const {
    candidatos,
    vagas,
    selectedUnidade,
    setSelectedUnidade,
    setCandidateModalId,
    setWhatsAppModalCandidate,
    moveCandidatoEtapa,
  } = useApp();

  const [searchTerm, setSearchTerm] = useState('');
  const [cargoFilter, setCargoFilter] = useState('TODOS');

  // Filter candidates in Banco or past candidates
  const bancoCandidatos = candidatos.filter((cand) => {
    if (selectedUnidade !== 'TODAS' && cand.unidade !== selectedUnidade) return false;
    if (cargoFilter !== 'TODOS') {
      const vagaObj = vagas.find((v) => v.id === cand.vaga_id);
      if (vagaObj?.cargo !== cargoFilter) return false;
    }
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      const matchNome = cand.nome.toLowerCase().includes(term);
      const matchVaga = cand.vaga_titulo.toLowerCase().includes(term);
      const matchNotas = (cand.notas_entrevista || '').toLowerCase().includes(term);
      if (!matchNome && !matchVaga && !matchNotas) return false;
    }
    return true;
  });

  return (
    <div className="space-y-3.5">
      {/* Top Header */}
      <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-4 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <Archive className="w-4 h-4 text-amber-500" />
              Banco de Talentos & Histórico de Candidatos
            </h2>
            <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5">
              Repositório unificado de currículos e perfis avaliados para rápida recolocação em novas turmas ou vagas.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="rounded-md bg-amber-50 dark:bg-amber-950/50 px-2.5 py-1 text-xs font-bold text-amber-800 dark:text-amber-300 border border-amber-200/70 dark:border-amber-800">
              {bancoCandidatos.length} Perfis Disponíveis
            </span>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2.5 mt-3.5 pt-3 border-t border-gray-100 dark:border-gray-700 text-xs">
          <div className="relative min-w-[220px] flex-1 max-w-xs">
            <Search className="w-3.5 h-3.5 text-gray-400 dark:text-gray-500 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar por nome, competências ou notas..."
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
        </div>
      </div>

      {/* Grid of Candidate Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
        {bancoCandidatos.map((cand) => {
          const vagaObj = vagas.find((v) => v.id === cand.vaga_id);

          return (
            <div
              key={cand.id}
              onClick={() => setCandidateModalId(cand.id)}
              className="cursor-pointer rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-3.5 shadow-xs hover:border-[#00A9A1] dark:hover:border-[#00C4BB] transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <span className="flex items-center gap-1 font-semibold text-gray-600 dark:text-gray-300 text-[11px]">
                    <MapPin className="w-3 h-3 text-[#00A9A1] dark:text-[#00C4BB]" />
                    {cand.unidade.replace('Vox ', '')}
                  </span>
                  <span
                    className={`rounded px-1.5 py-0.5 text-[9px] font-bold ${
                      cand.status === 'Aprovado'
                        ? 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                        : cand.etapa_processo === 'Banco de Talentos'
                        ? 'bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800'
                        : 'bg-teal-50 dark:bg-teal-950/50 text-teal-700 dark:text-teal-300 border border-teal-200 dark:border-teal-800'
                    }`}
                  >
                    {cand.etapa_processo}
                  </span>
                </div>

                <h4 className="text-xs font-bold text-gray-900 dark:text-white leading-snug">{cand.nome}</h4>
                <p className="text-[11px] text-gray-400 mt-0.5">{cand.vaga_titulo}</p>

                {cand.notas_entrevista && (
                  <p className="mt-2 rounded bg-gray-50 dark:bg-gray-850 p-2 text-[11px] text-gray-600 dark:text-gray-300 italic line-clamp-2 border border-gray-100 dark:border-gray-700">
                    "{cand.notas_entrevista}"
                  </p>
                )}
              </div>

              <div className="mt-3 pt-2.5 border-t border-gray-100 dark:border-gray-700 flex items-center justify-between text-xs">
                <div className="flex items-center gap-1 text-amber-500 font-bold text-xs">
                  {cand.avaliacao_geral ? (
                    <>
                      <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                      <span>{cand.avaliacao_geral}/5</span>
                    </>
                  ) : (
                    <span className="text-gray-400 font-normal text-[11px]">Sem nota</span>
                  )}
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setWhatsAppModalCandidate(cand);
                    }}
                    className="p-1 rounded bg-[#00A9A1] hover:bg-[#008f88] dark:bg-[#00A9A1] dark:hover:bg-[#00C4BB] text-white shadow-xs"
                    title="WhatsApp"
                  >
                    <MessageCircle className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      moveCandidatoEtapa(cand.id, 'Triagem', 'Reativado do Banco de Talentos');
                    }}
                    className="px-2 py-1 rounded border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 text-[11px] font-semibold shadow-xs"
                  >
                    Reativar
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
