// Perguntas das duas versões do diagnóstico.
// Versão geral:              link normal (ex.: .../diagnostico/)
// Versão oficial temporário: mesmo link com ?p=ot (ex.: .../diagnostico/?p=ot)

(function () {
  const anoAtual = new Date().getFullYear();

  const contato = {
    id: 'contato', tipo: 'contato',
    titulo: 'Para onde eu mando o seu diagnóstico?',
    ajuda: 'O PDF aparece na tela e também chega no seu e-mail.',
  };

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

  const consentimento = {
    id: 'consentimento', tipo: 'consent',
    titulo: 'Última etapa',
    texto: 'Autorizo a Virtus Wealth a usar estas informações para montar o meu diagnóstico e entrar em contato comigo pelo WhatsApp ou e-mail.',
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
      contato,
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
      consentimento,
    ],
  };

  // ---------- Versão oficial temporário (campanha Seja Oficial) ----------
  const anos = [];
  for (let a = anoAtual; a <= anoAtual + 8; a++) anos.push({ v: a, t: String(a) });
  anos.push({ v: 'nao_sei', t: 'Ainda não sei' });

  const temporario = {
    publico: 'ot',
    inicio: {
      eyebrow: 'DIAGNÓSTICO PARA OFICIAL TEMPORÁRIO',
      titulo: 'Com quanto você vai sair do Exército?',
      texto: 'Responda em 3 minutos e receba na hora um PDF com o retrato da sua vida financeira e uma projeção do patrimônio que você pode ter no dia do licenciamento.',
    },
    perguntas: [
      contato,
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
        id: 'ano_saida', tipo: 'single', colunas: 3,
        titulo: 'Em que ano você deve sair do Exército?',
        ajuda: 'Se não sabe, conte 8 anos a partir da sua formatura.',
        opcoes: anos,
        mostrarSe: (r) => r.posto !== 'saiu',
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
      consentimento,
    ],
  };

  const p = new URLSearchParams(location.search).get('p');
  window.FORMULARIO = p === 'ot' ? temporario : geral;
})();
