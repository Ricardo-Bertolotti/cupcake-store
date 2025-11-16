// Checkout oficial – processa carrinho, valida estoque, aplica cupom e cria pedido
const express = require("express");
const router = express.Router();

router.post("/", async (req, res) => {
  const db = req.db;
  const { usuario_id, endereco, forma_pagamento } = req.body;

  // Valida se o mínimo necessário chegou do frontend
  if (!usuario_id || !endereco || !forma_pagamento) {
    return res.status(400).json({ error: "Dados incompletos." });
  }

  try {
    // ------------------------------ Carrega itens do carrinho ------------------------------
    // Promise wrapper porque SQLite usa callback
    const itens = await new Promise((resolve, reject) => {
      db.all(
        `
        SELECT 
          c.produto_id,
          c.quantidade,
          p.preco,
          p.quantidade AS estoque
        FROM carrinho c
        JOIN produtos p ON p.id = c.produto_id
        WHERE c.usuario_id = ?
        `,
        [usuario_id],
        (err, rows) => (err ? reject(err) : resolve(rows))
      );
    });

    if (!itens || itens.length === 0) {
      return res.status(400).json({ error: "Carrinho vazio." });
    }

    // ------------------------------ Validação de estoque ------------------------------
    // Evita vender produtos que não têm quantidade suficiente
    for (const item of itens) {
      if (item.quantidade > item.estoque) {
        return res.status(400).json({
          error: `Estoque insuficiente para o produto ID ${item.produto_id}`,
        });
      }
    }

    // Soma subtotal do pedido
    const subtotal = itens.reduce(
      (acc, item) => acc + item.preco * item.quantidade,
      0
    );

    // ------------------------------ Cupom aplicado ------------------------------
    // Cupom previamente armazenado por usuário (tabela cupons_uso)
    let desconto = 0;
    let cupomCodigo = null;

    const cupomAplicado = await new Promise((resolve) => {
      db.get(
        "SELECT codigo FROM cupons_uso WHERE usuario_id = ?",
        [usuario_id],
        (err, row) => resolve(row)
      );
    });

    if (cupomAplicado) {
      // Valida se o cupom ainda está ativo
      const cupom = await new Promise((resolve) => {
        db.get(
          "SELECT * FROM cupons WHERE codigo = ? AND ativo = 1",
          [cupomAplicado.codigo],
          (err, row) => resolve(row)
        );
      });

      if (cupom) {
        desconto = subtotal * (cupom.desconto / 100);
        cupomCodigo = cupom.codigo;
      }
    }

    const totalFinal = subtotal - desconto;

    // ------------------------------ Criação do pedido ------------------------------
    const pedido_id = await new Promise((resolve, reject) => {
      db.run(
        `
        INSERT INTO pedidos
        (usuario_id, subtotal, desconto, total, cupom, endereco, forma_pagamento, status)
        VALUES (?, ?, ?, ?, ?, ?, ?, 'Solicitado')
        `,
        [
          usuario_id,
          subtotal,
          desconto,
          totalFinal,
          cupomCodigo,
          endereco,
          forma_pagamento,
        ],
        function (err) {
          if (err) reject(err);
          else resolve(this.lastID); // ID do pedido gerado
        }
      );
    });

    // ------------------------------ Salva itens e baixa estoque ------------------------------
    for (const item of itens) {
      // Insere item no pedido
      db.run(
        `
        INSERT INTO itens_pedido 
        (pedido_id, produto_id, quantidade, preco)
        VALUES (?, ?, ?, ?)
        `,
        [pedido_id, item.produto_id, item.quantidade, item.preco]
      );

      // Atualiza estoque do produto
      db.run(
        `
        UPDATE produtos
        SET quantidade = quantidade - ?
        WHERE id = ?
        `,
        [item.quantidade, item.produto_id]
      );
    }

    // Limpa carrinho do usuário após finalizar
    db.run("DELETE FROM carrinho WHERE usuario_id = ?", [usuario_id]);

    // Remove cupom ativo do usuário
    db.run("DELETE FROM cupons_uso WHERE usuario_id = ?", [usuario_id]);

    // Resposta final do checkout
    res.json({
      success: true,
      pedido_id,
      subtotal,
      desconto,
      totalFinal,
      cupom: cupomCodigo,
    });

  } catch (err) {
    console.error("❌ Erro no checkout:", err);
    res.status(500).json({ error: "Erro interno." });
  }
});

module.exports = router; // Exporta rota para uso no servidor principal
