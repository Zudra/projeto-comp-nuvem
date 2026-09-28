// ListaUsuarios.jsx
//
// Tela GET /usuarios: lista todos os usuários cadastrados, com busca
// por nome/e-mail e ações de ver, editar e excluir.

import { useState } from "react";
import { Link, useNavigate } from "react-router";
import usuariosApi from "../../api/usuarios";
import useRequisicao from "../../hooks/useRequisicao";
import { mensagemDeErro } from "../../api/http";

import Cartao from "../../components/ui/Cartao";
import Carregando from "../../components/ui/Carregando";
import Alerta from "../../components/ui/Alerta";
import EstadoVazio from "../../components/ui/EstadoVazio";
import Icone from "../../components/ui/Icone";
import BotaoIcone from "../../components/ui/BotaoIcone";
import DialogoConfirmacao from "../../components/ui/DialogoConfirmacao";
import "../../components/ui/Tabela.css";

export default function ListaUsuarios() {
  const navegar = useNavigate();
  // Igual a ListaLivros.jsx: depois de excluir, chamamos
  // "recarregar" em vez de remover o item manualmente do estado -
  // mantém a tela sempre fiel ao que o backend tem.
  const { dados: usuarios, carregando, erro, recarregar } = useRequisicao(
    () => usuariosApi.listar(),
    [],
  );

  const [busca, setBusca] = useState("");
  const [usuarioParaExcluir, setUsuarioParaExcluir] = useState(null);
  const [excluindo, setExcluindo] = useState(false);
  const [erroExclusao, setErroExclusao] = useState(null);

  // Mesmo padrão de filtro no navegador de ListaLivros.jsx - busca
  // por nome OU e-mail, sem chamar a API a cada tecla digitada.
  const termo = busca.trim().toLowerCase();
  const usuariosFiltrados = (usuarios ?? []).filter(
    (usuario) =>
      usuario.nome.toLowerCase().includes(termo) ||
      usuario.email.toLowerCase().includes(termo),
  );

  async function confirmarExclusao() {
    setExcluindo(true);
    setErroExclusao(null);
    try {
      await usuariosApi.deletar(usuarioParaExcluir.id);
      setUsuarioParaExcluir(null);
      recarregar();
    } catch (erroCapturado) {
      // Regra de negócio do backend: não é possível excluir um
      // usuário que tem reservas cadastradas (erro 400).
      setErroExclusao(mensagemDeErro(erroCapturado));
    } finally {
      setExcluindo(false);
    }
  }

  return (
    <div className="pilha">
      <div className="cabecalho-pagina">
        <div className="cabecalho-pagina__texto">
          <h1>Usuários</h1>
          <p>Pessoas cadastradas que podem reservar livros.</p>
        </div>
        <div className="cabecalho-pagina__acoes">
          <Link to="/usuarios/novo" className="botao botao--primaria">
            <Icone nome="mais" tamanho={16} />
            Novo usuário
          </Link>
        </div>
      </div>

      {erro && <Alerta variante="erro">{erro}</Alerta>}

      <Cartao>
        {!carregando && usuarios && usuarios.length > 0 && (
          <div className="barra-filtro">
            <Icone nome="busca" tamanho={16} />
            <input
              type="text"
              placeholder="Buscar por nome ou e-mail..."
              value={busca}
              onChange={(evento) => setBusca(evento.target.value)}
              className="barra-filtro__input"
            />
          </div>
        )}

        {/* Mesma ordem de prioridade de ListaLivros.jsx: carregando →
            nenhum usuário cadastrado → busca sem resultado → tabela. */}
        {carregando ? (
          <Carregando texto="Carregando usuários..." />
        ) : !usuarios || usuarios.length === 0 ? (
          <EstadoVazio
            icone="usuario"
            titulo="Nenhum usuário cadastrado"
            descricao="Cadastre o primeiro usuário para começar a fazer reservas."
            acao={
              <Link to="/usuarios/novo" className="botao botao--primaria">
                Cadastrar usuário
              </Link>
            }
          />
        ) : usuariosFiltrados.length === 0 ? (
          <EstadoVazio
            icone="busca"
            titulo="Nenhum resultado"
            descricao={`Nenhum usuário encontrado para "${busca}".`}
          />
        ) : (
          <div className="tabela-wrapper">
            <table className="tabela">
              <thead>
                <tr>
                  <th>Nome</th>
                  <th>E-mail</th>
                  <th className="tabela__coluna-acoes">Ações</th>
                </tr>
              </thead>
              <tbody>
                {usuariosFiltrados.map((usuario) => (
                  <tr key={usuario.id}>
                    <td>
                      <Link to={`/usuarios/${usuario.id}`} className="tabela__linha-link">
                        {usuario.nome}
                      </Link>
                    </td>
                    <td>{usuario.email}</td>
                    <td>
                      <div className="tabela__acoes">
                        <BotaoIcone
                          icone="lapis"
                          titulo="Editar usuário"
                          onClick={() => navegar(`/usuarios/${usuario.id}/editar`)}
                        />
                        <BotaoIcone
                          icone="lixeira"
                          titulo="Excluir usuário"
                          variante="perigo"
                          onClick={() => {
                            setErroExclusao(null);
                            setUsuarioParaExcluir(usuario);
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
        aberto={Boolean(usuarioParaExcluir)}
        titulo="Excluir usuário"
        mensagem={
          erroExclusao ||
          `Tem certeza que deseja excluir "${usuarioParaExcluir?.nome}"? Essa ação não pode ser desfeita.`
        }
        textoConfirmar={erroExclusao ? "Entendi" : "Excluir"}
        perigo={!erroExclusao}
        carregando={excluindo}
        aoConfirmar={erroExclusao ? () => setUsuarioParaExcluir(null) : confirmarExclusao}
        aoCancelar={() => setUsuarioParaExcluir(null)}
      />
    </div>
  );
}
