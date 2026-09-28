// Selecao.jsx
//
// Mesma ideia do Campo.jsx (rótulo + controle + ajuda/erro), mas
// para uma lista de opções (<select>). Usado, por exemplo, para
// escolher o livro e o usuário na hora de criar uma reserva.
//
// "opcoes" é um array de { valor, rotulo }.

import "./Campo.css";
import "./Selecao.css";

export default function Selecao({
  id,
  rotulo,
  ajuda,
  erro,
  obrigatorio = false,
  opcoes = [],
  placeholder = "Selecione...",
  ...resto
}) {
  return (
    <div className="campo">
      <label htmlFor={id} className="campo__rotulo">
        {rotulo}
        {obrigatorio && <span className="campo__obrigatorio"> *</span>}
      </label>

      <select
        id={id}
        className={`campo__input selecao__input ${erro ? "campo__input--erro" : ""}`}
        aria-invalid={Boolean(erro)}
        {...resto}
      >
        <option value="">{placeholder}</option>
        {opcoes.map((opcao) => (
          <option key={opcao.valor} value={opcao.valor}>
            {opcao.rotulo}
          </option>
        ))}
      </select>

      {ajuda && !erro && <p className="campo__ajuda">{ajuda}</p>}
      {erro && <p className="campo__erro">{erro}</p>}
    </div>
  );
}
