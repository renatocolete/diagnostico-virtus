// Perguntas das duas versões do diagnóstico.
// Versão geral:              link normal (ex.: .../diagnostico/)
// Versão oficial temporário: mesmo link com ?p=ot (ex.: .../diagnostico/?p=ot)
// Versão servidor público:   mesmo link com ?p=sp (ex.: .../diagnostico/?p=sp)

// Opções de uma pergunta: lista fixa ou montada a partir das respostas anteriores
window.opcoesDe = (p, r) => (typeof p.opcoes === 'function' ? p.opcoes(r || {}) : p.opcoes || []);

(function () {
  const anoAtual = new Date().getFullYear();

  // Os dados de contato ficam no fim: a pessoa já investiu tempo nas respostas e quer ver o resultado.
  const contato = {
    id: 'contato', tipo: 'contato',
    titulo: 'Último passo: para onde eu mando o seu diagnóstico?',
    ajuda: 'O PDF aparece na tela e também chega no seu e-mail.',
    consentimento: 'Autorizo a Virtus Wealth a usar estas informações para montar o meu diagnóstico e falar comigo pelo WhatsApp ou e-mail.',
  };

  const protecao = {
    id: 'protecao', tipo: 'single',
    titulo: 'Alguém depende da sua renda hoje?',
    ajuda: 'Cônjuge, filhos, pais. Isso entra na parte de proteção do diagnóstico.',
    opcoes: [
      { v: 'so_eu', t: 'Não, e estou sem seguro de vida' },
      { v: 'so_eu_seguro', t: 'Não, mas tenho seguro de vida' },
      { v: 'tem_seguro', t: 'Sim, e tenho seguro de vida' },
      { v: 'sem_seguro', t: 'Sim, e não tenho seguro de vida' },
      { v: 'nao_sei', t: 'Tenho seguro, mas não sei se cobre o suficiente' },
    ],
  };

  const conversa = {
    id: 'conversa', tipo: 'single',
    titulo: 'Quer que eu analise esse resultado com você?',
    ajuda: 'É uma conversa de 45 minutos, sem custo e sem compromisso.',
    opcoes: [
      { v: 'esta_semana', t: 'Sim, quero marcar essa semana' },
      { v: 'mais_pra_frente', t: 'Sim, mas mais para frente' },
      { v: 'so_pdf', t: 'Por enquanto, só quero o PDF' },
    ],
  };

  const horario = {
    id: 'horario', tipo: 'single',
    titulo: 'Qual o melhor horário para falar com você?',
    opcoes: [
      { v: 'manha', t: 'Dia de semana, de manhã' },
      { v: 'tarde', t: 'Dia de semana, à tarde' },
      { v: 'noite', t: 'Dia de semana, à noite' },
      { v: 'fds', t: 'Fim de semana' },
    ],
    mostrarSe: (r) => r.conversa && r.conversa !== 'so_pdf',
  };

  const finais = [protecao, conversa, horario, contato];

  const investe = {
    id: 'investe', tipo: 'single',
    titulo: 'Você já investe hoje?',
    opcoes: [
      { v: 'nao', t: 'Não, quero começar' },
      { v: 'conta_propria', t: 'Sim, por conta própria' },
      { v: 'assessoria', t: 'Sim, com assessoria ou consultoria' },
      { v: 'insatisfeito', t: 'Sim, mas não estou satisfeito com o resultado' },
    ],
  };

  // ---------- Versão geral (as perguntas do Linktree, com o furo das faixas de aporte corrigido) ----------
  const geral = {
    publico: 'geral',
    inicio: {
      eyebrow: 'DIAGNÓSTICO FINANCEIRO GRATUITO',
      titulo: 'Descubra onde você está e até onde pode chegar',
      texto: 'Responda em 3 minutos e receba na hora um PDF com o retrato da sua vida financeira, os seus pontos de atenção e uma projeção do seu patrimônio.',
    },
    perguntas: [
      {
        id: 'objetivo', tipo: 'single',
        titulo: 'Qual é o seu principal objetivo financeiro hoje?',
        opcoes: [
          { v: 'organizar', t: 'Organizar minhas finanças e sair do vermelho' },
          { v: 'comecar', t: 'Começar a investir do zero' },
          { v: 'render', t: 'Fazer meu patrimônio render mais' },
          { v: 'aposentadoria', t: 'Planejar minha aposentadoria' },
          { v: 'proteger', t: 'Proteger o que já construí' },
          { v: 'outro', t: 'Outro' },
        ],
      },
      {
        id: 'momento', tipo: 'single',
        titulo: 'Em que momento de vida você está?',
        opcoes: [
          { v: 'solteiro', t: 'Solteiro(a), construindo minha base' },
          { v: 'familia_jovem', t: 'Casado(a), com filhos pequenos ou a caminho' },
          { v: 'familia_estabelecida', t: 'Família estabelecida, pensando no longo prazo' },
          { v: 'pre_aposentadoria', t: 'Perto da aposentadoria' },
          { v: 'aposentado', t: 'Já aposentado(a)' },
        ],
      },
      {
        id: 'dores', tipo: 'multi', max: 5,
        titulo: 'O que mais te incomoda financeiramente hoje?',
        ajuda: 'Marque até 5 opções.',
        opcoes: [
          { v: 'cartao', t: 'Uso muito o cartão de crédito' },
          { v: 'sem_reserva', t: 'Não tenho reserva de emergência' },
          { v: 'nao_sei', t: 'Não sei para onde meu dinheiro está indo' },
          { v: 'nao_invisto', t: 'Não consigo investir ou não sei por onde começar' },
          { v: 'nao_cresce', t: 'Trabalho muito e não vejo meu patrimônio crescer' },
          { v: 'impulso', t: 'Tenho dificuldade com gastos por impulso' },
          { v: 'renda_instavel', t: 'Minha renda é instável' },
          { v: 'conflito', t: 'Tenho conflitos financeiros com cônjuge ou família' },
          { v: 'dividas', t: 'Tenho dívidas que me preocupam' },
        ],
      },
      investe,
      {
        id: 'renda', tipo: 'single',
        titulo: 'Qual é a sua renda mensal hoje?',
        opcoes: [
          { v: 2500, t: 'Até R$ 3.000' },
          { v: 4000, t: 'De R$ 3.001 a R$ 5.000' },
          { v: 6500, t: 'De R$ 5.001 a R$ 8.000' },
          { v: 10000, t: 'De R$ 8.001 a R$ 12.000' },
          { v: 16000, t: 'De R$ 12.001 a R$ 20.000' },
          { v: 25000, t: 'De R$ 20.001 a R$ 30.000' },
          { v: 35000, t: 'Acima de R$ 30.000' },
        ],
      },
      {
        id: 'aporte', tipo: 'single',
        titulo: 'Quanto você consegue investir por mês hoje?',
        opcoes: [
          { v: 0, t: 'Hoje não sobra nada' },
          { v: 300, t: 'Até R$ 500' },
          { v: 750, t: 'De R$ 501 a R$ 1.000' },
          { v: 1500, t: 'De R$ 1.001 a R$ 2.000' },
          { v: 3500, t: 'De R$ 2.001 a R$ 5.000' },
          { v: 7500, t: 'De R$ 5.001 a R$ 10.000' },
          { v: 12000, t: 'Acima de R$ 10.000' },
        ],
      },
      {
        id: 'patrimonio', tipo: 'single',
        titulo: 'Quanto você já tem guardado ou investido, somando tudo?',
        opcoes: [
          { v: 0, t: 'Ainda não tenho nada' },
          { v: 10000, t: 'Até R$ 20 mil' },
          { v: 35000, t: 'De R$ 20 mil a R$ 50 mil' },
          { v: 125000, t: 'De R$ 50 mil a R$ 200 mil' },
          { v: 350000, t: 'De R$ 200 mil a R$ 500 mil' },
          { v: 700000, t: 'Acima de R$ 500 mil' },
        ],
      },
      ...finais,
    ],
  };

  // ---------- Versão oficial temporário (campanha Seja Oficial) ----------
  // Turmas possíveis: quem se formou há até 8 anos, mais quem está se formando agora
  const turmas = [];
  for (let a = anoAtual - 8; a <= anoAtual; a++) turmas.push({ v: a, t: 'Turma ' + a });

  // Anos de baixa: de hoje até o fim dos 8 anos da turma (as opções dependem da resposta anterior)
  const anosBaixa = (r) => {
    const fim = Number(r.turma) + window.CONFIG.anosMaximoTemporario;
    const lista = [];
    for (let a = anoAtual; a <= fim; a++) {
      lista.push({ v: a, t: a === fim ? a + ' (fim dos 8 anos)' : String(a) });
    }
    return lista.reverse();
  };

  const temporario = {
    publico: 'ot',
    inicio: {
      eyebrow: 'DIAGNÓSTICO PARA OFICIAL TEMPORÁRIO',
      titulo: 'Com quanto você vai sair do Exército?',
      texto: 'Responda em 3 minutos e receba na hora um PDF com o retrato da sua vida financeira e uma projeção do patrimônio que você pode ter no dia do licenciamento.',
    },
    perguntas: [
      {
        id: 'posto', tipo: 'single',
        titulo: 'Qual é a sua situação hoje?',
        opcoes: [
          { v: 'aluno', t: 'Aluno do CPOR/NPOR, me formando agora' },
          { v: 'aspirante', t: 'Aspirante' },
          { v: '2ten', t: '2º Tenente' },
          { v: '1ten', t: '1º Tenente' },
          { v: 'sgt', t: 'Sargento temporário' },
          { v: 'saiu', t: 'Já saí da força' },
        ],
      },
      {
        id: 'turma', tipo: 'single', colunas: 3,
        titulo: 'Qual é a sua turma?',
        ajuda: 'O ano em que você se formou no CPOR/NPOR. Se está se formando agora, escolha ' + anoAtual + '.',
        opcoes: turmas,
        mostrarSe: (r) => r.posto !== 'saiu',
      },
      {
        id: 'ano_saida', tipo: 'single',
        titulo: 'Quando você pretende dar baixa?',
        ajuda: 'O temporário pode ficar até 8 anos. Escolha o ano em que pretende sair.',
        opcoes: anosBaixa,
        mostrarSe: (r) => r.posto !== 'saiu' && r.turma,
      },
      {
        id: 'objetivo', tipo: 'single',
        titulo: 'O que você mais quer resolver agora?',
        opcoes: [
          { v: 'sair_com_patrimonio', t: 'Sair do Exército com patrimônio montado' },
          { v: 'organizar', t: 'Parar de terminar o mês no zero' },
          { v: 'comecar', t: 'Começar a investir do jeito certo' },
          { v: 'bens', t: 'Comprar carro ou imóvel sem me enrolar' },
          { v: 'familia', t: 'Casar ou formar família com a vida organizada' },
          { v: 'transicao', t: 'Me preparar para concurso ou para a vida civil' },
        ],
      },
      {
        id: 'dores', tipo: 'multi', max: 5,
        titulo: 'O que mais te incomoda financeiramente hoje?',
        ajuda: 'Marque até 5 opções.',
        opcoes: [
          { v: 'cartao', t: 'A fatura do cartão come boa parte do salário' },
          { v: 'sem_reserva', t: 'Não tenho reserva de emergência' },
          { v: 'nao_sei', t: 'Não sei para onde meu dinheiro está indo' },
          { v: 'nao_invisto', t: 'Não consigo investir ou não sei por onde começar' },
          { v: 'nao_cresce', t: 'Ganho bem e não vejo meu patrimônio crescer' },
          { v: 'dividas', t: 'Consignado ou financiamento pesando no mês' },
          { v: 'espalhado', t: 'Tenho investimentos espalhados, sem estratégia' },
          { v: 'medo_sair', t: 'Medo de sair do Exército sem nada' },
          { v: 'impulso', t: 'Gasto por impulso' },
        ],
      },
      {
        id: 'renda', tipo: 'money',
        titulo: 'Quanto cai na sua conta por mês?',
        ajuda: 'Valor líquido, depois dos descontos. Pode ser aproximado.',
        placeholder: 'Ex.: 7.800',
      },
      {
        id: 'cartao', tipo: 'money',
        titulo: 'Quanto você paga de fatura do cartão, em média?',
        ajuda: 'Some todos os cartões. Se não usa cartão, coloque 0.',
        placeholder: 'Ex.: 2.500',
        aceitaZero: true,
      },
      {
        id: 'aporte', tipo: 'money',
        titulo: 'Quanto você consegue investir por mês hoje?',
        ajuda: 'Se hoje não sobra nada, coloque 0.',
        placeholder: 'Ex.: 2.000',
        aceitaZero: true,
      },
      {
        id: 'patrimonio', tipo: 'money',
        titulo: 'Quanto você já tem guardado ou investido, somando tudo?',
        ajuda: 'Conta corrente, poupança, investimentos. Pode ser aproximado.',
        placeholder: 'Ex.: 25.000',
        aceitaZero: true,
      },
      investe,
      ...finais,
    ],
  };

  // ---------- Versão servidor público (campanha de anúncios, ?p=sp) ----------
  const servidor = {
    publico: 'sp',
    inicio: {
      eyebrow: 'DIAGNÓSTICO PARA SERVIDOR PÚBLICO',
      titulo: 'Quanto falta para a sua aposentadoria manter o seu padrão?',
      texto: 'Responda em 4 minutos e receba na hora um PDF com o retrato do seu dinheiro, a conta da sua aposentadoria e quanto de imposto de renda você pode deixar de pagar.',
    },
    perguntas: [
      {
        id: 'esfera', tipo: 'single',
        titulo: 'Onde você trabalha?',
        opcoes: [
          { v: 'federal', t: 'Servidor federal (Executivo)' },
          { v: 'federal_outros', t: 'Servidor federal (Judiciário, MPU ou Legislativo)' },
          { v: 'estadual', t: 'Servidor estadual ou distrital' },
          { v: 'municipal', t: 'Servidor municipal' },
          { v: 'militar', t: 'Militar das Forças Armadas' },
        ],
      },
      {
        id: 'teto', tipo: 'single',
        titulo: 'A sua aposentadoria pelo regime próprio vai ser limitada ao teto do INSS?',
        ajuda: 'No serviço público federal, vale para quem entrou a partir de 2013. Nos estados e municípios, depende de quando foi criada a previdência complementar.',
        opcoes: [
          { v: 'sim', t: 'Sim, vou me aposentar pelo teto' },
          { v: 'nao', t: 'Não, entrei antes da regra do teto' },
          { v: 'nao_sei', t: 'Não sei' },
        ],
        mostrarSe: (r) => r.esfera !== 'militar',
      },
      {
        id: 'complementar', tipo: 'single',
        titulo: 'Você contribui para a previdência complementar do seu órgão?',
        ajuda: 'Funpresp, no caso federal, ou a fundação do seu estado ou município.',
        opcoes: [
          { v: 'sim', t: 'Sim' },
          { v: 'nao', t: 'Não' },
          { v: 'nao_sei', t: 'Não sei' },
        ],
        mostrarSe: (r) => r.teto === 'sim',
      },
      {
        id: 'anos_aposentar', tipo: 'single',
        titulo: 'Daqui a quantos anos você pretende se aposentar?',
        opcoes: [
          { v: 5, t: 'Uns 5 anos' },
          { v: 10, t: 'Uns 10 anos' },
          { v: 15, t: 'Uns 15 anos' },
          { v: 20, t: 'Uns 20 anos' },
          { v: 25, t: 'Uns 25 anos' },
          { v: 30, t: '30 anos ou mais' },
        ],
      },
      {
        id: 'dores', tipo: 'multi', max: 5,
        titulo: 'O que mais te incomoda no seu dinheiro hoje?',
        ajuda: 'Marque até 5 opções.',
        opcoes: [
          { v: 'espalhado', t: 'Tenho investimentos espalhados em vários bancos' },
          { v: 'gerente', t: 'Invisto no que o gerente do banco oferece' },
          { v: 'taxa', t: 'Não sei quanto pago de taxa nos meus investimentos' },
          { v: 'parado', t: 'Tenho dinheiro parado na poupança ou na conta' },
          { v: 'ir', t: 'Pago muito imposto de renda e não sei se dá para reduzir' },
          { v: 'aposentadoria', t: 'Medo de não manter o padrão quando me aposentar' },
          { v: 'dividas', t: 'Consignado ou financiamento pesando no mês' },
          { v: 'nao_sei', t: 'Não sei para onde meu dinheiro está indo' },
          { v: 'sem_tempo', t: 'Não tenho tempo para cuidar disso' },
        ],
      },
      investe,
      {
        id: 'renda', tipo: 'money',
        titulo: 'Quanto cai na sua conta por mês?',
        ajuda: 'Valor líquido, depois dos descontos. Pode ser aproximado.',
        placeholder: 'Ex.: 14.000',
      },
      {
        id: 'bruto', tipo: 'money',
        titulo: 'E qual é o seu salário bruto?',
        ajuda: 'O valor antes dos descontos, como aparece no contracheque. É ele que entra na conta da aposentadoria e do imposto de renda.',
        placeholder: 'Ex.: 19.500',
      },
      {
        id: 'aporte', tipo: 'money',
        titulo: 'Quanto você consegue investir por mês hoje?',
        ajuda: 'Se hoje não sobra nada, coloque 0.',
        placeholder: 'Ex.: 3.000',
        aceitaZero: true,
      },
      {
        id: 'patrimonio', tipo: 'money',
        titulo: 'Quanto você já tem guardado ou investido, somando tudo?',
        ajuda: 'Todos os bancos, poupança, previdência privada. Pode ser aproximado.',
        placeholder: 'Ex.: 250.000',
        aceitaZero: true,
      },
      {
        id: 'declaracao', tipo: 'single',
        titulo: 'Como você faz a declaração do imposto de renda?',
        opcoes: [
          { v: 'completa', t: 'Completa' },
          { v: 'simplificada', t: 'Simplificada' },
          { v: 'nao_sei', t: 'Não sei, quem faz é o contador ou o programa escolhe' },
        ],
      },
      {
        id: 'pgbl', tipo: 'single',
        titulo: 'Você tem PGBL?',
        ajuda: 'É a previdência privada em que o valor investido sai da base de cálculo do imposto de renda, até 12% da sua renda bruta do ano, na declaração completa.',
        opcoes: [
          { v: 'usa_12', t: 'Sim, e coloco perto de 12% da renda bruta por ano' },
          { v: 'parcial', t: 'Sim, mas não sei se uso o limite todo' },
          { v: 'nao', t: 'Não tenho' },
          { v: 'nao_sei', t: 'Não sei o que é' },
        ],
      },
      ...finais,
    ],
  };

  const p = new URLSearchParams(location.search).get('p');
  window.FORMULARIO = p === 'ot' ? temporario : p === 'sp' ? servidor : geral;
})();
