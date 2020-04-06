FROM node
LABEL maintainer="Coderaiser"

RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app

COPY package.json /usr/src/app/

RUN npm config set package-lock false && \
    npm install --production && \
    npm i gritty && \
    npm cache clean --force

COPY . /usr/src/app

WORKDIR /

ENV CLOUDCMD_TERMINAL true
ENV CLOUDCMD_TERMINAL_PATH gritty
ENV CLOUDCMD_OPEN false

EXPOSE 8000

ENTRYPOINT ["/usr/src/app/bin/cloudcmd.js"]

