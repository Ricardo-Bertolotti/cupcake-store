console.log("[admin-usuarios.js] carregado");

const API = "http://localhost:3000";
const tbody = document.getElementById("listaUsuarios");
const btnNovo = document.getElementById("novoUsuario");

/* ============================================================
   🔹 Carregar lista de usuários
   Busca todos os usuários cadastrados e renderiza a tabela.
============================================================ */
async function carregarUsuarios() {
  try {
    const resp = await fetch(`${API}/usuarios`);
    if (!resp.ok) throw new Error("Erro ao buscar usuários");

    const usuarios = await resp.json();
    tbody.innerHTML = ""; // limpa a tabela

    usuarios.forEach((u) => adicionarLinha(u));
  } catch (err) {
    console.error("Erro ao carregar usuários:", err);
  }
}

/* ============================================================
   🔹 Criar linha editável (novo ou existente)
============================================================ */
function adicionarLinha(user = null) {
  const tr = document.createElement("tr");

  tr.innerHTML = `
    <td>${user ? user.id : "-"}</td>

    <td><input type="text" value="${user ? user.nome : ""}"></td>

    <td><input type="email" value="${user ? user.email : ""}"></td>

    <td>
      <select>
        <option value="cliente" ${user && user.nivel === "cliente" ? "selected" : ""}>Cliente</option>
        <option value="admin"   ${user && user.nivel === "admin"   ? "selected" : ""}>Admin</option>
      </select>
    </td>

    <td>
      <button class="btn-admin btn-admin-save">Salvar</button>
      ${user ? `<button class="btn-admin btn-admin-delete">Excluir</button>` : ""}
    </td>
  `;

  /* ============================================================
     🔹 SALVAR (criação ou atualização)
  ============================================================ */
  const btnSave = tr.querySelector(".btn-admin-save");
  btnSave.addEventListener("click", async () => {
    const nome = tr.children[1].querySelector("input").value.trim();
    const email = tr.children[2].querySelector("input").value.trim();
    const nivel = tr.children[3].querySelector("select").value;

    if (!nome || !email) {
      alert("Nome e email são obrigatórios.");
      return;
    }

    const body = { nome, email, nivel };

    try {
      if (user && user.id) {
        // Atualizar usuário existente
        const resp = await fetch(`${API}/usuarios/${user.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });

        if (!resp.ok) throw new Error("Erro ao atualizar usuário");
      } else {
        // Criar novo usuário
        const resp = await fetch(`${API}/usuarios`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });

        if (!resp.ok) throw new Error("Erro ao criar usuário");
      }

      await carregarUsuarios(); // recarrega tabela
    } catch (err) {
      console.error(err);
      alert("Erro ao salvar usuário.");
    }
  });

  /* ============================================================
     🔹 EXCLUIR
============================================================ */
  const btnDelete = tr.querySelector(".btn-admin-delete");
  if (btnDelete && user && user.id) {
    btnDelete.addEventListener("click", async () => {
      if (!confirm("Tem certeza que deseja excluir este usuário?")) return;

      try {
        const resp = await fetch(`${API}/usuarios/${user.id}`, {
          method: "DELETE",
        });

        if (!resp.ok) throw new Error("Erro ao excluir usuário");

        await carregarUsuarios(); // atualiza tabela
      } catch (err) {
        console.error(err);
        alert("Erro ao excluir usuário.");
      }
    });
  }

  tbody.appendChild(tr);
}

/* Botão "Novo usuário" cria linha vazia */
btnNovo.addEventListener("click", () => adicionarLinha());

/* Inicialização */
carregarUsuarios();
