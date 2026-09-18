/* =========================================================================
   CYBER LIVROS — LÓGICA DO SITE (scripts.js)
   =========================================================================
   Este arquivo é responsável por:
     1. Guardar a lista de livros do acervo (dados);
     2. Montar a barra lateral de categorias, a partir da lista de livros;
     3. Montar a grade do acervo completo;
     4. Filtrar os livros por categoria selecionada e/ou termo de busca;
     5. Abrir, ao clicar em um livro, um MODAL (janela sobre a própria
        página) com a sinopse e outros livros do(a) mesmo(a) autor(a),
        sem nunca sair da página inicial;
     6. Abrir o PDF do livro NA MESMA ABA quando o usuário confirma a
        leitura, clicando no botão "Ler agora" dentro do modal.

   COMO ADICIONAR UM NOVO LIVRO NO FUTURO:
   Basta acrescentar um novo objeto dentro da constante "listaDeLivros",
   seguindo o mesmo modelo dos livros já cadastrados, e colocar o arquivo
   PDF correspondente dentro da pasta "livros/". Se a categoria ou o(a)
   autor(a) já existirem, eles são reaproveitados automaticamente (na
   barra lateral e na lista de "mais livros do(a) autor(a)"), sem
   precisar editar o HTML nem esta lógica.
   ========================================================================= */

"use strict";


/* -------------------------------------------------------------------------
   1. DADOS DO ACERVO
   Cada livro é representado por um objeto com as seguintes propriedades:

     titulo         -> nome do livro, exibido no cartão e no modal
     autor          -> nome do autor (ou autores) do livro
     categoria      -> gênero ou área do livro (também usada na barra lateral)
     sinopse        -> resumo curto exibido no modal, antes de abrir o PDF
     caminhoDaCapa  -> caminho da imagem da capa (pasta "assets/")
     caminhoDoPdf   -> caminho do arquivo PDF do livro (pasta "livros/")

   IMPORTANTE SOBRE OS ARQUIVOS PDF:
   Por respeito aos direitos autorais, este arquivo já vem pronto para
   funcionar, mas os PDFs devem ser adicionados por você na pasta "livros/",
   usando exatamente os nomes de arquivo indicados abaixo em
   "caminhoDoPdf". Publique aqui apenas obras de domínio público ou obras
   que você tenha autorização/licença para distribuir gratuitamente
   (veja "livros/LEIA-ME.txt" para mais detalhes).
---------------------------------------------------------------------------- */
const listaDeLivros = [
    {
        titulo: "As 48 Leis do Poder",
        autor: "Robert Greene",
        categoria: "Desenvolvimento pessoal",
        sinopse: "Uma reunião de princípios sobre estratégia, influência e conquista de poder, ilustrados com episódios históricos de líderes, estrategistas e figuras que buscaram e mantiveram posições de destaque.",
        caminhoDaCapa: "assets/48-leis-do-poder.jpg",
        caminhoDoPdf: "livros/48-leis-do-poder.pdf"
    },
    {
        titulo: "Casais Inteligentes Enriquecem Juntos",
        autor: "Gustavo Cerbasi",
        categoria: "Finanças",
        sinopse: "Um guia prático sobre como casais podem organizar as finanças em conjunto, evitar conflitos por dinheiro e planejar, juntos, objetivos financeiros de curto, médio e longo prazo.",
        caminhoDaCapa: "assets/casais-inteligentes-enriquecem-juntos.jpg",
        caminhoDoPdf: "livros/casais-inteligentes-enriquecem-juntos.pdf"
    },
    {
        titulo: "Código Limpo",
        autor: "Robert C. Martin",
        categoria: "Tecnologia",
        sinopse: "Um guia de boas práticas de programação, com princípios e técnicas para escrever código mais legível, organizado e fácil de manter ao longo do tempo.",
        caminhoDaCapa: "assets/codigo-limpo.jpg",
        caminhoDoPdf: "livros/codigo-limpo.pdf"
    },
    {
        titulo: "Como Fazer Amigos e Influenciar Pessoas",
        autor: "Dale Carnegie",
        categoria: "Desenvolvimento pessoal",
        sinopse: "Um clássico sobre relacionamento interpessoal, reunindo princípios práticos para se comunicar melhor, conquistar a confiança das pessoas e construir relações mais positivas.",
        caminhoDaCapa: "assets/como-fazer-amigos-e-influenciar-pessoas.jpg",
        caminhoDoPdf: "livros/como-fazer-amigos-e-influenciar-pessoas.pdf"
    },
    {
        titulo: "Harry Potter e a Ordem da Fênix",
        autor: "J.K. Rowling",
        categoria: "Ficção",
        sinopse: "Quinto livro da saga: Harry retorna a Hogwarts em um ano marcado por desconfiança do Ministério da Magia, uma nova professora autoritária e o fortalecimento da resistência contra o retorno de Voldemort.",
        caminhoDaCapa: "assets/harry-potter-e-a-ordem-da-fenix.jpg",
        caminhoDoPdf: "livros/harry-potter-e-a-ordem-da-fenix.pdf"
    }
];

