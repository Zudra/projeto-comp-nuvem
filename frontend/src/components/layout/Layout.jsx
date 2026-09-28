// Layout.jsx
//
// "Casca" comum a todas as páginas: Navbar no topo, Rodapé embaixo,
// e no meio o <Outlet /> - é onde o react-router encaixa a página
// da rota atual (veja App.jsx: todas as rotas ficam "dentro" desta
// rota de Layout).

import { Outlet } from "react-router";
import Navbar from "./Navbar";
import Rodape from "./Rodape";

export default function Layout() {
  return (
    <div className="pagina-app">
      <Navbar />
      <main className="container pagina-app__conteudo">
        <Outlet />
      </main>
      <Rodape />
    </div>
  );
}
