/* =========================================================
   BOLETIM DIGITAL — 8º ANO
   Dados fictícios para estudo. Nenhum dado pessoal real.
   ========================================================= */

/* ---------------------------------------------------------
   CONCEITO: array
   Um array é uma lista. Aqui guardamos a lista de disciplinas.
   Cada item da lista é um objeto (veja abaixo).
   --------------------------------------------------------- */
const disciplinas = [
  { disciplina: "Língua Portuguesa", tri1: 82, tri2: "7,8", tri3: 85, faltas: [2, 1, 1] },
  { disciplina: "Matemática", tri1: 52, tri2: "5,8", tri3: null, faltas: [3, 2, 1] },
  { disciplina: "Ciências", tri1: "8,1", tri2: 76, tri3: 8.0, faltas: [1, 2, 0] },
  { disciplina: "História", tri1: 7.0, tri2: 84, tri3: null, faltas: [1, 1, 1] },
  { disciplina: "Geografia", tri1: 68, tri2: 7.3, tri3: "7,9", faltas: [0, 1, 1] },
  { disciplina: "Língua Inglesa", tri1: 86, tri2: "8,1", tri3: 8.7, faltas: [1, 0, 0] },
  { disciplina: "Arte", tri1: 9.0, tri2: 92, tri3: null, faltas: [1, 1, 0] },
  { disciplina: "Educação Física", tri1: 95, tri2: 9.0, tri3: "9,4", faltas: [0, 1, 0] },
  { disciplina: "Educação Digital", tri1: 88, tri2: 9.1, tri3: 93, faltas: [1, 0, 1] },
  { disciplina: "Educação Financeira", tri1: 74, tri2: "7,8", tri3: null, faltas: [1, 1, 1] },
  { disciplina: "Estudo Orientado", tri1: 8.0, tri2: 83, tri3: "8,5", faltas: [0, 1, 0] },
  { disciplina: "Redação e Leitura", tri1: 62, tri2: "6,8", tri3: null, faltas: [2, 1, 1] },
  { disciplina: "Pensamento Lógico", tri1: 48, tri2: 5.6, tri3: "6,0", faltas: [2, 2, 1] },
  { disciplina: "Literatura Arte e Movimento", tri1: "7,7", tri2: 80, tri3: null, faltas: [1, 0, 1] },
  { disciplina: "Práticas Experimentais", tri1: 58, tri2: "6,2", tri3: 6.4, faltas: [1, 1, 1] }
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
   CONCEITO: função
   Uma função é um bloco de código que executa uma tarefa.
   --------------------------------------------------------- */

/**
 * Normaliza uma nota para a escala 0–10.
 * Regras:
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
   CONCEITO: forEach
   forEach percorre cada item de um array executando uma ação.
   --------------------------------------------------------- */

/**
 * Cria uma linha da tabela para uma disciplina.
 */
function criarLinhaTabela(item) {
  // Normaliza as três notas do trimestre
  const n1 = normalizarNota(item.tri1);
  const n2 = normalizarNota(item.tri2);
  const n3 = normalizarNota(item.tri3);

  // Média apenas com notas disponíveis
  const media = calcularMedia([n1, n2, n3]);

  // Faltas somadas
  const faltas = somarFaltas(item.faltas);

  // Situação
  const situacao = definirSituacao(media);

  // Classe de cor da situação
  let classeSituacao = "situacao-neutro";
  if (situacao === "Bom desempenho") classeSituacao = "situacao-bom";
  if (situacao === "Atenção") classeSituacao = "situacao-atencao";

  // Cria o elemento <tr>
  const tr = document.createElement("tr");

  tr.innerHTML = `
    <td>${item.disciplina}</td>
    <td>${formatarNota(n1)}</td>
    <td>${formatarNota(n2)}</td>
    <td>${formatarNota(n3)}</td>
    <td>${media === null ? "—" : formatarNota(media)}</td>
    <td>${faltas}</td>
    <td class="${classeSituacao}">${situacao}</td>
  `;

  return tr;
}

/**
 * Preenche a tabela inteira.
 */
function preencherTabela() {
  // CONCEITO: DOM
  // DOM é a representação da página no JavaScript.
  // Com ele conseguimos pegar elementos e alterar seu conteúdo.
  const corpoTabela = document.getElementById("corpoTabela");

  disciplinas.forEach((item) => {
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
  card.innerHTML = `
    <div class="card-titulo">${titulo}</div>
    <div class="card-valor">${valor}</div>
    <div class="card-detalhe">${detalhe}</div>
  `;
  return card;
}

/**
 * Calcula os dados dos cards de resumo e os insere na página.
 */
function preencherCards() {
  const container = document.getElementById("cardsResumo");

  // Listas auxiliares
  const medias = [];
  let totalFaltas = 0;
  let bomDesempenho = 0;
  let atencao = 0;

  disciplinas.forEach((item) => {
    const n1 = normalizarNota(item.tri1);
    const n2 = normalizarNota(item.tri2);
    const n3 = normalizarNota(item.tri3);
    const media = calcularMedia([n1, n2, n3]);

    if (media !== null) {
      medias.push(media);
      // CONCEITO: if
      // if executa um bloco somente quando a condição é verdadeira.
      if (media >= MEDIA_MINIMA) bomDesempenho++;
      else atencao++;
    }

    totalFaltas += somarFaltas(item.faltas);
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
    criarCard("Total de Faltas", totalFaltas, "Soma de todas as disciplinas")
  );

  // Card 3 — Disciplinas com bom desempenho
  container.appendChild(
    criarCard(
      "Bom Desempenho",
      bomDesempenho,
      "Disciplinas com média ≥ 6,0"
    )
  );

  // Card 4 — Disciplinas que precisam de atenção
  container.appendChild(
    criarCard(
      "Atenção",
      atencao,
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
   Inicialização: roda quando a página termina de carregar.
   --------------------------------------------------------- */
document.addEventListener("DOMContentLoaded", () => {
  preencherCards();
  preencherTabela();
});