// livros.js
//
// Uma função para cada rota de /livros exposta pelo backend (veja
// backend/src/rotas/rotasLivro.js). Cada função devolve só o que
// interessa (r.data) - quem chama não precisa saber que por baixo
// existe um axios.

import http from "./http";

const livrosApi = {
  // GET /livros
  listar: () => http.get("/livros").then((r) => r.data),

  // GET /livros/:id
  buscarPorId: (id) => http.get(`/livros/${id}`).then((r) => r.data),

  // POST /livros — dados: { titulo, autor, ano }
  criar: (dados) => http.post("/livros", dados).then((r) => r.data),

  // PUT /livros/:id — dados: { titulo, autor, ano }
  // (o campo "disponivel" é ignorado pelo backend mesmo que seja
  // enviado - só muda através de uma reserva/devolução)
  atualizar: (id, dados) => http.put(`/livros/${id}`, dados).then((r) => r.data),

  // DELETE /livros/:id
  deletar: (id) => http.delete(`/livros/${id}`),
};

export default livrosApi;
