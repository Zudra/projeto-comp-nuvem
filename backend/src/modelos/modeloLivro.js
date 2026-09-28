// modeloLivro.js
//
// Este é o "modelo" de Livro. A única responsabilidade dele é
// conversar com o banco de dados (tabela "livros") através de SQL.
//
// Importante: aqui NÃO tem regra de negócio (tipo "só pode reservar
// se estiver disponível"). Isso é responsabilidade do controlador.
// O modelo só executa o que o controlador pedir.
//
// Todas as funções são "async" porque consultar o banco de dados
// leva um tempinho - o "await" faz o código esperar a resposta do
// banco antes de continuar.

const pool = require("../database");

// Busca todos os livros cadastrados
async function listar() {
  const resultado = await pool.query("SELECT * FROM livros ORDER BY id");
  return resultado.rows;
}

// Busca um único livro pelo id.
// Retorna "undefined" se nenhum livro tiver esse id.
async function buscarPorId(id) {
  const resultado = await pool.query("SELECT * FROM livros WHERE id = $1", [
    id,
  ]);
  return resultado.rows[0];
}

// Cria um novo livro no banco.
// Repare no "$1, $2, $3": são "parâmetros" da consulta. O driver do
// PostgreSQL substitui cada $N pelo valor correspondente do array,
// de forma segura (evita o problema de SQL Injection).
// Todo livro novo já nasce disponível para reserva.
async function criar(dados) {
  const resultado = await pool.query(
    `INSERT INTO livros (titulo, autor, ano, disponivel)
     VALUES ($1, $2, $3, true)
     RETURNING *`,
    [dados.titulo, dados.autor, dados.ano],
  );
  return resultado.rows[0]; // RETURNING * devolve a linha que acabou de ser criada
}

// Atualiza título, autor e/ou ano de um livro já existente.
// COALESCE($1, titulo) significa: "se $1 vier vazio (null/undefined),
// mantenha o valor que já estava salvo". Isso permite atualizar só
// alguns campos, sem precisar mandar todos de novo.
// O campo "disponivel" não é alterado aqui - só via reserva/devolução.
async function atualizar(id, dados) {
  const resultado = await pool.query(
    `UPDATE livros
     SET titulo = COALESCE($1, titulo),
         autor  = COALESCE($2, autor),
         ano    = COALESCE($3, ano)
     WHERE id = $4
     RETURNING *`,
    [dados.titulo, dados.autor, dados.ano, id],
  );
  return resultado.rows[0]; // undefined se o id não existir
}

// Remove um livro do banco.
// Retorna true se apagou, false se não existia livro com esse id.
async function deletar(id) {
  const resultado = await pool.query("DELETE FROM livros WHERE id = $1", [
    id,
  ]);
  return resultado.rowCount > 0;
}

// Muda apenas o campo "disponivel" de um livro.
// Quem chama essa função é o controlador de reservas, na hora de
// reservar (disponivel = false) ou devolver (disponivel = true).
async function alterarDisponibilidade(id, disponivel) {
  const resultado = await pool.query(
    "UPDATE livros SET disponivel = $1 WHERE id = $2 RETURNING *",
    [disponivel, id],
  );
  return resultado.rows[0];
}

module.exports = {
  listar,
  buscarPorId,
  criar,
  atualizar,
  deletar,
  alterarDisponibilidade,
};
