// rotasLivro.js
//
// As "rotas" são o ponto de entrada da aplicação: definem qual URL +
// método HTTP chama qual função do controlador. Elas não têm lógica
// própria, só encaminham a requisição para o controladorLivro.

const express = require("express");
const router = express.Router();
const livroController = require("../controladores/controladorLivro");

router.get("/", livroController.listar); // GET    /livros
router.get("/:id", livroController.buscarPorId); // GET    /livros/:id
router.post("/", livroController.criar); // POST   /livros
router.put("/:id", livroController.atualizar); // PUT    /livros/:id
router.delete("/:id", livroController.deletar); // DELETE /livros/:id

module.exports = router;
