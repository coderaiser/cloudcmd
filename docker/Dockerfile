FROM node
LABEL maintainer="Coderaiser"
LABEL org.opencontainers.image.source="https://github.com/coderaiser/cloudcmd"

RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app

COPY package.json /usr/src/app/

RUN curl -fsSL https://bun.com/install | bash && \
    ln -s /root/.bun/bin/bun /usr/local/bin/bun && \
    chmod +x /usr/local/bin/bun && \
    bun i --production --no-save && \
    bun i gritty --production --no-save && \
    bun pm cache rm

COPY . /usr/src/app

WORKDIR /

ENV cloudcmd_terminal=true
ENV cloudcmd_terminal_path=gritty
ENV cloudcmd_open=false

EXPOSE 8000

ENTRYPOINT ["/usr/src/app/bin/cloudcmd.js"]
