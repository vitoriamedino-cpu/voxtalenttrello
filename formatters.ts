import { MensagemTemplate, Candidato, Vaga, EtapaProcesso, ProcessoConfig } from '../types';
import { DADOS_UNIDADES_VOX } from './rsConstants';

export const DEFAULT_STAGE_SLA_DAYS: Record<EtapaProcesso, number> = {
  Triagem: 2,
  '1º Contato': 2,
  'Vídeo de Apresentação': 3,
  'Entrevista Coletiva/Online': 4,
  'Etapa Prática': 3,
  Gestor: 3,
  Diretoria: 3,
  'Banco de Talentos': 30,
};

/**
 * Calcula o tempo de permanência do candidato na etapa atual vs o limite de SLA do setor/etapa
 */
export function calculateCandidateStageSLA(
  candidato: Candidato,
  config?: ProcessoConfig,
  vaga?: Vaga
) {
  const etapaAtual = candidato.etapa_processo;
  const stageThresholds = config?.sla_etapas_dias || DEFAULT_STAGE_SLA_DAYS;
  const limiteSlaEtapa = stageThresholds[etapaAtual] || DEFAULT_STAGE_SLA_DAYS[etapaAtual] || 3;

  // Determina a data de entrada na etapa atual
  let dataEntradaEtapa = candidato.atualizado_em || candidato.criado_em || new Date().toISOString();

  if (candidato.historico_etapas && candidato.historico_etapas.length > 0) {
    // Procura o registro mais recente correspondente à etapa atual
    const matchingHist = [...candidato.historico_etapas]
      .reverse()
      .find((h) => h.etapa === etapaAtual);

    if (matchingHist && matchingHist.data) {
      dataEntradaEtapa = matchingHist.data;
    } else {
      // Se não encontrou o nome exato, pega a última data do histórico
      const lastHist = candidato.historico_etapas[candidato.historico_etapas.length - 1];
      if (lastHist && lastHist.data) {
        dataEntradaEtapa = lastHist.data;
      }
    }
  }

  const agora = new Date().getTime();
  const entradaTime = new Date(dataEntradaEtapa).getTime();
  const diffTime = Math.max(0, agora - entradaTime);
  const diasNaEtapa = Math.max(0, Math.floor(diffTime / (1000 * 60 * 60 * 24)));

  const isEmAndamento = candidato.status === 'Em andamento';
  const isOverStageSla = isEmAndamento && diasNaEtapa > limiteSlaEtapa;
  const diasExcedidos = Math.max(0, diasNaEtapa - limiteSlaEtapa);

  return {
    diasNaEtapa,
    limiteSlaEtapa,
    isOverStageSla,
    diasExcedidos,
    dataEntradaEtapa,
  };
}

/**
 * Formata a mensagem com substituição inteligente de variáveis do Guia de Comunicação Oficial Vox2you
 */
export function formatMensagemText(
  template: MensagemTemplate,
  candidato: Partial<Candidato>,
  vaga?: Vaga,
  customParams?: Record<string, string>
): string {
  let rawText = template.confidencial && template.texto_confidencial
    ? template.texto_confidencial
    : template.texto;

  const nomeCandidato = candidato.nome || 'Candidato';
  const primeiroNome = nomeCandidato.split(' ')[0] || 'Candidato';
  const nomeVaga = vaga?.titulo || candidato.vaga_titulo || 'nossa oportunidade';
  const unidade = (vaga?.unidade || candidato.unidade || 'Vox Tirol') as keyof typeof DADOS_UNIDADES_VOX;
  const unidadeInfo = DADOS_UNIDADES_VOX[unidade];
  const enderecoUnidade = unidadeInfo ? `${unidadeInfo.apelido} (${unidadeInfo.endereco})` : unidade;

  let text = rawText
    .replace(/\[nome do candidato\]/gi, nomeCandidato)
    .replace(/\(nome do candidato\)/gi, nomeCandidato)
    .replace(/\[primeiro nome\]/gi, primeiroNome)
    .replace(/\[nome da vaga\]/gi, nomeVaga)
    .replace(/\(nome da vaga\)/gi, nomeVaga)
    .replace(/\*\(nome da vaga\*\./gi, `*${nomeVaga}*.`)
    .replace(/\*\(nome da vaga\*\)/gi, `*${nomeVaga}*`)
    .replace(/\(nome da vaga\*\./gi, `*${nomeVaga}*.`)
    .replace(/\bVAGA\b/g, nomeVaga)
    .replace(/\bCANDIDATO\b/g, nomeCandidato)
    .replace(/\[endereço da unidade\]/gi, enderecoUnidade)
    .replace(/\[unidade\]/gi, unidade)
    .replace(/\(unidade\)/gi, unidade)
    .replace(/\[Local de Trabalho\]/gi, enderecoUnidade)
    .replace(/\[Link da Sólides\]/gi, 'https://vox2you.vagas.solides.com.br/')
    .replace(/\[Link do Google Meet\]/gi, 'https://meet.google.com/hxr-ywxs-dcf')
    .replace(/\[Link do Meet\]/gi, 'https://meet.google.com/hxr-ywxs-dcf')
    .replace(/\[Link da videochamada\]/gi, 'https://meet.google.com/hxr-ywxs-dcf');

  if (customParams) {
    Object.entries(customParams).forEach(([key, val]) => {
      const reg = new RegExp(`\\[${key}\\]`, 'gi');
      text = text.replace(reg, val);
    });
  }

  return text;
}


/**
 * Gera URL do WhatsApp Web / App
 */
export function buildWhatsAppLink(telefone: string, texto: string): string {
  const cleanPhone = telefone.replace(/\D/g, '');
  const internationalPhone = cleanPhone.startsWith('55') ? cleanPhone : `55${cleanPhone}`;
  return `https://wa.me/${internationalPhone}?text=${encodeURIComponent(texto)}`;
}

/**
 * Calcula SLA da Vaga (Dias em aberto vs Meta SLA)
 */
export function calculateVagaSLA(dataAberturaStr: string, metaSlaDias: number) {
  if (!dataAberturaStr) {
    return { diasAbertos: 0, metaSla: metaSlaDias, isOverSla: false, percent: 0 };
  }

  const abertura = new Date(dataAberturaStr);
  const hoje = new Date();
  
  // Diferença em milissegundos
  const diffTime = Math.max(0, hoje.getTime() - abertura.getTime());
  const diasAbertos = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  
  const meta = metaSlaDias > 0 ? metaSlaDias : 30;
  const isOverSla = diasAbertos > meta;
  const percent = Math.min(100, Math.round((diasAbertos / meta) * 100));

  return {
    diasAbertos,
    metaSla: meta,
    isOverSla,
    percent,
    diasRestantes: Math.max(0, meta - diasAbertos),
  };
}

/**
 * Formata moeda BRL
 */
export function formatCurrency(val: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(val);
}

/**
 * Formata data no padrão brasileiro DD/MM/AAAA
 */
export function formatDateBR(dateStr?: string): string {
  if (!dateStr) return '-';
  try {
    const d = new Date(dateStr);
    return d.toLocaleDateString('pt-BR');
  } catch {
    return dateStr;
  }
}
