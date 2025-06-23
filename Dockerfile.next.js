FROM node:24-bullseye

WORKDIR /npg

COPY package.json package-lock.json ./

RUN npm install

COPY . .

EXPOSE 3300

#起動プロトコル
CMD ["npm","run", "dev" ]
