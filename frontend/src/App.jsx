// App.jsx
//
// Define todas as rotas (URLs) da aplicação e qual componente cada
// uma renderiza. Todas as rotas ficam "dentro" da rota de Layout,
// que desenha a Navbar/Rodapé em volta (veja components/layout/Layout.jsx).
//
// As rotas seguem o mesmo desenho dos 3 recursos do backend (livros,
// usuários, reservas), cada um com: listar, ver detalhe, criar e
// editar (veja backend/src/rotas).

import { Routes, Route, BrowserRouter } from "react-router";

import Layout from "./components/layout/Layout";

import Home from "./pages/Home/Home";

import ListaLivros from "./pages/Livros/ListaLivros";
import FormularioLivro from "./pages/Livros/FormularioLivro";
import DetalheLivro from "./pages/Livros/DetalheLivro";

import ListaUsuarios from "./pages/Usuarios/ListaUsuarios";
import FormularioUsuario from "./pages/Usuarios/FormularioUsuario";
import DetalheUsuario from "./pages/Usuarios/DetalheUsuario";

import ListaReservas from "./pages/Reservas/ListaReservas";
import CriarReserva from "./pages/Reservas/CriarReserva";
import DetalheReserva from "./pages/Reservas/DetalheReserva";

import NaoEncontrado from "./pages/NaoEncontrado/NaoEncontrado";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route index element={<Home />} />

          <Route path="livros" element={<ListaLivros />} />
          <Route path="livros/novo" element={<FormularioLivro />} />
          <Route path="livros/:id" element={<DetalheLivro />} />
          <Route path="livros/:id/editar" element={<FormularioLivro />} />

          <Route path="usuarios" element={<ListaUsuarios />} />
          <Route path="usuarios/novo" element={<FormularioUsuario />} />
          <Route path="usuarios/:id" element={<DetalheUsuario />} />
          <Route path="usuarios/:id/editar" element={<FormularioUsuario />} />

          <Route path="reservas" element={<ListaReservas />} />
          <Route path="reservas/nova" element={<CriarReserva />} />
          <Route path="reservas/:id" element={<DetalheReserva />} />

          <Route path="*" element={<NaoEncontrado />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
