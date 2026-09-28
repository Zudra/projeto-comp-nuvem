// Carregando.jsx
//
// Indicador simples de "carregando" (um spinner girando via CSS +
// um texto). Mostrado enquanto uma requisição à API ainda não
// respondeu - veja o uso de "carregando" vindo de useRequisicao.js
// em qualquer página de listagem/detalhe.

import "./Carregando.css";

export default function Carregando({ texto = "Carregando..." }) {
  return (
    <div className="carregando">
      <span className="carregando__spinner" />
      <span>{texto}</span>
    </div>
  );
}
