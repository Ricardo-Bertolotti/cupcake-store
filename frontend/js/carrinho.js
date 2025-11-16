console.log("[carrinho.js] iniciado 🚀");

const API = "http://localhost:3000";

const usuario = JSON.parse(localStorage.getItem("usuario"));

// Validação rápida — evita acessar carrinho sem sessão.
if (!usuario) {
  alert("Faça login para acessar o carrinho.");
  window.location.href = "login.html";
}

const usuario_id = usuario.id;

// Referências do DOM — usado múltiplas vezes, boa prática separar aqui.
const tabela = document.getElementById("listaCarrinho");
const subtotalEl = document.getElementById("subtotal");
const totalEl = document.getElementById("total");
const descontoEl = document.getElementById("desconto");
const cupomInput = document.getElementById("cupomInput");
const aplicarBtn = document.getElementById("aplicarCupom");
const removerBtn = document.getElementById("removerCupom");

let produtos = [];
let carrinho = [];
let descontoAtivo = 0;

/* -------------------------------------------------------
   Carrega lista de produtos (necessário para validar estoque)
-------------------------------------------------------- */
async function carregarProdutos() {
  const resp = await fetch(`${API}/produtos`);
  produtos = await resp.json();
}

/* -------------------------------------------------------
   Carrega itens do carrinho do usuário
-------------------------------------------------------- */
async function carregarCarrinho() {
  const resp = await fetch(`${API}/carrinho/${usuario_id}`);
  carrinho = await resp.json();
}

/* -------------------------------------------------------
   Remove item do carrinho (DELETE direto no backend)
-------------------------------------------------------- */
async function removerItem(produto_id) {
  await fetch(`${API}/carrinho`, {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ usuario_id, produto_id })
  });
  atualizarCarrinho();
}

/* -------------------------------------------------------
   Atualiza quantidade — valida estoque antes de enviar
-------------------------------------------------------- */
async function alterarQuantidade(produto_id, qtd) {
  const prod = produtos.find(p => p.id === produto_id);
  if (!prod) return;

  if (qtd > prod.quantidade) {
    mostrarAviso(`❌ Estoque máximo: ${prod.quantidade}`);
    return;
  }

  await fetch(`${API}/carrinho`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ usuario_id, produto_id, quantidade: qtd })
  });

  atualizarCarrinho();
}

