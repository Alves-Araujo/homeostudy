<script>
/* ══════════════════════════════════════════════════════════════════════
   Mapa mental de cada matéria — um por matéria, escrito à mão.

   Gerar isto a partir dos títulos do PDF não funciona: os slides trazem
   fórmulas, gabaritos e rótulos de diagrama que não são tópicos. Cada ramo
   aqui é um conceito de verdade, e `d` é a explicação que aparece quando o
   mouse passa por cima.
   ══════════════════════════════════════════════════════════════════════ */
window.MAPA = {

'pequenos-grupos': {
  centro: 'Pequenos grupos',
  sub: 'O meio interno sob controle',
  ramos: [
    {t:'Homeostase', d:'Manter o meio interno estável mesmo quando o ambiente externo muda. Não é imobilidade: é equilíbrio ativo, que custa energia.', filhos:[
      {t:'Variável regulada', d:'A grandeza que o corpo defende — temperatura, pH, osmolaridade, glicemia.'},
      {t:'Set point', d:'O valor de referência em torno do qual a variável oscila. O erro é a diferença entre o valor atual e ele.'},
      {t:'LIC 2/3 · LEC 1/3', d:'A água corporal (60% do peso) se divide assim: dois terços dentro das células, um terço fora.'},
    ]},
    {t:'Feedback', d:'O laço que fecha o controle: a resposta volta e altera o próprio estímulo que a gerou.', filhos:[
      {t:'Negativo', d:'A resposta se opõe ao desvio e traz a variável de volta ao set point. É o mecanismo da maioria dos sistemas.'},
      {t:'Positivo', d:'A resposta amplifica o estímulo. Raro e autolimitado: pico de LH na ovulação, coagulação, parto.'},
      {t:'Arco reflexo', d:'Receptor detecta → via aferente conduz → centro integrador decide → via eferente comanda → efetor age.'},
    ]},
    {t:'Sinalização hormonal', d:'Como a mensagem química chega à célula e vira resposta.', filhos:[
      {t:'Proteína G', d:'Receptor de membrana com subunidades alfa, beta e gama; ativa segundos mensageiros dentro da célula.'},
      {t:'Eixo H-H-alvo', d:'Hipotálamo → hipófise → glândula periférica, com alça de retroalimentação em cada degrau.'},
      {t:'Órgãos endócrinos', d:'Além das glândulas clássicas: fígado libera IGF, coração libera peptídeo natriurético.'},
    ]},
    {t:'Equilíbrio ácido-base', d:'Manter o pH arterial entre 7,35 e 7,45 — fora disso, enzimas e membranas param de funcionar.', filhos:[
      {t:'Tampão bicarbonato', d:'CO₂ + H₂O ⇌ H₂CO₃ ⇌ H⁺ + HCO₃⁻. Age em segundos, na relação 20:1.'},
      {t:'Pulmão · minutos', d:'Ajusta o CO₂ pela ventilação. Hiperventila na acidose, hipoventila na alcalose.'},
      {t:'Rim · horas a dias', d:'Reabsorve HCO₃⁻, secreta H⁺ e fabrica bicarbonato novo pela amoniogênese.'},
    ]},
    {t:'Água e eletrólitos', d:'O volume e a composição dos líquidos corporais, ajustados pelo rim sob comando hormonal.', filhos:[
      {t:'Na⁺ e volemia', d:'Principal cátion extracelular: determina a osmolaridade e, com ela, o volume circulante.'},
      {t:'K⁺ e excitabilidade', d:'Principal cátion intracelular: define o potencial de repouso. Hipercalemia pode parar o coração.'},
      {t:'ADH e aldosterona', d:'ADH retém água livre; aldosterona retém Na⁺ e água. Juntos, seguram o volume.'},
    ]},
    {t:'Sinais clínicos', d:'Onde a fisiologia aparece no exame do paciente.', filhos:[
      {t:'PA = DC × RVP', d:'Pressão arterial é débito cardíaco vezes resistência vascular periférica.'},
      {t:'Desidratação', d:'Sede, oligúria, urina concentrada, mucosas secas. Se piora: taquicardia e hipotensão.'},
      {t:'Edema', d:'Retenção de Na⁺ e água aumenta a pressão hidrostática capilar e o líquido extravasa.'},
    ]},
  ]
},

'anatomia': {
  centro: 'Anatomia',
  sub: 'Da estrutura à função integrada',
  ramos: [
    {t:'Tecidos e barreiras', d:'A forma do tecido já conta o que ele faz: cada arranjo resolve um problema funcional.', filhos:[
      {t:'Epitélio', d:'Células justapostas sobre membrana basal: barreira seletiva, sem vasos próprios.'},
      {t:'Conjuntivo', d:'Matriz extracelular abundante: sustenta, nutre por difusão e defende.'},
      {t:'Glandular', d:'Epitélio especializado em secretar — exócrino por ducto, endócrino para o sangue.'},
    ]},
    {t:'Sistema nervoso', d:'O integrador rápido: conduz informação em milissegundos e coordena a resposta.', filhos:[
      {t:'Aferente', d:'Conduz a informação do receptor até o centro integrador.'},
      {t:'Eferente', d:'Leva o comando do centro até o efetor — músculo ou glândula.'},
      {t:'Autônomo', d:'Simpático e parassimpático ajustam vísceras sem comando voluntário.'},
    ]},
    {t:'Sistema endócrino', d:'O integrador lento: mensagens químicas pelo sangue, com efeito prolongado.', filhos:[
      {t:'Hipotálamo', d:'Centro que liga o nervoso ao endócrino e comanda a hipófise.'},
      {t:'Hipófise', d:'Traduz o comando hipotalâmico em hormônios que atingem as glândulas periféricas.'},
      {t:'Glândulas-alvo', d:'Tireoide, adrenal, gônadas — respondem e retroalimentam o eixo.'},
    ]},
    {t:'Cardiovascular', d:'A bomba e a rede que entregam oxigênio e recolhem resíduos.', filhos:[
      {t:'Coração', d:'Quatro câmaras, duas bombas em série: pulmonar de baixa pressão, sistêmica de alta.'},
      {t:'Vasos', d:'Artéria resiste à pressão, arteríola regula o fluxo, capilar troca, veia armazena.'},
      {t:'Débito cardíaco', d:'Volume ejetado por minuto: frequência cardíaca × volume sistólico.'},
    ]},
    {t:'Respiratório e renal', d:'Os dois sistemas que ajustam o meio interno trocando com o exterior.', filhos:[
      {t:'Troca gasosa', d:'Alvéolo e capilar separados por uma barreira finíssima: O₂ entra, CO₂ sai.'},
      {t:'Néfron', d:'Filtra, reabsorve o que serve, secreta o que sobra e concentra a urina.'},
      {t:'Digestório', d:'Absorve nutrientes e água; o fígado processa antes de liberar à circulação.'},
    ]},
  ]
},

'histologia': {
  centro: 'Histologia',
  sub: 'O tecido visto de perto',
  ramos: [
    {t:'Ritmo circadiano', d:'A histologia do relógio biológico e do hormônio que marca a noite.', filhos:[
      {t:'Núcleo supraquiasmático', d:'O marca-passo central, no hipotálamo, sincronizado pela luz que chega da retina.'},
      {t:'Pineal', d:'Secreta melatonina no escuro; pinealócitos em cordões, com grãos de areia encefálica.'},
    ]},
    {t:'Cardiovascular', d:'Como se reconhece cada vaso e o músculo cardíaco na lâmina.', filhos:[
      {t:'Três túnicas', d:'De dentro para fora: íntima, média e adventícia. A média manda no calibre.'},
      {t:'Cardiomiócito', d:'Estriado, ramificado, com um ou dois núcleos centrais — diferente do esquelético.'},
      {t:'Disco intercalar', d:'Junção entre cardiomiócitos: zônula de adesão, desmossomo e junção gap.'},
      {t:'Tipos de capilar', d:'Contínuo (barreira), fenestrado (filtração) e sinusoide (passagem de células).'},
    ]},
    {t:'Respiratório', d:'A mudança progressiva do epitélio da porção condutora à respiratória.', filhos:[
      {t:'Pseudoestratificado', d:'Todas as células tocam a basal, nem todas chegam à superfície. Ciliado, com células caliciformes.'},
      {t:'Barreira alvéolo-capilar', d:'Pneumócito I, membranas basais fundidas e endotélio: a distância mínima para a difusão.'},
      {t:'Pneumócito II', d:'Cuboide, produz surfactante e repõe o pneumócito I quando ele se perde.'},
    ]},
    {t:'Renal', d:'A estrutura que explica como o rim filtra e concentra.', filhos:[
      {t:'Corpúsculo renal', d:'Glomérulo mais cápsula de Bowman: onde o plasma é filtrado.'},
      {t:'Podócito', d:'Prolongamentos interdigitados formam as fendas de filtração — a peneira fina.'},
      {t:'Alça de Henle', d:'O gradiente medular que permite concentrar a urina por multiplicação em contracorrente.'},
    ]},
    {t:'Temperatura', d:'Os tecidos que ganham e perdem calor sob comando do hipotálamo.', filhos:[
      {t:'Pele', d:'Epiderme queratinizada como barreira; a derme traz os vasos e as glândulas.'},
      {t:'Glândula sudorípara', d:'Secreta suor para evaporar e resfriar; enovelada na derme profunda.'},
      {t:'Anastomose arteriovenosa', d:'Desvia sangue da superfície para conservar calor, ou o traz para dissipá-lo.'},
    ]},
  ]
},

'grandes-grupos': {
  centro: 'Grandes Grupos',
  sub: 'As aulas expositivas',
  ramos: [
    {t:'Homeostase integrada', d:'Nenhum sistema regula sozinho: a estabilidade emerge da conversa entre eles.', filhos:[
      {t:'Holarquia', d:'Cada nível é inteiro em si e parte de um maior: célula, tecido, órgão, sistema, organismo.'},
      {t:'Do simples ao complexo', d:'O mesmo princípio de controle reaparece em escalas diferentes.'},
    ]},
    {t:'Eixos hormonais', d:'Hipotálamo e hipófise no comando, com retroalimentação em cada degrau.', filhos:[
      {t:'Somatostatina', d:'Inibe o hormônio do crescimento — o freio do eixo somatotrófico.'},
      {t:'Eixo tireoidiano', d:'TRH → TSH → T3 e T4, que retroalimentam negativamente hipotálamo e hipófise.'},
      {t:'Adrenal', d:'Córtex produz cortisol e aldosterona; medula, adrenalina — resposta lenta e rápida ao estresse.'},
    ]},
    {t:'Cardiovascular', d:'Como o sistema ajusta pressão e fluxo momento a momento.', filhos:[
      {t:'Barorreflexo', d:'Barorreceptores no seio carotídeo e no arco aórtico corrigem a pressão em segundos.'},
      {t:'Retorno venoso', d:'O que volta ao coração determina o que sai: sem enchimento não há ejeção.'},
    ]},
    {t:'Digestório e metabolismo', d:'Da quebra do alimento ao destino dos nutrientes.', filhos:[
      {t:'Carboidratos', d:'Só monossacarídeos são absorvidos: glicose, frutose e galactose.'},
      {t:'Dissacarídeos', d:'Maltose (glicose + glicose), sacarose (glicose + frutose), lactose (glicose + galactose).'},
      {t:'Metabolismo integrado', d:'Fígado, músculo e tecido adiposo trocam substratos conforme o estado alimentado ou de jejum.'},
    ]},
  ]
},

'bioquimica': {
  centro: 'Bioquímica',
  sub: 'pH, lipídios e urina',
  ramos: [
    {t:'pH e ácidos', d:'A escala logarítmica que descreve a concentração de H⁺ e governa toda proteína.', filhos:[
      {t:'pH = −log[H⁺]', d:'Cada unidade de pH é um fator de dez na concentração de hidrogênio.'},
      {t:'pOH', d:'pOH = −log[OH⁻], e pH + pOH = 14 a 25 °C.'},
      {t:'Ácido forte × fraco', d:'O forte se dissocia por completo; o fraco estabelece equilíbrio e serve de tampão.'},
    ]},
    {t:'Tampões', d:'Par de ácido fraco e base conjugada que absorve H⁺ ou OH⁻ sem deixar o pH disparar.', filhos:[
      {t:'Bicarbonato', d:'O tampão extracelular principal, aberto: o pulmão remove o CO₂ e o rim ajusta o HCO₃⁻.'},
      {t:'Fosfato', d:'Atua dentro da célula e no túbulo renal, como acidez titulável.'},
      {t:'Proteínas', d:'Hemoglobina e proteínas plasmáticas tamponam pelos grupos ionizáveis das cadeias laterais.'},
    ]},
    {t:'Distúrbios ácido-base', d:'Ler a gasometria: quem causou o desvio e quem está compensando.', filhos:[
      {t:'Acidose metabólica', d:'pH < 7,35 com HCO₃⁻ baixo. Cetoacidose, insuficiência renal, diarreia.'},
      {t:'Acidose respiratória', d:'pH < 7,35 com PaCO₂ alta. Hipoventilação, DPOC, depressão do centro respiratório.'},
      {t:'Alcaloses', d:'pH > 7,45 — por perda de H⁺ (vômito) ou por hiperventilação.'},
    ]},
    {t:'Lipídios', d:'Transporte de colesterol no plasma e o risco que ele carrega.', filhos:[
      {t:'LDL × HDL', d:'LDL leva colesterol aos tecidos; HDL traz de volta ao fígado. A razão importa mais que o total.'},
      {t:'Framingham', d:'O estudo de coorte que transformou colesterol e pressão em fatores de risco mensuráveis.'},
    ]},
    {t:'Urinálise', d:'O que a urina revela sobre filtração, concentração e doença.', filhos:[
      {t:'Densidade', d:'Mede a capacidade de concentrar. Baixa e fixa sugere lesão tubular.'},
      {t:'Proteinúria', d:'Proteína na urina indica falha na barreira glomerular.'},
      {t:'Sedimento', d:'Cilindros, cristais e células localizam o problema no néfron.'},
    ]},
  ]
},

};
</script>
