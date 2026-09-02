import React, { useState, useEffect } from 'react';
import { useWorkspace } from '../../context/WorkspaceContext';
import { useApp } from '../../context/AppContext';
import { GoogleSignInButton } from '../Common/GoogleSignInButton';
import {
  FolderGit2,
  FileSpreadsheet,
  Mail,
  Calendar as CalendarIcon,
  Video,
  ExternalLink,
  Plus,
  RefreshCw,
  Trash2,
  Send,
  CheckCircle2,
  Sparkles,
  Search,
  Copy,
  Clock,
  UserCheck,
  AlertCircle,
  ClipboardList,
  FileText,
  Users,
  Check,
  ArrowRight,
} from 'lucide-react';
import {
  listDriveFiles,
  createDriveFolder,
  uploadTextFileToDrive,
  deleteDriveFile,
  DriveFileItem,
} from '../../lib/googleDriveService';
import {
  exportCandidatesToSheets,
  exportFinancialsToSheets,
  SheetCreationResult,
} from '../../lib/googleSheetsService';
import {
  sendGmailMessage,
  listRecentSentMessages,
} from '../../lib/googleGmailService';
import {
  listUpcomingEvents,
  createCalendarInterviewEvent,
  deleteCalendarEvent,
  CalendarEventItem,
} from '../../lib/googleCalendarService';
import { createGoogleMeetSpace } from '../../lib/googleMeetService';
import {
  createCandidateApplicationForm,
  createEvaluationRubricForm,
  createGoogleForm,
  listFormResponses,
  FormCreationResult,
  FormResponseItem,
} from '../../lib/googleFormsService';