/* -------------------------------------------------------
   Renderiza tabela do carrinho + cálculo de subtotal/total
-------------------------------------------------------- */
async function atualizarCarrinho() {
  await carregarCarrinho();

  tabela.innerHTML = "";
  let subtotal = 0;

  // Carrinho vazio — retorno rápido
  if (carrinho.length === 0) {
    tabela.innerHTML = `
      <tr class="empty-row">
        <td colspan="7">Seu carrinho está vazio 💔</td>
      </tr>
    `;
    subtotalEl.textContent = "0.00";
    totalEl.textContent = "0.00";
    descontoEl.style.display = "none";
    return;
  }

  // Loop principal — monta linhas do carrinho
  carrinho.forEach((item) => {
    const produto = produtos.find(p => p.id === item.produto_id);
    if (!produto) return; // evita erro em produto removido do sistema

    // --- CORRIGIR QUANTIDADE SE ESTIVER MAIOR QUE O ESTOQUE ---
    if (item.quantidade > produto.quantidade) {
      item.quantidade = produto.quantidade;

      fetch(`${API}/carrinho`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          usuario_id,
          produto_id: item.produto_id,
          quantidade: produto.quantidade
        })
      });
    }

    const subtotalItem = produto.preco * item.quantidade;
    subtotal += subtotalItem;

    const img = produto.imagem.startsWith("http")
      ? produto.imagem
      : `../assets/img/produtos/${produto.imagem}`;

    const limite = item.quantidade >= produto.quantidade;

    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td><img src="${img}" width="60"></td>
      <td>${produto.nome}</td>
      <td>R$ ${produto.preco.toFixed(2)}</td>

      <td>
        <div class="quantidade-box">
          <button class="btnQtd" data-id="${item.produto_id}" data-op="menos">−</button>
          <span>${item.quantidade}</span>
          <button class="btnQtd" data-id="${item.produto_id}" data-op="mais"
            ${limite ? "disabled style='opacity:.4; cursor:not-allowed;'" : ""}
          >+</button>
        </div>
      </td>

      <td>${produto.quantidade}</td>

      <td>R$ ${subtotalItem.toFixed(2)}</td>

      <td>
        <button class="btnRemover" data-id="${item.produto_id}">Remover</button>
      </td>
    `;

    tabela.appendChild(tr);
  });

  // Cálculo financeiro
  const descontoValor = subtotal * descontoAtivo;
  const totalFinal = subtotal - descontoValor;

  subtotalEl.textContent = subtotal.toFixed(2);
  totalEl.textContent = totalFinal.toFixed(2);

  // Exibe faixa visual do desconto
  if (descontoAtivo > 0) {
    descontoEl.style.display = "block";
    descontoEl.textContent = `Cupom aplicado — R$ ${descontoValor.toFixed(2)} de desconto`;
  } else {
    descontoEl.style.display = "none";
  }

  registrarEventos();
}

/* -------------------------------------------------------
   Registra eventos dos botões + / remover
-------------------------------------------------------- */
function registrarEventos() {
  document.querySelectorAll(".btnQtd").forEach(btn =>
    btn.addEventListener("click", (e) => {
      e.preventDefault();

      const id = Number(btn.dataset.id);
      const op = btn.dataset.op;

      const item = carrinho.find(c => c.produto_id === id);
      const produto = produtos.find(p => p.id === id);

      if (!item || !produto) return;

      if (op === "mais") {
        if (item.quantidade >= produto.quantidade) {
          mostrarAviso(`❌ Estoque máximo atingido: ${produto.quantidade}`);
          return;
        }
        alterarQuantidade(id, item.quantidade + 1);
      }

      if (op === "menos") {
        item.quantidade > 1
          ? alterarQuantidade(id, item.quantidade - 1)
          : removerItem(id);
      }
    })
  );

  document.querySelectorAll(".btnRemover").forEach(btn =>
    btn.addEventListener("click", () => removerItem(Number(btn.dataset.id)))
  );
}

/* -------------------------------------------------------
   CUPOM - Aplicar (tratamento real de erro do backend)
-------------------------------------------------------- */
aplicarBtn.addEventListener("click", async () => {
  const codigo = cupomInput.value.trim().toUpperCase();
  if (!codigo) return mostrarAviso("Digite um cupom.");

  const resp = await fetch(`${API}/cupons/buscar/${codigo}`);
  if (!resp.ok) return mostrarAviso("❌ Cupom não encontrado.");

  const cupom = await resp.json();

  // Aplica e trata erros reais do backend
  const aplicar = await fetch(`${API}/cupons/aplicar`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ usuario_id, codigo })
  });

  if (!aplicar.ok) {
    const erro = await aplicar.json().catch(() => ({ error: "Erro ao aplicar." }));
    mostrarAviso(`❌ ${erro.error}`);
    return;
  }

  // Desconto percentual
  descontoAtivo = cupom.desconto / 100;

  cupomInput.disabled = true;
  aplicarBtn.style.display = "none";
  removerBtn.style.display = "inline-block";

  atualizarCarrinho();
  mostrarAviso("🎉 Cupom aplicado!");
});

/* -------------------------------------------------------
   CUPOM - Remover
-------------------------------------------------------- */
removerBtn.addEventListener("click", async () => {
  await fetch(`${API}/cupons/apagado/${usuario_id}`, { method: "DELETE" });

  descontoAtivo = 0;
  cupomInput.disabled = false;
  cupomInput.value = "";

  aplicarBtn.style.display = "inline-block";
  removerBtn.style.display = "none";

  atualizarCarrinho();
  mostrarAviso("Cupom removido");
});

/* -------------------------------------------------------
   Consulta cupom ativo ao abrir página
-------------------------------------------------------- */
async function verificarCupomAtivo() {
  try {
    const resp = await fetch(`${API}/cupons/aplicado/${usuario_id}`);
    if (!resp.ok) return;

    const cupom = await resp.json();
    descontoAtivo = cupom.desconto / 100;

    cupomInput.value = cupom.codigo;
    cupomInput.disabled = true;
    aplicarBtn.style.display = "none";
    removerBtn.style.display = "inline-block";
  } catch { /* Nenhum cupom salvo */ }
}

/* -------------------------------------------------------
   Toast simples — rápido e direto
-------------------------------------------------------- */
function mostrarAviso(msg) {
  const div = document.createElement("div");
  div.textContent = msg;
  Object.assign(div.style, {
    position: "fixed",
    bottom: "20px",
    left: "50%",
    transform: "translateX(-50%)",
    background: "#ff6f91",
    color: "#fff",
    padding: "12px 18px",
    borderRadius: "10px",
    fontWeight: "bold",
    zIndex: 9999
  });
  document.body.appendChild(div);
  setTimeout(() => div.remove(), 1800);
}

/* -------------------------------------------------------
   Botões de navegação
-------------------------------------------------------- */
document.getElementById("continuar").addEventListener("click", () => {
  window.location.href = "cardapio.html";
});

document.getElementById("finalizarCompra").addEventListener("click", () => {
  if (carrinho.length === 0) {
    mostrarAviso("Carrinho vazio!");
    return;
  }
  window.location.href = "checkout.html";
});

/* -------------------------------------------------------
   Inicialização imediata
-------------------------------------------------------- */
(async () => {
  await carregarProdutos();
  await carregarCarrinho();
  await verificarCupomAtivo();
  atualizarCarrinho();
})();
