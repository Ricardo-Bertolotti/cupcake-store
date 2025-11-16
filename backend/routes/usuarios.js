// Rotas de usuários — registro, login e administração
const express = require("express");
const router = express.Router();

/* ============================================================
   Registro de usuário (fluxo público do site)
============================================================ */
router.post("/registrar", (req, res) => {
  const db = req.db;
  const { nome, email, senha, endereco } = req.body;

  // Campos mínimos obrigatórios
  if (!nome || !email || !senha) {
    return res
      .status(400)
      .json({ error: "Nome, email e senha são obrigatórios." });
  }

  const sql = `
    INSERT INTO usuarios (nome, email, senha, endereco, nivel)
    VALUES (?, ?, ?, ?, 'cliente')
  `;

  db.run(sql, [nome, email, senha, endereco || ""], function (err) {
    if (err) {
      // UNIQUE evita duplicidade de email
      if (err.message.includes("UNIQUE")) {
        return res.status(400).json({ error: "Email já cadastrado." });
      }
      return res.status(500).json({ error: err.message });
    }

    // Retorna dados básicos do usuário recém-criado
    db.get(
      "SELECT id, nome, email, endereco, nivel FROM usuarios WHERE id = ?",
      [this.lastID],
      (err, row) => {
        if (err) return res.status(500).json({ error: err.message });
        res.status(201).json(row);
      }
    );
  });
});

/* ============================================================
   Login simples (sem JWT)
============================================================ */
router.post("/login", (req, res) => {
  const db = req.db;
  const { email, senha } = req.body;

  db.get(
    "SELECT * FROM usuarios WHERE email = ? AND senha = ?",
    [email, senha],
    (err, row) => {
      if (err) return res.status(500).json({ error: err.message });

      // Autenticação direta baseada em email/senha
      if (!row)
        return res.status(401).json({ error: "Credenciais inválidas." });

      res.json({
        id: row.id,
        nome: row.nome,
        email: row.email,
        endereco: row.endereco,
        nivel: row.nivel,
      });
    }
  );
});

/* ============================================================
   Lista de usuários (painel admin)
============================================================ */
router.get("/", (req, res) => {
  const db = req.db;

  db.all(
    "SELECT id, nome, email, endereco, nivel FROM usuarios ORDER BY id DESC",
    [],
    (err, rows) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json(rows);
    }
  );
});

/* ============================================================
   Buscar usuário específico por ID
============================================================ */
router.get("/:id", (req, res) => {
  const db = req.db;
  const id = req.params.id;

  db.get(
    "SELECT id, nome, email, endereco, nivel FROM usuarios WHERE id = ?",
    [id],
    (err, row) => {
      if (err) return res.status(500).json({ error: err.message });
      if (!row)
        return res.status(404).json({ error: "Usuário não encontrado." });

      res.json(row);
    }
  );
});

/* ============================================================
   Criar usuário via painel admin (senha padrão)
============================================================ */
router.post("/", (req, res) => {
  const db = req.db;
  const { nome, email, endereco, nivel } = req.body;

  if (!nome || !email) {
    return res.status(400).json({ error: "Nome e email são obrigatórios." });
  }

  const senhaPadrao = "123456"; // padrão inicial para conta criada pelo admin

  const sql = `
    INSERT INTO usuarios (nome, email, senha, endereco, nivel)
    VALUES (?, ?, ?, ?, ?)
  `;

  db.run(
    sql,
    [nome, email, senhaPadrao, endereco || "", nivel || "cliente"],
    function (err) {
      if (err) {
        if (err.message.includes("UNIQUE")) {
          return res.status(400).json({ error: "Email já cadastrado." });
        }
        return res.status(500).json({ error: err.message });
      }

      db.get(
        "SELECT id, nome, email, endereco, nivel FROM usuarios WHERE id = ?",
        [this.lastID],
        (err, row) => {
          if (err) return res.status(500).json({ error: err.message });
          res.status(201).json(row);
        }
      );
    }
  );
});

/* ============================================================
   Atualização parcial de usuário (somente campos enviados)
============================================================ */
router.put("/:id", (req, res) => {
  const db = req.db;
  const { id } = req.params;
  const { nome, email, senha, endereco, nivel } = req.body;

  // Busca valores atuais para comparar/mesclar
  db.get("SELECT * FROM usuarios WHERE id = ?", [id], (err, user) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!user)
      return res.status(404).json({ error: "Usuário não encontrado." });

    // Mantém valor antigo caso não venha no update
    const novoNome = nome ?? user.nome;
    const novoEmail = email ?? user.email;
    const novaSenha = senha ?? user.senha;
    const novoEndereco = endereco ?? user.endereco;
    const novoNivel = nivel ?? user.nivel;

    const sql = `
      UPDATE usuarios
      SET nome = ?, email = ?, senha = ?, endereco = ?, nivel = ?
      WHERE id = ?
    `;

    db.run(
      sql,
      [novoNome, novoEmail, novaSenha, novoEndereco, novoNivel, id],
      function (err) {
        if (err) return res.status(500).json({ error: err.message });

        db.get(
          "SELECT id, nome, email, endereco, nivel FROM usuarios WHERE id = ?",
          [id],
          (err, row) => {
            if (err) return res.status(500).json({ error: err.message });
            res.json(row);
          }
        );
      }
    );
  });
});

/* ============================================================
   Deletar usuário
============================================================ */
router.delete("/:id", (req, res) => {
  const db = req.db;
  const id = req.params.id;

  db.run("DELETE FROM usuarios WHERE id = ?", [id], function (err) {
    if (err) return res.status(500).json({ error: err.message });

    if (this.changes === 0)
      return res.status(404).json({ error: "Usuário não encontrado." });

    res.json({ message: "Usuário removido com sucesso!" });
  });
});

module.exports = router; // Exporta rotas de usuário
