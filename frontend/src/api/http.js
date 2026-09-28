// http.js
//
// Configura o cliente HTTP (axios) usado por toda a aplicação para
// falar com o backend, e centraliza a leitura de mensagens de erro.
//
// Por que centralizar isso em um único arquivo? Porque toda página
// que faz uma requisição precisa lidar com "deu erro, e agora?" — em
// vez de repetir essa lógica em cada uma, escrevemos uma vez aqui e
// reaproveitamos (veja mensagemDeErro sendo usada em src/hooks/useRequisicao.js
// e em todas as páginas de formulário).

import axios from "axios";

// import.meta.env é como o Vite expõe variáveis de ambiente para o
// código do navegador. Só variáveis que começam com "VITE_" chegam
// até aqui (veja o arquivo .env na raiz do frontend).
const baseURL = import.meta.env.VITE_API_URL || "http://localhost:3000";

const http = axios.create({ baseURL });

// Transforma qualquer erro de uma chamada à API numa mensagem de
// texto pronta para mostrar na tela.
//
// O backend, quando rejeita uma requisição por regra de negócio
// (ex: "Email já cadastrado", "Livro não está disponível"), sempre
// responde no formato { erro: "mensagem" } (veja os controladores em
// backend/src/controladores). Aproveitamos essa mensagem quando ela
// existe; caso contrário, devolvemos algo genérico.
export function mensagemDeErro(erro) {
  if (erro.response?.data?.erro) {
    return erro.response.data.erro;
  }
  if (erro.request) {
    // A requisição foi enviada, mas nenhuma resposta chegou -
    // provavelmente o backend não está rodando.
    return "Não foi possível conectar à API. Verifique se o backend está rodando.";
  }
  return "Ocorreu um erro inesperado. Tente novamente.";
}

export default http;
