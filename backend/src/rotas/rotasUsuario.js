// rotasUsuario.js
//
// Ponto de entrada das requisições relacionadas a usuários.
// Cada rota só encaminha para a função correspondente do
// controladorUsuario.

const express = require("express");
const router = express.Router();
const usuarioController = require("../controladores/controladorUsuario");

router.get("/", usuarioController.listar); // GET    /usuarios
router.get("/:id", usuarioController.buscarPorId); // GET    /usuarios/:id
router.post("/", usuarioController.criar); // POST   /usuarios
router.put("/:id", usuarioController.atualizar); // PUT    /usuarios/:id
router.delete("/:id", usuarioController.deletar); // DELETE /usuarios/:id

module.exports = router;
