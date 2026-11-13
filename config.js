// Configurações que o Renato pode mudar sem mexer no resto do código.
window.CONFIG = {
  // URL do Google Apps Script publicado como "App da Web" (passo a passo no LEIA-ME.md).
  // Enquanto estiver vazio, o formulário funciona e gera o PDF, mas as respostas não são salvas.
  scriptUrl: 'https://script.google.com/macros/s/AKfycbzXTC6HG1U-9qkzu712iWOxXIM7jEbFtXaa_QdIxJWZwFMLEvDTwkRsBSbvCSm-sFoULA/exec',

  // WhatsApp do Renato, só números, com 55 e DDD. Ex.: '5567999998888'
  whatsapp: '5567992993734',

  // Rentabilidade usada na projeção (12% ao ano).
  taxaAnual: 0.12,

  // Metas usadas na pergunta "quanto precisa investir por mês para chegar lá".
  metaTemporario: 500000,
  metaGeral: 1000000,

  // Anos de projeção para o público geral.
  anosGeral: 10,

  // Compensação pecuniária do oficial temporário (Lei 7.963/1989): uma remuneração por ano de serviço.
  // A estimativa usa o SOLDO de 2026 (Lei 15.167/2025, com o reajuste de 4,5% de jan/2026).
  // É conservadora: a lei usa a remuneração do posto, que inclui adicionais e costuma ser maior.
  // Atualize estes valores quando houver reajuste.
  soldos: { aspirante: 7988, '2ten': 8179, '1ten': 9004 },
  anoSoldos: 2026,
  anosMaximoTemporario: 8,
};
