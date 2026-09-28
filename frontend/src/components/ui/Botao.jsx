// Botao.jsx
//
// Botão padrão da aplicação. Em vez de estilizar cada <button> na
// mão em cada página, todo botão passa por aqui - garante que
// "primário" seja sempre a mesma cor, o mesmo tamanho, o mesmo
// comportamento de "carregando", etc.
//
// variante: "primaria" | "secundaria" | "perigo" | "fantasma"
// tamanho:  "md" | "sm"

import "./Botao.css";

export default function Botao({
  variante = "primaria",
  tamanho = "md",
  carregando = false,
  disabled = false,
  type = "button",
  className = "",
  children,
  ...resto
}) {
  return (
    <button
      type={type}
      className={`botao botao--${variante} botao--${tamanho} ${className}`}
      disabled={disabled || carregando}
      {...resto}
    >
      {carregando ? "Enviando..." : children}
    </button>
  );
}
