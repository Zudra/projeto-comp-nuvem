// useRequisicao.js
//
// Praticamente toda página deste projeto faz a mesma coisa ao
// carregar: dispara uma chamada à API, guarda o resultado, e
// controla os estados de "carregando" / "deu erro". Em vez de
// repetir esse useState + useEffect em cada página (ListaLivros,
// ListaUsuarios, DetalheLivro, ...), escrevemos essa lógica uma
// única vez neste hook e reaproveitamos.
//
// Como usar:
//
//   const { dados: livros, carregando, erro, recarregar } =
//     useRequisicao(() => livrosApi.listar(), []);
//
// - "funcaoBusca" é chamada assim que o componente aparece na tela,
//   e de novo sempre que algo em "dependencias" mudar (funciona como
//   a lista de dependências de um useEffect comum).
// - "recarregar" permite disparar a busca de novo manualmente -
//   muito útil depois de uma ação que muda os dados no servidor,
//   como excluir um item ou devolver um livro.

import { useState, useEffect, useCallback } from "react";
import { mensagemDeErro } from "../api/http";

export default function useRequisicao(funcaoBusca, dependencias = []) {
  const [dados, setDados] = useState(null);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState(null);

  const buscar = useCallback(() => {
    setCarregando(true);
    setErro(null);

    funcaoBusca()
      .then((resultado) => setDados(resultado))
      .catch((erroCapturado) => setErro(mensagemDeErro(erroCapturado)))
      .finally(() => setCarregando(false));

    // As dependências vêm de fora (quem chama o hook decide quando a
    // busca deve ser refeita), então não são estáticas como o eslint
    // prefere - esse é o motivo de existir este hook: escrever essa
    // exceção aqui uma única vez, em vez de em cada página.
    // eslint-disable-next-line react-hooks/use-memo, react-hooks/exhaustive-deps
  }, dependencias);

  useEffect(() => {
    buscar();
  }, [buscar]);

  return { dados, carregando, erro, recarregar: buscar };
}
