// Rotas do carrinho – operações básicas de listar, inserir, atualizar e remover
const express = require("express");
const router = express.Router();

// Lista todos os itens do carrinho de um usuário
router.get("/:usuario_id", (req, res) => {
  const db = req.db;
  const { usuario_id } = req.params;

  // Traz os itens com informações do produto via JOIN
  const sql = `
    SELECT 
      c.id AS carrinho_id,
      c.usuario_id,
      c.produto_id,
      c.quantidade,
      p.nome,
      p.descricao,
      p.preco,
      p.imagem
    FROM carrinho c
    JOIN produtos p ON c.produto_id = p.id
    WHERE c.usuario_id = ?
  `;

  db.all(sql, [usuario_id], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows || []); // Sempre retorna array
  });
});

// Adiciona um produto ao carrinho (ou incrementa caso já exista)
router.post("/", (req, res) => {
  const db = req.db;
  const { usuario_id, produto_id, quantidade } = req.body;

  // Validação básica
  if (!usuario_id || !produto_id)
    return res.status(400).json({ error: "Dados incompletos." });

  const qtd = quantidade || 1;

  // ON CONFLICT evita duplicação do item para o mesmo usuário
  const sql = `
    INSERT INTO carrinho (usuario_id, produto_id, quantidade)
    VALUES (?, ?, ?)
    ON CONFLICT(usuario_id, produto_id)
    DO UPDATE SET quantidade = quantidade + excluded.quantidade
  `;

  db.run(sql, [usuario_id, produto_id, qtd], function (err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: "Produto adicionado ao carrinho." });
  });
});

// Atualiza a quantidade de um item já existente
router.put("/", (req, res) => {
  const db = req.db;
  const { usuario_id, produto_id, quantidade } = req.body;

  if (!usuario_id || !produto_id || quantidade < 1)
    return res.status(400).json({ error: "Dados inválidos." });

  db.run(
    `UPDATE carrinho SET quantidade = ? WHERE usuario_id = ? AND produto_id = ?`,
    [quantidade, usuario_id, produto_id],
    function (err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ message: "Quantidade atualizada." });
    }
  );
});

// Remove um item específico do carrinho
router.delete("/", (req, res) => {
  const db = req.db;
  const { usuario_id, produto_id } = req.body;

  if (!usuario_id || !produto_id)
    return res.status(400).json({ error: "Dados incompletos." });

  db.run(
    `DELETE FROM carrinho WHERE usuario_id = ? AND produto_id = ?`,
    [usuario_id, produto_id],
    function (err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ message: "Item removido." });
    }
  );
});

// Remove todos os itens de um usuário (reset do carrinho)
router.delete("/limpar/:usuario_id", (req, res) => {
  const db = req.db;
  const { usuario_id } = req.params;

  db.run(
    `DELETE FROM carrinho WHERE usuario_id = ?`,
    [usuario_id],
    function (err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ message: "Carrinho esvaziado." });
    }
  );
});

module.exports = router; // Exporta o módulo para uso no servidor principal
