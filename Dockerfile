FROM node:18.0-alpine3.15
ENV HOME /usr/src/
WORKDIR $HOME

COPY ["package.json", "yarn.lock", "${HOME}/"]

RUN yarn install

COPY . $HOME

RUN yarn build --production

CMD [ "node", "build/index.js" ]
