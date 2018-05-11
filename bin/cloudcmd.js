#!/usr/bin/env node

'use strict';

const util = require('util');
const noop = () => {};

const Info = require('../package');
const DIR_SERVER = '../server/';

const exit = require(DIR_SERVER + 'exit');
const config = require(DIR_SERVER + 'config');
const env = require(DIR_SERVER + 'env');

const choose = (a, b) => {
    if (!a && typeof a === 'undefined')
        return b;
    
    return a;
};

const argv = process.argv;
const args = require('minimist')(argv.slice(2), {
    string: [
        'name',
        'port',
        'password',
        'username',
        'config',
        'editor',
        'packer',
        'root',
        'prefix',
        'terminal-path',
        'columns',
    ],
    boolean: [
        'auth',
        'cache',
        'repl',
        'save',
        'server',
        'online',
        'open',
        'progress',
        'config-dialog',
        'console',
        'sync-console-path',
        'contact',
        'terminal',
        'one-file-panel',
        'one-panel-mode',
        'confirm-copy',
        'confirm-move',
        'html-dialogs',
        'show-config',
        'vim',
        'keys-panel',
    ],
    default: {
        server      : true,
        name        : choose(env('name'), config('name')),
        auth        : choose(env('auth'), config('auth')),
        cache       : choose(env.bool('cache'), config('cache')),
        port        : config('port'),
        online      : config('online'),
        open        : config('open'),
        editor      : env('editor') || config('editor'),
        packer      : config('packer') || 'tar',
        zip         : config('zip'),
        username    : env('username') || config('username'),
        root        : choose(env('root'), config('root')),
        prefix      : config('prefix'),
        progress    : config('progress'),
        console     : choose(env.bool('console'), config('console')),
        contact     : choose(env.bool('contact'), config('contact')),
        terminal    : choose(env.bool('terminal'), config('terminal')),
        
        'sync-console-path': choose(env.bool('sync_console_path'), config('syncConsolePath')),
        'config-dialog': choose(env.bool('config_dialog'), config('configDialog')),
        'terminal-path': env('terminal_path') || config('terminalPath'),
        'one-file-panel': choose(env.bool('one_file_panel'), config('onePanelMode')),
        'one-panel-mode': '',
        'confirm-copy': choose(env.bool('confirm_copy'), config('confirmCopy')),
        'confirm-move': choose(env.bool('confirm_move'), config('confirmMove')),
        'html-dialogs': config('htmlDialogs'),
        'vim': choose(env.bool('vim'), config('vim')),
        'columns': env('columns') || config('columns') || '',
        'keys-panel': env.bool('keys_panel') || config('keysPanel'),
    },
    alias: {
        v: 'version',
        h: 'help',
        p: 'password',
        o: 'online',
        u: 'username',
        s: 'save',
        a: 'auth',
        c: 'config'
    },
    unknown: (cmd) => {
        exit('\'%s\' is not a cloudcmd option. See \'cloudcmd --help\'.', cmd);
    }
});

if (args.version)
    version();
else if (args.help)
    help();
else
    main();

