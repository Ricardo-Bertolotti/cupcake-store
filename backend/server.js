// Backend base da Cupcake Store — inicialização da API, BD e rotas
const express = require("express");
const cors = require("cors");
const path = require("path");
const sqlite3 = require("sqlite3").verbose();

const app = express();
const PORT = 3000;

// Middlewares globais (CORS + JSON)
app.use(cors());
app.use(express.json());

// Caminho do banco SQLite
const dbPath = path.join(__dirname, "db", "cupcake_store.db");

// Abre conexão com o banco
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) console.error("❌ Erro ao conectar ao banco:", err.message);
  else console.log("✅ Banco de dados conectado com sucesso!");
});

// Criação das tabelas (rodam apenas se não existirem)
db.serialize(() => {
  // Tabela de usuários
  db.run(`
    CREATE TABLE IF NOT EXISTS usuarios (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nome TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      senha TEXT NOT NULL,
      endereco TEXT,
      nivel TEXT DEFAULT 'cliente'
    )
  `);

  // Tabela de produtos
  db.run(`
    CREATE TABLE IF NOT EXISTS produtos (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nome TEXT NOT NULL,
      descricao TEXT,
      preco REAL NOT NULL,
      imagem TEXT,
      quantidade INTEGER DEFAULT 0,
      ativo INTEGER DEFAULT 1
    )
  `);

  // Tabela de carrinho com chave única para usuário/produto
  db.run(`
    CREATE TABLE IF NOT EXISTS carrinho (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      usuario_id INTEGER NOT NULL,
      produto_id INTEGER NOT NULL,
      quantidade INTEGER DEFAULT 1,
      UNIQUE(usuario_id, produto_id),
      FOREIGN KEY(usuario_id) REFERENCES usuarios(id),
      FOREIGN KEY(produto_id) REFERENCES produtos(id)
    )
  `);

  // Tabela de cupons
  db.run(`
    CREATE TABLE IF NOT EXISTS cupons (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      codigo TEXT UNIQUE,
      desconto REAL,
      minimo_compra REAL DEFAULT 0,
      validade TEXT,
      ativo INTEGER DEFAULT 1
    )
  `);

  // Tabela de favoritos
  db.run(`
    CREATE TABLE IF NOT EXISTS favoritos (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      usuario_id INTEGER NOT NULL,
      produto_id INTEGER NOT NULL,
      UNIQUE(usuario_id, produto_id),
      FOREIGN KEY(usuario_id) REFERENCES usuarios(id),
      FOREIGN KEY(produto_id) REFERENCES produtos(id)
    )
  `);
});

// Tabela de pedidos
db.run(`
CREATE TABLE IF NOT EXISTS pedidos (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  usuario_id INTEGER,
  subtotal REAL,
  desconto REAL,
  total REAL,
  status TEXT DEFAULT 'aguardando',
  cupom TEXT,
  endereco TEXT,
  forma_pagamento TEXT,
  data TEXT DEFAULT CURRENT_TIMESTAMP
)
`);

// Itens do pedido (produtos relacionados ao pedido)
db.run(`
  CREATE TABLE IF NOT EXISTS itens_pedido (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    pedido_id INTEGER NOT NULL,
    produto_id INTEGER NOT NULL,
    quantidade INTEGER NOT NULL,
    preco REAL NOT NULL,
    FOREIGN KEY(pedido_id) REFERENCES pedidos(id),
    FOREIGN KEY(produto_id) REFERENCES produtos(id)
  )
`);

// Importa módulos de rotas externos
const produtosRoutes = require("./routes/produtos");
const usuariosRoutes = require("./routes/usuarios");
const pedidosRoutes = require("./routes/pedidos");
const adminRoutes = require("./routes/admin");
const favoritosRoutes = require("./routes/favoritos");
const cuponsRoutes = require("./routes/cupons");
const carrinhoRoutes = require("./routes/carrinho");
const checkoutRoutes = require("./routes/checkout");
const dashboardRoutes = require("./routes/dashboard");

// Middleware que injeta o banco em cada requisição
app.use((req, res, next) => {
  req.db = db;
  next();
});

// Registro das rotas da API
app.use("/produtos", produtosRoutes);
app.use("/usuarios", usuariosRoutes);
app.use("/pedidos", pedidosRoutes);
app.use("/admin", adminRoutes);
app.use("/favoritos", favoritosRoutes);
app.use("/cupons", cuponsRoutes);
app.use("/carrinho", carrinhoRoutes);
app.use("/checkout", checkoutRoutes);
app.use("/dashboard", dashboardRoutes);

// Rota raiz (simples healthcheck)
app.get("/", (req, res) => {
  res.send("🚀 Servidor Cupcake Store ativo e rodando!");
});

// Inicializa o servidor
app.listen(PORT, () => {
  console.log(`🌐 Servidor rodando em http://localhost:${PORT}`);
});
