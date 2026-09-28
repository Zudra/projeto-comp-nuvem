// Etiqueta.jsx
//
// "Badge" / selo colorido usado para mostrar um status de forma
// visual - por exemplo, se um livro está Disponível/Indisponível,
// ou se uma reserva está Ativa/Devolvida.
//
// variante: "sucesso" | "perigo" | "aviso" | "neutro"

import "./Etiqueta.css";

export default function Etiqueta({ variante = "neutro", children }) {
  return <span className={`etiqueta etiqueta--${variante}`}>{children}</span>;
}