function main() {
    if (args.repl)
        repl();
    
    checkUpdate();
    
    port(args.port);
    
    config('name', args.name);
    config('auth', args.auth);
    config('cache', args.cache);
    config('online', args.online);
    config('open', args.open);
    config('username', args.username);
    config('progress', args.progress);
    config('console', args.console);
    config('syncConsolePath', args['sync-console-path']);
    config('contact', args.contact);
    config('terminal', args.terminal);
    config('terminalPath', args['terminal-path']);
    config('editor', args.editor);
    config('prefix', args.prefix);
    config('root', args.root);
    config('vim', args.vim);
    config('columns', args.columns);
    config('htmlDialogs', args['html-dialogs']);
    config('confirmCopy', args['confirm-copy']);
    config('confirmMove', args['confirm-move']);
    config('onePanelMode', args['one-file-panel']);
    config('oneFilePanel', args['one-file-panel']);
    config('configDialog', args['config-dialog']);
    config('keysPanel', args['keys-panel']);
    
    if (args['one-panel-mode']) {
        util.deprecate(noop, `cloudcmd --one-panel-mode: deprecated, use --one-file-panel instead`, 'DP0001')();
        config('oneFilePanel', true);
        config('onePanelMode', true);
    } else if (typeof args['one-panel-mode'] === 'boolean') {
        util.deprecate(noop, `cloudcmd --no-one-panel-mode: deprecated, use --no-one-file-panel instead`, 'DP0001')();
        config('oneFilePanel', false);
        config('onePanelMode', false);
    }
    
    if (env('one_panel_mode')) {
        util.deprecate(noop, `CLOUDCMD_ONE_PANEL_MODE deprecated, use CLOUDCMD_ONE_FILE_PANEL instead`, 'DP0001')();
        config('oneFilePanel', env.bool('one_panel_mode'));
        config('onePanelMode', env.bool('one_panel_mode'));
    }
    
    readConfig(args.config);
    
    const options = {
        root: args.root || '/', /* --no-root */
        editor: args.editor,
        packer: args.packer,
        prefix: args.prefix || '', /* --no-prefix */
        columns: args.columns,
    };
    
    const password = env('password') || args.password;
    
    if (password)
        config('password', getPassword(password));
    
    validateRoot(options.root);
    
    if (args['show-config'])
        showConfig();
    
    if (!args.save)
        return start(options);
    
    config.save(() => {
        start(options);
    });
}

function validateRoot(root) {
    const validate = require(DIR_SERVER + 'validate');
    validate.root(root, console.log);
}

function getPassword(password) {
    const criton = require('criton');
    
    return criton(password, config('algo'));
}

function version() {
    console.log('v' + Info.version);
}

function start(config) {
    const SERVER = DIR_SERVER + 'server';
    
    if (args.server)
        require(SERVER)(config);
}

function port(arg) {
    const number = parseInt(arg, 10);
    
    if (!isNaN(number))
        return config('port', number);
    
    exit('cloudcmd --port: should be a number');
}

function showConfig() {
    const show = require('../server/show-config');
    const data = show(config('*'));
    
    console.log(data);
}

function readConfig(name) {
    if (!name)
        return;
    
    const fs = require('fs');
    const tryCatch = require('try-catch');
    const jju = require('jju');
    const forEachKey = require('for-each-key');
    
    const readjsonSync = (name) => jju.parse(fs.readFileSync(name, 'utf8'), {
        mode: 'json'
    });
    
    const result = tryCatch(readjsonSync, name);
    const error = result[0];
    const data = result[1];
    
    if (error)
        return exit(error.message);
    
    forEachKey(config, data);
}

function help() {
    const bin = require('../json/help');
    const forEachKey = require('for-each-key');
    const currify = require('currify/legacy');
    const usage = 'Usage: cloudcmd [options]';
    const url = Info.homepage;
    const log = currify((a, b, c) => console.log(a, b, c));
    
    console.log(usage);
    console.log('Options:');
    forEachKey(log('  %s %s'), bin);
    console.log('\nGeneral help using Cloud Commander: <%s>', url);
}

function repl() {
    console.log('REPL mode enabled (telnet localhost 1337)');
    require(DIR_SERVER + 'repl');
}

function checkUpdate() {
    const load = require('package-json');
    const noop = () => {};
    
    load(Info.name, 'latest')
        .then(showUpdateInfo)
        .catch(noop);
}

function showUpdateInfo(data) {
    const version = data.version;
    
    if (version !== Info.version) {
        const chalk = require('chalk');
        const rendy = require('rendy');
        
        const latest = rendy('update available: {{ latest }}', {
            latest: chalk.green.bold('v' + version),
        });
        
        const current = chalk.dim(rendy('(current: v{{ current }})', {
            current: Info.version
        }));
        
        console.log('%s %s', latest, current);
    }
}

