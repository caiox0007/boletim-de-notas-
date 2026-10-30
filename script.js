/* =========================================================
   BOLETIM DIGITAL — 8º ANO
   Dados fictícios para estudo. Nenhum dado pessoal real.
   ========================================================= */

const CONFIG_ALUNO = {
  turma: "8A",
  numeroChamada: 4,
  apiUrl: "https://boletim-api.profbt.com.br"
};

const disciplinas = [
  { disciplina: "Língua Portuguesa",           tri1: "91,0", tri2: "64,0", tri3: null, faltas: [5, 4, 0] },
  { disciplina: "Matemática",                  tri1: "73,0", tri2: "85,0", tri3: null, faltas: [9, 13, 0] },
  { disciplina: "Ciências",                    tri1: "76,0", tri2: "71,0", tri3: null, faltas: [11, 4, 0] },
  { disciplina: "História",                    tri1: "100,0", tri2: "96,0", tri3: null, faltas: [4, 7, 0] },
  { disciplina: "Geografia",                   tri1: "77,0", tri2: "95,0", tri3: null, faltas: [4, 6, 0] },
  { disciplina: "Língua Inglesa",              tri1: "90,0", tri2: "64,0", tri3: null, faltas: [6, 5, 0] },
  { disciplina: "Arte",                        tri1: "72,0", tri2: "74,0", tri3: null, faltas: [5, 4, 0] },
  { disciplina: "Educação Física",             tri1: "94,0", tri2: "90,0", tri3: null, faltas: [4, 3, 0] },
  { disciplina: "Educação Digital",            tri1: "75,0", tri2: "90,0", tri3: null, faltas: [4, 4, 0] },
  { disciplina: "Educação Financeira",         tri1: "76,0", tri2: "93,0", tri3: null, faltas: [3, 4, 0] },
  { disciplina: "Estudo Orientado",            tri1: "88,0", tri2: "100,0", tri3: null, faltas: [2, 12, 0] },
  { disciplina: "Redação e Leitura",           tri1: "87,0", tri2: "62,0", tri3: null, faltas: [6, 3, 0] },
  { disciplina: "Pensamento Lógico",           tri1: "100,0", tri2: "80,0", tri3: null, faltas: [0, 3, 0] },
  { disciplina: "Literatura Arte e Movimento", tri1: "82,0", tri2: "71,0", tri3: null, faltas: [2, 1, 0] },
  { disciplina: "Práticas Experimentais",      tri1: "93,0", tri2: "80,0", tri3: null, faltas: [7, 6, 0] }
];

const MEDIA_MINIMA = 6.0;
const FREQUENCIA_DEMONSTRATIVA = 92;

let pinSessao = null;
let dadosAtuais = null;

/* ---------------------------------------------------------
   GRÁFICOS — VARIÁVEIS E CONFIGURAÇÕES (adicionado)
   Camada somente leitura.
   --------------------------------------------------------- */
let graficoMedias = null;
let graficoEvolucao = null;
let graficoFaltas = null;

const REFERENCIA_FALTAS_CRITICA = 350;

const CORES_GRAFICOS = {
  azulNeon: "#00d4ff",
  roxoNeon: "#a855f7",
  azulFill: "rgba(0, 212, 255, 0.65)",
  roxoFill: "rgba(168, 85, 247, 0.85)",
  atencao: "#f59e0b",
  perigo: "#ef4444",
  grade: "rgba(148, 163, 184, 0.18)",
  texto: "#e6f1ff",
  textoSuave: "#94a3b8"
};

/* ---------------------------------------------------------
   FUNÇÕES DE CÁLCULO EXISTENTES (núcleo protegido)
   --------------------------------------------------------- */

function normalizarNota(valor) {
  if (valor === null || valor === undefined || valor === "") {
    return null;
  }

  let numero;
  if (typeof valor === "string") {
    numero = parseFloat(valor.replace(",", "."));
  } else {
    numero = Number(valor);
  }

  if (isNaN(numero)) {
    return null;
  }

  if (numero >= 0 && numero <= 10) {
    return numero;
  }

  if (numero > 10 && numero <= 100) {
    return numero / 10;
  }

  return null;
}

