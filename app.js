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
    $('btn-avancar').textContent = p.tipo === 'consent' ? 'Gerar meu diagnóstico' : 'Continuar';

    const box = $('pergunta');
    let html = '<h2>' + p.titulo + '</h2>';
    if (p.ajuda) html += '<p class="ajuda">' + p.ajuda + '</p>';

    if (p.tipo === 'contato') {
      html +=
        '<label class="campo">Nome<input name="nome" autocomplete="name" required value="' + esc(respostas.nome) + '"></label>' +
        '<label class="campo">E-mail<input name="email" type="email" inputmode="email" autocomplete="email" required value="' + esc(respostas.email) + '"></label>' +
        '<label class="campo">WhatsApp com DDD<input name="whatsapp" type="tel" inputmode="tel" autocomplete="tel" placeholder="(67) 99999-9999" required value="' + esc(respostas.whatsapp) + '"></label>';
    } else if (p.tipo === 'single' || p.tipo === 'multi') {
      const tipoInput = p.tipo === 'single' ? 'radio' : 'checkbox';
      const atual = respostas[p.id];
      html += '<div class="opcoes' + (p.colunas ? ' colunas-' + p.colunas : '') + '">';
      p.opcoes.forEach((o) => {
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
      Object.assign(respostas, { nome, email, whatsapp: whats });
    } else if (p.tipo === 'single') {
      const sel = box.querySelector('input:checked');
      if (!sel) return 'Escolha uma opção.';
      const o = p.opcoes.find((op) => String(op.v) === sel.value);
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
      mostrarResultado(d, nomeArquivo);
      enviar(d, nomeArquivo);
    }, 900);
  }

  function mostrarResultado(d, nomeArquivo) {
    $('res-titulo').textContent = (d.primeiroNome ? d.primeiroNome + ', aqui' : 'Aqui') + ' está o seu retrato financeiro';
    $('res-fase').innerHTML = '<p class="eyebrow">SUA FASE · ' + d.fase.numero + ' DE 3</p><h3>' + d.fase.nome + '</h3><p>' + d.fase.texto + '</p>';
    $('res-projecao').innerHTML = '<p class="eyebrow">PROJEÇÃO PARA ' + d.anoFinal + '</p><p class="numero">' + brl(d.proj.final) + '</p><p>Investindo ' + brl(d.aporte) + ' por mês, com ' + pct(d.taxaAnual) + ' ao ano. O detalhe está no PDF.</p>';
    const p1 = d.pontos[0];
    $('res-ponto').innerHTML = '<p class="eyebrow">PRINCIPAL PONTO DE ATENÇÃO</p><h3>' + p1.titulo + '</h3><p>' + p1.texto + '</p>';
    $('btn-pdf').onclick = () => pdfAtual.save(nomeArquivo);
    $('btn-whats').href = 'https://wa.me/' + window.CONFIG.whatsapp + '?text=' + encodeURIComponent('Oi Renato, sou ' + d.primeiroNome + ', recebi meu diagnóstico e quero conversar.');
    $('res-email').textContent = 'Uma cópia do PDF também vai para ' + respostas.email + '. Se não aparecer, olhe a caixa de spam.';
    mostrar('tela-resultado');
    try { pdfAtual.save(nomeArquivo); } catch (e) { /* o botão continua disponível */ }
  }

  function enviar(d, nomeArquivo) {
    const url = window.CONFIG.scriptUrl;
    if (!url) { console.warn('CONFIG.scriptUrl vazio: respostas não foram salvas.'); return; }
    const respostasTexto = {};
    F.perguntas.forEach((p) => {
      const v = respostas[p.id];
      if (p.opcoes && v !== undefined) {
        const lista = Array.isArray(v) ? v : [v];
        respostasTexto[p.id] = lista.map((x) => (p.opcoes.find((o) => String(o.v) === String(x)) || {}).t || x).join(' | ');
      } else if (v !== undefined) respostasTexto[p.id] = v;
    });
    const payload = {
      publico: F.publico,
      nome: respostas.nome, email: respostas.email, whatsapp: respostas.whatsapp,
      respostas: respostasTexto,
      resumo: {
        fase: d.fase.numero + ' - ' + d.fase.nome,
        renda: d.renda, aporte: d.aporte, patrimonio: d.patrimonio, cartao: d.cartao,
        projecao: Math.round(d.proj.final), anoFinal: d.anoFinal,
        pontos: d.pontos.map((p) => p.titulo).join(' | '),
      },
      pdfBase64: pdfAtual.output('datauristring').split(',')[1],
      arquivo: nomeArquivo,
      origem: location.href,
    };
    fetch(url, { method: 'POST', mode: 'no-cors', headers: { 'Content-Type': 'text/plain;charset=utf-8' }, body: JSON.stringify(payload) })
      .catch((e) => console.warn('Falha ao enviar respostas', e));
  }
})();
