import {
  UnidadeVox,
  UnidadeVoxInfo,
  EtapaProcesso,
  StatusVaga,
  StatusCandidato,
  ProcessoConfig,
  MensagemTemplate,
  POPAtividade,
  Vaga,
  Candidato,
  AcaoCusto,
  VolumeCV,
  ContaUsuario,
  NivelAcesso,
  PermissoesConta,
} from '../types';

export const UNIDADES_VOX: UnidadeVox[] = [
  'Vox Cidade Verde',
  'Vox Tirol',
  'Vox Mossoró',
  'Vox Indaiatuba',
  'Vox Campina Grande',
  'Vox Caicó',
  'Vox João Pessoa',
  'Vox Patos',
  'Vox Itu',
];

export const DADOS_UNIDADES_VOX: Record<UnidadeVox, UnidadeVoxInfo> = {
  'Vox Cidade Verde': {
    apelido: 'Vox Cidade Verde',
    razaoSocial: 'COMUNICAR TREINAMENTO E DESENVOLVIMENTO HUMANO LTDA',
    cnpj: '45.858.514/0001-10',
    endereco: 'Av. Deputado Gastão Mariz de Faria, 2150 - Nova Parnamirim, Parnamirim - RN, 59152-110',
    cidade: 'Parnamirim',
    uf: 'RN',
  },
  'Vox Tirol': {
    apelido: 'Vox Tirol',
    razaoSocial: 'CONCEITO DESENVOLVIMENTO HUMANO E ENSINO ORGANIZACIONAL LTDA',
    cnpj: '35.875.746/0001-23',
    endereco: 'Av. Campos Sales, 901 - Tirol, Natal - RN, 59020-300',
    cidade: 'Natal',
    uf: 'RN',
  },
  'Vox Mossoró': {
    apelido: 'Vox Mossoró',
    razaoSocial: 'COMUNICARTE TREINAMENTO E DESENVOLVIMENTO HUMANO E ORGANIZACIONAL LTDA',
    cnpj: '49.872.769/0001-99',
    endereco: 'Av. João da Escóssia, 904 - Loja 10,11,12 e 13 - Nova Betânia, Mossoró - RN, 59607-330',
    cidade: 'Mossoró',
    uf: 'RN',
  },
  'Vox Indaiatuba': {
    apelido: 'Vox Indaiatuba',
    razaoSocial: 'L&S TREINAMENTO E DESENVOLVIMENTO HUMANO LTDA',
    cnpj: '53.707.335/0001-00',
    endereco: 'Av. Fábio Ferraz Bicudo, 1338 - Jardim Esplanada, Indaiatuba - SP, 13331-501',
    cidade: 'Indaiatuba',
    uf: 'SP',
  },
  'Vox Campina Grande': {
    apelido: 'Vox Campina Grande',
    razaoSocial: 'VOZ TREINAMENTO E DESENVOLVIMENTO LTDA',
    cnpj: '53.561.599/0001-07',
    endereco: 'R. Paulo de Frontin, 55 - TÉRREO Loja 35 - Estação Velha, Campina Grande - PB, 58400-310',
    cidade: 'Campina Grande',
    uf: 'PB',
  },
  'Vox Caicó': {
    apelido: 'Vox Caicó',
    razaoSocial: 'VOZES DO SERIDO TREINAMENTO E DESENVOLVIMENTO LTDA',
    cnpj: '58.428.367/0001-90',
    endereco: 'R. Dr. Renato Dantas, 241 - Centro, Caicó - RN, 59300-000',
    cidade: 'Caicó',
    uf: 'RN',
  },
  'Vox João Pessoa': {
    apelido: 'Vox João Pessoa',
    razaoSocial: 'ACADEMIA DE ORATORIA JP DESENVOLVIMENTO HUMANO E ORGANIZACIONAL LTDA',
    cnpj: '62.335.354/0001-44',
    endereco: 'R. Helena Freire, 330 - Altiplano Cabo Branco, João Pessoa - PB, 58038-142',
    cidade: 'João Pessoa',
    uf: 'PB',
  },
  'Vox Patos': {
    apelido: 'Vox Patos',
    razaoSocial: 'ACADEMIA DE ORATORIA PATOS LTDA',
    cnpj: '63.444.789/0001-90',
    endereco: 'Av. Rio Branco, 479 - Brasília, Patos - PB, 58700-370',
    cidade: 'Patos',
    uf: 'PB',
  },
  'Vox Itu': {
    apelido: 'Vox Itu',
    razaoSocial: '',
    cnpj: '',
    endereco: 'Rua Leda Maria Toledo Assumpção Menabó, Itu Novo Centro, 00000, Itu - São Paulo, 13303-521, Brasil.',
    cidade: 'Itu',
    uf: 'SP',
  },
};

export const ETAPAS_KANBAN: EtapaProcesso[] = [
  'Triagem',
  '1º Contato',
  'Vídeo de Apresentação',
  'Entrevista Coletiva (RH)',
  'Entrevista Individual (RH)',
  'Etapa Prática',
  'Gestor',
  'Diretoria',
  'Banco de Talentos',
];

export const STATUS_VAGA: StatusVaga[] = [
  'Em aberto',
  'Congelada',
  'Fechada',
  'Cancelada',
];

export const STATUS_CANDIDATO: StatusCandidato[] = [
  'Em andamento',
  'Aprovado',
  'Reprovado',
  'Ausente',
  'Desistente',
];

export const MOTIVOS_REPROVACAO_PRESET = [
  'Perfil desalinhado com a cultura e metodologia Vox2you',
  'Dicção, postura, entonação ou oratória insuficiente',
  'Reprovado na Aula Teste (Didática / Domínio do Conteúdo)',
  'Pretensão salarial incompatível com a política da unidade',
  'Falta de desenvoltura comercial e experiência em fechamento',
  'Não envio do Vídeo de Apresentação dentro do prazo limite',
  'Reprovado na Triagem Curricular por requisitos técnicos',
  'Falta de disponibilidade de horário para a escala exigida',
  'Desistência voluntária pelo candidato durante o processo',
  'Outros motivos técnicos / comportamentais avaliados pelo Gestor',
];

export const CARGOS_PRESET = [
  'Professor',
  'Closer',
  'SDR',
  'Gerente de Unidade',
  'Analista de CS',
  'Assistente de DP',
  'Auxiliar de Serviços Gerais',
  'Estágio',
  'Consultor Comercial',
  'Coordenador Pedagógico',
  'Recepcionista',
];

export const CANAIS_DIVULGACAO = [
  'Sólides (Oficial)',
  'InfoJobs',
  'LinkedIn',
  'Instagram Ads',
  'Catho',
  'Indicação Interna',
  'Gupy',
  'Trabalhe Conosco Vox',
  'Outros',
];

export const PERMISSOES_PADRAO_POR_NIVEL: Record<NivelAcesso, PermissoesConta> = {
  Admin: {
    criarVagas: true,
    moverEtapas: true,
    bancoTalentos: true,
    gerenciarConfiguracoes: true,
    exportarRelatorios: true,
    dispararWhatsApp: true,
    agendarEntrevistas: true,
  },
  Recrutador: {
    criarVagas: true,
    moverEtapas: true,
    bancoTalentos: true,
    gerenciarConfiguracoes: false,
    exportarRelatorios: true,
    dispararWhatsApp: true,
    agendarEntrevistas: true,
  },
  Gestor: {
    criarVagas: false,
    moverEtapas: true,
    bancoTalentos: true,
    gerenciarConfiguracoes: false,
    exportarRelatorios: false,
    dispararWhatsApp: true,
    agendarEntrevistas: true,
  },
  Visualizador: {
    criarVagas: false,
    moverEtapas: false,
    bancoTalentos: false,
    gerenciarConfiguracoes: false,
    exportarRelatorios: false,
    dispararWhatsApp: false,
    agendarEntrevistas: false,
  },
};

