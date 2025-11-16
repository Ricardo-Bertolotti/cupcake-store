// Captura o formulário de recuperação de senha
const form = document.getElementById("formRecuperar");

// Listener de submit do formulário
form.addEventListener("submit", (e) => {
  e.preventDefault(); // Evita o reload padrão da página

  // Lê e sanitiza o email informado
  const email = document.getElementById("email").value.trim();

  // Validação simples de campo vazio
  if (!email) {
    mostrarMensagem("Por favor, digite um email válido.", true);
    return;
  }

  // Simulação de fluxo de recuperação
  // (no futuro: integrar com endpoint real de envio de email)
  mostrarMensagem(`Um link de redefinição foi enviado para ${email} 💌`);

  // Redireciona de volta para a tela de login após o feedback
  setTimeout(() => {
    window.location.href = "login.html";
  }, 1800);
});

// -------------------------------------------------------
// Toast de feedback visual (mesmo padrão do perfil.js)
// -------------------------------------------------------
function mostrarMensagem(texto, erro = false) {
  // Remove toast anterior, se existir
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
    background: erro ? "#ff6b6b" : "#4CAF50", // cor dinâmica conforme erro/sucesso
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

  // Animação de entrada
  requestAnimationFrame(() => (msg.style.opacity = "1"));

  // Saída com fade-out e remoção
  setTimeout(() => {
    msg.style.opacity = "0";
    setTimeout(() => msg.remove(), 300);
  }, 2000);
}