function calcularMedia(notas) {
  const notasValidas = notas.filter((n) => n !== null);
  if (notasValidas.length === 0) {
    return null;
  }
  const soma = notasValidas.reduce((acc, n) => acc + n, 0);
  return soma / notasValidas.length;
}

function somarFaltas(listaFaltas) {
  return listaFaltas.reduce((acc, f) => acc + f, 0);
}

function definirSituacao(media) {
  if (media === null) return "Nota ainda não disponível";
  if (media >= MEDIA_MINIMA) return "Bom desempenho";
  return "Atenção";
}

function formatarNota(nota) {
  if (nota === null) return "Ainda não lançada";
  return nota.toFixed(1).replace(".", ",");
}

function extrairNotas(item) {
  const n1 = normalizarNota(item.tri1);
  const n2 = normalizarNota(item.tri2);
  const n3 = normalizarNota(item.tri3);
  return [n1, n2, n3];
}

function extrairFaltas(item) {
  if (Array.isArray(item.faltas)) {
    return [
      Number(item.faltas[0]) || 0,
      Number(item.faltas[1]) || 0,
      Number(item.faltas[2]) || 0
    ];
  }
  if (item.faltas && typeof item.faltas === "object") {
    return [
      Number(item.faltas.tri1) || 0,
      Number(item.faltas.tri2) || 0,
      Number(item.faltas.tri3) || 0
    ];
  }
  return [0, 0, 0];
}

function nomeDisciplina(item) {
  return item && item.disciplina ? String(item.disciplina) : "";
}

function obterListaDisciplinas() {
  if (
    dadosAtuais &&
    Array.isArray(dadosAtuais.disciplinas) &&
    dadosAtuais.disciplinas.length > 0
  ) {
    return dadosAtuais.disciplinas;
  }
  return disciplinas;
}
/* ---------------------------------------------------------
   TABELA E CARDS (núcleo protegido)
   --------------------------------------------------------- */

function criarLinhaTabela(item) {
  const [n1, n2, n3] = extrairNotas(item);
  const media = calcularMedia([n1, n2, n3]);
  const faltas = somarFaltas(extrairFaltas(item));
  const situacao = definirSituacao(media);

  let classeSituacao = "situacao-neutro";
  if (situacao === "Bom desempenho") classeSituacao = "situacao-bom";
  if (situacao === "Atenção") classeSituacao = "situacao-atencao";

  const tr = document.createElement("tr");

  const tdNome = document.createElement("td");
  tdNome.textContent = nomeDisciplina(item);
  tr.appendChild(tdNome);

  const valores = [
    formatarNota(n1),
    formatarNota(n2),
    formatarNota(n3),
    media === null ? "—" : formatarNota(media),
    String(faltas)
  ];

  valores.forEach((valor) => {
    const td = document.createElement("td");
    td.textContent = valor;
    tr.appendChild(td);
  });

  const tdSituacao = document.createElement("td");
  tdSituacao.className = classeSituacao;
  tdSituacao.textContent = situacao;
  tr.appendChild(tdSituacao);

  return tr;
}

function preencherTabela() {
  const corpoTabela = document.getElementById("corpoTabela");
  corpoTabela.innerHTML = "";

  const lista = obterListaDisciplinas();

  lista.forEach((item) => {
    const linha = criarLinhaTabela(item);
    corpoTabela.appendChild(linha);
  });
}

function criarCard(titulo, valor, detalhe) {
  const card = document.createElement("div");
  card.className = "card";

  const elTitulo = document.createElement("div");
  elTitulo.className = "card-titulo";
  elTitulo.textContent = titulo;

  const elValor = document.createElement("div");
  elValor.className = "card-valor";
  elValor.textContent = valor;

  const elDetalhe = document.createElement("div");
  elDetalhe.className = "card-detalhe";
  elDetalhe.textContent = detalhe;

  card.appendChild(elTitulo);
  card.appendChild(elValor);
  card.appendChild(elDetalhe);

  return card;
}

