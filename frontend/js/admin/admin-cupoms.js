console.log("[admin-cupoms.js] carregado");

const API = "http://localhost:3000";
const tbody = document.getElementById("listaCupom");
const btnNovo = document.getElementById("novoCupom");

/* ============================================================
   🔹 Carrega todos os cupons da API e popula a tabela
============================================================ */
async function carregarCupons() {
  try {
    const resp = await fetch(`${API}/cupons`);
    if (!resp.ok) throw new Error("Erro ao buscar cupons");

    const cupons = await resp.json();
    tbody.innerHTML = ""; // Limpa tabela antes de renderizar

    cupons.forEach((c) => adicionarLinha(c));
  } catch (err) {
    console.error("Erro ao carregar cupons:", err);
  }
}

/* ============================================================
   🔹 Cria uma linha editável na tabela (novo ou existente)
============================================================ */
function adicionarLinha(cupom = null) {
  const tr = document.createElement("tr");

  // Renderização inline do cupom — prática simples e funcional
  tr.innerHTML = `
    <td>${cupom ? cupom.id : "-"}</td>

    <td><input type="text" value="${cupom ? cupom.codigo : ""}"></td>

    <td><input type="number" value="${cupom ? cupom.desconto : ""}"></td>

    <td><input type="number" value="${cupom ? cupom.minimo_compra : ""}"></td>

    <td><input type="date" value="${cupom ? cupom.validade : ""}"></td>

    <td>
      <span class="toggle ${cupom && cupom.ativo ? "on" : "off"}">
        ${cupom && cupom.ativo ? "ON" : "OFF"}
      </span>
    </td>

    <td>
      <button class="btn-admin btn-admin-save">Salvar</button>

      ${
        cupom
          ? `<button class="btn-admin btn-admin-delete">Excluir</button>`
          : ""
      }
    </td>
  `;

  /* ------------------ TOGGLE ON/OFF ------------------ */
  const toggle = tr.querySelector(".toggle");
  toggle.addEventListener("click", () => {
    toggle.classList.toggle("on");
    toggle.classList.toggle("off");
    toggle.textContent = toggle.classList.contains("on") ? "ON" : "OFF";
  });

  /* ------------------ SALVAR ------------------ */
  const btnSalvar = tr.querySelector(".btn-admin-save");
  btnSalvar.addEventListener("click", async () => {
    // Extrai os valores da linha
    const codigo = tr.children[1].querySelector("input").value.trim();
    const desconto = tr.children[2].querySelector("input").value;
    const minimo = tr.children[3].querySelector("input").value;
    const validade = tr.children[4].querySelector("input").value;
    const ativo = toggle.classList.contains("on") ? 1 : 0;

    // Validação mínima
    if (!codigo || !desconto) {
      alert("Código e desconto são obrigatórios.");
      return;
    }

    const body = {
      codigo,
      desconto: Number(desconto),
      minimo_compra: Number(minimo || 0),
      validade,
      ativo,
    };

    try {
      if (cupom && cupom.id) {
        // Atualizar cupom existente
        const resp = await fetch(`${API}/cupons/${cupom.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });

        if (!resp.ok) throw new Error("Erro ao atualizar cupom");
      } else {
        // Criar novo cupom
        const resp = await fetch(`${API}/cupons`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });

        if (!resp.ok) throw new Error("Erro ao criar cupom");
      }

      // Recarrega lista após salvar
      await carregarCupons();
    } catch (err) {
      console.error(err);
      alert("Erro ao salvar cupom.");
    }
  });

  /* ------------------ EXCLUIR ------------------ */
  const btnDelete = tr.querySelector(".btn-admin-delete");
  if (btnDelete && cupom && cupom.id) {
    btnDelete.addEventListener("click", async () => {
      if (!confirm("Tem certeza que deseja excluir este cupom?")) return;

      try {
        const resp = await fetch(`${API}/cupons/${cupom.id}`, {
          method: "DELETE",
        });

        if (!resp.ok) throw new Error("Erro ao excluir cupom");

        await carregarCupons();
      } catch (err) {
        console.error(err);
        alert("Erro ao excluir cupom.");
      }
    });
  }

  tbody.appendChild(tr);
}

/* Botão de criar nova linha vazia */
btnNovo.addEventListener("click", () => adicionarLinha());

/* Inicialização automática */
carregarCupons();
