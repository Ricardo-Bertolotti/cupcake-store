// ====================================================
// 🔐 Validação de acesso — reforço de segurança.
// O HTML já bloqueia, mas isso evita execução indevida do script.
// ====================================================
const usuario = JSON.parse(localStorage.getItem("usuario"));

if (!usuario || usuario.nivel !== "admin") {
  console.warn("[admin.js] Usuário não autorizado, redirecionando...");
  // nada executa pois o painel só inicia para admin
} else {
  iniciarPainelAdmin();
}

// ====================================================
// 🧠 Funções do Painel Admin
// Estrutura modular + escopo isolado dentro de iniciarPainelAdmin()
// ====================================================
function iniciarPainelAdmin() {
  // Endpoints separados — mais legível e flexível para manutenção
  const apiAdmin = "http://localhost:3000/admin";
  const apiProdutos = "http://localhost:3000/produtos";
  const apiPedidos = "http://localhost:3000/pedidos";

  // ========================= DASHBOARD =========================
  async function carregarResumo() {
    try {
      const resp = await fetch(`${apiAdmin}/dashboard`);
      if (!resp.ok) {
        console.error("[admin.js] Erro ao carregar dashboard:", resp.status);
        return;
      }

      const data = await resp.json();

      const cards = document.getElementById("cardsResumo");
      // Renderização direta — simples e funcional. Apenas cuidado se crescer.
      cards.innerHTML = `
        <div class="card">
          <h3>Usuários</h3>
          <p>${data.usuarios}</p>
        </div>
        <div class="card">
          <h3>Produtos</h3>
          <p>${data.produtos}</p>
        </div>
        <div class="card">
          <h3>Pedidos</h3>
          <p>${data.pedidos}</p>
        </div>
        <div class="card">
          <h3>Vendas</h3>
          <p>R$ ${data.vendas.toFixed(2)}</p>
        </div>
      `;
    } catch (err) {
      console.error("[admin.js] Erro ao carregar resumo:", err);
    }
  }

  // ========================= PRODUTOS =========================
  async function carregarProdutos() {
    const tabela = document.querySelector("#tabelaProdutos tbody");
    tabela.innerHTML = "<tr><td colspan='5'>Carregando...</td></tr>";

    try {
      const resp = await fetch(apiProdutos);
      if (!resp.ok) {
        console.error("[admin.js] Erro ao buscar produtos:", resp.status);
        tabela.innerHTML = "<tr><td colspan='5'>Erro ao carregar produtos.</td></tr>";
        return;
      }

      const produtos = await resp.json();
      tabela.innerHTML = "";

      produtos.forEach((p) => {
        // Renderização linha a linha — simples e permite evolução futura (edição inline)
        const tr = document.createElement("tr");
        tr.innerHTML = `
          <td>${p.id}</td>
          <td>${p.nome}</td>
          <td>R$ ${p.preco.toFixed(2)}</td>
          <td>${p.quantidade}</td>
          <td>
            <button onclick="editarProduto(${p.id})">Editar</button>
            <button onclick="deletarProduto(${p.id})" style="background:#ff3b5f;">Excluir</button>
          </td>
        `;
        tabela.appendChild(tr);
      });
    } catch (err) {
      console.error("[admin.js] Erro ao carregar produtos:", err);
    }
  }

  // ========================= PEDIDOS =========================
  async function carregarPedidos() {
    const tabela = document.querySelector("#tabelaPedidos tbody");
    tabela.innerHTML = "<tr><td colspan='4'>Carregando...</td></tr>";

    try {
      const resp = await fetch(apiPedidos);
      if (!resp.ok) {
        console.error("[admin.js] Erro ao buscar pedidos:", resp.status);
        tabela.innerHTML = "<tr><td colspan='4'>Erro ao carregar pedidos.</td></tr>";
        return;
      }

      const pedidos = await resp.json();
      tabela.innerHTML = "";

      // Exibição somente — sem edição aqui, consistente com escopo da tela
      pedidos.forEach((p) => {
        const tr = document.createElement("tr");
        tr.innerHTML = `
          <td>${p.id}</td>
          <td>${p.usuario || "-"}</td>
          <td>R$ ${p.total.toFixed(2)}</td>
          <td>${p.status}</td>
        `;
        tabela.appendChild(tr);
      });
    } catch (err) {
      console.error("[admin.js] Erro ao carregar pedidos:", err);
    }
  }

  // ========================= AÇÕES (CRUD) =========================
  async function deletarProduto(id) {
    if (!confirm("Excluir este produto?")) return;

    try {
      const resp = await fetch(`${apiProdutos}/${id}`, { method: "DELETE" });
      const data = await resp.json();

      if (resp.ok) {
        alert("Produto removido com sucesso!");
        carregarProdutos(); // recarrega tabela
      } else {
        alert(data.error || "Erro ao excluir produto.");
      }
    } catch (err) {
      console.error("[admin.js] Erro ao deletar produto:", err);
    }
  }

  // Placeholder de edição — estrutura já pensada para expansão
  function editarProduto(id) {
    alert(`Em breve: edição do produto #${id}`);
  }

  // Necessário para que os botões inline funcionem com onclick=""
  window.deletarProduto = deletarProduto;
  window.editarProduto = editarProduto;

  // Inicialização — garante carregamento após DOM pronto
  document.addEventListener("DOMContentLoaded", () => {
    carregarResumo();
    carregarProdutos();
    carregarPedidos();
  });
}
