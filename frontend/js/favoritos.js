console.log("[favoritos.js] Carregado 💖");

const lista = document.getElementById("listaFavoritos");
const apiFavoritos = "http://localhost:3000/favoritos";
const apiCarrinho = "http://localhost:3000/carrinho";
const usuario = JSON.parse(localStorage.getItem("usuario")) || { id: 1 };

// -------------------------------------------------------
// Busca favoritos do usuário; lida com ausência de login
// -------------------------------------------------------
async function carregarFavoritos() {
  if (!usuario) {
    lista.innerHTML = `
      <p style="text-align:center; color:#777;">
        Faça login para ver seus favoritos 💔
      </p>`;
    return;
  }

  try {
    const resp = await fetch(`${apiFavoritos}/${usuario.id}`);
    const data = await resp.json();

    // Lista vazia → mensagem amigável
    if (!data || data.length === 0) {
      lista.innerHTML = `
        <p style="text-align:center; color:#777;">
          Nenhum favorito adicionado ainda 💔
        </p>`;
      return;
    }

    renderFavoritos(data);
  } catch (err) {
    console.error("Erro ao carregar favoritos:", err);
    lista.innerHTML = `
      <p style="text-align:center; color:red;">
        Erro ao carregar favoritos.
      </p>`;
  }
}

// -------------------------------------------------------
// Monta os cards dos produtos favoritados
// -------------------------------------------------------
function renderFavoritos(favoritos) {
  lista.innerHTML = "";

  favoritos.forEach((p) => {
    const ativo = Number(p.ativo) === 1;
    const quantidade = Number(p.quantidade) || 0;

    const img = p.imagem.startsWith("http")
      ? p.imagem
      : `../assets/img/produtos/${p.imagem}`;

    // Exibe estado atualizado do estoque
    const estoqueTxt = !ativo
      ? `<span style="color:#e74c3c;font-weight:600;">Indisponível</span>`
      : quantidade > 0
        ? `<span style="color:#4CAF50;font-weight:600;">Em estoque: ${quantidade}</span>`
        : `<span style="color:#e74c3c;font-weight:600;">Esgotado</span>`;

    const card = document.createElement("div");
    card.classList.add("product-card");

    // Controle de quantidade + botão carrinho só se disponível
    let botoes = "";
    if (ativo && quantidade > 0) {
      botoes = `
        <div style="display:flex;align-items:center;justify-content:center;gap:10px;margin:10px 0;">
          <button class="btnMenos" data-id="${p.id}">−</button>
          <span id="qtd-${p.id}" style="font-weight:600;">1</span>
          <button class="btnMais" data-id="${p.id}">+</button>
        </div>

        <button class="btn-primary btn-add" data-id="${p.id}">
          Adicionar ao carrinho 🛒
        </button>
      `;
    } else {
      botoes = `
        <p style="color:#ff4b7c;font-weight:600;margin:10px 0;">
          ${!ativo ? "Indisponível ❌" : "Esgotado ⏳"}
        </p>`;
    }

    card.innerHTML = `
      <img src="${img}" alt="${p.nome}" />
      <h3>${p.nome}</h3>
      <p>${p.descricao || ""}</p>
      <p class="price">R$ ${Number(p.preco).toFixed(2)}</p>
      <p>${estoqueTxt}</p>
      ${botoes}

      <button class="btnRemover" data-id="${p.id}">
        Remover dos favoritos
      </button>
    `;

    lista.appendChild(card);
  });

  registrarEventos(favoritos);
}

// -------------------------------------------------------
// Lida com aumentar/diminuir quantidade + add carrinho + remover
// -------------------------------------------------------
function registrarEventos(favoritos) {
  // Incrementa quantidade respeitando estoque
  document.querySelectorAll(".btnMais").forEach((btn) =>
    btn.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();

      const id = btn.dataset.id;
      const produto = favoritos.find((p) => p.id == id);
      const max = Number(produto.quantidade);
      const span = document.getElementById(`qtd-${id}`);

      const atual = Number(span.textContent);
      if (atual < max) span.textContent = atual + 1;
    })
  );

  // Decrementa quantidade, mínimo 1
  document.querySelectorAll(".btnMenos").forEach((btn) =>
    btn.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();

      const id = btn.dataset.id;
      const span = document.getElementById(`qtd-${id}`);
      const atual = Number(span.textContent);

      if (atual > 1) span.textContent = atual - 1;
    })
  );

  // Adiciona ao carrinho
  document.querySelectorAll(".btn-add").forEach((btn) =>
    btn.addEventListener("click", async (e) => {
      e.preventDefault();
      e.stopPropagation();

      const id = btn.dataset.id;
      const produto = favoritos.find((p) => p.id == id);

      const qtd = Number(document.getElementById(`qtd-${id}`).textContent);
      const max = Number(produto.quantidade);

      if (qtd > max) {
        mostrarAviso(`❌ Apenas ${max} disponíveis.`);
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
      
      await adicionarCarrinhoBanco(produto.id, qtd);
      mostrarAviso(`${produto.nome} (${qtd}x) adicionado ao carrinho 🧁`);

    })
  );

  // Remove dos favoritos
  document.querySelectorAll(".btnRemover").forEach((btn) =>
    btn.addEventListener("click", async (e) => {
      e.preventDefault();
      e.stopPropagation();

      const produto_id = btn.dataset.id;
      await removerFavorito(produto_id);
      await carregarFavoritos(); // recarrega a lista
    })
  );
}

// -------------------------------------------------------
// Remove um favorito do banco
// -------------------------------------------------------
async function removerFavorito(produto_id) {
  try {
    await fetch(apiFavoritos, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        usuario_id: usuario.id,
        produto_id,
      }),
    });
  } catch (err) {
    console.error("Erro ao remover favorito:", err);
  }
}

// -------------------------------------------------------
// Envia item ao carrinho no banco (POST simples)
// -------------------------------------------------------
async function adicionarCarrinhoBanco(produto_id, quantidade) {
  await fetch(apiCarrinho, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      usuario_id: usuario.id,
      produto_id,
      quantidade,
    }),
  });
}

// -------------------------------------------------------
// Toast simples para avisos
// -------------------------------------------------------
function mostrarAviso(texto) {
  const aviso = document.createElement("div");
  aviso.textContent = texto;

  Object.assign(aviso.style, {
    position: "fixed",
    bottom: "20px",
    left: "50%",
    transform: "translateX(-50%)",
    background: "#ff8fab",
    color: "white",
    padding: "10px 20px",
    borderRadius: "999px",
    fontWeight: "600",
    boxShadow: "0 2px 6px rgba(0,0,0,0.2)",
    zIndex: "9999",
  });

  document.body.appendChild(aviso);
  setTimeout(() => aviso.remove(), 1600);
}

// -------------------------------------------------------
carregarFavoritos();