/** Nome usado para representar "sem filtro de categoria" na barra lateral. */
const CATEGORIA_TODOS = "Todos";


/* -------------------------------------------------------------------------
   2. ESTADO ATUAL DOS FILTROS
   Guarda o que o usuário selecionou até agora (categoria e busca), para
   que os dois filtros possam ser aplicados juntos.
---------------------------------------------------------------------------- */
const estadoDosFiltros = {
    categoriaSelecionada: CATEGORIA_TODOS,
    termoDeBusca: ""
};


/* -------------------------------------------------------------------------
   3. REFERÊNCIAS AOS ELEMENTOS DA PÁGINA (HTML)
---------------------------------------------------------------------------- */
const elementoListaCategorias = document.getElementById("lista-categorias");
const elementoGradeDeLivros = document.getElementById("grade-de-livros");
const elementoCampoBusca = document.getElementById("campo-busca");
const elementoContadorResultados = document.getElementById("contador-resultados");
const elementoMensagemSemResultado = document.getElementById("mensagem-sem-resultado");
const elementoAnoAtual = document.getElementById("ano-atual");

// Elementos do modal de detalhes do livro (sinopse + "ler agora")
const elementoModal = document.getElementById("modal-livro");
const elementoBotaoFecharModal = document.getElementById("botao-fechar-modal");
const elementoModalCapa = document.getElementById("modal-livro-capa");
const elementoModalCategoria = document.getElementById("modal-livro-categoria");
const elementoModalTitulo = document.getElementById("modal-livro-titulo");
const elementoModalAutor = document.getElementById("modal-livro-autor");
const elementoModalSinopse = document.getElementById("modal-livro-sinopse");
const elementoModalBotaoLer = document.getElementById("modal-livro-botao-ler");
const elementoModalSecaoMaisDoAutor = document.getElementById("modal-livro-secao-mais-do-autor");
const elementoModalTituloMaisDoAutor = document.getElementById("modal-livro-titulo-mais-do-autor");
const elementoModalListaMaisDoAutor = document.getElementById("modal-livro-lista-mais-do-autor");


/* -------------------------------------------------------------------------
   4. FUNÇÕES DE APOIO (CATEGORIAS)
---------------------------------------------------------------------------- */

/**
 * Extrai a lista de categorias únicas presentes em "listaDeLivros",
 * em ordem alfabética, sempre com "Todos" na primeira posição.
 *
 * @returns {Array<string>} Lista de categorias para exibir na barra lateral.
 */
function obterCategoriasDisponiveis() {
    const categoriasUnicas = new Set(
        listaDeLivros.map(function (livro) {
            return livro.categoria;
        })
    );

    const categoriasOrdenadas = Array.from(categoriasUnicas).sort(function (a, b) {
        return a.localeCompare(b, "pt-BR");
    });

    return [CATEGORIA_TODOS, ...categoriasOrdenadas];
}


/* -------------------------------------------------------------------------
   5. FUNÇÕES DE MONTAGEM DA TELA (CARTÕES E GRADE)
---------------------------------------------------------------------------- */

/**
 * Cria o elemento HTML (cartão) que representa um único livro na grade
 * principal. Tanto a capa quanto o título abrem o MODAL de detalhes
 * (sinopse) em vez de irem direto para o PDF — a leitura só começa
 * quando o usuário confirma no botão "Ler agora" dentro do modal.
 *
 * @param {Object} livro - Objeto com os dados do livro (veja "listaDeLivros").
 * @returns {HTMLElement} O elemento <article> pronto para ser inserido na página.
 */
function criarCartaoDeLivro(livro) {
    const cartao = document.createElement("article");
    cartao.className = "cartao-livro";

    cartao.innerHTML = `
        <button
            type="button"
            class="cartao-livro__capa-botao"
            aria-label="Ver detalhes de ${livro.titulo}, de ${livro.autor}"
        >
            <img
                class="cartao-livro__capa"
                src="${livro.caminhoDaCapa}"
                alt="Capa do livro ${livro.titulo}"
                loading="lazy"
            >
        </button>
        <h3 class="cartao-livro__titulo">
            <button type="button" class="cartao-livro__titulo-link">
                ${livro.titulo}
            </button>
        </h3>
        <p class="cartao-livro__autor">${livro.autor}</p>
        <span class="cartao-livro__categoria">${livro.categoria}</span>
    `;

    // Tanto o clique na capa quanto no título abrem o mesmo modal.
    const botoesQueAbremModal = cartao.querySelectorAll(
        ".cartao-livro__capa-botao, .cartao-livro__titulo-link"
    );
    botoesQueAbremModal.forEach(function (botao) {
        botao.addEventListener("click", function () {
            abrirModalDoLivro(livro);
        });
    });

    return cartao;
}

