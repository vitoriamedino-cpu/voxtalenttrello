import React from 'react';
import { useApp } from '../../context/AppContext';
import { useTheme } from '../../context/ThemeContext';
import {
  LayoutDashboard,
  Kanban,
  Briefcase,
  Users,
  MessageCircle,
  BarChart3,
  Settings,
  Sparkles,
  Sun,
  Moon,
  ChevronLeft,
  ChevronRight,
  MapPin,
} from 'lucide-react';

export const Sidebar: React.FC = () => {
  const {
    activeTab,
    setActiveTab,
    candidatos,
    vagas,
    selectedUnidade,
    sidebarCollapsed,
    toggleSidebarCollapsed,
  } = useApp();
  const { isDark, toggleTheme } = useTheme();

  const ausentesCount = candidatos.filter((c) => c.status === 'Ausente').length;
  const emAndamentoCount = candidatos.filter((c) => c.status === 'Em andamento').length;
  const vagasAbertasCount = vagas.filter((v) => v.status === 'Em aberto').length;
  const bancoCount = candidatos.filter(
    (c) => c.etapa_processo === 'Banco de Talentos' || c.status === 'Aprovado'
  ).length;

  const navItems = [
    {
      id: 'dashboard',
      label: 'Visão Geral',
      icon: <LayoutDashboard className="w-4 h-4" />,
      badge: ausentesCount > 0 ? `${ausentesCount}` : null,
      badgeColor: 'bg-[#F7941D] dark:bg-[#FFA336] text-white dark:text-gray-900',
    },
    {
      id: 'kanban',
      label: 'Kanban Board',
      icon: <Kanban className="w-4 h-4" />,
      count: emAndamentoCount,
    },
    {
      id: 'vagas',
      label: 'Vagas & SLAs',
      icon: <Briefcase className="w-4 h-4" />,
      count: vagasAbertasCount,
    },
    {
      id: 'banco',
      label: 'Banco de Talentos',
      icon: <Users className="w-4 h-4" />,
      count: bancoCount,
    },
    {
      id: 'mensagens',
      label: 'WhatsApp Messenger',
      icon: <MessageCircle className="w-4 h-4" />,
    },
    {
      id: 'workspace',
      label: 'Google Workspace',
      icon: <Sparkles className="w-4 h-4 text-[#00A9A1] dark:text-[#00C4BB]" />,
      badge: '5 em 1',
      badgeColor:
        'bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300 border border-teal-200 dark:border-teal-800',
    },
    {
      id: 'relatorios',
      label: 'Relatórios & Custos',
      icon: <BarChart3 className="w-4 h-4" />,
    },
    {
      id: 'configuracoes',
      label: 'Configurações',
      icon: <Settings className="w-4 h-4" />,
    },
  ];

  return (
    <aside
      id="app-sidebar"
      className={`${
        sidebarCollapsed ? 'w-[70px] min-w-[70px]' : 'w-64 min-w-[256px]'
      } bg-white dark:bg-[#111827] border-r border-gray-200 dark:border-gray-800 flex flex-col justify-between flex-shrink-0 h-screen sticky top-0 transition-all duration-200 z-30 select-none`}
    >
      <div>
        {/* Lateral Navigation Header with Retract / Expand Logic (Same as suspended list) */}
        <div
          className={`border-b border-gray-100 dark:border-gray-800 ${
            sidebarCollapsed ? 'p-3' : 'p-4 sm:p-5'
          } transition-all`}
        >
          <div className={`flex items-center ${sidebarCollapsed ? 'flex-col gap-2' : 'justify-between'}`}>
            {/* Logo & Branding */}
            <div
              className={`flex items-center gap-2.5 cursor-pointer ${
                sidebarCollapsed ? 'justify-center' : ''
              }`}
              onClick={toggleSidebarCollapsed}
              title={sidebarCollapsed ? 'Clique para expandir o menu lateral' : 'Recolher menu lateral'}
            >
              <div className="w-8 h-8 bg-[#00A9A1] hover:bg-[#008f88] dark:bg-[#00C4BB] dark:hover:bg-[#00dfd5] rounded-md flex items-center justify-center text-white dark:text-gray-950 font-black text-lg shadow-xs flex-shrink-0 transition-transform active:scale-95">
                V
              </div>

              {!sidebarCollapsed && (
                <div className="leading-tight overflow-hidden">
                  <p className="font-bold text-[#00A9A1] dark:text-[#00C4BB] tracking-tight uppercase text-sm truncate">
                    VoxTalent
                  </p>
                  <p className="text-[10px] text-gray-400 dark:text-gray-500 font-medium truncate">
                    R&S OS v2.0
                  </p>
                </div>
              )}
            </div>

            {/* Retract / Expand Toggle Button */}
            <button
              type="button"
              id="btn-toggle-sidebar"
              onClick={toggleSidebarCollapsed}
              className={`p-1.5 rounded-lg text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors flex-shrink-0 ${
                sidebarCollapsed ? 'mt-1' : ''
              }`}
              title={sidebarCollapsed ? 'Expandir menu lateral' : 'Recolher menu lateral para apenas ícones'}
            >
              {sidebarCollapsed ? (
                <ChevronRight className="w-4 h-4 text-[#00A9A1] dark:text-[#00C4BB]" />
              ) : (
                <ChevronLeft className="w-4 h-4" />
              )}
            </button>
          </div>

          {/* Navigation Menu */}
          <nav className={`space-y-1 ${sidebarCollapsed ? 'mt-3' : 'mt-5'}`}>
            {navItems.map((item) => {
              const isActive = activeTab === item.id;

              return (
                <button
                  key={item.id}
                  id={`nav-item-${item.id}`}
                  type="button"
                  onClick={() => setActiveTab(item.id)}
                  title={sidebarCollapsed ? `${item.label} ${item.count !== undefined ? `(${item.count})` : ''}` : undefined}
                  className={`w-full relative flex items-center ${
                    sidebarCollapsed
                      ? 'justify-center p-2.5 rounded-lg'
                      : 'justify-between px-3 py-2 text-sm rounded-md'
                  } transition-all ${
                    isActive
                      ? 'bg-[#F3F4F6] dark:bg-gray-800 text-[#00857e] dark:text-[#00C4BB] font-semibold shadow-2xs'
                      : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800/60 hover:text-gray-900 dark:hover:text-white font-medium'
                  }`}
                >
                  <div className={`flex items-center ${sidebarCollapsed ? 'justify-center' : 'gap-3'}`}>
                    <span
                      className={`${
                        isActive
                          ? 'text-[#00A9A1] dark:text-[#00C4BB]'
                          : 'text-gray-500 dark:text-gray-400'
                      }`}
                    >
                      {item.icon}
                    </span>
                    {!sidebarCollapsed && <span className="truncate">{item.label}</span>}
                  </div>

                  {/* Badges / Counts */}
                  {!sidebarCollapsed ? (
                    item.badge ? (
                      <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded shadow-2xs ${item.badgeColor}`}>
                        {item.badge}
                      </span>
                    ) : item.count !== undefined ? (
                      <span
                        className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                          isActive
                            ? 'bg-white dark:bg-gray-700 text-[#00857e] dark:text-[#00C4BB] shadow-2xs'
                            : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400'
                        }`}
                      >
                        {item.count}
                      </span>
                    ) : null
                  ) : (
                    /* Floating mini badge/dot when collapsed */
                    (item.badge || (item.count !== undefined && item.count > 0)) && (
                      <span
                        className={`absolute top-1.5 right-1.5 w-2 h-2 rounded-full ${
                          item.badgeColor ? 'bg-[#F7941D]' : 'bg-[#00A9A1] dark:bg-[#00C4BB]'
                        }`}
                      />
                    )
                  )}
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Bottom Footer Info & Theme Switch */}
      <div className={`border-t border-gray-100 dark:border-gray-800 mt-auto ${sidebarCollapsed ? 'p-2 space-y-2' : 'p-4 space-y-2'}`}>
        {!sidebarCollapsed ? (
          <div className="bg-gray-50 dark:bg-gray-800/80 p-2.5 rounded-lg border border-gray-100 dark:border-gray-700/60">
            <p className="text-[9px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-0.5">
              Unidade Selecionada
            </p>
            <p className="text-xs font-semibold text-gray-800 dark:text-gray-200 truncate">
              {selectedUnidade === 'TODAS' ? '🏢 9 Unidades Vox' : selectedUnidade}
            </p>
          </div>
        ) : (
          <div
            className="flex justify-center p-2 rounded-lg bg-gray-50 dark:bg-gray-800/80 text-gray-500 dark:text-gray-400 border border-gray-100 dark:border-gray-700/60"
            title={`Unidade selecionada: ${selectedUnidade === 'TODAS' ? 'Todas as 9 Unidades' : selectedUnidade}`}
          >
            <MapPin className="w-3.5 h-3.5 text-[#00A9A1] dark:text-[#00C4BB]" />
          </div>
        )}

        <button
          type="button"
          onClick={toggleTheme}
          title={isDark ? 'Mudar para tema claro' : 'Mudar para tema escuro'}
          className={`w-full flex items-center ${
            sidebarCollapsed ? 'justify-center p-2' : 'justify-between px-3 py-2 text-xs'
          } font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg transition-colors border border-transparent dark:border-gray-800`}
        >
          <span className="flex items-center gap-2">
            {isDark ? (
              <Sun className="w-3.5 h-3.5 text-amber-400" />
            ) : (
              <Moon className="w-3.5 h-3.5 text-gray-500" />
            )}
            {!sidebarCollapsed && <span>Tema: <strong>{isDark ? 'Escuro' : 'Claro'}</strong></span>}
          </span>
          {!sidebarCollapsed && (
            <span className="text-[10px] font-bold uppercase text-[#00A9A1] dark:text-[#00C4BB]">
              Alternar
            </span>
          )}
        </button>
      </div>
    </aside>
  );
};
