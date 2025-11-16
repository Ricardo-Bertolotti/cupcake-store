// Rotas de pedidos — consulta, detalhes e administração
const express = require("express");
const router = express.Router();

/* ========================================================
   1. Lista todos os pedidos feitos por um usuário
======================================================== */
router.get("/usuario/:usuario_id", (req, res) => {
  const db = req.db;
  const usuarioId = req.params.usuario_id;

  // Dados básicos do pedido, sem itens ainda
  const sql = `
    SELECT 
      p.id, 
      p.subtotal, 
      p.desconto, 
      p.total,
      p.cupom,
      p.status,
      p.data
    FROM pedidos p
    WHERE p.usuario_id = ?
    ORDER BY p.id DESC
  `;

  db.all(sql, [usuarioId], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows); // retorna array com os pedidos do usuário
  });
});

/* ========================================================
   2. Detalhes completos de um pedido (pedido + itens)
======================================================== */
router.get("/:id", (req, res) => {
  const db = req.db;
  const id = req.params.id;

  // Dados principais do pedido
  const sqlPedido = `
    SELECT 
      p.id,
      p.subtotal,
      p.desconto,
      p.total,
      p.cupom,
      p.status,
      p.endereco,
      p.forma_pagamento,
      p.data,
      u.nome AS usuario
    FROM pedidos p
    LEFT JOIN usuarios u ON u.id = p.usuario_id
    WHERE p.id = ?
  `;

  // Itens relacionados ao pedido
  const sqlItens = `
    SELECT 
      i.id, 
      pr.nome,
      pr.preco,
      i.quantidade
    FROM itens_pedido i
    JOIN produtos pr ON pr.id = i.produto_id
    WHERE i.pedido_id = ?
  `;

  db.get(sqlPedido, [id], (err, pedido) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!pedido) return res.status(404).json({ error: "Pedido não encontrado." });

    db.all(sqlItens, [id], (err, itens) => {
      if (err) return res.status(500).json({ error: err.message });

      pedido.itens = itens; // adiciona lista de itens ao pedido
      res.json(pedido);
    });
  });
});

/* ========================================================
   3. Lista todos os pedidos (admin)
======================================================== */
router.get("/", (req, res) => {
  const db = req.db;

  // Inclui nome do usuário via JOIN para facilitar o painel admin
  const sql = `
    SELECT 
      p.id,
      u.nome AS usuario,
      p.total,
      p.status,
      p.forma_pagamento,
      p.data
    FROM pedidos p
    LEFT JOIN usuarios u ON u.id = p.usuario_id
    ORDER BY p.data DESC
  `;

  db.all(sql, [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

/* ========================================================
   4. Atualização de status de pedido (admin)
======================================================== */
router.put("/:id/status", (req, res) => {
  const db = req.db;
  const { id } = req.params;
  const { status } = req.body;

  const sql = "UPDATE pedidos SET status = ? WHERE id = ?";

  db.run(sql, [status, id], function (err) {
    if (err) return res.status(500).json({ error: err.message });

    // Garantia de que o pedido existia
    if (this.changes === 0) {
      return res.status(404).json({ error: "Pedido não encontrado." });
    }

    res.json({ message: "Status atualizado com sucesso!" });
  });
});

module.exports = router; // Exporta rotas de pedidos
