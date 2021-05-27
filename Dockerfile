FROM node:12-slim

WORKDIR /usr/src/app

COPY . . 

CMD [ "node", "dist/index.js" ]