function preencherCards() {
  const container = document.getElementById("cardsResumo");
  container.innerHTML = "";

  const lista = obterListaDisciplinas();

  const medias = [];
  let totalFaltas = 0;
  let bomDesempenho = 0;
  let atencao = 0;

  lista.forEach((item) => {
    const [n1, n2, n3] = extrairNotas(item);
    const media = calcularMedia([n1, n2, n3]);

    if (media !== null) {
      medias.push(media);
      if (media >= MEDIA_MINIMA) bomDesempenho++;
      else atencao++;
    }

    totalFaltas += somarFaltas(extrairFaltas(item));
  });

  let mediaGeral = null;
  if (medias.length > 0) {
    mediaGeral = medias.reduce((a, b) => a + b, 0) / medias.length;
  }

  container.appendChild(
    criarCard(
      "Média Geral",
      mediaGeral === null ? "—" : formatarNota(mediaGeral),
      "Média das médias disponíveis"
    )
  );

  container.appendChild(
    criarCard("Total de Faltas", String(totalFaltas), "Soma de todas as disciplinas")
  );

  container.appendChild(
    criarCard(
      "Bom Desempenho",
      String(bomDesempenho),
      "Disciplinas com média ≥ 6,0"
    )
  );

  container.appendChild(
    criarCard(
      "Atenção",
      String(atencao),
      "Disciplinas com média < 6,0"
    )
  );

  container.appendChild(
    criarCard(
      "Frequência",
      FREQUENCIA_DEMONSTRATIVA + "%",
      "Frequência adequada (valor demonstrativo)"
    )
  );
}

/* ---------------------------------------------------------
   LOGIN POR PIN (núcleo protegido)
   --------------------------------------------------------- */

function mostrarMensagemLogin(texto) {
  const el = document.getElementById("mensagemLogin");
  if (el) el.textContent = texto;
}

function limparMensagemLogin() {
  const el = document.getElementById("mensagemLogin");
  if (el) el.textContent = "";
}

function limparCampoPin() {
  const campo = document.getElementById("campoPin");
  if (campo) campo.value = "";
}

async function abrirBoletim(pin) {
  const url = CONFIG_ALUNO.apiUrl + "/api/v1/boletins/abrir";
  const resposta = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      turma: CONFIG_ALUNO.turma,
      numero_chamada: CONFIG_ALUNO.numeroChamada,
      pin: pin
    })
  });

  if (resposta.status === 401) {
    const erro = new Error("401");
    erro.status = 401;
    throw erro;
  }
  if (resposta.status === 429) {
    const erro = new Error("429");
    erro.status = 429;
    throw erro;
  }
  if (!resposta.ok) {
    const erro = new Error("HTTP " + resposta.status);
    erro.status = resposta.status;
    throw erro;
  }

  return resposta.json();
}

async function tratarEntrar() {
  const campoPin = document.getElementById("campoPin");
  const botao = document.getElementById("botaoEntrar");
  const pin = campoPin ? campoPin.value.trim() : "";

  limparMensagemLogin();

  if (pin === "") {
    mostrarMensagemLogin("Digite seu PIN.");
    return;
  }

  botao.disabled = true;
  mostrarMensagemLogin("Conectando...");

  try {
    const resultado = await abrirBoletim(pin);
    pinSessao = pin;
    limparCampoPin();

    if (resultado && resultado.dados) {
      dadosAtuais = resultado.dados;
    } else {
      dadosAtuais = null;
    }

    document.getElementById("areaLogin").style.display = "none";
    document.getElementById("conteudoBoletim").style.display = "block";
    document.getElementById("areaEdicao").style.display = "block";

    preencherCards();
    preencherTabela();
    atualizarGraficos(); // (adicionado nesta etapa)
  } catch (erro) {
    if (erro.status === 401) {
      mostrarMensagemLogin("Turma, chamada ou PIN inválidos.");
    } else if (erro.status === 429) {
      mostrarMensagemLogin(
        "Muitas tentativas. Aguarde um minuto e tente novamente."
      );
    } else {
      mostrarMensagemLogin(
        "Não foi possível conectar ao servidor. Tente novamente."
      );
    }
    limparCampoPin();
  } finally {
    botao.disabled = false;
  }
}
/* ---------------------------------------------------------
   EDIÇÃO DE NOTAS E FALTAS (núcleo protegido)
   --------------------------------------------------------- */

