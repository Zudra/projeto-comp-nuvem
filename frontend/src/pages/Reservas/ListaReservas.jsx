// ListaReservas.jsx
//
// Tela GET /reservas: lista todas as reservas, com filtro por status
// (ativas / devolvidas) e as ações de devolver e excluir.
//
// A API de reservas devolve só "idLivro" e "idUsuario" em cada
// registro - por isso buscamos livros e usuários junto, e cruzamos
// os ids na hora de montar a tabela (veja tituloDoLivro/nomeDoUsuario).

import { useState } from "react";
import { Link } from "react-router";
import livrosApi from "../../api/livros";
import usuariosApi from "../../api/usuarios";
import reservasApi from "../../api/reservas";
import useRequisicao from "../../hooks/useRequisicao";
import { mensagemDeErro } from "../../api/http";

import Cartao from "../../components/ui/Cartao";
import Carregando from "../../components/ui/Carregando";
import Alerta from "../../components/ui/Alerta";
import EstadoVazio from "../../components/ui/EstadoVazio";
import Etiqueta from "../../components/ui/Etiqueta";
import Icone from "../../components/ui/Icone";
import BotaoIcone from "../../components/ui/BotaoIcone";
import DialogoConfirmacao from "../../components/ui/DialogoConfirmacao";
import "../../components/ui/Tabela.css";
import "./Reservas.css";

async function buscarTudo() {
  const [reservas, livros, usuarios] = await Promise.all([
    reservasApi.listar(),
    livrosApi.listar(),
    usuariosApi.listar(),
  ]);
  return { reservas, livros, usuarios };
}

// Lista de filtros descrita como dados, igual ao PASSOS de Home.jsx:
// os botões de filtro (abas) são gerados com .map() a partir daqui,
// então adicionar um filtro novo não exige mexer no JSX.
const FILTROS = [
  { valor: "todas", rotulo: "Todas" },
  { valor: "ativas", rotulo: "Ativas" },
  { valor: "devolvidas", rotulo: "Devolvidas" },
];

