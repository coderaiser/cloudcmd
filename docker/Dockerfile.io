FROM node
LABEL maintainer="Coderaiser"
LABEL org.opencontainers.image.source="https://github.com/coderaiser/cloudcmd"

RUN mkdir -p /usr/src/cloudcmd
WORKDIR /usr/src/cloudcmd

COPY package.json /usr/src/cloudcmd/

ENV DEBIAN_FRONTEND=noninteractive
ENV PATH=/usr/local/src/cargo/bin:$PATH
ENV NIX_NO_SANDBOX=1

ARG GO_VERSION=1.21.2

RUN apt-get update && apt-get upgrade -y && apt-get autoremove && \
    apt-get install -y less ffmpeg net-tools netcat-openbsd mc iputils-ping vim neovim bat fzf \
    locales sudo command-not-found && \
    echo "> Update command-not-found database. Run 'sudo apt update' to populate it." && \
    apt-get update && \
    apt-get autoremove && apt-get clean && \
    rm -rf /var/lib/apt/lists/* && \
    echo "> install nix" && \
    useradd -m -s /bin/bash nixuser && \
    mkdir /nix && \
    chown nixuser /nix && \
    su - nixuser && \
    mkdir -p ~/.config/nix && \
    echo "sandbox = false" > ~/.config/nix/nix.conf && \
    sh <(curl -L https://nixos.org/nix/install) --no-daemon && \
    exit && \
    mv /home/nixuser/.nix-profile /usr/local/src/nix-profile && \
    mv /home/nixuser/.nix-defexpr /usr/local/src/nix-defexpr && \
    userdel -r nixuser && \
    echo "> install nvm" && \
    curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.4/install.sh | bash && \
    mv ~/.nvm /usr/local/src/nvm && \
    echo "> install npm globals" && \
    npm i wisdom nupdate version-io redrun superc8 \
    supertape madrun redlint putout renamify-cli runny redfork -g && \
    echo "> install bun" && \
    curl -fsSL https://bun.sh/install | bash && \
    mv ~/.bun /usr/local/src/bun && \
    ln -s /usr/local/src/bun/bin/bun /usr/local/bin/bun && \
    echo "> install deno" && \
    curl -fsSL https://deno.land/install.sh | sh && \
    mv ~/.deno /usr/local/src/deno && \
    ln -s /usr/local/src/deno/bin/deno /usr/local/bin/deno && \
    echo "> install golang" && \
    curl -fsSL https://go.dev/dl/go${GO_VERSION}.linux-amd64.tar.gz -o go.tar.gz && \
    tar -C /usr/local/src -xzf go.tar.gz && \
    rm go.tar.gz && \
    ln -s /usr/local/src/go/bin/go /usr/local/bin/go && \
    ln -s /usr/local/src/go/bin/gofmt /usr/local/bin/gofmt && \
    echo "> install rust" && \
    curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh -s -- -y && \
    mv ~/.cargo /usr/local/src/cargo && \
    rustup default stable && \
    mv ~/.rustup /usr/local/src/rustup && \
    echo "> install gritty" && \
    bun r gritty --omit dev && \
    bun i gritty --omit dev && \
    bun pm cache rm && \
    echo "> setup git" && \
    git config --global core.whitespace -trailing-space && \
    git config --global pull.rebase true && \
    echo "> configure bash" && \
    echo "alias ls='ls --color=auto'" >> /etc/bash.bashrc && \
    echo "alias buni='bun i --no-save'" >> /etc/bash.bashrc && \
    echo "alias bat='batcat'" >> /etc/bash.bashrc && \
    echo ". /usr/local/src/nvm/nvm.sh" >> /etc/bash.bashrc && \
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
    echo "el_GR.UTF-8 UTF-8" >> /etc/locale.gen && \
    locale-gen

COPY . /usr/src/cloudcmd

WORKDIR /

ENV cloudcmd_terminal=true
ENV cloudcmd_terminal_path=gritty
ENV cloudcmd_open=false

ENV PATH=node_modules/.bin:$PATH
ENV PATH=/usr/local/src/nix/profile/bin:$PATH
ENV NIX_PATH=/usr/local/src/nix/defexpr/channels

ENV BUN_INSTALL_CACHE_DIR=/tmp/bun-cache
ENV DENO_DIR=/tmp/deno-cache

ENV LANG=en_US.UTF-8
ENV LANGUAGE=en_US:en
ENV LC_ALL=en_US.UTF-8

ENV TERM=xterm-256color

EXPOSE 8000

ENTRYPOINT ["/usr/src/cloudcmd/bin/cloudcmd.js"]
