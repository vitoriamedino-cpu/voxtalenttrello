import React, { useState, useRef, useEffect, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { Candidato, EtapaProcesso } from '../../types';
import {
  Search,
  X,
  User,
  Phone,
  Briefcase,
  MapPin,
  MessageCircle,
  ExternalLink,
  Archive,
  ChevronRight,
  Sparkles,
  Command,
} from 'lucide-react';

export const GlobalSearchBar: React.FC = () => {
  const {
    candidatos,
    vagas,
    setActiveTab,
    setSearchTerm,
    setCandidateModalId,
    setWhatsAppModalCandidate,
    setKanbanFilterEtapa,
    setKanbanFilterStatus,
    setSelectedUnidade,
  } = useApp();

  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const searchContainerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Keyboard shortcut (Ctrl+K or Cmd+K or '/')
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        inputRef.current?.focus();
        setIsOpen(true);
      } else if (e.key === 'Escape') {
        setIsOpen(false);
        inputRef.current?.blur();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Filter candidates across all Kanban columns and Talent Bank
  const cleanPhone = (phoneStr: string) => phoneStr.replace(/\D/g, '');

  const searchResults = useMemo(() => {
    const trimmed = query.trim().toLowerCase();
    if (!trimmed) return [];

    const digitsOnly = cleanPhone(trimmed);

    return candidatos.filter((cand) => {
      // Search by Name
      const matchName = cand.nome.toLowerCase().includes(trimmed);

      // Search by Phone (both formatted and unformatted digits)
      const candDigits = cleanPhone(cand.telefone || '');
      const matchPhone =
        (cand.telefone || '').toLowerCase().includes(trimmed) ||
        (digitsOnly.length >= 3 && candDigits.includes(digitsOnly));

      // Search by Email
      const matchEmail = (cand.email || '').toLowerCase().includes(trimmed);

      // Search by Job Title / Vacancy
      const matchVaga = (cand.vaga_titulo || '').toLowerCase().includes(trimmed);

      // Search by Unit
      const matchUnidade = (cand.unidade || '').toLowerCase().includes(trimmed);

      return matchName || matchPhone || matchEmail || matchVaga || matchUnidade;
    });
  }, [candidatos, query]);

  const kanbanCandidates = useMemo(
    () => searchResults.filter((c) => c.etapa_processo !== 'Banco de Talentos'),
    [searchResults]
  );

  const bancoCandidates = useMemo(
    () => searchResults.filter((c) => c.etapa_processo === 'Banco de Talentos'),
    [searchResults]
  );

  const handleSelectCandidate = (cand: Candidato) => {
    setCandidateModalId(cand.id);
    setIsOpen(false);
  };

  const handleNavigateToKanban = (cand?: Candidato) => {
    setActiveTab('kanban');
    if (cand) {
      setSearchTerm(cand.nome);
    } else if (query.trim()) {
      setSearchTerm(query.trim());
    }
    setIsOpen(false);
  };

  const handleNavigateToBanco = (cand?: Candidato) => {
    setActiveTab('banco');
    if (cand) {
      setSearchTerm(cand.nome);
    } else if (query.trim()) {
      setSearchTerm(query.trim());
    }
    setIsOpen(false);
  };

  const getStageBadgeColor = (etapa: EtapaProcesso) => {
    switch (etapa) {
      case 'Triagem':
        return 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700';
      case '1º Contato':
        return 'bg-sky-50 dark:bg-sky-950/60 text-sky-700 dark:text-sky-300 border-sky-200 dark:border-sky-800';
      case 'Vídeo de Apresentação':
        return 'bg-orange-50 dark:bg-orange-950/60 text-orange-700 dark:text-orange-300 border-orange-200 dark:border-orange-800';
      case 'Entrevista Coletiva/Online':
        return 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800';
      case 'Etapa Prática':
        return 'bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300 border-teal-200 dark:border-teal-800';
      case 'Gestor':
        return 'bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800';
      case 'Diretoria':
        return 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800';
      case 'Banco de Talentos':
        return 'bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800';
      default:
        return 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300';
    }
  };

  const getStatusDotColor = (status: string) => {
    switch (status) {
      case 'Aprovado':
        return 'bg-emerald-500 ring-emerald-300';
      case 'Ausente':
        return 'bg-[#F7941D] ring-amber-300';
      case 'Reprovado':
        return 'bg-rose-400 ring-rose-200';
      case 'Desistente':
        return 'bg-gray-400 ring-gray-300';
      default:
        return 'bg-[#00A9A1] ring-teal-300';
    }
  };

  return (
    <div ref={searchContainerRef} className="relative flex-1 max-w-xs sm:max-w-sm md:max-w-md lg:max-w-lg mx-2 sm:mx-4">
      {/* Search Input Box */}
      <div className="relative flex items-center">
        <Search className="w-4 h-4 text-gray-400 dark:text-gray-500 absolute left-3 pointer-events-none transition-colors" />
        <input
          ref={inputRef}
          id="global-candidate-search-input"
          type="text"
          value={query}
          onFocus={() => setIsOpen(true)}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
          }}
          placeholder="Buscar candidato por nome ou telefone..."
          className="w-full pl-9 pr-14 py-1.5 sm:py-2 text-xs sm:text-sm rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50/80 dark:bg-gray-800/90 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#00A9A1]/30 focus:border-[#00A9A1] dark:focus:border-[#00C4BB] transition-all shadow-2xs"
          autoComplete="off"
        />

        <div className="absolute right-2.5 flex items-center gap-1">
          {query ? (
            <button
              type="button"
              onClick={() => {
                setQuery('');
                setIsOpen(false);
                inputRef.current?.focus();
              }}
              className="p-0.5 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
              title="Limpar busca"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          ) : (
            <kbd className="hidden lg:inline-flex items-center gap-0.5 px-1.5 py-0.5 text-[10px] font-medium text-gray-400 dark:text-gray-500 bg-white dark:bg-gray-700/60 border border-gray-200 dark:border-gray-600/60 rounded shadow-2xs pointer-events-none">
              <Command className="w-2.5 h-2.5" /> K
            </kbd>
          )}
        </div>
      </div>

      {/* Results Dropdown Popover */}
      {isOpen && query.trim().length > 0 && (
        <div
          id="global-search-results-dropdown"
          className="absolute left-0 right-0 top-full mt-2 bg-white dark:bg-gray-850 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden z-50 animate-fadeIn divide-y divide-gray-100 dark:divide-gray-800"
        >
          {/* Header Summary */}
          <div className="px-3.5 py-2.5 bg-gray-50/90 dark:bg-gray-800/90 flex items-center justify-between text-xs">
            <span className="font-semibold text-gray-700 dark:text-gray-200 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-[#00A9A1] dark:text-[#00C4BB]" />
              <span>
                {searchResults.length} candidato(s) localizado(s) para "<strong>{query}</strong>"
              </span>
            </span>
            <div className="flex items-center gap-1.5 text-[11px]">
              <button
                type="button"
                onClick={() => handleNavigateToKanban()}
                className="font-bold text-[#00857e] dark:text-[#00C4BB] hover:underline"
              >
                Ver no Kanban
              </button>
            </div>
          </div>

          {/* Results List */}
          <div className="max-h-[380px] overflow-y-auto p-1.5 space-y-1">
            {searchResults.length === 0 ? (
              <div className="py-8 text-center px-4">
                <User className="w-8 h-8 mx-auto text-gray-300 dark:text-gray-600 mb-2" />
                <p className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                  Nenhum candidato encontrado
                </p>
                <p className="text-[11px] text-gray-400 dark:text-gray-500 mt-0.5">
                  Verifique se o nome ou número de telefone digitados estão corretos.
                </p>
              </div>
            ) : (
              <>
                {/* Kanban Group */}
                {kanbanCandidates.length > 0 && (
                  <div className="space-y-1">
                    <div className="px-2.5 py-1 text-[10px] font-bold text-gray-400 dark:text-gray-400 uppercase tracking-wider flex items-center justify-between">
                      <span>Processos no Kanban ({kanbanCandidates.length})</span>
                    </div>

                    {kanbanCandidates.map((cand) => (
                      <div
                        key={cand.id}
                        onClick={() => handleSelectCandidate(cand)}
                        className="group flex items-center justify-between gap-3 p-2 rounded-lg hover:bg-teal-50/60 dark:hover:bg-gray-800/80 border border-transparent hover:border-teal-200/60 dark:hover:border-teal-900/60 cursor-pointer transition-all"
                      >
                        <div className="flex items-center gap-2.5 min-w-0 flex-1">
                          {/* Status Dot Avatar */}
                          <div className="relative flex-shrink-0">
                            <div className="w-7 h-7 rounded-full bg-gray-100 dark:bg-gray-750 flex items-center justify-center font-bold text-xs text-gray-700 dark:text-gray-300">
                              {cand.nome.charAt(0).toUpperCase()}
                            </div>
                            <span
                              className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full ring-2 ring-white dark:ring-gray-850 ${getStatusDotColor(
                                cand.status
                              )}`}
                              title={`Status: ${cand.status}`}
                            />
                          </div>

                          {/* Candidate Info */}
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-bold text-gray-900 dark:text-gray-100 group-hover:text-[#00A9A1] dark:group-hover:text-[#00C4BB] transition-colors truncate">
                                {cand.nome}
                              </span>
                              <span
                                className={`text-[9px] font-bold px-1.5 py-0.5 rounded border ${getStageBadgeColor(
                                  cand.etapa_processo
                                )}`}
                              >
                                {cand.etapa_processo}
                              </span>
                            </div>

                            <div className="flex items-center gap-2.5 text-[11px] text-gray-500 dark:text-gray-400 mt-0.5 truncate">
                              <span className="flex items-center gap-1 font-medium text-gray-700 dark:text-gray-300">
                                <Phone className="w-3 h-3 text-[#00A9A1] dark:text-[#00C4BB] flex-shrink-0" />
                                {cand.telefone}
                              </span>
                              <span className="text-gray-300 dark:text-gray-600">•</span>
                              <span className="truncate">{cand.vaga_titulo}</span>
                              <span className="text-gray-300 dark:text-gray-600">•</span>
                              <span className="flex items-center gap-0.5 text-gray-500 dark:text-gray-400">
                                <MapPin className="w-2.5 h-2.5 text-gray-400" />
                                {cand.unidade.replace('Vox ', '')}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Action buttons */}
                        <div className="flex items-center gap-1 opacity-90 group-hover:opacity-100">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setWhatsAppModalCandidate(cand);
                              setIsOpen(false);
                            }}
                            className="p-1.5 rounded-md hover:bg-emerald-100 dark:hover:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 transition-colors"
                            title="Conversar via WhatsApp"
                          >
                            <MessageCircle className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleNavigateToKanban(cand);
                            }}
                            className="p-1.5 rounded-md hover:bg-gray-100 dark:hover:bg-gray-750 text-gray-500 dark:text-gray-400 hover:text-[#00A9A1] transition-colors text-[10px] font-semibold flex items-center gap-0.5"
                            title="Localizar no Kanban"
                          >
                            <span>Abrir</span>
                            <ChevronRight className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Talent Bank Group */}
                {bancoCandidates.length > 0 && (
                  <div className="space-y-1 pt-1.5">
                    <div className="px-2.5 py-1 text-[10px] font-bold text-amber-700 dark:text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                      <Archive className="w-3 h-3 text-amber-500" />
                      <span>Banco de Talentos ({bancoCandidates.length})</span>
                    </div>

                    {bancoCandidates.map((cand) => (
                      <div
                        key={cand.id}
                        onClick={() => handleSelectCandidate(cand)}
                        className="group flex items-center justify-between gap-3 p-2 rounded-lg hover:bg-amber-50/60 dark:hover:bg-gray-800/80 border border-transparent hover:border-amber-200/60 dark:hover:border-amber-900/60 cursor-pointer transition-all"
                      >
                        <div className="flex items-center gap-2.5 min-w-0 flex-1">
                          <div className="w-7 h-7 rounded-full bg-amber-100 dark:bg-amber-950/60 flex items-center justify-center font-bold text-xs text-amber-800 dark:text-amber-300 flex-shrink-0">
                            {cand.nome.charAt(0).toUpperCase()}
                          </div>

                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-bold text-gray-900 dark:text-gray-100 group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors truncate">
                                {cand.nome}
                              </span>
                              <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
                                Banco de Talentos
                              </span>
                            </div>

                            <div className="flex items-center gap-2.5 text-[11px] text-gray-500 dark:text-gray-400 mt-0.5 truncate">
                              <span className="flex items-center gap-1 font-medium text-gray-700 dark:text-gray-300">
                                <Phone className="w-3 h-3 text-amber-500 flex-shrink-0" />
                                {cand.telefone}
                              </span>
                              <span className="text-gray-300 dark:text-gray-600">•</span>
                              <span className="truncate">{cand.vaga_titulo}</span>
                              <span className="text-gray-300 dark:text-gray-600">•</span>
                              <span>{cand.unidade.replace('Vox ', '')}</span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleNavigateToBanco(cand);
                            }}
                            className="p-1.5 rounded-md hover:bg-amber-100 dark:hover:bg-amber-950 text-amber-700 dark:text-amber-300 text-[10px] font-semibold flex items-center gap-0.5"
                            title="Abrir no Banco de Talentos"
                          >
                            <span>Ver no Banco</span>
                            <ChevronRight className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>

          {/* Footer View All */}
          {searchResults.length > 0 && (
            <div className="p-2 bg-gray-50/90 dark:bg-gray-800/90 flex items-center justify-between text-xs">
              <span className="text-[11px] text-gray-500 dark:text-gray-400">
                Pressione <strong>Esc</strong> para fechar
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleNavigateToKanban()}
                  className="px-2.5 py-1 rounded bg-[#00A9A1] hover:bg-[#008f88] text-white text-[11px] font-bold transition-all shadow-xs"
                >
                  Filtrar no Kanban ({searchResults.length})
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
