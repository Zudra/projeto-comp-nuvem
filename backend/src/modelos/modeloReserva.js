// modeloReserva.js
//
// "Modelo" de Reserva: só cuida de conversar com o banco de dados
// (tabela "reservas"). Regras de negócio como "o livro precisa estar
// disponível" ou "o usuário precisa existir" NÃO ficam aqui - quem
// cuida disso é o controladorReserva, que chama este modelo (e os
// modelos de livro e usuário) na ordem certa.

const pool = require("../database");

// No banco, as colunas ficam em "snake_case" (livro_id, data_reserva),
// mas o resto do projeto usa "camelCase" (idLivro, dataReserva).
// Usamos "AS" no SQL para já devolver os nomes no formato que o
// JavaScript espera, sem precisar converter no código depois.
const COLUNAS = `
  id,
  livro_id AS "idLivro",
  usuario_id AS "idUsuario",
  data_reserva AS "dataReserva",
  data_devolucao AS "dataDevolucao"
`;

// Lista todas as reservas
async function listar() {
  const resultado = await pool.query(
    `SELECT ${COLUNAS} FROM reservas ORDER BY id`,
  );
  return resultado.rows;
}

// Busca uma reserva pelo id. Retorna undefined se não existir.
async function buscarPorId(id) {
  const resultado = await pool.query(
    `SELECT ${COLUNAS} FROM reservas WHERE id = $1`,
    [id],
  );
  return resultado.rows[0];
}

// Lista as reservas feitas por um usuário específico
async function listarPorUsuario(idUsuario) {
  const resultado = await pool.query(
    `SELECT ${COLUNAS} FROM reservas WHERE usuario_id = $1 ORDER BY id`,
    [idUsuario],
  );
  return resultado.rows;
}

// Lista as reservas de um livro específico
async function listarPorLivro(idLivro) {
  const resultado = await pool.query(
    `SELECT ${COLUNAS} FROM reservas WHERE livro_id = $1 ORDER BY id`,
    [idLivro],
  );
  return resultado.rows;
}

// Cria a reserva no banco. "data_reserva" é preenchida sozinha pelo
// banco (veja o DEFAULT CURRENT_DATE no schema.sql).
async function criar(dados) {
  const resultado = await pool.query(
    `INSERT INTO reservas (livro_id, usuario_id)
     VALUES ($1, $2)
     RETURNING ${COLUNAS}`,
    [dados.idLivro, dados.idUsuario],
  );
  return resultado.rows[0];
}

// Marca a devolução, preenchendo "data_devolucao" com a data de hoje
async function devolver(id) {
  const resultado = await pool.query(
    `UPDATE reservas
     SET data_devolucao = CURRENT_DATE
     WHERE id = $1
     RETURNING ${COLUNAS}`,
    [id],
  );
  return resultado.rows[0];
}

// Remove uma reserva do banco.
async function deletar(id) {
  const resultado = await pool.query("DELETE FROM reservas WHERE id = $1", [
    id,
  ]);
  return resultado.rowCount > 0;
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
