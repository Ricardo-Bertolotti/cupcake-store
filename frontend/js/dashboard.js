const apiURL = "http://localhost:3000/produtos";

// Carrega a lista de produtos da API e renderiza os cards no grid
async function carregarProdutos() {
  const resp = await fetch(apiURL);
  const produtos = await resp.json();

  const container = document.getElementById("produtos");
  container.innerHTML = ""; // limpa o grid antes de recriar

  produtos.forEach((p) => {
    const card = document.createElement("div");
    card.className = "product-card";

    // Usa imagem do produto ou um placeholder padrão
    card.innerHTML = `
      <img src="${p.imagem || "https://placehold.co/300x200?text=Cupcake"}" alt="${p.nome}">
      <h3>${p.nome}</h3>
      <p>${p.descricao || ""}</p>
      <div class="price">R$ ${p.preco.toFixed(2)}</div>
      <button class="btn-primary">Adicionar ao carrinho</button>
    `;

    container.appendChild(card);
  });
}

// Inicializa carregamento ao entrar na página
carregarProdutos();
