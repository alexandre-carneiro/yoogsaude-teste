FROM node:22-alpine

WORKDIR /app

COPY package.json package-lock.json* ./

RUN npm install

COPY tsconfig.json .eslintrc.cjs jest.config.cjs ./
COPY src ./src
COPY tests ./tests

RUN npm run build

EXPOSE 3333

CMD ["npm", "run", "start"]