function validarNotaEditada(texto) {
  const bruto = String(texto).trim();

  if (bruto === "") {
    return { valido: true, valor: null };
  }

  const normalizado = bruto.replace(",", ".");
  const numero = Number(normalizado);

  if (isNaN(numero)) return { valido: false };
  if (numero < 0 || numero > 10) return { valido: false };

  return { valido: true, valor: numero };
}

function validarFaltasEditadas(texto) {
  const bruto = String(texto).trim();

  if (bruto === "") return { valido: false };
  if (!/^\d+$/.test(bruto)) return { valido: false };

  const numero = Number(bruto);
  if (!Number.isInteger(numero) || numero < 0) return { valido: false };

  return { valido: true, valor: numero };
}

function criarCampoEdicao(idCampo, rotulo, valorInicial) {
  const wrapper = document.createElement("div");
  wrapper.className = "campo-edicao";

  const label = document.createElement("label");
  label.setAttribute("for", idCampo);
  label.textContent = rotulo;

  const input = document.createElement("input");
  input.type = "text";
  input.id = idCampo;
  input.value = valorInicial;

  wrapper.appendChild(label);
  wrapper.appendChild(input);

  return { wrapper, input };
}

function montarPainelEdicao() {
  const lista = document.getElementById("listaEdicao");
  lista.innerHTML = "";

  const fonte = obterListaDisciplinas();

  fonte.forEach((item, indice) => {
    const bloco = document.createElement("div");
    bloco.className = "disciplina-edicao";

    const nome = document.createElement("div");
    nome.className = "disciplina-edicao-nome";
    nome.textContent = nomeDisciplina(item);
    bloco.appendChild(nome);

    const campos = document.createElement("div");
    campos.className = "campos-edicao";

    const [n1, n2, n3] = extrairNotas(item);
    const [f1, f2, f3] = extrairFaltas(item);

    const notaParaTexto = (n) =>
      n === null ? "" : n.toFixed(1).replace(".", ",");

    const defs = [
      { sufixo: "tri1", rotulo: "1º Tri (nota)", valor: notaParaTexto(n1) },
      { sufixo: "tri2", rotulo: "2º Tri (nota)", valor: notaParaTexto(n2) },
      { sufixo: "tri3", rotulo: "3º Tri (nota)", valor: notaParaTexto(n3) },
      { sufixo: "faltas1", rotulo: "1º Tri (faltas)", valor: String(f1) },
      { sufixo: "faltas2", rotulo: "2º Tri (faltas)", valor: String(f2) },
      { sufixo: "faltas3", rotulo: "3º Tri (faltas)", valor: String(f3) }
    ];

    defs.forEach((def) => {
      const idCampo = `edit_${indice}_${def.sufixo}`;
      const { wrapper, input } = criarCampoEdicao(idCampo, def.rotulo, def.valor);
      input.dataset.indice = String(indice);
      input.dataset.campo = def.sufixo;
      campos.appendChild(wrapper);
    });

    bloco.appendChild(campos);
    lista.appendChild(bloco);
  });
}

