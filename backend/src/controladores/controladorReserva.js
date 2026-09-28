// controladorReserva.js
//
// Este é o controlador mais importante do sistema: reservas envolvem
// três tabelas ao mesmo tempo (livros, usuários e reservas), então é
// aqui que ficam as regras de negócio que "coordenam" os três modelos.

const reservaModel = require("../modelos/modeloReserva");
const livroModel = require("../modelos/modeloLivro");
const usuarioModel = require("../modelos/modeloUsuario");

// GET /reservas - lista todas as reservas
async function listar(req, res) {
  const reservas = await reservaModel.listar();
  res.json(reservas);
}

// GET /reservas/:id - busca uma reserva específica
async function buscarPorId(req, res) {
  const id = parseInt(req.params.id);
  const reserva = await reservaModel.buscarPorId(id);

  if (!reserva) {
    return res.status(404).json({ erro: "Reserva não encontrada" });
  }

  res.json(reserva);
}

// GET /reservas/usuario/:idUsuario - lista as reservas de um usuário
async function listarPorUsuario(req, res) {
  const idUsuario = parseInt(req.params.idUsuario);
  const reservas = await reservaModel.listarPorUsuario(idUsuario);
  res.json(reservas);
}

// GET /reservas/livro/:idLivro - lista as reservas de um livro
async function listarPorLivro(req, res) {
  const idLivro = parseInt(req.params.idLivro);
  const reservas = await reservaModel.listarPorLivro(idLivro);
  res.json(reservas);
}

// POST /reservas - cria uma nova reserva
//
// Passo a passo (regras de negócio):
//   1. idLivro e idUsuario são obrigatórios
//   2. o livro precisa existir e estar disponível
//   3. o usuário precisa existir
//   4. cria a reserva
//   5. marca o livro como indisponível
async function criar(req, res) {
  const { idLivro, idUsuario } = req.body;

  if (!idLivro || !idUsuario) {
    return res
      .status(400)
      .json({ erro: "Campos obrigatórios: idLivro, idUsuario" });
  }

  const livro = await livroModel.buscarPorId(parseInt(idLivro));
  if (!livro) {
    return res.status(404).json({ erro: "Livro não encontrado" });
  }
  if (!livro.disponivel) {
    return res.status(400).json({ erro: "Livro não está disponível" });
  }

  const usuario = await usuarioModel.buscarPorId(parseInt(idUsuario));
  if (!usuario) {
    return res.status(404).json({ erro: "Usuário não encontrado" });
  }

  const reserva = await reservaModel.criar({
    idLivro: parseInt(idLivro),
    idUsuario: parseInt(idUsuario),
  });

  // Depois que a reserva foi criada, o livro deixa de estar disponível
  await livroModel.alterarDisponibilidade(livro.id, false);

  res.status(201).json(reserva);
}

// PUT /reservas/:id/devolver - devolve o livro de uma reserva
//
// Passo a passo:
//   1. a reserva precisa existir
//   2. ela não pode já ter sido devolvida antes
//   3. marca a data de devolução
//   4. o livro volta a ficar disponível
async function devolver(req, res) {
  const id = parseInt(req.params.id);

  const reserva = await reservaModel.buscarPorId(id);
  if (!reserva) {
    return res.status(404).json({ erro: "Reserva não encontrada" });
  }
  if (reserva.dataDevolucao) {
    return res.status(400).json({ erro: "Livro já foi devolvido" });
  }

  const reservaAtualizada = await reservaModel.devolver(id);

  // Livro devolvido: volta a ficar disponível para outra reserva
  await livroModel.alterarDisponibilidade(reserva.idLivro, true);

  res.json(reservaAtualizada);
}

// DELETE /reservas/:id - remove uma reserva
//
// Se a reserva ainda estava ativa (livro não devolvido), o livro
// precisa voltar a ficar disponível antes de apagarmos a reserva.
async function deletar(req, res) {
  const id = parseInt(req.params.id);

  const reserva = await reservaModel.buscarPorId(id);
  if (!reserva) {
    return res.status(404).json({ erro: "Reserva não encontrada" });
  }

  if (!reserva.dataDevolucao) {
    await livroModel.alterarDisponibilidade(reserva.idLivro, true);
  }

  await reservaModel.deletar(id);
  res.status(204).send();
}

module.exports = {
  listar,
  buscarPorId,
  listarPorUsuario,
  listarPorLivro,
  criar,
  devolver,
  deletar,
};
