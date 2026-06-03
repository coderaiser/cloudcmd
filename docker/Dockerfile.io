FROM ubuntu:resolute

LABEL maintainer="Coderaiser"
LABEL org.opencontainers.image.source="https://github.com/coderaiser/cloudcmd"

RUN mkdir -p /usr/local/share/cloudcmd

WORKDIR /usr/local/share/cloudcmd

COPY package.json /usr/local/share/cloudcmd/

ENV DEBIAN_FRONTEND=noninteractive \
    NVM_DIR=/usr/local/share/nvm \
    npm_config_cache=/tmp/npm-cache \
    GOPATH=/usr/local/share/go \
    PATH=/usr/local/share/bun/bin:$PATH \
    BUN_INSTALL=/usr/local/share/bun \
    NPM_CONFIG_CACHE=/tmp/.npm \
    NPM_CONFIG_PREFIX=/usr/local \
    NPM_CONFIG_PACKAGE_LOCK=false \
    PALABRA_DIR=/usr/local/share \
    XDG_CONFIG_HOME=/usr/local/etc

ARG UBUNTU_DEPS="libatomic1 curl wget git net-tools iproute2 software-properties-common"
ARG RUST_DEPS="build-essential"
ARG DEPS="pv gcc gdb strace upx-ucl less ffmpeg net-tools netcat-openbsd mc far2l iputils-ping vim bat fzf locales sudo command-not-found ncdu aptitude htop btop hexyl tmux"
ARG PALABRA_DEPS="nvm node rust go deno fasm nvchad rizin yara gdu f4 typos shellcheck gh"
ARG BUN_DEPS="palabra wisdom nupdate version-io redrun superc8 supertape madrun redlint putout renamify-cli runny redfork cline"

RUN apt-get update && \
    apt-get upgrade -y && \
    apt-get autoremove && \
    apt-get install -y ${UBUNTU_DEPS} ${RUST_DEPES} ${DEPS} && \
    echo "> Install git" && \
    #add-apt-repository ppa:git-core/ppa -y && \
    echo "> Update command-not-found database. Run 'sudo apt update' to populate it." && \
    apt-get update && \
    apt-get upgrade -y && \
    apt-get autoremove && \
    apt-get clean && \
    echo "> create user" && \
    useradd -m -s /bin/bash -u 1337 instalador && \
    chown -R instalador /usr/local && \
    chown -R instalador /tmp

USER instalador

RUN echo "> install bun" && \
    curl https://bun.sh/install | bash && \
    echo "> install npm globals" && \
    bun i ${BUN_DEPS} -g && \
    echo "> install rust go deno bun fasm nvim" && \
    bun ${BUN_INSTALL}/bin/palabra i ${PALABRA_DEPS} && \
    echo "> install node" && \
    . $NVM_DIR/nvm.sh

USER root

RUN echo "> remove user" && \
    userdel -r instalador && \
    echo "> install gritty" && \
    bun r gritty --omit dev && \
    bun i gritty --omit dev && \
    bun pm cache rm && \
    echo "> setup cloudcmd" && \
    ln -s /usr/local/share/cloudcmd/bin/cloudcmd.js /usr/local/bin/cloudcmd && \
    echo "> setup git" && \
    git config --global core.whitespace -trailing-space && \
    git config --global pull.rebase true && \
    git config --global init.defaultBranch master && \
    echo "> configure bash" && \
    echo "alias ls='ls --color=auto'" >> /etc/bash.bashrc && \
    echo "alias buni='bun i --no-save'" >> /etc/bash.bashrc && \
    echo "alias bat='batcat'" >> /etc/bash.bashrc && \
    echo ". /usr/local/share/nvm/nvm.sh" >> /etc/bash.bashrc && \
    echo ". /usr/share/bash-completion/completions/git" >> /etc/bash.bashrc && \
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

COPY . /usr/local/share/cloudcmd

WORKDIR /

ENV cloudcmd_terminal=true \
    cloudcmd_terminal_path=gritty \
    cloudcmd_vim=true \
    cloudcmd_open=false \
    PATH=node_modules/.bin:$PATH \
    PATH=~/.local/bin:$PATH \
    BUN_INSTALL_CACHE_DIR=/tmp/bun-cache \
    DENO_DIR=/tmp/deno-cache \
    LANG=en_US.UTF-8 \
    LANGUAGE=en_US:en \
    LC_ALL=en_US.UTF-8 \
    TERM=xterm-256color \
    XDG_CACHE_HOME=/tmp \
    XDG_DATA_HOME=/usr/local/share \
    XDG_CONFIG_HOME=~/.config

EXPOSE 8000

ENTRYPOINT ["/usr/local/share/cloudcmd/bin/cloudcmd.js"]
