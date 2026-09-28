// reservas.js
//
// Uma função para cada rota de /reservas exposta pelo backend (veja
// backend/src/rotas/rotasReservas.js). Este é o recurso mais "rico"
// do sistema: além do CRUD básico, tem as ações de negócio
// "devolver" e as buscas filtradas por usuário/livro.

import http from "./http";

const reservasApi = {
  // GET /reservas
  listar: () => http.get("/reservas").then((r) => r.data),

  // GET /reservas/:id
  buscarPorId: (id) => http.get(`/reservas/${id}`).then((r) => r.data),

  // GET /reservas/usuario/:idUsuario — histórico de reservas de um usuário
  listarPorUsuario: (idUsuario) =>
    http.get(`/reservas/usuario/${idUsuario}`).then((r) => r.data),

  // GET /reservas/livro/:idLivro — histórico de reservas de um livro
  listarPorLivro: (idLivro) =>
    http.get(`/reservas/livro/${idLivro}`).then((r) => r.data),

  // POST /reservas — dados: { idLivro, idUsuario }
  criar: (dados) => http.post("/reservas", dados).then((r) => r.data),

  // PUT /reservas/:id/devolver — marca o livro como devolvido
  devolver: (id) => http.put(`/reservas/${id}/devolver`).then((r) => r.data),

  // DELETE /reservas/:id
  deletar: (id) => http.delete(`/reservas/${id}`),
};

export default reservasApi;