/**
 * Desenha a lista de livros filtrados dentro da grade principal,
 * substituindo o conteúdo atual da grade.
 *
 * @param {Array<Object>} livros - Lista de livros a serem exibidos.
 */
function renderizarGradeDeLivros(livros) {
    elementoGradeDeLivros.innerHTML = "";

    livros.forEach(function (livro) {
        const cartao = criarCartaoDeLivro(livro);
        elementoGradeDeLivros.appendChild(cartao);
    });
}

/**
 * Monta a barra lateral de categorias, marcando visualmente a categoria
 * atualmente selecionada.
 */
function renderizarCategorias() {
    const categorias = obterCategoriasDisponiveis();

    elementoListaCategorias.innerHTML = "";

    categorias.forEach(function (categoria) {
        const item = document.createElement("li");
        const botao = document.createElement("button");

        botao.type = "button";
        botao.className = "botao-categoria";
        botao.textContent = categoria;

        if (categoria === estadoDosFiltros.categoriaSelecionada) {
            botao.classList.add("esta-selecionada");
            botao.setAttribute("aria-current", "true");
        }

        botao.addEventListener("click", function () {
            selecionarCategoria(categoria);
        });

        item.appendChild(botao);
        elementoListaCategorias.appendChild(item);
    });
}


/* -------------------------------------------------------------------------
   6. MODAL DE DETALHES DO LIVRO (SINOPSE + MAIS DO(A) AUTOR(A))
---------------------------------------------------------------------------- */

/**
 * Busca outros livros do(a) mesmo(a) autor(a) no acervo, excluindo o
 * próprio livro que está sendo exibido no modal.
 *
 * @param {Object} livroAtual - Livro atualmente aberto no modal.
 * @returns {Array<Object>} Outros livros do(a) mesmo(a) autor(a).
 */
function obterOutrosLivrosDoAutor(livroAtual) {
    return listaDeLivros.filter(function (livro) {
        return livro.autor === livroAtual.autor && livro.titulo !== livroAtual.titulo;
    });
}

/**
 * Preenche e mostra a seção "Mais livros do(a) autor(a)" dentro do
 * modal. Se não houver nenhum outro livro do(a) mesmo(a) autor(a) no
 * acervo, a seção inteira fica escondida.
 *
 * @param {Object} livroAtual - Livro atualmente aberto no modal.
 */
function renderizarMaisLivrosDoAutor(livroAtual) {
    const outrosLivros = obterOutrosLivrosDoAutor(livroAtual);

    if (outrosLivros.length === 0) {
        elementoModalSecaoMaisDoAutor.hidden = true;
        return;
    }

    elementoModalTituloMaisDoAutor.textContent = `Mais livros de ${livroAtual.autor}`;
    elementoModalListaMaisDoAutor.innerHTML = "";

    outrosLivros.forEach(function (livro) {
        const miniatura = document.createElement("button");
        miniatura.type = "button";
        miniatura.className = "cartao-livro-mini";
        miniatura.innerHTML = `
            <img
                class="cartao-livro-mini__capa"
                src="${livro.caminhoDaCapa}"
                alt="Capa do livro ${livro.titulo}"
                loading="lazy"
            >
            <span class="cartao-livro-mini__titulo">${livro.titulo}</span>
        `;

        // Clicar em um livro do autor troca o conteúdo do modal para
        // esse livro, sem fechar a janela nem sair da página.
        miniatura.addEventListener("click", function () {
            abrirModalDoLivro(livro);
        });

        elementoModalListaMaisDoAutor.appendChild(miniatura);
    });

    elementoModalSecaoMaisDoAutor.hidden = false;
}

/**
 * Preenche o modal com os dados do livro escolhido e o exibe por cima
 * da página. Esta é a função chamada sempre que o usuário clica em um
 * livro (seja na grade principal, seja na lista "mais do(a) autor(a)").
 *
 * @param {Object} livro - Livro a ser exibido no modal.
 */
