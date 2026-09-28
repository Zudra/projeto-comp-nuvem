# Biblioteca — Sistema de Reservas (containerizado)

Trabalho da disciplina de **Computação em Nuvem**: uma aplicação web de
reservas de livros entregue em containers e orquestrada com Docker Compose.

A aplicação permite cadastrar **livros** e **usuários** e registrar
**reservas** (empréstimo e devolução). Todos os dados ficam em um banco
PostgreSQL. O banco já começa com alguns livros, usuários e reservas de
exemplo para facilitar o teste.

## Integrantes

- Murilo Wolff

## Arquitetura

O `docker-compose.yml` sobe três serviços:

| Serviço    | Imagem                               | Função                                                        |
|------------|--------------------------------------|---------------------------------------------------------------|
| `db`       | `postgres:17-alpine` (oficial)       | Banco de dados. Os dados ficam no volume nomeado `pgdata`.    |
| `backend`  | construída de `backend/Dockerfile`   | API REST em Node.js + Express, que lê e grava no banco.      |
| `frontend` | construída de `frontend/Dockerfile`  | Interface em React, servida pelo nginx, que também repassa `/api` para a API. |

```
navegador ──► frontend (nginx :8080)
                 │  /api/*
                 ▼
              backend (Node :3000) ──► db (PostgreSQL :5432) ──► volume pgdata
```

- A API se conecta ao banco pelo **nome do serviço** (`DB_HOST=db`) e o
  nginx fala com a API pelo nome `backend`. Não há IP nem `localhost`
  na comunicação entre containers.
- Só a porta **8080** é publicada na máquina. Banco e API ficam
  acessíveis apenas pela rede interna do Compose.
- O banco tem `healthcheck`. A API só sobe depois que o banco está
  `healthy`, e o front-end só sobe depois que a API está `healthy`.
- Na primeira inicialização, o PostgreSQL executa automaticamente
  `backend/schema.sql` (cria as tabelas) e `backend/dados.sql` (dados
  de exemplo).

## Pré-requisitos

