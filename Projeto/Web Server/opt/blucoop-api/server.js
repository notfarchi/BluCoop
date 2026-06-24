require('dotenv').config();

const express = require('express');
const session = require('express-session');
const { Pool } = require('pg');

const app = express();

app.set('trust proxy', 1);
app.disable('etag');

app.use(express.json());

app.use('/api', (req, res, next) => {
  res.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate, private');
  res.set('Pragma', 'no-cache');
  res.set('Expires', '0');
  next();
});

app.use(session({
  name: 'blucoop.sid',
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  proxy: true,
  cookie: {
    httpOnly: true,
    secure: 'auto',
    sameSite: 'lax',
    maxAge: 1000 * 60 * 60 * 2
  }
}));

const pool = new Pool({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT || 5432),
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD
});

function requireAuth(req, res, next) {
  if (req.session && req.session.authenticated) {
    return next();
  }

  return res.status(401).json({ erro: 'Nao autenticado' });
}

function validarUnidade(body) {
  const { nome, cidade, colaboradores, maquinas, servidores, status } = body;

  if (!nome || !cidade || colaboradores === undefined || maquinas === undefined || !servidores || !status) {
    return 'Todos os campos sao obrigatorios.';
  }

  if (Number.isNaN(Number(colaboradores)) || Number(colaboradores) < 0) {
    return 'Colaboradores deve ser um numero valido.';
  }

  if (Number.isNaN(Number(maquinas)) || Number(maquinas) < 0) {
    return 'Maquinas deve ser um numero valido.';
  }

  return null;
}

app.post('/api/login', (req, res) => {
  const { usuario, senha } = req.body;

  if (
    usuario === process.env.ADMIN_USER &&
    senha === process.env.ADMIN_PASSWORD
  ) {
    req.session.authenticated = true;
    req.session.user = usuario;

    return req.session.save((err) => {
      if (err) {
        console.error('Erro ao salvar sessao:', err);
        return res.status(500).json({ erro: 'Erro ao criar sessao' });
      }

      return res.json({ ok: true });
    });
  }

  return res.status(401).json({ erro: 'Credenciais invalidas' });
});

app.post('/api/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error('Erro ao destruir sessao:', err);
      return res.status(500).json({ erro: 'Erro ao encerrar sessao' });
    }

    res.clearCookie('blucoop.sid');
    return res.json({ ok: true });
  });
});

app.get('/api/session', (req, res) => {
  return res.json({
    autenticado: !!(req.session && req.session.authenticated),
    usuario: req.session && req.session.user ? req.session.user : null
  });
});

app.get('/api/unidades', requireAuth, async (req, res) => {
  try {
    const result = await pool.query(
      `select id, nome, cidade, colaboradores, maquinas, servidores, status
       from unidades
       order by id`
    );

    return res.json(result.rows);
  } catch (err) {
    console.error('Erro ao listar unidades:', err);
    return res.status(500).json({ erro: 'Erro ao listar unidades' });
  }
});

app.get('/api/unidades/:id', requireAuth, async (req, res) => {
  try {
    const result = await pool.query(
      `select id, nome, cidade, colaboradores, maquinas, servidores, status
       from unidades
       where id = $1`,
      [req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ erro: 'Unidade nao encontrada' });
    }

    return res.json(result.rows[0]);
  } catch (err) {
    console.error('Erro ao buscar unidade:', err);
    return res.status(500).json({ erro: 'Erro ao buscar unidade' });
  }
});

app.post('/api/unidades', requireAuth, async (req, res) => {
  const erroValidacao = validarUnidade(req.body);

  if (erroValidacao) {
    return res.status(400).json({ erro: erroValidacao });
  }

  try {
    const { nome, cidade, colaboradores, maquinas, servidores, status } = req.body;

    const result = await pool.query(
      `insert into unidades (nome, cidade, colaboradores, maquinas, servidores, status)
       values ($1, $2, $3, $4, $5, $6)
       returning id, nome, cidade, colaboradores, maquinas, servidores, status`,
      [
        nome.trim(),
        cidade.trim(),
        Number(colaboradores),
        Number(maquinas),
        servidores.trim(),
        status
      ]
    );

    return res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Erro ao criar unidade:', err);
    return res.status(500).json({ erro: 'Erro ao criar unidade' });
  }
});

app.put('/api/unidades/:id', requireAuth, async (req, res) => {
  const erroValidacao = validarUnidade(req.body);

  if (erroValidacao) {
    return res.status(400).json({ erro: erroValidacao });
  }

  try {
    const { nome, cidade, colaboradores, maquinas, servidores, status } = req.body;

    const result = await pool.query(
      `update unidades
       set nome = $1,
           cidade = $2,
           colaboradores = $3,
           maquinas = $4,
           servidores = $5,
           status = $6
       where id = $7
       returning id, nome, cidade, colaboradores, maquinas, servidores, status`,
      [
        nome.trim(),
        cidade.trim(),
        Number(colaboradores),
        Number(maquinas),
        servidores.trim(),
        status,
        req.params.id
      ]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ erro: 'Unidade nao encontrada' });
    }

    return res.json(result.rows[0]);
  } catch (err) {
    console.error('Erro ao atualizar unidade:', err);
    return res.status(500).json({ erro: 'Erro ao atualizar unidade' });
  }
});

app.delete('/api/unidades/:id', requireAuth, async (req, res) => {
  try {
    const result = await pool.query(
      'delete from unidades where id = $1 returning id',
      [req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ erro: 'Unidade nao encontrada' });
    }

    return res.status(204).send();
  } catch (err) {
    console.error('Erro ao excluir unidade:', err);
    return res.status(500).json({ erro: 'Erro ao excluir unidade' });
  }
});

app.use((req, res) => {
  return res.status(404).json({ erro: 'Rota nao encontrada' });
});

const port = Number(process.env.PORT || 3000);

app.listen(port, () => {
  console.log(`API rodando na porta ${port}`);
});