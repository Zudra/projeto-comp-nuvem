// FormularioLivro.jsx
//
// Uma única tela cuida tanto de "criar livro" (rota /livros/novo)
// quanto de "editar livro" (rota /livros/:id/editar) - a diferença
// entre os dois modos é só se existe ou não um ":id" na URL. Isso
// evita duplicar o formulário em dois arquivos quase idênticos.

import { useState, useEffect } from "react";
import { useNavigate, useParams, Link } from "react-router";
import livrosApi from "../../api/livros";
import { mensagemDeErro } from "../../api/http";

import Cartao from "../../components/ui/Cartao";
import Campo from "../../components/ui/Campo";
import Botao from "../../components/ui/Botao";
import Alerta from "../../components/ui/Alerta";
import Etiqueta from "../../components/ui/Etiqueta";
import Carregando from "../../components/ui/Carregando";
import Icone from "../../components/ui/Icone";

// Fica fora do componente porque é um valor fixo, criado uma única
// vez - se estivesse dentro do componente, um objeto novo seria
// criado a cada renderização (não causaria bug aqui, mas é um hábito
// que evita recriações desnecessárias).
const VALORES_INICIAIS = { titulo: "", autor: "", ano: "" };

export default function FormularioLivro() {
  const { id } = useParams();
  // "id" só existe na URL de edição (/livros/:id/editar); na URL de
  // criação (/livros/novo) useParams() não devolve id nenhum. Esse
  // booleano é a única bifurcação que o resto do componente precisa
  // consultar para saber em que modo está.
  const modoEdicao = Boolean(id);
  const navegar = useNavigate();

  const [valores, setValores] = useState(VALORES_INICIAIS);
  const [disponivel, setDisponivel] = useState(true);
  // Começa como "true" só quando é edição: nesse modo precisamos
  // buscar o livro antes de mostrar o formulário preenchido. No modo
  // criação não há nada para buscar, então já começa "false" e o
  // formulário (vazio) aparece na primeira renderização.
  const [carregandoLivro, setCarregandoLivro] = useState(modoEdicao);
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState(null);

  // No modo edição, busca os dados atuais do livro para preencher o
  // formulário. No modo criação isso é pulado (não há nada para
  // buscar ainda) - o "return" antecipado impede a chamada à API.
  useEffect(() => {
    if (!modoEdicao) return;

    livrosApi
      .buscarPorId(id)
      .then((livro) => {
        setValores({ titulo: livro.titulo, autor: livro.autor, ano: livro.ano });
        setDisponivel(livro.disponivel);
      })
      .catch((erroCapturado) => setErro(mensagemDeErro(erroCapturado)))
      .finally(() => setCarregandoLivro(false));
    // "id" entra nas dependências para o caso (raro, mas possível)
    // de navegar de /livros/1/editar direto para /livros/2/editar
    // sem desmontar o componente - o efeito roda de novo e busca o
    // livro certo. "modoEdicao" entra porque também é usado dentro
    // do efeito.
  }, [id, modoEdicao]);

  // Helper genérico para atualizar um campo do objeto "valores" sem
  // perder os outros - evita escrever um setValores próprio para
  // título, autor e ano.
  function atualizarCampo(campo, valor) {
    setValores((atual) => ({ ...atual, [campo]: valor }));
  }

  async function aoSubmeter(evento) {
    // Formulário HTML por padrão recarrega a página ao enviar -
    // preventDefault() impede isso para controlarmos o envio via
    // JavaScript (fetch para a API) em vez de um refresh completo.
    evento.preventDefault();
    setErro(null);
    setEnviando(true);

    const dados = {
      // trim() remove espaços acidentais no início/fim (comum ao
      // copiar e colar texto). Number() converte o valor do campo
      // <input type="number">, que sempre chega como string, para
      // número de fato antes de mandar para a API.
      titulo: valores.titulo.trim(),
      autor: valores.autor.trim(),
      ano: Number(valores.ano),
    };

    try {
      if (modoEdicao) {
        await livrosApi.atualizar(id, dados);
        navegar(`/livros/${id}`);
      } else {
        const novo = await livrosApi.criar(dados);
        // O backend gera o id do livro novo; navegamos usando o id
        // que ele devolveu na resposta, não um id que inventaríamos
        // no frontend.
        navegar(`/livros/${novo.id}`);
      }
    } catch (erroCapturado) {
      setErro(mensagemDeErro(erroCapturado));
      // Só desliga "enviando" no erro: em caso de sucesso a página
      // já está navegando para outra rota, então não há necessidade
      // (nem tempo útil) de reabilitar o botão antes da troca de tela.
      setEnviando(false);
    }
  }

  const voltarPara = modoEdicao ? `/livros/${id}` : "/livros";

  return (
    <div className="pilha">
      <Link to={voltarPara} className="link-voltar">
        <Icone nome="seta_esquerda" tamanho={16} />
        Voltar
      </Link>

      <div className="cabecalho-pagina">
        <div className="cabecalho-pagina__texto">
          <h1>{modoEdicao ? "Editar livro" : "Novo livro"}</h1>
          <p>
            {modoEdicao
              ? "Atualize as informações do livro."
              : "Todo livro cadastrado começa disponível para reserva."}
          </p>
        </div>
      </div>

      <Cartao>
        {carregandoLivro ? (
          <Carregando texto="Carregando livro..." />
        ) : (
          <form onSubmit={aoSubmeter} className="pilha">
            <Alerta variante="erro">{erro}</Alerta>

            <Campo
              id="titulo"
              rotulo="Título"
              obrigatorio
              value={valores.titulo}
              onChange={(evento) => atualizarCampo("titulo", evento.target.value)}
              placeholder="Ex: Dom Casmurro"
              required
            />

            <Campo
              id="autor"
              rotulo="Autor"
              obrigatorio
              value={valores.autor}
              onChange={(evento) => atualizarCampo("autor", evento.target.value)}
              placeholder="Ex: Machado de Assis"
              required
            />

            <Campo
              id="ano"
              rotulo="Ano de publicação"
              obrigatorio
              type="number"
              value={valores.ano}
              onChange={(evento) => atualizarCampo("ano", evento.target.value)}
              placeholder="Ex: 1899"
              required
            />

            {/* O campo "disponível" só aparece ao editar (não faz
                sentido mostrá-lo ao criar - todo livro novo já nasce
                disponível). É somente leitura de propósito: essa
                regra pertence ao backend, que muda a disponibilidade
                sozinho quando uma reserva é criada ou devolvida
                (veja reservasApi.criar/devolver). Deixar o campo
                editável aqui permitiria o frontend contradizer o
                que o backend calcula. */}
            {modoEdicao && (
              <div className="campo">
                <span className="campo__rotulo">Disponibilidade</span>
                <div>
                  <Etiqueta variante={disponivel ? "sucesso" : "neutro"}>
                    {disponivel ? "Disponível" : "Indisponível"}
                  </Etiqueta>
                </div>
                <p className="campo__ajuda">
                  Não é possível alterar este campo diretamente: ele muda
                  automaticamente quando o livro é reservado ou devolvido.
                </p>
              </div>
            )}

            <div className="cabecalho-pagina__acoes">
              <Botao type="submit" carregando={enviando}>
                {modoEdicao ? "Salvar alterações" : "Cadastrar livro"}
              </Botao>
              <Link to={voltarPara} className="botao botao--secundaria">
                Cancelar
              </Link>
            </div>
          </form>
        )}
      </Cartao>
    </div>
  );
}