export const INITIAL_CONTAS_USUARIOS: ContaUsuario[] = [
  {
    id: 'user-1',
    nome: 'Luana Paula de Oliveira',
    email: 'luana.oliveira@grupomaester.com.br',
    cargo: 'Gestora Geral de Pessoas & DHO',
    unidade: 'Todas as Unidades',
    nivelAcesso: 'Admin',
    status: 'Ativo',
    criadoEm: '2025-01-10T08:00:00Z',
    ultimoAcesso: 'Hoje às 10:45',
    permissoes: { ...PERMISSOES_PADRAO_POR_NIVEL.Admin },
  },
  {
    id: 'user-2',
    nome: 'Ícaro Ruan Valentim Pinheiro',
    email: 'icaro.pinheiro@grupomaester.com.br',
    cargo: 'Especialista em R&S e Atração de Talentos',
    unidade: 'Todas as Unidades',
    nivelAcesso: 'Recrutador',
    status: 'Ativo',
    criadoEm: '2025-02-01T09:00:00Z',
    ultimoAcesso: 'Hoje às 11:20',
    permissoes: { ...PERMISSOES_PADRAO_POR_NIVEL.Recrutador },
  },
  {
    id: 'user-3',
    nome: 'Vitória Medino',
    email: 'vitoria.medino@grupomaester.com.br',
    cargo: 'Analista de R&S e Parcerias Vox',
    unidade: 'Todas as Unidades',
    nivelAcesso: 'Recrutador',
    status: 'Ativo',
    criadoEm: '2025-03-15T08:30:00Z',
    ultimoAcesso: 'Hoje às 11:14',
    permissoes: { ...PERMISSOES_PADRAO_POR_NIVEL.Recrutador },
  },
  {
    id: 'user-4',
    nome: 'Rodrigo Medeiros',
    email: 'gerencia.tirol@vox2you.com.br',
    cargo: 'Gerente Geral da Unidade',
    unidade: 'Vox Tirol',
    nivelAcesso: 'Gestor',
    status: 'Ativo',
    criadoEm: '2025-04-10T10:00:00Z',
    ultimoAcesso: 'Ontem às 16:30',
    permissoes: { ...PERMISSOES_PADRAO_POR_NIVEL.Gestor },
  },
  {
    id: 'user-5',
    nome: 'Camila Mendonça',
    email: 'gerencia.cidadeverde@vox2you.com.br',
    cargo: 'Gerente Comercial & Pedagógica',
    unidade: 'Vox Cidade Verde',
    nivelAcesso: 'Gestor',
    status: 'Ativo',
    criadoEm: '2025-05-02T14:20:00Z',
    ultimoAcesso: 'Há 2 dias',
    permissoes: { ...PERMISSOES_PADRAO_POR_NIVEL.Gestor },
  },
  {
    id: 'user-6',
    nome: 'Auditoria & Franquias Vox',
    email: 'auditoria.franquias@vox2you.com.br',
    cargo: 'Auditor de Governança e Processos',
    unidade: 'Todas as Unidades',
    nivelAcesso: 'Visualizador',
    status: 'Ativo',
    criadoEm: '2025-06-18T11:00:00Z',
    ultimoAcesso: 'Há 5 dias',
    permissoes: { ...PERMISSOES_PADRAO_POR_NIVEL.Visualizador },
  },
];

export const DEFAULT_CONFIG: ProcessoConfig = {
  min_coletiva: 5,
  fluxo_simplificado_cargo: 'Professor',
  sla_padrao: {
    Professor: 30,
    Closer: 40,
    Estágio: 21,
    'Analista de CS': 21,
    SDR: 25,
    'Gerente de Unidade': 45,
    'Assistente de DP': 25,
    'Auxiliar de Serviços Gerais': 15,
    Geral: 30,
  },
  sla_etapas_dias: {
    Triagem: 2,
    '1º Contato': 2,
    'Vídeo de Apresentação': 3,
    'Entrevista Coletiva/Online': 4,
    'Etapa Prática': 3,
    Gestor: 3,
    Diretoria: 3,
    'Banco de Talentos': 30,
  },
  exigir_video_obrigatorio: false,
  notificar_ausentes_whatsapp: true,
  link_solides_padrao: 'https://vox2you.vagas.solides.com.br/vaga/826365',
  link_meet_padrao: 'https://meet.google.com/hxr-ywxs-dcf',
  recrutador_padrao: 'Ícaro (R&S Vox2you)',
  // Google Calendar & Meet API defaults
  google_calendar_id: 'primary',
  google_calendar_default_duration: 60,
  google_calendar_auto_meet: true,
  google_calendar_timezone: 'America/Sao_Paulo',
  google_calendar_notifications: true,
  google_calendar_event_prefix: 'Entrevista R&S Vox2you',
  google_meet_access_type: 'OPEN',
  google_meet_fallback_link: 'https://meet.google.com/vox-rse-meet',
  google_api_config: {
    calendarId: 'primary',
    defaultDurationMinutes: 60,
    autoGenerateMeetLink: true,
    timezone: 'America/Sao_Paulo',
    notifyAttendeesByEmail: true,
    eventTitlePrefix: 'Entrevista R&S Vox2you',
    meetSpaceAccessType: 'OPEN',
    meetFallbackUri: 'https://meet.google.com/vox-rse-meet',
    isCalendarApiEnabled: true,
    isMeetApiEnabled: true,
    lastSyncAt: new Date().toISOString(),
  },
};

/**
 * GUIA DE COMUNICAÇÃO: PROCESSO DE R&S (16 Templates Oficiais)
 */
