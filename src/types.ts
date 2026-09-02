export type UnidadeVox = string;

export interface UnidadeVoxInfo {
  apelido: UnidadeVox;
  razaoSocial: string;
  cnpj: string;
  endereco: string;
  cidade: string;
  uf: string;
  telefoneContato?: string;
  gerenteLocal?: string;
}

export type EtapaProcesso =
  | 'Triagem'
  | '1º Contato'
  | 'Vídeo de Apresentação'
  | 'Entrevista Coletiva/Online'
  | 'Etapa Prática'
  | 'Gestor'
  | 'Diretoria'
  | 'Banco de Talentos';

export type StatusVaga = 'Em aberto' | 'Congelada' | 'Fechada' | 'Cancelada';

export type StatusCandidato =
  | 'Em andamento'
  | 'Aprovado'
  | 'Reprovado'
  | 'Ausente'
  | 'Desistente';

export interface Vaga {
  id: string;
  titulo: string;
  cargo: string; // Structured cargo: Professor, Closer, SDR, Gerente, etc.
  unidade: UnidadeVox;
  status: StatusVaga;
  data_abertura: string; // YYYY-MM-DD
  meta_sla_dias: number;
  descricao?: string;
  responsavel?: string;
  prioridade: 'Baixa' | 'Média' | 'Alta' | 'Urgente';
  regime: 'CLT' | 'PJ' | 'Estágio' | 'Freelancer';
  salario_range?: string;
  quantidade_vagas?: number;
}

export interface HistoricoEtapa {
  etapa: EtapaProcesso;
  data: string;
  observacao?: string;
  usuario?: string;
}

export interface Candidato {
  id: string;
  nome: string;
  email: string;
  telefone: string;
  vaga_id: string;
  vaga_titulo: string;
  unidade: UnidadeVox;
  etapa_processo: EtapaProcesso;
  status: StatusCandidato;
  fluxo_simplificado: boolean; // Toggle for professor or simplified roles
  curriculo_url?: string;
  video_url?: string;
  solides_profile_url?: string;
  aula_teste_data?: string;
  aula_teste_nota?: number;
  notas_entrevista?: string;
  avaliacao_geral?: number; // 1 to 5
  motivo_reprovacao?: string;
  origem_cv?: string; // InfoJobs, LinkedIn, Instagram, Indicação
  data_entrevista?: string; // YYYY-MM-DD
  hora_entrevista?: string; // HH:mm
  google_calendar_event_id?: string;
  google_calendar_event_link?: string;
  google_meet_link?: string;
  criado_em: string;
  atualizado_em: string;
  historico_etapas: HistoricoEtapa[];
}

export interface MensagemTemplate {
  id: string;
  numero: number;
  titulo: string;
  etapa: EtapaProcesso;
  tipo: 'whatsapp' | 'email';
  objetivo: string;
  quemEnvia: string;
  canal: string;
  texto: string;
  texto_confidencial?: string;
  confidencial: boolean;
  descricao: string;
}

export interface POPAtividade {
  numero: number;
  descricao: string;
  responsavel: string;
  prazo: string;
  anexoRef?: string;
}

export interface AcaoCusto {
  id: string;
  vaga_id: string;
  vaga_titulo: string;
  unidade: UnidadeVox;
  canal: string; // InfoJobs, LinkedIn, Instagram Ads, Catho, Indicação, etc.
  valor: number;
  data: string;
  observacoes?: string;
}

export interface VolumeCV {
  id: string;
  semana: string; // ex: 2026-W32
  vaga_id: string;
  vaga_titulo: string;
  unidade: UnidadeVox;
  canal: string;
  quantidade_cvs: number;
  quantidade_triados: number;
  quantidade_aprovados: number;
}

export interface GoogleWorkspaceApiConfig {
  calendarId: string;
  defaultDurationMinutes: number;
  autoGenerateMeetLink: boolean;
  timezone: string;
  notifyAttendeesByEmail: boolean;
  eventTitlePrefix: string;
  meetSpaceAccessType: 'OPEN' | 'TRUSTED' | 'RESTRICTED';
  meetFallbackUri: string;
  isCalendarApiEnabled: boolean;
  isMeetApiEnabled: boolean;
  lastSyncAt?: string;
}

export type NivelAcesso = 'Admin' | 'Recrutador' | 'Gestor' | 'Visualizador';

export interface PermissoesConta {
  criarVagas: boolean;
  moverEtapas: boolean;
  bancoTalentos: boolean;
  gerenciarConfiguracoes: boolean;
  exportarRelatorios: boolean;
  dispararWhatsApp: boolean;
  agendarEntrevistas: boolean;
}

export interface ContaUsuario {
  id: string;
  nome: string;
  email: string;
  cargo: string;
  unidade: string; // 'Todas as Unidades' or UnidadeVox
  nivelAcesso: NivelAcesso;
  status: 'Ativo' | 'Inativo';
  avatarUrl?: string;
  criadoEm: string;
  ultimoAcesso?: string;
  permissoes: PermissoesConta;
}

export interface ProcessoConfig {
  min_coletiva: number; // default: 5
  fluxo_simplificado_cargo: string; // default: "Professor"
  sla_padrao: Record<string, number>;
  sla_etapas_dias?: Record<EtapaProcesso, number>; // SLA threshold per stage in days
  exigir_video_obrigatorio: boolean;
  notificar_ausentes_whatsapp: boolean;
  link_solides_padrao: string;
  link_meet_padrao: string;
  recrutador_padrao: string;
  // Google Calendar & Google Meet API Settings
  google_calendar_id?: string;
  google_calendar_default_duration?: number;
  google_calendar_auto_meet?: boolean;
  google_calendar_timezone?: string;
  google_calendar_notifications?: boolean;
  google_calendar_event_prefix?: string;
  google_meet_access_type?: 'OPEN' | 'TRUSTED' | 'RESTRICTED';
  google_meet_fallback_link?: string;
  google_api_config?: GoogleWorkspaceApiConfig;
}