export const WorkspaceView: React.FC = () => {
  const { isConnected, confirmAction, user } = useWorkspace();
  const {
    candidatos,
    vagas,
    custos,
    volumeCvs,
    addCandidato,
    masterSpreadsheetId,
    masterSpreadsheetUrl,
    isSheetsSyncing,
    lastSheetsSyncTime,
    sheetsSyncMessage,
    autoSyncEnabled,
    setAutoSyncEnabled,
    syncEngineState,
    clearSyncLogs,
    triggerSyncAction,
    syncWithGoogleSheets,
    loadDataFromGoogleSheets,
    initializeMasterSheet,
  } = useApp();

  const [activeWorkspaceTab, setActiveWorkspaceTab] = useState<'drive' | 'sheets' | 'forms' | 'gmail' | 'calendar' | 'meet'>('drive');

  // Drive state
  const [driveFiles, setDriveFiles] = useState<DriveFileItem[]>([]);
  const [isLoadingDrive, setIsLoadingDrive] = useState(false);
  const [driveSearch, setDriveSearch] = useState('');
  const [newFolderName, setNewFolderName] = useState('Vox2you - R&S Processos Seletivos');

  // Sheets state
  const [exportedSheets, setExportedSheets] = useState<SheetCreationResult[]>([]);
  const [isExportingSheets, setIsExportingSheets] = useState(false);
  const [sheetsSuccessMessage, setSheetsSuccessMessage] = useState<string | null>(null);

  // Forms state
  const [formsList, setFormsList] = useState<FormCreationResult[]>(() => {
    try {
      const saved = localStorage.getItem('voxtalent_google_forms');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [isCreatingForm, setIsCreatingForm] = useState(false);
  const [formSuccessMessage, setFormSuccessMessage] = useState<string | null>(null);
  const [selectedFormForResponses, setSelectedFormForResponses] = useState<FormCreationResult | null>(null);
  const [formResponses, setFormResponses] = useState<FormResponseItem[]>([]);
  const [isLoadingResponses, setIsLoadingResponses] = useState(false);
  const [customFormTitle, setCustomFormTitle] = useState('Processo Seletivo Vox2you - Inscrição');

  // Gmail state
  const [selectedCandidateId, setSelectedCandidateId] = useState<string>(candidatos[0]?.id || '');
  const [emailSubject, setEmailSubject] = useState('Processo Seletivo Vox2you - Próximos Passos');
  const [emailBody, setEmailBody] = useState('');
  const [isSendingEmail, setIsSendingEmail] = useState(false);
  const [emailSuccessMessage, setEmailSuccessMessage] = useState<string | null>(null);
  const [recentEmails, setRecentEmails] = useState<any[]>([]);
  const [isLoadingEmails, setIsLoadingEmails] = useState(false);

  // Calendar state
  const [calendarEvents, setCalendarEvents] = useState<CalendarEventItem[]>([]);
  const [isLoadingCalendar, setIsLoadingCalendar] = useState(false);
  const [eventTitle, setEventTitle] = useState('Entrevista de Seleção Vox2you');
  const [eventDate, setEventDate] = useState(new Date().toISOString().split('T')[0]);
  const [eventStartTime, setEventStartTime] = useState('14:00');
  const [eventDuration, setEventDuration] = useState('60');
  const [eventCandidateId, setEventCandidateId] = useState<string>(candidatos[0]?.id || '');
  const [eventWithMeet, setEventWithMeet] = useState(true);
  const [isCreatingEvent, setIsCreatingEvent] = useState(false);

  // Meet state
  const [meetLink, setMeetLink] = useState<string | null>(null);
  const [isGeneratingMeet, setIsGeneratingMeet] = useState(false);
  const [copiedMeet, setCopiedMeet] = useState(false);

  // Save forms to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('voxtalent_google_forms', JSON.stringify(formsList));
    } catch (e) {
      console.warn('Erro ao salvar formulários localmente:', e);
    }
  }, [formsList]);

  // Initialize email body when candidate changes
  useEffect(() => {
    const candidate = candidatos.find((c) => c.id === selectedCandidateId) || candidatos[0];
    if (candidate) {
      setEmailSubject(`Processo Seletivo Vox2you (${candidate.vaga_titulo}) - Próximos Passos`);
      setEmailBody(
        `<p>Olá, <strong>${candidate.nome.split(' ')[0]}</strong>!</p>` +
        `<p>Avaliamos com muito carinho sua candidatura para a vaga de <strong>${candidate.vaga_titulo}</strong> na unidade <strong>${candidate.unidade}</strong> da Vox2you.</p>` +
        `<p>Gostaríamos de convidá-lo(a) para a próxima etapa do nosso processo seletivo (Etapa: ${candidate.etapa_processo}).</p>` +
        `<p>Fique atento(a) às instruções e horários confirmados pela nossa equipe de R&S.</p>` +
        `<br/><p>Atenciosamente,<br/><strong>Equipe de Atração & Seleção Vox2you</strong></p>`
      );
    }
  }, [selectedCandidateId, candidatos]);

  // Load drive files
  const loadDriveFiles = async () => {
    if (!isConnected) return;
    setIsLoadingDrive(true);
    try {
      const files = await listDriveFiles();
      setDriveFiles(files);
    } catch (e: any) {
      console.error('Erro ao listar arquivos do Drive:', e);
    } finally {
      setIsLoadingDrive(false);
    }
  };

  // Load calendar events
  const loadCalendarEvents = async () => {
    if (!isConnected) return;
    setIsLoadingCalendar(true);
    try {
      const events = await listUpcomingEvents();
      setCalendarEvents(events);
    } catch (e: any) {
      console.error('Erro ao listar eventos da agenda:', e);
    } finally {
      setIsLoadingCalendar(false);
    }
  };

  // Load recent emails
  const loadRecentEmails = async () => {
    if (!isConnected) return;
    setIsLoadingEmails(true);
    try {
      const messages = await listRecentSentMessages(8);
      setRecentEmails(messages);
    } catch (e: any) {
      console.error('Erro ao carregar emails enviados:', e);
    } finally {
      setIsLoadingEmails(false);
    }
  };

  useEffect(() => {
    if (isConnected) {
      if (activeWorkspaceTab === 'drive') loadDriveFiles();
      if (activeWorkspaceTab === 'calendar') loadCalendarEvents();
      if (activeWorkspaceTab === 'gmail') loadRecentEmails();
    }
  }, [isConnected, activeWorkspaceTab]);

  // Actions
  const handleCreateFolder = () => {
    if (!newFolderName.trim()) return;
    confirmAction(`Criar a pasta "${newFolderName}" no seu Google Drive?`, async () => {
      try {
        await createDriveFolder(newFolderName);
        await loadDriveFiles();
      } catch (err: any) {
        alert(`Erro ao criar pasta: ${err?.message}`);
      }
    });
  };

  const handleExportCandidateCvToDrive = (cand: typeof candidatos[0]) => {
    confirmAction(`Salvar o dossiê e histórico de ${cand.nome} no Google Drive?`, async () => {
      try {
        const textContent =
          `Dossiê do Candidato - VoxTalent R&S\n` +
          `===================================\n` +
          `Nome: ${cand.nome}\n` +
          `Vaga: ${cand.vaga_titulo}\n` +
          `Unidade: ${cand.unidade}\n` +
          `Etapa Atual: ${cand.etapa_processo}\n` +
          `Status: ${cand.status}\n` +
          `Telefone: ${cand.telefone || 'N/A'}\n` +
          `Email: ${cand.email || 'N/A'}\n` +
          `Origem: ${cand.origem || 'N/A'}\n` +
          `Data de Inscrição: ${cand.data_inscricao}\n` +
          `Avaliação Geral: ${cand.avaliacao_geral || 'N/A'}/5\n\n` +
          `Notas da Entrevista:\n${cand.notas_entrevista || 'Nenhuma nota registrada.'}\n\n` +
          `Histórico de Mensagens WhatsApp:\n${(cand.historico_whatsapp || []).map((h) => `[${h.data_envio}] (${h.tipo}) ${h.template_nome}: ${h.texto_enviado}`).join('\n')}`;

        await uploadTextFileToDrive(`Dossie_${cand.nome.replace(/\s+/g, '_')}_${cand.unidade}.txt`, textContent);
        await loadDriveFiles();
        alert(`Dossiê de ${cand.nome} salvo com sucesso no Google Drive!`);
      } catch (err: any) {
        alert(`Erro ao salvar dossiê: ${err?.message}`);
      }
    });
  };

  const handleDeleteDriveFile = (file: DriveFileItem) => {
    confirmAction(`Excluir o arquivo "${file.name}" permanentemente do seu Google Drive?`, async () => {
      try {
        await deleteDriveFile(file.id);
        await loadDriveFiles();
      } catch (err: any) {
        alert(`Erro ao excluir arquivo: ${err?.message}`);
      }
    });
  };

  const handleExportCandidatesToSheets = () => {
    confirmAction('Criar uma nova planilha no Google Sheets com todos os candidatos ativos do VoxTalent?', async () => {
      setIsExportingSheets(true);
      try {
        const result = await exportCandidatesToSheets(candidatos);
        setExportedSheets((prev) => [result, ...prev]);
        setSheetsSuccessMessage(`Planilha "${result.title}" criada com sucesso!`);
      } catch (err: any) {
        alert(`Erro ao exportar para o Google Sheets: ${err?.message}`);
      } finally {
        setIsExportingSheets(false);
      }
    });
  };

  const handleExportFinancialsToSheets = () => {
    confirmAction('Criar planilha no Google Sheets com o relatório financeiro de custos e volume semanal?', async () => {
      setIsExportingSheets(true);
      try {
        const result = await exportFinancialsToSheets(custos, volumeCvs);
        setExportedSheets((prev) => [result, ...prev]);
        setSheetsSuccessMessage(`Planilha de Custos "${result.title}" exportada com sucesso!`);
      } catch (err: any) {
        alert(`Erro ao exportar custos: ${err?.message}`);
      } finally {
        setIsExportingSheets(false);
      }
    });
  };

  const handleSendGmail = () => {
    const candidate = candidatos.find((c) => c.id === selectedCandidateId);
    if (!candidate?.email) {
      alert('O candidato selecionado não possui endereço de e-mail cadastrado.');
      return;
    }

    confirmAction(`Enviar e-mail para ${candidate.nome} (${candidate.email}) através da sua conta do Gmail?`, async () => {
      setIsSendingEmail(true);
      try {
        await sendGmailMessage(candidate.email, emailSubject, emailBody);
        setEmailSuccessMessage(`E-mail enviado com sucesso para ${candidate.nome}!`);
        await loadRecentEmails();
      } catch (err: any) {
        alert(`Erro ao enviar e-mail: ${err?.message}`);
      } finally {
        setIsSendingEmail(false);
      }
    });
  };

  const handleCreateCalendarEvent = () => {
    const candidate = candidatos.find((c) => c.id === eventCandidateId);
    const startIso = `${eventDate}T${eventStartTime}:00-03:00`;
    const startDt = new Date(`${eventDate}T${eventStartTime}:00`);
    const endDt = new Date(startDt.getTime() + parseInt(eventDuration, 10) * 60 * 1000);
    const endHours = String(endDt.getHours()).padStart(2, '0');
    const endMins = String(endDt.getMinutes()).padStart(2, '0');
    const endIso = `${eventDate}T${endHours}:${endMins}:00-03:00`;

    confirmAction(
      `Agendar "${eventTitle}" para ${new Date(startIso).toLocaleDateString('pt-BR')} às ${eventStartTime} no seu Google Agenda${candidate?.email ? ` e convidar ${candidate.email}` : ''}?`,
      async () => {
        setIsCreatingEvent(true);
        try {
          await createCalendarInterviewEvent({
            summary: `${eventTitle} - ${candidate?.nome || 'Candidato'}`,
            description: `Entrevista R&S Vox2you.\nVaga: ${candidate?.vaga_titulo || 'Geral'}\nUnidade: ${candidate?.unidade || 'Todas'}\nTelefone: ${candidate?.telefone || 'N/A'}`,
            location: candidate ? `Unidade Vox2you ${candidate.unidade}` : 'Online',
            startIso,
            endIso,
            attendeeEmails: candidate?.email ? [candidate.email] : [],
            createMeetLink: eventWithMeet,
          });
          await loadCalendarEvents();
          alert('Evento agendado com sucesso no Google Agenda!');
        } catch (err: any) {
          alert(`Erro ao agendar evento: ${err?.message}`);
        } finally {
          setIsCreatingEvent(false);
        }
      }
    );
  };

  const handleDeleteCalendarEvent = (event: CalendarEventItem) => {
    confirmAction(`Remover o evento "${event.summary}" do seu Google Agenda?`, async () => {
      try {
        await deleteCalendarEvent(event.id);
        await loadCalendarEvents();
      } catch (err: any) {
        alert(`Erro ao remover evento: ${err?.message}`);
      }
    });
  };

  const handleGenerateMeet = async () => {
    setIsGeneratingMeet(true);
    try {
      const result = await createGoogleMeetSpace();
      setMeetLink(result.meetingUri);
    } catch (err: any) {
      alert(`Erro ao gerar link do Google Meet: ${err?.message}`);
    } finally {
      setIsGeneratingMeet(false);
    }
  };

  const handleCopyMeet = () => {
    if (!meetLink) return;
    navigator.clipboard.writeText(meetLink);
    setCopiedMeet(true);
    setTimeout(() => setCopiedMeet(false), 2000);
  };

  // Google Forms Handlers
  const handleCreateApplicationForm = () => {
    confirmAction(
      'Criar um novo formulário oficial "Trabalhe Conosco Vox2you" com as vagas e unidades ativas no seu Google Forms?',
      async () => {
        setIsCreatingForm(true);
        setFormSuccessMessage(null);
        try {
          const res = await createCandidateApplicationForm(vagas);
          setFormsList((prev) => [res, ...prev]);
          setFormSuccessMessage(`Formulário "${res.title}" criado com sucesso no Google Forms!`);
        } catch (err: any) {
          alert(`Erro ao criar formulário: ${err?.message}`);
        } finally {
          setIsCreatingForm(false);
        }
      }
    );
  };

  const handleCreateRubricForm = () => {
    confirmAction(
      'Criar o formulário "Ficha de Avaliação de Entrevista & Aula Teste" com rubrica (notas 1 a 5) no seu Google Forms?',
      async () => {
        setIsCreatingForm(true);
        setFormSuccessMessage(null);
        try {
          const res = await createEvaluationRubricForm();
          setFormsList((prev) => [res, ...prev]);
          setFormSuccessMessage(`Formulário de Avaliação "${res.title}" criado com sucesso!`);
        } catch (err: any) {
          alert(`Erro ao criar formulário: ${err?.message}`);
        } finally {
          setIsCreatingForm(false);
        }
      }
    );
  };

  const handleCreateCustomForm = () => {
    if (!customFormTitle.trim()) return;
    confirmAction(
      `Criar formulário "${customFormTitle}" no seu Google Forms?`,
      async () => {
        setIsCreatingForm(true);
        setFormSuccessMessage(null);
        try {
          const res = await createGoogleForm(customFormTitle);
          setFormsList((prev) => [res, ...prev]);
          setFormSuccessMessage(`Formulário "${res.title}" criado com sucesso!`);
        } catch (err: any) {
          alert(`Erro ao criar formulário: ${err?.message}`);
        } finally {
          setIsCreatingForm(false);
        }
      }
    );
  };

  const handleLoadFormResponses = async (form: FormCreationResult) => {
    setSelectedFormForResponses(form);
    setIsLoadingResponses(true);
    try {
      const resps = await listFormResponses(form.formId);
      setFormResponses(resps);
    } catch (err: any) {
      alert(`Erro ao carregar respostas: ${err?.message}`);
    } finally {
      setIsLoadingResponses(false);
    }
  };

  const handleDeleteSavedForm = (formId: string) => {
    setFormsList((prev) => prev.filter((f) => f.formId !== formId));
    if (selectedFormForResponses?.formId === formId) {
      setSelectedFormForResponses(null);
      setFormResponses([]);
    }
  };

  const filteredDriveFiles = driveFiles.filter((f) =>
    f.name.toLowerCase().includes(driveSearch.toLowerCase())
  );

  return (
    <div className="space-y-4">
      {/* Top Banner */}
      <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#111827] p-5 shadow-xs transition-colors">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-teal-500 to-emerald-400 flex items-center justify-center text-white shadow-md">
              <Sparkles className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                  Google Workspace Integrado
                </h2>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300 border border-teal-200 dark:border-teal-800">
                  Drive • Sheets • Forms • Gmail • Agenda • Meet
                </span>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Conexão nativa com a sua conta Google para sincronizar planilhas banco de dados, coletar candidaturas no Google Forms, disparar convites no Gmail, gerenciar a Google Agenda e abrir salas no Google Meet.
              </p>
            </div>
          </div>

          <div>
            <GoogleSignInButton />
          </div>
        </div>
      </div>

      {!isConnected ? (
        /* Not Connected State */
        <div className="rounded-2xl border border-dashed border-gray-300 dark:border-gray-700 bg-white dark:bg-[#111827] p-10 text-center space-y-4">
          <div className="mx-auto w-14 h-14 rounded-full bg-teal-50 dark:bg-teal-950/60 text-teal-600 dark:text-teal-300 flex items-center justify-center">
            <FolderGit2 className="w-7 h-7" />
          </div>
          <div className="max-w-md mx-auto">
            <h3 className="text-base font-bold text-gray-900 dark:text-white">
              Conecte sua conta Google Workspace
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 leading-relaxed">
              Para sincronizar arquivos no Google Drive, salvar dados no Google Sheets, criar questionários no Google Forms, enviar e-mails pelo Gmail, visualizar a Google Agenda e gerar links do Google Meet, clique no botão abaixo para autenticar.
            </p>
          </div>
          <div className="pt-2">
            <GoogleSignInButton />
          </div>
        </div>
      ) : (
        /* Connected Tabs */
        <div className="space-y-4">
          {/* Navigation Bar for 6 Services */}
          <div className="flex items-center gap-1.5 overflow-x-auto border-b border-gray-200 dark:border-gray-800 pb-2">
            <button
              type="button"
              onClick={() => setActiveWorkspaceTab('drive')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                activeWorkspaceTab === 'drive'
                  ? 'bg-[#00A9A1] text-white shadow-xs'
                  : 'bg-white dark:bg-[#111827] text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 border border-gray-200 dark:border-gray-800'
              }`}
            >
              <FolderGit2 className="w-4 h-4" />
              <span>Google Drive</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveWorkspaceTab('sheets')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                activeWorkspaceTab === 'sheets'
                  ? 'bg-[#00A9A1] text-white shadow-xs'
                  : 'bg-white dark:bg-[#111827] text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 border border-gray-200 dark:border-gray-800'
              }`}
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span>Google Sheets</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveWorkspaceTab('forms')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                activeWorkspaceTab === 'forms'
                  ? 'bg-[#00A9A1] text-white shadow-xs'
                  : 'bg-white dark:bg-[#111827] text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 border border-gray-200 dark:border-gray-800'
              }`}
            >
              <ClipboardList className="w-4 h-4" />
              <span>Google Forms</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveWorkspaceTab('gmail')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                activeWorkspaceTab === 'gmail'
                  ? 'bg-[#00A9A1] text-white shadow-xs'
                  : 'bg-white dark:bg-[#111827] text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 border border-gray-200 dark:border-gray-800'
              }`}
            >
              <Mail className="w-4 h-4" />
              <span>Gmail</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveWorkspaceTab('calendar')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                activeWorkspaceTab === 'calendar'
                  ? 'bg-[#00A9A1] text-white shadow-xs'
                  : 'bg-white dark:bg-[#111827] text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 border border-gray-200 dark:border-gray-800'
              }`}
            >
              <CalendarIcon className="w-4 h-4" />
              <span>Google Agenda</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveWorkspaceTab('meet')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                activeWorkspaceTab === 'meet'
                  ? 'bg-[#00A9A1] text-white shadow-xs'
                  : 'bg-white dark:bg-[#111827] text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 border border-gray-200 dark:border-gray-800'
              }`}
            >
              <Video className="w-4 h-4" />
              <span>Google Meet</span>
            </button>
          </div>

          {/* TAB 1: GOOGLE DRIVE */}
          {activeWorkspaceTab === 'drive' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              {/* Left Actions Card */}
              <div className="space-y-4">
                <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#111827] p-5 shadow-xs">
                  <h3 className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-2 mb-3">
                    <Plus className="w-4 h-4 text-[#00A9A1]" />
                    Criar Pasta no Google Drive
                  </h3>
                  <div className="space-y-3">
                    <input
                      type="text"
                      value={newFolderName}
                      onChange={(e) => setNewFolderName(e.target.value)}
                      placeholder="Nome da Pasta..."
                      className="w-full text-xs rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 px-3 py-2 text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-[#00A9A1]"
                    />
                    <button
                      type="button"
                      onClick={handleCreateFolder}
                      className="w-full flex items-center justify-center gap-2 bg-[#00A9A1] hover:bg-[#008f88] text-white font-bold text-xs py-2 rounded-xl shadow-xs transition-all active:scale-95"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      Criar Pasta
                    </button>
                  </div>
                </div>

                <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#111827] p-5 shadow-xs">
                  <h3 className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-2 mb-3">
                    <UserCheck className="w-4 h-4 text-[#00A9A1]" />
                    Salvar Dossiê de Candidato
                  </h3>
                  <p className="text-[11px] text-gray-500 dark:text-gray-400 mb-3">
                    Exporte todo o histórico, notas e dados de um candidato como arquivo de texto no seu Google Drive.
                  </p>
                  <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                    {candidatos.slice(0, 6).map((c) => (
                      <div
                        key={c.id}
                        className="flex items-center justify-between p-2 rounded-lg bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700/60 text-xs"
                      >
                        <div className="truncate mr-2">
                          <p className="font-bold text-gray-900 dark:text-white truncate">{c.nome}</p>
                          <p className="text-[10px] text-gray-500">{c.vaga_titulo}</p>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleExportCandidateCvToDrive(c)}
                          className="px-2 py-1 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-md text-[10px] font-bold text-[#00A9A1] hover:bg-teal-50 dark:hover:bg-gray-600 transition-colors"
                        >
                          Salvar
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Right Files Browser */}
              <div className="lg:col-span-2 rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#111827] p-5 shadow-xs space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-gray-100 dark:border-gray-800">
                  <div>
                    <h3 className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-2">
                      <FolderGit2 className="w-4 h-4 text-[#00A9A1]" />
                      Arquivos do seu Google Drive ({filteredDriveFiles.length})
                    </h3>
                    <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5">
                      Currículos, planilhas e documentos vinculados à conta Google.
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <div className="relative">
                      <Search className="w-3.5 h-3.5 text-gray-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        placeholder="Filtrar arquivos..."
                        value={driveSearch}
                        onChange={(e) => setDriveSearch(e.target.value)}
                        className="pl-8 pr-2.5 py-1 text-xs rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-[#00A9A1]"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={loadDriveFiles}
                      className="p-1.5 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-300"
                      title="Atualizar lista"
                    >
                      <RefreshCw className={`w-3.5 h-3.5 ${isLoadingDrive ? 'animate-spin' : ''}`} />
                    </button>
                  </div>
                </div>

                {isLoadingDrive ? (
                  <div className="py-12 text-center text-xs text-gray-500 flex items-center justify-center gap-2">
                    <div className="w-4 h-4 rounded-full border-2 border-teal-500 border-t-transparent animate-spin" />
                    <span>Carregando arquivos do Google Drive...</span>
                  </div>
                ) : filteredDriveFiles.length === 0 ? (
                  <div className="py-12 text-center text-xs text-gray-400 space-y-2">
                    <p>Nenhum arquivo encontrado no Google Drive.</p>
                    <p className="text-[11px]">Você pode criar pastas e salvar dossiês usando os controles ao lado.</p>
                  </div>
                ) : (
                  <div className="divide-y divide-gray-100 dark:divide-gray-800 max-h-96 overflow-y-auto">
                    {filteredDriveFiles.map((file) => (
                      <div
                        key={file.id}
                        className="py-3 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-800/50 px-2 rounded-lg transition-colors"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-8 h-8 rounded-lg bg-teal-50 dark:bg-teal-950/60 text-teal-600 flex items-center justify-center flex-shrink-0">
                            📄
                          </div>
                          <div className="min-w-0">
                            <p className="text-xs font-semibold text-gray-900 dark:text-white truncate">
                              {file.name}
                            </p>
                            <p className="text-[10px] text-gray-400">
                              {file.modifiedTime ? new Date(file.modifiedTime).toLocaleDateString('pt-BR') : 'Data recente'}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 flex-shrink-0">
                          {file.webViewLink && (
                            <a
                              href={file.webViewLink}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-[11px] font-bold text-gray-700 dark:text-gray-200"
                            >
                              <ExternalLink className="w-3 h-3" />
                              <span>Abrir</span>
                            </a>
                          )}
                          <button
                            type="button"
                            onClick={() => handleDeleteDriveFile(file)}
                            className="p-1.5 rounded-md hover:bg-rose-50 dark:hover:bg-rose-950/60 text-gray-400 hover:text-rose-600 transition-colors"
                            title="Excluir arquivo"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 2: GOOGLE SHEETS AS LIVE DATABASE */}
          {activeWorkspaceTab === 'sheets' && (
            <div className="space-y-4">
              {/* Master Sheet Banner */}
              <div className="rounded-2xl border border-emerald-200 dark:border-emerald-800/60 bg-emerald-50/50 dark:bg-emerald-950/20 p-5 shadow-xs">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  <div className="flex items-start sm:items-center gap-3.5">
                    <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shadow-md flex-shrink-0">
                      <FileSpreadsheet className="w-6 h-6" />
                    </div>
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="text-base font-bold text-gray-900 dark:text-white">
                          Google Sheets como Banco de Dados Central
                        </h3>
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-100 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-200 border border-emerald-300 dark:border-emerald-700">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                          {masterSpreadsheetId ? 'Banco Conectado' : 'Pronto para Vincular'}
                        </span>
                      </div>
                      <p className="text-xs text-gray-600 dark:text-gray-300 mt-1 max-w-2xl">
                        Todas as ações no site (novas vagas, movimentações de candidatos, lançamentos de custos) são refletidas em tempo real nas abas da sua planilha, e o <strong>Painel de Controle</strong> é atualizado automaticamente.
                      </p>
                      {lastSheetsSyncTime && (
                        <p className="text-[11px] font-medium text-emerald-700 dark:text-emerald-400 mt-1">
                          Última sincronização completa: {lastSheetsSyncTime}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 flex-shrink-0">
                    <button
                      type="button"
                      disabled={isSheetsSyncing}
                      onClick={() => syncWithGoogleSheets(true)}
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs transition-all active:scale-95 disabled:opacity-50"
                    >
                      <RefreshCw className={`w-3.5 h-3.5 ${isSheetsSyncing ? 'animate-spin' : ''}`} />
                      <span>{isSheetsSyncing ? 'Sincronizando...' : 'Sincronizar Tudo (Push)'}</span>
                    </button>

                    <button
                      type="button"
                      disabled={isSheetsSyncing || !masterSpreadsheetId}
                      onClick={() => loadDataFromGoogleSheets()}
                      className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700 text-gray-800 dark:text-gray-200 text-xs font-bold shadow-2xs transition-all active:scale-95 disabled:opacity-50"
                    >
                      <span>📥 Carregar do Sheets (Pull)</span>
                    </button>

                    {masterSpreadsheetUrl && (
                      <a
                        href={masterSpreadsheetUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold shadow-xs transition-all active:scale-95"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        <span>Abrir Planilha Mestre</span>
                      </a>
                    )}
                  </div>
                </div>
              </div>

              {/* Status or Toast Message */}
              {sheetsSyncMessage && (
                <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-xs text-emerald-800 dark:text-emerald-200 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                    <span className="font-medium">{sheetsSyncMessage}</span>
                  </div>
                </div>
              )}

              {/* Main Grid: Sheets Structure, Logs & Settings */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                {/* Left: Abas Sincronizadas no Sheets & Live Sync Logs */}
                <div className="lg:col-span-2 space-y-4">
                  <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#111827] p-5 shadow-xs space-y-4">
                    <div className="flex items-center justify-between pb-2 border-b border-gray-100 dark:border-gray-800">
                      <div>
                        <h4 className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-2">
                          <span>📑 Estrutura de Abas do Banco de Dados</span>
                        </h4>
                        <p className="text-[11px] text-gray-500 dark:text-gray-400">
                          Visualização dos módulos e tabelas sincronizados automaticamente.
                        </p>
                      </div>
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300">
                        7 Abas Ativas
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {/* Tab 1: Painel de Controle */}
                      <div className="p-3.5 rounded-xl border border-emerald-100 dark:border-emerald-900/40 bg-emerald-50/30 dark:bg-emerald-950/20 space-y-1.5">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-gray-900 dark:text-white flex items-center gap-1.5">
                            📊 Painel de Controle
                          </span>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-100 dark:bg-emerald-900 text-emerald-700 dark:text-emerald-300">
                            Resumo / KPIs
                          </span>
                        </div>
                        <p className="text-[11px] text-gray-500 dark:text-gray-400">
                          Consolidação de métricas gerais (vagas abertas, candidatos no funil, taxa de conversão, custos) e desempenho por unidade.
                        </p>
                      </div>

                      {/* Tab 2: Vagas */}
                      <div className="p-3.5 rounded-xl border border-teal-100 dark:border-teal-900/40 bg-teal-50/30 dark:bg-teal-950/20 space-y-1.5">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-gray-900 dark:text-white flex items-center gap-1.5">
                            💼 Vagas
                          </span>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-teal-100 dark:bg-teal-900 text-teal-700 dark:text-teal-300">
                            {vagas.length} registros
                          </span>
                        </div>
                        <p className="text-[11px] text-gray-500 dark:text-gray-400">
                          Cadastros de cargos, requisitos, benefícios, SLA em dias e status de abertura por franquia.
                        </p>
                      </div>

                      {/* Tab 3: Candidatos */}
                      <div className="p-3.5 rounded-xl border border-blue-100 dark:border-blue-900/40 bg-blue-50/30 dark:bg-blue-950/20 space-y-1.5">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-gray-900 dark:text-white flex items-center gap-1.5">
                            👥 Candidatos
                          </span>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300">
                            {candidatos.length} no pipeline
                          </span>
                        </div>
                        <p className="text-[11px] text-gray-500 dark:text-gray-400">
                          Nome, vaga vinculada, unidade, etapa do Kanban, notas de entrevista, telefones e avaliações.
                        </p>
                      </div>

                      {/* Tab 4: Custos Divulgação */}
                      <div className="p-3.5 rounded-xl border border-purple-100 dark:border-purple-900/40 bg-purple-50/30 dark:bg-purple-950/20 space-y-1.5">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-gray-900 dark:text-white flex items-center gap-1.5">
                            💰 Custos Divulgação
                          </span>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300">
                            {custos.length} lançamentos
                          </span>
                        </div>
                        <p className="text-[11px] text-gray-500 dark:text-gray-400">
                          Gastos por canal (Meta Ads, LinkedIn, InfoJobs), valor investido e observações por vaga.
                        </p>
                      </div>

                      {/* Tab 5: Volume Semanal */}
                      <div className="p-3.5 rounded-xl border border-amber-100 dark:border-amber-900/40 bg-amber-50/30 dark:bg-amber-950/20 space-y-1.5">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-gray-900 dark:text-white flex items-center gap-1.5">
                            📈 Volume Semanal
                          </span>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-amber-100 dark:bg-amber-900 text-amber-700 dark:text-amber-300">
                            {volumeCvs.length} períodos
                          </span>
                        </div>
                        <p className="text-[11px] text-gray-500 dark:text-gray-400">
                          Currículos recebidos, triados, aprovados e cálculo automático de taxa de conversão semanal.
                        </p>
                      </div>

                      {/* Tab 6: Unidades Vox */}
                      <div className="p-3.5 rounded-xl border border-rose-100 dark:border-rose-900/40 bg-rose-50/30 dark:bg-rose-950/20 space-y-1.5">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-gray-900 dark:text-white flex items-center gap-1.5">
                            🏢 Unidades Vox
                          </span>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-rose-100 dark:bg-rose-900 text-rose-700 dark:text-rose-300">
                            9 Franquias
                          </span>
                        </div>
                        <p className="text-[11px] text-gray-500 dark:text-gray-400">
                          Razão Social, CNPJs oficiais e endereços completos cadastrados das 9 unidades da rede.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Real-Time Auto-Sync Activity Logs */}
                  <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#111827] p-5 shadow-xs space-y-3">
                    <div className="flex items-center justify-between pb-2 border-b border-gray-100 dark:border-gray-800">
                      <div className="flex items-center gap-2">
                        <RefreshCw className={`w-4 h-4 text-emerald-600 ${syncEngineState.status === 'syncing' ? 'animate-spin' : ''}`} />
                        <h4 className="text-sm font-bold text-gray-900 dark:text-white">
                          Histórico de Sincronizações em Tempo Real
                        </h4>
                        {syncEngineState.pendingCount > 0 && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 dark:bg-amber-900/60 text-amber-800 dark:text-amber-200 animate-pulse">
                            {syncEngineState.pendingCount} pendente(s) na fila
                          </span>
                        )}
                      </div>
                      {syncEngineState.logs.length > 0 && (
                        <button
                          type="button"
                          onClick={clearSyncLogs}
                          className="text-[11px] text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 font-semibold transition-colors"
                        >
                          Limpar Histórico
                        </button>
                      )}
                    </div>

                    {syncEngineState.logs.length === 0 ? (
                      <p className="text-xs text-gray-400 py-4 text-center">
                        Nenhuma atividade registrada na sessão atual. Todas as alterações em vagas, candidatos e status aparecerão aqui em tempo real.
                      </p>
                    ) : (
                      <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                        {syncEngineState.logs.slice(0, 10).map((log) => (
                          <div
                            key={log.id}
                            className="flex items-center justify-between p-2.5 rounded-xl bg-gray-50 dark:bg-gray-800/60 border border-gray-100 dark:border-gray-700/60 text-xs"
                          >
                            <div className="flex items-center gap-2.5 min-w-0">
                              <span
                                className={`w-2 h-2 rounded-full flex-shrink-0 ${
                                  log.status === 'success'
                                    ? 'bg-emerald-500'
                                    : log.status === 'error'
                                    ? 'bg-rose-500'
                                    : 'bg-amber-500 animate-spin'
                                }`}
                              />
                              <div className="min-w-0">
                                <div className="flex items-center gap-1.5">
                                  <span className="font-bold text-gray-900 dark:text-white truncate">
                                    {log.entityName}
                                  </span>
                                  <span className="text-[10px] text-gray-400">
                                    • {log.timeFormatted}
                                  </span>
                                </div>
                                <p className="text-[11px] text-gray-500 dark:text-gray-400 truncate">
                                  {log.description}
                                </p>
                              </div>
                            </div>

                            <div className="flex items-center gap-2 flex-shrink-0">
                              <span className="text-[10px] px-2 py-0.5 rounded-md bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 font-semibold">
                                {log.targetTabs.join(', ')}
                              </span>
                              <span
                                className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                                  log.status === 'success'
                                    ? 'bg-emerald-100 dark:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300'
                                    : log.status === 'error'
                                    ? 'bg-rose-100 dark:bg-rose-900/60 text-rose-700 dark:text-rose-300'
                                    : 'bg-amber-100 dark:bg-amber-900/60 text-amber-700 dark:text-amber-300'
                                }`}
                              >
                                {log.status === 'success'
                                  ? 'Sincronizado'
                                  : log.status === 'error'
                                  ? 'Falha'
                                  : 'Enviando...'}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Right: Database Settings & Custom Exports */}
                <div className="space-y-4">
                  {/* Sync Settings Card */}
                  <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#111827] p-5 shadow-xs space-y-3">
                    <h4 className="text-sm font-bold text-gray-900 dark:text-white">
                      ⚙️ Configurações do Banco
                    </h4>

                    <div className="flex items-center justify-between p-3 rounded-xl bg-gray-50 dark:bg-gray-800/60 border border-gray-100 dark:border-gray-700">
                      <div>
                        <p className="text-xs font-bold text-gray-900 dark:text-white">
                          Sincronização Contínua
                        </p>
                        <p className="text-[10px] text-gray-500 dark:text-gray-400">
                          Atualiza o Sheets após cada nova vaga, candidato ou mudança de etapa.
                        </p>
                      </div>
                      <input
                        type="checkbox"
                        checked={autoSyncEnabled}
                        onChange={(e) => setAutoSyncEnabled(e.target.checked)}
                        className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                      />
                    </div>

                    <div className="pt-1 space-y-2">
                      <button
                        type="button"
                        disabled={isSheetsSyncing}
                        onClick={() => {
                          triggerSyncAction('UPDATE_CANDIDATO', 'Todos os Candidatos', 'Sincronização forçada da base de candidatos');
                        }}
                        className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/40 dark:hover:bg-emerald-900/40 text-emerald-800 dark:text-emerald-300 text-xs font-bold transition-colors"
                      >
                        <RefreshCw className="w-3.5 h-3.5" />
                        <span>Sincronizar Aba de Candidatos</span>
                      </button>

                      <button
                        type="button"
                        disabled={isSheetsSyncing}
                        onClick={() => {
                          confirmAction('Deseja reinicializar a planilha mestre central de R&S no Google Sheets?', async () => {
                            await initializeMasterSheet();
                          });
                        }}
                        className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-800 dark:text-gray-200 text-xs font-bold transition-colors"
                      >
                        <span>⚡ Criar / Vincular Nova Planilha Mestre</span>
                      </button>
                    </div>
                  </div>

                  {/* Quick One-off Exports */}
                  <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#111827] p-5 shadow-xs space-y-3">
                    <h4 className="text-sm font-bold text-gray-900 dark:text-white">
                      📑 Exportações Ad-Hoc
                    </h4>
                    <p className="text-[11px] text-gray-500 dark:text-gray-400">
                      Gere planilhas independentes avulsas caso precise compartilhar com terceiros:
                    </p>

                    <button
                      type="button"
                      disabled={isExportingSheets}
                      onClick={handleExportCandidatesToSheets}
                      className="w-full flex items-center justify-between p-2.5 rounded-xl border border-emerald-200 dark:border-emerald-800 bg-emerald-50/50 dark:bg-emerald-950/20 hover:bg-emerald-50 text-xs font-bold text-gray-900 dark:text-white transition-colors"
                    >
                      <span>👥 Exportar Candidatos Avulso</span>
                      <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-600 text-white">Criar</span>
                    </button>

                    <button
                      type="button"
                      disabled={isExportingSheets}
                      onClick={handleExportFinancialsToSheets}
                      className="w-full flex items-center justify-between p-2.5 rounded-xl border border-teal-200 dark:border-teal-800 bg-teal-50/50 dark:bg-teal-950/20 hover:bg-teal-50 text-xs font-bold text-gray-900 dark:text-white transition-colors"
                    >
                      <span>💰 Exportar Custos & Volume Avulso</span>
                      <span className="text-[10px] px-2 py-0.5 rounded bg-teal-600 text-white">Criar</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: GOOGLE FORMS */}
          {activeWorkspaceTab === 'forms' && (
            <div className="space-y-4">
              {/* Form Success Message */}
              {formSuccessMessage && (
                <div className="p-3.5 rounded-xl bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800 text-xs text-purple-900 dark:text-purple-200 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-purple-600 flex-shrink-0" />
                  <span>{formSuccessMessage}</span>
                </div>
              )}

              {/* Form Generation Options */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* 1. Candidate Application Form */}
                <div className="rounded-2xl border border-purple-200 dark:border-purple-800/60 bg-white dark:bg-[#111827] p-5 shadow-xs flex flex-col justify-between space-y-4">
                  <div className="space-y-2">
                    <div className="w-10 h-10 rounded-xl bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 flex items-center justify-center font-bold">
                      <Users className="w-5 h-5" />
                    </div>
                    <h3 className="text-sm font-bold text-gray-900 dark:text-white">
                      Trabalhe Conosco (Inscrições)
                    </h3>
                    <p className="text-[11px] text-gray-500 dark:text-gray-400 leading-relaxed">
                      Cria um formulário com as <strong>{vagas.length} vagas ativas</strong> e <strong>unidades Vox2you</strong> para divulgar em campanhas de atração, Meta Ads e redes sociais.
                    </p>
                  </div>
                  <button
                    type="button"
                    disabled={isCreatingForm}
                    onClick={handleCreateApplicationForm}
                    className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs shadow-xs transition-all active:scale-95 disabled:opacity-50"
                  >
                    <Plus className="w-4 h-4" />
                    <span>{isCreatingForm ? 'Criando Formulário...' : 'Gerar Trabalhe Conosco'}</span>
                  </button>
                </div>

                {/* 2. Evaluation Rubric Form */}
                <div className="rounded-2xl border border-indigo-200 dark:border-indigo-800/60 bg-white dark:bg-[#111827] p-5 shadow-xs flex flex-col justify-between space-y-4">
                  <div className="space-y-2">
                    <div className="w-10 h-10 rounded-xl bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 flex items-center justify-center font-bold">
                      <ClipboardList className="w-5 h-5" />
                    </div>
                    <h3 className="text-sm font-bold text-gray-900 dark:text-white">
                      Rubrica de Avaliação & Aula Teste
                    </h3>
                    <p className="text-[11px] text-gray-500 dark:text-gray-400 leading-relaxed">
                      Ficha padronizada de avaliação para gestores e avaliadores pontuarem didática, comunicação, postura e fit cultural (notas 1 a 5) com parecer final.
                    </p>
                  </div>
                  <button
                    type="button"
                    disabled={isCreatingForm}
                    onClick={handleCreateRubricForm}
                    className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-xs transition-all active:scale-95 disabled:opacity-50"
                  >
                    <Plus className="w-4 h-4" />
                    <span>{isCreatingForm ? 'Criando Ficha...' : 'Gerar Ficha de Avaliação'}</span>
                  </button>
                </div>

                {/* 3. Custom Blank Form */}
                <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#111827] p-5 shadow-xs flex flex-col justify-between space-y-4">
                  <div className="space-y-2">
                    <div className="w-10 h-10 rounded-xl bg-teal-100 dark:bg-teal-950 text-[#00A9A1] flex items-center justify-center font-bold">
                      <FileText className="w-5 h-5" />
                    </div>
                    <h3 className="text-sm font-bold text-gray-900 dark:text-white">
                      Formulário Personalizado
                    </h3>
                    <p className="text-[11px] text-gray-500 dark:text-gray-400 leading-relaxed">
                      Crie um formulário novo no Google Forms com título customizado para dinâmicas específicas ou pesquisas de candidatos.
                    </p>
                    <input
                      type="text"
                      value={customFormTitle}
                      onChange={(e) => setCustomFormTitle(e.target.value)}
                      placeholder="Título do formulário..."
                      className="w-full text-xs rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 px-3 py-2 text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-[#00A9A1]"
                    />
                  </div>
                  <button
                    type="button"
                    disabled={isCreatingForm || !customFormTitle.trim()}
                    onClick={handleCreateCustomForm}
                    className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-[#00A9A1] hover:bg-[#008f88] text-white font-bold text-xs shadow-xs transition-all active:scale-95 disabled:opacity-50"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Criar Formulário Google</span>
                  </button>
                </div>
              </div>

              {/* Generated Forms List & Responses Section */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                {/* Left: Saved / Generated Forms */}
                <div className="lg:col-span-1 rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#111827] p-5 shadow-xs space-y-4">
                  <div className="flex items-center justify-between pb-2 border-b border-gray-100 dark:border-gray-800">
                    <h3 className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-2">
                      <ClipboardList className="w-4 h-4 text-purple-600" />
                      Formulários Criados ({formsList.length})
                    </h3>
                  </div>

                  {formsList.length === 0 ? (
                    <div className="py-8 text-center text-xs text-gray-400">
                      Nenhum formulário gerado ainda. Use os botões acima para criar formulários integrados.
                    </div>
                  ) : (
                    <div className="space-y-2.5 max-h-96 overflow-y-auto">
                      {formsList.map((f) => (
                        <div
                          key={f.formId}
                          onClick={() => handleLoadFormResponses(f)}
                          className={`p-3 rounded-xl border cursor-pointer transition-all ${
                            selectedFormForResponses?.formId === f.formId
                              ? 'border-purple-400 bg-purple-50/50 dark:bg-purple-950/40 shadow-xs'
                              : 'border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/40 hover:bg-gray-100 dark:hover:bg-gray-800'
                          }`}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <p className="text-xs font-bold text-gray-900 dark:text-white line-clamp-1">
                              {f.title}
                            </p>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteSavedForm(f.formId);
                              }}
                              className="text-gray-400 hover:text-rose-500 p-1"
                              title="Remover da lista"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>

                          <div className="flex items-center gap-2 mt-2.5 pt-2 border-t border-gray-200/50 dark:border-gray-700/50 flex-wrap">
                            <a
                              href={f.responderUri}
                              target="_blank"
                              rel="noreferrer"
                              onClick={(e) => e.stopPropagation()}
                              className="inline-flex items-center gap-1 text-[10px] font-bold text-purple-600 dark:text-purple-400 hover:underline"
                            >
                              <ExternalLink className="w-3 h-3" />
                              Ver Formulário
                            </a>
                            {f.editUri && (
                              <a
                                href={f.editUri}
                                target="_blank"
                                rel="noreferrer"
                                onClick={(e) => e.stopPropagation()}
                                className="inline-flex items-center gap-1 text-[10px] font-bold text-indigo-600 dark:text-indigo-400 hover:underline"
                              >
                                <ExternalLink className="w-3 h-3" />
                                Editar no Google Forms
                              </a>
                            )}
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                navigator.clipboard.writeText(f.responderUri);
                                alert('Link do formulário copiado para a área de transferência!');
                              }}
                              className="inline-flex items-center gap-1 text-[10px] font-bold text-gray-600 dark:text-gray-300 hover:text-gray-900"
                            >
                              <Copy className="w-3 h-3" />
                              Copiar Link
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Right: Form Response Viewer */}
                <div className="lg:col-span-2 rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#111827] p-5 shadow-xs space-y-4">
                  <div className="flex items-center justify-between pb-2 border-b border-gray-100 dark:border-gray-800">
                    <div>
                      <h3 className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-2">
                        <Users className="w-4 h-4 text-purple-600" />
                        Respostas Recebidas via API
                      </h3>
                      <p className="text-[11px] text-gray-500 dark:text-gray-400">
                        {selectedFormForResponses
                          ? `Visualizando respostas de: "${selectedFormForResponses.title}"`
                          : 'Selecione um formulário ao lado para consultar as respostas submetidas'}
                      </p>
                    </div>

                    {selectedFormForResponses && (
                      <button
                        type="button"
                        onClick={() => handleLoadFormResponses(selectedFormForResponses)}
                        className="p-1.5 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-300"
                        title="Atualizar respostas"
                      >
                        <RefreshCw className={`w-3.5 h-3.5 ${isLoadingResponses ? 'animate-spin' : ''}`} />
                      </button>
                    )}
                  </div>

                  {!selectedFormForResponses ? (
                    <div className="py-16 text-center text-xs text-gray-400">
                      Selecione um dos formulários criados à esquerda para inspecionar respostas em tempo real.
                    </div>
                  ) : isLoadingResponses ? (
                    <div className="py-16 text-center text-xs text-gray-400 flex items-center justify-center gap-2">
                      <RefreshCw className="w-4 h-4 animate-spin text-purple-600" />
                      <span>Consultando respostas no Google Forms...</span>
                    </div>
                  ) : formResponses.length === 0 ? (
                    <div className="py-16 text-center text-xs text-gray-400 space-y-2">
                      <p>Nenhuma resposta enviada ainda para este formulário.</p>
                      <p className="text-[11px] text-gray-500">
                        Envie o link do formulário para candidatos para começar a coletar inscrições.
                      </p>
                      <a
                        href={selectedFormForResponses.responderUri}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-purple-600 text-white text-xs font-bold shadow-xs hover:bg-purple-700"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        <span>Abrir Formulário para Teste</span>
                      </a>
                    </div>
                  ) : (
                    <div className="space-y-3 max-h-96 overflow-y-auto">
                      {formResponses.map((resp, idx) => {
                        const answerTexts: string[] = [];
                        if (resp.answers) {
                          Object.values(resp.answers).forEach((ans: any) => {
                            ans?.textAnswers?.answers?.forEach((a: any) => {
                              if (a?.value) answerTexts.push(a.value);
                            });
                          });
                        }

                        return (
                          <div
                            key={resp.responseId || idx}
                            className="p-3.5 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50/60 dark:bg-gray-800/40 text-xs space-y-2"
                          >
                            <div className="flex items-center justify-between">
                              <span className="font-bold text-gray-900 dark:text-white">
                                Resposta #{idx + 1}
                              </span>
                              <span className="text-[10px] text-gray-500">
                                {new Date(resp.lastSubmittedTime || resp.createTime).toLocaleString('pt-BR')}
                              </span>
                            </div>

                            {answerTexts.length > 0 ? (
                              <div className="space-y-1 bg-white dark:bg-gray-900/60 p-2.5 rounded-lg border border-gray-100 dark:border-gray-800">
                                {answerTexts.map((txt, tIdx) => (
                                  <p key={tIdx} className="text-[11px] text-gray-700 dark:text-gray-300">
                                    • {txt}
                                  </p>
                                ))}
                              </div>
                            ) : (
                              <p className="text-[11px] text-gray-400 italic">Respostas registradas no formulário.</p>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: GMAIL */}
          {activeWorkspaceTab === 'gmail' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              {/* Left Email Composer */}
              <div className="lg:col-span-2 rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#111827] p-5 shadow-xs space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-red-100 dark:bg-red-950 text-red-600 flex items-center justify-center font-bold">
                    <Mail className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-gray-900 dark:text-white">
                      Disparo de E-mail via Gmail Oficial
                    </h3>
                    <p className="text-[11px] text-gray-500 dark:text-gray-400">
                      Envie comunicações personalizadas e convites de entrevista diretamente da sua conta Google.
                    </p>
                  </div>
                </div>

                {emailSuccessMessage && (
                  <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-xs text-emerald-800 dark:text-emerald-200 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                    <span>{emailSuccessMessage}</span>
                  </div>
                )}

                <div className="space-y-3">
                  <div>
                    <label className="block text-[11px] font-bold text-gray-700 dark:text-gray-300 mb-1">
                      Destinatário (Candidato do Pipeline)
                    </label>
                    <select
                      value={selectedCandidateId}
                      onChange={(e) => setSelectedCandidateId(e.target.value)}
                      className="w-full text-xs rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 px-3 py-2 text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-[#00A9A1]"
                    >
                      {candidatos.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.nome} - {c.vaga_titulo} ({c.email || 'Sem e-mail cadastrado'})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-gray-700 dark:text-gray-300 mb-1">
                      Assunto do E-mail
                    </label>
                    <input
                      type="text"
                      value={emailSubject}
                      onChange={(e) => setEmailSubject(e.target.value)}
                      className="w-full text-xs rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 px-3 py-2 text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-[#00A9A1]"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-gray-700 dark:text-gray-300 mb-1">
                      Corpo do E-mail (HTML Formatado)
                    </label>
                    <textarea
                      rows={6}
                      value={emailBody}
                      onChange={(e) => setEmailBody(e.target.value)}
                      className="w-full text-xs rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 p-3 text-gray-900 dark:text-white font-mono leading-relaxed focus:outline-none focus:ring-1 focus:ring-[#00A9A1]"
                    />
                  </div>

                  <div className="flex justify-end pt-1">
                    <button
                      type="button"
                      disabled={isSendingEmail}
                      onClick={handleSendGmail}
                      className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold shadow-md transition-all active:scale-95"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>{isSendingEmail ? 'Enviando...' : 'Enviar pelo Gmail'}</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Right Recent Emails */}
              <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#111827] p-5 shadow-xs space-y-4">
                <div className="flex items-center justify-between pb-2 border-b border-gray-100 dark:border-gray-800">
                  <h3 className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-2">
                    <Clock className="w-4 h-4 text-red-500" />
                    Enviados Recentemente
                  </h3>
                  <button
                    type="button"
                    onClick={loadRecentEmails}
                    className="p-1 rounded text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isLoadingEmails ? 'animate-spin' : ''}`} />
                  </button>
                </div>

                {isLoadingEmails ? (
                  <div className="py-8 text-center text-xs text-gray-400">Carregando histórico...</div>
                ) : recentEmails.length === 0 ? (
                  <div className="py-8 text-center text-xs text-gray-400">
                    Nenhum e-mail recente encontrado.
                  </div>
                ) : (
                  <div className="space-y-2 max-h-80 overflow-y-auto">
                    {recentEmails.map((msg) => (
                      <div
                        key={msg.id}
                        className="p-2.5 rounded-xl border border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/40 text-xs space-y-1"
                      >
                        <p className="font-bold text-gray-900 dark:text-white truncate">
                          {msg.subject}
                        </p>
                        <p className="text-[10px] text-gray-500 truncate">Para: {msg.to}</p>
                        <p className="text-[10px] text-gray-400 line-clamp-1">{msg.snippet}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 4: GOOGLE CALENDAR */}
          {activeWorkspaceTab === 'calendar' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              {/* Left Calendar Event Form */}
              <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#111827] p-5 shadow-xs space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-950 text-blue-600 flex items-center justify-center font-bold">
                    <CalendarIcon className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-gray-900 dark:text-white">
                      Agendar no Google Agenda
                    </h3>
                    <p className="text-[11px] text-gray-500 dark:text-gray-400">
                      Sincronize horários de entrevista e envie convite oficial.
                    </p>
                  </div>
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="block text-[11px] font-bold text-gray-700 dark:text-gray-300 mb-1">
                      Candidato
                    </label>
                    <select
                      value={eventCandidateId}
                      onChange={(e) => setEventCandidateId(e.target.value)}
                      className="w-full text-xs rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 px-3 py-2 text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-[#00A9A1]"
                    >
                      {candidatos.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.nome} ({c.vaga_titulo})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-gray-700 dark:text-gray-300 mb-1">
                      Título do Evento
                    </label>
                    <input
                      type="text"
                      value={eventTitle}
                      onChange={(e) => setEventTitle(e.target.value)}
                      className="w-full text-xs rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 px-3 py-2 text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-[#00A9A1]"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[11px] font-bold text-gray-700 dark:text-gray-300 mb-1">
                        Data
                      </label>
                      <input
                        type="date"
                        value={eventDate}
                        onChange={(e) => setEventDate(e.target.value)}
                        className="w-full text-xs rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 px-3 py-2 text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-[#00A9A1]"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-gray-700 dark:text-gray-300 mb-1">
                        Horário
                      </label>
                      <input
                        type="time"
                        value={eventStartTime}
                        onChange={(e) => setEventStartTime(e.target.value)}
                        className="w-full text-xs rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 px-3 py-2 text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-[#00A9A1]"
                      />
                    </div>
                  </div>

                  <div className="flex items-center gap-2 pt-1">
                    <input
                      type="checkbox"
                      id="meet-checkbox"
                      checked={eventWithMeet}
                      onChange={(e) => setEventWithMeet(e.target.checked)}
                      className="rounded text-[#00A9A1] focus:ring-[#00A9A1]"
                    />
                    <label htmlFor="meet-checkbox" className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                      Incluir link do Google Meet automaticamente
                    </label>
                  </div>

                  <button
                    type="button"
                    disabled={isCreatingEvent}
                    onClick={handleCreateCalendarEvent}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-xs transition-all active:scale-95"
                  >
                    <CalendarIcon className="w-3.5 h-3.5" />
                    <span>{isCreatingEvent ? 'Agendando...' : 'Agendar no Google Agenda'}</span>
                  </button>
                </div>
              </div>

              {/* Right Upcoming Events */}
              <div className="lg:col-span-2 rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#111827] p-5 shadow-xs space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-gray-800">
                  <h3 className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-2">
                    <CalendarIcon className="w-4 h-4 text-blue-600" />
                    Próximos Compromissos na Google Agenda ({calendarEvents.length})
                  </h3>
                  <button
                    type="button"
                    onClick={loadCalendarEvents}
                    className="p-1.5 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-300"
                    title="Atualizar agenda"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isLoadingCalendar ? 'animate-spin' : ''}`} />
                  </button>
                </div>

                {isLoadingCalendar ? (
                  <div className="py-12 text-center text-xs text-gray-400">Carregando eventos...</div>
                ) : calendarEvents.length === 0 ? (
                  <div className="py-12 text-center text-xs text-gray-400">
                    Nenhum evento futuro encontrado na sua agenda principal.
                  </div>
                ) : (
                  <div className="divide-y divide-gray-100 dark:divide-gray-800 max-h-96 overflow-y-auto">
                    {calendarEvents.map((evt) => (
                      <div
                        key={evt.id}
                        className="py-3 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-800/50 px-2 rounded-lg transition-colors"
                      >
                        <div>
                          <p className="text-xs font-bold text-gray-900 dark:text-white">
                            {evt.summary}
                          </p>
                          <p className="text-[11px] text-gray-500">
                            {evt.start.dateTime
                              ? new Date(evt.start.dateTime).toLocaleString('pt-BR', {
                                  dateStyle: 'short',
                                  timeStyle: 'short',
                                })
                              : evt.start.date}
                            {evt.location && ` • ${evt.location}`}
                          </p>
                        </div>

                        <div className="flex items-center gap-2">
                          {evt.hangoutLink && (
                            <a
                              href={evt.hangoutLink}
                              target="_blank"
                              rel="noreferrer"
                              className="px-2.5 py-1 rounded-md bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 text-[10px] font-bold inline-flex items-center gap-1 border border-emerald-200 dark:border-emerald-800"
                            >
                              <Video className="w-3 h-3" />
                              Entrar no Meet
                            </a>
                          )}
                          {evt.htmlLink && (
                            <a
                              href={evt.htmlLink}
                              target="_blank"
                              rel="noreferrer"
                              className="p-1.5 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500"
                              title="Abrir no Google Calendar"
                            >
                              <ExternalLink className="w-3.5 h-3.5" />
                            </a>
                          )}
                          <button
                            type="button"
                            onClick={() => handleDeleteCalendarEvent(evt)}
                            className="p-1.5 rounded-md hover:bg-rose-50 text-gray-400 hover:text-rose-600 transition-colors"
                            title="Remover evento"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 5: GOOGLE MEET */}
          {activeWorkspaceTab === 'meet' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#111827] p-6 shadow-xs space-y-5">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-500 text-white flex items-center justify-center font-bold shadow-md">
                    <Video className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-gray-900 dark:text-white">
                      Google Meet para Entrevistas Online
                    </h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Gere salas de videoconferência instantâneas para dinâmicas, entrevistas individuais ou avaliação de pitches.
                    </p>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-gray-50 dark:bg-gray-800/80 border border-gray-200 dark:border-gray-700 space-y-3">
                  <p className="text-xs font-semibold text-gray-800 dark:text-gray-200">
                    Gerador de Link Google Meet:
                  </p>
                  <button
                    type="button"
                    disabled={isGeneratingMeet}
                    onClick={handleGenerateMeet}
                    className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md transition-all active:scale-95"
                  >
                    <Video className="w-4 h-4" />
                    <span>{isGeneratingMeet ? 'Gerando Sala...' : 'Gerar Nova Sala Google Meet'}</span>
                  </button>

                  {meetLink && (
                    <div className="mt-4 p-3 rounded-xl bg-white dark:bg-gray-800 border border-emerald-300 dark:border-emerald-700 space-y-2">
                      <p className="text-[11px] font-bold text-emerald-800 dark:text-emerald-300">
                        Link do Google Meet Criado:
                      </p>
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          readOnly
                          value={meetLink}
                          className="flex-1 text-xs font-mono bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg px-2.5 py-1.5 text-gray-900 dark:text-white"
                        />
                        <button
                          type="button"
                          onClick={handleCopyMeet}
                          className="px-3 py-1.5 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-xs font-bold rounded-lg transition-colors flex items-center gap-1"
                        >
                          <Copy className="w-3.5 h-3.5" />
                          <span>{copiedMeet ? 'Copiado!' : 'Copiar'}</span>
                        </button>
                        <a
                          href={meetLink}
                          target="_blank"
                          rel="noreferrer"
                          className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg shadow-xs transition-colors flex items-center gap-1"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                          <span>Entrar</span>
                        </a>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Right Guide for Video Screening */}
              <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#111827] p-6 shadow-xs space-y-4">
                <h3 className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-teal-600" />
                  Boas Práticas para Entrevistas Online Vox2you
                </h3>
                <div className="space-y-3 text-xs text-gray-600 dark:text-gray-300 leading-relaxed">
                  <div className="p-3 rounded-xl bg-teal-50/50 dark:bg-teal-950/40 border border-teal-100 dark:border-teal-800">
                    <p className="font-bold text-teal-900 dark:text-teal-200 mb-1">
                      1. Dinâmica Coletiva Online (POP v1.1)
                    </p>
                    <p className="text-[11px] text-teal-800 dark:text-teal-300">
                      Mantenha a câmera ligada, acolha todos os candidatos pontualmente e não mencione o formato coletivo previamente nos convites individuais para manter a espontaneidade.
                    </p>
                  </div>

                  <div className="p-3 rounded-xl bg-indigo-50/50 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-800">
                    <p className="font-bold text-indigo-900 dark:text-indigo-200 mb-1">
                      2. Gravação de Pitch de Apresentação
                    </p>
                    <p className="text-[11px] text-indigo-800 dark:text-indigo-300">
                      Peça ao candidato 2 minutos para apresentar sua trajetória e responder à pergunta situacional de oratória e vendas.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
