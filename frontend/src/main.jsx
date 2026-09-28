import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.jsx";

// Estilos globais (tokens de tema + reset + classes utilitárias).
// Importado uma única vez, aqui na raiz da aplicação.
import "./styles/global.css";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
