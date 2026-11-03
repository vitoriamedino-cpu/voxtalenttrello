import { LoginView } from './components/Auth/LoginView';
import { useWorkspace } from './context/WorkspaceContext';
import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { ThemeProvider } from './context/ThemeContext';
import { WorkspaceProvider } from './context/WorkspaceContext';
import { Sidebar } from './components/Layout/Sidebar';
import { Header } from './components/Layout/Header';
import { DashboardOverview } from './components/Dashboard/DashboardOverview';
import { KanbanBoard } from './components/Kanban/KanbanBoard';
import { VagasList, VagaModal } from './components/Vagas/VagasList';
import { BancoTalentosView } from './components/Banco/BancoTalentosView';
import { MensagensView } from './components/Mensagens/MensagensView';
import { WorkspaceView } from './components/Workspace/WorkspaceView';
import { RelatoriosView } from './components/Relatorios/RelatoriosView';
import { ConfiguracoesView } from './components/Configuracoes/ConfiguracoesView';
import { CandidateModal } from './components/Modals/CandidateModal';
import { NewCandidateModal } from './components/Modals/NewCandidateModal';
import { WhatsAppModal } from './components/Modals/WhatsAppModal';
import { ColetivaScheduleModal } from './components/Modals/ColetivaScheduleModal';
import { InterviewScheduleModal } from './components/Modals/InterviewScheduleModal';
import { CandidatePdfModal } from './components/Modals/CandidatePdfModal';
import { EtapaListModal } from './components/Modals/EtapaListModal';
const AppContent: React.FC = () => {  
  const {
    activeTab,
    candidateModalId,
    setCandidateModalId,
    isNewCandidateOpen,
    setIsNewCandidateOpen,
    vagaModalId,
    setVagaModalId,
    isNewVagaOpen,
    setIsNewVagaOpen,
    whatsAppModalCandidate,
    setWhatsAppModalCandidate,
    coletivaScheduleVagaId,
    setColetivaScheduleVagaId,
    calendarScheduleCandidate,
    setCalendarScheduleCandidate,
    calendarScheduleDefaultDate,
    candidatePdfModalId,
    setCandidatePdfModalId,
    listModalEtapa,
    setListModalEtapa,
    getCandidatoById,
    getVagaById,
    isOperationalDataLoaded,
    isSheetsSyncing,
    sheetsSyncMessage,
    loadDataFromGoogleSheets,
    masterSpreadsheetId,
  } = useApp();

  const pdfCandidate = candidatePdfModalId ? getCandidatoById(candidatePdfModalId) : null;
const { user, accessToken, isLoadingAuth, accessState, accessMessage, login, logout } = useWorkspace();

if (isLoadingAuth) {
  return (
    <div className="min-h-screen w-full bg-[#F3F4F6] dark:bg-[#0B0F17] flex items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-[#00A9A1] flex items-center justify-center">
          <span className="text-white font-black">V</span>
        </div>

        <div className="w-5 h-5 rounded-full border-2 border-[#00A9A1] border-t-transparent animate-spin" />

        <p className="text-xs font-medium text-gray-500 dark:text-gray-400">
          Verificando acesso...
        </p>
      </div>
    </div>
  );
}

if (!user) {
  return <LoginView />;
}

if (accessState === 'checking') {
  return (
    <div className="min-h-screen w-full bg-[#F3F4F6] dark:bg-[#0B0F17] flex items-center justify-center p-6">
      <div className="text-center">
        <div className="mx-auto mb-4 h-8 w-8 rounded-full border-2 border-[#00A9A1] border-t-transparent animate-spin" />
        <p className="text-sm font-semibold text-gray-700 dark:text-gray-200">Verificando autorização...</p>
      </div>
    </div>
  );
}

if (accessState !== 'authorized') {
  return (
    <div className="min-h-screen w-full bg-[#F3F4F6] dark:bg-[#0B0F17] flex items-center justify-center p-6">
      <div className="w-full max-w-lg rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#111827] p-7 shadow-xl">
        <h1 className="text-xl font-black text-gray-900 dark:text-white">Acesso não liberado</h1>
        <p className="mt-3 text-sm leading-relaxed text-gray-600 dark:text-gray-300">{accessMessage || 'Não foi possível confirmar sua autorização para usar o VoxTalent.'}</p>
        {accessState === 'error' && <button type="button" onClick={() => window.location.reload()} className="mt-5 mr-3 rounded-lg bg-[#00A9A1] px-4 py-2 text-sm font-bold text-white">Tentar novamente</button>}
        <button type="button" onClick={() => void logout()} className="mt-5 rounded-lg border border-gray-300 dark:border-gray-600 px-4 py-2 text-sm font-semibold text-gray-700 dark:text-gray-200">Sair</button>
      </div>
    </div>
  );
}

if (accessState === 'authorized' && !accessToken) {
  return (
    <div className="min-h-screen w-full bg-[#F3F4F6] dark:bg-[#0B0F17] flex items-center justify-center p-6">
      <div className="w-full max-w-lg rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#111827] p-7 shadow-xl">
        <div className="mx-auto mb-4 h-10 w-10 rounded-xl bg-[#00A9A1] flex items-center justify-center text-white font-black">V</div>
        <h1 className="text-xl font-black text-gray-900 dark:text-white">Reconecte o Google Workspace</h1>
        <p className="mt-3 text-sm leading-relaxed text-gray-600 dark:text-gray-300">
          Sua sessão no VoxTalent foi restaurada, mas o token temporário do Google expirou ou não está disponível. Reconecte sua conta para acessar a planilha oficial.
        </p>
        <button type="button" onClick={() => void login()} className="mt-5 mr-3 rounded-lg bg-[#00A9A1] px-4 py-2 text-sm font-bold text-white">Reconectar Google</button>
        <button type="button" onClick={() => void logout()} className="mt-5 rounded-lg border border-gray-300 dark:border-gray-600 px-4 py-2 text-sm font-semibold text-gray-700 dark:text-gray-200">Sair</button>
      </div>
    </div>
  );
}

if (!isOperationalDataLoaded) {
  return (
    <div className="min-h-screen w-full bg-[#F3F4F6] dark:bg-[#0B0F17] flex items-center justify-center p-6">
      <div className="w-full max-w-lg rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#111827] p-7 shadow-xl">
        <div className="mx-auto mb-4 h-10 w-10 rounded-xl bg-[#00A9A1] flex items-center justify-center text-white font-black">V</div>
        <h1 className="text-xl font-black text-gray-900 dark:text-white">Carregando a base oficial</h1>
        <p className="mt-3 text-sm leading-relaxed text-gray-600 dark:text-gray-300">
          {isSheetsSyncing ? 'Validando as abas e carregando os registros do Google Sheets...' : (sheetsSyncMessage || 'A base operacional ainda não foi carregada. O sistema não usará dados de demonstração ou cache local como substituto.')}
        </p>
        {isSheetsSyncing ? (
          <div className="mt-5 flex items-center gap-3 text-sm font-semibold text-teal-700 dark:text-teal-300">
            <span className="h-5 w-5 rounded-full border-2 border-[#00A9A1] border-t-transparent animate-spin" />
            Aguarde enquanto a planilha é verificada.
          </div>
        ) : (
          <button type="button" onClick={() => void loadDataFromGoogleSheets(masterSpreadsheetId || undefined)} className="mt-5 mr-3 rounded-lg bg-[#00A9A1] px-4 py-2 text-sm font-bold text-white">Tentar carregar novamente</button>
        )}
        <button type="button" onClick={() => void logout()} className="mt-5 rounded-lg border border-gray-300 dark:border-gray-600 px-4 py-2 text-sm font-semibold text-gray-700 dark:text-gray-200">Sair</button>
      </div>
    </div>
  );
}
  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#F3F4F6] dark:bg-[#0B0F17] font-sans text-gray-900 dark:text-gray-100 antialiased selection:bg-[#00A9A1] selection:text-white transition-colors duration-200">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex flex-1 flex-col overflow-hidden min-w-0">
        <Header />

        <main
          className={`flex-1 ${
            activeTab === 'kanban'
              ? 'p-2 sm:p-3 overflow-hidden flex flex-col min-h-0'
              : 'overflow-y-auto p-4 md:p-6'
          } bg-[#F3F4F6] dark:bg-[#0B0F17] transition-colors duration-200`}
        >
          {activeTab === 'dashboard' && <DashboardOverview />}
          {activeTab === 'kanban' && <KanbanBoard />}
          {activeTab === 'vagas' && <VagasList />}
          {activeTab === 'banco' && <BancoTalentosView />}
          {activeTab === 'mensagens' && <MensagensView />}
          {activeTab === 'workspace' && <WorkspaceView />}
          {activeTab === 'relatorios' && <RelatoriosView />}
          {activeTab === 'configuracoes' && <ConfiguracoesView />}
        </main>
      </div>

      {/* Global Modals */}
      <CandidateModal
        candidateId={candidateModalId}
        isOpen={!!candidateModalId}
        onClose={() => setCandidateModalId(null)}
      />

      <NewCandidateModal
        isOpen={isNewCandidateOpen}
        onClose={() => setIsNewCandidateOpen(false)}
      />

      <VagaModal
        vagaId={vagaModalId}
        isOpen={!!vagaModalId || isNewVagaOpen}
        onClose={() => {
          setVagaModalId(null);
          setIsNewVagaOpen(false);
        }}
      />

      <WhatsAppModal
        candidato={whatsAppModalCandidate}
        isOpen={!!whatsAppModalCandidate}
        onClose={() => setWhatsAppModalCandidate(null)}
      />

      <ColetivaScheduleModal
        vagaId={coletivaScheduleVagaId}
        isOpen={!!coletivaScheduleVagaId}
        onClose={() => setColetivaScheduleVagaId(null)}
      />

      <InterviewScheduleModal
        isOpen={!!calendarScheduleCandidate}
        onClose={() => setCalendarScheduleCandidate(null)}
        candidato={calendarScheduleCandidate}
        vaga={calendarScheduleCandidate ? getVagaById(calendarScheduleCandidate.vaga_id) : null}
        defaultDateProp={calendarScheduleDefaultDate}
      />

      <CandidatePdfModal
        isOpen={!!candidatePdfModalId && !!pdfCandidate}
        onClose={() => setCandidatePdfModalId(null)}
        candidateId={candidatePdfModalId}
      />

      <EtapaListModal
        isOpen={!!listModalEtapa}
        onClose={() => setListModalEtapa(null)}
        etapa={listModalEtapa}
      />
    </div>
  );
};

export default function App() {
  return (
    <ThemeProvider>
      <WorkspaceProvider>
        <AppProvider>
          <AppContent />
        </AppProvider>
      </WorkspaceProvider>
    </ThemeProvider>
  );
}

