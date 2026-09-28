// DialogoConfirmacao.jsx
//
// Modal de confirmação, usado antes de qualquer ação destrutiva
// (excluir um livro, um usuário ou uma reserva). Em vez de um
// window.confirm() nativo do navegador (feio e não combina com o
// resto do visual), desenhamos nossa própria caixa de diálogo.
//
// Usamos createPortal para renderizar o modal direto no <body>, em
// vez de dentro da árvore normal do componente - assim ele sempre
// fica por cima de tudo, sem se preocupar com z-index ou overflow
// de elementos pais.

import { createPortal } from "react-dom";
import Botao from "./Botao";
import "./DialogoConfirmacao.css";

export default function DialogoConfirmacao({
  aberto,
  titulo,
  mensagem,
  textoConfirmar = "Confirmar",
  perigo = false,
  carregando = false,
  aoConfirmar,
  aoCancelar,
}) {
  if (!aberto) return null;

  return createPortal(
    <div className="dialogo-fundo" onClick={aoCancelar}>
      <div
        className="dialogo"
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="dialogo-titulo"
        onClick={(evento) => evento.stopPropagation()}
      >
        <h3 id="dialogo-titulo">{titulo}</h3>
        <p>{mensagem}</p>

        <div className="dialogo__acoes">
          <Botao variante="secundaria" onClick={aoCancelar} disabled={carregando}>
            Cancelar
          </Botao>
          <Botao
            variante={perigo ? "perigo" : "primaria"}
            onClick={aoConfirmar}
            carregando={carregando}
          >
            {textoConfirmar}
          </Botao>
        </div>
      </div>
    </div>,
    document.body,
  );
}
