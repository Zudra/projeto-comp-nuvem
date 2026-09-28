// Campo.jsx
//
// Campo de formulário completo: rótulo (label) + input + texto de
// ajuda opcional + mensagem de erro opcional. Junta essas quatro
// coisas num componente só para não repetir essa estrutura em toda
// tela de formulário (FormularioLivro, FormularioUsuario...).

import "./Campo.css";

export default function Campo({
  id,
  rotulo,
  ajuda,
  erro,
  obrigatorio = false,
  ...resto
}) {
  return (
    <div className="campo">
      <label htmlFor={id} className="campo__rotulo">
        {rotulo}
        {obrigatorio && <span className="campo__obrigatorio"> *</span>}
      </label>

      <input
        id={id}
        className={`campo__input ${erro ? "campo__input--erro" : ""}`}
        aria-invalid={Boolean(erro)}
        {...resto}
      />

      {ajuda && !erro && <p className="campo__ajuda">{ajuda}</p>}
      {erro && <p className="campo__erro">{erro}</p>}
    </div>
  );
}
