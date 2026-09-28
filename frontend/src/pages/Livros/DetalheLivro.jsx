// DetalheLivro.jsx
//
// Tela de detalhe de um livro: dados cadastrais, disponibilidade e o
// histórico de reservas desse exemplar (GET /reservas/livro/:id).
//
// A rota de reservas devolve só o "id" do usuário em cada reserva
// (idUsuario), não o nome - por isso esta página busca também a
// lista completa de usuários e faz a "tradução" id → nome no
// próprio navegador (veja a função nomeDoUsuario abaixo).

import { useState } from "react";
import { useParams, useNavigate, Link } from "react-router";
import livrosApi from "../../api/livros";
import usuariosApi from "../../api/usuarios";
import reservasApi from "../../api/reservas";
import useRequisicao from "../../hooks/useRequisicao";
import { mensagemDeErro } from "../../api/http";

import Cartao from "../../components/ui/Cartao";
import Carregando from "../../components/ui/Carregando";
import Alerta from "../../components/ui/Alerta";
import Etiqueta from "../../components/ui/Etiqueta";
import Botao from "../../components/ui/Botao";
import EstadoVazio from "../../components/ui/EstadoVazio";
import Icone from "../../components/ui/Icone";
import DialogoConfirmacao from "../../components/ui/DialogoConfirmacao";
import "../../components/ui/Tabela.css";

// As três buscas não dependem uma da outra, então saem em paralelo
// com Promise.all em vez de esperar uma terminar para começar a
// próxima. useRequisicao chama esta função de novo sempre que "id"
// muda (veja o array de dependências passado a useRequisicao lá
// embaixo).
async function buscarDetalhe(id) {
  const [livro, reservas, usuarios] = await Promise.all([
    livrosApi.buscarPorId(id),
    reservasApi.listarPorLivro(id),
    usuariosApi.listar(),
  ]);
  return { livro, reservas, usuarios };
}