export default function ListaReservas() {
  const { dados, carregando, erro, recarregar } = useRequisicao(buscarTudo, []);

  const [filtro, setFiltro] = useState("todas");
  const [reservaParaExcluir, setReservaParaExcluir] = useState(null);
  // Um único "processando" cobre tanto devolver quanto excluir -
  // as duas ações desabilitam os botões da linha da mesma forma
  // enquanto uma requisição está em voo, então não há necessidade de
  // dois estados de carregamento separados.
  const [processando, setProcessando] = useState(false);
  const [erroAcao, setErroAcao] = useState(null);

  const reservas = dados?.reservas ?? [];
  const livros = dados?.livros ?? [];
  const usuarios = dados?.usuarios ?? [];

  // A API de reservas só devolve os ids do livro e do usuário
  // envolvidos - estas funções fazem a "tradução" id → objeto usando
  // as listas completas que buscamos junto, para exibir título e
  // nome na tabela em vez de números soltos.
  function tituloDoLivro(idLivro) {
    return livros.find((livro) => livro.id === idLivro)?.titulo ?? "—";
  }
  function nomeDoUsuario(idUsuario) {
    return usuarios.find((usuario) => usuario.id === idUsuario)?.nome ?? "—";
  }

  // Filtro por status aplicado no navegador, sobre a lista já
  // carregada - mesmo raciocínio da busca em ListaLivros.jsx: não
  // vale a pena ir ao servidor de novo só para trocar de aba.
  const reservasFiltradas = reservas.filter((reserva) => {
    if (filtro === "ativas") return !reserva.dataDevolucao;
    if (filtro === "devolvidas") return Boolean(reserva.dataDevolucao);
    return true;
  });

  async function devolverReserva(reserva) {
    setProcessando(true);
    setErroAcao(null);
    try {
      await reservasApi.devolver(reserva.id);
      recarregar();
    } catch (erroCapturado) {
      setErroAcao(mensagemDeErro(erroCapturado));
    } finally {
      setProcessando(false);
    }
  }

  async function confirmarExclusao() {
    setProcessando(true);
    try {
      await reservasApi.deletar(reservaParaExcluir.id);
      setReservaParaExcluir(null);
      recarregar();
    } catch (erroCapturado) {
      setErroAcao(mensagemDeErro(erroCapturado));
      setReservaParaExcluir(null);
    } finally {
      setProcessando(false);
    }
  }

  return (
    <div className="pilha">
      <div className="cabecalho-pagina">
        <div className="cabecalho-pagina__texto">
          <h1>Reservas</h1>
          <p>Empréstimos em andamento e já devolvidos.</p>
        </div>
        <div className="cabecalho-pagina__acoes">
          <Link to="/reservas/nova" className="botao botao--primaria">
            <Icone nome="mais" tamanho={16} />
            Nova reserva
          </Link>
        </div>
      </div>

      {(erro || erroAcao) && <Alerta variante="erro">{erro || erroAcao}</Alerta>}

      <Cartao>
        {!carregando && reservas.length > 0 && (
          <div className="filtro-status">
            {FILTROS.map((item) => (
              <button
                key={item.valor}
                type="button"
                className={`filtro-status__item ${
                  filtro === item.valor ? "filtro-status__item--ativo" : ""
                }`}
                onClick={() => setFiltro(item.valor)}
              >
                {item.rotulo}
              </button>
            ))}
          </div>
        )}

        {/* Mesma lógica de prioridade de ListaLivros.jsx: primeiro
            carregando, depois "não há reserva nenhuma" (acervo vazio
            de reservas), depois "o filtro escolhido não bateu com
            nada", e só então a tabela. */}
        {carregando ? (
          <Carregando texto="Carregando reservas..." />
        ) : reservas.length === 0 ? (
          <EstadoVazio
            icone="reserva"
            titulo="Nenhuma reserva registrada"
            descricao="Crie uma reserva escolhendo um livro disponível e um usuário."
            acao={
              <Link to="/reservas/nova" className="botao botao--primaria">
                Nova reserva
              </Link>
            }
          />
        ) : reservasFiltradas.length === 0 ? (
          <EstadoVazio icone="busca" titulo="Nenhuma reserva neste filtro" />
        ) : (
          <div className="tabela-wrapper">
            <table className="tabela">
              <thead>
                <tr>
                  <th>Livro</th>
                  <th>Usuário</th>
                  <th>Reservado em</th>
                  <th>Devolução</th>
                  <th className="tabela__coluna-acoes">Ações</th>
                </tr>
              </thead>
              <tbody>
                {reservasFiltradas.map((reserva) => {
                  const ativa = !reserva.dataDevolucao;
                  return (
                    <tr key={reserva.id}>
                      <td>
                        <Link to={`/reservas/${reserva.id}`} className="tabela__linha-link">
                          {tituloDoLivro(reserva.idLivro)}
                        </Link>
                      </td>
                      <td>{nomeDoUsuario(reserva.idUsuario)}</td>
                      <td>{reserva.dataReserva}</td>
                      <td>
                        {ativa ? (
                          <Etiqueta variante="aviso">Ativa</Etiqueta>
                        ) : (
                          reserva.dataDevolucao
                        )}
                      </td>
                      <td>
                        <div className="tabela__acoes">
                          {/* Botão de devolver só aparece em reservas
                              ativas - uma já devolvida não tem mais
                              essa ação disponível. */}
                          {ativa && (
                            <BotaoIcone
                              icone="check"
                              titulo="Marcar como devolvido"
                              onClick={() => devolverReserva(reserva)}
                              disabled={processando}
                            />
                          )}
                          <BotaoIcone
                            icone="lixeira"
                            titulo="Excluir reserva"
                            variante="perigo"
                            onClick={() => setReservaParaExcluir(reserva)}
                            disabled={processando}
                          />
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Cartao>

      <DialogoConfirmacao
        aberto={Boolean(reservaParaExcluir)}
        titulo="Excluir reserva"
        // Mesmo aviso de DetalheReserva.jsx: excluir uma reserva
        // ainda ativa devolve o livro para "disponível", então o
        // usuário precisa saber disso antes de confirmar.
        mensagem={
          reservaParaExcluir && !reservaParaExcluir.dataDevolucao
            ? "Esta reserva ainda está ativa: ao excluí-la, o livro voltará a ficar disponível. Continuar?"
            : "Tem certeza que deseja excluir esta reserva?"
        }
        textoConfirmar="Excluir"
        perigo
        carregando={processando}
        aoConfirmar={confirmarExclusao}
        aoCancelar={() => setReservaParaExcluir(null)}
      />
    </div>
  );
}