export const DEFAULT_TEMPLATES: MensagemTemplate[] = [
  {
    id: 'tmpl-1',
    numero: 1,
    titulo: '1. Recebimento de Currículo Externo | Direcionamento para Sólides',
    etapa: 'Triagem',
    tipo: 'whatsapp',
    confidencial: false,
    quemEnvia: 'RH',
    canal: 'WhatsApp ou E-mail',
    objetivo: 'Confirmar o recebimento do contato, agradecer o interesse e converter esse candidato para a plataforma oficial, garantindo que ele passe pelos filtros de triagem e teste de perfil.',
    descricao: 'Redirecionamento para o link oficial da vaga na Sólides.',
    texto: `Olá, [Nome do Candidato]! Tudo bem? ☀️
Aqui é o Ícaro, da Vox2you.

Recebemos seu currículo! Ficamos muito feliz com seu interesse e energia em fazer parte do nosso time na vaga de *[Nome da Vaga]*.

Para que sua análise seja mais rápida e assertiva, peço apenas que complete seu cadastro no nosso link oficial:

🔗 https://vox2you.vagas.solides.com.br/vaga/826365

Ao se cadastrar lá, você garante que seu perfil passe por todos os nossos critérios de triagem.

Ficamos no aguardo do seu cadastro para darmos sequência na análise. Um abraço e sucesso!`,
  },
  {
    id: 'tmpl-2',
    numero: 2,
    titulo: '2. Apresentação do Banco de Vagas (Portal Sólides)',
    etapa: 'Triagem',
    tipo: 'whatsapp',
    confidencial: false,
    quemEnvia: 'Recrutador / RH',
    canal: 'WhatsApp',
    objetivo: 'Direcionar o candidato para a vitrine completa de oportunidades da Vox2you, permitindo que ele visualize todas as vagas abertas e unidades disponíveis.',
    descricao: 'Vitrine geral com filtros por cidade e cargo.',
    texto: `Olá! Tudo bem?
Aqui é o Ícaro, faço parte do RH da Vox2you. Ficamos muito felizes com o seu interesse em construir carreira conosco!
Para que você possa conferir todas as nossas oportunidades em aberto e escolher a *unidade e a vaga* que melhor se adequam ao seu perfil, acesse o nosso *Portal de Vagas oficial:*
🔗 https://vox2you.vagas.solides.com.br/
Ao acessar o link, você poderá filtrar as vagas por cidade e cargo. Certifique-se de preencher todos os dados e testes, pois isso garante que seu perfil entre diretamente no nosso radar de triagem.
Ficamos no aguardo da sua inscrição!`,
  },
  {
    id: 'tmpl-3',
    numero: 3,
    titulo: '3. Resposta à Candidatura Espontânea | Sem Vaga Aberta',
    etapa: 'Banco de Talentos',
    tipo: 'whatsapp',
    confidencial: false,
    quemEnvia: 'Recrutador / RH',
    canal: 'WhatsApp',
    objetivo: 'Acolher o candidato interessado, informar a indisponibilidade da vaga com transparência e direcioná-lo para o Banco de Talentos na Sólides.',
    descricao: 'Acolhimento empático com cadastro no Banco de Talentos oficial.',
    texto: `Olá, [Nome do Candidato]! Bom dia, tudo bem? ☀️
Me chamo Ícaro, faço parte do RH da Vox2you.

Recebi seu currículo e fico muito feliz com seu interesse e energia em fazer parte do nosso time na posição de *[Nome da Vaga]*!
Neste exato momento, nosso quadro para esta função está completo e não temos a vaga aberta. Porém, aqui na Vox as coisas acontecem muito rápido e eu não quero perder seu contato.

🚀 *Como ficar no nosso Radar:*
Para que você seja um dos primeiros a ser lembrado quando a oportunidade surgir, te convido a entrar no nosso *Banco de Talentos Oficial.*

É só clicar no link abaixo e preencher seu perfil:

🔗 https://vox2you.vagas.solides.com.br/

Fazendo isso, seu perfil já fica "pronto" para futuras oportunidades.

Um abraço e espero te chamar em breve! ✨`,
  },
  {
    id: 'tmpl-4',
    numero: 4,
    titulo: '4. Coleta de Perfil & Mapeamento Comportamental',
    etapa: 'Triagem',
    tipo: 'whatsapp',
    confidencial: false,
    quemEnvia: 'Recrutador / RH',
    canal: 'WhatsApp',
    objetivo: 'Coletar dados essenciais para a análise técnica e comportamental de candidatos que avançaram por indicação ou entrevista antecipada.',
    descricao: 'Envio do link Profiler da Sólides e formulário de candidatura.',
    texto: `Olá, [Nome do Candidato]! Tudo bem?
Aqui é o Ícaro, faço parte do RH da Vox2you.
Passando para informar que *você avançou para a próxima etapa do nosso processo seletivo para a vaga de [Nome da Vaga]. Parabéns!*
Para que possamos consolidar a análise do seu perfil e validar as próximas etapas, precisamos que você realize o envio de dois materiais fundamentais:
1️⃣ *Mapeamento de Perfil (Sólides):* Este teste é essencial para compreendermos suas tendências comportamentais e aderência à função. 👉 https://vox2you.vagas.solides.com.br/
2️⃣ *Formulário de Candidatura:* Peço que preencha o documento em anexo e me encaminhe por aqui.
⏳*PRAZO:* Por favor, nos envie esses materiais *até amanhã, dia [Data], às [Horário].*
Essas informações são o que nos permitem dar profundidade à sua candidatura. Qualquer dúvida, estou à disposição!`,
  },
  {
    id: 'tmpl-5',
    numero: 5,
    titulo: '5. Confirmação de Recebimento de Materiais',
    etapa: 'Triagem',
    tipo: 'whatsapp',
    confidencial: false,
    quemEnvia: 'Recrutador / RH',
    canal: 'WhatsApp',
    objetivo: 'Confirmar a entrega dos documentos/testes e alinhar a expectativa de retorno.',
    descricao: 'Confirmação ágil e alinhamento de prazos.',
    texto: `Olá, [Nome do Candidato]! Tudo bem?
Materiais recebidos ✅, muito obrigado pelo envio.
Agora, nosso time seguirá com a análise das informações. Em breve entraremos em contato para informar os próximos passos ou quaisquer atualizações sobre o processo.
Qualquer dúvida, sigo à disposição.`,
  },
  {
    id: 'tmpl-6',
    numero: 6,
    titulo: '6. Convite para Perguntas Customizadas (Chatbot Sólides)',
    etapa: 'Triagem',
    tipo: 'whatsapp',
    confidencial: false,
    quemEnvia: 'Recrutador / RH',
    canal: 'WhatsApp',
    objetivo: 'Agilizar a coleta de respostas técnicas e situacionais através do chatbot da Sólides.',
    descricao: 'Link direto para perguntas situacionais com prazo estipulado.',
    texto: `Olá, [Nome do Candidato]!
Me chamo Ícaro, faço parte do RH da Vox2you. Tudo bem com você?
Passando para informar que você avançou para a próxima etapa do nosso processo seletivo para a posição de *[Nome da Vaga]*
Nesta fase, gostaríamos de conhecer um pouco mais sobre você e suas experiências.
Por favor, clique no link abaixo para responder algumas perguntas que irão nos ajudar a avaliar o seu perfil.
🔗 https://vox2you.vagas.solides.com.br/
⏳ PRAZO: Para que possamos manter a agilidade do processo, pedimos que conclua esta etapa até *[Dia da Semana] ([Data]) às [Horário].*
As suas respostas são fundamentais para o seguimento do processo. Qualquer dúvida, estou à disposição!`,
  },
  {
    id: 'tmpl-7',
    numero: 7,
    titulo: '7. Agendamento de Entrevista com o RH (Alinhamento & Condições)',
    etapa: '1º Contato',
    tipo: 'whatsapp',
    confidencial: true,
    quemEnvia: 'Recrutador / RH',
    canal: 'WhatsApp',
    objetivo: 'Apresentar os pré-requisitos essenciais para filtrar candidatos desalinhados e agendar a entrevista de cultura.',
    descricao: 'Apresentação detalhada da posição e link do Google Meet.',
    texto: `Olá, [Nome do Candidato], tudo bem?
Aqui é o Ícaro, da Vox2you, recebi seu currículo para a vaga de *[Nome da Vaga]* para a unidade de *[unidade]* e gostaria de marcar uma *entrevista online no dia [Data] às [Horário]*.

Para respeitar seu tempo e garantirmos que a vaga encaixa no que você busca, segue abaixo alguns detalhes sobre a posição:

*REQUISITOS:* Comunicação assertiva, dinamismo e foco em resultados
*PRINCIPAIS ATIVIDADES:* Atuação direta com alunos e metas da unidade
*REMUNERAÇÃO E BENEFÍCIOS:* Salário compatível + Premiações por desempenho + VT
*HORÁRIO DE TRABALHO:* Segunda a Sábado (Escala comercial)
*LOCAL DE TRABALHO:* Unidade [unidade]

Essas condições e atividades fazem sentido para o seu momento profissional?
Se a resposta for *SIM* posso contar com a sua presença?

Link da videochamada: https://meet.google.com/hxr-ywxs-dcf

Fico no aguardo da sua confirmação!`,
    texto_confidencial: `Olá, [Nome do Candidato], tudo bem?
Aqui é o Ícaro, da Vox2you, recebi seu currículo para a vaga de *[Nome da Vaga]* para a unidade de *[unidade]* e gostaria de marcar uma *entrevista online no dia [Data] às [Horário]*.

Para respeitar seu tempo e garantirmos que a vaga encaixa no que você busca, segue abaixo alguns detalhes sobre a posição:

*REQUISITOS:* Comunicação assertiva, dinamismo e foco em excelência
*PRINCIPAIS ATIVIDADES:* Atuação estratégica alinhada à metodologia Vox2you
*REMUNERAÇÃO E BENEFÍCIOS:* Pacote de remuneração atrativo + Benefícios
*HORÁRIO DE TRABALHO:* Horário comercial flexível
*LOCAL DE TRABALHO:* Unidade [unidade]

Essas condições e atividades fazem sentido para o seu momento profissional?
Se a resposta for *SIM* posso contar com a sua presença?

Link da videochamada: https://meet.google.com/hxr-ywxs-dcf

Fico no aguardo da sua confirmação!`,
  },
  {
    id: 'tmpl-8',
    numero: 8,
    titulo: '8. Lembrete e Confirmação de Entrevista (Poucas Horas Antes)',
    etapa: 'Entrevista Coletiva/Online',
    tipo: 'whatsapp',
    confidencial: false,
    quemEnvia: 'Recrutador',
    canal: 'WhatsApp',
    objetivo: 'Validar a presença do candidato poucas horas antes da entrevista, reduzindo a taxa de absenteísmo.',
    descricao: 'Lembrete de presença com reenvio do link do Meet.',
    texto: `Oi, [Nome do Candidato]! Tudo bem?
Passando para confirmar nossa *entrevista agendada para hoje às [Horário]*.
Para facilitar seu acesso, segue novamente o link da nossa videochamada: https://meet.google.com/hxr-ywxs-dcf
Poderia me confirmar se está tudo certo para o nosso encontro?
Fico no aguardo!`,
  },
  {
    id: 'tmpl-9',
    numero: 9,
    titulo: '9. Mensagem de Alteração de Dia/Horário (Reagendamento)',
    etapa: 'Entrevista Coletiva/Online',
    tipo: 'whatsapp',
    confidencial: false,
    quemEnvia: 'Recrutador / RH',
    canal: 'WhatsApp',
    objetivo: 'Informar o candidato sobre a necessidade de reagendamento devido a imprevistos na agenda da unidade.',
    descricao: 'Reagendamento cortês e profissional.',
    texto: `Olá, [Nome do Candidato]! Tudo bem?
Aqui é o Ícaro, da Vox2you.
Devido a um imprevisto em nossa agenda, precisaremos ajustar o horário da nossa conversa para a vaga de *[Nome da Vaga]*. Pedimos desculpas pelo inconveniente.
Conseguimos reagendar para *[Novo Dia da Semana] ([Nova Data]) às [Novo Horário]?*
Fico no aguardo da sua confirmação sobre este novo horário.`,
  },
  {
    id: 'tmpl-10',
    numero: 10,
    titulo: '10. Abordagem Ativa de Perfil Indicado',
    etapa: '1º Contato',
    tipo: 'whatsapp',
    confidencial: false,
    quemEnvia: 'Recrutador / RH',
    canal: 'WhatsApp',
    objetivo: 'Realizar o primeiro contato com um perfil indicado, apresentando a oportunidade em aberto.',
    descricao: 'Abordagem personalizada valorizando a indicação.',
    texto: `Oi, [Nome do Candidato], boa tarde! ✨
Meu nome é Ícaro, faço parte do time de RH da Vox2you. Tudo bem com você?
Recebi seu currículo através de uma indicação. Analisamos sua trajetória e o seu perfil nos chamou bastante atenção, apresentando pontos que gostaríamos de explorar melhor em uma conversa.
Atualmente, estamos com uma oportunidade para a posição de *[Nome da Vaga]* na unidade de *[unidade]*. Acreditamos que seu histórico profissional possui uma aderência ao que buscamos para este desafio.
Gostaria de agendar uma *entrevista online com você para o dia [Data] às [Horário]*
Para respeitarmos seu tempo e garantirmos que a vaga se encaixa no que você busca hoje, seguem alguns detalhes sobre a posição:
*REQUISITOS:* Experiência com comunicação e perfil executor
*PRINCIPAIS ATIVIDADES:* Desenvolvimento de novos projetos e atendimento aos alunos
*REMUNERAÇÃO E BENEFÍCIOS:* Salário fixo + Comissões e bônus
Essas condições e atividades fazem sentido para o seu momento profissional? Se SIM, posso confirmar sua presença?
🔗 *Link da videochamada:* https://meet.google.com/hxr-ywxs-dcf
Fico no aguardo da sua confirmação!`,
  },
  {
    id: 'tmpl-11',
    numero: 11,
    titulo: '11. Solicitação de Vídeo de Apresentação (Pitch 2 a 3 min)',
    etapa: 'Vídeo de Apresentação',
    tipo: 'whatsapp',
    confidencial: false,
    quemEnvia: 'Recrutador / RH',
    canal: 'WhatsApp',
    objetivo: 'Testar a comunicação e desenvoltura como pré-requisito para avançar no processo.',
    descricao: 'Instruções para vídeo curto (2 a 3 min) com pitch e prazo.',
    texto: `Olá [Nome do Candidato], bom dia!
Me chamo Ícaro, faço parte do RH da Vox2You. Tudo bem com você?

Passando para te dar uma ótima notícia: *você avançou para a próxima etapa do nosso processo seletivo para a vaga de [Nome da Vaga]!* 🥳

A próxima etapa consiste no envio de um vídeo de apresentação, com as seguintes instruções:

- *Duração:* 2 a 3 minutos.
- *Conteúdo:* Apresente sua trajetória profissional e responda à pergunta: "Por que você acredita que seria um(a) excelente [Nome da Vaga] para a Vox2You?".
- *Prazo:* O vídeo deve ser enviado até hoje às 18:00h.

Estamos muito animados para te conhecer melhor e ouvir sua voz! Ficamos no aguardo do recebimento de seu material.`,
  },
  {
    id: 'tmpl-12',
    numero: 12,
    titulo: '12. Convite para Entrevista Técnica (com Gestor da Área)',
    etapa: 'Gestor',
    tipo: 'whatsapp',
    confidencial: false,
    quemEnvia: 'Recrutador / RH',
    canal: 'WhatsApp',
    objetivo: 'Convidar para a etapa intermediária com a liderança da área, alinhando desafios práticos.',
    descricao: 'Agendamento presencial com o gestor funcional.',
    texto: `Olá, [Nome do Candidato]! Tudo bem? ☀️
Aqui é o Ícaro, da Vox2you.
Tenho ótimas notícias: *você avançou para a próxima etapa do nosso processo seletivo!* 🚀

O próximo passo é uma conversa presencial com a liderança da unidade [unidade]. O objetivo é vocês se conhecerem melhor e alinhar as suas experiências com os desafios do dia a dia.

Segue o agendamento:
🗓 *Data:* [Dia da Semana] - [Data]
⏰ *Horário:* [Horário]
📍 *Local:* [unidade]

Por favor, confirme se podemos contar com sua presença.
Te aguardamos!`,
  },
  {
    id: 'tmpl-13',
    numero: 13,
    titulo: '13. Convite para Etapa Prática (Aula Teste Pedagógica)',
    etapa: 'Etapa Prática',
    tipo: 'whatsapp',
    confidencial: false,
    quemEnvia: 'RH ou Gerente de Unidade',
    canal: 'WhatsApp',
    objetivo: 'Formalizar o convite para a etapa prática do processo pedagógico com envio de PDF e Slide.',
    descricao: 'Agendamento de simulação didática de sala de aula.',
    texto: `Oi, [Nome do Candidato]! Tudo bem?
Ficamos muito felizes com a sua evolução em nosso processo seletivo! 🚀🦅 Chegou o momento de conhecermos sua dinâmica e didática dentro de sala de aula, e para isso, gostaríamos de agendar sua *Aula Teste.*

Seguem os detalhes do seu agendamento:
🗓️ *Data:* [Dia da Semana] - [Data]
🕑 *Horário:* [Horário]
📍 *Local:* [unidade]

Para que você possa se preparar com excelência, enviarei na sequência:
📄 *PDF de Orientações:* Com o passo a passo para a realização da aula;
📊 *Material de Apoio (Slide):* Para guiar sua apresentação.
Recomendamos a leitura atenta das orientações para que você possa viver a nossa metodologia na prática.

Por favor, me confirma se esse horário funciona para você.`,
  },
  {
    id: 'tmpl-14',
    numero: 14,
    titulo: '14. Convite para Entrevista Final (com a Diretoria)',
    etapa: 'Diretoria',
    tipo: 'whatsapp',
    confidencial: false,
    quemEnvia: 'Recrutador / RH',
    canal: 'WhatsApp',
    objetivo: 'Agendar a última etapa do processo com a alta gestão para validar a contratação.',
    descricao: 'Validação final de fit cultural com os diretores.',
    texto: `Olá, [Nome do Candidato]! Tudo bem?
Aqui é o Ícaro, da Vox2you.

Tenho excelentes notícias: Você chegou à *ETAPA FINAL* do nosso processo seletivo, parabéns! 👏🚀

Para fecharmos esse ciclo, gostaríamos de agendar uma conversa *Online* com a nossa Diretoria.

Segue o agendamento:
🗓 *Data:* [Dia da Semana] - [Data]
⏰ *Horário:* [Horário]
🔗 *Local / Link:* https://meet.google.com/hxr-ywxs-dcf

Por favor, confirme sua presença para que eu possa reservar a agenda da nossa direção.
Estamos muito animados com a possibilidade de ter você conosco!`,
  },
  {
    id: 'tmpl-15',
    numero: 15,
    titulo: '15. Feedback de Reprovação (Humanizado & Respeitoso)',
    etapa: 'Banco de Talentos',
    tipo: 'whatsapp',
    confidencial: false,
    quemEnvia: 'Recrutador / RH',
    canal: 'WhatsApp (ou e-mail Sólides)',
    objetivo: 'Informar o encerramento do processo com empatia e respeito, mantendo portas abertas.',
    descricao: 'Feedback humanizado e encerramento positivo.',
    texto: `Olá, [Nome do Candidato]! Tudo bem? ☀️
Aqui é o Ícaro, da Vox2you.

Estou passando para te agradecer pela disponibilidade e pelo interesse em fazer parte do nosso time. Foi muito importante conhecer sua trajetória e experiências profissionais.

Ficamos muito felizes em ver tantos talentos interessados em fazer parte da Vox, o que tornou nossa escolha ainda mais desafiadora. Após uma análise cuidadosa dos perfis, neste momento seguimos com candidatos que estão um pouco mais alinhados às demandas específicas desta vaga.

Agradecemos pela sua participação até aqui e continuamos na torcida pelo seu sucesso e esperamos que, em futuras oportunidades, possamos nos encontrar novamente.

Desejamos muita realização profissional e pessoal em sua jornada!

Um forte abraço. ✨`,
  },
  {
    id: 'tmpl-16',
    numero: 16,
    titulo: '16. Aprovação Inicial e Pausa Estratégica (Banco Prioritário)',
    etapa: 'Banco de Talentos',
    tipo: 'whatsapp',
    confidencial: false,
    quemEnvia: 'Recrutador / RH',
    canal: 'WhatsApp',
    objetivo: 'Reter o candidato de alta performance informando que pulou etapas para a próxima oportunidade.',
    descricao: 'Progresso salvo e prioridade absoluta em novas vagas.',
    texto: `Olá, [Nome do Candidato]! Tudo bem?
Aqui é o Ícaro, do RH da Vox2you.
Tenho novidades sobre o seu processo para a vaga de [Nome da Vaga].
Infelizmente, preenchemos a posição para início imediato. Mas trago uma excelente notícia: *sua participação no processo chamou bastante a nossa atenção e tivemos uma avaliação muito positiva do seu perfil.* 🎉
Sua trajetória profissional, suas competências e o alinhamento demonstrado com a cultura da Vox2you fizeram com que você se destacasse ao longo das etapas.
Como estamos em constante crescimento e frequentemente surgem novas oportunidades, gostaríamos de manter o seu perfil em nosso banco de talentos prioritário.
O que isso significa? Quando uma nova vaga compatível com o seu perfil for aberta, você poderá ser considerado para etapas mais avançadas do processo, sem a necessidade de reiniciar toda a jornada seletiva desde o início.
Gostaria de saber se faz sentido para você permanecermos em contato e mantermos o seu perfil em destaque para futuras oportunidades na Vox2you.
Fico no aguardo do seu retorno.`,
  },
];

