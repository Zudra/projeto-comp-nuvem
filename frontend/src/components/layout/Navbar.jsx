// Navbar.jsx
//
// Barra de navegação fixa no topo, presente em todas as páginas
// (ela é renderizada pelo Layout.jsx, que envolve todas as rotas).
// Usa <NavLink> em vez de <Link> porque o NavLink sabe sozinho
// quando ele é a rota ativa e aplica a classe "active" - é assim
// que destacamos em qual seção o usuário está.

import { NavLink } from "react-router";
import Icone from "../ui/Icone";
import "./Navbar.css";

const LINKS = [
  { para: "/", rotulo: "Início", icone: "home", fim: true },
  { para: "/livros", rotulo: "Livros", icone: "livro" },
  { para: "/usuarios", rotulo: "Usuários", icone: "usuario" },
  { para: "/reservas", rotulo: "Reservas", icone: "reserva" },
];

export default function Navbar() {
  return (
    <header className="navbar">
      <div className="container navbar__conteudo">
        <NavLink to="/" className="navbar__marca">
          <span className="navbar__marca-icone">
            <Icone nome="livro" tamanho={18} />
          </span>
          Biblioteca
        </NavLink>

        <nav className="navbar__links">
          {LINKS.map((link) => (
            <NavLink
              key={link.para}
              to={link.para}
              end={link.fim}
              className={({ isActive }) =>
                `navbar__link ${isActive ? "navbar__link--ativo" : ""}`
              }
            >
              <Icone nome={link.icone} tamanho={16} />
              <span>{link.rotulo}</span>
            </NavLink>
          ))}
        </nav>
      </div>
    </header>
  );
}
