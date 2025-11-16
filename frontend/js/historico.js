console.log("[historico.js] iniciado");

const apiURL = "http://localhost:3000/pedidos";
const lista = document.getElementById("listaPedidos");
const usuario = JSON.parse(localStorage.getItem("usuario"));

// -------------------------------------------------------
// Garante autenticação mínima antes de exibir o histórico
// -------------------------------------------------------
if (!usuario) {
  alert("Você precisa estar logado para ver seus pedidos.");
  window.location.href = "login.html";
}

// -------------------------------------------------------
// Busca pedidos do usuário e renderiza lista de cards
// -------------------------------------------------------
async function carregarPedidos() {
  try {
    const resp = await fetch(`${apiURL}/usuario/${usuario.id}`);
    const pedidos = await resp.json();

    // Nenhum pedido encontrado → exibição simples
    if (!Array.isArray(pedidos) || pedidos.length === 0) {
      lista.innerHTML = "<p style='text-align:center;'>Nenhum pedido encontrado 😔</p>";
      return;
    }

    lista.innerHTML = "";

    pedidos.forEach((p) => {
      const card = document.createElement("div");
      card.className = "pedido-card";

      // --------------------------
      // Cabeçalho clicável do card
      // --------------------------
      const header = document.createElement("div");
      header.className = "pedido-header";

      header.innerHTML = `
        <div>
          Pedido <strong>#${p.id}</strong><br>
          <span>${new Date(p.data).toLocaleDateString()}</span>
        </div>

        <div style="text-align:right;">
          <strong>Total Pago:</strong> R$ ${(p.total + 15).toFixed(2)}<br>
          <strong>Status:</strong> ${p.status}
        </div>
      `;

      // --------------------------
      // Container dos detalhes
      // --------------------------
      const detalhes = document.createElement("div");
      detalhes.className = "pedido-itens";
      detalhes.style.display = "none";        // inicia escondido
      detalhes.innerHTML = "<p>Carregando detalhes...</p>";

      let carregado = false;                  // evita requisições repetidas

      // -------------------------------------------------------
      // Toggle de detalhes + lazy-load dos itens do pedido
      // -------------------------------------------------------
      header.addEventListener("click", async () => {
        detalhes.style.display = detalhes.style.display === "block" ? "none" : "block";

        // Só carrega uma vez
        if (!carregado) {
          try {
            const respFinal = await fetch(`${apiURL}/${p.id}`);
            const dados = await respFinal.json();

            const bloco = document.createElement("div");

            bloco.innerHTML = `
              <p><strong>Subtotal:</strong> R$ ${p.subtotal.toFixed(2)}</p>
              <p><strong>Frete:</strong> R$ 15,00</p>
              <p><strong>Desconto:</strong> R$ ${p.desconto.toFixed(2)}</p>
              <p><strong>Total Final:</strong> R$ ${(p.total + 15).toFixed(2)}</p>
              <p><strong>Cupom Usado:</strong> ${p.cupom || "Nenhum"}</p>
              <br>
              <strong>Itens:</strong>
            `;

            const ul = document.createElement("ul");

            dados.itens.forEach(item => {
              const li = document.createElement("li");
              li.textContent = `${item.quantidade}x ${item.nome} — R$ ${item.preco.toFixed(2)}`;
              ul.appendChild(li);
            });

            detalhes.innerHTML = "";
            detalhes.appendChild(bloco);
            detalhes.appendChild(ul);

            carregado = true;                  // marca como carregado
          } catch (err) {
            detalhes.innerHTML = "<p>Erro ao carregar detalhes.</p>";
          }
        }
      });

      card.appendChild(header);
      card.appendChild(detalhes);
      lista.appendChild(card);
    });

  } catch (err) {
    console.error("Erro ao carregar pedidos:", err);
    lista.innerHTML = "<p style='color:red;'>Erro ao carregar pedidos.</p>";
  }
}

carregarPedidos();
