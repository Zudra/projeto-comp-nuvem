-- ============================================================
-- Schema do banco de dados - Sistema de Reservas de Livros
-- ============================================================
--
-- O que é este arquivo?
-- Este script cria as tabelas que o backend precisa para funcionar.
-- Ele NÃO é executado automaticamente pelo Node.js - você precisa
-- rodá-lo manualmente, uma vez, direto no PostgreSQL, antes de
-- iniciar o servidor (npm start / npm run dev).
--
-- Com Docker Compose (docker compose up), este arquivo é executado
-- automaticamente pelo container do PostgreSQL na primeira vez que o
-- banco é criado (veja docker-compose.yml). Nada a fazer manualmente.
--
-- Sem Docker, como executar (algumas opções):
--   1) Usando o psql:
--        psql -h host.docker.internal -p 5433 -U postgres -d teste -f schema.sql
--   2) Usando uma ferramenta gráfica (DBeaver, pgAdmin, TablePlus, etc.):
--        conecte no banco "teste" e cole/execute o conteúdo deste arquivo.
--
-- As credenciais de conexão (host, porta, usuário, senha, nome do banco)
-- estão no arquivo backend/.env
-- ============================================================


-- ----------------------------------------------------------
-- Tabela: livros
-- ----------------------------------------------------------
CREATE TABLE IF NOT EXISTS livros (
    id          SERIAL PRIMARY KEY,             -- identificador único, gerado automaticamente pelo banco
    titulo      VARCHAR(200) NOT NULL,           -- título do livro
    autor       VARCHAR(150) NOT NULL,           -- autor do livro
    ano         INTEGER NOT NULL,                -- ano de publicação
    disponivel  BOOLEAN NOT NULL DEFAULT TRUE     -- se o livro pode ser reservado agora
);

-- ----------------------------------------------------------
-- Tabela: usuarios
-- ----------------------------------------------------------
CREATE TABLE IF NOT EXISTS usuarios (
    id     SERIAL PRIMARY KEY,
    nome   VARCHAR(150) NOT NULL,
    email  VARCHAR(150) NOT NULL UNIQUE          -- o próprio banco impede e-mails duplicados
);

-- ----------------------------------------------------------
-- Tabela: reservas
-- ----------------------------------------------------------
-- Cada reserva liga um livro a um usuário.
-- Enquanto "data_devolucao" estiver vazia (NULL), a reserva está ativa
-- e o livro correspondente deve estar marcado como indisponível.
-- ----------------------------------------------------------
CREATE TABLE IF NOT EXISTS reservas (
    id              SERIAL PRIMARY KEY,
    livro_id        INTEGER NOT NULL REFERENCES livros(id),   -- qual livro foi reservado
    usuario_id      INTEGER NOT NULL REFERENCES usuarios(id), -- quem reservou
    data_reserva    DATE NOT NULL DEFAULT CURRENT_DATE,        -- preenchida automaticamente com a data de hoje
    data_devolucao  DATE                                       -- fica NULL até o livro ser devolvido
);