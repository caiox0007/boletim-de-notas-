/* =========================================================
   BOLETIM DIGITAL — 8º ANO
   Dados fictícios para estudo. Nenhum dado pessoal real.
   ========================================================= */

/* ---------------------------------------------------------
   CONFIGURAÇÃO FIXA DO ALUNO
   Turma e chamada ficam fixas neste projeto.
   Não podem ser alteradas pela página.
   --------------------------------------------------------- */
const CONFIG_ALUNO = {
  turma: "8A",
  numeroChamada: 4,
  apiUrl: "https://boletim-api.profbt.com.br"
};

/* ---------------------------------------------------------
   CONCEITO: array
   Um array é uma lista. Aqui guardamos a lista de disciplinas.
   Cada item da lista é um objeto (veja abaixo).
   --------------------------------------------------------- */
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

/* ---------------------------------------------------------
   CONCEITO: constante
   Uma constante (const) é uma variável que não muda de valor.
   --------------------------------------------------------- */
const MEDIA_MINIMA = 6.0;

// Frequência FICTÍCIA usada apenas para demonstração nesta primeira versão.
// No futuro, esse valor será calculado a partir de dados reais de frequência.
const FREQUENCIA_DEMONSTRATIVA = 92;

/* ---------------------------------------------------------
   ESTADO DA SESSÃO
   O PIN fica somente em memória durante a sessão.
   Nunca é salvo em localStorage, sessionStorage, URL ou console.
   --------------------------------------------------------- */
let pinSessao = null;
let dadosAtuais = null; // dados vindos da API (ou null quando ainda não existem)

/* ---------------------------------------------------------
   CONCEITO: função
   Uma função é um bloco de código que executa uma tarefa.
   --------------------------------------------------------- */

/**
 * Normaliza uma nota para a escala 0–10.
 * Regras (dados antigos do projeto):
 *  - vazio/null/undefined → null (nota ainda não lançada)
 *  - 0 a 10 → mantém
 *  - >10 e <=100 → divide por 10
 *  - aceita ponto ou vírgula decimal
 *  - fora das regras → null (inválida)
 */
function normalizarNota(valor) {
  // Nota ausente
  if (valor === null || valor === undefined || valor === "") {
    return null;
  }

  // Se for texto, troca vírgula por ponto
  let numero;
  if (typeof valor === "string") {
    numero = parseFloat(valor.replace(",", "."));
  } else {
    numero = Number(valor);
  }

  // Se não virou número válido, retorna null
  if (isNaN(numero)) {
    return null;
  }

  // Aplica as regras da escala
  if (numero >= 0 && numero <= 10) {
    return numero;
  }

  if (numero > 10 && numero <= 100) {
    return numero / 10;
  }

  // Fora das regras → inválida
  return null;
}

/**
 * Calcula a média de uma disciplina usando apenas as notas disponíveis.
 * Nota ausente nunca vira zero.
 */
function calcularMedia(notas) {
  const notasValidas = notas.filter((n) => n !== null);
  if (notasValidas.length === 0) {
    return null; // nenhuma nota disponível
  }
  const soma = notasValidas.reduce((acc, n) => acc + n, 0);
  return soma / notasValidas.length;
}

/**
 * Soma as faltas dos trimestres.
 */
function somarFaltas(listaFaltas) {
  return listaFaltas.reduce((acc, f) => acc + f, 0);
}

/**
 * Define a situação da disciplina com base na média disponível.
 */
function definirSituacao(media) {
  if (media === null) return "Nota ainda não disponível";
  if (media >= MEDIA_MINIMA) return "Bom desempenho";
  return "Atenção";
}

/**
 * Formata a nota para exibição.
 * Se for null, mostra "Ainda não lançada".
 */
function formatarNota(nota) {
  if (nota === null) return "Ainda não lançada";
  return nota.toFixed(1).replace(".", ",");
}

/* ---------------------------------------------------------
   FUNÇÕES AUXILIARES DE DADOS
   Trabalham tanto com os dados antigos do projeto quanto
   com os dados vindos da API.
   --------------------------------------------------------- */

/**
 * Extrai as três notas de um item, seja no formato antigo
 * (tri1/tri2/tri3) ou no formato da API.
 */
function extrairNotas(item) {
  const n1 = normalizarNota(item.tri1);
  const n2 = normalizarNota(item.tri2);
  const n3 = normalizarNota(item.tri3);
  return [n1, n2, n3];
}

/**
 * Extrai as três faltas de um item, seja no formato antigo
 * (faltas: [a, b, c]) ou no formato da API.
 */
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