/**
 * POP Nº 1 - Procedimento Operacional Padrão de R&S (Versão 1.1)
 */
export const POP_METADATA = {
  codigo: 'POP Nº 1',
  titulo: 'Procedimento Operacional Padrão: Fluxo de Recrutamento e Seleção',
  setor: 'Recursos Humanos',
  empresa: 'Vox2you - Escola de Oratória',
  gestao: 'Gestão de Pessoas',
  versao: '1.1',
  dataElaboracao: '22/03/2025',
  dataUltimaRevisao: '19/06/2025',
  elaboradoPor: 'Ícaro Ruan Valentim Pinheiro',
  gestor: 'Luana Paula de Oliveira',
  anexos: [
    { codigo: 'Anexo 1', titulo: 'Forms de Solicitação de vaga - Requisição de Vaga' },
    { codigo: 'Anexo 2', titulo: 'Perguntas Customizadas - FICHA DE PERFIL - 2026' },
    { codigo: 'Anexo 3', titulo: 'Mensagens de Envio aos candidatos - GUIA DE COMUNICAÇÃO (16 Templates)' },
    { codigo: 'Anexo 4', titulo: 'Materiais para Aula Teste (Pedagógico) - AULA TESTE (PEDAGÓGICO)' },
    { codigo: 'Anexo 5', titulo: 'Ficha de Avaliação de Teste Prático - FICHA DE PLANEJAMENTO E AVALIAÇÃO' },
  ],
  regrasEspeciais: [
    {
      titulo: 'Fluxo de Contingência (Alta Demanda)',
      descricao:
        'Em situações excepcionais de sobrecarga do setor de RH, o fluxo de entrevistas poderá ser invertido. Nesses casos, o RH realizará a triagem curricular e encaminhará os candidatos diretamente ao Gestor Solicitante para a primeira entrevista (Técnica). O RH realizará a entrevista comportamental (Fit Cultural) apenas com os finalistas aprovados pelo gestor, validando-os antes do envio à Diretoria.',
    },
    {
      titulo: 'Política de Indicações e Banco de Talentos',
      descricao:
        'Candidatos que chegarem por indicação (seja para vagas abertas ou para oportunidades futuras) não podem pular a etapa de cadastro. O solicitante deve requisitar ao RH o link da vaga específica na Sólides ou o link do "Banco de Talentos" para que o candidato preencha as informações e testes de perfil, garantindo o registro histórico e o mapeamento comportamental Profiler.',
    },
    {
      titulo: 'Cadastro de Professores',
      descricao:
        'Para a contratação de equipe pedagógica, o cadastro na Sólides é obrigatório para geração do relatório Profiler, fundamental para a análise de perfil comportamental e alinhamento metodológico.',
    },
    {
      titulo: 'Planejamento de Testes Práticos',
      descricao:
        'Caso a vaga exija uma etapa de Simulação ou Teste Técnico (Etapa 10), é obrigatório que o Gestor realize o alinhamento com o RH logo após a abertura da vaga, preenchendo a Parte 1 da Ficha de Planejamento e Avaliação (Anexo 5).',
    },
    {
      titulo: 'Ética e Compliance',
      descricao:
        'É fundamental manter a ética, a transparência e o respeito em todas as etapas do processo, garantindo um tratamento justo, humanizado e igualitário para todos os candidatos, independentemente da origem.',
    },
  ],
};