function coletarDadosEditados() {
  const fonte = obterListaDisciplinas();
  const novasDisciplinas = [];
  let valido = true;

  document
    .querySelectorAll(".campo-edicao input")
    .forEach((el) => el.classList.remove("invalido"));

  fonte.forEach((item, indice) => {
    const lerCampo = (sufixo) => {
      const el = document.getElementById(`edit_${indice}_${sufixo}`);
      return el ? el.value : "";
    };

    const marcarInvalido = (sufixo) => {
      const el = document.getElementById(`edit_${indice}_${sufixo}`);
      if (el) el.classList.add("invalido");
    };

    const vn1 = validarNotaEditada(lerCampo("tri1"));
    const vn2 = validarNotaEditada(lerCampo("tri2"));
    const vn3 = validarNotaEditada(lerCampo("tri3"));

    const vf1 = validarFaltasEditadas(lerCampo("faltas1"));
    const vf2 = validarFaltasEditadas(lerCampo("faltas2"));
    const vf3 = validarFaltasEditadas(lerCampo("faltas3"));

    if (!vn1.valido) { marcarInvalido("tri1"); valido = false; }
    if (!vn2.valido) { marcarInvalido("tri2"); valido = false; }
    if (!vn3.valido) { marcarInvalido("tri3"); valido = false; }
    if (!vf1.valido) { marcarInvalido("faltas1"); valido = false; }
    if (!vf2.valido) { marcarInvalido("faltas2"); valido = false; }
    if (!vf3.valido) { marcarInvalido("faltas3"); valido = false; }

    novasDisciplinas.push({
      disciplina: nomeDisciplina(item),
      tri1: vn1.valido ? vn1.valor : normalizarNota(item.tri1),
      tri2: vn2.valido ? vn2.valor : normalizarNota(item.tri2),
      tri3: vn3.valido ? vn3.valor : normalizarNota(item.tri3),
      faltas: [
        vf1.valido ? vf1.valor : extrairFaltas(item)[0],
        vf2.valido ? vf2.valor : extrairFaltas(item)[1],
        vf3.valido ? vf3.valor : extrairFaltas(item)[2]
      ]
    });
  });

  if (!valido) {
    return { ok: false };
  }

  return { ok: true, dados: { disciplinas: novasDisciplinas } };
}

async function salvarBoletim(dados) {
  const url = CONFIG_ALUNO.apiUrl + "/api/v1/boletins/salvar";
  const resposta = await fetch(url, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      turma: CONFIG_ALUNO.turma,
      numero_chamada: CONFIG_ALUNO.numeroChamada,
      pin: pinSessao,
      dados: dados
    })
  });

  if (resposta.status === 401) {
    const erro = new Error("401");
    erro.status = 401;
    throw erro;
  }
  if (resposta.status === 429) {
    const erro = new Error("429");
    erro.status = 429;
    throw erro;
  }
  if (!resposta.ok) {
    const erro = new Error("HTTP " + resposta.status);
    erro.status = resposta.status;
    throw erro;
  }

  return true;
}

function mostrarMensagemEdicao(texto) {
  const el = document.getElementById("mensagemEdicao");
  if (el) el.textContent = texto;
}

async function tratarSalvar() {
  const botao = document.getElementById("botaoSalvar");

  mostrarMensagemEdicao("");
  const resultado = coletarDadosEditados();

  if (!resultado.ok) {
    mostrarMensagemEdicao(
      "Há campos inválidos. Corrija antes de salvar."
    );
    return;
  }

  botao.disabled = true;
  mostrarMensagemEdicao("Salvando...");

  try {
    await salvarBoletim(resultado.dados);

    dadosAtuais = resultado.dados;

    preencherCards();
    preencherTabela();
    atualizarGraficos(); // (adicionado nesta etapa)

    mostrarMensagemEdicao("Dados salvos com sucesso.");
  } catch (erro) {
    if (erro.status === 401) {
      mostrarMensagemEdicao("Sessão inválida. Entre novamente.");
    } else if (erro.status === 429) {
      mostrarMensagemEdicao(
        "Muitas tentativas. Aguarde um minuto e tente novamente."
      );
    } else {
      mostrarMensagemEdicao(
        "Não foi possível salvar. Tente novamente."
      );
    }
  } finally {
    botao.disabled = false;
  }
}

function tratarAlterarDados() {
  const painel = document.getElementById("painelEdicao");
  const visivel = painel.style.display !== "none";

  if (visivel) {
    painel.style.display = "none";
  } else {
    montarPainelEdicao();
    mostrarMensagemEdicao("");
    painel.style.display = "block";
  }
}

