// BotaoIcone.jsx
//
// Botão pequeno, só com um ícone dentro - usado nas ações de cada
// linha das tabelas (ver, editar, excluir, devolver). Recebe um
// "titulo" que vira o texto de acessibilidade (aria-label) e o
// tooltip nativo do navegador, já que não há texto visível.

import Icone from "./Icone";
import "./BotaoIcone.css";

export default function BotaoIcone({
  icone,
  titulo,
  variante = "neutro", // "neutro" | "perigo"
  ...resto
}) {
  return (
    <button
      type="button"
      className={`botao-icone botao-icone--${variante}`}
      title={titulo}
      aria-label={titulo}
      {...resto}
    >
      <Icone nome={icone} tamanho={16} />
    </button>
  );
}
