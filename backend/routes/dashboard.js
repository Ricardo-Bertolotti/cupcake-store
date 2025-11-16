// Rotas do painel — resumo geral e métricas para dashboards
const express = require("express");
const router = express.Router();

/* ================================
   Resumo geral (cards do dashboard)
================================ */
router.get("/resumo", (req, res) => {
  const db = req.db;

  // Consulta única com vários subselects para reduzir round-trips ao banco
  const sql = `
    SELECT
      (SELECT COUNT(*)        FROM pedidos) as total_pedidos,
      (SELECT SUM(total)      FROM pedidos) as total_vendas,
      (SELECT SUM(desconto)   FROM pedidos) as total_descontos,
      (SELECT COUNT(*)        FROM usuarios) as total_usuarios,

      (SELECT COUNT(*)        FROM produtos) as total_produtos,
      (SELECT COUNT(*)        FROM produtos WHERE ativo = 1) as produtos_ativos,
      (SELECT COUNT(*)        FROM produtos WHERE ativo = 0) as produtos_inativos,
      (SELECT COUNT(*)        FROM produtos WHERE quantidade = 0) as produtos_sem_estoque,

      (SELECT COUNT(*)        FROM cupons) as total_cupons,
      (SELECT COUNT(*)        FROM cupons WHERE ativo = 1) as cupons_ativos,
      (SELECT COUNT(*)        FROM cupons WHERE ativo = 0) as cupons_inativos
  `;

  db.get(sql, [], (err, r) => {
    if (err) return res.status(500).json({ error: err.message });

    // Média de venda por pedido
    const ticket = r.total_pedidos > 0 ? (r.total_vendas / r.total_pedidos).toFixed(2) : 0;

    res.json({
      totalPedidos: r.total_pedidos,
      totalVendas: r.total_vendas || 0,
      totalDescontos: r.total_descontos || 0,
      totalUsuarios: r.total_usuarios,

      totalProdutos: r.total_produtos,
      produtosAtivos: r.produtos_ativos,
      produtosInativos: r.produtos_inativos,
      produtosSemEstoque: r.produtos_sem_estoque || 0,

      totalCupons: r.total_cupons,
      cuponsAtivos: r.cupons_ativos,
      cuponsInativos: r.cupons_inativos,

      ticketMedio: ticket
    });
  });
});

/* ================================
   Vendas por dia (gráfico)
================================ */
router.get("/vendas-dia", (req, res) => {
  const db = req.db;

  // Agrupa pedidos pela data (apenas o dia, sem hora)
  const sql = `
      SELECT DATE(data) as dia, SUM(total) as total
      FROM pedidos
      GROUP BY DATE(data)
      ORDER BY dia ASC
  `;

  db.all(sql, [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows); // Array com { dia, total }
  });
});

/* ================================
   Status dos pedidos (gráfico)
================================ */
router.get("/status", (req, res) => {
  const db = req.db;

  // Retorna quantidade de pedidos por status
  const sql = `SELECT status, COUNT(*) as quantidade FROM pedidos GROUP BY status`;

  db.all(sql, [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

module.exports = router; // Exporta rotas do dashboard
