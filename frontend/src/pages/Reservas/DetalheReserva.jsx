// DetalheReserva.jsx
//
// Tela de detalhe de uma única reserva: qual livro, qual usuário,
// quando foi reservada e (se já aconteceu) quando foi devolvida.
// A partir daqui dá para devolver o livro ou excluir a reserva.

import { useState } from "react";
import { useParams, useNavigate, Link } from "react-router";
import reservasApi from "../../api/reservas";
import livrosApi from "../../api/livros";
import usuariosApi from "../../api/usuarios";
import useRequisicao from "../../hooks/useRequisicao";
import { mensagemDeErro } from "../../api/http";

import Cartao from "../../components/ui/Cartao";
import Carregando from "../../components/ui/Carregando";
import Alerta from "../../components/ui/Alerta";
import Etiqueta from "../../components/ui/Etiqueta";
import Botao from "../../components/ui/Botao";
import Icone from "../../components/ui/Icone";
import DialogoConfirmacao from "../../components/ui/DialogoConfirmacao";

// Aqui a busca é em duas etapas, não em paralelo: só sabemos o
// idLivro e o idUsuario depois de ter a reserva em mãos, então
// primeiro buscamos a reserva e só então (com os ids já disponíveis)
// buscamos livro e usuário juntos com Promise.all.
async function buscarDetalhe(id) {
  const reserva = await reservasApi.buscarPorId(id);
  const [livro, usuario] = await Promise.all([
    livrosApi.buscarPorId(reserva.idLivro),
    usuariosApi.buscarPorId(reserva.idUsuario),
  ]);
  return { reserva, livro, usuario };
}

export default function DetalheReserva() {
  const { id } = useParams();
  const navegar = useNavigate();

  const { dados, carregando, erro, recarregar } = useRequisicao(
    () => buscarDetalhe(id),
    [id],
  );

  const [devolvendo, setDevolvendo] = useState(false);
  const [confirmandoExclusao, setConfirmandoExclusao] = useState(false);
  const [excluindo, setExcluindo] = useState(false);
  // Diferente de DetalheLivro.jsx (onde o erro de exclusão aparece
  // dentro do próprio diálogo de confirmação), aqui o erro de
  // qualquer ação - devolver OU excluir - aparece num Alerta comum
  // na página. Faz sentido porque "devolver" nem passa por um
  // diálogo de confirmação; um único estado de erro cobre as duas
  // ações sem duplicar lógica.
  const [erroAcao, setErroAcao] = useState(null);

  async function devolver() {
    setDevolvendo(true);
    setErroAcao(null);
    try {
      await reservasApi.devolver(id);
      // Ao contrário da exclusão, aqui continuamos na mesma tela -
      // só recarregamos os dados para refletir a nova dataDevolucao
      // e o novo status "Devolvida".
      recarregar();
    } catch (erroCapturado) {
      setErroAcao(mensagemDeErro(erroCapturado));
    } finally {
      setDevolvendo(false);
    }
  }

  async function confirmarExclusao() {
    setExcluindo(true);
    try {
      await reservasApi.deletar(id);
      navegar("/reservas");
    } catch (erroCapturado) {
      setErroAcao(mensagemDeErro(erroCapturado));
      // Fecha o diálogo mesmo em caso de erro (diferente do padrão
      // usado em DetalheLivro.jsx/ListaLivros.jsx, que mantém o
      // diálogo aberto trocando sua mensagem pelo erro). Aqui o erro
      // some no Alerta da própria página, então não há necessidade
      // de manter o diálogo em cena.
      setConfirmandoExclusao(false);
    } finally {
      setExcluindo(false);
    }
  }

  if (carregando) return <Carregando texto="Carregando reserva..." />;
  if (erro) return <Alerta variante="erro">{erro}</Alerta>;

  const { reserva, livro, usuario } = dados;
  // "ativa" é o mesmo critério de negócio usado em Home.jsx e
  // ListaReservas.jsx: uma reserva sem dataDevolucao ainda está em
  // andamento. Guardamos numa variável aqui porque é consultada
  // várias vezes neste componente (no botão de devolver, no status,
  // na mensagem do diálogo de exclusão).
  const ativa = !reserva.dataDevolucao;

  return (
    <div className="pilha">
      <Link to="/reservas" className="link-voltar">
        <Icone nome="seta_esquerda" tamanho={16} />
        Voltar para reservas
      </Link>

      <div className="cabecalho-pagina">
        <div className="cabecalho-pagina__texto">
          <h1>Reserva #{reserva.id}</h1>
          <p>
            {livro.titulo} · {usuario.nome}
          </p>
        </div>
        <div className="cabecalho-pagina__acoes">
          {/* Só faz sentido "devolver" uma reserva que ainda está
              ativa - uma já devolvida não tem mais essa ação. */}
          {ativa && (
            <Botao onClick={devolver} carregando={devolvendo}>
              <Icone nome="check" tamanho={16} />
              Marcar como devolvido
            </Botao>
          )}
          <Botao variante="perigo" onClick={() => setConfirmandoExclusao(true)}>
            <Icone nome="lixeira" tamanho={16} />
            Excluir
          </Botao>
        </div>
      </div>

      {erroAcao && <Alerta variante="erro">{erroAcao}</Alerta>}

      <Cartao>
        <div className="detalhe-grade">
          <div>
            <span className="detalhe-grade__rotulo">Status</span>
            <Etiqueta variante={ativa ? "aviso" : "sucesso"}>
              {ativa ? "Ativa" : "Devolvida"}
            </Etiqueta>
          </div>
          <div>
            <span className="detalhe-grade__rotulo">Livro</span>
            <Link to={`/livros/${livro.id}`}>{livro.titulo}</Link>
          </div>
          <div>
            <span className="detalhe-grade__rotulo">Usuário</span>
            <Link to={`/usuarios/${usuario.id}`}>{usuario.nome}</Link>
          </div>
          <div>
            <span className="detalhe-grade__rotulo">Reservado em</span>
            <span>{reserva.dataReserva}</span>
          </div>
          <div>
            <span className="detalhe-grade__rotulo">Devolvido em</span>
            <span>{reserva.dataDevolucao ?? "Ainda não devolvido"}</span>
          </div>
        </div>
      </Cartao>

      <DialogoConfirmacao
        aberto={confirmandoExclusao}
        titulo="Excluir reserva"
        // Avisa explicitamente quando a reserva ainda está ativa,
        // porque excluir uma reserva ativa tem um efeito colateral
        // importante: o livro volta a ficar disponível (é o backend
        // quem faz isso, mas o usuário precisa saber antes de
        // confirmar).
        mensagem={
          ativa
            ? "Esta reserva ainda está ativa: ao excluí-la, o livro voltará a ficar disponível. Continuar?"
            : "Tem certeza que deseja excluir esta reserva?"
        }
        textoConfirmar="Excluir"
        perigo
        carregando={excluindo}
        aoConfirmar={confirmarExclusao}
        aoCancelar={() => setConfirmandoExclusao(false)}
      />
    </div>
  );
}
