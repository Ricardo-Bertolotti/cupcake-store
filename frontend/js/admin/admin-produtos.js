console.log("[admin-produtos.js] carregado");

const API = "http://localhost:3000/produtos";
const tbody = document.getElementById("listaProdutos");
const btnNovo = document.getElementById("novoProduto");

/* ======================================================
   🔹 Carrega todos os produtos disponíveis na visão admin
====================================================== */
async function carregarProdutos() {
  const resp = await fetch(`${API}/admin`);
  const produtos = await resp.json();

  tbody.innerHTML = ""; // limpa a tabela antes de recriar
  produtos.forEach((p) => adicionarLinha(p));
}

/* ======================================================
   🔹 Cria linha editável (novo ou existente)
====================================================== */
function adicionarLinha(p = null) {
  const tr = document.createElement("tr");

  tr.innerHTML = `
    <td>${p ? p.id : "-"}</td>

    <td><input type="text" value="${p ? p.nome : ""}"></td>

    <td><input type="number" step="0.01" value="${p ? p.preco : ""}"></td>

    <td><input type="text" value="${p ? p.descricao : ""}"></td>

    <td><input type="text" value="${p ? p.imagem : ""}"></td>

    <td><input type="number" value="${p ? p.quantidade : ""}"></td>

    <td>
      <span class="toggle ${p && p.ativo ? "on" : "off"}">
        ${p && p.ativo ? "ON" : "OFF"}
      </span>
    </td>

    <td>
      <button class="btn-admin btn-admin-save">Salvar</button>
      ${p ? `<button class="btn-admin btn-admin-delete">Excluir</button>` : ""}
    </td>
  `;

  /* --- Toggle ON/OFF --- */
  const toggle = tr.querySelector(".toggle");
  toggle.addEventListener("click", () => {
    toggle.classList.toggle("on");
    toggle.classList.toggle("off");
    toggle.textContent = toggle.classList.contains("on") ? "ON" : "OFF";
  });

  /* ======================================================
     🔹 Salvar alterações ou criar novo produto
  ====================================================== */
  tr.querySelector(".btn-admin-save").addEventListener("click", async () => {
    const nome = tr.children[1].querySelector("input").value.trim();
    const preco = tr.children[2].querySelector("input").value;
    const descricao = tr.children[3].querySelector("input").value;
    const imagem = tr.children[4].querySelector("input").value;
    const quantidade = tr.children[5].querySelector("input").value;
    const ativo = toggle.classList.contains("on") ? 1 : 0;

    if (!nome || !preco) {
      alert("Nome e preço são obrigatórios.");
      return;
    }

    const body = { nome, preco, descricao, imagem, quantidade, ativo };

    if (p) {
      // Atualiza produto existente
      await fetch(`${API}/${p.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
    } else {
      // Cria novo produto
      await fetch(API, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
    }

    carregarProdutos(); // recarrega lista após salvar
  });

  /* ======================================================
     🔹 Excluir produto
  ====================================================== */
  const btnDelete = tr.querySelector(".btn-admin-delete");
  if (btnDelete && p) {
    btnDelete.addEventListener("click", async () => {
      if (!confirm("Excluir produto?")) return;

      await fetch(`${API}/${p.id}`, { method: "DELETE" });
      carregarProdutos();
    });
  }

  tbody.appendChild(tr);
}

/* Botão para adicionar linha vazia */
btnNovo.addEventListener("click", () => adicionarLinha());

/* Inicialização */
carregarProdutos();