function abrirModalDoLivro(livro) {
    elementoModalCapa.src = livro.caminhoDaCapa;
    elementoModalCapa.alt = `Capa do livro ${livro.titulo}`;
    elementoModalCategoria.textContent = livro.categoria;
    elementoModalTitulo.textContent = livro.titulo;
    elementoModalAutor.textContent = livro.autor;
    elementoModalSinopse.textContent = livro.sinopse;
    elementoModalBotaoLer.href = livro.caminhoDoPdf;

    renderizarMaisLivrosDoAutor(livro);

    // Rola o conteúdo do modal para o topo ao trocar de livro.
    elementoModal.scrollTop = 0;

    // "showModal" exibe o <dialog> por cima da página, com fundo
    // escurecido e captura de foco — sem precisar de nenhuma biblioteca.
    if (!elementoModal.open) {
        elementoModal.showModal();
    }
}

/**
 * Fecha o modal de detalhes do livro.
 */
function fecharModalDoLivro() {
    elementoModal.close();
}


/* -------------------------------------------------------------------------
   7. FILTROS (CATEGORIA + BUSCA) E ATUALIZAÇÃO GERAL DA TELA
---------------------------------------------------------------------------- */

/**
 * Aplica, em conjunto, o filtro de categoria e o filtro de texto sobre
 * a lista completa de livros.
 *
 * @returns {Array<Object>} Lista de livros que atendem aos filtros atuais.
 */
function obterLivrosFiltrados() {
    const termoNormalizado = estadoDosFiltros.termoDeBusca.trim().toLowerCase();

    return listaDeLivros.filter(function (livro) {
        const pertenceACategoria =
            estadoDosFiltros.categoriaSelecionada === CATEGORIA_TODOS ||
            livro.categoria === estadoDosFiltros.categoriaSelecionada;

        const correspondeABusca =
            termoNormalizado === "" ||
            livro.titulo.toLowerCase().includes(termoNormalizado) ||
            livro.autor.toLowerCase().includes(termoNormalizado);

        return pertenceACategoria && correspondeABusca;
    });
}

/**
 * Atualiza o texto que informa quantos livros foram encontrados e
 * mostra/esconde a mensagem de "nenhum resultado".
 *
 * @param {number} quantidadeEncontrada - Quantidade de livros exibidos no momento.
 */
function atualizarContadorDeResultados(quantidadeEncontrada) {
    const totalDeLivros = listaDeLivros.length;

    if (estadoDosFiltros.categoriaSelecionada === CATEGORIA_TODOS && estadoDosFiltros.termoDeBusca === "") {
        elementoContadorResultados.textContent = `${totalDeLivros} livros no acervo`;
    } else {
        elementoContadorResultados.textContent = `${quantidadeEncontrada} de ${totalDeLivros} livros`;
    }

    elementoMensagemSemResultado.hidden = quantidadeEncontrada !== 0;
}

/**
 * Recalcula os livros filtrados e redesenha a grade principal e o
 * contador de resultados. É a função central, chamada sempre que a
 * busca ou a categoria selecionada mudam.
 */
function atualizarTela() {
    const livrosFiltrados = obterLivrosFiltrados();
    renderizarGradeDeLivros(livrosFiltrados);
    atualizarContadorDeResultados(livrosFiltrados.length);
}

/**
 * Define a categoria selecionada pelo usuário e atualiza a tela.
 *
 * @param {string} categoria - Categoria escolhida na barra lateral.
 */
function selecionarCategoria(categoria) {
    estadoDosFiltros.categoriaSelecionada = categoria;
    renderizarCategorias();
    atualizarTela();
}

/**
 * Trata o evento de digitação no campo de busca: atualiza o termo de
 * busca guardado no estado e redesenha a tela.
 */
function tratarDigitacaoNaBusca() {
    estadoDosFiltros.termoDeBusca = elementoCampoBusca.value;
    atualizarTela();
}


/* -------------------------------------------------------------------------
   8. INICIALIZAÇÃO DA PÁGINA
   Função executada assim que o HTML termina de carregar.
---------------------------------------------------------------------------- */
function inicializarPagina() {
    renderizarCategorias();
    atualizarTela();

    elementoCampoBusca.addEventListener("input", tratarDigitacaoNaBusca);

    // Fecha o modal ao clicar no botão "X".
    elementoBotaoFecharModal.addEventListener("click", fecharModalDoLivro);

    // Fecha o modal ao clicar fora da caixa de conteúdo (na área escurecida).
    // O clique em qualquer parte do próprio <dialog> que não seja o
    // conteúdo interno é considerado "clique no fundo".
    elementoModal.addEventListener("click", function (evento) {
        if (evento.target === elementoModal) {
            fecharModalDoLivro();
        }
    });

    // A tecla Esc já fecha o <dialog> automaticamente (comportamento
    // nativo do navegador), então nenhum código extra é necessário aqui.

    // Preenche o ano atual no rodapé automaticamente.
    elementoAnoAtual.textContent = new Date().getFullYear();
}

document.addEventListener("DOMContentLoaded", inicializarPagina);
