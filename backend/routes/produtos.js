// Rotas de produtos — público e administrador (CRUD completo)
const express = require("express");
const router = express.Router();

/* ======================================================
   Lista produtos para o público (somente ativos)
====================================================== */
router.get("/", (req, res) => {
  const db = req.db;

  // Apenas produtos ativos aparecem na loja
  const sql = `
    SELECT * FROM produtos
    WHERE ativo = 1
    ORDER BY id DESC
  `;

  db.all(sql, [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });

    // Fallback da imagem para evitar erro no front
    const produtos = rows.map((p) => ({
      ...p,
      imagem: p.imagem || "placeholder.jpg",
    }));

    res.json(produtos);
  });
});

/* ======================================================
   Lista para admin — traz todos os produtos
====================================================== */
router.get("/admin", (req, res) => {
  const db = req.db;

  db.all("SELECT * FROM produtos ORDER BY id DESC", [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });

    const produtos = rows.map((p) => ({
      ...p,
      imagem: p.imagem || "placeholder.jpg",
    }));

    res.json(produtos);
  });
});

/* ======================================================
   Criar produto
====================================================== */
router.post("/", (req, res) => {
  const db = req.db;
  let { nome, descricao, preco, imagem, quantidade, ativo } = req.body;

  // Nome e preço são obrigatórios para criação
  if (!nome || !preco)
    return res.status(400).json({ error: "Nome e preço são obrigatórios!" });

  const sql = `
    INSERT INTO produtos (nome, descricao, preco, imagem, quantidade, ativo)
    VALUES (?, ?, ?, ?, ?, ?)
  `;

  db.run(
    sql,
    [nome, descricao, preco, imagem || "", quantidade || 0, ativo ?? 1],
    function (err) {
      if (err) return res.status(500).json({ error: err.message });

      // Retorna o produto criado completo
      db.get("SELECT * FROM produtos WHERE id = ?", [this.lastID], (err, row) => {
        if (err) return res.status(500).json({ error: err.message });
        res.status(201).json(row);
      });
    }
  );
});

/* ======================================================
   Editar produto (admin)
====================================================== */
router.put("/:id", (req, res) => {
  const db = req.db;
  const { id } = req.params;

  const { nome, descricao, preco, imagem, quantidade, ativo } = req.body;

  if (!nome || !preco)
    return res.status(400).json({ error: "Nome e preço são obrigatórios" });

  const sql = `
    UPDATE produtos
    SET nome = ?, descricao = ?, preco = ?, imagem = ?, quantidade = ?, ativo = ?
    WHERE id = ?
  `;

  db.run(
    sql,
    [nome, descricao, preco, imagem || "", quantidade || 0, ativo ?? 1, id],
    function (err) {
      if (err) return res.status(500).json({ error: err.message });

      // Zero changes = id inexistente
      if (this.changes === 0)
        return res.status(404).json({ error: "Produto não encontrado" });

      res.json({ message: "Produto atualizado com sucesso" });
    }
  );
});

/* ======================================================
   Alterar ativo/inativo (toggle)
====================================================== */
router.patch("/:id/ativo", (req, res) => {
  const db = req.db;
  const { id } = req.params;
  const { ativo } = req.body;

  const sql = `UPDATE produtos SET ativo = ? WHERE id = ?`;

  db.run(sql, [ativo, id], function (err) {
    if (err) return res.status(500).json({ error: err.message });

    if (this.changes === 0)
      return res.status(404).json({ error: "Produto não encontrado" });

    res.json({ message: "Status alterado" });
  });
});

/* ======================================================
   Deletar produto
====================================================== */
router.delete("/:id", (req, res) => {
  const db = req.db;

  db.run("DELETE FROM produtos WHERE id = ?", [req.params.id], function (err) {
    if (err) return res.status(500).json({ error: err.message });

    if (this.changes === 0)
      return res.status(404).json({ error: "Produto não encontrado" });

    res.json({ message: "Produto excluído" });
  });
});

module.exports = router; // Exporta rotas de produtos
