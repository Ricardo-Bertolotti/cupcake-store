const apiURL = "http://localhost:3000/usuarios/login";

// ===== Mostrar / ocultar senha (correto) =====
const senhaInput = document.getElementById("senha");
const togglePass = document.getElementById("togglePass");

togglePass.addEventListener("click", () => {
  const isPassword = senhaInput.type === "password";
  senhaInput.type = isPassword ? "text" : "password";
  togglePass.textContent = isPassword ? "🙈" : "👁️";
});
// ============================================


// ===== Lógica de login =====
document.getElementById("formLogin").addEventListener("submit", async (e) => {
  e.preventDefault(); // evita reload padrão do formulário

  const email = document.getElementById("email").value.trim();
  const senha = document.getElementById("senha").value.trim();

  // Validação mínima
  if (!email || !senha) {
    alert("Preencha todos os campos!");
    return;
  }

  try {
    const resp = await fetch(apiURL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, senha })
    });

    const data = await resp.json();

    if (!resp.ok) {
      alert(data.error || "Erro no login!");
      return;
    }

    localStorage.setItem("usuario", JSON.stringify(data));

    alert(`Bem-vindo, ${data.nome}!`);

    if (data.nivel === "admin") {
      window.location.href = "admin/admin.html";
    } else {
      window.location.href = "index.html";
    }

  } catch (err) {
    console.error("Erro de conexão:", err);
    alert("Falha ao conectar com o servidor.");
  }
});
