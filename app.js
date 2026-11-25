// Controla as telas, uma pergunta por vez, validação, envio e resultado.
(function () {
  const F = window.FORMULARIO;
  const respostas = {};
  let indice = 0;
  let pdfAtual = null;

  const $ = (id) => document.getElementById(id);
  const telas = ['tela-inicio', 'tela-form', 'tela-gerando', 'tela-resultado'];
  function mostrar(id) {
    telas.forEach((t) => $(t).classList.toggle('ativa', t === id));
    window.scrollTo(0, 0);
  }

  // Textos da tela inicial conforme o público
  $('inicio-eyebrow').textContent = F.inicio.eyebrow;
  $('inicio-titulo').textContent = F.inicio.titulo;
  $('inicio-texto').textContent = F.inicio.texto;

  function visiveis() {
    return F.perguntas.filter((p) => !p.mostrarSe || p.mostrarSe(respostas));
  }

  function numero(texto) {
    const limpo = String(texto || '').replace(/[^\d,]/g, '').replace(',', '.');
    return limpo === '' ? NaN : Math.round(parseFloat(limpo));
  }
  function formatarMilhar(n) {
    return isNaN(n) ? '' : n.toLocaleString('pt-BR');
  }

  function render() {
    const lista = visiveis();
    const p = lista[indice];
    $('barra').style.width = Math.round((indice / lista.length) * 100) + '%';
    $('passo-texto').textContent = 'Pergunta ' + (indice + 1) + ' de ' + lista.length;
    $('erro').textContent = '';
    $('btn-voltar').style.visibility = indice === 0 ? 'hidden' : 'visible';
    $('btn-avancar').textContent = p.tipo === 'contato' ? 'Gerar meu diagnóstico' : 'Continuar';

    const box = $('pergunta');
    let html = '<h2>' + (typeof p.titulo === 'function' ? p.titulo(respostas) : p.titulo) + '</h2>';
    if (p.ajuda) html += '<p class="ajuda">' + p.ajuda + '</p>';

    if (p.tipo === 'contato') {
      html +=
        '<label class="campo">Nome<input name="nome" autocomplete="name" required value="' + esc(respostas.nome) + '"></label>' +
        '<label class="campo">E-mail<input name="email" type="email" inputmode="email" autocomplete="email" required value="' + esc(respostas.email) + '"></label>' +
        '<label class="campo">WhatsApp com DDD<input name="whatsapp" type="tel" inputmode="tel" autocomplete="tel" placeholder="(67) 99999-9999" required value="' + esc(respostas.whatsapp) + '"></label>' +
        '<label class="opcao consent"><input type="checkbox" name="consentimento"' + (respostas.consentimento ? ' checked' : '') + '><span>' + p.consentimento + '</span></label>';
    } else if (p.tipo === 'single' || p.tipo === 'multi') {
      const tipoInput = p.tipo === 'single' ? 'radio' : 'checkbox';
      const atual = respostas[p.id];
      html += '<div class="opcoes' + (p.colunas ? ' colunas-' + p.colunas : '') + '">';
      opcoesDe(p, respostas).forEach((o) => {
        const marcado = p.tipo === 'single' ? String(atual) === String(o.v) : (atual || []).map(String).includes(String(o.v));
        html += '<label class="opcao"><input type="' + tipoInput + '" name="' + p.id + '" value="' + o.v + '"' + (marcado ? ' checked' : '') + '><span>' + o.t + '</span></label>';
      });
      html += '</div>';
    } else if (p.tipo === 'money') {
      html += '<label class="campo dinheiro"><span class="prefixo">R$</span><input name="' + p.id + '" inputmode="numeric" placeholder="' + (p.placeholder || '') + '" value="' + formatarMilhar(respostas[p.id]) + '"></label>';
    } else if (p.tipo === 'consent') {
      html += '<label class="opcao consent"><input type="checkbox" name="consentimento"' + (respostas.consentimento ? ' checked' : '') + '><span>' + p.texto + '</span></label>';
    }
    box.innerHTML = html;

    // Máscara de valor
    box.querySelectorAll('.dinheiro input').forEach((inp) => {
      inp.addEventListener('input', () => {
        const n = numero(inp.value);
        inp.value = formatarMilhar(n);
      });
    });
    // Limite de opções no multi
    if (p.tipo === 'multi' && p.max) {
      box.querySelectorAll('input[type=checkbox]').forEach((cb) => {
        cb.addEventListener('change', () => {
          const marcados = box.querySelectorAll('input:checked').length;
          if (marcados > p.max) { cb.checked = false; $('erro').textContent = 'Escolha no máximo ' + p.max + ' opções.'; }
          else $('erro').textContent = '';
        });
      });
    }
    // Resposta única avança sozinha (menos toque no celular)
    if (p.tipo === 'single') {
      box.querySelectorAll('input[type=radio]').forEach((rd) => {
        rd.addEventListener('change', () => setTimeout(avancar, 180));
      });
    }
    const primeiro = box.querySelector('input:not([type=radio]):not([type=checkbox])');
    if (primeiro && window.innerWidth > 700) primeiro.focus();
  }

  function esc(v) {
    return v == null ? '' : String(v).replace(/"/g, '&quot;');
  }

  function coletar() {
    const lista = visiveis();
    const p = lista[indice];
    const box = $('pergunta');
    if (p.tipo === 'contato') {
      const nome = box.querySelector('[name=nome]').value.trim();
      const email = box.querySelector('[name=email]').value.trim();
      const whats = box.querySelector('[name=whatsapp]').value.replace(/\D/g, '');
      if (nome.length < 2) return 'Digite o seu nome.';
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return 'Confira o seu e-mail.';
      if (whats.length < 10 || whats.length > 13) return 'Digite o WhatsApp com DDD.';
      if (!box.querySelector('[name=consentimento]').checked) return 'Marque a autorização para receber o diagnóstico.';
      Object.assign(respostas, { nome, email, whatsapp: whats, consentimento: true });
    } else if (p.tipo === 'single') {
      const sel = box.querySelector('input:checked');
      if (!sel) return 'Escolha uma opção.';
      const o = opcoesDe(p, respostas).find((op) => String(op.v) === sel.value);
      respostas[p.id] = o ? o.v : sel.value;
    } else if (p.tipo === 'multi') {
      const sel = [...box.querySelectorAll('input:checked')].map((i) => i.value);
      if (!sel.length) return 'Marque pelo menos uma opção.';
      respostas[p.id] = sel;
    } else if (p.tipo === 'money') {
      const n = numero(box.querySelector('input').value);
      if (isNaN(n) || (!p.aceitaZero && n <= 0)) return p.aceitaZero ? 'Digite um valor. Pode ser 0.' : 'Digite um valor.';
      respostas[p.id] = n;
    } else if (p.tipo === 'consent') {
      if (!box.querySelector('input').checked) return 'Marque a autorização para receber o diagnóstico.';
      respostas.consentimento = true;
    }
    return '';
  }

  function avancar() {
    const erro = coletar();
    if (erro) { $('erro').textContent = erro; return; }
    const lista = visiveis();
    if (indice < lista.length - 1) { indice++; render(); }
    else finalizar();
  }

  $('btn-comecar').addEventListener('click', () => { mostrar('tela-form'); render(); });
  $('btn-voltar').addEventListener('click', () => { if (indice > 0) { indice--; render(); } });
  $('form').addEventListener('submit', (e) => { e.preventDefault(); avancar(); });

  function finalizar() {
    if ($('hp').value) return; // robô
    mostrar('tela-gerando');
    setTimeout(() => {
      const d = window.gerarDiagnostico(respostas, F.publico);
      pdfAtual = window.gerarPDF(d);
      const nomeArquivo = 'Diagnostico-Virtus-' + (d.primeiroNome || 'financeiro').normalize('NFD').replace(/[^\w]/g, '') + '.pdf';
      // Envia ANTES de mostrar o resultado e baixar o PDF: no navegador do Instagram, o download
      // ou o clique no WhatsApp tiravam a pessoa da página e cortavam o envio no meio.
      try { envio = enviar(d, nomeArquivo); } catch (e) { console.warn('Falha ao montar o envio', e); }
      mostrarResultado(d, nomeArquivo);
    }, 900);
  }

  let envio = Promise.resolve();
  let enviando = false;
  // Espera o envio terminar (no máximo uns segundos) antes de sair da página
  function esperarEnvio(max) {
    return Promise.race([envio, new Promise((ok) => setTimeout(ok, max))]);
  }
  function segurarSaida(botao) {
    botao.addEventListener('click', (e) => {
      if (!enviando) return;
      e.preventDefault();
      const destino = botao.href, texto = botao.textContent;
      botao.textContent = 'Salvando seu diagnóstico...';
      esperarEnvio(12000).then(() => { botao.textContent = texto; location.href = destino; });
    });
  }
  segurarSaida($('btn-whats'));
  segurarSaida($('btn-whats-topo'));

  function mostrarResultado(d, nomeArquivo) {
    $('res-titulo').textContent = (d.primeiroNome ? d.primeiroNome + ', aqui' : 'Aqui') + ' está o seu retrato financeiro';
    $('res-radar').innerHTML = '<div class="radar-topo"><p class="eyebrow">DIAGNÓSTICO 360</p><p class="nota360"><span>' + d.nota360 + '</span>/100</p></div>' + radarSVG(d.areas);
    $('res-fase').innerHTML = '<p class="eyebrow">SUA FASE · ' + d.fase.numero + ' DE 3</p><h3>' + d.fase.nome + '</h3><p>' + d.fase.texto + '</p>';
    const linha = (a, b, forte) => '<tr' + (forte ? ' class="forte"' : '') + '><td>' + a + '</td><td>' + b + '</td></tr>';
    const comPec = d.ot && d.pecuniaria > 0;
    $('res-projecao').innerHTML =
      '<p class="eyebrow">' + (comPec ? 'COM QUANTO VOCÊ SAI EM ' : 'PROJEÇÃO PARA ') + d.anoFinal + '</p>' +
      '<p class="numero">' + brl(comPec ? d.totalSaida : d.proj.final) + '</p>' +
      '<table class="calc">' +
      linha('Valor inicial', brl(d.patrimonio)) +
      linha('Aporte mensal', brl(d.aporte)) +
      linha('Taxa de juros', pct(d.taxaAnual) + ' ao ano') +
      linha('Período', d.anos + (d.anos === 1 ? ' ano' : ' anos')) +
      linha('Total investido', brl(d.proj.investido)) +
      linha('Total em juros', brl(d.proj.juros)) +
      linha('Valor dos investimentos', brl(d.proj.final), true) +
      (d.sp ? linha('Em dinheiro de hoje (inflação de ' + (d.inflacao * 100).toLocaleString('pt-BR') + '%' + ')', brl(d.projHoje)) : '') +
      (comPec ? linha('+ Pecuniária estimada', brl(d.pecuniaria)) + linha('= Total na saída', brl(d.totalSaida), true) : '') +
      '</table>' +
      (comPec ? '<p class="nota-calc">Pecuniária: ' + d.anosServico + ' anos de serviço × ' + brl(d.baseSoldo) + ' (' + d.basePecuniaria + '). Estimativa com valores de hoje.</p>' : '');
    const p1 = d.pontos[0];
    $('res-ponto').innerHTML = '<p class="eyebrow">PRINCIPAL PONTO DE ATENÇÃO</p><h3>' + p1.titulo + '</h3><p>' + p1.texto + '</p>';
    $('btn-pdf').onclick = () => pdfAtual.save(nomeArquivo);
    $('btn-whats').href = d.whatsPrincipal;
    $('btn-whats-topo').href = d.whatsPrincipal;
    $('res-quem').innerHTML =
      '<div class="quem-topo"><img src="assets/' + (d.ot ? 'renato-farda.jpg' : 'renato.jpg') + '" alt="Renato Colete" width="72" height="72">' +
      '<div><p class="eyebrow">QUEM VAI ANALISAR COM VOCÊ</p><h3>Renato Colete</h3><p>Consultor Virtus · Especialista em Investimentos ANBIMA (CEA) · MBA em Planejamento Financeiro (FGV)</p></div></div>' +
      '<p>Oficial temporário do Exército desde 2019, atendo militares desde 2022. Hoje acompanho mais de 30 famílias, e 5 dos 6 consultores da Virtus são militares ou ex-militares.</p>' +
      '<p><b>Sem comissão de produto, sem multa e sem tempo mínimo.</b> Se usar o primeiro mês e não gostar, o valor volta inteiro.</p>';
    $('res-email').textContent = 'Uma cópia do PDF também vai para ' + respostas.email + '. Se não aparecer, olhe a caixa de spam.';

    // Servidor fora do perfil (filtro da campanha): recebe tudo, menos o convite para a conversa
    if (d.sp && !d.qualificado) {
      $('btn-whats-topo').style.display = 'none';
      if (d.motivoFora === 'renda') {
        $('btn-whats').href = d.instagram;
        $('btn-whats').textContent = 'Seguir @renatocolete no Instagram';
        $('res-quem').innerHTML += '<p>Comece pelo plano de 30 dias que está no PDF. No Instagram eu posto toda semana conta de aposentadoria, PGBL e taxa de investimento pra servidor.</p>';
      } else {
        $('btn-whats').textContent = 'Quando quiser, me chama no WhatsApp';
      }
    }
    mostrar('tela-resultado');
    // O download automático espera o envio: em alguns celulares ele abre o PDF por cima da página
    esperarEnvio(12000).then(() => {
      try { pdfAtual.save(nomeArquivo); } catch (e) { /* o botão continua disponível */ }
    });
  }

  // Gráfico radar do Diagnóstico 360 em SVG (mesmas notas do PDF)
  function radarSVG(areas) {
    const n = areas.length, cx = 190, cy = 150, R = 86;
    const p = (i, raio) => {
      const a = -Math.PI / 2 + (2 * Math.PI * i) / n;
      return [cx + raio * Math.cos(a), cy + raio * Math.sin(a)];
    };
    let s = '<svg viewBox="0 0 380 300" class="radar" role="img" aria-label="Notas do diagnóstico por área">';
    for (let k = 1; k <= 5; k++) {
      s += '<polygon points="' + areas.map((_, i) => p(i, (R * k) / 5).join(',')).join(' ') + '" fill="none" stroke="#2B313A"/>';
    }
    areas.forEach((_, i) => { const q = p(i, R); s += '<line x1="' + cx + '" y1="' + cy + '" x2="' + q[0] + '" y2="' + q[1] + '" stroke="#2B313A"/>'; });
    const pts = areas.map((a, i) => p(i, (R * a.nota) / 10));
    s += '<polygon points="' + pts.map((q) => q.join(',')).join(' ') + '" fill="rgba(0,210,211,.22)" stroke="#00D2D3" stroke-width="2"/>';
    pts.forEach((q) => { s += '<circle cx="' + q[0] + '" cy="' + q[1] + '" r="3" fill="#00D2D3"/>'; });
    areas.forEach((a, i) => {
      const q = p(i, R + 16);
      const anc = Math.abs(q[0] - cx) < 5 ? 'middle' : q[0] > cx ? 'start' : 'end';
      const dy = q[1] < cy - R * 0.5 ? -8 : q[1] > cy + R * 0.5 ? 8 : -2;
      s += '<text x="' + q[0] + '" y="' + (q[1] + dy) + '" text-anchor="' + anc + '" class="rot">' + a.nome + '</text>';
      s += '<text x="' + q[0] + '" y="' + (q[1] + dy + 13) + '" text-anchor="' + anc + '" class="val' + (a.nota <= 4 ? ' baixa' : '') + '">' + a.nota + '/10</text>';
    });
    return s + '</svg>';
  }

  function enviar(d, nomeArquivo) {
    const url = window.CONFIG.scriptUrl;
    if (!url) { console.warn('CONFIG.scriptUrl vazio: respostas não foram salvas.'); return Promise.resolve(); }
    const respostasTexto = {};
    F.perguntas.forEach((p) => {
      const v = respostas[p.id];
      if (p.opcoes && v !== undefined) {
        const lista = Array.isArray(v) ? v : [v];
        respostasTexto[p.id] = lista.map((x) => (opcoesDe(p, respostas).find((o) => String(o.v) === String(x)) || {}).t || x).join(' | ');
      } else if (v !== undefined) respostasTexto[p.id] = v;
    });
    const payload = {
      publico: F.publico,
      nome: respostas.nome, email: respostas.email, whatsapp: respostas.whatsapp,
      respostas: respostasTexto,
      resumo: {
        fase: d.fase.numero + ' - ' + d.fase.nome,
        nota360: d.nota360,
        pecuniaria: Math.round(d.pecuniaria || 0),
        totalSaida: Math.round(d.totalSaida || 0),
        investimentos: Math.round(d.proj.final),
        areas: d.areas.map((a) => a.nome + ' ' + a.nota).join(' | '),
        renda: d.renda, aporte: d.aporte, patrimonio: d.patrimonio, cartao: d.cartao,
        bruto: d.bruto || '', lacunaTeto: Math.round(d.lacunaTeto || 0), limitePGBL: Math.round(d.limitePGBL || 0),
        qualificado: d.sp ? (d.qualificado ? 'Sim' : 'Não') : '', motivoFora: d.motivoForaTexto || '',
        projecao: Math.round(d.proj.final), anoFinal: d.anoFinal,
        pontos: d.pontos.map((p) => p.titulo).join(' | '),
      },
      pdfBase64: pdfAtual.output('datauristring').split(',')[1],
      arquivo: nomeArquivo,
      origem: location.href,
    };
    const corpo = JSON.stringify(payload);
    const tentar = () => fetch(url, { method: 'POST', mode: 'no-cors', headers: { 'Content-Type': 'text/plain;charset=utf-8' }, body: corpo });
    enviando = true;
    // Se a internet do celular falhar, tenta de novo uma vez
    return tentar()
      .catch(() => new Promise((ok) => setTimeout(ok, 1500)).then(tentar))
      .catch((e) => console.warn('Falha ao enviar respostas', e))
      .finally(() => { enviando = false; });
  }
})();