export const POP_ATIVIDADES: POPAtividade[] = [
  {
    numero: 1,
    descricao:
      'O Gestor preenche o formulário de Requisição de Vaga via Google Forms. Importante: Se precisar de vagas para unidades diferentes, o gestor deve abrir solicitações separadas.',
    responsavel: 'Solicitante da Vaga',
    prazo: 'Imediato',
    anexoRef: 'Anexo 1',
  },
  {
    numero: 2,
    descricao:
      'Realizar a abertura da vaga na Plataforma Sólides e realizar as configurações juntamente com a inclusão das Perguntas Customizadas. Realizar a abertura/divulgação em outros canais adequados ao perfil da vaga (LinkedIn, Grupos de WhatsApp, etc).',
    responsavel: 'RH',
    prazo: 'Após o recebimento do Formulário',
    anexoRef: 'Anexo 2',
  },
  {
    numero: 3,
    descricao:
      'Filtrar os candidatos que possuem alto percentual de Match com a vaga e avançar para a análise das respostas das Perguntas Customizadas. Reprovar os perfis desalinhados.',
    responsavel: 'RH',
    prazo: 'Conforme o volume de currículos recebidos',
    anexoRef: 'Anexo 3',
  },
  {
    numero: 4,
    descricao:
      'Solicitar via WhatsApp o envio de um vídeo de apresentação (2 a 3 min) para avaliar comunicação e desenvoltura (se aplicável à vaga).',
    responsavel: 'RH',
    prazo: 'Após a triagem inicial',
    anexoRef: 'Anexo 3 (Template 11)',
  },
  {
    numero: 5,
    descricao:
      'Realizar o agendamento da entrevista (Coletiva ou Individual Online) com os candidatos aprovados. O convite deve ser enviado via WhatsApp/Sólides contendo o link da agenda do Workspace, permitindo autoagendamento.',
    responsavel: 'RH',
    prazo: 'Conforme disponibilidade dos candidatos',
    anexoRef: 'Anexo 3 (Template 7)',
  },
  {
    numero: 6,
    descricao:
      'Enviar mensagem de feedback e agradecimento aos candidatos reprovados na etapa de entrevista com o RH.',
    responsavel: 'RH',
    prazo: 'No dia seguinte à entrevista',
    anexoRef: 'Anexo 3 (Template 15)',
  },
  {
    numero: 7,
    descricao:
      'Em caso de recebimento de vídeo via WhatsApp, salvar o arquivo na pasta do processo (Drive) e inserir o link no campo "Observações" da Sólides, ou anexar diretamente.',
    responsavel: 'RH',
    prazo: 'Após avaliação do Vídeo',
  },
  {
    numero: 8,
    descricao:
      'Encaminhar os candidatos que o RH julgar aptos para o solicitante da vaga (Recomendação: 2 ou 3 finalistas).',
    responsavel: 'RH',
    prazo: 'Após seleção dos finalistas e materiais',
  },
  {
    numero: 9,
    descricao:
      'O Gestor realiza a entrevista técnica/comportamental (presencial ou online), acessando previamente os materiais do candidato pela plataforma Sólides.',
    responsavel: 'Líder Funcional / Gestor',
    prazo: 'Agendar até 1 dia após o encaminhamento',
  },
  {
    numero: 10,
    descricao:
      'Aplicação de teste técnico ou aula teste (conforme a vaga). O Gestor deve preencher a "Ficha de Planejamento e Avaliação" e entregá-la ao RH logo em seguida da finalização do teste.',
    responsavel: 'Líder Funcional / Gestor',
    prazo: 'Agendar após a entrevista técnica',
    anexoRef: 'Anexo 4 e 5',
  },
  {
    numero: 11,
    descricao:
      'Realizar entrevista de "Fit Cultural" presencial na unidade com os candidatos aprovados na etapa técnica. O objetivo é conhecer o candidato pessoalmente e validar sua adequação ao time local.',
    responsavel: 'Gerente de Unidade',
    prazo: 'Após aprovação no teste técnico',
  },
  {
    numero: 12,
    descricao:
      'Informar à Diretoria o parecer final de ambos os líderes para que a última entrevista ou aprovação de contratação seja realizada.',
    responsavel: 'Solicitante da Vaga / RH',
    prazo: 'Após finalização do teste e fit cultural',
    anexoRef: 'Anexo 3 (Template 14)',
  },
  {
    numero: 13,
    descricao:
      'Comunicar a aprovação oficial e iniciar o processo de coleta de documentos (POP de Admissão).',
    responsavel: 'RH',
    prazo: 'Imediato',
  },
];

