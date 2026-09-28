// ListaLivros.jsx
//
// Tela GET /livros: lista todos os livros cadastrados, com um campo
// de busca (filtragem feita no próprio navegador, sem chamar a API
// de novo) e as ações de ver, editar e excluir cada um.

import { useState } from "react";
import { Link, useNavigate } from "react-router";
import livrosApi from "../../api/livros";
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

export default function ListaLivros() {
  const navegar = useNavigate();
  // "recarregar" é usado depois de excluir um livro: em vez de
  // remover o item da lista manualmente no estado local, simplesmente
  // pedimos ao hook para buscar a lista de novo na API. É menos
  // código e garante que a lista mostrada bate exatamente com o que
  // o backend tem, mesmo que outra pessoa tenha mudado algo nesse
  // meio-tempo.
  const { dados: livros, carregando, erro, recarregar } = useRequisicao(
    () => livrosApi.listar(),
    [],
  );

  const [busca, setBusca] = useState("");
  // Guarda o livro inteiro (não só o id) para poder mostrar o título
  // dele na mensagem de confirmação do diálogo, sem precisar
  // procurá-lo de novo na lista.
  const [livroParaExcluir, setLivroParaExcluir] = useState(null);
  const [excluindo, setExcluindo] = useState(false);
  const [erroExclusao, setErroExclusao] = useState(null);

  // A busca não chama a API de novo a cada tecla digitada - filtra a
  // lista que já está em memória. Para uma lista deste tamanho
  // (didático, poucos registros) isso é bem mais rápido e simples do
  // que implementar busca no servidor.
  const termo = busca.trim().toLowerCase();
  const livrosFiltrados = (livros ?? []).filter(
    (livro) =>
      livro.titulo.toLowerCase().includes(termo) ||
      livro.autor.toLowerCase().includes(termo),
  );

  async function confirmarExclusao() {
    setExcluindo(true);
    setErroExclusao(null);
    try {
      await livrosApi.deletar(livroParaExcluir.id);
      setLivroParaExcluir(null);
      recarregar();
    } catch (erroCapturado) {
      // Regra de negócio do backend: não é possível excluir um livro
      // que tem reservas cadastradas (erro 400). Mostramos a
      // mensagem que o próprio backend devolveu.
      setErroExclusao(mensagemDeErro(erroCapturado));
    } finally {
      setExcluindo(false);
    }
  }

  return (
    <div className="pilha">
      <div className="cabecalho-pagina">
        <div className="cabecalho-pagina__texto">
          <h1>Livros</h1>
          <p>Acervo cadastrado e disponibilidade para reserva.</p>
        </div>
        <div className="cabecalho-pagina__acoes">
          <Link to="/livros/novo" className="botao botao--primaria">
            <Icone nome="mais" tamanho={16} />
            Novo livro
          </Link>
        </div>
      </div>

      {erro && <Alerta variante="erro">{erro}</Alerta>}

      <Cartao>
        {/* A barra de busca só aparece quando já existe pelo menos
            um livro carregado - não faz sentido oferecer "buscar"
            numa lista vazia ou que ainda está carregando. */}
        {!carregando && livros && livros.length > 0 && (
          <div className="barra-filtro">
            <Icone nome="busca" tamanho={16} />
            <input
              type="text"
              placeholder="Buscar por título ou autor..."
              value={busca}
              onChange={(evento) => setBusca(evento.target.value)}
              className="barra-filtro__input"
            />
          </div>
        )}

        {/* A ordem destes quatro estados importa: primeiro checamos
            se ainda está carregando, depois se não há NENHUM livro
            cadastrado (acervo vazio), depois se a busca não encontrou
            nada (acervo tem livros, mas o filtro zerou o resultado) -
            e só então mostramos a tabela. Cada caso tem uma mensagem
            diferente porque o motivo de não haver linhas é diferente. */}
        {carregando ? (
          <Carregando texto="Carregando livros..." />
        ) : !livros || livros.length === 0 ? (
          <EstadoVazio
            icone="livro"
            titulo="Nenhum livro cadastrado"
            descricao="Cadastre o primeiro livro do acervo para começar a fazer reservas."
            acao={
              <Link to="/livros/novo" className="botao botao--primaria">
                Cadastrar livro
              </Link>
            }
          />
        ) : livrosFiltrados.length === 0 ? (
          <EstadoVazio
            icone="busca"
            titulo="Nenhum resultado"
            descricao={`Nenhum livro encontrado para "${busca}".`}
          />
        ) : (
          <div className="tabela-wrapper">
            <table className="tabela">
              <thead>
                <tr>
                  <th>Título</th>
                  <th>Autor</th>
                  <th>Ano</th>
                  <th>Status</th>
                  <th className="tabela__coluna-acoes">Ações</th>
                </tr>
              </thead>
              <tbody>
                {livrosFiltrados.map((livro) => (
                  <tr key={livro.id}>
                    <td>
                      <Link to={`/livros/${livro.id}`} className="tabela__linha-link">
                        {livro.titulo}
                      </Link>
                    </td>
                    <td>{livro.autor}</td>
                    <td>{livro.ano}</td>
                    <td>
                      <Etiqueta variante={livro.disponivel ? "sucesso" : "neutro"}>
                        {livro.disponivel ? "Disponível" : "Indisponível"}
                      </Etiqueta>
                    </td>
                    <td>
                      <div className="tabela__acoes">
                        <BotaoIcone
                          icone="lapis"
                          titulo="Editar livro"
                          onClick={() => navegar(`/livros/${livro.id}/editar`)}
                        />
                        <BotaoIcone
                          icone="lixeira"
                          titulo="Excluir livro"
                          variante="perigo"
                          onClick={() => {
                            setErroExclusao(null);
                            setLivroParaExcluir(livro);
                          }}
                        />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Cartao>

      <DialogoConfirmacao
        // "aberto" vira true assim que livroParaExcluir deixa de ser
        // null (Boolean(objeto) é sempre true) - guardar o livro
        // inteiro serve tanto para controlar a abertura do diálogo
        // quanto para exibir o título dele na mensagem.
        aberto={Boolean(livroParaExcluir)}
        titulo="Excluir livro"
        mensagem={
          erroExclusao ||
          `Tem certeza que deseja excluir "${livroParaExcluir?.titulo}"? Essa ação não pode ser desfeita.`
        }
        textoConfirmar={erroExclusao ? "Entendi" : "Excluir"}
        perigo={!erroExclusao}
        carregando={excluindo}
        aoConfirmar={erroExclusao ? () => setLivroParaExcluir(null) : confirmarExclusao}
        aoCancelar={() => setLivroParaExcluir(null)}
      />
    </div>
  );
}
