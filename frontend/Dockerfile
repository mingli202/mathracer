FROM node:24-alpine

ARG NEXT_PUBLIC_API_URL
ARG NEXT_PUBLIC_BASE_URL

WORKDIR /app

COPY package.json .
COPY package-lock.json .

RUN npm install

COPY . .

RUN npm run build

EXPOSE 3000

CMD ["npm", "run", "start"]
