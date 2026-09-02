import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { ContaUsuario, NivelAcesso, PermissoesConta } from '../../types';
import { UNIDADES_VOX, PERMISSOES_PADRAO_POR_NIVEL } from '../../lib/rsConstants';
import {
  Users,
  ShieldCheck,
  UserPlus,
  Edit2,
  Trash2,
  Power,
  Search,
  Check,
  X,
  Lock,
  Unlock,
  Building2,
  Mail,
  Briefcase,
  KeyRound,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
} from 'lucide-react';

const NIVEL_COLORS: Record<
  NivelAcesso,
  { badge: string; border: string; bg: string; text: string; label: string }
> = {
  Admin: {
    badge: 'bg-purple-100 text-purple-800 dark:bg-purple-950/60 dark:text-purple-300 border-purple-200 dark:border-purple-800',
    border: 'border-purple-200 dark:border-purple-800/60',
    bg: 'bg-purple-50/40 dark:bg-purple-950/20',
    text: 'text-purple-700 dark:text-purple-300',
    label: 'Administrador (Total)',
  },
  Recrutador: {
    badge: 'bg-teal-100 text-[#00857e] dark:bg-teal-950/60 dark:text-[#00C4BB] border-teal-200 dark:border-teal-800',
    border: 'border-teal-200 dark:border-teal-800/60',
    bg: 'bg-teal-50/40 dark:bg-teal-950/20',
    text: 'text-[#00857e] dark:text-[#00C4BB]',
    label: 'Recrutador (R&S)',
  },
  Gestor: {
    badge: 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border-amber-200 dark:border-amber-800',
    border: 'border-amber-200 dark:border-amber-800/60',
    bg: 'bg-amber-50/40 dark:bg-amber-950/20',
    text: 'text-amber-700 dark:text-amber-300',
    label: 'Gestor de Unidade',
  },
  Visualizador: {
    badge: 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300 border-slate-200 dark:border-slate-700',
    border: 'border-slate-200 dark:border-slate-700/60',
    bg: 'bg-slate-50/40 dark:bg-slate-800/20',
    text: 'text-slate-700 dark:text-slate-300',
    label: 'Visualizador (Auditoria)',
  },
};

const PERMISSAO_LABELS: Record<keyof PermissoesConta, { label: string; desc: string }> = {
  criarVagas: {
    label: 'Criar & Gerenciar Vagas',
    desc: 'Permite abrir novas requisições, alterar descrições e mudar status de vagas.',
  },
  moverEtapas: {
    label: 'Mover Etapas no Kanban',
    desc: 'Permite avançar, retroceder ou alterar status de candidatos no funil.',
  },
  bancoTalentos: {
    label: 'Acesso ao Banco de Talentos',
    desc: 'Permite consultar e resgatar candidatos do banco prioritário.',
  },
  gerenciarConfiguracoes: {
    label: 'Configurações & Regras de SLA',
    desc: 'Acesso à gestão de metas de SLA, templates oficiais e regras de governança.',
  },
  exportarRelatorios: {
    label: 'Relatórios & Métricas de Custos',
    desc: 'Permite visualizar dados analíticos, volume de CVs e custos por canal.',
  },
  dispararWhatsApp: {
    label: 'Disparo de WhatsApp Oficial',
    desc: 'Permite gerar e enviar mensagens padronizadas do Guia de Comunicação.',
  },
  agendarEntrevistas: {
    label: 'Agendamento de Entrevistas',
    desc: 'Permite disparar convites de Entrevistas Coletivas e links Google Meet.',
  },
};

