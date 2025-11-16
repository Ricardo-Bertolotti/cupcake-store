// =======================================================
// 👤 perfil.js — Cupcake Store by RB7
// Arquivo responsável pela edição de dados do usuário logado
// =======================================================
console.log("[perfil.js] Carregado 👤");

const apiURL = "http://localhost:3000/usuarios";
const form = document.getElementById("formPerfil");
const btnLogout = document.getElementById("btnLogout");

// Recupera usuário salvo localmente
const usuario = JSON.parse(localStorage.getItem("usuario"));

// -------------------------------------------------------
// Se não estiver logado → bloqueia acesso
// -------------------------------------------------------
if (!usuario) {
  alert("Você precisa estar logado para acessar o perfil.");
  window.location.href = "login.html";
}

// -------------------------------------------------------
// 🔒 Mostrar / ocultar senha (perfil)
// -------------------------------------------------------
const senhaInput = document.getElementById("senha");
const togglePassPerfil = document.getElementById("togglePassPerfil");

if (togglePassPerfil) {
  togglePassPerfil.addEventListener("click", () => {
    const isPassword = senhaInput.type === "password";
    senhaInput.type = isPassword ? "text" : "password";
    togglePassPerfil.textContent = isPassword ? "🙈" : "👁️";
  });
}

// -------------------------------------------------------
// Carrega dados do perfil via GET /usuarios/:id
// -------------------------------------------------------
async function carregarPerfil() {
  try {
    const resp = await fetch(`${apiURL}/${usuario.id}`);
    if (!resp.ok) throw new Error("Usuário não encontrado.");

    const data = await resp.json();

    document.getElementById("nome").value = data.nome || "";
    document.getElementById("email").value = data.email || "";
    document.getElementById("endereco").value = data.endereco || "";

  } catch (err) {
    console.error("Erro ao carregar perfil:", err);
    mostrarMensagem("Erro ao carregar perfil ❌", true);
  }
}

// -------------------------------------------------------
// Atualiza perfil (PUT /usuarios/:id)
// -------------------------------------------------------
form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const nome = document.getElementById("nome").value.trim();
  const endereco = document.getElementById("endereco").value.trim();
  const senha = document.getElementById("senha").value.trim();

  if (!nome) {
    mostrarMensagem("Digite seu nome.", true);
    return;
  }

  const body = { nome, endereco };
  if (senha) body.senha = senha;

  try {
    const resp = await fetch(`${apiURL}/${usuario.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    if (!resp.ok) throw new Error("Falha ao atualizar perfil.");

    mostrarMensagem("Perfil atualizado com sucesso! 🎉");

    const updatedUser = { ...usuario, nome, endereco };
    localStorage.setItem("usuario", JSON.stringify(updatedUser));

  } catch (err) {
    console.error(err);
    mostrarMensagem("Erro ao salvar alterações ❌", true);
  }
});

// -------------------------------------------------------
// Botão de logout
// -------------------------------------------------------
btnLogout.addEventListener("click", () => {
  localStorage.removeItem("usuario");
  mostrarMensagem("Você saiu da conta 🚪", false);

  setTimeout(() => {
    window.location.href = "login.html";
  }, 800);
});

// -------------------------------------------------------
// Toast simples
// -------------------------------------------------------
function mostrarMensagem(texto, erro = false) {
  let msg = document.createElement("div");
  msg.textContent = texto;

  Object.assign(msg.style, {
    position: "fixed",
    top: "20px",
    left: "50%",
    transform: "translateX(-50%)",
    background: erro ? "#ff6b6b" : "#4CAF50",
    color: "white",
    padding: "12px 24px",
    borderRadius: "8px",
    boxShadow: "0 2px 8px rgba(0,0,0,0.2)",
    zIndex: "9999",
    fontWeight: "500",
    fontSize: "0.95rem",
    opacity: "0",
    transition: "opacity 0.3s ease",
  });

  document.body.appendChild(msg);

  requestAnimationFrame(() => (msg.style.opacity = "1"));

  setTimeout(() => {
    msg.style.opacity = "0";
    setTimeout(() => msg.remove(), 300);
  }, 2000);
}

// -------------------------------------------------------
carregarPerfil(); // Inicialização principal
