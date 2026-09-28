// FormularioUsuario.jsx
//
// Assim como FormularioLivro.jsx, esta tela serve tanto para criar
// (/usuarios/novo) quanto para editar (/usuarios/:id/editar) um
// usuário - o modo é decidido pela presença do ":id" na URL.

import { useState, useEffect } from "react";
import { useNavigate, useParams, Link } from "react-router";
import usuariosApi from "../../api/usuarios";
import { mensagemDeErro } from "../../api/http";

import Cartao from "../../components/ui/Cartao";
import Campo from "../../components/ui/Campo";
import Botao from "../../components/ui/Botao";
import Alerta from "../../components/ui/Alerta";
import Carregando from "../../components/ui/Carregando";
import Icone from "../../components/ui/Icone";

const VALORES_INICIAIS = { nome: "", email: "" };

export default function FormularioUsuario() {
  const { id } = useParams();
  const modoEdicao = Boolean(id);
  const navegar = useNavigate();

  const [valores, setValores] = useState(VALORES_INICIAIS);
  // Assim como em FormularioLivro.jsx, só começa "carregando" quando
  // estamos editando um usuário existente - no modo criação o
  // formulário (vazio) já pode ser mostrado de cara.
  const [carregandoUsuario, setCarregandoUsuario] = useState(modoEdicao);
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState(null);

  useEffect(() => {
    if (!modoEdicao) return;

    usuariosApi
      .buscarPorId(id)
      .then((usuario) => setValores({ nome: usuario.nome, email: usuario.email }))
      .catch((erroCapturado) => setErro(mensagemDeErro(erroCapturado)))
      .finally(() => setCarregandoUsuario(false));
  }, [id, modoEdicao]);

  function atualizarCampo(campo, valor) {
    setValores((atual) => ({ ...atual, [campo]: valor }));
  }

  async function aoSubmeter(evento) {
    evento.preventDefault();
    setErro(null);
    setEnviando(true);

    // Diferente de FormularioLivro.jsx, aqui não há conversão de
    // tipo (não há campo numérico) - só o trim() para remover
    // espaços acidentais nas pontas do nome e do e-mail.
    const dados = { nome: valores.nome.trim(), email: valores.email.trim() };

    try {
      if (modoEdicao) {
        await usuariosApi.atualizar(id, dados);
        navegar(`/usuarios/${id}`);
      } else {
        const novo = await usuariosApi.criar(dados);
        navegar(`/usuarios/${novo.id}`);
      }
    } catch (erroCapturado) {
      // Ex: "Email já cadastrado" - regra de negócio do backend: o
      // e-mail precisa ser único entre todos os usuários (é o
      // backend quem garante isso, não o frontend).
      setErro(mensagemDeErro(erroCapturado));
      setEnviando(false);
    }
  }

  const voltarPara = modoEdicao ? `/usuarios/${id}` : "/usuarios";

  return (
    <div className="pilha">
      <Link to={voltarPara} className="link-voltar">
        <Icone nome="seta_esquerda" tamanho={16} />
        Voltar
      </Link>

      <div className="cabecalho-pagina">
        <div className="cabecalho-pagina__texto">
          <h1>{modoEdicao ? "Editar usuário" : "Novo usuário"}</h1>
          <p>O e-mail precisa ser único entre todos os usuários.</p>
        </div>
      </div>

      <Cartao>
        {carregandoUsuario ? (
          <Carregando texto="Carregando usuário..." />
        ) : (
          <form onSubmit={aoSubmeter} className="pilha">
            <Alerta variante="erro">{erro}</Alerta>

            <Campo
              id="nome"
              rotulo="Nome"
              obrigatorio
              value={valores.nome}
              onChange={(evento) => atualizarCampo("nome", evento.target.value)}
              placeholder="Ex: Maria Silva"
              required
            />

            <Campo
              id="email"
              rotulo="E-mail"
              obrigatorio
              type="email"
              value={valores.email}
              onChange={(evento) => atualizarCampo("email", evento.target.value)}
              placeholder="Ex: maria@email.com"
              required
            />

            <div className="cabecalho-pagina__acoes">
              <Botao type="submit" carregando={enviando}>
                {modoEdicao ? "Salvar alterações" : "Cadastrar usuário"}
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
