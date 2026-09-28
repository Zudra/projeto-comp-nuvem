// Icone.jsx
//
// Um pequeno conjunto de ícones de linha (estilo "outline"), todos
// desenhados como SVG direto no código - sem depender de nenhuma
// biblioteca de ícones externa. Isso mantém o projeto simples e
// leve, e é fácil de entender: cada ícone é só um <path>.
//
// Uso: <Icone nome="livro" tamanho={18} />

const CAMINHOS = {
  livro: (
    <path d="M4 4.5A1.5 1.5 0 0 1 5.5 3H12v18H5.5A1.5 1.5 0 0 1 4 19.5v-15ZM12 3h6.5A1.5 1.5 0 0 1 20 4.5v15a1.5 1.5 0 0 1-1.5 1.5H12" />
  ),
  usuario: (
    <>
      <circle cx="12" cy="8" r="3.5" />
      <path d="M4.5 20c1.4-3.6 4.3-5.5 7.5-5.5s6.1 1.9 7.5 5.5" />
    </>
  ),
  reserva: (
    <path d="M6 3.5h9.5A1.5 1.5 0 0 1 17 5v16l-5.5-3.2L6 21V3.5Z" />
  ),
  home: (
    <>
      <path d="M4 11.5 12 4l8 7.5" />
      <path d="M6 10v9.5h12V10" />
    </>
  ),
  mais: (
    <>
      <path d="M12 5v14" />
      <path d="M5 12h14" />
    </>
  ),
  lapis: (
    <path d="M4 20l.9-3.6L15.8 5.5a1.5 1.5 0 0 1 2.1 0l.6.6a1.5 1.5 0 0 1 0 2.1L7.6 19.1 4 20Z" />
  ),
  lixeira: (
    <>
      <path d="M5 7h14" />
      <path d="M9 7V5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
      <path d="M7 7l1 13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1l1-13" />
    </>
  ),
  seta_esquerda: <path d="M15 5 8 12l7 7" />,
  seta_direita: <path d="M9 5l7 7-7 7" />,
  check: <path d="M4.5 12.5 9.5 17.5 19.5 6.5" />,
  alerta: (
    <>
      <path d="M12 3.5 21.5 20h-19L12 3.5Z" />
      <path d="M12 10v4" />
      <circle cx="12" cy="17" r="0.6" fill="currentColor" stroke="none" />
    </>
  ),
  x: (
    <>
      <path d="M6 6l12 12" />
      <path d="M18 6 6 18" />
    </>
  ),
  busca: (
    <>
      <circle cx="10.5" cy="10.5" r="6.5" />
      <path d="M20 20l-4.8-4.8" />
    </>
  ),
  caixaVazia: (
    <>
      <path d="M4 8.5 12 4l8 4.5-8 4.5-8-4.5Z" />
      <path d="M4 8.5V17l8 4.5 8-4.5V8.5" />
      <path d="M12 13v8.5" />
    </>
  ),
};

export default function Icone({ nome, tamanho = 20, className = "" }) {
  const caminho = CAMINHOS[nome];
  if (!caminho) return null;

  return (
    <svg
      width={tamanho}
      height={tamanho}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      {caminho}
    </svg>
  );
}
