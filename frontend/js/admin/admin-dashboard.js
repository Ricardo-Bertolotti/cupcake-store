console.log("[admin-dashboard.js] carregado");

const API = "http://localhost:3000/dashboard";

/* ============================================================
   🔹 Carrega dados de resumo e popula os cards do dashboard
============================================================ */
async function carregarCards() {
  const r = await fetch(API + "/resumo");
  const d = await r.json();

  // Cards gerais: vendas, pedidos, usuários, ticket médio
  document.getElementById("card-geral").innerHTML = `
    <h3>VENDAS</h3>
    <div class="dash-card">
      <p>Total de Vendas</p>
      <h2>R$ ${Number(d.totalVendas).toFixed(2)}</h2>
    </div>

    <div class="dash-card">
      <p>Total de Pedidos</p>
      <h2>${d.totalPedidos}</h2>
    </div>

    <div class="dash-card">
      <p>Total de Usuários</p>
      <h2>${d.totalUsuarios}</h2>
    </div>

    <div class="dash-card">
      <p>Ticket Médio</p>
      <h2>R$ ${d.ticketMedio}</h2>
    </div>
  `;

  // Cards de produtos
  document.getElementById("card-produtos").innerHTML = `
    <h3>PRODUTOS</h3>
    <div class="dash-card"><p>Total</p><h2>${d.totalProdutos}</h2></div>
    <div class="dash-card"><p>Ativos</p><h2>${d.produtosAtivos}</h2></div>
    <div class="dash-card"><p>Inativos</p><h2>${d.produtosInativos}</h2></div>
    <div class="dash-card"><p>Sem Estoque</p><h2>${d.produtosSemEstoque}</h2></div>
  `;

  // Cards de cupons
  document.getElementById("card-cupons").innerHTML = `
    <h3>CUPONS</h3>
    <div class="dash-card"><p>Total</p><h2>${d.totalCupons}</h2></div>
    <div class="dash-card"><p>Ativos</p><h2>${d.cuponsAtivos}</h2></div>
    <div class="dash-card"><p>Inativos</p><h2>${d.cuponsInativos}</h2></div>
    <div class="dash-card">
      <p>Total de Descontos Aplicados</p>
      <h2>R$ ${Number(d.totalDescontos || 0).toFixed(2)}</h2>
    </div>
  `;
}

/* ============================================================
   🔹 Gráfico de vendas diárias (Bar Chart)
============================================================ */
async function graficoVendas() {
  const r = await fetch(API + "/vendas-dia");
  const d = await r.json();

  const ctx = document.getElementById("grafVendas");

  new Chart(ctx, {
    type: "bar",
    data: {
      labels: d.map(x => x.dia),
      datasets: [{
        label: "Vendas (R$)",
        data: d.map(x => x.total),
        backgroundColor: "#ff7ac5"
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { labels: { color: "#f0f0f0" } }
      },
      scales: {
        x: {
          ticks: { color: "#d0d0d0" },
          grid: { color: "#333" }
        },
        y: {
          ticks: { color: "#d0d0d0" },
          grid: { color: "#333" }
        }
      }
    }
  });
}

/* ============================================================
   🔹 Gráfico de Status (Pie Chart)
============================================================ */
async function graficoStatus() {
  const r = await fetch(API + "/status");
  const d = await r.json();

  const labels = d.map(x => x.status);
  const valores = d.map(x => x.quantidade);

  // Legenda manual personalizada
  const legendaContainer = document.getElementById("legendaStatus");
  legendaContainer.innerHTML = labels.map((label, i) => `
    <div style="display:flex;align-items:center;gap:8px;">
      <span style="
        width:20px;height:20px;border-radius:4px;
        background:${["#ff7ac5","#ffb3e1","#a97dff","#6eda8d","#ff6666"][i]};
      "></span>
      ${label}
    </div>
  `).join("");

  const ctx = document.getElementById("grafStatus");

  new Chart(ctx, {
    type: "pie",
    plugins: [ChartDataLabels],
    data: {
      labels,
      datasets: [{
        data: valores,
        backgroundColor: ["#ff7ac5", "#ffb3e1", "#a97dff", "#6eda8d", "#ff6666"],
        borderColor: "#111",
        borderWidth: 2
      }]
    },
    options: {
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        datalabels: {
          color: "#fff",
          font: { weight: "bold", size: 14 },
          formatter: value => {
            const total = valores.reduce((a, b) => a + b, 0);
            return ((value / total) * 100).toFixed(1) + "%";
          }
        }
      }
    }
  });
}

/* Inicialização */
carregarCards();
graficoVendas();
graficoStatus();
