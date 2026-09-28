// CriarReserva.jsx
//
// Tela POST /reservas: escolher um livro (só aparecem os
// disponíveis - é o próprio backend quem recusaria um livro
// indisponível, mas já filtramos aqui para uma experiência melhor)
// e um usuário, então criar a reserva.
//
// Esta tela pode ser aberta já com um livro ou usuário pré-
// selecionado, através da query string: /reservas/nova?livro=3 ou
// /reservas/nova?usuario=5 (veja os botões "Reservar" em
// DetalheLivro.jsx e "Nova reserva" em DetalheUsuario.jsx).

import { useState } from "react";
import { useNavigate, useSearchParams, Link } from "react-router";
import livrosApi from "../../api/livros";
import usuariosApi from "../../api/usuarios";
import reservasApi from "../../api/reservas";
import useRequisicao from "../../hooks/useRequisicao";
import { mensagemDeErro } from "../../api/http";

import Cartao from "../../components/ui/Cartao";
import Selecao from "../../components/ui/Selecao";
import Botao from "../../components/ui/Botao";
import Alerta from "../../components/ui/Alerta";
import Carregando from "../../components/ui/Carregando";
import Icone from "../../components/ui/Icone";

async function buscarOpcoes() {
  const [livros, usuarios] = await Promise.all([
    livrosApi.listar(),
    usuariosApi.listar(),
  ]);
  return { livros, usuarios };
}

export default function CriarReserva() {
  const navegar = useNavigate();
  // useSearchParams lê a query string da URL (?livro=3&usuario=5).
  // Usamos isso para pré-selecionar o livro/usuário quando a tela é
  // aberta a partir de um botão "Reservar" em outra página, em vez
  // de forçar o usuário a escolher de novo algo que ele já indicou.
  const [parametros] = useSearchParams();

  const { dados, carregando, erro } = useRequisicao(buscarOpcoes, []);

  // O valor inicial do <select> já vem da query string, se houver.
  // Se não houver parâmetro, ?? "" garante uma string vazia (opção
  // "selecione..." em branco) em vez de "null" ou "undefined".
  const [idLivro, setIdLivro] = useState(parametros.get("livro") ?? "");
  const [idUsuario, setIdUsuario] = useState(parametros.get("usuario") ?? "");
  const [enviando, setEnviando] = useState(false);
  const [erroEnvio, setErroEnvio] = useState(null);

  // Filtra os livros disponíveis no navegador (não pedimos ao
  // backend uma rota "só disponíveis" à parte) - é a mesma lista de
  // /livros, só que restrita aos que podem ser reservados agora.
  const livrosDisponiveis = (dados?.livros ?? []).filter((livro) => livro.disponivel);
  const usuarios = dados?.usuarios ?? [];

  async function aoSubmeter(evento) {
    evento.preventDefault();
    setErroEnvio(null);
    setEnviando(true);

    try {
      const reserva = await reservasApi.criar({ idLivro, idUsuario });
      navegar(`/reservas/${reserva.id}`);
    } catch (erroCapturado) {
      // Ex: "Livro não está disponível" - pode acontecer se alguém
      // reservou o mesmo livro entre o carregamento da tela e o
      // envio do formulário.
      setErroEnvio(mensagemDeErro(erroCapturado));
      setEnviando(false);
    }
  }

  return (
    <div className="pilha">
      <Link to="/reservas" className="link-voltar">
        <Icone nome="seta_esquerda" tamanho={16} />
        Voltar para reservas
      </Link>

      <div className="cabecalho-pagina">
        <div className="cabecalho-pagina__texto">
          <h1>Nova reserva</h1>
          <p>Só livros disponíveis aparecem na lista abaixo.</p>
        </div>
      </div>

      <Cartao>
        {carregando ? (
          <Carregando texto="Carregando livros e usuários..." />
        ) : (
          <form onSubmit={aoSubmeter} className="pilha">
            {/* Um único Alerta mostra tanto o erro de carregamento
                (erro) quanto o erro de envio (erroEnvio) - eles nunca
                acontecem ao mesmo tempo (o formulário só aparece
                depois que o carregamento termina sem erro), então
                não há ambiguidade em juntar os dois na mesma linha. */}
            <Alerta variante="erro">{erro || erroEnvio}</Alerta>

            {livrosDisponiveis.length === 0 && (
              <Alerta variante="aviso">
                Nenhum livro disponível no momento. Cadastre um livro novo ou
                aguarde uma devolução.
              </Alerta>
            )}

            <Selecao
              id="livro"
              rotulo="Livro"
              obrigatorio
              value={idLivro}
              onChange={(evento) => setIdLivro(evento.target.value)}
              opcoes={livrosDisponiveis.map((livro) => ({
                valor: livro.id,
                rotulo: `${livro.titulo} — ${livro.autor}`,
              }))}
              required
            />

            <Selecao
              id="usuario"
              rotulo="Usuário"
              obrigatorio
              value={idUsuario}
              onChange={(evento) => setIdUsuario(evento.target.value)}
              opcoes={usuarios.map((usuario) => ({
                valor: usuario.id,
                rotulo: `${usuario.nome} (${usuario.email})`,
              }))}
              required
            />

            <div className="cabecalho-pagina__acoes">
              {/* Desabilitado quando não há livro disponível: evita
                  que o usuário submeta um formulário que o backend
                  vai recusar de qualquer forma (não há opção de
                  livro válida para escolher). */}
              <Botao type="submit" carregando={enviando} disabled={livrosDisponiveis.length === 0}>
                Confirmar reserva
              </Botao>
              <Link to="/reservas" className="botao botao--secundaria">
                Cancelar
              </Link>
            </div>
          </form>
        )}
      </Cartao>
    </div>
  );
}
