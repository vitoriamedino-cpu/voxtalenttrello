import React, { useState } from 'react';
import { LogIn, ShieldCheck, Loader2 } from 'lucide-react';
import { useWorkspace } from '../../context/WorkspaceContext';

export const LoginView: React.FC = () => {
  const { login, isLoadingAuth } = useWorkspace();
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async () => {
    setError(null);

    try {
      await login();
    } catch (err: any) {
      console.error('Erro ao entrar no VoxTalent:', err);
      setError(
        err?.message ||
          'Não foi possível entrar no VoxTalent. Tente novamente.'
      );
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#F3F4F6] dark:bg-[#0B0F17] flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        <div className="bg-white dark:bg-[#111827] rounded-3xl shadow-xl border border-gray-200 dark:border-gray-800 overflow-hidden">
          
          <div className="px-8 pt-10 pb-8 text-center">
            <div className="mx-auto mb-6 w-16 h-16 rounded-2xl bg-[#00A9A1] flex items-center justify-center shadow-lg shadow-[#00A9A1]/20">
              <span className="text-white text-2xl font-black">
                V
              </span>
            </div>

            <h1 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight">
              VoxTalent
            </h1>

            <p className="mt-1 text-sm font-medium text-[#00A9A1]">
              R&S OS
            </p>

            <p className="mt-6 text-sm leading-relaxed text-gray-500 dark:text-gray-400">
              Plataforma de gestão de recrutamento e seleção.
            </p>
          </div>

          <div className="px-8 pb-8">
            <div className="mb-5 rounded-2xl bg-gray-50 dark:bg-gray-900/60 border border-gray-100 dark:border-gray-800 p-4">
              <div className="flex items-start gap-3">
                <ShieldCheck className="w-5 h-5 text-[#00A9A1] mt-0.5 shrink-0" />

                <div>
                  <p className="text-sm font-bold text-gray-800 dark:text-gray-200">
                    Acesso restrito
                  </p>

                  <p className="mt-1 text-xs leading-relaxed text-gray-500 dark:text-gray-400">
                    Entre com sua conta Google autorizada para acessar o
                    VoxTalent.
                  </p>
                </div>
              </div>
            </div>

            {error && (
              <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-xs font-medium text-red-700 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-300">
                {error}
              </div>
            )}

            <button
              type="button"
              onClick={handleLogin}
              disabled={isLoadingAuth}
              className="w-full flex items-center justify-center gap-3 rounded-xl bg-[#00A9A1] hover:bg-[#008F88] disabled:opacity-60 disabled:cursor-not-allowed px-5 py-3.5 text-sm font-bold text-white shadow-lg shadow-[#00A9A1]/20 transition-all active:scale-[0.98]"
            >
              {isLoadingAuth ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Entrando...
                </>
              ) : (
                <>
                  <LogIn className="w-5 h-5" />
                  Entrar com Google
                </>
              )}
            </button>

            <p className="mt-5 text-center text-[11px] leading-relaxed text-gray-400 dark:text-gray-500">
              O acesso é realizado por autenticação segura do Google.
            </p>
          </div>
        </div>

        <p className="mt-6 text-center text-[11px] text-gray-400 dark:text-gray-600">
          VoxTalent R&S OS
        </p>
      </div>
    </div>
  );
};