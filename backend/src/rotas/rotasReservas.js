// rotasReservas.js
//
// Ponto de entrada das requisições relacionadas a reservas.
// Cada rota só encaminha para a função correspondente do
// controladorReserva.

const express = require("express");
const router = express.Router();
const reservaController = require("../controladores/controladorReserva");

router.get("/", reservaController.listar); // GET    /reservas
router.get("/:id", reservaController.buscarPorId); // GET    /reservas/:id

// Rotas específicas: reservas de um usuário ou de um livro
router.get("/usuario/:idUsuario", reservaController.listarPorUsuario); // GET /reservas/usuario/:idUsuario
router.get("/livro/:idLivro", reservaController.listarPorLivro); // GET /reservas/livro/:idLivro

router.post("/", reservaController.criar); // POST   /reservas
router.put("/:id/devolver", reservaController.devolver); // PUT    /reservas/:id/devolver
router.delete("/:id", reservaController.deletar); // DELETE /reservas/:id

module.exports = router;
