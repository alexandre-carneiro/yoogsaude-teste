FROM node:20

WORKDIR /app

COPY package.json package-lock.json* ./
COPY prisma ./prisma

RUN npm install

COPY tsconfig.json .eslintrc.cjs jest.config.cjs ./
COPY src ./src
COPY tests ./tests

RUN npx prisma generate && npm run build

EXPOSE 3333

CMD ["npm", "run", "start"]