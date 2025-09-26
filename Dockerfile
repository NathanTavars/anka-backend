FROM node:20-alpine

# Diretório de trabalho
WORKDIR /app

# Copia arquivos de dependência
COPY package*.json ./

# Instala dependências
RUN npm install

# Copia configs e código
COPY tsconfig.json ./
COPY src ./src

# Porta padrão
EXPOSE 3333

# Comando para rodar o backend
CMD ["npm", "run", "dev"]
