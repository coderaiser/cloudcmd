FROM node
LABEL maintainer="Coderaiser"
LABEL org.opencontainers.image.source="https://github.com/coderaiser/cloudcmd"

RUN mkdir -p /usr/src/cloudcmd
WORKDIR /usr/src/cloudcmd

COPY package.json /usr/src/cloudcmd/

RUN apt-get update && apt-get upgrade && apt-get autoremove && \
    apt-get install -y netcat-openbsd mc iputils-ping vim neovim sudo && \
    npm i wisdom nupdate version-io redrun madrun redlint putout renamify-cli runny redfork -g && \
    curl -fsSL https://bun.sh/install | bash && \
    ln -s ~/.bun/bin/bun /usr/local/bin/bun && \
    chmod a+x /usr/local/bin/bun && \
    curl -fsSL https://deno.land/install.sh | sh && \
    ln -s ~/.deno/bin/deno /usr/local/bin/deno && \
    chmod a+x /usr/local/bin/deno && \
    bun r gritty --omit dev && \
    bun i gritty --omit dev && \
    bun pm cache rm && \
    echo "ALL ALL=(ALL) NOPASSWD: /usr/bin/apt-get install *" > /etc/sudoers.d/apt-install && \
    chmod 0440 /etc/sudoers.d/apt-install && \
    echo "set editing-mode vi" >> /etc/inputrc && \
    echo "TAB: menu-complete" >> /etc/inputrc

COPY . /usr/src/cloudcmd

WORKDIR /

ENV cloudcmd_terminal=true
ENV cloudcmd_terminal_path=gritty
ENV cloudcmd_open=false
ENV PATH=node_modules/.bin:$PATH

EXPOSE 8000

ENTRYPOINT ["/usr/src/cloudcmd/bin/cloudcmd.js"]
