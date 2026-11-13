// Configurações que o Renato pode mudar sem mexer no resto do código.
window.CONFIG = {
  // URL do Google Apps Script publicado como "App da Web" (passo a passo no LEIA-ME.md).
  // Enquanto estiver vazio, o formulário funciona e gera o PDF, mas as respostas não são salvas.
  scriptUrl: 'https://script.google.com/macros/s/AKfycbzXTC6HG1U-9qkzu712iWOxXIM7jEbFtXaa_QdIxJWZwFMLEvDTwkRsBSbvCSm-sFoULA/exec',

  // WhatsApp do Renato, só números, com 55 e DDD. Ex.: '5567999998888'
  whatsapp: '5567992993734',

  // Rentabilidade usada na projeção (10% ao ano, a mesma que o Renato usa nas reuniões).
  taxaAnual: 0.10,

  // Metas usadas na pergunta "quanto precisa investir por mês para chegar lá".
  metaTemporario: 500000,
  metaGeral: 1000000,

  // Anos de projeção para o público geral.
  anosGeral: 10,
};