/**
 * Retorna o nome da disciplina de forma segura.
 */
function nomeDisciplina(item) {
  return item && item.disciplina ? String(item.disciplina) : "";
}

/* ---------------------------------------------------------
   CONCEITO: forEach
   forEach percorre cada item de um array executando uma ação.
   --------------------------------------------------------- */

/**
 * Cria uma linha da tabela para uma disciplina.
 */
function criarLinhaTabela(item) {
  // Normaliza as três notas do trimestre
  const [n1, n2, n3] = extrairNotas(item);

  // Média apenas com notas disponíveis
  const media = calcularMedia([n1, n2, n3]);

  // Faltas somadas
  const faltas = somarFaltas(extrairFaltas(item));

  // Situação
  const situacao = definirSituacao(media);

  // Classe de cor da situação
  let classeSituacao = "situacao-neutro";
  if (situacao === "Bom desempenho") classeSituacao = "situacao-bom";
  if (situacao === "Atenção") classeSituacao = "situacao-atencao";

  // Cria o elemento <tr>
  const tr = document.createElement("tr");

  // Célula do nome da disciplina (com textContent para segurança)
  const tdNome = document.createElement("td");
  tdNome.textContent = nomeDisciplina(item);
  tr.appendChild(tdNome);

  // Demais células
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

  // Célula da situação com classe de cor
  const tdSituacao = document.createElement("td");
  tdSituacao.className = classeSituacao;
  tdSituacao.textContent = situacao;
  tr.appendChild(tdSituacao);

  return tr;
}

/**
 * Preenche a tabela inteira.
 * Limpa antes para permitir atualizações sem duplicar linhas.
 */
function preencherTabela() {
  // CONCEITO: DOM
  // DOM é a representação da página no JavaScript.
  // Com ele conseguimos pegar elementos e alterar seu conteúdo.
  const corpoTabela = document.getElementById("corpoTabela");

  // Limpa a tabela antes de reconstruir (evita duplicação)
  corpoTabela.innerHTML = "";

  const lista = obterListaDisciplinas();

  lista.forEach((item) => {
    const linha = criarLinhaTabela(item);
    corpoTabela.appendChild(linha);
  });
}

/**
 * Cria um card de resumo e devolve o elemento pronto.
 */
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

/**
 * Calcula os dados dos cards de resumo e os insere na página.
 * Limpa antes para permitir atualizações sem duplicar cards.
 */
function preencherCards() {
  const container = document.getElementById("cardsResumo");

  // Limpa os cards antes de reconstruir (evita duplicação)
  container.innerHTML = "";

  const lista = obterListaDisciplinas();

  // Listas auxiliares
  const medias = [];
  let totalFaltas = 0;
  let bomDesempenho = 0;
  let atencao = 0;

  lista.forEach((item) => {
    const [n1, n2, n3] = extrairNotas(item);
    const media = calcularMedia([n1, n2, n3]);

    if (media !== null) {
      medias.push(media);
      // CONCEITO: if
      // if executa um bloco somente quando a condição é verdadeira.
      if (media >= MEDIA_MINIMA) bomDesempenho++;
      else atencao++;
    }

    totalFaltas += somarFaltas(extrairFaltas(item));
  });

  // Média geral (média das médias disponíveis)
  let mediaGeral = null;
  if (medias.length > 0) {
    mediaGeral = medias.reduce((a, b) => a + b, 0) / medias.length;
  }

  // Card 1 — Média geral
  container.appendChild(
    criarCard(
      "Média Geral",
      mediaGeral === null ? "—" : formatarNota(mediaGeral),
      "Média das médias disponíveis"
    )
  );

  // Card 2 — Total de faltas
  container.appendChild(
    criarCard("Total de Faltas", String(totalFaltas), "Soma de todas as disciplinas")
  );

  // Card 3 — Disciplinas com bom desempenho
  container.appendChild(
    criarCard(
      "Bom Desempenho",
      String(bomDesempenho),
      "Disciplinas com média ≥ 6,0"
    )
  );

  // Card 4 — Disciplinas que precisam de atenção
  container.appendChild(
    criarCard(
      "Atenção",
      String(atencao),
      "Disciplinas com média < 6,0"
    )
  );

  // Card 5 — Frequência (FICTÍCIA / DEMONSTRATIVA)
  container.appendChild(
    criarCard(
      "Frequência",
      FREQUENCIA_DEMONSTRATIVA + "%",
      "Frequência adequada (valor demonstrativo)"
    )
  );
}