export const INITIAL_VAGAS: Vaga[] = [
  {
    id: 'vaga-1',
    titulo: 'Professor de Oratória & Comunicação',
    cargo: 'Professor',
    unidade: 'Vox Tirol',
    status: 'Em aberto',
    data_abertura: '2026-07-15',
    meta_sla_dias: 30,
    descricao: 'Ministrar aulas de oratória de alta performance e liderança comunicativa.',
    responsavel: 'Ícaro (R&S)',
    prioridade: 'Alta',
    regime: 'CLT',
    salario_range: 'R$ 3.500 - R$ 5.000',
    quantidade_vagas: 2,
  },
  {
    id: 'vaga-2',
    titulo: 'Closer Comercial (Vendas Consultivas)',
    cargo: 'Closer',
    unidade: 'Vox Cidade Verde',
    status: 'Em aberto',
    data_abertura: '2026-07-02',
    meta_sla_dias: 40,
    descricao: 'Fechamento de matrículas e apresentação do método Vox para executivos e profissionais.',
    responsavel: 'Ícaro (R&S)',
    prioridade: 'Urgente',
    regime: 'CLT',
    salario_range: 'R$ 2.800 + Comissões',
    quantidade_vagas: 1,
  },
  {
    id: 'vaga-3',
    titulo: 'SDR / Pré-Vendas Outbound',
    cargo: 'SDR',
    unidade: 'Vox Indaiatuba',
    status: 'Em aberto',
    data_abertura: '2026-08-01',
    meta_sla_dias: 25,
    descricao: 'Qualificação de leads e agendamento de sessões estratégicas.',
    responsavel: 'Ícaro (R&S)',
    prioridade: 'Média',
    regime: 'CLT',
    salario_range: 'R$ 2.000 + Bonificação',
    quantidade_vagas: 2,
  },
  {
    id: 'vaga-4',
    titulo: 'Estagiário de Atendimento e CS',
    cargo: 'Estágio',
    unidade: 'Vox João Pessoa',
    status: 'Em aberto',
    data_abertura: '2026-08-05',
    meta_sla_dias: 21,
    descricao: 'Apoio aos alunos, recepção e acompanhamento de jornada acadêmica.',
    responsavel: 'Ícaro (R&S)',
    prioridade: 'Média',
    regime: 'Estágio',
    salario_range: 'Bolsa R$ 1.100 + VT',
    quantidade_vagas: 1,
  },
  {
    id: 'vaga-5',
    titulo: 'Gerente Geral de Unidade',
    cargo: 'Gerente de Unidade',
    unidade: 'Vox Campina Grande',
    status: 'Em aberto',
    data_abertura: '2026-07-20',
    meta_sla_dias: 45,
    descricao: 'Gestão comercial, operacional e liderança da equipe da escola.',
    responsavel: 'Luana Paula de Oliveira',
    prioridade: 'Alta',
    regime: 'PJ',
    salario_range: 'R$ 6.000 - R$ 8.500',
    quantidade_vagas: 1,
  },
  {
    id: 'vaga-6',
    titulo: 'Professor Sênior de Oratória',
    cargo: 'Professor',
    unidade: 'Vox Mossoró',
    status: 'Fechada',
    data_abertura: '2026-06-10',
    meta_sla_dias: 30,
    descricao: 'Contratação finalizada com sucesso.',
    responsavel: 'Ícaro (R&S)',
    prioridade: 'Média',
    regime: 'CLT',
    salario_range: 'R$ 4.000',
    quantidade_vagas: 1,
  },
  {
    id: 'vaga-7',
    titulo: 'Assistente Administrativo / DP',
    cargo: 'Assistente de DP',
    unidade: 'Vox Itu',
    status: 'Cancelada',
    data_abertura: '2026-06-25',
    meta_sla_dias: 25,
    descricao: 'Vaga cancelada por reestruturação do quadro de apoio.',
    responsavel: 'Ícaro (R&S)',
    prioridade: 'Baixa',
    regime: 'CLT',
    salario_range: 'R$ 2.200',
    quantidade_vagas: 1,
  },
];

