// Endpoint de registro do backend
const apiURL = "http://localhost:3000/usuarios/registrar";
const form = document.getElementById("formRegistro");

console.log("[registro.js] Script carregado.");


// ===============================
// 🔒 Mostrar / ocultar senha
// ===============================
const senhaInput = document.getElementById("senha");
const togglePass = document.getElementById("togglePass");

if (togglePass) {
  togglePass.addEventListener("click", () => {
    const isPassword = senhaInput.type === "password";
    senhaInput.type = isPassword ? "text" : "password";
    togglePass.textContent = isPassword ? "🙈" : "👁️";
  });
}
// ===============================


// Listener do envio do formulário
form.addEventListener("submit", (e) => {
  e.preventDefault();
  console.log("[registro.js] Submit acionado.");

  // Coleta e sanitiza os campos de input
  const nome = document.getElementById("nome").value.trim();
  const email = document.getElementById("email").value.trim();
  const senha = document.getElementById("senha").value.trim();
  const endereco = document.getElementById("endereco").value.trim();

  // Validação básica
  if (!nome || !email || !senha) {
    mostrarMensagem("Preencha todos os campos obrigatórios.", true);
    return;
  }

  console.log("[registro.js] Enviando dados ao servidor...");

  // Envio dos dados ao backend
  fetch(apiURL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ nome, email, senha, endereco }),
  })
    .then((resp) =>
      resp.json().then((data) => ({ ok: resp.ok, status: resp.status, data }))
    )
    .then(({ ok, status, data }) => {
      console.log("[registro.js] Resposta:", status, data);

      if (ok) {
        mostrarMensagem("Conta criada com sucesso! Redirecionando para o login... 🎉");

        setTimeout(() => {
          console.log("[registro.js] Redirecionando para login.html...");
          window.location.href = "login.html";
        }, 1500);
      } else {
        mostrarMensagem(data.error || "Erro ao registrar usuário.", true);
      }
    })
    .catch((err) => {
      console.error("[registro.js] Erro no fetch:", err);
      mostrarMensagem("Falha na conexão com o servidor.", true);
    });
});


// ----------------------------------------------------
// Exibe mensagem flutuante (toast simples)
// ----------------------------------------------------
function mostrarMensagem(texto, erro = false) {
  const existente = document.querySelector(".toast-mensagem");
  if (existente) existente.remove();

  const msg = document.createElement("div");
  msg.textContent = texto;
  msg.classList.add("toast-mensagem");

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
