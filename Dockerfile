FROM node:20-alpine

WORKDIR /app

# Copia pacotes e schema do Prisma antes do install
COPY package*.json ./
COPY prisma ./prisma

RUN npm install

# Copia configs e código
COPY tsconfig.json ./
COPY src ./src

EXPOSE 3333

CMD ["npm", "run", "dev"]
