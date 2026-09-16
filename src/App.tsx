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
  } = useApp();

  const pdfCandidate = candidatePdfModalId ? getCandidatoById(candidatePdfModalId) : null;
const { user, isLoadingAuth } = useWorkspace();

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
        candidato={pdfCandidate}
        vaga={pdfCandidate ? getVagaById(pdfCandidate.vaga_id) : null}
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

