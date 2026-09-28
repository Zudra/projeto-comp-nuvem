// Cartao.jsx
//
// Um "cartão" é só uma caixa branca com borda suave, cantos
// arredondados e uma leve sombra - a superfície onde a maior parte
// do conteúdo das páginas (tabelas, formulários, estatísticas) fica
// em cima do fundo bege da página.

import "./Cartao.css";

export default function Cartao({ className = "", children, ...resto }) {
  return (
    <div className={`cartao ${className}`} {...resto}>
      {children}
    </div>
  );
}
