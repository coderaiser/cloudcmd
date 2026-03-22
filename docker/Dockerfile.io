FROM node
LABEL maintainer="Coderaiser"
LABEL org.opencontainers.image.source="https://github.com/coderaiser/cloudcmd"

RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app

COPY package.json /usr/src/app/

RUN apt-get update && apt-get upgrade && apt-get autoremove && \
    apt-get install nc mc iputils-ping && \
    npm i wisdom nupdate version-io redrun madrun redlint putout -g
    curl -fsSL https://bun.com/install | bash && \
    curl -fsSL https://deno.land/install.sh | sh
    ~/.bun/bin/bun i --production && \
    ~/.bun/bin/bun add --no-save gritty && \
    ~/.bun/bin/bun pm cache rm && \
    echo "ALL ALL=(ALL) NOPASSWD: /usr/bin/apt-get install *" > /etc/sudoers.d/apt-install && \
    chmod 0440 /etc/sudoers.d/apt-install

COPY . /usr/src/app

WORKDIR /

ENV cloudcmd_terminal=true
ENV cloudcmd_terminal_path=gritty
ENV cloudcmd_open=false
ENV PATH="node_modules/.bin:~/.bun/bin:$PATH"

EXPOSE 8000

ENTRYPOINT ["/usr/src/app/bin/cloudcmd.js"]
