// Rodape.jsx
//
// Rodapé simples, só para fechar o layout com uma nota didática
// sobre o projeto. Fica dentro de Layout.jsx, então aparece em
// todas as páginas.

import "./Rodape.css";

export default function Rodape() {
  return (
    <footer className="rodape">
      <div className="container rodape__conteudo">
        <span>Sistema de Reservas de Biblioteca — projeto didático</span>
        <span>Frontend (React) + Backend (Node/Express) + PostgreSQL</span>
      </div>
    </footer>
  );
}
