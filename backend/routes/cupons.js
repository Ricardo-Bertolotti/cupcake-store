// Rotas de cupons – gerenciamento completo (admin + cliente)
const express = require("express");
const router = express.Router();

// Cliente busca cupom pelo código
router.get("/buscar/:codigo", (req, res) => {
  const db = req.db;
  const { codigo } = req.params;

  // Busca direta; upper para padronizar entrada
  db.get(
    "SELECT * FROM cupons WHERE codigo = ?",
    [codigo.toUpperCase()],
    (err, row) => {
      if (err) return res.status(500).json({ error: err.message });
      if (!row) return res.status(404).json({ error: "Cupom não encontrado." });
      res.json(row);
    }
  );
});

// Lista todos os cupons (admin)
router.get("/", (req, res) => {
  const db = req.db;

  db.all("SELECT * FROM cupons ORDER BY id DESC", [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows || []);
  });
});

// Criação de cupom (admin)
router.post("/", (req, res) => {
  const db = req.db;
  const { codigo, desconto, minimo_compra, validade, ativo } = req.body;

  const sql = `
    INSERT INTO cupons (codigo, desconto, minimo_compra, validade, ativo)
    VALUES (?, ?, ?, ?, ?)
  `;

  db.run(sql, [codigo, desconto, minimo_compra, validade, ativo], function (err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ id: this.lastID, message: "Cupom criado com sucesso!" });
  });
});

// Alteração de cupom (admin)
router.put("/:id", (req, res) => {
  const db = req.db;
  const { id } = req.params;
  const { codigo, desconto, minimo_compra, validade, ativo } = req.body;

  const sql = `
    UPDATE cupons
    SET codigo = ?, desconto = ?, minimo_compra = ?, validade = ?, ativo = ?
    WHERE id = ?
  `;

  db.run(sql, [codigo, desconto, minimo_compra, validade, ativo, id], function (err) {
    if (err) return res.status(500).json({ error: err.message });
    if (this.changes === 0)
      return res.status(404).json({ error: "Cupom não encontrado." });

    res.json({ message: "Cupom atualizado com sucesso!" });
  });
});

// Remoção de cupom (admin)
router.delete("/:id", (req, res) => {
  const db = req.db;
  const { id } = req.params;

  db.run("DELETE FROM cupons WHERE id = ?", [id], function (err) {
    if (err) return res.status(500).json({ error: err.message });
    if (this.changes === 0)
      return res.status(404).json({ error: "Cupom não encontrado." });

    res.json({ message: "Cupom removido." });
  });
});

// Cliente aplica cupom ao carrinho
router.post("/aplicar", (req, res) => {
  const db = req.db;
  const { usuario_id, codigo } = req.body;

  if (!usuario_id || !codigo) {
    return res.status(400).json({ error: "Dados incompletos." });
  }

  // Verifica cupom ativo
  db.get(
    "SELECT * FROM cupons WHERE codigo = ? AND ativo = 1",
    [codigo],
    (err, cupom) => {
      if (err) return res.status(500).json({ error: err.message });
      if (!cupom) return res.status(404).json({ error: "Cupom inválido." });

      // Carrega itens do carrinho para calcular subtotal
      db.all(
        `
        SELECT p.preco, c.quantidade 
        FROM carrinho c
        JOIN produtos p ON p.id = c.produto_id
        WHERE c.usuario_id = ?
        `,
        [usuario_id],
        (err, itens) => {
          if (err) return res.status(500).json({ error: err.message });

          const subtotal = itens.reduce(
            (acc, item) => acc + item.preco * item.quantidade,
            0
          );

          // Valida mínimo exigido para o cupom
          if (subtotal < cupom.minimo_compra) {
            return res.status(400).json({
              error: `Valor mínimo para usar este cupom é R$ ${cupom.minimo_compra}.`,
            });
          }

          // Remove cupom antigo aplicado pelo usuário
          db.run(
            "DELETE FROM cupons_uso WHERE usuario_id = ?",
            [usuario_id],
            (err) => {
              if (err) return res.status(500).json({ error: err.message });

              // Registra novo cupom aplicado
              db.run(
                "INSERT INTO cupons_uso (usuario_id, codigo) VALUES (?, ?)",
                [usuario_id, codigo],
                (err) => {
                  if (err)
                    return res.status(500).json({ error: err.message });

                  res.json({
                    success: true,
                    message: "Cupom aplicado!",
                    desconto: cupom.desconto,
                    minimo: cupom.minimo_compra,
                  });
                }
              );
            }
          );
        }
      );
    }
  );
});

// Cupom atualmente aplicado pelo usuário
router.get("/aplicado/:usuario_id", (req, res) => {
  const db = req.db;
  const { usuario_id } = req.params;

  db.get(
    `
    SELECT u.codigo, c.desconto, c.minimo_compra
    FROM cupons_uso u
    JOIN cupons c ON c.codigo = u.codigo
    WHERE u.usuario_id = ?
    `,
    [usuario_id],
    (err, row) => {
      if (err) return res.status(500).json({ error: err.message });
      if (!row) return res.status(404).json({ error: "Nenhum cupom ativo." });

      res.json(row);
    }
  );
});

module.exports = router; // Exporta rotas de cupons
