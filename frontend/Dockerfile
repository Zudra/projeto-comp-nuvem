# Dockerfile (frontend)
#
# Build em dois estágios:
#   1) "build": usa a imagem oficial do Node para gerar os arquivos
#      estáticos do React com o Vite (pasta dist/).
#   2) final: usa a imagem oficial do nginx só para servir esses
#      arquivos. O Node e o node_modules ficam no primeiro estágio e
#      não vão para a imagem final, que fica bem menor.

# ---------- Estágio 1: build ----------
FROM node:22-alpine AS build

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .

# Endereço da API visto pelo navegador. Como o nginx (estágio 2)
# repassa tudo o que começa com /api para o backend, basta um caminho
# relativo. O Vite lê a variável no momento do build.
ARG VITE_API_URL=/api
RUN npm run build

# ---------- Estágio 2: servidor web ----------
FROM nginx:stable-alpine

COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
