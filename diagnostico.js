// Transforma as respostas em diagnóstico: números, fase, pontos de atenção e projeção.

window.brl = function (v) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 })
    .format(Math.round(v || 0)).replace(/ /g, ' ');
};
window.pct = function (v) {
  return Math.round(v * 100) + '%';
};

window.gerarDiagnostico = function (r, publico) {
  const cfg = window.CONFIG;
  const anoAtual = new Date().getFullYear();
  const ot = publico === 'ot';
  const dores = r.dores || [];
  const tem = (d) => dores.includes(d);

  const renda = Number(r.renda) || 0;
  const aporte = Number(r.aporte) || 0;
  const patrimonio = Number(r.patrimonio) || 0;
  const cartao = ot ? Number(r.cartao) || 0 : null;

  const taxaPoupanca = renda > 0 ? aporte / renda : 0;
  const custoMensal = Math.max(renda - aporte, renda * 0.5);
  const reservaIdeal = custoMensal * 6;

  // Horizonte da projeção
  let anos = cfg.anosGeral;
  let anoFinal = anoAtual + anos;
  if (ot) {
    if (r.posto === 'saiu') { anos = 10; }
    else if (r.ano_saida === 'nao_sei' || !r.ano_saida) { anos = 6; }
    else { anos = Math.max(1, Number(r.ano_saida) - anoAtual); }
    anoFinal = anoAtual + anos;
  }

  const meta = ot ? cfg.metaTemporario : cfg.metaGeral;
  const proj = projetar(patrimonio, aporte, anos, cfg.taxaAnual);
  const aporteParaMeta = aporteNecessario(patrimonio, meta, anos, cfg.taxaAnual);

  // ---------- Pontos de atenção (em ordem de prioridade; o PDF usa os 4 primeiros) ----------
  const pontos = [];

  if (ot && renda > 0 && cartao / renda >= 0.3) {
    const dias = Math.round((cartao / renda) * 30);
    pontos.push({
      titulo: 'O cartão leva ' + pct(cartao / renda) + ' do seu salário',
      texto: 'Sua fatura média de ' + brl(cartao) + ' equivale a ' + dias + ' dias de trabalho por mês só para pagar o cartão. Antes de pensar em investimento, vale abrir a fatura e separar o que é conta fixa do que é compra pequena que se repete.',
    });
  } else if (tem('cartao')) {
    pontos.push({
      titulo: 'Cartão de crédito no centro do orçamento',
      texto: 'Quando a fatura decide quanto sobra no mês, o planejamento fica sempre para depois. O primeiro passo é saber quanto da sua renda vai para o cartão e em quais categorias.',
    });
  }

  if (tem('dividas')) {
    pontos.push({
      titulo: ot ? 'Consignado ou financiamento pesando no mês' : 'Dívidas comendo o seu aporte',
      texto: 'Liste as dívidas pela taxa de juros. A mais cara sai primeiro. Rotativo e cheque especial não podem esperar; um consignado com taxa baixa pode ser quitado com calma enquanto você monta a reserva.',
    });
  }

  if (r.protecao === 'sem_seguro' || r.protecao === 'nao_sei') {
    pontos.push({
      titulo: r.protecao === 'sem_seguro' ? 'Tem gente dependendo da sua renda sem proteção' : 'Seguro que talvez não cubra o necessário',
      texto: 'Se a sua renda parar, quem depende de você precisa de tempo e dinheiro para se reorganizar. Uma conta simples é cobrir de 5 a 10 anos do custo da casa. Antes de buscar mais rentabilidade, vale saber se essa parte está coberta.',
    });
  }

  if (tem('sem_reserva') || patrimonio < reservaIdeal) {
    const falta = Math.max(reservaIdeal - patrimonio, 0);
    pontos.push({
      titulo: 'Reserva de emergência abaixo do ideal',
      texto: 'Com um custo de vida perto de ' + brl(custoMensal) + ' por mês, a sua reserva deveria ficar em torno de ' + brl(reservaIdeal) + ' (seis meses).' +
        (falta > 0 ? ' Faltam cerca de ' + brl(falta) + '. Ela vem antes de qualquer investimento de risco.' : ' Ela vem antes de qualquer investimento de risco.'),
    });
  }

  if (renda > 0 && taxaPoupanca < 0.15) {
    const alvo = 0.2;
    const projAlvo = projetar(patrimonio, renda * alvo, anos, cfg.taxaAnual);
    pontos.push({
      titulo: 'Hoje você investe ' + pct(taxaPoupanca) + ' do que ganha',
      texto: 'Uma meta possível fica entre 20% e 30% da renda. Se você subir para 20% (' + brl(renda * alvo) + ' por mês), a projeção para ' + anoFinal + ' passa de ' + brl(proj.final) + ' para ' + brl(projAlvo.final) + '.',
    });
  } else if (taxaPoupanca >= 0.3) {
    pontos.push({
      titulo: 'Você já investe ' + pct(taxaPoupanca) + ' do que ganha',
      texto: 'Isso está bem acima da média. Daqui para frente o que mais pesa no resultado é onde esse dinheiro fica, quanto ele rende e se a carteira tem um objetivo claro para cada parte.',
    });
  }

  if (tem('nao_sei')) {
    pontos.push({
      titulo: 'O dinheiro some e você não sabe para onde',
      texto: 'O primeiro mês com os gastos separados por categoria costuma mostrar vazamentos que ninguém percebia: delivery, assinaturas esquecidas, parcelas pequenas que se somam. Dá para cortar sem mudar o seu padrão de vida.',
    });
  }

  if (tem('espalhado') || r.investe === 'insatisfeito' || (r.investe === 'conta_propria' && tem('nao_cresce'))) {
    pontos.push({
      titulo: 'Carteira sem estratégia',
      texto: 'Comprar um ativo por indicação, depois outro, depois outro, termina numa carteira espalhada e sem função. Atendi um 2º tenente com 25 ativos que rendia 54% do CDI em 12 meses. Depois de reorganizar, o primeiro mês fechou acima do CDI.',
    });
  }

  if (ot && (tem('medo_sair') || r.objetivo === 'sair_com_patrimonio' || r.objetivo === 'transicao')) {
    pontos.push({
      titulo: r.posto === 'saiu' ? 'A transição já começou' : 'Faltam ' + anos + (anos === 1 ? ' ano' : ' anos') + ' para a sua saída',
      texto: 'No ritmo de hoje, a projeção chega a ' + brl(proj.final) + ' em ' + anoFinal + '. A compensação pecuniária ajuda, mas sozinha ela não segura a transição para a vida civil. O plano precisa contar com promoções, férias e 13º, que são os meses em que dá para acelerar.',
    });
  }

  if (tem('impulso')) {
    pontos.push({
      titulo: 'Gasto por impulso',
      texto: 'Uma regra simples ajuda muito: compra que não estava no plano espera 48 horas. Junto com um limite mensal por categoria, isso corta boa parte das compras de que você se arrepende depois.',
    });
  }

  if (tem('renda_instavel')) {
    pontos.push({
      titulo: 'Renda instável pede reserva maior',
      texto: 'Quem não sabe quanto vai receber no mês precisa de uma reserva maior, perto de 12 meses de custo, e de um orçamento montado sobre o mês mais fraco, não sobre a média.',
    });
  }

  if (tem('conflito')) {
    pontos.push({
      titulo: 'Dinheiro virando assunto de briga',
      texto: 'Na maioria das casas o problema é falta de acordo sobre prioridades, mais do que falta de dinheiro. Um orçamento com metas do casal e um valor livre para cada um tira boa parte da tensão.',
    });
  }

  if (tem('nao_invisto') || r.investe === 'nao') {
    pontos.push({
      titulo: 'Começar a investir sem errar no início',
      texto: 'O começo é a parte simples: reserva em renda fixa com liquidez diária e um aporte todo mês no mesmo dia do pagamento. O erro mais comum é pular a reserva e ir direto para ação ou fundo imobiliário por indicação.',
    });
  }

  if (r.momento === 'familia_jovem' && r.protecao !== 'sem_seguro' && r.protecao !== 'nao_sei') {
    pontos.push({
      titulo: 'Filhos pequenos pedem proteção antes de rentabilidade',
      texto: 'Com filhos pequenos, a pergunta mais importante é o que acontece com a renda da casa se você ficar sem trabalhar. Seguro de vida com valor certo e reserva de emergência maior vêm antes de buscar mais retorno.',
    });
  }

  if (r.objetivo === 'aposentadoria' || r.momento === 'pre_aposentadoria') {
    pontos.push({
      titulo: 'Aposentadoria precisa de um número',
      texto: 'Sem saber quanto você quer receber por mês e a partir de que idade, não dá para dizer se o ritmo de hoje é suficiente. Esse número define o aporte, o tipo de carteira e se vale a pena usar previdência privada para pagar menos imposto.',
    });
  }

  if (r.objetivo === 'proteger' || r.momento === 'familia_estabelecida' || r.momento === 'aposentado') {
    pontos.push({
      titulo: 'Proteger o que já foi construído',
      texto: 'Nessa fase o risco maior é perder o que já foi acumulado: concentração num só banco ou ativo, falta de seguro e sucessão sem planejamento, que pode custar caro em imposto e inventário para a família.',
    });
  }

  if (pontos.length < 2) {
    pontos.push({
      titulo: 'Base organizada',
      texto: 'Pelas suas respostas a base está no lugar. O próximo nível é ter um plano por objetivo, com prazo e valor definidos, e revisar a carteira a cada três meses.',
    });
  }

  // ---------- Fase ----------
  let fase;
  const cartaoAlto = ot && renda > 0 && cartao / renda >= 0.3;
  if (cartaoAlto || tem('dividas') || aporte === 0 || (tem('sem_reserva') && taxaPoupanca < 0.1)) {
    fase = {
      numero: 1, nome: 'Organizar a base',
      texto: 'Antes de escolher investimento, o foco é fazer sobrar dinheiro todo mês e montar a reserva de emergência. É a fase que mais muda o resultado lá na frente.',
    };
  } else if (taxaPoupanca >= 0.2 && patrimonio >= reservaIdeal) {
    fase = {
      numero: 3, nome: 'Fazer o dinheiro trabalhar melhor',
      texto: 'Você já guarda bem e tem reserva. Agora o ganho está na estratégia: carteira por objetivo, eficiência no imposto de renda e um plano para cada meta.',
    };
  } else {
    fase = {
      numero: 2, nome: 'Construir reserva e ritmo de aporte',
      texto: 'A sobra existe, mas ainda falta constância ou reserva completa. O foco é investir todo mês no mesmo dia e terminar a reserva antes de assumir risco.',
    };
  }

  // ---------- Diagnóstico 360: nota de 1 a 10 em cada área ----------
  const lim = (n) => Math.max(1, Math.min(10, Math.round(n)));
  const areas = [];

  let org = 8;
  if (tem('nao_sei')) org -= 4;
  if (tem('impulso')) org -= 2;
  if (tem('conflito')) org -= 2;
  if (tem('renda_instavel')) org -= 1;
  if (aporte === 0) org -= 2;
  else if (taxaPoupanca < 0.1) org -= 1;
  if (ot && renda > 0 && cartao / renda >= 0.3) org -= 2;
  else if (!ot && tem('cartao')) org -= 1;
  areas.push({ nome: 'Organização financeira', nota: lim(org) });

  let reserva = (patrimonio / reservaIdeal) * 10;
  if (tem('sem_reserva')) reserva = Math.min(reserva, 3);
  areas.push({ nome: 'Reserva de emergência', nota: lim(reserva) });

  let cred;
  if (ot && renda > 0) {
    const c = cartao / renda;
    cred = c <= 0.15 ? 9 : c <= 0.25 ? 7 : c <= 0.35 ? 5 : c <= 0.5 ? 3 : 1;
  } else {
    cred = 8;
    if (tem('cartao')) cred -= 4;
  }
  if (tem('dividas')) cred -= ot ? 3 : 4;
  areas.push({ nome: 'Cartão e dívidas', nota: lim(cred) });

  const t = taxaPoupanca;
  areas.push({ nome: 'Quanto você guarda', nota: lim(t >= 0.3 ? 10 : t >= 0.2 ? 8 : t >= 0.15 ? 6 : t >= 0.1 ? 4 : t > 0 ? 2 : 1) });

  let inv = { nao: 2, conta_propria: 5, assessoria: 6, insatisfeito: 4 }[r.investe] || 3;
  if (tem('espalhado') || tem('nao_cresce')) inv -= 2;
  if (tem('nao_invisto')) inv -= 1;
  if (patrimonio > reservaIdeal) inv += 2;
  areas.push({ nome: 'Investimentos', nota: lim(inv) });

  let futuro = (proj.final / meta) * 10;
  if (tem('medo_sair')) futuro -= 2;
  areas.push({ nome: ot ? 'Preparo para a saída' : 'Plano para o futuro', nota: lim(futuro) });

  const notaProtecao = { so_eu: 7, tem_seguro: 9, sem_seguro: 2, nao_sei: 4 }[r.protecao] || 5;
  areas.splice(5, 0, { nome: 'Proteção da família', nota: notaProtecao });

  const nota360 = Math.round((areas.reduce((s, a) => s + a.nota, 0) / areas.length) * 10);
  const ordenadas = areas.slice().sort((a, b) => a.nota - b.nota);
  const maisFraca = ordenadas[0];
  const maisForte = ordenadas[ordenadas.length - 1];

  // ---------- Plano dos próximos 30 dias: uma ação para cada área mais fraca ----------
  const acoes = {
    'Organização financeira': 'Abra o extrato e a fatura dos últimos 2 meses e separe os gastos em 5 categorias: casa, alimentação, transporte, lazer e o resto. Só isso já mostra para onde o dinheiro vai.',
    'Reserva de emergência': 'Abra uma conta de investimento separada só para a reserva, num título com liquidez diária, e programe uma transferência automática no dia do pagamento, mesmo que pequena.',
    'Cartão e dívidas': 'Liste todas as parcelas e dívidas com a taxa de juros de cada uma. Pare de parcelar compras novas por 30 dias e veja quanto a fatura cai.',
    'Quanto você guarda': 'Decida um valor fixo para investir todo mês e transfira no dia em que o salário cai, antes de qualquer gasto. O que sobra é o que dá para gastar.',
    'Investimentos': 'Liste onde está cada real que você tem investido e para que serve cada aplicação. O que não tiver um objetivo claro é candidato a sair.',
    'Proteção da família': 'Confira se você tem seguro de vida, quanto ele paga e quem são os beneficiários. Se não tem, faça a conta de quanto a sua família precisaria por mês sem a sua renda.',
    'Preparo para a saída': 'Anote o ano previsto da sua saída e as datas das próximas promoções. Defina agora quanto de cada aumento vai para investimento antes de ele cair na conta.',
    'Plano para o futuro': 'Escreva os seus 2 objetivos principais com valor e prazo, por exemplo "R$ 80 mil de entrada do apartamento em 4 anos". Sem número, não dá para saber se o ritmo está certo.',
  };
  const plano30 = ordenadas.slice(0, 4).map((a) => ({ area: a.nome, texto: acoes[a.nome] }));

  // ---------- Mensagens prontas para o WhatsApp ----------
  const primeiro = ((r.nome || '').trim().split(/\s+/)[0] || '');
  const linkWhats = (texto) => 'https://wa.me/' + cfg.whatsapp + '?text=' + encodeURIComponent(texto);
  const apresent = 'Oi Renato, ' + (primeiro ? 'sou ' + primeiro + '. ' : '') + 'Fiz o diagnóstico financeiro' + (ot ? ' pelo Seja Oficial' : '');
  const whatsPrincipal = linkWhats(apresent + ' e tirei ' + nota360 + '/100. O que mais pesou foi ' + maisFraca.nome.toLowerCase() + '. Quero marcar a conversa para entender o que fazer primeiro.');
  pontos.slice(0, 4).forEach((p) => {
    p.whats = linkWhats(apresent + '. Apareceu este ponto no meu resultado: "' + p.titulo + '". Pode me ajudar com isso?');
  });

  return {
    areas, nota360, maisFraca, maisForte, plano30, whatsPrincipal,
    interesse: r.conversa, horario: r.horario,
    publico, ot, anoAtual, anoFinal, anos,
    nome: (r.nome || '').trim(),
    primeiroNome: ((r.nome || '').trim().split(/\s+/)[0] || ''),
    renda, aporte, patrimonio, cartao, taxaPoupanca, custoMensal, reservaIdeal,
    meta, aporteParaMeta, proj, fase,
    pontos: pontos.slice(0, 4),
    objetivoTexto: textoOpcao('objetivo', r.objetivo),
    faixas: {
      renda: textoOpcao('renda', r.renda),
      aporte: textoOpcao('aporte', r.aporte),
      patrimonio: textoOpcao('patrimonio', r.patrimonio),
    },
    taxaAnual: cfg.taxaAnual,
  };
};

function projetar(inicial, aporte, anos, taxaAnual) {
  const i = Math.pow(1 + taxaAnual, 1 / 12) - 1;
  const serie = [inicial];
  let saldo = inicial;
  for (let m = 1; m <= anos * 12; m++) {
    saldo = saldo * (1 + i) + aporte;
    if (m % 12 === 0) serie.push(saldo);
  }
  const investido = inicial + aporte * anos * 12;
  return { final: saldo, serie, investido, juros: saldo - investido };
}

function aporteNecessario(inicial, meta, anos, taxaAnual) {
  const i = Math.pow(1 + taxaAnual, 1 / 12) - 1;
  const n = anos * 12;
  const f = Math.pow(1 + i, n);
  const falta = meta - inicial * f;
  if (falta <= 0) return 0;
  return falta * i / (f - 1);
}

function textoOpcao(id, valor) {
  const q = (window.FORMULARIO.perguntas || []).find((p) => p.id === id);
  if (!q || !q.opcoes) return '';
  const o = q.opcoes.find((op) => String(op.v) === String(valor));
  return o ? o.t : '';
}