- [Docker](https://docs.docker.com/get-docker/) com o plugin **Docker
  Compose v2.24 ou mais recente** (o Docker Desktop atual já inclui).
  Para conferir: `docker compose version`.
- Porta **8080** livre na máquina.

Não é preciso ter Node.js nem PostgreSQL instalados.

## Como executar

```bash
git clone https://github.com/Zudra/projeto-comp-nuvem.git
cd projeto-comp-nuvem
docker compose up
```

Na primeira execução o Docker baixa as imagens base e constrói as
imagens da API e do front-end, o que pode levar alguns minutos. A
aplicação está pronta quando o serviço `frontend` inicia.

> Para rodar em segundo plano, use `docker compose up -d`.
> Depois de alterar o código, use `docker compose up --build` para
> reconstruir as imagens.

## Como acessar

| O quê                  | Endereço                               |
|------------------------|----------------------------------------|
| Aplicação (interface)  | http://localhost:8080                  |
| API (mensagem inicial) | http://localhost:8080/api/             |
| API — livros           | http://localhost:8080/api/livros       |
| API — usuários         | http://localhost:8080/api/usuarios     |
| API — reservas         | http://localhost:8080/api/reservas     |

Pela interface é possível listar, cadastrar, editar e excluir livros e
usuários, criar reservas e registrar devoluções.

Rotas da API (sempre com o prefixo `/api` quando acessadas pelo
navegador):

| Método | Rota                             | Descrição                         |
|--------|----------------------------------|-----------------------------------|
| GET    | `/livros`                        | Lista os livros                   |
| GET    | `/livros/:id`                    | Busca um livro                    |
| POST   | `/livros`                        | Cadastra um livro                 |
| PUT    | `/livros/:id`                    | Atualiza um livro                 |
| DELETE | `/livros/:id`                    | Remove um livro                   |
| GET    | `/usuarios`                      | Lista os usuários                 |
| GET    | `/usuarios/:id`                  | Busca um usuário                  |
| POST   | `/usuarios`                      | Cadastra um usuário               |
| PUT    | `/usuarios/:id`                  | Atualiza um usuário               |
| DELETE | `/usuarios/:id`                  | Remove um usuário                 |
| GET    | `/reservas`                      | Lista as reservas                 |
| GET    | `/reservas/:id`                  | Busca uma reserva                 |
| GET    | `/reservas/usuario/:idUsuario`   | Reservas de um usuário            |
| GET    | `/reservas/livro/:idLivro`       | Reservas de um livro              |
| POST   | `/reservas`                      | Cria uma reserva                  |
| PUT    | `/reservas/:id/devolver`         | Registra a devolução              |
| DELETE | `/reservas/:id`                  | Remove uma reserva                |

Exemplo de gravação pelo terminal:

```bash
curl -X POST http://localhost:8080/api/usuarios \
  -H "Content-Type: application/json" \
  -d '{"nome": "Maria Teste", "email": "maria@example.com"}'
```

## Configuração (variáveis de ambiente)

Nenhuma configuração fica fixa no código. A API lê a conexão com o
banco de variáveis de ambiente (`backend/src/database.js`) e o
PostgreSQL lê as suas credenciais da mesma forma.

- **`.env.example`** (versionado) traz os nomes de todas as variáveis
  com valores **fictícios**. O `docker-compose.yml` usa esse arquivo
  como padrão, por isso o projeto sobe sem nenhuma configuração extra.
- **`.env`** (não versionado, listado no `.gitignore`) é opcional. Se
  existir, os valores dele sobrescrevem os do `.env.example`. É onde
  ficariam senhas reais.

Para usar valores próprios:

```bash
cp .env.example .env
# edite o .env e depois:
docker compose up
```

| Variável            | Usada por  | Descrição                                        |
|---------------------|------------|--------------------------------------------------|
| `POSTGRES_DB`       | db         | Nome do banco criado na primeira inicialização   |
| `POSTGRES_USER`     | db         | Usuário do banco                                 |
| `POSTGRES_PASSWORD` | db         | Senha do banco                                   |
| `DB_HOST`           | backend    | Host do banco: o nome do serviço, `db`           |
| `DB_PORT`           | backend    | Porta do banco dentro da rede interna (`5432`)   |
| `DB_NAME`           | backend    | Igual a `POSTGRES_DB`                            |
| `DB_USER`           | backend    | Igual a `POSTGRES_USER`                          |
| `DB_PASSWORD`       | backend    | Igual a `POSTGRES_PASSWORD`                      |
| `PORT`              | backend    | Porta em que a API escuta no container           |

> O PostgreSQL só aplica `POSTGRES_*` quando o volume é criado. Se você
> mudar usuário ou senha depois da primeira execução, recrie o banco
> com `docker compose down -v` antes de subir de novo.

## Persistência dos dados

Os dados do PostgreSQL ficam no volume nomeado `pgdata`:

- `docker compose down` remove os containers, mas **mantém** o volume.
  Ao subir de novo, tudo o que foi cadastrado continua lá.
- `docker compose down -v` remove também o volume e **apaga** os dados.
  Na próxima execução o banco é recriado com os dados de exemplo.

## Como parar

```bash
docker compose down      # para e remove os containers (dados preservados)
docker compose down -v   # idem, apagando também os dados do banco
```

Se estiver rodando em primeiro plano, `Ctrl+C` também para os containers.

## Estrutura do repositório

```
projeto-comp-nuvem/
├── backend/               API (Node.js + Express)
│   ├── src/               rotas, controladores, modelos e conexão com o banco
│   ├── server.js
│   ├── schema.sql         criação das tabelas
│   ├── dados.sql          dados de exemplo
│   ├── Dockerfile
│   └── .dockerignore
├── frontend/              interface (React + Vite)
│   ├── src/
│   ├── nginx.conf         configuração do nginx (arquivos estáticos + proxy /api)
│   ├── Dockerfile
│   └── .dockerignore
├── docker-compose.yml
├── .env.example
├── .gitignore
└── README.md
```