export default function DetalheLivro() {
  const { id } = useParams();
  const navegar = useNavigate();

  const { dados, carregando, erro } = useRequisicao(() => buscarDetalhe(id), [id]);

  // Três estados separados para a exclusão em vez de um só objeto:
  // "confirmandoExclusao" controla se o diálogo está aberto,
  // "excluindo" desabilita o botão de confirmar enquanto a
  // requisição está em voo, e "erroExclusao" guarda a mensagem se o
  // backend recusar (por exemplo, livro com reservas cadastradas).
  // Cada um muda em momentos diferentes, então fica mais simples de
  // ler do que juntar tudo em um único objeto de estado.
  const [confirmandoExclusao, setConfirmandoExclusao] = useState(false);
  const [excluindo, setExcluindo] = useState(false);
  const [erroExclusao, setErroExclusao] = useState(null);

  async function confirmarExclusao() {
    setExcluindo(true);
    setErroExclusao(null);
    try {
      await livrosApi.deletar(id);
      // Livro excluído: não faz sentido continuar nesta tela, então
      // navega direto para a lista em vez de fechar o diálogo aqui.
      navegar("/livros");
    } catch (erroCapturado) {
      // Se o backend recusar (ex: "não é possível excluir livro com
      // reservas"), guardamos a mensagem em erroExclusao. O JSX do
      // DialogoConfirmacao, lá embaixo, troca o texto e o
      // comportamento do botão de confirmar quando isso acontece -
      // vira um aviso em vez de continuar tentando excluir.
      setErroExclusao(mensagemDeErro(erroCapturado));
    } finally {
      setExcluindo(false);
    }
  }

  // Guarda de carregamento/erro antes de desestruturar "dados": a
  // partir daqui no código, já temos certeza de que dados existe e
  // está completo, então não precisamos ficar checando "dados?" o
  // tempo todo como fazemos em Home.jsx (lá os dados são só números
  // resumidos; aqui são objetos que a página inteira depende).
  if (carregando) return <Carregando texto="Carregando livro..." />;
  if (erro) return <Alerta variante="erro">{erro}</Alerta>;

  const { livro, reservas, usuarios } = dados;

  // A API de reservas devolve reserva.idUsuario (só o id). Como
  // também temos a lista completa de usuários, cruzamos os dois no
  // navegador em vez de pedir ao backend para já vir com o nome
  // embutido - mais simples que criar um endpoint novo só para isso.
  function nomeDoUsuario(idUsuario) {
    return usuarios.find((usuario) => usuario.id === idUsuario)?.nome ?? "—";
  }

  return (
    <div className="pilha">
      <Link to="/livros" className="link-voltar">
        <Icone nome="seta_esquerda" tamanho={16} />
        Voltar para livros
      </Link>

      <div className="cabecalho-pagina">
        <div className="cabecalho-pagina__texto">
          <h1>{livro.titulo}</h1>
          <p>
            {livro.autor} · {livro.ano}
          </p>
        </div>
        <div className="cabecalho-pagina__acoes">
          {/* O botão "Reservar" só aparece se o livro estiver
              disponível - o backend também recusaria a reserva de um
              livro indisponível, mas evitar mostrar a ação já impede
              o usuário de tentar algo que vai falhar. */}
          {livro.disponivel && (
            <Link to={`/reservas/nova?livro=${livro.id}`} className="botao botao--primaria">
              <Icone nome="reserva" tamanho={16} />
              Reservar
            </Link>
          )}
          <Botao variante="secundaria" onClick={() => navegar(`/livros/${id}/editar`)}>
            <Icone nome="lapis" tamanho={16} />
            Editar
          </Botao>
          <Botao
            variante="perigo"
            onClick={() => {
              // Limpa qualquer erro de uma tentativa anterior antes
              // de abrir o diálogo de novo, senão o usuário veria a
              // mensagem de erro velha por um instante.
              setErroExclusao(null);
              setConfirmandoExclusao(true);
            }}
          >
            <Icone nome="lixeira" tamanho={16} />
            Excluir
          </Botao>
        </div>
      </div>

      <Cartao>
        <div className="detalhe-grade">
          <div>
            <span className="detalhe-grade__rotulo">Status</span>
            <Etiqueta variante={livro.disponivel ? "sucesso" : "neutro"}>
              {livro.disponivel ? "Disponível" : "Indisponível"}
            </Etiqueta>
          </div>
          <div>
            <span className="detalhe-grade__rotulo">Autor</span>
            <span>{livro.autor}</span>
          </div>
          <div>
            <span className="detalhe-grade__rotulo">Ano</span>
            <span>{livro.ano}</span>
          </div>
        </div>
      </Cartao>

      <Cartao>
        <h2>Histórico de reservas</h2>
        {reservas.length === 0 ? (
          <EstadoVazio
            icone="reserva"
            titulo="Nenhuma reserva ainda"
            descricao="Este livro ainda não foi reservado por ninguém."
          />
        ) : (
          <div className="tabela-wrapper">
            <table className="tabela">
              <thead>
                <tr>
                  <th>Usuário</th>
                  <th>Reservado em</th>
                  <th>Devolução</th>
                </tr>
              </thead>
              <tbody>
                {reservas.map((reserva) => (
                  <tr key={reserva.id}>
                    <td>
                      <Link to={`/reservas/${reserva.id}`} className="tabela__linha-link">
                        {nomeDoUsuario(reserva.idUsuario)}
                      </Link>
                    </td>
                    <td>{reserva.dataReserva}</td>
                    <td>
                      {/* Sem dataDevolucao = reserva ainda ativa;
                          mostramos uma etiqueta em vez de deixar a
                          célula vazia, para não parecer que falta um
                          dado. */}
                      {reserva.dataDevolucao ?? (
                        <Etiqueta variante="aviso">Ativa</Etiqueta>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Cartao>

      <DialogoConfirmacao
        aberto={confirmandoExclusao}
        titulo="Excluir livro"
        // Reaproveita o mesmo diálogo tanto para "tem certeza?"
        // quanto para mostrar o erro de exclusão recusada: quando
        // erroExclusao existe, a mensagem, o texto do botão e a ação
        // de confirmar mudam de "excluir de fato" para "só fechar o
        // aviso" (veja aoConfirmar abaixo). Evita criar um segundo
        // componente de diálogo só para mostrar erro.
        mensagem={
          erroExclusao || `Tem certeza que deseja excluir "${livro.titulo}"?`
        }
        textoConfirmar={erroExclusao ? "Entendi" : "Excluir"}
        perigo={!erroExclusao}
        carregando={excluindo}
        aoConfirmar={
          erroExclusao ? () => setConfirmandoExclusao(false) : confirmarExclusao
        }
        aoCancelar={() => setConfirmandoExclusao(false)}
      />
    </div>
  );
}
