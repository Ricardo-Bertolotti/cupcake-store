console.log("🧁 [loja.js] Script carregado (versão RB7-BANK-MODE)");

// Endpoints base usados por todo o módulo
const API = "http://localhost:3000";
const apiProdutos = `${API}/produtos`;
const apiFavoritos = `${API}/favoritos`;
const apiCarrinho = `${API}/carrinho`;

let gridProdutos;
// Recupera usuário salvo localmente; fallback simples para id=1
let usuario = JSON.parse(localStorage.getItem("usuario")) || { id: 1 };
let produtosCache = [];   // Cache de produtos para filtros/render
let favoritos = [];       // Estrutura local dos favoritos carregados

// ====================================================
// 🖼️ Caminho da imagem
// Resolve URLs incompletas, externas ou internas
// ====================================================
function caminhoImagem(produto) {
  const img = produto.imagem;
  if (!img) return "../assets/img/placeholder.jpg";     // fallback seguro
  if (img.startsWith("http")) return img;               // URL completa
  if (img.includes("assets/"))                          // caminho parcial interno
    return img.startsWith("..") ? img : `../${img}`;
  return `../assets/img/produtos/${img}`;               // padrão local
}

// ====================================================
// 💖 Carregar favoritos do banco
// Busca no backend e preenche array local
// ====================================================
async function carregarFavoritos() {
  if (!usuario) {
    favoritos = [];
    return;
  }

  try {
    const resp = await fetch(`${apiFavoritos}/${usuario.id}`);
    favoritos = await resp.json();
  } catch (err) {
    console.error("Erro ao carregar favoritos:", err);
    favoritos = []; // fallback seguro
  }
}

// ====================================================
// 💖 Alternar favorito
// Insere ou remove no backend e atualiza UI/local
// ====================================================
async function alternarFavorito(produto, el) {
  if (!usuario) {
    mostrarAviso("Faça login para usar favoritos 💖");
    return;
  }

  el.disabled = true; // Evita duplo clique durante requisição

  // Verifica favorito compatível com diferentes retornos do backend
  const isFav = favoritos.some(
    (f) => f.produto_id === produto.id || f.id === produto.id
  );

  try {
    if (isFav) {
      // Remove do banco
      await fetch(apiFavoritos, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          usuario_id: usuario.id,
          produto_id: produto.id,
        }),
      });

      // Atualiza array local limpando ambas as formas possíveis
      favoritos = favoritos.filter(
        (f) => f.produto_id !== produto.id && f.id !== produto.id
      );

      el.innerHTML = "🤍 Adicionar aos favoritos";
    } else {
      // Adiciona ao banco
      await fetch(apiFavoritos, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          usuario_id: usuario.id,
          produto_id: produto.id,
        }),
      });

      favoritos.push({ produto_id: produto.id });
      el.innerHTML = "💖 Remover dos favoritos";
    }
  } catch (err) {
    console.error("Erro ao alternar favorito:", err);
    mostrarAviso("❌ Erro ao atualizar favoritos.");
  } finally {
    el.disabled = false; // Reabilita o botão
  }
}