function tratarCancelar() {
  const painel = document.getElementById("painelEdicao");
  painel.style.display = "none";
  mostrarMensagemEdicao("");
}
/* =========================================================
   GRÁFICOS — CAMADA DE LEITURA (adicionado nesta etapa)
   Nenhuma função abaixo altera disciplinas, notas ou faltas.
   ========================================================= */

function calcularMediasPorDisciplina() {
  const lista = obterListaDisciplinas();
  const labels = [];
  const valores = [];

  lista.forEach((item) => {
    const [n1, n2, n3] = extrairNotas(item);
    const media = calcularMedia([n1, n2, n3]);
    labels.push(nomeDisciplina(item));
    valores.push(media); // null preservado — não vira 0
  });

  return { labels, valores };
}

function calcularEvolucaoMediaGeral() {
  const lista = obterListaDisciplinas();
  const acumulado = [[], [], []];

  lista.forEach((item) => {
    const notas = extrairNotas(item);
    notas.forEach((n, i) => {
      if (n !== null) acumulado[i].push(n);
    });
  });

  return acumulado.map((arr) => {
    if (arr.length === 0) return null;
    return arr.reduce((a, b) => a + b, 0) / arr.length;
  });
}

function calcularFaltasPorTrimestre() {
  const lista = obterListaDisciplinas();
  const faltasTri = [0, 0, 0];

  lista.forEach((item) => {
    const [f1, f2, f3] = extrairFaltas(item);
    faltasTri[0] += f1;
    faltasTri[1] += f2;
    faltasTri[2] += f3;
  });

  const totalGeral = faltasTri[0] + faltasTri[1] + faltasTri[2];
  return { faltasTri, totalGeral };
}

function atualizarGraficoMedias() {
  const canvas = document.getElementById("graficoMediasDisciplinas");
  if (!canvas || typeof Chart === "undefined") return;

  if (graficoMedias) {
    graficoMedias.destroy();
    graficoMedias = null;
  }

  const { labels, valores } = calcularMediasPorDisciplina();

  graficoMedias = new Chart(canvas.getContext("2d"), {
    type: "bar",
    data: {
      labels: labels,
      datasets: [
        {
          label: "Média",
          data: valores,
          backgroundColor: CORES_GRAFICOS.azulFill,
          borderColor: CORES_GRAFICOS.azulNeon,
          borderWidth: 1,
          borderRadius: 6,
          maxBarThickness: 22
        }
      ]
    },
    options: {
      indexAxis: "y",
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            label: function (ctx) {
              const v = ctx.parsed.x;
              if (v === null || v === undefined) {
                return "Ainda não lançada";
              }
              return "Média: " + v.toFixed(1).replace(".", ",");
            }
          }
        }
      },
      scales: {
        x: {
          min: 0,
          max: 10,
          ticks: { color: CORES_GRAFICOS.textoSuave },
          grid: { color: CORES_GRAFICOS.grade }
        },
        y: {
          ticks: { color: CORES_GRAFICOS.texto, font: { size: 11 } },
          grid: { display: false }
        }
      }
    }
  });
}

function atualizarGraficoEvolucao() {
  const canvas = document.getElementById("graficoEvolucaoTrimestres");
  if (!canvas || typeof Chart === "undefined") return;

  if (graficoEvolucao) {
    graficoEvolucao.destroy();
    graficoEvolucao = null;
  }

  const valores = calcularEvolucaoMediaGeral();

  graficoEvolucao = new Chart(canvas.getContext("2d"), {
    type: "line",
    data: {
      labels: ["1º Tri", "2º Tri", "3º Tri"],
      datasets: [
        {
          label: "Média geral",
          data: valores,
          borderColor: CORES_GRAFICOS.roxoNeon,
          backgroundColor: CORES_GRAFICOS.roxoFill,
          pointBackgroundColor: CORES_GRAFICOS.azulNeon,
          pointBorderColor: CORES_GRAFICOS.roxoNeon,
          pointRadius: 5,
          pointHoverRadius: 7,
          tension: 0.3,
          fill: false,
          spanGaps: false
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            label: function (ctx) {
              const v = ctx.parsed.y;
              if (v === null || v === undefined) {
                return "Sem notas";
              }
              return "Média: " + v.toFixed(1).replace(".", ",");
            }
          }
        }
      },
      scales: {
        x: {
          ticks: { color: CORES_GRAFICOS.textoSuave },
          grid: { color: CORES_GRAFICOS.grade }
        },
        y: {
          min: 0,
          max: 10,
          ticks: { color: CORES_GRAFICOS.textoSuave },
          grid: { color: CORES_GRAFICOS.grade }
        }
      }
    }
  });
}

