// Rotas de favoritos — adicionar, remover e listar produtos favoritados
const express = require("express");
const router = express.Router();

// Lista favoritos de um usuário com dados completos do produto
router.get("/:usuario_id", (req, res) => {
  const db = req.db;
  const { usuario_id } = req.params;

  // JOIN traz as informações do produto associado ao favorito
  const sql = `
    SELECT 
      p.id,
      p.nome,
      p.descricao,
      p.preco,
      p.imagem,
      p.quantidade,
      p.ativo
    FROM favoritos f
    INNER JOIN produtos p ON p.id = f.produto_id
    WHERE f.usuario_id = ?
    ORDER BY p.nome ASC
  `;

  db.all(sql, [usuario_id], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows); // Sempre retorna array
  });
});

// Adiciona um produto à lista de favoritos
router.post("/", (req, res) => {
  const db = req.db;
  const { usuario_id, produto_id } = req.body;

  if (!usuario_id || !produto_id)
    return res.status(400).json({ error: "Dados incompletos." });

  // IGNORE evita duplicação caso já exista favorito igual
  const sql = `INSERT OR IGNORE INTO favoritos (usuario_id, produto_id) VALUES (?, ?)`;

  db.run(sql, [usuario_id, produto_id], function (err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: "Favorito adicionado!" });
  });
});

// Remove um item dos favoritos
router.delete("/", (req, res) => {
  const db = req.db;
  const { usuario_id, produto_id } = req.body;

  if (!usuario_id || !produto_id)
    return res.status(400).json({ error: "Dados incompletos." });

  const sql = `DELETE FROM favoritos WHERE usuario_id = ? AND produto_id = ?`;

  db.run(sql, [usuario_id, produto_id], function (err) {
    if (err) return res.status(500).json({ error: err.message });

    // Se não removeu nada, favorito não existia
    if (this.changes === 0)
      return res.status(404).json({ error: "Favorito não encontrado." });

    res.json({ message: "Removido com sucesso!" });
  });
});

module.exports = router; // Exporta rotas de favoritos
