console.log("[admin-historicos.js] carregado");

const API = "http://localhost:3000/pedidos";
const tbody = document.getElementById("listaPedidos");

/* ======================================================
   🔹 Carrega todos os pedidos da API e popula a tabela
====================================================== */
async function carregarPedidos() {
  try {
    const resp = await fetch(API);
    const pedidos = await resp.json();

    tbody.innerHTML = ""; // limpa tabela antes de renderizar
    pedidos.forEach(p => adicionarLinha(p));

  } catch (err) {
    console.error("Erro ao carregar pedidos:", err);
  }
}

/* ======================================================
   🔹 Cria uma linha da tabela para cada pedido
====================================================== */
function adicionarLinha(p) {
  const tr = document.createElement("tr");

  // Converte a data ISO salva no BD para formato brasileiro
  const dataFormatada = new Date(p.data).toLocaleString("pt-BR");

  tr.innerHTML = `
    <td>${p.id}</td>
    <td>${p.usuario}</td>
    <td>R$ ${Number(p.total).toFixed(2)}</td>
    <td>${p.forma_pagamento || "-"}</td>

    <td>
      <select>
        <option value="Solicitado"          ${p.status === "Solicitado" ? "selected" : ""}>Solicitado</option>
        <option value="Confirmado"          ${p.status === "Confirmado" ? "selected" : ""}>Confirmado</option>
        <option value="Saiu para Entrega"   ${p.status === "Saiu para Entrega" ? "selected" : ""}>Saiu para Entrega</option>
        <option value="Finalizado"          ${p.status === "Finalizado" ? "selected" : ""}>Finalizado</option>
        <option value="Cancelado"           ${p.status === "Cancelado" ? "selected" : ""}>Cancelado</option>
      </select>
    </td>

    <td>${dataFormatada}</td>

    <td>
      <button class="btn-admin btn-admin-save">Salvar</button>
    </td>
  `;

  /* ======================================================
     🔹 Salvar atualização do status
  ====================================================== */
  tr.querySelector(".btn-admin-save").addEventListener("click", async () => {
    const novoStatus = tr.children[4].querySelector("select").value;

    try {
      const resp = await fetch(`${API}/${p.id}/status`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: novoStatus })
      });

      if (!resp.ok) throw new Error();

      alert("Status atualizado!");

    } catch (err) {
      console.error(err);
      alert("Erro ao atualizar o status");
    }
  });

  tbody.appendChild(tr);
}

// Inicializa carregamento da lista
carregarPedidos();
