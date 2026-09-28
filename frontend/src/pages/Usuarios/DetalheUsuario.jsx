// DetalheUsuario.jsx
//
// Tela de detalhe de um usuário: dados cadastrais e o histórico de
// reservas feitas por ele (GET /reservas/usuario/:id). Assim como em
// DetalheLivro.jsx, a lista de reservas só traz o "idLivro" - por
// isso também buscamos a lista de livros para mostrar o título.

import { useState } from "react";
import { useParams, useNavigate, Link } from "react-router";
import usuariosApi from "../../api/usuarios";
import livrosApi from "../../api/livros";
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

// Espelha buscarDetalhe de DetalheLivro.jsx, só que "invertido": lá
// buscamos as reservas de um livro + a lista de usuários; aqui
// buscamos as reservas de um usuário + a lista de livros. Mesma
// ideia, mesmo motivo (a API de reservas não devolve o objeto
// completo, só o id).
async function buscarDetalhe(id) {
  const [usuario, reservas, livros] = await Promise.all([
    usuariosApi.buscarPorId(id),
    reservasApi.listarPorUsuario(id),
    livrosApi.listar(),
  ]);
  return { usuario, reservas, livros };
}

export default function DetalheUsuario() {
  const { id } = useParams();
  const navegar = useNavigate();

  const { dados, carregando, erro } = useRequisicao(() => buscarDetalhe(id), [id]);

  // Mesmo trio de estados de DetalheLivro.jsx: "confirmandoExclusao"
  // controla o diálogo, "excluindo" desabilita o botão durante a
  // requisição, e "erroExclusao" guarda a mensagem de recusa do
  // backend (usuário com reservas cadastradas não pode ser excluído).
  const [confirmandoExclusao, setConfirmandoExclusao] = useState(false);
  const [excluindo, setExcluindo] = useState(false);
  const [erroExclusao, setErroExclusao] = useState(null);

  async function confirmarExclusao() {
    setExcluindo(true);
    setErroExclusao(null);
    try {
      await usuariosApi.deletar(id);
      navegar("/usuarios");
    } catch (erroCapturado) {
      setErroExclusao(mensagemDeErro(erroCapturado));
    } finally {
      setExcluindo(false);
    }
  }

  if (carregando) return <Carregando texto="Carregando usuário..." />;
  if (erro) return <Alerta variante="erro">{erro}</Alerta>;

  const { usuario, reservas, livros } = dados;

  function tituloDoLivro(idLivro) {
    return livros.find((livro) => livro.id === idLivro)?.titulo ?? "—";
  }

  return (
    <div className="pilha">
      <Link to="/usuarios" className="link-voltar">
        <Icone nome="seta_esquerda" tamanho={16} />
        Voltar para usuários
      </Link>

      <div className="cabecalho-pagina">
        <div className="cabecalho-pagina__texto">
          <h1>{usuario.nome}</h1>
          <p>{usuario.email}</p>
        </div>
        <div className="cabecalho-pagina__acoes">
          {/* Ao contrário de DetalheLivro.jsx, "Nova reserva" aqui
              sempre aparece: não há uma condição de "usuário
              disponível" - qualquer usuário cadastrado pode fazer
              quantas reservas quiser, desde que haja livro
              disponível (isso é checado na própria tela de criação). */}
          <Link to={`/reservas/nova?usuario=${usuario.id}`} className="botao botao--primaria">
            <Icone nome="reserva" tamanho={16} />
            Nova reserva
          </Link>
          <Botao variante="secundaria" onClick={() => navegar(`/usuarios/${id}/editar`)}>
            <Icone nome="lapis" tamanho={16} />
            Editar
          </Botao>
          <Botao
            variante="perigo"
            onClick={() => {
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
        <h2>Reservas</h2>
        {reservas.length === 0 ? (
          <EstadoVazio
            icone="reserva"
            titulo="Nenhuma reserva ainda"
            descricao="Este usuário ainda não reservou nenhum livro."
          />
        ) : (
          <div className="tabela-wrapper">
            <table className="tabela">
              <thead>
                <tr>
                  <th>Livro</th>
                  <th>Reservado em</th>
                  <th>Devolução</th>
                </tr>
              </thead>
              <tbody>
                {reservas.map((reserva) => (
                  <tr key={reserva.id}>
                    <td>
                      <Link to={`/reservas/${reserva.id}`} className="tabela__linha-link">
                        {tituloDoLivro(reserva.idLivro)}
                      </Link>
                    </td>
                    <td>{reserva.dataReserva}</td>
                    <td>
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
        titulo="Excluir usuário"
        // Mesmo truque de DetalheLivro.jsx: reaproveita o diálogo de
        // confirmação para também mostrar o erro de exclusão
        // recusada, trocando mensagem/botão/ação quando erroExclusao
        // existe.
        mensagem={
          erroExclusao || `Tem certeza que deseja excluir "${usuario.nome}"?`
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
