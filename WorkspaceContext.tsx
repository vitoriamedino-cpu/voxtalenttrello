import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from 'firebase/auth';
import { initAuth, googleSignIn, logout as authLogout, getAccessToken, SCOPES } from '../lib/googleAuth';
import { listUpcomingEvents } from '../lib/googleCalendarService';
import { createGoogleMeetSpace, MeetSpaceResult } from '../lib/googleMeetService';

interface WorkspaceContextType {
  user: User | null;
  accessToken: string | null;
  isConnected: boolean;
  isLoadingAuth: boolean;
  scopes: string[];
  login: () => Promise<void>;
  logout: () => Promise<void>;
  confirmAction: (message: string, onConfirm: () => Promise<void> | void) => void;
  testCalendarConnection: (calendarId?: string) => Promise<{ success: boolean; eventCount: number; message: string }>;
  testMeetCreation: (accessType?: 'OPEN' | 'TRUSTED' | 'RESTRICTED') => Promise<{ success: boolean; result?: MeetSpaceResult; message: string }>;
}

const WorkspaceContext = createContext<WorkspaceContextType | undefined>(undefined);

export const WorkspaceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [isLoadingAuth, setIsLoadingAuth] = useState<boolean>(true);

  // Custom confirmation modal state
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    message: string;
    onConfirm: () => Promise<void> | void;
  }>({
    isOpen: false,
    message: '',
    onConfirm: () => {},
  });

  useEffect(() => {
    const unsubscribe = initAuth(
      (currentUser, token) => {
        setUser(currentUser);
        setAccessToken(token);
        setIsLoadingAuth(false);
      },
      () => {
        setUser(null);
        setAccessToken(null);
        setIsLoadingAuth(false);
      }
    );

    return () => unsubscribe();
  }, []);

  const login = async () => {
    setIsLoadingAuth(true);
    try {
      const result = await googleSignIn();
      if (result) {
        setUser(result.user);
        setAccessToken(result.accessToken);
      }
    } catch (err: any) {
      console.error('Falha ao autenticar com o Google Workspace:', err);
      alert(`Falha ao conectar com o Google Workspace: ${err?.message || 'Tente novamente.'}`);
    } finally {
      setIsLoadingAuth(false);
    }
  };

  const logout = async () => {
    setIsLoadingAuth(true);
    try {
      await authLogout();
      setUser(null);
      setAccessToken(null);
    } finally {
      setIsLoadingAuth(false);
    }
  };

  const confirmAction = (message: string, onConfirm: () => Promise<void> | void) => {
    setConfirmModal({
      isOpen: true,
      message,
      onConfirm,
    });
  };

  const testCalendarConnection = async (calendarId = 'primary') => {
    if (!accessToken) {
      return { success: false, eventCount: 0, message: 'Google Workspace não está conectado.' };
    }
    try {
      const events = await listUpcomingEvents(5, calendarId);
      return {
        success: true,
        eventCount: events.length,
        message: `Conexão bem-sucedida! ${events.length} evento(s) futuros localizados na agenda "${calendarId}".`,
      };
    } catch (err: any) {
      return {
        success: false,
        eventCount: 0,
        message: `Falha ao acessar Google Agenda: ${err?.message || 'Erro desconhecido'}`,
      };
    }
  };

  const testMeetCreation = async (accessType: 'OPEN' | 'TRUSTED' | 'RESTRICTED' = 'OPEN') => {
    if (!accessToken) {
      return { success: false, message: 'Google Workspace não está conectado.' };
    }
    try {
      const meet = await createGoogleMeetSpace(accessType);
      return {
        success: true,
        result: meet,
        message: `Sala do Google Meet criada com sucesso! URL: ${meet.meetingUri}`,
      };
    } catch (err: any) {
      return {
        success: false,
        message: `Falha ao criar sala do Google Meet: ${err?.message || 'Erro desconhecido'}`,
      };
    }
  };

  return (
    <WorkspaceContext.Provider
      value={{
        user,
        accessToken,
        isConnected: !!accessToken && !!user,
        isLoadingAuth,
        scopes: SCOPES,
        login,
        logout,
        confirmAction,
        testCalendarConnection,
        testMeetCreation,
      }}
    >
      {children}

      {/* Required Workspace Confirmation Modal for Mutating/Destructive Operations */}
      {confirmModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 dark:bg-black/80 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="w-full max-w-md rounded-2xl bg-white dark:bg-gray-800 p-6 shadow-2xl border border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-3 text-amber-600 dark:text-amber-400 mb-3">
              <div className="w-10 h-10 rounded-full bg-amber-100 dark:bg-amber-950/60 flex items-center justify-center font-bold text-lg">
                ⚠️
              </div>
              <h3 className="text-base font-bold text-gray-900 dark:text-white">
                Confirmação de Ação no Google Workspace
              </h3>
            </div>
            <p className="text-xs text-gray-600 dark:text-gray-300 leading-relaxed mb-6">
              {confirmModal.message}
            </p>
            <div className="flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setConfirmModal((prev) => ({ ...prev, isOpen: false }))}
                className="px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 text-xs font-semibold text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={async () => {
                  const cb = confirmModal.onConfirm;
                  setConfirmModal((prev) => ({ ...prev, isOpen: false }));
                  await cb();
                }}
                className="px-5 py-2 rounded-lg bg-[#00A9A1] hover:bg-[#008f88] dark:bg-[#00A9A1] dark:hover:bg-[#00C4BB] text-xs font-bold text-white shadow-md transition-all active:scale-95"
              >
                Confirmar e Executar
              </button>
            </div>
          </div>
        </div>
      )}
    </WorkspaceContext.Provider>
  );
};

export const useWorkspace = () => {
  const context = useContext(WorkspaceContext);
  if (!context) {
    throw new Error('useWorkspace must be used within a WorkspaceProvider');
  }
  return context;
};
