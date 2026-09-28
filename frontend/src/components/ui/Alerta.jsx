// Alerta.jsx
//
// Faixa colorida usada para mostrar uma mensagem de erro (ex: "Email
// já cadastrado", devolvida pelo backend) ou de sucesso no topo de
// formulários e páginas.
//
// variante: "erro" | "sucesso" | "aviso"

import Icone from "./Icone";
import "./Alerta.css";

const ICONE_POR_VARIANTE = {
  erro: "alerta",
  sucesso: "check",
  aviso: "alerta",
};

export default function Alerta({ variante = "erro", children }) {
  if (!children) return null;

  return (
    <div className={`alerta alerta--${variante}`} role="alert">
      <Icone nome={ICONE_POR_VARIANTE[variante]} tamanho={18} />
      <span>{children}</span>
    </div>
  );
}
