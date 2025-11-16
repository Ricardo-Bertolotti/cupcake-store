// ========================================================
// 🎟️ cupom.js — lista pública de cupons disponíveis
// ========================================================
console.log("[cupom.js] Carregado 🎟️");

const lista = document.getElementById("listaCupons");
const API = "http://localhost:3000/cupons"; // rota pública, sem admin

// --------------------------------------------------------
// Converte datas em formato brasileiro, com fallback seguro
// --------------------------------------------------------
function formatarDataBR(dataStr) {
  if (!dataStr) return "Sem validade";

  const d = new Date(dataStr);
  if (isNaN(d)) return dataStr; // evita quebrar com formato inesperado

  return d.toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

// --------------------------------------------------------
// Carrega cupons ativos e ainda válidos
// --------------------------------------------------------
async function carregarCupons() {
  try {
    const resp = await fetch(API);
    if (!resp.ok) throw new Error("Falha ao buscar cupons");

    let cupons = await resp.json();
    const hoje = new Date();

    // Filtra cupons inválidos ou expirados
    cupons = cupons.filter((c) => {
      const ativo = c.ativo === 1 || c.ativo === true || c.ativo === "1";
      if (!ativo) return false;

      // Cupom sem validade é considerado válido
      if (!c.validade) return true;

      const validade = new Date(c.validade);
      if (isNaN(validade)) return true; // previne falhas

      return validade >= hoje;
    });

    // Lista vazia → mensagem amigável
    if (!cupons.length) {
      lista.innerHTML = `
        <p style="text-align:center;color:#777;">
          Nenhum cupom disponível no momento 💔
        </p>`;
      return;
    }

    lista.innerHTML = "";

    // Renderiza cards individuais
    cupons.forEach((c) => {
      const card = document.createElement("div");
      card.classList.add("cupom-card");

      card.innerHTML = `
        <div class="cupom-codigo">${c.codigo}</div>
        <div class="cupom-desconto">💸 ${c.desconto}% de desconto</div>
        <div class="cupom-validade">
          Válido até ${formatarDataBR(c.validade)}
        </div>
        <p style="font-size:0.9rem;margin-top:6px;">
          Compra mínima: R$ ${Number(c.minimo_compra || 0).toFixed(2)}
        </p>
        <button class="cupom-btn" data-codigo="${c.codigo}">
          Copiar código
        </button>
      `;

      lista.appendChild(card);
    });

    // Botão "Copiar código" — feedback visual leve
    document.querySelectorAll(".cupom-btn").forEach((btn) => {
      btn.addEventListener("click", () => {
        const codigo = btn.dataset.codigo;
        navigator.clipboard.writeText(codigo);

        btn.textContent = "Copiado! ✅";
        setTimeout(() => (btn.textContent = "Copiar código"), 2000);
      });
    });
  } catch (err) {
    console.error("Erro ao carregar cupons:", err);

    lista.innerHTML = `
      <p style="text-align:center;color:#777;">
        Erro ao buscar cupons 😢
      </p>`;
  }
}

// --------------------------------------------------------
carregarCupons();
