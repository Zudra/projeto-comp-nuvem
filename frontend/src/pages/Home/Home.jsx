// Home.jsx
//
// Página inicial: um painel com números gerais do sistema (quantos
// livros, quantos estão disponíveis, etc.) e uma explicação, em
// linguagem simples, de como as regras de negócio do backend
// funcionam - pensada para quem está aprendendo a mexer no projeto.

import { Link } from "react-router";
import livrosApi from "../../api/livros";
import usuariosApi from "../../api/usuarios";
import reservasApi from "../../api/reservas";
import useRequisicao from "../../hooks/useRequisicao";
import Cartao from "../../components/ui/Cartao";
import Carregando from "../../components/ui/Carregando";
import Alerta from "../../components/ui/Alerta";
import Icone from "../../components/ui/Icone";
import "./Home.css";

// Busca os três recursos ao mesmo tempo (Promise.all) em vez de um
// atrás do outro - as três requisições saem juntas, então a página
// carrega mais rápido do que se esperássemos uma para só então
// disparar a próxima.
//
// Essa função fica fora do componente de propósito: ela não depende
// de nenhum estado ou prop do componente, então não precisa ser
// recriada a cada renderização. useRequisicao recebe a função pronta
// e cuida de chamá-la, guardar o resultado e tratar erro/loading.
async function buscarResumo() {
  const [livros, usuarios, reservas] = await Promise.all([
    livrosApi.listar(),
    usuariosApi.listar(),
    reservasApi.listar(),
  ]);
  return { livros, usuarios, reservas };
}

// Conteúdo do bloco "Como o sistema funciona" descrito como dados (um
// array) em vez de JSX repetido quatro vezes. Assim, para mudar o
// texto de um passo ou adicionar um quinto, mexe-se só aqui - o JSX
// lá embaixo (PASSOS.map) não muda.
const PASSOS = [
  {
    icone: "livro",
    titulo: "1. Cadastre livros e usuários",
    texto:
      "Todo livro novo já nasce disponível. Usuários precisam de um e-mail único.",
  },
  {
    icone: "reserva",
    titulo: "2. Crie uma reserva",
    texto:
      "Escolha um livro disponível e um usuário. Ao confirmar, o livro passa a ficar indisponível para outras reservas.",
  },
  {
    icone: "check",
    titulo: "3. Devolva o livro",
    texto:
      "Marcar a devolução preenche a data de devolução da reserva e libera o livro de novo.",
  },
  {
    icone: "alerta",
    titulo: "4. Exclusões são protegidas",
    texto:
      "Livros e usuários com reservas cadastradas não podem ser excluídos, para não perder o histórico.",
  },
];

export default function Home() {
  // Enquanto a requisição não termina, "dados" é undefined - por
  // isso todo acesso a dados.livros/usuarios/reservas abaixo usa "?."
  // (optional chaining) e "?? 0" como valor de fallback, em vez de
  // dar erro tentando ler propriedade de undefined.
  const { dados, carregando, erro } = useRequisicao(buscarResumo, []);

  const totalLivros = dados?.livros.length ?? 0;
  const livrosDisponiveis =
    dados?.livros.filter((livro) => livro.disponivel).length ?? 0;
  const totalUsuarios = dados?.usuarios.length ?? 0;
  // Uma reserva é considerada "ativa" quando ainda não tem
  // dataDevolucao preenchida - é o mesmo critério usado em todas as
  // outras telas de reserva (ListaReservas, DetalheReserva etc.), só
  // que aqui não precisamos guardar isso numa variável "ativa"
  // porque é usado uma única vez, para contar.
  const reservasAtivas =
    dados?.reservas.filter((reserva) => !reserva.dataDevolucao).length ?? 0;

  // Assim como PASSOS, os cartões de estatística viram uma lista de
  // objetos processada com .map() no JSX - evita repetir a mesma
  // estrutura de card quatro vezes com só o número/rótulo mudando.
  const cartoes = [
    { rotulo: "Livros cadastrados", valor: totalLivros, icone: "livro", para: "/livros" },
    {
      rotulo: "Livros disponíveis",
      valor: livrosDisponiveis,
      icone: "check",
      para: "/livros",
    },
    {
      rotulo: "Usuários cadastrados",
      valor: totalUsuarios,
      icone: "usuario",
      para: "/usuarios",
    },
    {
      rotulo: "Reservas ativas",
      valor: reservasAtivas,
      icone: "reserva",
      para: "/reservas",
    },
  ];

  return (
    <div className="pilha">
      <section className="inicio-hero">
        <h1>Sistema de Reservas de Biblioteca</h1>
        <p>
          Um projeto didático de CRUD com regras de negócio reais: livros,
          usuários e reservas conectados entre si, consumindo a API REST do
          backend (Node.js + Express + PostgreSQL).
        </p>
        <div className="cabecalho-pagina__acoes">
          <Link to="/reservas/nova" className="botao botao--primaria">
            <Icone nome="mais" tamanho={16} />
            Nova reserva
          </Link>
          <Link to="/livros/novo" className="botao botao--secundaria">
            Cadastrar livro
          </Link>
        </div>
      </section>

      {erro && <Alerta variante="erro">{erro}</Alerta>}

      {/* Só mostramos os cartões quando a requisição termina - caso
          contrário eles apareceriam zerados por uma fração de
          segundo antes dos números reais chegarem. */}
      {carregando ? (
        <Carregando texto="Carregando resumo..." />
      ) : (
        <div className="grade">
          {cartoes.map((item) => (
            <Link key={item.rotulo} to={item.para} className="cartao-estatistica">
              <div className="cartao-estatistica__icone">
                <Icone nome={item.icone} tamanho={20} />
              </div>
              <div>
                <strong>{item.valor}</strong>
                <span>{item.rotulo}</span>
              </div>
            </Link>
          ))}
        </div>
      )}

      <Cartao>
        <h2>Como o sistema funciona</h2>
        <p className="texto-suave">
          Estas são as regras de negócio implementadas no backend (veja os
          controladores em <code>backend/src/controladores</code>) e que este
          frontend respeita em cada tela.
        </p>

        <div className="passos">
          {PASSOS.map((passo) => (
            <div key={passo.titulo} className="passos__item">
              <div className="passos__icone">
                <Icone nome={passo.icone} tamanho={18} />
              </div>
              <div>
                <h3>{passo.titulo}</h3>
                <p>{passo.texto}</p>
              </div>
            </div>
          ))}
        </div>
      </Cartao>
    </div>
  );
}
