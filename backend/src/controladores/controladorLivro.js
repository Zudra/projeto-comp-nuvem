// controladorLivro.js
//
// O "controlador" é quem recebe a requisição (via rotasLivro.js),
// valida os dados e as regras de negócio, chama o modelo para
// mexer no banco, e devolve a resposta (JSON + status HTTP).

const livroModel = require("../modelos/modeloLivro");

// GET /livros - lista todos os livros
async function listar(req, res) {
  const livros = await livroModel.listar();
  res.json(livros);
}

// GET /livros/:id - busca um livro específico
async function buscarPorId(req, res) {
  const id = parseInt(req.params.id);
  const livro = await livroModel.buscarPorId(id);

  if (!livro) {
    return res.status(404).json({ erro: "Livro não encontrado" });
  }

  res.json(livro);
}

// POST /livros - cria um novo livro
async function criar(req, res) {
  const { titulo, autor, ano } = req.body;

  // Validação: campos obrigatórios
  if (!titulo || !autor || !ano) {
    return res
      .status(400)
      .json({ erro: "Campos obrigatórios: titulo, autor, ano" });
  }

  const novo = await livroModel.criar({ titulo, autor, ano });
  res.status(201).json(novo);
}

// PUT /livros/:id - atualiza um livro existente
async function atualizar(req, res) {
  const id = parseInt(req.params.id);
  const dados = req.body;

  // Regra de negócio: a disponibilidade não pode ser alterada por
  // aqui - ela só muda através de uma reserva ou devolução.
  delete dados.disponivel;

  const atualizado = await livroModel.atualizar(id, dados);

  if (!atualizado) {
    return res.status(404).json({ erro: "Livro não encontrado" });
  }

  res.json(atualizado);
}

// DELETE /livros/:id - remove um livro
async function deletar(req, res) {
  const id = parseInt(req.params.id);

  try {
    const removido = await livroModel.deletar(id);

    if (!removido) {
      return res.status(404).json({ erro: "Livro não encontrado" });
    }

    res.status(204).send(); // sucesso, sem conteúdo para devolver
  } catch (erro) {
    // Código "23503" é o erro que o PostgreSQL manda quando a
    // exclusão quebraria uma chave estrangeira - nesse caso, quando
    // o livro ainda tem reservas apontando para ele.
    if (erro.code === "23503") {
      return res.status(400).json({
        erro: "Não é possível excluir: este livro possui reservas cadastradas",
      });
    }
    throw erro; // qualquer outro erro vai para o tratamento genérico do app.js
  }
}

module.exports = { listar, buscarPorId, criar, atualizar, deletar };
