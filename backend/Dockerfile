# Dockerfile (backend)
#
# Imagem da API da biblioteca (Node.js + Express).
# Parte da imagem oficial do Node, na variante Alpine (menor).

FROM node:22-alpine

WORKDIR /app

ENV NODE_ENV=production

# Copiamos só os arquivos de dependências primeiro. Assim o Docker
# reaproveita a camada do "npm ci" em cache enquanto package.json e
# package-lock.json não mudarem, mesmo que o código mude.
COPY package.json package-lock.json ./
RUN npm ci --omit=dev

# Agora sim o código da aplicação (o que está no .dockerignore fica de fora)
COPY . .

# Não roda como root: a imagem oficial já traz o usuário "node"
USER node

EXPOSE 3000

CMD ["node", "server.js"]
