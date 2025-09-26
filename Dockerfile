FROM node:20-alpine

WORKDIR /app

# Copia pacotes e instala dependências
COPY package*.json ./
RUN npm install

# Copia configs e código
COPY tsconfig.json ./
COPY prisma ./prisma
COPY src ./src

EXPOSE 3333

CMD ["npm", "run", "dev"]
