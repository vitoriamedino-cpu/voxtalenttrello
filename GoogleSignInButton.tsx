import React from 'react';
import { useWorkspace } from '../../context/WorkspaceContext';
import { LogOut } from 'lucide-react';

export const GoogleSignInButton: React.FC<{ compact?: boolean }> = ({ compact = false }) => {
  const { user, isConnected, isLoadingAuth, login, logout } = useWorkspace();

  if (isLoadingAuth) {
    return (
      <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-xs text-gray-500 animate-pulse">
        <div className="w-3.5 h-3.5 rounded-full border-2 border-teal-500 border-t-transparent animate-spin" />
        <span className="text-[11px] font-medium">Conectando...</span>
      </div>
    );
  }

  if (isConnected && user) {
    return (
      <div className="flex items-center gap-2 bg-teal-50/80 dark:bg-teal-950/40 border border-teal-200/80 dark:border-teal-800/80 rounded-lg px-2.5 py-1 text-xs">
        {user.photoURL ? (
          <img
            src={user.photoURL}
            alt={user.displayName || 'Google User'}
            className="w-5 h-5 rounded-full border border-teal-300 dark:border-teal-700"
            referrerPolicy="no-referrer"
          />
        ) : (
          <div className="w-5 h-5 rounded-full bg-teal-600 text-white flex items-center justify-center text-[10px] font-bold">
            {user.email?.charAt(0).toUpperCase() || 'G'}
          </div>
        )}

        <div className="hidden md:flex flex-col text-left">
          <span className="font-bold text-gray-900 dark:text-white text-[11px] leading-tight truncate max-w-[120px]">
            {user.displayName || 'Google Conectado'}
          </span>
          <span className="text-[9px] text-teal-700 dark:text-teal-300 leading-none truncate max-w-[120px]">
            Workspace Ativo
          </span>
        </div>

        <button
          type="button"
          onClick={logout}
          title="Desconectar Google Workspace"
          className="p-1 rounded text-gray-400 hover:text-rose-600 dark:hover:text-rose-400 transition-colors ml-1"
        >
          <LogOut className="w-3.5 h-3.5" />
        </button>
      </div>
    );
  }

  if (compact) {
    return (
      <button
        type="button"
        onClick={login}
        className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-750 text-xs font-semibold text-gray-700 dark:text-gray-200 shadow-2xs transition-all active:scale-95"
      >
        <svg className="w-3.5 h-3.5" viewBox="0 0 48 48">
          <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"></path>
          <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"></path>
          <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"></path>
          <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"></path>
          <path fill="none" d="M0 0h48v48H0z"></path>
        </svg>
        <span className="hidden sm:inline">Google Workspace</span>
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={login}
      className="inline-flex items-center gap-2.5 px-4 py-2 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 text-xs font-bold text-gray-800 dark:text-gray-100 shadow-sm transition-all active:scale-[0.98]"
    >
      <svg className="w-4 h-4" viewBox="0 0 48 48">
        <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"></path>
        <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"></path>
        <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"></path>
        <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"></path>
        <path fill="none" d="M0 0h48v48H0z"></path>
      </svg>
      <span>Conectar com Google Workspace</span>
    </button>
  );
};