export const INITIAL_CANDIDATOS: Candidato[] = [
  {
    id: 'cand-1',
    nome: 'Mariana Duarte Souza',
    email: 'mariana.duarte@email.com',
    telefone: '(84) 99812-3344',
    vaga_id: 'vaga-1',
    vaga_titulo: 'Professor de Oratória & Comunicação',
    unidade: 'Vox Tirol',
    etapa_processo: 'Vídeo de Apresentação',
    status: 'Em andamento',
    fluxo_simplificado: true,
    curriculo_url: 'https://vox2you.com.br/cv/mariana_duarte.pdf',
    video_url: 'https://youtube.com/watch?v=pitch_mariana',
    solides_profile_url: 'https://vox2you.vagas.solides.com.br/candidato/99812',
    notas_entrevista: 'Boa dicção e postura profissional. Experiência prévia em teatro e docência.',
    avaliacao_geral: 4,
    origem_cv: 'Sólides (Oficial)',
    criado_em: '2026-08-02T10:00:00Z',
    atualizado_em: '2026-08-10T14:30:00Z',
    historico_etapas: [
      { etapa: 'Triagem', data: '2026-08-02', observacao: 'Currículo excelente, fit com metodologia Vox.' },
      { etapa: '1º Contato', data: '2026-08-04', observacao: 'Contato via WhatsApp realizado com sucesso.' },
      { etapa: 'Vídeo de Apresentação', data: '2026-08-08', observacao: 'Link do pitch enviado.' },
    ],
  },
  {
    id: 'cand-2',
    nome: 'Rodrigo Brandão Silva',
    email: 'rodrigo.brandao@email.com',
    telefone: '(84) 98721-5566',
    vaga_id: 'vaga-1',
    vaga_titulo: 'Professor de Oratória & Comunicação',
    unidade: 'Vox Tirol',
    etapa_processo: 'Vídeo de Apresentação',
    status: 'Em andamento',
    fluxo_simplificado: true,
    curriculo_url: 'https://vox2you.com.br/cv/rodrigo_brandao.pdf',
    origem_cv: 'Sólides (Oficial)',
    criado_em: '2026-08-03T11:00:00Z',
    atualizado_em: '2026-08-05T09:15:00Z',
    historico_etapas: [
      { etapa: 'Triagem', data: '2026-08-03' },
      { etapa: '1º Contato', data: '2026-08-05', observacao: 'Aguardando envio do vídeo de 2 a 3 min.' },
      { etapa: 'Vídeo de Apresentação', data: '2026-08-05' },
    ],
  },
  {
    id: 'cand-3',
    nome: 'Felipe Alencar Torres',
    email: 'felipe.alencar@email.com',
    telefone: '(84) 99144-8899',
    vaga_id: 'vaga-1',
    vaga_titulo: 'Professor de Oratória & Comunicação',
    unidade: 'Vox Tirol',
    etapa_processo: 'Vídeo de Apresentação',
    status: 'Em andamento',
    fluxo_simplificado: true,
    curriculo_url: 'https://vox2you.com.br/cv/felipe_alencar.pdf',
    origem_cv: 'Indicação Interna',
    criado_em: '2026-08-06T14:00:00Z',
    atualizado_em: '2026-08-07T10:00:00Z',
    historico_etapas: [
      { etapa: 'Triagem', data: '2026-08-06' },
      { etapa: 'Vídeo de Apresentação', data: '2026-08-07' },
    ],
  },
  {
    id: 'cand-4',
    nome: 'Carlos Eduardo Nogueira',
    email: 'carlos.nogueira@email.com',
    telefone: '(84) 99655-1212',
    vaga_id: 'vaga-2',
    vaga_titulo: 'Closer Comercial (Vendas Consultivas)',
    unidade: 'Vox Cidade Verde',
    etapa_processo: 'Entrevista Coletiva/Online',
    status: 'Em andamento',
    fluxo_simplificado: false,
    curriculo_url: 'https://vox2you.com.br/cv/carlos_nogueira.pdf',
    notas_entrevista: 'Forte background em vendas B2B e oratória comercial persuasiva.',
    avaliacao_geral: 5,
    origem_cv: 'Catho',
    criado_em: '2026-07-10T09:00:00Z',
    atualizado_em: '2026-07-28T16:00:00Z',
    historico_etapas: [
      { etapa: 'Triagem', data: '2026-07-10' },
      { etapa: '1º Contato', data: '2026-07-12' },
      { etapa: 'Entrevista Coletiva/Online', data: '2026-07-28' },
    ],
  },
  {
    id: 'cand-5',
    nome: 'Beatriz Vasconcelos',
    email: 'beatriz.v@email.com',
    telefone: '(84) 98877-4433',
    vaga_id: 'vaga-2',
    vaga_titulo: 'Closer Comercial (Vendas Consultivas)',
    unidade: 'Vox Cidade Verde',
    etapa_processo: 'Entrevista Coletiva/Online',
    status: 'Em andamento',
    fluxo_simplificado: false,
    curriculo_url: 'https://vox2you.com.br/cv/beatriz_v.pdf',
    origem_cv: 'Instagram Ads',
    criado_em: '2026-07-12T14:00:00Z',
    atualizado_em: '2026-07-28T16:00:00Z',
    historico_etapas: [
      { etapa: 'Triagem', data: '2026-07-12' },
      { etapa: 'Entrevista Coletiva/Online', data: '2026-07-28' },
    ],
  },
  {
    id: 'cand-6',
    nome: 'Lucas Gabriel Morais',
    email: 'lucas.morais@email.com',
    telefone: '(84) 99123-7788',
    vaga_id: 'vaga-2',
    vaga_titulo: 'Closer Comercial (Vendas Consultivas)',
    unidade: 'Vox Cidade Verde',
    etapa_processo: 'Entrevista Coletiva/Online',
    status: 'Em andamento',
    fluxo_simplificado: false,
    curriculo_url: 'https://vox2you.com.br/cv/lucas_morais.pdf',
    origem_cv: 'LinkedIn',
    criado_em: '2026-07-15T11:00:00Z',
    atualizado_em: '2026-07-29T10:00:00Z',
    historico_etapas: [{ etapa: 'Entrevista Coletiva/Online', data: '2026-07-29' }],
  },
  {
    id: 'cand-7',
    nome: 'Camila Fernandes Lopes',
    email: 'camila.lopes@email.com',
    telefone: '(84) 99456-1122',
    vaga_id: 'vaga-2',
    vaga_titulo: 'Closer Comercial (Vendas Consultivas)',
    unidade: 'Vox Cidade Verde',
    etapa_processo: 'Entrevista Coletiva/Online',
    status: 'Em andamento',
    fluxo_simplificado: false,
    curriculo_url: 'https://vox2you.com.br/cv/camila_lopes.pdf',
    origem_cv: 'LinkedIn',
    criado_em: '2026-07-16T15:00:00Z',
    atualizado_em: '2026-07-30T11:00:00Z',
    historico_etapas: [{ etapa: 'Entrevista Coletiva/Online', data: '2026-07-30' }],
  },
  {
    id: 'cand-8',
    nome: 'Renato Pacheco Queiroz',
    email: 'renato.queiroz@email.com',
    telefone: '(84) 98765-4321',
    vaga_id: 'vaga-2',
    vaga_titulo: 'Closer Comercial (Vendas Consultivas)',
    unidade: 'Vox Cidade Verde',
    etapa_processo: 'Entrevista Coletiva/Online',
    status: 'Em andamento',
    fluxo_simplificado: false,
    curriculo_url: 'https://vox2you.com.br/cv/renato_pacheco.pdf',
    origem_cv: 'Catho',
    criado_em: '2026-07-18T10:00:00Z',
    atualizado_em: '2026-07-31T09:00:00Z',
    historico_etapas: [{ etapa: 'Entrevista Coletiva/Online', data: '2026-07-31' }],
  },
  {
    id: 'cand-9',
    nome: 'Juliana Meireles Castro',
    email: 'juliana.meireles@email.com',
    telefone: '(19) 99234-5678',
    vaga_id: 'vaga-3',
    vaga_titulo: 'SDR / Pré-Vendas Outbound',
    unidade: 'Vox Indaiatuba',
    etapa_processo: '1º Contato',
    status: 'Ausente',
    fluxo_simplificado: false,
    curriculo_url: 'https://vox2you.com.br/cv/juliana_castro.pdf',
    notas_entrevista: 'Não compareceu ao primeiro alinhamento agendado. Necessário reagendamento.',
    origem_cv: 'InfoJobs',
    criado_em: '2026-08-04T09:30:00Z',
    atualizado_em: '2026-08-08T15:00:00Z',
    historico_etapas: [
      { etapa: 'Triagem', data: '2026-08-04' },
      { etapa: '1º Contato', data: '2026-08-08', observacao: 'Ausente no horário marcado. Reagendar via WhatsApp.' },
    ],
  },
  {
    id: 'cand-10',
    nome: 'Gabriel Pimentel Rios',
    email: 'gabriel.rios@email.com',
    telefone: '(83) 98811-2233',
    vaga_id: 'vaga-4',
    vaga_titulo: 'Estagiário de Atendimento e CS',
    unidade: 'Vox João Pessoa',
    etapa_processo: 'Etapa Prática',
    status: 'Em andamento',
    fluxo_simplificado: false,
    curriculo_url: 'https://vox2you.com.br/cv/gabriel_rios.pdf',
    notas_entrevista: 'Excelente comunicabilidade, pontual e muito solícito.',
    avaliacao_geral: 4,
    origem_cv: 'Trabalhe Conosco Vox',
    criado_em: '2026-08-06T10:00:00Z',
    atualizado_em: '2026-08-11T16:00:00Z',
    historico_etapas: [
      { etapa: 'Triagem', data: '2026-08-06' },
      { etapa: '1º Contato', data: '2026-08-07' },
      { etapa: 'Entrevista Coletiva/Online', data: '2026-08-09' },
      { etapa: 'Etapa Prática', data: '2026-08-11' },
    ],
  },
  {
    id: 'cand-11',
    nome: 'Letícia Antunes Lima',
    email: 'leticia.antunes@email.com',
    telefone: '(83) 99344-9988',
    vaga_id: 'vaga-5',
    vaga_titulo: 'Gerente Geral de Unidade',
    unidade: 'Vox Campina Grande',
    etapa_processo: 'Diretoria',
    status: 'Aprovado',
    fluxo_simplificado: false,
    curriculo_url: 'https://vox2you.com.br/cv/leticia_antunes.pdf',
    notas_entrevista: 'Perfil sênior de gestão, histórico sólido de liderança de equipes e metas comerciais.',
    avaliacao_geral: 5,
    origem_cv: 'LinkedIn',
    criado_em: '2026-07-22T08:00:00Z',
    atualizado_em: '2026-08-12T17:00:00Z',
    historico_etapas: [
      { etapa: 'Triagem', data: '2026-07-22' },
      { etapa: '1º Contato', data: '2026-07-24' },
      { etapa: 'Gestor', data: '2026-07-29' },
      { etapa: 'Diretoria', data: '2026-08-12', observacao: 'Aprovada para envio de carta proposta!' },
    ],
  },
  {
    id: 'cand-12',
    nome: 'Daniel Barreto Siqueira',
    email: 'daniel.barreto@email.com',
    telefone: '(84) 99888-0011',
    vaga_id: 'vaga-1',
    vaga_titulo: 'Professor de Oratória & Comunicação',
    unidade: 'Vox Tirol',
    etapa_processo: 'Banco de Talentos',
    status: 'Em andamento',
    fluxo_simplificado: true,
    curriculo_url: 'https://vox2you.com.br/cv/daniel_barreto.pdf',
    notas_entrevista: 'Ótimo perfil para turmas de sábado ou horários futuros.',
    avaliacao_geral: 4,
    origem_cv: 'Indicação Interna',
    criado_em: '2026-07-18T10:00:00Z',
    atualizado_em: '2026-08-01T11:00:00Z',
    historico_etapas: [
      { etapa: 'Banco de Talentos', data: '2026-08-01', observacao: 'Guardado para novas turmas do 2º semestre.' },
    ],
  },
  {
    id: 'cand-13',
    nome: 'Marcelo Albuquerque Souza',
    email: 'marcelo.souza@email.com',
    telefone: '(84) 99654-3210',
    vaga_id: 'vaga-1',
    vaga_titulo: 'Professor de Oratória & Comunicação',
    unidade: 'Vox Tirol',
    etapa_processo: 'Etapa Prática',
    status: 'Reprovado',
    fluxo_simplificado: true,
    curriculo_url: 'https://vox2you.com.br/cv/marcelo_souza.pdf',
    video_url: 'https://youtube.com/watch?v=sample13',
    aula_teste_data: '2026-08-05',
    aula_teste_nota: 2.5,
    avaliacao_geral: 2,
    motivo_reprovacao: 'Reprovado na Aula Teste (Didática / Domínio do Conteúdo) - Apresentou insegurança na condução da dinâmica e dicção com vícios frequentes.',
    notas_entrevista: 'Demonstrou bom conhecimento teórico, porém teve baixa performance no teste prático de simulação em sala.',
    origem_cv: 'LinkedIn',
    criado_em: '2026-07-20T09:00:00Z',
    atualizado_em: '2026-08-06T14:30:00Z',
    historico_etapas: [
      { etapa: 'Triagem', data: '2026-07-20' },
      { etapa: 'Vídeo de Apresentação', data: '2026-07-24' },
      { etapa: 'Etapa Prática', data: '2026-08-05', observacao: 'Reprovado após avaliação da banca da Aula Teste.' },
    ],
  },
  {
    id: 'cand-14',
    nome: 'Priscila Rocha Nogueira',
    email: 'priscila.rocha@email.com',
    telefone: '(84) 98844-5566',
    vaga_id: 'vaga-2',
    vaga_titulo: 'Closer Comercial (Vendas Consultivas)',
    unidade: 'Vox Cidade Verde',
    etapa_processo: 'Vídeo de Apresentação',
    status: 'Reprovado',
    fluxo_simplificado: false,
    curriculo_url: 'https://vox2you.com.br/cv/priscila_rocha.pdf',
    motivo_reprovacao: 'Não envio do Vídeo de Apresentação dentro do prazo limite (48h expiradas sem retorno ao contato do RH).',
    notas_entrevista: 'Passou na triagem inicial, mas não respondeu às tentativas de envio de vídeo pitch.',
    origem_cv: 'Instagram Ads',
    criado_em: '2026-07-25T11:00:00Z',
    atualizado_em: '2026-07-29T18:00:00Z',
    historico_etapas: [
      { etapa: 'Triagem', data: '2026-07-25' },
      { etapa: 'Vídeo de Apresentação', data: '2026-07-27', observacao: 'Expirou o prazo de envio do pitch.' },
    ],
  },
  {
    id: 'cand-15',
    nome: 'Rodrigo Fontes Lima',
    email: 'rodrigo.fontes@email.com',
    telefone: '(19) 99765-8899',
    vaga_id: 'vaga-3',
    vaga_titulo: 'SDR / Pré-Vendas Outbound',
    unidade: 'Vox Indaiatuba',
    etapa_processo: 'Gestor',
    status: 'Reprovado',
    fluxo_simplificado: false,
    curriculo_url: 'https://vox2you.com.br/cv/rodrigo_fontes.pdf',
    avaliacao_geral: 3,
    motivo_reprovacao: 'Pretensão salarial incompatível com a política da unidade e indisponibilidade para regime presencial.',
    notas_entrevista: 'Perfil técnico bom, mas buscava remuneração 40% acima do teto estipulado para a vaga de SDR em Indaiatuba.',
    origem_cv: 'InfoJobs',
    criado_em: '2026-07-28T10:00:00Z',
    atualizado_em: '2026-08-04T16:00:00Z',
    historico_etapas: [
      { etapa: 'Triagem', data: '2026-07-28' },
      { etapa: '1º Contato', data: '2026-07-30' },
      { etapa: 'Entrevista Coletiva/Online', data: '2026-08-01' },
      { etapa: 'Gestor', data: '2026-08-04', observacao: 'Desalinhamento salarial e modelo de trabalho.' },
    ],
  },
];