// ====================================================
// 🎨 Renderizar produtos
// Gera cards dinamicamente + listeners
// ====================================================
function renderProdutos(lista) {
  if (!gridProdutos) return;

  gridProdutos.innerHTML = ""; // limpa antes de render

  if (!lista || lista.length === 0) {
    gridProdutos.innerHTML =
      '<p style="text-align:center;color:#777;">Nenhum produto disponível 🍰</p>';
    return;
  }

  lista.forEach((p) => {
    const card = document.createElement("div");
    card.classList.add("product-card");

    const imgSrc = caminhoImagem(p);

    // Verifica favorito (compatível com diferentes formatos do backend)
    const isFav = favoritos.some(
      (f) => f.produto_id === p.id || f.id === p.id
    );

    // Label do botão de favorito
    const textoFav = isFav
      ? "💖 Remover dos favoritos"
      : "🤍 Adicionar aos favoritos";

    // Exibição da disponibilidade
    const estoqueTxt =
      p.quantidade > 0
        ? `<span style="color:#4CAF50;font-weight:600;">Em estoque: ${p.quantidade}</span>`
        : `<span style="color:#e74c3c;font-weight:600;">Esgotado</span>`;

    // HTML principal do card
    card.innerHTML = `
      <div class="fav-area" data-id="${p.id}">
        ${textoFav}
      </div>

      <img src="${imgSrc}" alt="${p.nome}" />
      <h3>${p.nome}</h3>
      <p>${p.descricao || ""}</p>
      <p class="price">R$ ${Number(p.preco).toFixed(2)}</p>
      <p>${estoqueTxt}</p>

      <div class="box-qtd">
        <button type="button" class="btnMenos" data-id="${p.id}">−</button>
        <span id="qtd-${p.id}" class="qtd">1</span>
        <button type="button" class="btnMais" data-id="${p.id}">+</button>
      </div>

      <button type="button" class="btn-primary btn-add" data-id="${p.id}">
        Adicionar ao carrinho 🛒
      </button>
    `;

    // Desabilita botão se estoque = 0
    if (p.quantidade <= 0) {
      const btn = card.querySelector(".btn-add");
      btn.disabled = true;
      btn.style.background = "#999";
      btn.textContent = "Esgotado ❌";
    }

    gridProdutos.appendChild(card);
  });

  // ====================================================
  // Eventos dos cards — favoritos, quantidade, carrinho
  // ====================================================

  // Alternar favorito
  document.querySelectorAll(".fav-area").forEach((el) => {
    el.addEventListener("click", (e) => {
      e.preventDefault();
      const id = e.currentTarget.dataset.id;
      const produto = produtosCache.find((p) => p.id == id);
      if (produto) alternarFavorito(produto, el);
    });
  });

  // Botão de aumentar quantidade
  document.querySelectorAll(".btnMais").forEach((btn) =>
    btn.addEventListener("click", (e) => {
      e.preventDefault();
      const id = e.currentTarget.dataset.id;
      const prod = produtosCache.find((p) => p.id == id);
      if (!prod) return;

      const span = document.getElementById(`qtd-${id}`);
      let atual = Number(span.textContent);

      if (atual < prod.quantidade) span.textContent = atual + 1;
    })
  );

  // Botão de diminuir quantidade
  document.querySelectorAll(".btnMenos").forEach((btn) =>
    btn.addEventListener("click", (e) => {
      e.preventDefault();
      const id = e.currentTarget.dataset.id;
      const span = document.getElementById(`qtd-${id}`);

      let atual = Number(span.textContent);
      if (atual > 1) span.textContent = atual - 1;
    })
  );

  // Adicionar ao carrinho
  document.querySelectorAll(".btn-add").forEach((btn) =>
    btn.addEventListener("click", async (e) => {
      e.preventDefault();
      const id = e.currentTarget.dataset.id;

      const produto = produtosCache.find((p) => p.id == id);
      if (!produto) return;

      const qtdSpan = document.getElementById(`qtd-${id}`);
      const qtd = Number(qtdSpan.textContent);

      // Evita adicionar mais do que o estoque
      if (qtd > produto.quantidade) {
        mostrarAviso(`❌ Apenas ${produto.quantidade} unidades disponíveis.`);
        return;
      }

      async function verificarQuantidadeCarrinho(produto_id) {
      const resp = await fetch(`${apiCarrinho}/${usuario.id}`);
      const dados = await resp.json();

      const item = dados.find(i => i.produto_id === produto_id);
      return item ? Number(item.quantidade) : 0;
      }
      
      // Verificar carrinho antes de adicionar
      const qtdNoCarrinho = await verificarQuantidadeCarrinho(produto.id);
      const estoqueMax = produto.quantidade;

      if (qtdNoCarrinho >= estoqueMax) {
        mostrarAviso(`❌ Você já possui o máximo permitido no carrinho (${estoqueMax}).`);
        return;
      }

      const totalFinal = qtdNoCarrinho + qtd;

      if (totalFinal > estoqueMax) {
        mostrarAviso(`❌ Você pode adicionar apenas mais ${estoqueMax - qtdNoCarrinho} unidade(s).`);
        return;
      }

      await enviarCarrinhoBanco(produto.id, qtd);
      mostrarAviso("🧁 Adicionado ao carrinho!");

    })
  );
}

// ====================================================
// 🛒 Adicionar ao carrinho (no banco)
// Chamada simples POST → backend
// ====================================================
async function enviarCarrinhoBanco(produto_id, quantidade) {
  try {
    await fetch(apiCarrinho, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        usuario_id: usuario.id,
        produto_id,
        quantidade,
      }),
    });

    mostrarAviso("🧁 Adicionado ao carrinho!");
  } catch (err) {
    console.error("Erro ao adicionar ao carrinho:", err);
    mostrarAviso("❌ Erro ao adicionar ao carrinho.");
  }
}

// ====================================================
// 💬 Toast elegante
// Mensagem visual de aviso
// ====================================================
function mostrarAviso(msg) {
  const div = document.createElement("div");
  div.textContent = msg;
  Object.assign(div.style, {
    position: "fixed",
    bottom: "20px",
    left: "50%",
    transform: "translateX(-50%)",
    background: "#ff8fab",
    color: "#fff",
    padding: "12px 20px",
    borderRadius: "12px",
    fontWeight: "700",
    zIndex: 9999,
  });
  document.body.appendChild(div);
  setTimeout(() => div.remove(), 1600);
}

// ====================================================
// 🚀 Inicialização
// Carrega tudo necessário na página
// ====================================================
document.addEventListener("DOMContentLoaded", async () => {
  gridProdutos = document.getElementById("produtos");
  if (!gridProdutos) {
    console.warn("⚠️ Elemento #produtos não encontrado.");
    return;
  }

  // Carrega produtos do backend
  try {
    const resp = await fetch(apiProdutos);
    produtosCache = await resp.json();
  } catch (err) {
    console.error("Erro ao carregar produtos:", err);
    return;
  }

  await carregarFavoritos();       // carrega favoritos antes do render
  renderProdutos(produtosCache);   // render inicial

  // Filtros — busca e ordenação
  const campoBusca = document.getElementById("buscaProduto");
  const seletorPreco = document.getElementById("filtroPreco");

  if (!campoBusca || !seletorPreco) return;

  // Aplicação dos filtros
  function aplicarFiltros() {
    let filtrados = [...produtosCache];

    const termo = campoBusca.value.trim().toLowerCase();
    if (termo) {
      filtrados = filtrados.filter((p) =>
        p.nome.toLowerCase().includes(termo)
      );
    }

    const ordem = seletorPreco.value;
    if (ordem === "asc") filtrados.sort((a, b) => a.preco - b.preco);
    if (ordem === "desc") filtrados.sort((a, b) => b.preco - a.preco);
    if (ordem === "az") filtrados.sort((a, b) => a.nome.localeCompare(b.nome));
    if (ordem === "za") filtrados.sort((a, b) => b.nome.localeCompare(a.nome));

    renderProdutos(filtrados);
  }

  campoBusca.addEventListener("input", aplicarFiltros);
  seletorPreco.addEventListener("change", aplicarFiltros);
});