export const ContasAcessosTab: React.FC = () => {
  const {
    contasUsuarios,
    addContaUsuario,
    updateContaUsuario,
    deleteContaUsuario,
    toggleStatusContaUsuario,
  } = useApp();

  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState<string>('TODOS');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingContaId, setEditingContaId] = useState<string | null>(null);

  // Form State
  const [formData, setFormData] = useState<{
    nome: string;
    email: string;
    cargo: string;
    unidade: string;
    nivelAcesso: NivelAcesso;
    status: 'Ativo' | 'Inativo';
    permissoes: PermissoesConta;
  }>({
    nome: '',
    email: '',
    cargo: '',
    unidade: 'Todas as Unidades',
    nivelAcesso: 'Recrutador',
    status: 'Ativo',
    permissoes: { ...PERMISSOES_PADRAO_POR_NIVEL.Recrutador },
  });

  const handleOpenNew = () => {
    setEditingContaId(null);
    setFormData({
      nome: '',
      email: '',
      cargo: '',
      unidade: 'Todas as Unidades',
      nivelAcesso: 'Recrutador',
      status: 'Ativo',
      permissoes: { ...PERMISSOES_PADRAO_POR_NIVEL.Recrutador },
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (conta: ContaUsuario) => {
    setEditingContaId(conta.id);
    setFormData({
      nome: conta.nome,
      email: conta.email,
      cargo: conta.cargo,
      unidade: conta.unidade,
      nivelAcesso: conta.nivelAcesso,
      status: conta.status,
      permissoes: { ...conta.permissoes },
    });
    setIsModalOpen(true);
  };

  const handleRoleChange = (role: NivelAcesso) => {
    setFormData((prev) => ({
      ...prev,
      nivelAcesso: role,
      permissoes: { ...PERMISSOES_PADRAO_POR_NIVEL[role] },
    }));
  };

  const handleTogglePermission = (key: keyof PermissoesConta) => {
    setFormData((prev) => ({
      ...prev,
      permissoes: {
        ...prev.permissoes,
        [key]: !prev.permissoes[key],
      },
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.nome.trim() || !formData.email.trim()) return;

    if (editingContaId) {
      updateContaUsuario(editingContaId, {
        nome: formData.nome,
        email: formData.email,
        cargo: formData.cargo,
        unidade: formData.unidade,
        nivelAcesso: formData.nivelAcesso,
        status: formData.status,
        permissoes: formData.permissoes,
      });
    } else {
      addContaUsuario({
        nome: formData.nome,
        email: formData.email,
        cargo: formData.cargo,
        unidade: formData.unidade,
        nivelAcesso: formData.nivelAcesso,
        status: formData.status,
        permissoes: formData.permissoes,
      });
    }
    setIsModalOpen(false);
  };

  // Filtered list
  const filteredContas = contasUsuarios.filter((c) => {
    const matchesSearch =
      c.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.cargo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.unidade.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesRole = filterRole === 'TODOS' || c.nivelAcesso === filterRole;

    return matchesSearch && matchesRole;
  });

  return (
    <div className="space-y-4 text-xs">
      {/* Top Action & Metrics Bar */}
      <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-800/90 p-4 shadow-xs">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-100 dark:border-gray-700/60 pb-3">
          <div>
            <h3 className="text-xs font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-[#00A9A1] dark:text-[#00C4BB]" />
              Gestão de Contas, Usuários e Níveis de Acessibilidade
            </h3>
            <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5">
              Defina os níveis de autorização, perfis operacionais e permissões granulares de acesso ao sistema de R&S.
            </p>
          </div>

          <button
            type="button"
            id="btn-nova-conta"
            onClick={handleOpenNew}
            className="inline-flex items-center gap-1.5 rounded-md bg-[#00A9A1] hover:bg-[#008f88] dark:bg-[#00A9A1] dark:hover:bg-[#00C4BB] px-3.5 py-1.5 font-bold text-white shadow-xs active:scale-[0.98] transition-all"
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>Adicionar Nova Conta</span>
          </button>
        </div>

        {/* Roles Quick Counter */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-3">
          {(['Admin', 'Recrutador', 'Gestor', 'Visualizador'] as NivelAcesso[]).map((role) => {
            const count = contasUsuarios.filter((c) => c.nivelAcesso === role).length;
            const style = NIVEL_COLORS[role];
            return (
              <div
                key={role}
                className={`rounded-lg border p-2.5 ${style.border} ${style.bg} flex items-center justify-between`}
              >
                <div>
                  <span className={`text-[10px] font-bold ${style.text}`}>{role}</span>
                  <p className="text-[10px] text-gray-500 dark:text-gray-400">
                    {role === 'Admin'
                      ? 'Acesso Total'
                      : role === 'Recrutador'
                      ? 'Operação R&S'
                      : role === 'Gestor'
                      ? 'Unidade Local'
                      : 'Apenas Leitura'}
                  </p>
                </div>
                <span className={`text-base font-extrabold ${style.text}`}>{count}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-wrap items-center justify-between gap-2.5">
        <div className="flex items-center gap-2 flex-1 min-w-[240px]">
          <div className="relative flex-1">
            <Search className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              id="search-contas"
              placeholder="Buscar conta por nome, e-mail, cargo ou unidade..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 pl-8 pr-3 py-1.5 text-xs text-gray-900 dark:text-white placeholder-gray-400 focus:ring-1 focus:ring-[#00A9A1] focus:outline-none"
            />
          </div>

          <select
            id="filter-role"
            value={filterRole}
            onChange={(e) => setFilterRole(e.target.value)}
            className="rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-1.5 text-xs font-semibold text-gray-700 dark:text-gray-200 focus:outline-none focus:ring-1 focus:ring-[#00A9A1]"
          >
            <option value="TODOS">Todos os Níveis ({contasUsuarios.length})</option>
            <option value="Admin">Administradores</option>
            <option value="Recrutador">Recrutadores</option>
            <option value="Gestor">Gestores de Unidade</option>
            <option value="Visualizador">Visualizadores</option>
          </select>
        </div>
      </div>

      {/* User Accounts List */}
      <div className="space-y-2.5">
        {filteredContas.map((conta) => {
          const style = NIVEL_COLORS[conta.nivelAcesso];
          const isAtivo = conta.status === 'Ativo';
          const isProtectedMaster = conta.email === 'luana.oliveira@grupomaester.com.br';

          return (
            <div
              key={conta.id}
              id={`conta-item-${conta.id}`}
              className={`rounded-xl border transition-all p-3.5 bg-white dark:bg-gray-800/90 shadow-xs ${
                !isAtivo
                  ? 'opacity-60 border-gray-200 dark:border-gray-800'
                  : 'border-gray-200 dark:border-gray-800 hover:border-gray-300 dark:hover:border-gray-700'
              }`}
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                {/* User Info */}
                <div className="flex items-start gap-3">
                  <div className="relative">
                    <div className="w-10 h-10 rounded-full bg-[#00A9A1]/10 dark:bg-[#00C4BB]/20 text-[#00857e] dark:text-[#00C4BB] font-black text-sm flex items-center justify-center border border-[#00A9A1]/20">
                      {conta.nome
                        .split(' ')
                        .filter(Boolean)
                        .slice(0, 2)
                        .map((n) => n[0])
                        .join('')
                        .toUpperCase()}
                    </div>
                    <span
                      className={`w-3 h-3 rounded-full border-2 border-white dark:border-gray-800 absolute -bottom-0.5 -right-0.5 ${
                        isAtivo ? 'bg-emerald-500' : 'bg-gray-400'
                      }`}
                      title={isAtivo ? 'Conta Ativa' : 'Conta Inativa'}
                    />
                  </div>

                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="text-xs font-bold text-gray-900 dark:text-white">
                        {conta.nome}
                      </h4>
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold border ${style.badge}`}
                      >
                        {style.label}
                      </span>
                      {!isAtivo && (
                        <span className="inline-flex items-center px-1.5 py-0.2 rounded text-[9px] font-bold bg-gray-100 text-gray-500 dark:bg-gray-700 dark:text-gray-400">
                          Inativo
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-3 text-[11px] text-gray-500 dark:text-gray-400 mt-1 flex-wrap">
                      <span className="flex items-center gap-1 font-medium">
                        <Mail className="w-3 h-3 text-gray-400" />
                        {conta.email}
                      </span>
                      <span className="flex items-center gap-1 font-medium">
                        <Briefcase className="w-3 h-3 text-gray-400" />
                        {conta.cargo}
                      </span>
                      <span className="flex items-center gap-1 font-medium text-[#00857e] dark:text-[#00C4BB]">
                        <Building2 className="w-3 h-3" />
                        {conta.unidade}
                      </span>
                    </div>

                    {/* Permissions Badges */}
                    <div className="flex flex-wrap items-center gap-1.5 mt-2.5">
                      {Object.entries(conta.permissoes).map(([key, granted]) => {
                        if (!granted) return null;
                        const permInfo = PERMISSAO_LABELS[key as keyof PermissoesConta];
                        return (
                          <span
                            key={key}
                            className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-gray-100 dark:bg-gray-700/60 text-gray-700 dark:text-gray-300 text-[10px] font-semibold"
                            title={permInfo?.desc}
                          >
                            <Check className="w-2.5 h-2.5 text-emerald-600 dark:text-emerald-400" />
                            {permInfo?.label}
                          </span>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    id={`btn-edit-conta-${conta.id}`}
                    onClick={() => handleOpenEdit(conta)}
                    className="inline-flex items-center gap-1 rounded-md border border-gray-200 dark:border-gray-700 px-2.5 py-1 text-[11px] font-bold text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors"
                  >
                    <Edit2 className="w-3 h-3 text-[#00A9A1]" />
                    <span>Configurar Acessos</span>
                  </button>

                  {!isProtectedMaster && (
                    <>
                      <button
                        type="button"
                        id={`btn-toggle-status-${conta.id}`}
                        onClick={() => toggleStatusContaUsuario(conta.id)}
                        className={`p-1.5 rounded-md border transition-colors ${
                          isAtivo
                            ? 'border-gray-200 dark:border-gray-700 text-gray-500 hover:text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-950/40'
                            : 'border-emerald-200 text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/40'
                        }`}
                        title={isAtivo ? 'Desativar Conta' : 'Ativar Conta'}
                      >
                        <Power className="w-3.5 h-3.5" />
                      </button>

                      <button
                        type="button"
                        id={`btn-delete-conta-${conta.id}`}
                        onClick={() => {
                          if (
                            confirm(
                              `Deseja realmente remover o acesso de ${conta.nome} (${conta.email})?`
                            )
                          ) {
                            deleteContaUsuario(conta.id);
                          }
                        }}
                        className="p-1.5 rounded-md border border-gray-200 dark:border-gray-700 text-gray-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                        title="Excluir Conta"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Governance & Accessibility Matrix Card */}
      <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-800/90 p-4 shadow-xs space-y-3">
        <h3 className="text-xs font-bold text-gray-900 dark:text-white flex items-center gap-2 border-b border-gray-100 dark:border-gray-700/60 pb-2">
          <KeyRound className="w-3.5 h-3.5 text-[#00A9A1] dark:text-[#00C4BB]" />
          Matriz de Governança & Níveis de Acessibilidade
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-[11px]">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400 font-bold">
                <th className="py-2 pr-3">Nível de Acesso</th>
                <th className="py-2 px-3">Escopo de Unidade</th>
                <th className="py-2 px-3">Gestão de Vagas</th>
                <th className="py-2 px-3">Kanban & Ações</th>
                <th className="py-2 px-3">WhatsApp & Convites</th>
                <th className="py-2 px-3">Configurações & SLA</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-750">
              <tr>
                <td className="py-2 pr-3 font-bold text-purple-700 dark:text-purple-300">Admin</td>
                <td className="py-2 px-3 text-gray-600 dark:text-gray-300">Todas as 9 Unidades</td>
                <td className="py-2 px-3 text-emerald-600 dark:text-emerald-400 font-semibold">Total (Criar/Editar/Fechar)</td>
                <td className="py-2 px-3 text-emerald-600 dark:text-emerald-400 font-semibold">Total + Ações em Massa</td>
                <td className="py-2 px-3 text-emerald-600 dark:text-emerald-400 font-semibold">Ilimitado</td>
                <td className="py-2 px-3 text-emerald-600 dark:text-emerald-400 font-semibold">Acesso Completo</td>
              </tr>
              <tr>
                <td className="py-2 pr-3 font-bold text-[#00857e] dark:text-[#00C4BB]">Recrutador</td>
                <td className="py-2 px-3 text-gray-600 dark:text-gray-300">Todas as 9 Unidades</td>
                <td className="py-2 px-3 text-emerald-600 dark:text-emerald-400 font-semibold">Criar & Triar</td>
                <td className="py-2 px-3 text-emerald-600 dark:text-emerald-400 font-semibold">Movimentação Total</td>
                <td className="py-2 px-3 text-emerald-600 dark:text-emerald-400 font-semibold">Templates 1 a 16</td>
                <td className="py-2 px-3 text-gray-400 dark:text-gray-500">Apenas Leitura</td>
              </tr>
              <tr>
                <td className="py-2 pr-3 font-bold text-amber-700 dark:text-amber-300">Gestor</td>
                <td className="py-2 px-3 text-gray-600 dark:text-gray-300">Unidade Específica</td>
                <td className="py-2 px-3 text-gray-500 dark:text-gray-400">Visualizar Vagas Locais</td>
                <td className="py-2 px-3 text-emerald-600 dark:text-emerald-400 font-semibold">Avaliar Etapa Prática/Fit</td>
                <td className="py-2 px-3 text-emerald-600 dark:text-emerald-400 font-semibold">Convites Locais</td>
                <td className="py-2 px-3 text-gray-400 dark:text-gray-500">Sem Acesso</td>
              </tr>
              <tr>
                <td className="py-2 pr-3 font-bold text-slate-700 dark:text-slate-300">Visualizador</td>
                <td className="py-2 px-3 text-gray-600 dark:text-gray-300">Global ou Local</td>
                <td className="py-2 px-3 text-gray-400 dark:text-gray-500">Apenas Leitura</td>
                <td className="py-2 px-3 text-gray-400 dark:text-gray-500">Apenas Leitura</td>
                <td className="py-2 px-3 text-gray-400 dark:text-gray-500">Sem Envio</td>
                <td className="py-2 px-3 text-gray-400 dark:text-gray-500">Sem Acesso</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: Adicionar / Configurar Conta */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div
            id="modal-conta-config"
            className="w-full max-w-lg rounded-2xl bg-white dark:bg-gray-800 p-5 shadow-2xl border border-gray-200 dark:border-gray-700 space-y-4 max-h-[90vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-700/60 pb-3">
              <div>
                <h3 className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-2">
                  <KeyRound className="w-4 h-4 text-[#00A9A1] dark:text-[#00C4BB]" />
                  {editingContaId ? 'Configurar Conta & Níveis de Acesso' : 'Adicionar Nova Conta'}
                </h3>
                <p className="text-[11px] text-gray-500 dark:text-gray-400">
                  {editingContaId
                    ? 'Ajuste os privilégios operacionais e permissões da conta.'
                    : 'Cadastre um novo colaborador e defina seu nível de acessibilidade.'}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-md text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3.5">
              {/* Nome & Email */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-gray-700 dark:text-gray-200 mb-1">
                    Nome Completo *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: Luana Oliveira"
                    value={formData.nome}
                    onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                    className="w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-1.5 text-xs text-gray-900 dark:text-white focus:ring-1 focus:ring-[#00A9A1] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-gray-700 dark:text-gray-200 mb-1">
                    E-mail Corporativo *
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="usuario@grupomaester.com.br"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-1.5 text-xs text-gray-900 dark:text-white focus:ring-1 focus:ring-[#00A9A1] focus:outline-none"
                  />
                </div>
              </div>

              {/* Cargo & Unidade */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-gray-700 dark:text-gray-200 mb-1">
                    Cargo / Função
                  </label>
                  <input
                    type="text"
                    placeholder="Ex: Recrutador R&S"
                    value={formData.cargo}
                    onChange={(e) => setFormData({ ...formData, cargo: e.target.value })}
                    className="w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-1.5 text-xs text-gray-900 dark:text-white focus:ring-1 focus:ring-[#00A9A1] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-gray-700 dark:text-gray-200 mb-1">
                    Unidade de Atuação
                  </label>
                  <select
                    value={formData.unidade}
                    onChange={(e) => setFormData({ ...formData, unidade: e.target.value })}
                    className="w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-1.5 text-xs text-gray-900 dark:text-white focus:ring-1 focus:ring-[#00A9A1] focus:outline-none"
                  >
                    <option value="Todas as Unidades">Todas as 9 Unidades (Rede Completa)</option>
                    {UNIDADES_VOX.map((u) => (
                      <option key={u} value={u}>
                        {u}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Nível de Acesso (Preset Role) */}
              <div>
                <label className="block text-[11px] font-bold text-gray-700 dark:text-gray-200 mb-1.5">
                  Nível de Acessibilidade (Perfil Base)
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {(['Admin', 'Recrutador', 'Gestor', 'Visualizador'] as NivelAcesso[]).map(
                    (role) => {
                      const isSelected = formData.nivelAcesso === role;
                      const style = NIVEL_COLORS[role];
                      return (
                        <button
                          key={role}
                          type="button"
                          onClick={() => handleRoleChange(role)}
                          className={`rounded-lg border p-2 text-left transition-all ${
                            isSelected
                              ? `ring-2 ring-[#00A9A1] ${style.bg} ${style.border}`
                              : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                          }`}
                        >
                          <span
                            className={`block text-[11px] font-extrabold ${
                              isSelected ? style.text : 'text-gray-800 dark:text-gray-200'
                            }`}
                          >
                            {role}
                          </span>
                          <span className="text-[9px] text-gray-500 dark:text-gray-400">
                            {role === 'Admin'
                              ? 'Total'
                              : role === 'Recrutador'
                              ? 'R&S Avançado'
                              : role === 'Gestor'
                              ? 'Local'
                              : 'Leitura'}
                          </span>
                        </button>
                      );
                    }
                  )}
                </div>
              </div>

              {/* Granular Permissions Toggle List */}
              <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-750 p-3 space-y-2">
                <div className="flex items-center justify-between border-b border-gray-200 dark:border-gray-700 pb-1.5">
                  <span className="text-[11px] font-bold text-gray-800 dark:text-gray-200">
                    Permissões Granulares Específicas
                  </span>
                  <span className="text-[10px] text-gray-400">
                    Personalize os privilégios desta conta
                  </span>
                </div>

                <div className="space-y-1.5 pt-1">
                  {(Object.keys(PERMISSAO_LABELS) as (keyof PermissoesConta)[]).map((key) => {
                    const isGranted = formData.permissoes[key];
                    const info = PERMISSAO_LABELS[key];
                    return (
                      <div
                        key={key}
                        onClick={() => handleTogglePermission(key)}
                        className="flex items-center justify-between p-1.5 rounded-lg hover:bg-white dark:hover:bg-gray-800 cursor-pointer transition-colors"
                      >
                        <div className="pr-2">
                          <p className="text-[11px] font-bold text-gray-900 dark:text-white">
                            {info.label}
                          </p>
                          <p className="text-[10px] text-gray-500 dark:text-gray-400">
                            {info.desc}
                          </p>
                        </div>

                        <button
                          type="button"
                          className={`w-5 h-5 rounded flex items-center justify-center flex-shrink-0 transition-all ${
                            isGranted
                              ? 'bg-[#00A9A1] dark:bg-[#00C4BB] text-white'
                              : 'border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700'
                          }`}
                        >
                          {isGranted && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Status Toggle */}
              <div className="flex items-center justify-between pt-1">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="status-conta"
                    checked={formData.status === 'Ativo'}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        status: e.target.value ? 'Ativo' : 'Inativo',
                      })
                    }
                    className="rounded text-[#00A9A1] focus:ring-[#00A9A1]"
                  />
                  <label
                    htmlFor="status-conta"
                    className="text-[11px] font-bold text-gray-700 dark:text-gray-300 cursor-pointer"
                  >
                    Conta Ativa (Habilitada para Login e Operação)
                  </label>
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="flex items-center justify-end gap-2 pt-2 border-t border-gray-100 dark:border-gray-700/60">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="rounded-md border border-gray-200 dark:border-gray-700 px-3.5 py-1.5 text-xs font-semibold text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-750"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="rounded-md bg-[#00A9A1] hover:bg-[#008f88] dark:bg-[#00A9A1] dark:hover:bg-[#00C4BB] px-4 py-1.5 text-xs font-bold text-white shadow-xs active:scale-[0.98] transition-all"
                >
                  {editingContaId ? 'Salvar Alterações de Acesso' : 'Cadastrar Conta'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
