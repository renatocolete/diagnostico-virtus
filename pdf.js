// Gera o PDF personalizado (A4, 3 páginas) com a identidade da Virtus.

window.gerarPDF = function (d) {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF({ unit: 'pt', format: 'a4' });
  const W = 595.28, H = 841.89, M = 48;
  const C = {
    fundo: '#000000', cartao: '#13161B', linha: '#2B313A',
    texto: '#ECEEF2', suave: '#9CA2AD', ciano: '#00D2D3', cianoEsc: '#0E4A4B', laranja: '#FF8A6B', tinta: '#001A1A',
  };
  const hoje = new Date().toLocaleDateString('pt-BR');
  let pagina = 0;

  function novaPagina() {
    if (pagina > 0) doc.addPage();
    pagina++;
    doc.setFillColor(C.fundo); doc.rect(0, 0, W, H, 'F');
    // topo
    if (window.VIRTUS_LOGO) doc.addImage(window.VIRTUS_LOGO, 'PNG', M, 36, 30, 30);
    doc.setFont('helvetica', 'bold'); doc.setFontSize(9); doc.setTextColor(C.texto);
    doc.text('VIRTUS WEALTH', M + 40, 55, { charSpace: 2 });
    doc.setFont('helvetica', 'normal'); doc.setTextColor(C.suave);
    doc.text('Diagnóstico de ' + (d.primeiroNome || 'você') + ' · ' + hoje, W - M, 55, { align: 'right' });
    // rodapé
    doc.setDrawColor(C.linha); doc.setLineWidth(0.5); doc.line(M, H - 54, W - M, H - 54);
    doc.setFontSize(8); doc.setTextColor(C.suave);
    doc.text('Virtus Wealth Consultoria de Investimentos · CNPJ 65.691.071/0001-23', M, H - 38);
    doc.text(String(pagina), W - M, H - 38, { align: 'right' });
  }

  function eyebrow(t, y, cor, x) {
    doc.setFont('helvetica', 'bold'); doc.setFontSize(9); doc.setTextColor(cor || C.ciano);
    doc.text(t.toUpperCase(), x || M, y, { charSpace: 1.5 });
  }
  function titulo(t, y, tam) {
    doc.setFont('times', 'italic'); doc.setFontSize(tam || 30); doc.setTextColor(C.texto);
    const linhas = doc.splitTextToSize(t, W - 2 * M);
    doc.text(linhas, M, y);
    return y + linhas.length * (tam || 30) * 1.1;
  }
  function paragrafo(t, x, y, largura, opts) {
    const o = Object.assign({ tam: 11, cor: C.suave, estilo: 'normal', entre: 1.45 }, opts || {});
    doc.setFont('helvetica', o.estilo); doc.setFontSize(o.tam); doc.setTextColor(o.cor);
    const linhas = doc.splitTextToSize(t, largura);
    doc.text(linhas, x, y, { lineHeightFactor: o.entre });
    return y + linhas.length * o.tam * o.entre;
  }
  function caixa(x, y, w, h, cor, borda) {
    doc.setFillColor(cor || C.cartao); doc.roundedRect(x, y, w, h, 8, 8, 'F');
    if (borda) { doc.setFillColor(borda); doc.rect(x, y + 8, 3, h - 16, 'F'); }
  }
  function altura(t, largura, tam, entre) {
    doc.setFont('helvetica', 'normal'); doc.setFontSize(tam);
    return doc.splitTextToSize(t, largura).length * tam * (entre || 1.45);
  }

  // ================= Página 1: Diagnóstico 360 =================
  novaPagina();
  let y = 120;
  eyebrow(d.ot ? 'Diagnóstico para oficial temporário' : d.sp ? 'Diagnóstico para servidor público' : 'Diagnóstico financeiro', y);
  y = titulo('Olá, ' + (d.primeiroNome || 'tudo bem') + '.', y + 36, 34);
  y = paragrafo('Este é o retrato da sua vida financeira a partir do que você respondeu. Cada área recebeu uma nota de 1 a 10. Quanto mais aberto o desenho, mais equilibrada está a sua vida financeira.', M, y + 4, W - 2 * M, { tam: 11.5 });

  y += 18;
  eyebrow('Diagnóstico 360', y);
  doc.setFont('helvetica', 'bold'); doc.setFontSize(11); doc.setTextColor(C.texto);
  doc.text('Nota geral', W - M - 70, y, { align: 'right' });
  doc.setFont('times', 'normal'); doc.setFontSize(30); doc.setTextColor(C.ciano);
  doc.text(String(d.nota360), W - M - 22, y + 4, { align: 'right' });
  doc.setFont('helvetica', 'normal'); doc.setFontSize(10); doc.setTextColor(C.suave);
  doc.text('/100', W - M, y + 4, { align: 'right' });

  desenharRadar(W / 2, y + 205, 128, d.areas);
  y += 410;

  // Ponto forte e ponto fraco
  const metadeR = (W - 2 * M - 14) / 2;
  [
    { r: 'Seu ponto mais forte', a: d.maisForte, cor: C.ciano },
    { r: 'O que pede atenção primeiro', a: d.maisFraca, cor: C.laranja },
  ].forEach((s, i) => {
    const cx = M + i * (metadeR + 14);
    caixa(cx, y, metadeR, 66, C.cartao, s.cor);
    doc.setFont('helvetica', 'normal'); doc.setFontSize(10); doc.setTextColor(C.suave);
    doc.text(s.r, cx + 20, y + 25);
    doc.setFont('helvetica', 'bold'); doc.setFontSize(14); doc.setTextColor(C.texto);
    doc.text(s.a.nome + '  ' + s.a.nota + '/10', cx + 20, y + 48);
  });
  doc.setFont('helvetica', 'bold'); doc.setFontSize(10.5); doc.setTextColor(C.ciano);
  const chamada = 'Quer entender o seu resultado? Fale comigo no WhatsApp  >';
  doc.textWithLink(chamada, W / 2 - doc.getTextWidth(chamada) / 2, y + 92, { url: d.whatsPrincipal });

  function desenharRadar(cx, cy, R, areas) {
    const n = areas.length;
    const ponto = (i, raio) => {
      const ang = -Math.PI / 2 + (2 * Math.PI * i) / n;
      return [cx + raio * Math.cos(ang), cy + raio * Math.sin(ang)];
    };
    // anéis de 2 em 2 pontos
    doc.setLineWidth(0.6); doc.setDrawColor(C.linha);
    for (let k = 1; k <= 5; k++) {
      const raio = (R * k) / 5;
      for (let i = 0; i < n; i++) {
        const a = ponto(i, raio), b = ponto((i + 1) % n, raio);
        doc.line(a[0], a[1], b[0], b[1]);
      }
    }
    for (let i = 0; i < n; i++) {
      const a = ponto(i, R);
      doc.line(cx, cy, a[0], a[1]);
    }
    // área preenchida com as notas
    const pts = areas.map((ar, i) => ponto(i, (R * ar.nota) / 10));
    const deltas = pts.slice(1).map((p, i) => [p[0] - pts[i][0], p[1] - pts[i][1]]);
    doc.setFillColor(C.ciano); doc.setDrawColor(C.ciano);
    doc.setGState(new doc.GState({ opacity: 0.22 }));
    doc.lines(deltas, pts[0][0], pts[0][1], [1, 1], 'F', true);
    doc.setGState(new doc.GState({ opacity: 1 }));
    doc.setLineWidth(2);
    doc.lines(deltas, pts[0][0], pts[0][1], [1, 1], 'S', true);
    pts.forEach((p) => doc.circle(p[0], p[1], 3, 'F'));
    // rótulos
    areas.forEach((ar, i) => {
      const p = ponto(i, R + 20);
      const alinhar = Math.abs(p[0] - cx) < 5 ? 'center' : p[0] > cx ? 'left' : 'right';
      const dy = p[1] < cy - R * 0.5 ? -10 : p[1] > cy + R * 0.5 ? 6 : -4;
      doc.setFont('helvetica', 'bold'); doc.setFontSize(10); doc.setTextColor(C.texto);
      doc.text(ar.nome, p[0], p[1] + dy, { align: alinhar });
      doc.setFont('helvetica', 'normal'); doc.setFontSize(10);
      doc.setTextColor(ar.nota <= 4 ? C.laranja : C.ciano);
      doc.text(ar.nota + '/10', p[0], p[1] + dy + 13, { align: alinhar });
    });
  }

  // ================= Página 2: onde você está =================
  novaPagina();
  y = 130;
  eyebrow('Onde você está hoje', y);
  y = titulo('Os seus números', y + 36, 26);

  // Fase
  y += 6;
  const larguraFase = W - 2 * M - 40;
  const hFase = 64 + altura(d.fase.texto, larguraFase, 11);
  caixa(M, y, W - 2 * M, hFase, C.cartao, C.ciano);
  eyebrow('Sua fase hoje · ' + d.fase.numero + ' de 3', y + 26, C.ciano, M + 20);
  doc.setFont('helvetica', 'bold'); doc.setFontSize(17); doc.setTextColor(C.texto);
  doc.text(d.fase.nome, M + 20, y + 50);
  paragrafo(d.fase.texto, M + 20, y + 70, larguraFase, { tam: 11 });
  y += hFase + 30;

  // Números
  eyebrow('Números principais', y);
  y += 16;
  const exato = d.ot || d.sp; // nessas versões os valores são digitados, não escolhidos por faixa
  const faixa = (id, valor) => (exato ? brl(valor) : (d.faixas[id] || brl(valor)));
  const stats = [
    { r: exato ? 'Cai na conta por mês' : 'Renda mensal', v: faixa('renda', d.renda) },
    { r: 'Investe por mês', v: faixa('aporte', d.aporte) },
    { r: 'Já tem guardado', v: faixa('patrimonio', d.patrimonio) },
    { r: exato ? 'Parte da renda investida' : 'Parte da renda investida (aprox.)', v: pct(d.taxaPoupanca) },
  ];
  if (d.sp) {
    stats.push({ r: 'Salário bruto', v: brl(d.bruto) });
    if (d.lacunaTeto > 0) stats.push({ r: 'Falta por mês acima do teto', v: brl(d.lacunaTeto), alerta: true });
    else stats.push({ r: 'PGBL: limite de dedução no ano', v: brl(d.limitePGBL) });
  }
  if (d.ot) {
    stats.push({ r: 'Fatura média do cartão', v: brl(d.cartao), alerta: d.renda > 0 && d.cartao / d.renda >= 0.3 });
    stats.push({ r: 'Reserva ideal (6 meses)', v: brl(d.reservaIdeal) });
  }
  const colW = (W - 2 * M - 14) / 2, cardH = 70;
  stats.forEach((s, i) => {
    const cx = M + (i % 2) * (colW + 14);
    const cy = y + Math.floor(i / 2) * (cardH + 12);
    caixa(cx, cy, colW, cardH);
    doc.setFont('helvetica', 'normal'); doc.setFontSize(10); doc.setTextColor(C.suave);
    doc.text(s.r, cx + 18, cy + 26);
    doc.setFont('helvetica', 'bold'); doc.setFontSize(s.v.length > 14 ? 13 : 20); doc.setTextColor(s.alerta ? C.laranja : C.texto);
    doc.text(s.v, cx + 18, cy + 50);
  });
  y += Math.ceil(stats.length / 2) * (cardH + 12) + 14;

  if (d.objetivoTexto && y < H - 120) {
    eyebrow('O que você quer resolver', y);
    paragrafo(d.objetivoTexto, M, y + 20, W - 2 * M, { tam: 13, cor: C.texto });
  }
  botao(M, H - 128, W - 2 * M, 38, 'Quero ajuda para sair da fase ' + d.fase.numero, d.whatsFase, C.cartao, C.ciano);

  // ================= Página 2: pontos de atenção =================
  novaPagina();
  y = 130;
  eyebrow('Pontos de atenção', y);
  y = titulo('O que mais pesa na sua vida financeira hoje', y + 36, 26);
  y += 10;
  d.pontos.forEach((p, i) => {
    const larg = W - 2 * M - 80;
    const hTexto = altura(p.texto, larg, 10.5);
    const hTit = altura(p.titulo, larg, 13.5, 1.25);
    const h = 58 + hTit + hTexto;
    if (y + h > H - 80) return;
    caixa(M, y, W - 2 * M, h);
    doc.setFont('times', 'italic'); doc.setFontSize(30); doc.setTextColor(C.ciano);
    doc.text(String(i + 1), M + 22, y + 40);
    const yt = paragrafo(p.titulo, M + 64, y + 28, larg, { tam: 13.5, cor: C.texto, estilo: 'bold', entre: 1.25 });
    const yl = paragrafo(p.texto, M + 64, yt + 4, larg, { tam: 10.5 });
    if (p.whats) {
      doc.setFont('helvetica', 'bold'); doc.setFontSize(10); doc.setTextColor(C.ciano);
      doc.textWithLink('Conversar sobre isso no WhatsApp  >', M + 64, yl + 8, { url: p.whats });
    }
    y += h + 12;
  });

  // ================= Página 3: projeção e próximo passo =================
  novaPagina();
  y = 130;
  eyebrow(d.ot ? 'Até a sua saída do Exército' : d.sp ? 'Até a sua aposentadoria' : 'Os próximos ' + d.anos + ' anos', y);
  y = titulo(d.ot && d.pecuniaria > 0 ? 'Com quanto você sai do Exército em ' + d.anoFinal : 'Quanto você pode ter em ' + d.anoFinal, y + 36, 26);
  const totalFinal = d.ot ? d.totalSaida : d.proj.final;
  doc.setFont('times', 'normal'); doc.setFontSize(46); doc.setTextColor(C.ciano);
  doc.text(brl(totalFinal), M, y + 34);
  y += 52;

  // Calculadora de juros compostos: os dados de entrada à esquerda, o resultado à direita
  const aprox = exato ? '' : 'cerca de ';
  const meses = d.anos * 12;
  const entradas = [
    ['Valor inicial', aprox + brl(d.patrimonio)],
    ['Aporte mensal', aprox + brl(d.aporte)],
    ['Taxa de juros', pct(d.taxaAnual) + ' ao ano'],
    ['Período', d.anos + (d.anos === 1 ? ' ano' : ' anos') + ' (' + meses + ' meses)'],
  ];
  const saidas = [
    ['Total investido', brl(d.proj.investido)],
    ['Total em juros', brl(d.proj.juros)],
    ['Valor dos investimentos', brl(d.proj.final), true],
  ];
  if (d.ot && d.pecuniaria > 0) {
    saidas.push(['+ Pecuniária estimada', brl(d.pecuniaria)]);
    saidas.push(['= Total na saída', brl(d.totalSaida), true]);
  }
  const linhaH = 21;
  const hCalc = 44 + Math.max(entradas.length, saidas.length) * linhaH;
  caixa(M, y, W - 2 * M, hCalc);
  const colCalc = (W - 2 * M) / 2;
  eyebrow('Os dados', y + 24, C.suave, M + 20);
  eyebrow('O resultado', y + 24, C.ciano, M + colCalc + 10);
  doc.setDrawColor(C.linha); doc.setLineWidth(0.5); doc.line(M + colCalc, y + 14, M + colCalc, y + hCalc - 14);
  entradas.forEach((e, i) => {
    const ly = y + 46 + i * linhaH;
    doc.setFont('helvetica', 'normal'); doc.setFontSize(10.5); doc.setTextColor(C.suave);
    doc.text(e[0], M + 20, ly);
    doc.setFont('helvetica', 'bold'); doc.setTextColor(C.texto);
    doc.text(e[1], M + colCalc - 16, ly, { align: 'right' });
  });
  saidas.forEach((s, i) => {
    const ly = y + 46 + i * linhaH;
    doc.setFont('helvetica', s[2] ? 'bold' : 'normal'); doc.setFontSize(10.5); doc.setTextColor(s[2] ? C.texto : C.suave);
    doc.text(s[0], M + colCalc + 10, ly);
    doc.setFont('helvetica', 'bold'); doc.setTextColor(s[2] ? C.ciano : C.texto);
    doc.text(s[1], W - M - 20, ly, { align: 'right' });
  });
  y += hCalc + 18;

  // Gráfico de barras com a evolução dos investimentos ano a ano
  const gH = 96, gW = W - 2 * M;
  const serie = d.proj.serie;
  const maxV = Math.max.apply(null, serie.concat([1]));
  const n = serie.length;
  const gap = n > 12 ? 4 : 8;
  const bw = (gW - gap * (n - 1)) / n;
  serie.forEach((v, i) => {
    const bh = Math.max(2, (v / maxV) * gH);
    doc.setFillColor(i === n - 1 ? C.ciano : C.cianoEsc);
    doc.rect(M + i * (bw + gap), y + gH - bh, bw, bh, 'F');
    const passo = n > 12 ? 2 : 1;
    if (i % passo === 0 || i === n - 1) {
      doc.setFont('helvetica', 'normal'); doc.setFontSize(8); doc.setTextColor(C.suave);
      doc.text(String(d.anoAtual + i), M + i * (bw + gap) + bw / 2, y + gH + 14, { align: 'center' });
    }
  });
  y += gH + 28;

  // Meta
  const passa = d.aporteParaMeta <= 0 || totalFinal >= d.meta;
  let textoMeta = passa
    ? 'Nesse ritmo você passa de ' + brl(d.meta) + ' até ' + d.anoFinal + '. O trabalho agora é manter o plano e proteger esse caminho.'
    : 'Para sair com ' + brl(d.meta) + ' em ' + d.anoFinal + (d.pecuniaria > 0 ? ', contando a pecuniária,' : '') + ' o aporte precisa ser de ' + brl(d.aporteParaMeta) + ' por mês. Promoções, férias e 13º ajudam a fechar essa conta.';
  if (d.sp) {
    const motivo = d.lacunaTeto > 0 ? 'Para completar os ' + brl(d.lacunaTeto) + ' por mês acima do teto, você precisa chegar a ' : 'A meta é chegar a ';
    textoMeta = passa
      ? motivo + brl(d.meta) + ' em ' + d.anoFinal + '. Nesse ritmo você chega lá. O trabalho agora é manter o plano e proteger esse caminho.'
      : motivo + brl(d.meta) + ' em ' + d.anoFinal + '. Para isso, o aporte precisa ser de ' + brl(d.aporteParaMeta) + ' por mês. O 13º e as progressões da carreira ajudam a fechar essa conta.';
  }
  // Meta fora da realidade (prazo curto, renda de aluno, valor digitado errado): em vez de
  // "precisa investir R$ 30 mil por mês", mostra um passo que cabe na renda de hoje
  if (!passa && !d.metaRealista) {
    const extra = d.ot ? 'Promoções, férias e 13º ajudam a ir além.' : d.sp ? 'O 13º e as progressões da carreira ajudam a ir além.' : 'Aumento de renda e 13º ajudam a ir além.';
    const inicio = (d.sp && d.lacunaTeto > 0 ? 'Para completar os ' + brl(d.lacunaTeto) + ' por mês acima do teto, a conta pede ' : 'A meta de referência é ') +
      brl(d.meta) + ' em ' + d.anoFinal + '. Com ' + d.anos + (d.anos === 1 ? ' ano' : ' anos') + ' pela frente, isso pediria um aporte maior do que cabe hoje na sua renda. ';
    if (d.renda < 1000) {
      // renda digitada errada ou quase zero: não dá para sugerir valor
      textoMeta = inicio + 'Comece pelo plano de 30 dias deste PDF. Na conversa a gente olha os seus números com calma e define quanto dá pra investir por mês.';
    } else if (d.aporteSugerido > d.aporte) {
      textoMeta = inicio + 'Um passo possível: subir o aporte para ' + brl(d.aporteSugerido) + ' por mês, uns 30% do que cai na conta. Assim você chega em ' + d.anoFinal + ' com ' + brl(d.totalSugerido) +
        (d.ot && d.pecuniaria > 0 ? ', contando a pecuniária' : '') + (totalFinal > 0 ? ', contra ' + brl(totalFinal) + ' no ritmo de hoje. ' : '. ') + extra;
    } else {
      textoMeta = inicio + 'Você já investe uma boa parte do que ganha, então o próximo salto vem de aumentar a renda e mandar cada aumento direto pro investimento. ' + extra;
    }
  }
  const hMeta = 30 + altura(textoMeta, W - 2 * M - 40, 11.5);
  caixa(M, y, W - 2 * M, hMeta, C.cartao, C.laranja);
  paragrafo(textoMeta, M + 20, y + 24, W - 2 * M - 40, { tam: 11.5, cor: C.texto });
  y += hMeta + 14;
  const textoBotaoMeta = passa ? 'Montar comigo o plano para manter esse ritmo'
    : d.metaRealista ? 'Montar comigo o caminho até ' + brl(d.meta) : 'Montar comigo o plano até ' + d.anoFinal;
  botao(M, y, W - 2 * M, 38, textoBotaoMeta, d.whatsMeta, C.cartao, C.ciano);
  y += 52;

  if (d.ot && d.pecuniaria > 0) {
    y = paragrafo('Pecuniária estimada: ' + d.anosServico + ' anos de serviço (turma ' + d.turma + ' até ' + d.anoFinal + ') multiplicados por ' + d.basePecuniaria + ', ' + brl(d.baseSoldo) + '. A lei paga uma remuneração por ano de serviço, que inclui adicionais e costuma ser maior que o soldo; o valor também muda com reajustes. Use como estimativa conservadora.', M, y + 2, W - 2 * M, { tam: 8 });
  }
  paragrafo(d.sp
    ? 'Simulação com rentabilidade de ' + pct(d.taxaAnual) + ' ao ano, sem descontar inflação nem imposto. Teto do INSS de ' + brl(d.tetoINSS) + ' (2026). A meta da aposentadoria usa a regra dos 4% ao ano, em valores de hoje, e não considera a previdência complementar. Não é promessa de rentabilidade nem recomendação de investimento.'
    : 'Simulação com rentabilidade de ' + pct(d.taxaAnual) + ' ao ano, sem descontar inflação nem imposto. Não é promessa de rentabilidade. Rentabilidade passada não garante resultado futuro.', M, y + 4, W - 2 * M, { tam: 8 });

  // ================= Página 5: plano dos próximos 30 dias =================
  novaPagina();
  y = 130;
  eyebrow('O que fazer agora', y);
  y = titulo('Seu plano para os próximos 30 dias', y + 36, 26);
  y = paragrafo('Uma ação por semana, começando pela área com a nota mais baixa.', M, y + 2, W - 2 * M, { tam: 11 });
  y += 10;
  d.plano30.forEach((a, i) => {
    const larg = W - 2 * M - 70;
    const h = 56 + altura(a.texto, larg, 10.5);
    caixa(M, y, W - 2 * M, h);
    doc.setDrawColor(C.ciano); doc.setLineWidth(1.5);
    doc.roundedRect(M + 20, y + 18, 16, 16, 3, 3, 'S');
    doc.setFont('helvetica', 'bold'); doc.setFontSize(9); doc.setTextColor(C.ciano);
    doc.text(('Semana ' + (i + 1) + ' · ' + a.area).toUpperCase(), M + 50, y + 26, { charSpace: 1 });
    const ya = paragrafo(a.texto, M + 50, y + 42, larg, { tam: 10.5, cor: C.texto });
    doc.setFont('helvetica', 'bold'); doc.setFontSize(10); doc.setTextColor(C.ciano);
    doc.textWithLink('Fazer isso com o Renato  >', M + 50, ya + 3, { url: a.whats });
    y += h + 8;
  });

  y += 8;
  // Servidor fora do perfil (filtro da campanha): sem convite para a conversa gratuita
  const foraRenda = d.sp && d.motivoFora === 'renda';
  const foraOutro = d.sp && !d.qualificado && !foraRenda;
  const textoPasso = foraRenda
    ? 'Comece pelas ações do plano acima, uma por semana. A primeira já mostra o resultado no fim do mês. No meu Instagram eu posto toda semana conta de aposentadoria, PGBL e taxa de investimento pra servidor.'
    : foraOutro
    ? 'Quando quiser transformar esse plano em números da sua realidade (quanto guardar, onde investir e o que fazer com o 13º e cada progressão até ' + d.anoFinal + '), me chama no WhatsApp. Até lá, as ações acima já dão pra começar sozinho.'
    : 'Marque agora a sua conversa de 45 minutos comigo, sem custo. A gente transforma esse plano em números da sua realidade: quanto guardar, onde investir e o que fazer com ' + (d.ot ? 'cada promoção e 13º' : d.sp ? 'o 13º e cada progressão' : 'o 13º e cada dinheiro extra') + ' até ' + d.anoFinal + '. E eu te mostro como funciona o acompanhamento.';
  const hPasso = 92 + altura(textoPasso, W - 2 * M - 40, 11);
  if (y + hPasso > H - 70) { novaPagina(); y = 130; } // nunca deixa o próximo passo de fora
  {
    doc.setFillColor(C.ciano); doc.roundedRect(M, y, W - 2 * M, hPasso, 8, 8, 'F');
    doc.setFont('helvetica', 'bold'); doc.setFontSize(9); doc.setTextColor(C.tinta);
    doc.text('PRÓXIMO PASSO', M + 20, y + 26, { charSpace: 1.5 });
    const yp = paragrafo(textoPasso, M + 20, y + 46, W - 2 * M - 40, { tam: 11, cor: C.tinta });
    if (foraRenda) botao(M + 20, yp + 2, 260, 30, 'Seguir @renatocolete no Instagram', d.instagram, C.fundo, C.texto);
    else botao(M + 20, yp + 2, 260, 30, foraOutro ? 'Falar com o Renato no WhatsApp' : 'Marcar minha conversa no WhatsApp', d.whatsPrincipal, C.fundo, C.texto);
  }

  // ================= Página 6: quem vai te acompanhar =================
  novaPagina();
  y = 120;
  eyebrow('Quem vai te acompanhar', y);
  const foto = d.ot ? window.FOTO_RENATO_FARDA : window.FOTO_RENATO;
  if (foto) doc.addImage(foto, 'JPEG', M, y + 18, 120, 120);
  let yq = y + 44;
  doc.setFont('times', 'italic'); doc.setFontSize(28); doc.setTextColor(C.texto);
  doc.text('Renato Colete', M + 140, yq);
  doc.setFont('helvetica', 'normal'); doc.setFontSize(11); doc.setTextColor(C.ciano);
  doc.text('Consultor Virtus Wealth', M + 140, yq + 20);
  const credenciais = [
    'Especialista em Investimentos ANBIMA (CEA)',
    'MBA em Planejamento Financeiro (FGV)',
    '1º Tenente do Exército, NPOR de Engenharia 2019',
    'Atendendo militares desde 2022',
  ];
  doc.setFontSize(10.5); doc.setTextColor(C.suave);
  credenciais.forEach((c, i) => doc.text(c, M + 140, yq + 42 + i * 16));
  y += 160;

  // números
  const nums = [['+30', 'famílias atendidas por mim'], ['R$ 60 mi', 'acompanhados pelo time'], ['5 de 6', 'consultores são militares ou ex-militares']];
  const nw = (W - 2 * M - 20) / nums.length;
  nums.forEach((nmr, i) => {
    const cx = M + i * (nw + 10);
    caixa(cx, y, nw, 64);
    doc.setFont('times', 'normal'); doc.setFontSize(22); doc.setTextColor(C.ciano);
    doc.text(nmr[0], cx + 14, y + 30);
    paragrafo(nmr[1], cx + 14, y + 47, nw - 24, { tam: 8.5, entre: 1.3 });
  });
  y += 82;

  eyebrow('Como funciona a consultoria', y);
  y += 14;
  const etapas = [
    ['Diagnóstico', 'Conversa de 45 minutos sobre a sua realidade, sem custo.'],
    ['Plano', 'Orçamento, reserva e carteira montados para os seus objetivos.'],
    ['Implementação', 'O dinheiro fica na sua conta, na corretora que você escolher. Eu oriento, você aprova.'],
    ['Acompanhamento', 'Relatório todo mês, revisão a cada trimestre e o app Central Virtus no celular.'],
  ];
  etapas.forEach((e, i) => {
    doc.setFont('helvetica', 'bold'); doc.setFontSize(10.5); doc.setTextColor(C.texto);
    doc.text((i + 1) + '. ' + e[0], M, y + 12);
    paragrafo(e[1], M + 120, y + 12, W - 2 * M - 120, { tam: 10, entre: 1.35 });
    y += altura(e[1], W - 2 * M - 120, 10, 1.35) + 10;
  });
  y += 6;

  const garantias = 'Remuneração 100% fee based: a Virtus não recebe comissão de nenhum produto, só a mensalidade paga por você. Sem multa e sem tempo mínimo. E se usar o primeiro mês e não gostar, o valor volta inteiro.';
  const hG = 26 + altura(garantias, W - 2 * M - 40, 10.5);
  caixa(M, y, W - 2 * M, hG, C.cartao, C.ciano);
  paragrafo(garantias, M + 20, y + 20, W - 2 * M - 40, { tam: 10.5, cor: C.texto });
  y += hG + 14;

  if (y + 70 < H - 60) {
    botao(M, y, W - 2 * M, 40, 'Falar com o Renato no WhatsApp', d.whatsPrincipal, C.ciano, C.tinta);
    doc.setFont('helvetica', 'normal'); doc.setFontSize(9); doc.setTextColor(C.suave);
    doc.text('(67) 9 9299-3734 · @renatocolete no Instagram · virtuswealth.com.br', W / 2, y + 58, { align: 'center' });
  }

  function botao(x, yb, w, h, texto, url, fundo, cor) {
    doc.setFillColor(fundo); doc.roundedRect(x, yb, w, h, 6, 6, 'F');
    doc.setFont('helvetica', 'bold'); doc.setFontSize(11); doc.setTextColor(cor);
    doc.text(texto + '  >', x + w / 2, yb + h / 2 + 4, { align: 'center' });
    doc.link(x, yb, w, h, { url: url });
  }

  return doc;
};
