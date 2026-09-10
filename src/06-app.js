<script>
/* ══════════════════════════════════════════════════════════════════════
   Homeostudy — motor do site
   ══════════════════════════════════════════════════════════════════════ */

const main = document.getElementById('main');
const nav  = document.getElementById('nav');
const esc  = s => String(s).replace(/[&<>"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const norm = s => String(s).toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');

const ORDEM = ['pequenos-grupos','anatomia','histologia','grandes-grupos','bioquimica'];
const MATS  = ORDEM.filter(k => window.MATERIAL && MATERIAL[k]);
const RESUMO = {
  'pequenos-grupos':'As apresentações dos seus grupos, tema a tema, na ordem da programação da UC.',
  'anatomia':'Integração morfofuncional: da organização dos tecidos aos grandes sistemas.',
  'histologia':'Laboratório morfofuncional — o tecido visto de perto, sistema por sistema.',
  'grandes-grupos':'As aulas expositivas: homeostase, endócrino, cardiovascular e digestório.',
  'bioquimica':'pH, equilíbrio ácido-base, lipídios e urinálise — com a lista de exercícios da disciplina.'
};
const ABAS = [{id:'conteudo', rot:'Conteúdo'}, {id:'exercicios', rot:'Exercícios'}];
const GRUPOS = [{id:'material', rot:'Do material'}, {id:'internet', rot:'Da internet'}, {id:'ia', rot:'Geradas por IA'}];

let state = {v:'inicio', m:null, a:null, aba:'conteudo', g:'material'};

const aulaDe = (m, s) => (MATERIAL[m] ? MATERIAL[m].aulas.find(a => a.slug === s) : null);
const exDe   = (m, s) => (window.EX || {})[m + '/' + s] || null;
const qtdEx  = (m, s) => { const e = exDe(m, s); return e ? (e.material || []).length + (e.internet || []).length + (e.ia || []).length : 0; };

/* ─── progresso salvo no navegador ───────────────────────────────────── */
const CHAVE = 'homeostudy:v1';
let prog = {};
try { prog = JSON.parse(localStorage.getItem(CHAVE) || '{}'); } catch (e) { prog = {}; }
function salvar(){ try { localStorage.setItem(CHAVE, JSON.stringify(prog)); } catch (e) {} }

/* ─── tema ───────────────────────────────────────────────────────────── */
const root = document.documentElement;
document.getElementById('themeBtn').addEventListener('click', () => {
  const escuro = root.getAttribute('data-theme') === 'dark' ||
    (!root.getAttribute('data-theme') && matchMedia('(prefers-color-scheme: dark)').matches);
  root.setAttribute('data-theme', escuro ? 'light' : 'dark');
});

/* ─── rotas ──────────────────────────────────────────────────────────── */
function hashDe(s){
  if(s.v === 'inicio') return '#inicio';
  if(s.v === 'perguntar') return '#perguntar';
  if(s.v === 'materia') return '#m/' + s.m;
  if(s.v === 'simulado') return '#sim/' + s.m;
  return '#a/' + s.m + '/' + s.a + '/' + s.aba + (s.aba === 'exercicios' ? '/' + s.g : '');
}
function lerHash(){
  const p = location.hash.replace(/^#/, '').split('/').filter(Boolean);
  if(!p.length || p[0] === 'inicio'){ state = {v:'inicio', m:null, a:null, aba:'conteudo', g:'material'}; return; }
  if(p[0] === 'perguntar'){ state = {...state, v:'perguntar'}; return; }
  if(p[0] === 'm' && MATS.includes(p[1])){ state = {v:'materia', m:p[1], a:null, aba:'conteudo', g:'material'}; return; }
  if(p[0] === 'sim' && MATS.includes(p[1])){ state = {v:'simulado', m:p[1], a:null, aba:'conteudo', g:'material'}; return; }
  if(p[0] === 'a' && MATS.includes(p[1]) && aulaDe(p[1], p[2])){
    const aba = ABAS.some(x => x.id === p[3]) ? p[3] : 'conteudo';
    const g = GRUPOS.some(x => x.id === p[4]) ? p[4] : 'material';
    state = {v:'aula', m:p[1], a:p[2], aba, g};
    return;
  }
  state = {v:'inicio', m:null, a:null, aba:'conteudo', g:'material'};
}
function ir(patch){ location.hash = hashDe({...state, ...patch}); }
addEventListener('hashchange', () => { lerHash(); render(); });

document.addEventListener('click', e => {
  const b = e.target.closest('[data-ir]');
  if(!b) return;
  e.preventDefault();
  ir(JSON.parse(b.dataset.ir));
});

/* ─── navegação ──────────────────────────────────────────────────────── */
function renderNav(){
  const itens = [{k:'inicio', rot:'Início'}]
    .concat(MATS.map(k => ({k, rot:MATERIAL[k].nome})))
    .concat([{k:'perguntar', rot:'Tira-dúvidas', ask:true}]);
  nav.innerHTML = itens.map(i => {
    const atual = (i.k === 'inicio' && state.v === 'inicio')
      || (i.k === 'perguntar' && state.v === 'perguntar')
      || (state.m === i.k);
    const alvo = i.k === 'inicio' ? {v:'inicio'} : i.k === 'perguntar' ? {v:'perguntar'} : {v:'materia', m:i.k};
    return `<button data-ir='${JSON.stringify(alvo)}'${i.ask ? ' class="is-ask"' : ''} aria-current="${atual}">${esc(i.rot)}</button>`;
  }).join('');
}

/* ═══ INÍCIO ══════════════════════════════════════════════════════════ */
function viewInicio(){
  return `<div class="view">
    <section class="hero">
      <canvas id="trace" aria-hidden="true"></canvas>
      <div class="wrap hero-in">
        <span class="eyebrow">Regulação e funcionamento do organismo</span>
        <h1>Tudo que o corpo faz para <em>não mudar</em>.</h1>
        <div class="citacao">
          <blockquote>Estudar o fenômeno da doença sem livros é navegar num mar sem cartas; estudar livros sem pacientes é nunca sair para o mar.</blockquote>
          <cite>William Osler<span>Pai da medicina moderna à beira do leito, 1849–1919</span></cite>
        </div>
      </div>
    </section>
    <section class="wrap sec">
      <div class="sec-head"><h2>Escolha a matéria</h2><span class="kicker">Conteúdo + exercícios em cada aula</span></div>
      <div class="grid-mat stagger">
        ${MATS.map(k => {
          const d = MATERIAL[k];
          const n = d.aulas.filter(a => !a.incompleto).length;
          const q = d.aulas.reduce((s, a) => s + qtdEx(k, a.slug), 0);
          return `<button class="matcard" data-ir='${JSON.stringify({v:'materia', m:k})}'>
            <span class="num">${n} aula${n > 1 ? 's' : ''} · ${q} questões</span>
            <h3>${esc(d.nome)}</h3>
            <p>${esc(RESUMO[k] || '')}</p>
            <span class="go">Abrir <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M13 6l6 6-6 6"/></svg></span>
          </button>`;
        }).join('')}
      </div>
    </section>
    <section class="wrap sec" style="padding-top:0">
      <div class="ex-intro pk">
        <span class="ico"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M9.1 9a3 3 0 1 1 4.4 2.6c-.8.5-1.5 1.1-1.5 2.1M12 17.5h.01"/><circle cx="12" cy="12" r="9.5"/></svg></span>
        <div class="tx">
          <h3>Ficou com dúvida em alguma aula?</h3>
          <p>O <b>tira-dúvidas</b> lê o conteúdo da aula que você escolher e responde em português, usando os valores e as definições do próprio material. Ele é um extra: todo o resto do site — conteúdo, figuras, exercícios, dicas e correções — funciona sem depender dele e sem nenhum login.</p>
        </div>
      </div>
      <button class="matcard" data-ir='{"v":"perguntar"}' style="max-width:400px">
        <h3>Abrir o tira-dúvidas</h3>
        <span class="go">Fazer uma pergunta <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M13 6l6 6-6 6"/></svg></span>
      </button>
    </section>
  </div>`;
}

/* ═══ MATÉRIA ═════════════════════════════════════════════════════════ */
function viewMateria(){
  const d = MATERIAL[state.m];
  const ok = d.aulas.filter(a => !a.incompleto);
  const ruins = d.aulas.filter(a => a.incompleto);
  const linha = (a, i) => {
    const q = qtdEx(state.m, a.slug);
    return `<button class="aula" data-ir='${JSON.stringify({v:'aula', m:state.m, a:a.slug, aba:'conteudo'})}'>
      <span class="n">${String(i + 1).padStart(2, '0')}</span>
      <span class="tx">
        <h3>${esc(a.titulo)}</h3>
        ${a.tema ? `<span class="sub">${esc(a.tema)}</span>` : ''}
      </span>
      <span class="meta"><b>${a.paginas}</b> pág · <b>${a.figuras.length}</b> fig${q ? ` · <b>${q}</b> questões` : ''}</span>
    </button>`;
  };
  return `<div class="view">
    <section class="mhead"><span class="mhead-glow"></span>
      <div class="wrap mhead-in" style="padding-bottom:30px">
        <div class="crumb"><button data-ir='{"v":"inicio"}'>Início</button> <span>›</span> <span>${esc(d.nome)}</span></div>
        <h1>${esc(d.nome)}</h1>
        <p>${esc(RESUMO[state.m] || '')}</p>
      </div>
    </section>
    <section class="wrap sec">
      <div class="sec-head"><h2>Aulas</h2><span class="kicker">${ok.length} disponíveis</span></div>
      <div class="aulas stagger">${ok.map(linha).join('')}</div>
      ${cartaoSimulado()}
      ${ruins.length ? `
        <div class="sec-head" style="margin-top:38px"><h2 style="font-size:20px">PDFs incompletos</h2><span class="kicker">${ruins.length} arquivos</span></div>
        <p style="font-size:15px; color:var(--ink-3); max-width:70ch; margin-bottom:14px">Estes PDFs têm só 2 a 4 páginas e nenhum texto — provavelmente o download do Canva salvou apenas a capa. Baixe de novo e substitua o arquivo na pasta para eles entrarem no site.</p>
        <div class="aulas">${ruins.map(a => `<div class="aula off">
          <span class="n">—</span>
          <span class="tx"><h3>${esc(a.titulo)}</h3><span class="sub">${esc(a.arquivo)}</span></span>
          <span class="meta">${a.paginas} pág · sem texto</span>
        </div>`).join('')}</div>` : ''}
    </section>
  </div>`;
}

/* ═══ SIMULADO DA MATÉRIA ═════════════════════════════════════════════ */
const simDe = m => (window.SIM || {})[m] || null;

function cartaoSimulado(){
  const qs = simDe(state.m);
  if(!qs || !qs.length) return '';
  const me = qs.filter(q => q.t !== 'ab').length, ab = qs.length - me;
  return `<button class="simcard" data-ir='${JSON.stringify({v:'simulado', m:state.m})}'>
    <span class="ico"><svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M9 11l2 2 4-4"/><path d="M16 3h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h2"/><rect x="9" y="1.6" width="6" height="3.6" rx="1"/></svg></span>
    <span class="tx">
      <h3>Simulado de ${esc(MATERIAL[state.m].nome)}</h3>
      <p>${qs.length} questões geradas por IA cobrindo todas as aulas da matéria — ${me} de múltipla escolha e ${ab} abertas, com dica e correção.</p>
    </span>
    <span class="go">Começar <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M13 6l6 6-6 6"/></svg></span>
  </button>`;
}

function viewSimulado(){
  const d = MATERIAL[state.m], qs = simDe(state.m) || [];
  const me = qs.filter(q => q.t !== 'ab').length;
  const chave = 'sim/' + state.m;
  return `<div class="view">
    <section class="mhead"><span class="mhead-glow"></span>
      <div class="wrap mhead-in" style="padding-bottom:30px">
        <div class="crumb">
          <button data-ir='{"v":"inicio"}'>Início</button> <span>›</span>
          <button data-ir='${JSON.stringify({v:'materia', m:state.m})}'>${esc(d.nome)}</button> <span>›</span> <span>Simulado</span>
        </div>
        <h1>Simulado de ${esc(d.nome)}</h1>
        <p>${qs.length} questões que atravessam todas as aulas da matéria: ${me} de múltipla escolha e ${qs.length - me} abertas. Cada uma tem dica e gabarito comentado; as abertas são corrigidas ponto a ponto.</p>
      </div>
    </section>
    <div class="wrap" style="padding-block:26px 50px">
      ${qs.length ? placar(chave, qs) + qs.map((q, i) => cartao(q, chave, i)).join('')
        : '<div class="empty"><h3>Simulado ainda não gerado para esta matéria</h3></div>'}
    </div>
  </div>`;
}

/* ═══ AULA ════════════════════════════════════════════════════════════ */
function viewAula(){
  const d = MATERIAL[state.m], a = aulaDe(state.m, state.a);
  const q = qtdEx(state.m, state.a);
  const cab = `<section class="mhead"><span class="mhead-glow"></span>
    <div class="wrap mhead-in">
      <div class="crumb">
        <button data-ir='{"v":"inicio"}'>Início</button> <span>›</span>
        <button data-ir='${JSON.stringify({v:'materia', m:state.m})}'>${esc(d.nome)}</button>
      </div>
      <h1>${esc(a.titulo)}</h1>
      <p>${esc(a.tema || '')}${a.tema ? ' · ' : ''}${a.paginas} páginas · ${a.figuras.length} figuras do material</p>
      <nav class="segs" aria-label="Seções da aula">
        ${ABAS.map(s => `<button data-ir='${JSON.stringify({v:'aula', m:state.m, a:state.a, aba:s.id})}' aria-current="${state.aba === s.id}">${esc(s.rot)}${s.id === 'exercicios' && q ? `<span class="cnt">${q}</span>` : ''}</button>`).join('')}
      </nav>
    </div>
  </section>`;
  return `<div class="view">${cab}${state.aba === 'conteudo' ? conteudoAula(a) : exerciciosAula(a)}</div>`;
}

/* ─── conteúdo da aula ───────────────────────────────────────────────── */
function conteudoAula(a){
  const porPag = {};
  a.figuras.forEach(f => { (porPag[f.pag] = porPag[f.pag] || []).push(f); });

  let html = '', usadas = new Set(), ultima = 0, idx = 0;
  const galeria = fs => `<div class="figs-lab">Figuras do material · página ${fs[0].pag}</div>
    <div class="figs">${fs.map(f => `<button class="figbox" data-fig="${f.i}">
      <img src="${f.src}" alt="${esc(f.leg)}" loading="lazy" width="${f.w}" height="${f.h}">
      <figcaption><b>${esc(f.leg)}</b>Página ${f.pag} do PDF original</figcaption>
    </button>`).join('')}</div>`;

  a.figuras.forEach((f, i) => { f.i = i; });

  a.secoes.forEach(s => {
    if(s.p > ultima){
      for(let p = ultima; p < s.p; p++){
        if(porPag[p] && !usadas.has(p)){ usadas.add(p); html += galeria(porPag[p]); }
      }
      ultima = s.p;
    }
    if(s.h) html += `<h2 class="block-h" id="s${idx}"><span class="pag">p.${s.p}</span>${esc(s.h)}</h2>`;
    (s.b || []).forEach(b => {
      if(b.t === 'p') html += `<p>${esc(b.x)}</p>`;
      else if(b.t === 'ul') html += `<ul>${b.x.map(i => `<li>${esc(i)}</li>`).join('')}</ul>`;
    });
    if(s.h) idx++;
  });
  Object.keys(porPag).map(Number).sort((x, y) => x - y).forEach(p => {
    if(!usadas.has(p)){ usadas.add(p); html += galeria(porPag[p]); }
  });

  if(!a.secoes.length && !a.figuras.length){
    html = `<div class="empty"><h3>Este PDF não trouxe texto nem figuras</h3><p>Provavelmente o download saiu incompleto. Baixe de novo e substitua o arquivo na pasta da matéria.</p></div>`;
  } else if(!a.secoes.length){
    html = `<div class="ex-intro al"><span class="ico"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M12 8.5v5M12 17h.01"/><circle cx="12" cy="12" r="9.5"/></svg></span>
      <div class="tx"><h3>Material sem texto selecionável</h3><p>Este PDF é composto por imagens (slides digitalizados ou fotos de aula), então não há texto para transcrever. As páginas estão abaixo, na resolução original.</p></div></div>` + html;
  }

  // sumário: um item por título, sem repetir texto e sem passar de 26 linhas
  const titulos = [], vistos = new Set();
  let k = 0;
  a.secoes.forEach(s => {
    if(!s.h) return;
    const chave = norm(s.h);
    if(chave.length > 2 && !vistos.has(chave)){ vistos.add(chave); titulos.push({i:k, h:s.h}); }
    k++;
  });
  const passo = Math.max(1, Math.ceil(titulos.length / 26));
  const toc = titulos.filter((_, i) => i % passo === 0);

  return `<div class="wrap doc-layout">
    <article class="doc">${html}</article>
    ${toc.length > 2 ? `<aside class="toc"><div class="tlab">Nesta aula</div>
      ${toc.map(t => `<a href="#s${t.i}" data-toc="s${t.i}" title="${esc(t.h)}">${esc(t.h)}</a>`).join('')}
    </aside>` : ''}
  </div>`;
}

/* ─── exercícios ─────────────────────────────────────────────────────── */
function exerciciosAula(a){
  const ex = exDe(state.m, state.a);
  const cont = g => (ex && ex[g] ? ex[g].length : 0);
  const pills = `<div class="wrap"><div class="pills">${GRUPOS.map(g =>
    `<button data-ir='${JSON.stringify({v:'aula', m:state.m, a:state.a, aba:'exercicios', g:g.id})}' aria-current="${state.g === g.id}">${esc(g.rot)}<span class="cnt">${cont(g.id)}</span></button>`
  ).join('')}</div></div>`;

  if(!ex) return pills + `<div class="wrap" style="padding-bottom:50px">${semExercicios(a)}</div>`;
  const qs = ex[state.g] || [];
  let topo = '';

  if(state.g === 'material'){
    topo = qs.length
      ? `<div class="ex-intro al"><span class="ico"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M12 8.5v5M12 17h.01"/><circle cx="12" cy="12" r="9.5"/></svg></span>
          <div class="tx"><h3>Questões do próprio material</h3><p>${ex.avisoMaterial || 'Questões transcritas do PDF desta aula.'}</p></div></div>`
      : semExercicios(a);
  } else if(state.g === 'internet'){
    topo = `<div class="ex-intro"><span class="ico"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="9.5"/><path d="M2.5 12h19M12 2.5c2.5 2.7 3.8 6 3.8 9.5s-1.3 6.8-3.8 9.5c-2.5-2.7-3.8-6-3.8-9.5S9.5 5.2 12 2.5Z"/></svg></span>
        <div class="tx"><h3>No formato dos bancos públicos</h3><p>Questões <b>adaptadas</b> do estilo de vestibulares, concursos e provas de residência sobre este assunto. Não são cópias de provas oficiais — os enunciados originais estão nos bancos listados abaixo, e vale resolver as versões completas por lá.</p></div></div>
      ${fontesHtml(ex.fontes)}`;
  } else {
    topo = `<div class="ex-intro pk"><span class="ico"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3l1.9 4.6L18.5 9.5l-4.6 1.9L12 16l-1.9-4.6L5.5 9.5l4.6-1.9L12 3ZM18 15l.9 2.1 2.1.9-2.1.9L18 21l-.9-2.1-2.1-.9 2.1-.9L18 15Z"/></svg></span>
        <div class="tx"><h3>Questões inéditas para este conteúdo</h3><p>Escritas para cobrir os raciocínios desta aula — cálculo, mecanismo e pegadinha clássica. Todas têm <b>dica</b> e comentário do gabarito; as abertas são corrigidas por critérios, ponto a ponto.</p></div></div>`;
  }

  const chave = state.m + '/' + state.a + '/' + state.g;
  return pills + `<div class="wrap" style="padding-bottom:50px">
    ${topo}
    ${qs.length ? placar(chave, qs) + `<div>${qs.map((q, i) => cartao(q, chave, i)).join('')}</div>` : ''}
  </div>`;
}

function semExercicios(a){
  return `<div class="empty">
    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6Z"/><path d="M14 2v6h6M9 14h6M9 18h4"/></svg>
    <h3>Esta aula não trouxe exercícios no PDF</h3>
    <p>O arquivo <b>${esc(a.arquivo)}</b> não tem questões — só conteúdo. Se a professora passar uma lista depois, ela entra aqui exatamente como está no original.</p>
    <div class="how"><p>Enquanto isso</p><ol>
      <li>Use as abas <b>Da internet</b> e <b>Geradas por IA</b>, que cobrem o mesmo assunto.</li>
      <li>Ou peça questões novas no <b>tira-dúvidas</b>, escolhendo esta aula como contexto.</li>
    </ol></div>
  </div>`;
}

function fontesHtml(k){
  const f = (window.FONTES || {})[k];
  if(!f) return '';
  return `<div class="sources"><h4>Onde encontrar as questões originais</h4>
    <p>Bancos públicos com questões deste assunto, com gabarito.</p>
    <ul>${f.map(s => `<li><a href="${esc(s.u)}" target="_blank" rel="noopener">
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M14 4h6v6M20 4l-9 9M18 13v6a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h6"/></svg>
      ${esc(s.t)}<span class="dom">${esc(s.d)}</span></a></li>`).join('')}</ul></div>`;
}

/* ─── placar e cartões ───────────────────────────────────────────────── */
const LETRAS = ['A','B','C','D','E'];

function placar(chave, qs){
  const p = prog[chave] || {certas:0, feitas:0};
  return `<div class="score" data-score="${chave}">
    <span class="lab">Acertos</span>
    <span class="sc"><span data-sc-c>${p.certas}</span> / <span data-sc-t>${p.feitas}</span></span>
    <span class="track"><i data-sc-bar style="width:${p.feitas ? (p.certas / p.feitas * 100) : 0}%"></i></span>
    <span class="lab">${qs.length} questões</span>
    <button data-reset="${chave}">Recomeçar</button>
  </div>`;
}

function cartao(q, chave, i){
  const tag = q.t === 'ab' ? '<span class="q-tag">Questão aberta</span>' : '';
  const fonte = q.f ? `<span class="q-src">${esc(q.f)}</span>` : '<span class="q-src">Questão inédita · Homeostudy</span>';
  const corpo = q.t === 'ab'
    ? `<textarea class="resp" data-resp placeholder="Escreva sua resposta com suas palavras. Depois clique em Corrigir — o site confere ponto a ponto e mostra o gabarito." aria-label="Sua resposta"></textarea>
       <div class="qbar">
         <button class="btn pri" data-corrigir>Corrigir minha resposta</button>
         ${q.d ? '<button class="btn" data-dica>Pedir dica</button>' : ''}
         <button class="btn" data-gabarito>Ver gabarito</button>
       </div>`
    : `<div class="alts">${q.a.map((t, j) => `<button class="alt" data-alt="${j}"><span class="l">${LETRAS[j]}</span><span>${esc(t)}</span></button>`).join('')}</div>
       ${q.d ? '<div class="qbar"><button class="btn" data-dica>Pedir dica</button></div>' : ''}`;
  return `<article class="q" data-q="${chave}:${i}">
    <div class="q-top"><span class="q-n">Q${String(i + 1).padStart(2, '0')}</span>${tag}${fonte}</div>
    <p class="q-stem">${q.e}</p>
    ${corpo}
  </article>`;
}

function acharQ(chave, i){
  if(chave.startsWith('sim/')) return (simDe(chave.slice(4)) || [])[i];
  const [m, s, g] = chave.split('/');
  const ex = exDe(m, s);
  return ex ? (ex[g] || [])[i] : null;
}

function pontuar(chave, certo){
  const p = prog[chave] = prog[chave] || {certas:0, feitas:0};
  p.feitas++; if(certo) p.certas++;
  salvar();
  const barra = document.querySelector(`[data-score="${chave}"]`);
  if(barra){
    barra.querySelector('[data-sc-c]').textContent = p.certas;
    barra.querySelector('[data-sc-t]').textContent = p.feitas;
    barra.querySelector('[data-sc-bar]').style.width = (p.certas / p.feitas * 100) + '%';
  }
}

function mostrarDica(card, q){
  if(card.querySelector('.dica')) return;
  const el = document.createElement('div');
  el.className = 'dica';
  el.innerHTML = `<span class="lab">Dica</span>${q.d}`;
  const barra = card.querySelector('.qbar');
  barra ? barra.after(el) : card.appendChild(el);
}

function mostrarGabarito(card, q, nota){
  if(card.querySelector('.gab')) return;
  const el = document.createElement('div');
  el.className = 'gab';
  el.innerHTML = `<span class="lab">Gabarito${nota ? ' comentado' : ''}</span>${q.g}`;
  card.appendChild(el);
}

/* corrige questão aberta comparando com os critérios esperados */
function corrigirAberta(card, q){
  const ta = card.querySelector('[data-resp]');
  const txt = norm(ta.value);
  if(txt.trim().length < 12){
    ta.focus();
    ta.style.borderColor = 'var(--crit)';
    setTimeout(() => { ta.style.borderColor = ''; }, 1400);
    return;
  }
  if(card.querySelector('.crits')) return;
  const res = q.c.map(c => ({p:c.p, hit:c.k.some(k => txt.includes(norm(k)))}));
  const acertos = res.filter(r => r.hit).length;

  const box = document.createElement('div');
  box.className = 'crits';
  box.innerHTML = res.map(r => `<div class="crit ${r.hit ? 'hit' : 'miss'}">
      <span class="mk">${r.hit ? '✓' : '·'}</span><span>${esc(r.p)}</span></div>`).join('')
    + `<div class="nota">${acertos} de ${res.length} <span>pontos esperados</span></div>`;
  card.querySelector('.qbar').after(box);

  ta.disabled = true;
  card.querySelector('[data-corrigir]').disabled = true;
  mostrarGabarito(card, q, true);
  pontuar(card.dataset.q.split(':')[0], acertos >= Math.ceil(res.length * 0.6));
}

main.addEventListener('click', e => {
  const reset = e.target.closest('[data-reset]');
  if(reset){ delete prog[reset.dataset.reset]; salvar(); render(); return; }

  const fig = e.target.closest('[data-fig]');
  if(fig){ abrirFig(+fig.dataset.fig); return; }

  const card = e.target.closest('.q');
  if(!card) return;
  const [chave, idx] = card.dataset.q.split(':');
  const q = acharQ(chave, +idx);
  if(!q) return;

  if(e.target.closest('[data-dica]')){ mostrarDica(card, q); return; }
  if(e.target.closest('[data-corrigir]')){ corrigirAberta(card, q); return; }
  if(e.target.closest('[data-gabarito]')){
    const ta = card.querySelector('[data-resp]');
    if(ta) ta.disabled = true;
    card.querySelector('[data-corrigir]').disabled = true;
    mostrarGabarito(card, q, false);
    return;
  }

  const alt = e.target.closest('.alt');
  if(!alt || alt.disabled) return;
  const escolhida = +alt.dataset.alt, certo = escolhida === q.ok;
  card.querySelectorAll('.alt').forEach((b, j) => {
    b.disabled = true;
    if(j === q.ok) b.classList.add('right');
    else if(j === escolhida) b.classList.add('wrong', 'shake');
    else b.classList.add('dim');
  });
  const dicaBtn = card.querySelector('[data-dica]');
  if(dicaBtn) dicaBtn.disabled = true;
  const box = document.createElement('div');
  box.className = 'expl';
  box.innerHTML = `<span class="lab">${certo ? 'Isso mesmo' : 'Resposta certa: ' + LETRAS[q.ok]}</span>${q.w}`;
  card.appendChild(box);
  pontuar(chave, certo);
});

/* ─── lightbox das figuras ───────────────────────────────────────────── */
function abrirFig(i){
  const a = aulaDe(state.m, state.a);
  const f = a.figuras[i];
  if(!f) return;
  const el = document.createElement('div');
  el.className = 'lbox';
  el.innerHTML = `<button class="x" aria-label="Fechar"><svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><path d="M6 6l12 12M18 6L6 18"/></svg></button>
    <div style="display:grid; justify-items:center"><img src="${f.src}" alt="${esc(f.leg)}">
    <p class="cap">${esc(f.leg)} · página ${f.pag} do PDF original</p></div>`;
  el.addEventListener('click', ev => { if(ev.target === el || ev.target.closest('.x')) el.remove(); });
  document.body.appendChild(el);
  const fechar = ev => { if(ev.key === 'Escape'){ el.remove(); removeEventListener('keydown', fechar); } };
  addEventListener('keydown', fechar);
}

/* ═══ TIRA-DÚVIDAS ════════════════════════════════════════════════════ */
let sampleNS, tentado = false, escopo = null, historico = [];

const SUGESTOES = [
  'Explica esse conteúdo como se eu tivesse 10 anos, e depois do jeito que cai na prova.',
  'Faz um resumo dos 10 pontos mais importantes desta aula.',
  'Me faz 3 questões difíceis sobre isso e corrige depois que eu responder.',
  'Quais são as pegadinhas clássicas de prova neste assunto?',
  'Monta um mnemônico para eu decorar isso.'
];

function todasAulas(){
  const out = [];
  MATS.forEach(k => MATERIAL[k].aulas.forEach(a => {
    if(!a.incompleto && a.secoes.length) out.push({k, slug:a.slug, rot:MATERIAL[k].nome + ' · ' + a.titulo});
  }));
  return out;
}

function textoDaAula(k, slug){
  const a = aulaDe(k, slug);
  if(!a) return '';
  const L = [`MATÉRIA: ${MATERIAL[k].nome}`, `AULA: ${a.titulo}`, ''];
  a.secoes.forEach(s => {
    if(s.h) L.push('\n## ' + s.h);
    (s.b || []).forEach(b => {
      if(b.t === 'p') L.push(b.x);
      else if(b.t === 'ul') b.x.forEach(i => L.push('- ' + i));
    });
  });
  return L.join('\n').slice(0, 24000);
}

function viewPerguntar(){
  const lista = todasAulas();
  if(!escopo && lista.length) escopo = lista[0].k + '/' + lista[0].slug;
  return `<div class="view wrap ask-wrap">
    <div class="ask-head">
      <span class="kicker">Tira-dúvidas</span>
      <h1>Pergunte, que eu explico com o material da aula.</h1>
      <p>Escolha a aula para dar contexto e pergunte em português. É um recurso extra — se ele não estiver disponível na sua visualização, todo o resto do site continua funcionando.</p>
      <div class="scope">
        <span class="lab">Contexto</span>
        <select id="escopo" aria-label="Aula de contexto">
          ${lista.map(a => `<option value="${a.k}/${a.slug}"${escopo === a.k + '/' + a.slug ? ' selected' : ''}>${esc(a.rot)}</option>`).join('')}
        </select>
      </div>
    </div>
    <div id="askOff"></div>
    <div class="chat">
      <div class="msgs" id="msgs">${historico.length ? historico.map(balao).join('') : balaoVazio()}</div>
      <form class="composer" id="askForm">
        <textarea id="askIn" rows="1" placeholder="Ex.: por que a PaCO₂ manda mais na ventilação do que a PaO₂?" aria-label="Sua pergunta"></textarea>
        <button class="send" type="submit" aria-label="Enviar pergunta">
          <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 12h15M13 5l7 7-7 7"/></svg>
        </button>
      </form>
    </div>
  </div>`;
}

const balaoVazio = () => `<div class="ask-empty"><p>Comece por uma destas, ou escreva a sua:</p>
  <div class="sugg">${SUGESTOES.map(s => `<button data-sug="${esc(s)}">${esc(s)}</button>`).join('')}</div></div>`;

const balao = h => `<div class="msg ${h.de}"><span class="who">${h.de === 'me' ? 'Você' : 'Homeostudy'}</span>
  <div class="bub">${h.de === 'me' ? esc(h.txt) : md(h.txt)}</div></div>`;

function md(t){
  const linhas = esc(t).split('\n');
  let html = '', lista = false;
  const inline = s => s.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>').replace(/`(.+?)`/g, '<code>$1</code>');
  linhas.forEach(l => {
    const x = l.trim();
    if(/^[-*•]\s+/.test(x)){ if(!lista){ html += '<ul>'; lista = true; } html += '<li>' + inline(x.replace(/^[-*•]\s+/, '')) + '</li>'; return; }
    if(lista){ html += '</ul>'; lista = false; }
    if(!x) return;
    html += /^#{1,4}\s/.test(x) ? '<h4>' + inline(x.replace(/^#{1,4}\s/, '')) + '</h4>' : '<p>' + inline(x) + '</p>';
  });
  if(lista) html += '</ul>';
  return html || '<p></p>';
}

async function garantirSample(){
  if(tentado) return sampleNS;
  tentado = true;
  try { sampleNS = await claude.use('sample'); } catch (e) { sampleNS = null; }
  return sampleNS;
}

const NO_CLAUDE = 'https://claude.ai/code/artifact/6d80adce-8140-4c7a-8b4f-6122e3a0b815';

function offline(msg){
  const el = document.getElementById('askOff');
  if(!el) return;
  // Fora do claude.ai (GitHub Pages, arquivo local) não existe IA nenhuma para
  // chamar — nesse caso vale mandar quem quiser o tira-dúvidas para a versão
  // publicada, onde ele funciona.
  const fora = typeof claude === 'undefined';
  const extra = fora
    ? ` <a href="${NO_CLAUDE}">Abra a versão no claude.ai</a> se quiser usá-lo.`
    : '';
  el.innerHTML = `<div class="ask-off"><b>O tira-dúvidas não está disponível aqui</b>`
    + `<p>${esc(msg)}${extra} Todo o resto do site — conteúdo, figuras, exercícios`
    + ` com dica e correção — funciona normalmente, sem login.</p></div>`;
}

async function perguntar(txt){
  const ns = await garantirSample();
  if(!ns){ offline('Ele precisa da IA da Claude, que só roda na versão publicada lá e com a permissão de quem abre a página.'); return; }
  const [k, slug] = (escopo || '').split('/');
  const a = aulaDe(k, slug);
  historico.push({de:'me', txt}, {de:'ai', txt:'…'});
  pintar(true);

  const prompt = [
    'Você é um monitor de fisiologia de um grupo de estudos de medicina no Brasil. Responda SEMPRE em português do Brasil.',
    'Use o material abaixo como base principal. Se a pergunta sair do material, responda mesmo assim, mas avise em uma frase que aquilo não estava no conteúdo da aula.',
    'Estilo: direto e didático. Use **negrito** nos termos-chave, listas com "-" quando ajudar e títulos com "##" só em respostas longas. Cite valores e fórmulas quando forem relevantes. No máximo ~350 palavras, salvo se pedirem mais.',
    'Se pedirem questões, escreva enunciado e alternativas e só dê o gabarito comentado depois — a menos que peçam junto.',
    '', '=== MATERIAL DA AULA ===', textoDaAula(k, slug), '=== FIM ===', '',
    'PERGUNTA: ' + txt
  ].join('\n');

  const i = historico.length - 1;
  try {
    const r = await ns(prompt, {modelTier:'default', onText:({text}) => { historico[i].txt = text; pintar(false); }});
    historico[i].txt = r.text || historico[i].txt;
  } catch (err) {
    if(err && err.text) historico[i].txt = err.text;
    else {
      historico.splice(i, 1);
      offline(err && err.code === 'rate_limited' ? 'Muitas perguntas seguidas — espere alguns segundos.' : 'Não consegui gerar a resposta agora.');
    }
  }
  pintar(false);
}

function pintar(carregando){
  const cx = document.getElementById('msgs');
  if(!cx) return;
  cx.innerHTML = historico.map((h, i) =>
    carregando && i === historico.length - 1
      ? '<div class="msg ai"><span class="who">Homeostudy</span><div class="bub"><span class="dots"><i></i><i></i><i></i></span></div></div>'
      : balao(h)).join('');
  cx.scrollTop = cx.scrollHeight;
}

main.addEventListener('change', e => { if(e.target.id === 'escopo') escopo = e.target.value; });
main.addEventListener('click', e => { const g = e.target.closest('[data-sug]'); if(g) perguntar(g.dataset.sug); });
main.addEventListener('submit', e => {
  if(e.target.id !== 'askForm') return;
  e.preventDefault();
  const inp = document.getElementById('askIn'), v = inp.value.trim();
  if(!v) return;
  inp.value = ''; inp.style.height = 'auto';
  perguntar(v);
});
main.addEventListener('input', e => {
  if(e.target.id !== 'askIn') return;
  e.target.style.height = 'auto';
  e.target.style.height = Math.min(e.target.scrollHeight, 150) + 'px';
});
main.addEventListener('keydown', e => {
  if(e.target.id === 'askIn' && e.key === 'Enter' && !e.shiftKey){
    e.preventDefault();
    document.getElementById('askForm').requestSubmit();
  }
});

/* ─── traçado do hero ────────────────────────────────────────────────── */
function tracado(){
  const c = document.getElementById('trace');
  if(!c) return;
  const ctx = c.getContext('2d');
  const reduz = matchMedia('(prefers-reduced-motion: reduce)').matches;
  let w, h, dpr;
  const tam = () => {
    dpr = Math.min(devicePixelRatio || 1, 2);
    w = c.clientWidth; h = c.clientHeight;
    c.width = w * dpr; c.height = h * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  };
  tam(); addEventListener('resize', tam);
  const g = (x, mu, s) => Math.exp(-((x - mu) ** 2) / (2 * s * s));
  const ecg = p => 0.10 * g(p, .14, .022) - 0.06 * g(p, .235, .008) + 1.0 * g(p, .25, .0085) - 0.20 * g(p, .268, .010) + 0.24 * g(p, .44, .045);
  let t = 0;
  (function frame(){
    ctx.clearRect(0, 0, w, h);
    ctx.beginPath();
    for(let x = 0; x <= w; x += 3){
      const y = h * .64 + Math.sin((x / w) * Math.PI * 3.2 - t * .5) * h * .12;
      x ? ctx.lineTo(x, y) : ctx.moveTo(x, y);
    }
    ctx.strokeStyle = 'rgba(138,166,255,.28)'; ctx.lineWidth = 1.6; ctx.stroke();
    ctx.beginPath();
    const ciclos = Math.max(3, Math.round(w / 260));
    for(let x = 0; x <= w; x += 1.5){
      const p = ((x / w) * ciclos + t * .28) % 1;
      const y = h * .44 - ecg(p) * h * .25;
      x ? ctx.lineTo(x, y) : ctx.moveTo(x, y);
    }
    ctx.strokeStyle = 'rgba(255,124,172,.5)'; ctx.lineWidth = 1.9; ctx.lineJoin = 'round'; ctx.stroke();
    if(!reduz){ t += .006; requestAnimationFrame(frame); }
  })();
}

/* ─── render ─────────────────────────────────────────────────────────── */
function render(){
  renderNav();
  if(state.v === 'inicio') main.innerHTML = viewInicio();
  else if(state.v === 'perguntar') main.innerHTML = viewPerguntar();
  else if(state.v === 'materia') main.innerHTML = viewMateria();
  else if(state.v === 'simulado') main.innerHTML = viewSimulado();
  else main.innerHTML = viewAula();

  scrollTo({top:0, behavior:'instant'});
  tracado();

  const alvos = main.querySelectorAll('.block-h');
  const links = main.querySelectorAll('[data-toc]');
  if(alvos.length && links.length){
    const io = new IntersectionObserver(es => es.forEach(en => {
      if(!en.isIntersecting) return;
      links.forEach(l => l.classList.toggle('on', l.dataset.toc === en.target.id));
    }), {rootMargin:'-70px 0px -70% 0px'});
    alvos.forEach(a => io.observe(a));
  }

  if(state.v === 'perguntar'){
    garantirSample().then(ns => { if(!ns) offline('Ele precisa da IA da Claude, que só roda na versão publicada lá e com a permissão de quem abre a página.'); });
  }
}

lerHash();
render();
</script>
