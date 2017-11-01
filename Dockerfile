FROM node:8
MAINTAINER Coderaiser

RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app

COPY package.json /usr/src/app/

RUN npm config set package-lock false && \
    npm install --production && \
    npm i gritty && \
    npm cache clean --force

COPY . /usr/src/app

WORKDIR /root

ENV cloudcmd_terminal true
ENV cloudcmd_terminal_path gritty

EXPOSE 8000

ENTRYPOINT ["/usr/src/app/bin/cloudcmd.js"]

