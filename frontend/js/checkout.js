console.log("[frontend/checkout.js] iniciado");

const API = "http://localhost:3000";

// Recupera o usuário logado. Mantém fallback mínimo para evitar quebra.
const usuarioStorage = JSON.parse(localStorage.getItem("usuario") || "null");
const usuario_id = usuarioStorage?.id || 1;

let subtotal = 0;
let desconto = 0;
let totalFinal = 0;
const FRETE_FIXO = 15;

/* ============================================================
   Carrega endereço salvo do usuário (melhora UX no checkout)
============================================================ */
async function carregarEnderecoUsuario() {
  try {
    const resp = await fetch(`${API}/usuarios/${usuario_id}`);
    if (!resp.ok) {
      console.warn("Não foi possível carregar usuário, usando campo vazio.");
      return;
    }

    const user = await resp.json();
    const enderecoInput = document.getElementById("endereco");

    // Preenche se existir dado válido
    if (user.endereco && user.endereco.trim() !== "") {
      enderecoInput.value = user.endereco;
    }
  } catch (err) {
    console.error("Erro ao carregar endereço do usuário:", err);
  }
}

/* ============================================================
   Carrega subtotal, desconto (cupom) e total do pedido
============================================================ */
async function carregarResumo() {
  try {
    const respCarrinho = await fetch(`${API}/carrinho/${usuario_id}`);
    if (!respCarrinho.ok) {
      console.error("Erro ao buscar carrinho");
      return;
    }

    const itens = await respCarrinho.json();

    // Carrinho vazio — evita cálculos desnecessários
    if (!Array.isArray(itens) || itens.length === 0) {
      document.getElementById("subtotal").textContent = "0.00";
      document.getElementById("desconto").textContent = "0.00";
      document.getElementById("totalFinal").textContent = "0.00";
      return;
    }

    // Soma subtotal localmente (evita recalcular no backend)
    subtotal = itens.reduce(
      (acc, item) => acc + item.preco * item.quantidade,
      0
    );

    // Tenta buscar cupom ativo — erro tratado graciosamente
    try {
      const respCupom = await fetch(`${API}/cupons/aplicado/${usuario_id}`);
      if (respCupom.ok) {
        const cupom = await respCupom.json();
        desconto = subtotal * (cupom.desconto / 100);
      } else {
        desconto = 0;
      }
    } catch {
      desconto = 0;
    }

    totalFinal = subtotal + FRETE_FIXO - desconto;

    // Atualiza tela
    document.getElementById("subtotal").textContent = subtotal.toFixed(2);
    document.getElementById("frete").textContent = FRETE_FIXO.toFixed(2);
    document.getElementById("desconto").textContent = desconto.toFixed(2);
    document.getElementById("totalFinal").textContent = totalFinal.toFixed(2);

  } catch (err) {
    console.error("Erro ao carregar resumo do checkout:", err);
  }
}

/* ============================================================
   Envia pedido ao backend — validação simples + UX
============================================================ */
function registrarSubmitCheckout() {
  const form = document.getElementById("formCheckout");
  if (!form) {
    console.error("Formulário de checkout não encontrado (#formCheckout).");
    return;
  }

  form.addEventListener("submit", async (e) => {
    e.preventDefault(); // evita reload desnecessário

    const enderecoInput = document.getElementById("endereco");
    const pagamentoSelect = document.getElementById("pagamento");

    const endereco = enderecoInput.value.trim();
    const forma_pagamento = pagamentoSelect.value;

    if (!endereco || !forma_pagamento) {
      mostrarAviso("Preencha todos os campos do checkout.");
      return;
    }

    const payload = {
      usuario_id,
      endereco,
      forma_pagamento
    };

    try {
      const resp = await fetch(`${API}/checkout`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (!resp.ok) {
        const errData = await resp.json().catch(() => ({}));
        console.error("Erro ao finalizar pedido:", errData);
        mostrarAviso(errData.error || "Erro ao finalizar pedido.");
        return;
      }

      // Delay longo aqui — se a ideia é feedback, sugiro reduzir
      mostrarAviso("Pedido criado com sucesso! Redirecionando...", 3600);

      setTimeout(() => {
        window.location.href = "historico.html";
      }, 1800);

    } catch (err) {
      console.error("Falha na requisição de checkout:", err);
      mostrarAviso("Falha de conexão ao finalizar o pedido.");
    }
  });
}

/* ============================================================
   Toast simples para avisos — não bloqueia fluxo
============================================================ */
function mostrarAviso(mensagem, tempo = 2000) {
  const div = document.createElement("div");
  div.textContent = mensagem;

  Object.assign(div.style, {
    position: "fixed",
    bottom: "20px",
    left: "50%",
    transform: "translateX(-50%)",
    background: "#4b3bff",
    color: "#fff",
    padding: "12px 18px",
    borderRadius: "10px",
    fontWeight: "bold",
    zIndex: 9999,
    boxShadow: "0 4px 12px rgba(0,0,0,0.4)"
  });

  document.body.appendChild(div);
  setTimeout(() => div.remove(), tempo);
}

/* ============================================================
   Inicialização — executa tudo na ordem correta
============================================================ */
(async () => {
  await carregarEnderecoUsuario();
  await carregarResumo();
  registrarSubmitCheckout();
})();
