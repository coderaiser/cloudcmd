FROM node:lts-bookworm
LABEL maintainer="Coderaiser"
LABEL org.opencontainers.image.source="https://github.com/coderaiser/cloudcmd"

RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app

COPY package.json /usr/src/app/

RUN npm config set package-lock false && \
    npm install --production -f && \
    npm i gritty && \
    npm cache clean --force

COPY . /usr/src/app

WORKDIR /

ENV cloudcmd_terminal=true
ENV cloudcmd_terminal_path=gritty
ENV cloudcmd_open=false

EXPOSE 8000

ENTRYPOINT ["/usr/src/app/bin/cloudcmd.mjs"]
