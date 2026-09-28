// usuarios.js
//
// Uma função para cada rota de /usuarios exposta pelo backend (veja
// backend/src/rotas/rotasUsuario.js).

import http from "./http";

const usuariosApi = {
  // GET /usuarios
  listar: () => http.get("/usuarios").then((r) => r.data),

  // GET /usuarios/:id
  buscarPorId: (id) => http.get(`/usuarios/${id}`).then((r) => r.data),

  // POST /usuarios — dados: { nome, email }
  criar: (dados) => http.post("/usuarios", dados).then((r) => r.data),

  // PUT /usuarios/:id — dados: { nome, email }
  atualizar: (id, dados) =>
    http.put(`/usuarios/${id}`, dados).then((r) => r.data),

  // DELETE /usuarios/:id
  deletar: (id) => http.delete(`/usuarios/${id}`),
};

export default usuariosApi;
