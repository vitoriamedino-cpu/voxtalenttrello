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

