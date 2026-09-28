// NaoEncontrado.jsx
//
// Página exibida quando nenhuma rota bate com a URL (veja a rota
// "*" em App.jsx) - por exemplo, um link quebrado ou um id de
// livro/usuário/reserva que não existe mais.
//
// Reaproveita o componente EstadoVazio (o mesmo usado para "lista
// sem itens" nas outras telas) em vez de criar um layout próprio só
// para esta página - visualmente já transmite "não há nada aqui",
// que é exatamente a mensagem certa para uma rota inexistente.

import { Link } from "react-router";
import Icone from "../../components/ui/Icone";
import EstadoVazio from "../../components/ui/EstadoVazio";

export default function NaoEncontrado() {
  return (
    <EstadoVazio
      icone="alerta"
      titulo="Página não encontrada"
      descricao="O endereço acessado não existe ou o item foi removido."
      acao={
        <Link to="/" className="botao botao--primaria">
          <Icone nome="home" tamanho={16} />
          Voltar para o início
        </Link>
      }
    />
  );
}
