-- ============================================================
-- Dados simulados (seed) - Sistema de Reservas de Livros
-- ============================================================
--
-- O que é este arquivo?
-- Popula as tabelas criadas em schema.sql com dados fictícios,
-- só para ter algo para testar no Postman/Insomnia/navegador.
--
-- Com Docker Compose (docker compose up), este arquivo é executado
-- automaticamente logo depois do schema.sql, na primeira vez que o
-- banco é criado (veja docker-compose.yml).
--
-- Sem Docker, como executar:
--   Rode schema.sql primeiro (cria as tabelas), depois este arquivo:
--     psql -h host.docker.internal -p 5432 -U postgres -d teste -f dados.sql
--
-- Atenção: se rodar mais de uma vez, os dados serão duplicados
-- (os livros não têm restrição de unicidade). Se quiser recomeçar
-- do zero, rode antes:
--   TRUNCATE reservas, usuarios, livros RESTART IDENTITY CASCADE;
-- ============================================================


-- ----------------------------------------------------------
-- livros
-- ----------------------------------------------------------
INSERT INTO livros (titulo, autor, ano, disponivel) VALUES
    ('Dom Casmurro', 'Machado de Assis', 1899, TRUE),
    ('O Cortiço', 'Aluísio Azevedo', 1890, TRUE),
    ('Memórias Póstumas de Brás Cubas', 'Machado de Assis', 1881, TRUE),
    ('Grande Sertão: Veredas', 'Guimarães Rosa', 1956, TRUE),
    ('Capitães da Areia', 'Jorge Amado', 1937, TRUE),
    ('A Hora da Estrela', 'Clarice Lispector', 1977, TRUE),
    ('Vidas Secas', 'Graciliano Ramos', 1938, TRUE),
    ('1984', 'George Orwell', 1949, TRUE),
    ('O Senhor dos Anéis', 'J.R.R. Tolkien', 1954, TRUE),
    ('Harry Potter e a Pedra Filosofal', 'J.K. Rowling', 1997, TRUE);

-- ----------------------------------------------------------
-- usuarios
-- ----------------------------------------------------------
INSERT INTO usuarios (nome, email) VALUES
    ('Ana Silva', 'ana.silva@example.com'),
    ('Bruno Costa', 'bruno.costa@example.com'),
    ('Carla Souza', 'carla.souza@example.com'),
    ('Diego Ferreira', 'diego.ferreira@example.com'),
    ('Eduarda Lima', 'eduarda.lima@example.com');

-- ----------------------------------------------------------
-- reservas
-- ----------------------------------------------------------
-- Algumas reservas ativas (data_devolucao NULL) e outras já
-- encerradas (data_devolucao preenchida).
-- Os livros marcados como reservados abaixo também são
-- atualizados para disponivel = FALSE, para manter consistência
-- com a regra descrita em schema.sql.
-- ----------------------------------------------------------
INSERT INTO reservas (livro_id, usuario_id, data_reserva, data_devolucao) VALUES
    (1, 1, '2026-08-01', NULL),                    -- Ana reservou Dom Casmurro, ainda não devolveu
    (2, 2, '2026-07-15', '2026-07-30'),             -- Bruno pegou e já devolveu O Cortiço
    (4, 3, '2026-08-10', NULL),                     -- Carla reservou Grande Sertão: Veredas, ainda ativa
    (8, 4, '2026-06-20', '2026-07-05'),             -- Diego pegou 1984 e devolveu
    (9, 5, '2026-08-18', NULL);                     -- Eduarda reservou O Senhor dos Anéis, ainda ativa

UPDATE livros SET disponivel = FALSE WHERE id IN (1, 4, 9);
