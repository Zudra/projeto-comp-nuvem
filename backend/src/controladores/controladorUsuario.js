// controladorUsuario.js
//
// Recebe a requisição (via rotasUsuario.js), valida os dados e as
// regras de negócio, chama o modelo para mexer no banco, e devolve
// a resposta (JSON + status HTTP).

const usuarioModel = require("../modelos/modeloUsuario");

// GET /usuarios - lista todos os usuários
async function listar(req, res) {
  const usuarios = await usuarioModel.listar();
  res.json(usuarios);
}

// GET /usuarios/:id - busca um usuário específico
async function buscarPorId(req, res) {
  const id = parseInt(req.params.id);
  const usuario = await usuarioModel.buscarPorId(id);

  if (!usuario) {
    return res.status(404).json({ erro: "Usuário não encontrado" });
  }

  res.json(usuario);
}

// POST /usuarios - cria um novo usuário
async function criar(req, res) {
  const { nome, email } = req.body;

  // Validação: campos obrigatórios
  if (!nome || !email) {
    return res.status(400).json({ erro: "Campos obrigatórios: nome, email" });
  }

  // Regra de negócio: não pode haver dois usuários com o mesmo e-mail
  const existente = await usuarioModel.buscarPorEmail(email);
  if (existente) {
    return res.status(400).json({ erro: "Email já cadastrado" });
  }

  const novo = await usuarioModel.criar({ nome, email });
  res.status(201).json(novo);
}

// PUT /usuarios/:id - atualiza um usuário existente
async function atualizar(req, res) {
  const id = parseInt(req.params.id);
  const { nome, email } = req.body;

  // Regra de negócio: se o e-mail está sendo alterado, ele não pode
  // já pertencer a outro usuário.
  if (email) {
    const existente = await usuarioModel.buscarPorEmail(email);
    if (existente && existente.id !== id) {
      return res
        .status(400)
        .json({ erro: "Email já cadastrado por outro usuário" });
    }
  }

  const atualizado = await usuarioModel.atualizar(id, { nome, email });

  if (!atualizado) {
    return res.status(404).json({ erro: "Usuário não encontrado" });
  }

  res.json(atualizado);
}

// DELETE /usuarios/:id - remove um usuário
async function deletar(req, res) {
  const id = parseInt(req.params.id);

  try {
    const removido = await usuarioModel.deletar(id);

    if (!removido) {
      return res.status(404).json({ erro: "Usuário não encontrado" });
    }

    res.status(204).send();
  } catch (erro) {
    // Código "23503": o usuário ainda tem reservas cadastradas,
    // então o banco não deixa apagar (chave estrangeira).
    if (erro.code === "23503") {
      return res.status(400).json({
        erro: "Não é possível excluir: este usuário possui reservas cadastradas",
      });
    }
    throw erro;
  }
}

module.exports = { listar, buscarPorId, criar, atualizar, deletar };