/* ---------------------------------------------------------
   FONTE DOS DADOS
   Regra obrigatória:
   DADOS DA API > DADOS LOCAIS
   Se a API retornar disciplinas, usamos SOMENTE elas.
   Só usamos as disciplinas locais quando a API não tem dados.
   --------------------------------------------------------- */
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
   TELA DE LOGIN — ACESSO POR PIN
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

/**
 * Faz o POST para abrir o boletim na API.
 */
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

/**
 * Trata o clique em "Entrar".
 */
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

    // Guarda o PIN somente em memória
    pinSessao = pin;

    // Limpa o campo do PIN imediatamente
    limparCampoPin();

    // Decide quais dados usar
    if (resultado && resultado.dados) {
      dadosAtuais = resultado.dados;
    } else {
      // "novo": true ou "novo": false com dados null → usa dados locais
      dadosAtuais = null;
    }

    // Esconde o login e mostra o boletim
    document.getElementById("areaLogin").style.display = "none";
    document.getElementById("conteudoBoletim").style.display = "block";
    document.getElementById("areaEdicao").style.display = "block";

    // Atualiza a tela
    preencherCards();
    preencherTabela();
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
   EDIÇÃO DE NOTAS E FALTAS
   Regras diferentes para entrada do aluno:
   - Nota: número entre 0 e 10, ponto ou vírgula, ou vazio (null)
   - Faltas: inteiro >= 0
   Valor inválido NÃO é convertido em null/zero e NÃO é salvo.
   --------------------------------------------------------- */

/**
 * Valida a nota digitada pelo aluno.
 * Retorna { valido: true, valor: number|null } ou { valido: false }.
 */
function validarNotaEditada(texto) {
  const bruto = String(texto).trim();

  if (bruto === "") {
    return { valido: true, valor: null };
  }

  // Aceita apenas ponto ou vírgula como separador decimal
  const normalizado = bruto.replace(",", ".");
  const numero = Number(normalizado);

  if (isNaN(numero)) return { valido: false };
  if (numero < 0 || numero > 10) return { valido: false };

  // Rejeita formatos como "75" (que viraria 75 > 10) já cobertos acima.
  // Rejeita também "1.2.3" — Number já retorna NaN nesses casos.
  return { valido: true, valor: numero };
}

/**
 * Valida as faltas digitadas pelo aluno.
 * Retorna { valido: true, valor: number } ou { valido: false }.
 */
function validarFaltasEditadas(texto) {
  const bruto = String(texto).trim();

  if (bruto === "") return { valido: false };
  if (!/^\d+$/.test(bruto)) return { valido: false };

  const numero = Number(bruto);
  if (!Number.isInteger(numero) || numero < 0) return { valido: false };

  return { valido: true, valor: numero };
}

/**
 * Cria um campo de edição rotulado.
 */
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

/**
 * Monta o painel de edição a partir dos dados atuais.
 */
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

/**
 * Lê o painel de edição e monta os dados a enviar.
 * Retorna { ok: true, dados } ou { ok: false } se houver campo inválido.
 */
function coletarDadosEditados() {
  const fonte = obterListaDisciplinas();
  const novasDisciplinas = [];
  let valido = true;

  // Limpa classes de inválido antes de validar
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

    // Mantém o nome da disciplina (não pode ser alterado)
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

/**
 * Faz o PUT para salvar os dados na API.
 */
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

/**
 * Trata o clique em "Salvar alterações".
 */
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

    // Atualiza os dados em memória
    dadosAtuais = resultado.dados;

    // Atualiza a tela
    preencherCards();
    preencherTabela();

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
    // NÃO apaga o que o estudante digitou e NÃO fecha a edição
  } finally {
    botao.disabled = false;
  }
}

/**
 * Trata o clique em "Alterar dados".
 */
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

/**
 * Trata o clique em "Cancelar".
 */
function tratarCancelar() {
  const painel = document.getElementById("painelEdicao");
  painel.style.display = "none";
  mostrarMensagemEdicao("");
}

/* ---------------------------------------------------------
   Inicialização: roda quando a página termina de carregar.
   --------------------------------------------------------- */
document.addEventListener("DOMContentLoaded", () => {
  // Mostra turma e chamada configuradas na tela de login
  const elTurma = document.getElementById("loginTurma");
  const elChamada = document.getElementById("loginChamada");
  if (elTurma) elTurma.textContent = CONFIG_ALUNO.turma;
  if (elChamada) elChamada.textContent = String(CONFIG_ALUNO.numeroChamada);

  // Conecta os botões
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