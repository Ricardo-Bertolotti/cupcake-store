const express = require("express");
const router = express.Router();

// Rota para buscar dados resumidos do dashboard (cards de contagem / totais)
router.get("/dashboard", (req, res) => {
  const db = req.db;

  // Objeto base com os valores padrão (fallback caso alguma query falhe)
  const data = { usuarios: 0, produtos: 0, pedidos: 0, vendas: 0 };

  // Conta total de usuários cadastrados
  db.get("SELECT COUNT(*) AS total FROM usuarios", (err, row) => {
    if (!err && row) data.usuarios = row.total;

    // Conta total de produtos cadastrados
    db.get("SELECT COUNT(*) AS total FROM produtos", (err, row2) => {
      if (!err && row2) data.produtos = row2.total;

      // Conta total de pedidos registrados
      db.get("SELECT COUNT(*) AS total FROM pedidos", (err, row3) => {
        if (!err && row3) data.pedidos = row3.total;

        // Soma o valor total de vendas (campo total da tabela pedidos)
        db.get("SELECT SUM(total) AS soma FROM pedidos", (err, row4) => {
          if (!err && row4 && row4.soma) data.vendas = row4.soma;

          // Retorna o resumo consolidado para o frontend
          res.json(data);
        });
      });
    });
  });
});

module.exports = router; // Exporta o router para ser usado no app principal
