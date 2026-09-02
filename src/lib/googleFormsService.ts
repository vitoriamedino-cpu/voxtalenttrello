import { getAccessToken } from './googleAuth';
import { Vaga, UnidadeVox } from '../types';
import { DADOS_UNIDADES_VOX } from './rsConstants';

export interface FormCreationResult {
  formId: string;
  responderUri: string;
  editUri?: string;
  title: string;
  description?: string;
}

export interface FormResponseItem {
  responseId: string;
  createTime: string;
  lastSubmittedTime: string;
  answers?: Record<
    string,
    {
      questionId: string;
      textAnswers?: {
        answers: { value: string }[];
      };
    }
  >;
}

export interface FormModel {
  formId: string;
  info: {
    title: string;
    description?: string;
    documentTitle?: string;
  };
  responderUri: string;
  items?: any[];
}

/**
 * Creates a blank Google Form
 */
export async function createGoogleForm(title: string, documentTitle?: string): Promise<FormCreationResult> {
  const token = await getAccessToken();
  if (!token) throw new Error('Usuário não autenticado no Google Workspace.');

  const res = await fetch('https://forms.googleapis.com/v1/forms', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      info: {
        title,
        documentTitle: documentTitle || title,
      },
    }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.error?.message || 'Erro ao criar formulário no Google Forms');
  }

  const data = await res.json();
  return {
    formId: data.formId,
    responderUri: data.responderUri,
    editUri: `https://docs.google.com/forms/d/${data.formId}/edit`,
    title: data.info?.title || title,
    description: data.info?.description,
  };
}

/**
 * Batch updates a Google Form with questions and items
 */
export async function batchUpdateForm(formId: string, requests: any[]): Promise<any> {
  const token = await getAccessToken();
  if (!token) throw new Error('Usuário não autenticado no Google Workspace.');

  const res = await fetch(`https://forms.googleapis.com/v1/forms/${formId}:batchUpdate`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      requests,
    }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.error?.message || 'Erro ao configurar itens no Google Forms');
  }

  return res.json();
}

/**
 * Fetches form details and schema
 */
export async function getFormDetails(formId: string): Promise<FormModel> {
  const token = await getAccessToken();
  if (!token) throw new Error('Usuário não autenticado no Google Workspace.');

  const res = await fetch(`https://forms.googleapis.com/v1/forms/${formId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.error?.message || 'Erro ao obter dados do formulário');
  }

  return res.json();
}

/**
 * Lists all responses submitted to a Google Form
 */
export async function listFormResponses(formId: string): Promise<FormResponseItem[]> {
  const token = await getAccessToken();
  if (!token) throw new Error('Usuário não autenticado no Google Workspace.');

  const res = await fetch(`https://forms.googleapis.com/v1/forms/${formId}/responses`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.error?.message || 'Erro ao carregar respostas do Google Forms');
  }

  const data = await res.json();
  return data.responses || [];
}

/**
 * Creates a ready-to-use Candidate Application Form (Trabalhe Conosco Vox2you)
 */
export async function createCandidateApplicationForm(
  vagasAbertas: Vaga[]
): Promise<FormCreationResult> {
  const title = 'Trabalhe Conosco - Vox2you (Grupo Maester)';
  const form = await createGoogleForm(title, 'Vox2you - Banco de Talentos & Vagas');

  const vagasOptions =
    vagasAbertas.length > 0
      ? vagasAbertas.map((v) => ({ value: `${v.titulo} (${v.unidade})` }))
      : [
          { value: 'Professor / Instrutor de Oratória' },
          { value: 'Consultor Comercial / Vendas' },
          { value: 'Coordenador Pedagógico' },
          { value: 'Gestor de Unidade' },
          { value: 'Estágio Comercial / Atendimento' },
          { value: 'Outros Cargos / Banco Geral' },
        ];

  const unidadesOptions = Object.keys(DADOS_UNIDADES_VOX).map((u) => ({ value: u }));

  const requests = [
    // Description Update
    {
      updateFormInfo: {
        info: {
          description:
            'Venha fazer parte da maior rede de escolas de oratória e comunicação da América Latina! Preencha suas informações abaixo para participar de nossos processos seletivos.',
        },
        updateMask: 'description',
      },
    },
    // Item 1: Nome Completo
    {
      createItem: {
        item: {
          title: 'Nome Completo',
          questionItem: {
            question: {
              required: true,
              textQuestion: { paragraph: false },
            },
          },
        },
        location: { index: 0 },
      },
    },
    // Item 2: E-mail
    {
      createItem: {
        item: {
          title: 'E-mail para Contato',
          questionItem: {
            question: {
              required: true,
              textQuestion: { paragraph: false },
            },
          },
        },
        location: { index: 1 },
      },
    },
    // Item 3: WhatsApp / Telefone
    {
      createItem: {
        item: {
          title: 'WhatsApp com DDD (ex: 84 99999-0000)',
          questionItem: {
            question: {
              required: true,
              textQuestion: { paragraph: false },
            },
          },
        },
        location: { index: 2 },
      },
    },
    // Item 4: Vaga de Interesse
    {
      createItem: {
        item: {
          title: 'Qual a vaga ou área de seu interesse?',
          questionItem: {
            question: {
              required: true,
              choiceQuestion: {
                type: 'RADIO',
                options: vagasOptions,
              },
            },
          },
        },
        location: { index: 3 },
      },
    },
    // Item 5: Unidade de Preferência
    {
      createItem: {
        item: {
          title: 'Qual a Unidade Vox de sua preferência para atuar?',
          questionItem: {
            question: {
              required: true,
              choiceQuestion: {
                type: 'DROP_DOWN',
                options: unidadesOptions,
              },
            },
          },
        },
        location: { index: 4 },
      },
    },
    // Item 6: Link do LinkedIn / Portfólio / Currículo
    {
      createItem: {
        item: {
          title: 'Link do seu Perfil no LinkedIn ou Portfólio',
          questionItem: {
            question: {
              required: false,
              textQuestion: { paragraph: false },
            },
          },
        },
        location: { index: 5 },
      },
    },
    // Item 7: Resumo de Experiência
    {
      createItem: {
        item: {
          title: 'Conte brevemente sobre sua trajetória profissional e por que você quer ser Vox',
          questionItem: {
            question: {
              required: true,
              textQuestion: { paragraph: true },
            },
          },
        },
        location: { index: 6 },
      },
    },
  ];

  await batchUpdateForm(form.formId, requests);
  return form;
}

