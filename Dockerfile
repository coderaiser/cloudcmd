FROM node
MAINTAINER Coderaiser

RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app

COPY package.json /usr/src/app/

RUN npm install --production && \
    npm i gritty

COPY . /usr/src/app

ENV cloudcmd_terminal true
ENV cloudcmd_terminal_path gritty

EXPOSE 8000

ENTRYPOINT ["bin/cloudcmd.js"]

