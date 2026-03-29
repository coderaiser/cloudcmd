FROM ubuntu
LABEL maintainer="Coderaiser"
LABEL org.opencontainers.image.source="https://github.com/coderaiser/cloudcmd"

RUN mkdir -p /usr/src/cloudcmd
WORKDIR /usr/src/cloudcmd

COPY package.json /usr/src/cloudcmd/

ENV DEBIAN_FRONTEND=noninteractive

RUN apt-get update && apt-get upgrade -y && \
    apt-get install -y curl git ffmpeg net-tools netcat-openbsd mc iputils-ping vim neovim sudo locales \
    build-essential \
    libatomic1 \
    command-not-found \
    ca-certificates && \
    apt-get autoremove && apt-get clean && \
    rm -rf /var/lib/apt/lists/* && \
    echo "> install node" && \
    curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.4/install.sh | bash && \
    mv ~/.nvm /usr/local/src/nvm && \
    chmod a+rwx /usr/local/src/nvm && \
    . /usr/local/src/nvm/nvm.sh && \
    nvm i node && \
    echo "> install npm globals" && \
    npm i wisdom nupdate version-io redrun superc8 \
    supertape madrun redlint putout renamify-cli runny redfork -g && \
    echo "> install bun" && \
    curl -fsSL https://bun.sh/install | bash && \
    mv ~/.bun /usr/local/src/bun && \
    chmod a+rwx /usr/local/src/bun && \
    ln -s /usr/local/src/bun/bin/bun /usr/local/bin/bun && \
    echo "> install deno" && \
    curl -fsSL https://deno.land/install.sh | sh && \
    mv ~/.deno /usr/local/src/deno && \
    chmod a+rwx /usr/local/src/deno && \
    ln -s /usr/local/src/deno/bin/deno /usr/local/bin/deno && \
    bun r gritty --omit dev && \
    bun i gritty --omit dev && \
    bun pm cache rm && \
    echo "> setup git" && \
    git config --global core.whitespace -trailing-space && \
    git config --global pull.rebase true && \
    echo "> configure bash" && \
    echo "alias ls='ls --color=auto'" >> /etc/bash.bashrc && \
    echo "alias buni='bun i --no-save'" >> /etc/bash.bashrc && \
    echo 'PS1="\[\033[01;32m\]\u@\h\[\033[00m\]:\[\033[01;34m\]\w\[\033[00m\]\$ "' >> /etc/bash.bashrc && \
    echo "> setup inputrc" && \
    echo "set editing-mode vi" >> /etc/inputrc && \
    echo "TAB: menu-complete" >> /etc/inputrc && \
    echo "set UTF-8" && \
    echo " > configure languages" && \
    echo "en_US.UTF-8 UTF-8" > /etc/locale.gen && \
    echo "ru_RU.UTF-8 UTF-8" >> /etc/locale.gen && \
    echo "uk_UA.UTF-8 UTF-8" >> /etc/locale.gen && \
    echo "es_ES.UTF-8 UTF-8" >> /etc/locale.gen && \
    echo "ja_JP.UTF-8 UTF-8" >> /etc/locale.gen && \
    locale-gen

COPY . /usr/src/cloudcmd

WORKDIR /

ENV cloudcmd_terminal=true
ENV cloudcmd_terminal_path=gritty
ENV cloudcmd_open=false

ENV PATH=node_modules/.bin:$PATH
ENV BUN_INSTALL_CACHE_DIR=/tmp/bun-cache

ENV LANG=en_US.UTF-8
ENV LANGUAGE=en_US:en
ENV LC_ALL=en_US.UTF-8

ENV TERM=xterm-256color

EXPOSE 8000

ENTRYPOINT ["/usr/src/cloudcmd/bin/cloudcmd.js"]