/**
 * Creates an Interview & Test Class Evaluation Rubric Form
 */
export async function createEvaluationRubricForm(): Promise<FormCreationResult> {
  const title = 'Ficha de Avaliação de Entrevista & Aula Teste - Vox2you';
  const form = await createGoogleForm(title, 'Vox2you - Rubrica de Avaliação R&S');

  const requests = [
    {
      updateFormInfo: {
        info: {
          description:
            'Instrumento de avaliação para avaliadores, gestores e recrutadores durante entrevistas presenciais/online e aulas teste de novos instrutores e colaboradores.',
        },
        updateMask: 'description',
      },
    },
    {
      createItem: {
        item: {
          title: 'Nome do Candidato(a) Avaliado(a)',
          questionItem: {
            question: {
              required: true,
              textQuestion: { paragraph: false },
            },
          },
        },
        location: { index: 0 },
      },
    },
    {
      createItem: {
        item: {
          title: 'Nome do Recrutador / Avaliador',
          questionItem: {
            question: {
              required: true,
              textQuestion: { paragraph: false },
            },
          },
        },
        location: { index: 1 },
      },
    },
    {
      createItem: {
        item: {
          title: 'Domínio Técnico & Didática (1 a 5)',
          questionItem: {
            question: {
              required: true,
              scaleQuestion: {
                low: 1,
                high: 5,
                lowLabel: 'Insuficiente',
                highLabel: 'Excelente',
              },
            },
          },
        },
        location: { index: 2 },
      },
    },
    {
      createItem: {
        item: {
          title: 'Comunicação Verbal, Postura & Energia (1 a 5)',
          questionItem: {
            question: {
              required: true,
              scaleQuestion: {
                low: 1,
                high: 5,
                lowLabel: 'Baixa desenvoltura',
                highLabel: 'Oratória de Alto Impacto',
              },
            },
          },
        },
        location: { index: 3 },
      },
    },
    {
      createItem: {
        item: {
          title: 'Fit Cultural com o Jeito Vox de Ser (1 a 5)',
          questionItem: {
            question: {
              required: true,
              scaleQuestion: {
                low: 1,
                high: 5,
                lowLabel: 'Divergente',
                highLabel: 'Alinhamento Total',
              },
            },
          },
        },
        location: { index: 4 },
      },
    },
    {
      createItem: {
        item: {
          title: 'Decisão / Parecer do Avaliador',
          questionItem: {
            question: {
              required: true,
              choiceQuestion: {
                type: 'RADIO',
                options: [
                  { value: 'APROVADO para Contratação / Próxima Etapa' },
                  { value: 'BANCO DE TALENTOS (Potencial para futuras vagas)' },
                  { value: 'REPROVADO' },
                ],
              },
            },
          },
        },
        location: { index: 5 },
      },
    },
    {
      createItem: {
        item: {
          title: 'Pontos Fortes & Parecer Justificado',
          questionItem: {
            question: {
              required: false,
              textQuestion: { paragraph: true },
            },
          },
        },
        location: { index: 6 },
      },
    },
  ];

  await batchUpdateForm(form.formId, requests);
  return form;
}
