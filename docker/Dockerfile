FROM node

LABEL maintainer="Coderaiser"
LABEL org.opencontainers.image.source="https://github.com/coderaiser/cloudcmd"

RUN mkdir -p /usr/src/cloudcmd

WORKDIR /usr/src/cloudcmd

COPY package.json /usr/src/cloudcmd/

RUN curl -fsSL https://bun.com/install | bash && \
    ln -s /root/.bun/bin/bun /usr/local/bin/bun && \
    chmod +x /usr/local/bin/bun && \
    bun r gritty --omit dev && \
    bun i gritty --omit dev && \
    bun pm cache rm

COPY . /usr/src/cloudcmd

WORKDIR /

ENV cloudcmd_terminal=true
ENV cloudcmd_terminal_path=gritty
ENV cloudcmd_open=false

EXPOSE 8000

ENTRYPOINT ["/usr/src/cloudcmd/bin/cloudcmd.js"]