function atualizarGraficoFaltas() {
  const canvas = document.getElementById("graficoFaltasTrimestres");
  if (!canvas || typeof Chart === "undefined") return;

  if (graficoFaltas) {
    graficoFaltas.destroy();
    graficoFaltas = null;
  }

  const { faltasTri, totalGeral } = calcularFaltasPorTrimestre();

  graficoFaltas = new Chart(canvas.getContext("2d"), {
    type: "bar",
    data: {
      labels: ["1º Tri", "2º Tri", "3º Tri"],
      datasets: [
        {
          label: "Faltas",
          data: faltasTri,
          backgroundColor: CORES_GRAFICOS.azulFill,
          borderColor: CORES_GRAFICOS.azulNeon,
          borderWidth: 1,
          borderRadius: 6,
          maxBarThickness: 46
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            label: function (ctx) {
              const tri = ["1º Tri", "2º Tri", "3º Tri"][ctx.dataIndex];
              return tri + ": " + ctx.parsed.y + " faltas";
            }
          }
        }
      },
      scales: {
        x: {
          ticks: { color: CORES_GRAFICOS.textoSuave },
          grid: { display: false }
        },
        y: {
          beginAtZero: true,
          ticks: { color: CORES_GRAFICOS.textoSuave, precision: 0 },
          grid: { color: CORES_GRAFICOS.grade }
        }
      }
    }
  });

  // Avaliação interna de risco — apenas palavra "Perigo" pode aparecer
  const card = document.getElementById("cardGraficoFaltas");
  const estado = document.getElementById("estadoFaltas");
  const critico = totalGeral >= REFERENCIA_FALTAS_CRITICA;

  if (card) {
    card.classList.toggle("critico", critico);
  }
  if (estado) {
    estado.textContent = critico ? "Perigo" : "";
    estado.classList.toggle("perigo", critico);
  }
}

function atualizarGraficos() {
  atualizarGraficoMedias();
  atualizarGraficoEvolucao();
  atualizarGraficoFaltas();
}

/* ---------------------------------------------------------
   Inicialização: roda quando a página termina de carregar.
   --------------------------------------------------------- */
document.addEventListener("DOMContentLoaded", () => {
  const elTurma = document.getElementById("loginTurma");
  const elChamada = document.getElementById("loginChamada");
  if (elTurma) elTurma.textContent = CONFIG_ALUNO.turma;
  if (elChamada) elChamada.textContent = String(CONFIG_ALUNO.numeroChamada);

  const botaoEntrar = document.getElementById("botaoEntrar");
  if (botaoEntrar) botaoEntrar.addEventListener("click", tratarEntrar);

  const campoPin = document.getElementById("campoPin");
  if (campoPin) {
    campoPin.addEventListener("keydown", (e) => {
      if (e.key === "Enter") tratarEntrar();
    });
  }

  const botaoAlterar = document.getElementById("botaoAlterar");
  if (botaoAlterar) botaoAlterar.addEventListener("click", tratarAlterarDados);

  const botaoSalvar = document.getElementById("botaoSalvar");
  if (botaoSalvar) botaoSalvar.addEventListener("click", tratarSalvar);

  const botaoCancelar = document.getElementById("botaoCancelar");
  if (botaoCancelar) botaoCancelar.addEventListener("click", tratarCancelar);
});