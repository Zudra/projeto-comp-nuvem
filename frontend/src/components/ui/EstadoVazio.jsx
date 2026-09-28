// EstadoVazio.jsx
//
// O que mostrar no lugar de uma tabela/lista quando ela não tem
// nenhum item (ex: nenhum livro cadastrado ainda). Uma tela em
// branco confunde o usuário; um "estado vazio" explica o porquê e,
// se fizer sentido, oferece uma ação (ex: "Cadastrar o primeiro livro").

import Icone from "./Icone";
import "./EstadoVazio.css";

export default function EstadoVazio({ icone = "caixaVazia", titulo, descricao, acao }) {
  return (
    <div className="estado-vazio">
      <div className="estado-vazio__icone">
        <Icone nome={icone} tamanho={28} />
      </div>
      <h3>{titulo}</h3>
      {descricao && <p>{descricao}</p>}
      {acao}
    </div>
  );
}