export const INITIAL_CUSTOS: AcaoCusto[] = [
  {
    id: 'custo-1',
    vaga_id: 'vaga-1',
    vaga_titulo: 'Professor de Oratória & Comunicação',
    unidade: 'Vox Tirol',
    canal: 'LinkedIn',
    valor: 450.0,
    data: '2026-07-16',
    observacoes: 'Destaque de vaga no LinkedIn Jobs por 14 dias.',
  },
  {
    id: 'custo-2',
    vaga_id: 'vaga-2',
    vaga_titulo: 'Closer Comercial (Vendas Consultivas)',
    unidade: 'Vox Cidade Verde',
    canal: 'Instagram Ads',
    valor: 350.0,
    data: '2026-07-05',
    observacoes: 'Campanha de tráfego direto para WhatsApp de R&S na região metropolitana de Natal.',
  },
  {
    id: 'custo-3',
    vaga_id: 'vaga-3',
    vaga_titulo: 'SDR / Pré-Vendas Outbound',
    unidade: 'Vox Indaiatuba',
    canal: 'InfoJobs',
    valor: 280.0,
    data: '2026-08-02',
    observacoes: 'Pacote regional de triagem rápida InfoJobs.',
  },
  {
    id: 'custo-4',
    vaga_id: 'vaga-5',
    vaga_titulo: 'Gerente Geral de Unidade',
    unidade: 'Vox Campina Grande',
    canal: 'LinkedIn',
    valor: 600.0,
    data: '2026-07-21',
    observacoes: 'Slot premium de caça-talentos e busca ativa.',
  },
];

export const INITIAL_VOLUME_CVS: VolumeCV[] = [
  {
    id: 'vol-1',
    semana: '2026-W31 (27/Jul - 02/Ago)',
    vaga_id: 'vaga-1',
    vaga_titulo: 'Professor de Oratória & Comunicação',
    unidade: 'Vox Tirol',
    canal: 'LinkedIn',
    quantidade_cvs: 48,
    quantidade_triados: 16,
    quantidade_aprovados: 5,
  },
  {
    id: 'vol-2',
    semana: '2026-W31 (27/Jul - 02/Ago)',
    vaga_id: 'vaga-2',
    vaga_titulo: 'Closer Comercial (Vendas Consultivas)',
    unidade: 'Vox Cidade Verde',
    canal: 'Instagram Ads',
    quantidade_cvs: 62,
    quantidade_triados: 20,
    quantidade_aprovados: 7,
  },
  {
    id: 'vol-3',
    semana: '2026-W32 (03/Ago - 09/Ago)',
    vaga_id: 'vaga-1',
    vaga_titulo: 'Professor de Oratória & Comunicação',
    unidade: 'Vox Tirol',
    canal: 'InfoJobs',
    quantidade_cvs: 35,
    quantidade_triados: 12,
    quantidade_aprovados: 3,
  },
  {
    id: 'vol-4',
    semana: '2026-W32 (03/Ago - 09/Ago)',
    vaga_id: 'vaga-3',
    vaga_titulo: 'SDR / Pré-Vendas Outbound',
    unidade: 'Vox Indaiatuba',
    canal: 'InfoJobs',
    quantidade_cvs: 40,
    quantidade_triados: 14,
    quantidade_aprovados: 4,
  },
  {
    id: 'vol-5',
    semana: '2026-W32 (03/Ago - 09/Ago)',
    vaga_id: 'vaga-5',
    vaga_titulo: 'Gerente Geral de Unidade',
    unidade: 'Vox Campina Grande',
    canal: 'LinkedIn',
    quantidade_cvs: 22,
    quantidade_triados: 8,
    quantidade_aprovados: 2,
  },
];
