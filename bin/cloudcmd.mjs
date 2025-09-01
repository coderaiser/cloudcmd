#!/usr/bin/env node

import process from 'node:process';
import {createRequire} from 'node:module';
import {promisify} from 'node:util';
import tryToCatch from 'try-to-catch';
import {createSimport} from 'simport';
import parse from 'yargs-parser';
import exit from '../server/exit.js';
import {createConfig, configPath} from '../server/config.js';
import env from '../server/env.js';
import prefixer from '../server/prefixer.js';
import * as validate from '../server/validate.mjs';

process.on('unhandledRejection', exit);

const require = createRequire(import.meta.url);

const Info = require('../package.json');
const isUndefined = (a) => typeof a === 'undefined';
const simport = createSimport(import.meta.url);

const choose = (a, b) => {
    if (isUndefined(a))
        return b;
    
    return a;
};

const config = createConfig({
    configPath,
});

const DIR_SERVER = '../server/';

const maybeRoot = (a) => {
    if (a === '.')
        return process.cwd();
    
    return a;
};

const yargsOptions = {
    configuration: {
        'strip-aliased': true,
        'strip-dashed': true,
    },
    coerce: {
        root: maybeRoot,
    },
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
        'prefix-socket',
        'terminal-path',
        'terminal-command',
        'columns',
        'menu',
        'theme',
        'import-url',
        'import-token',
        'export-token',
        'dropbox-token',
    ],
    boolean: [
        'auth',
        'repl',
        'save',
        'server',
        'online',
        'open',
        'config-dialog',
        'config-auth',
        'console',
        'sync-console-path',
        'contact',
        'terminal',
        'terminal-auto-restart',
        'one-file-panel',
        'confirm-copy',
        'confirm-move',
        'show-config',
        'show-dot-files',
        'show-file-name',
        'vim',
        'keys-panel',
        'color',
        'export',
        'import',
        'import-listen',
        'log',
        'zip',
        'dropbox',
    ],
    default: {
        'server': true,
        'name': choose(env('name'), config('name')),
        'auth': choose(env.bool('auth'), config('auth')),
        'port': config('port'),
        'online': config('online'),
        'open': choose(env.bool('open'), config('open')),
        'editor': env('editor') || config('editor'),
        'menu': env('menu') || config('menu'),
        'packer': config('packer') || 'tar',
        'zip': config('zip'),
        'username': env('username') || config('username'),
        'root': choose(env('root'), config('root')),
        'prefix': choose(env('prefix'), config('prefix')),
        'console': choose(env.bool('console'), config('console')),
        'contact': choose(env.bool('contact'), config('contact')),
        'terminal': choose(env.bool('terminal'), config('terminal')),
        'columns': env('columns') || config('columns') || '',
        'theme': env('theme') || config('theme') || '',
        'vim': choose(env.bool('vim'), config('vim')),
        'log': config('log'),
        
        'import-url': env('import_url') || config('importUrl'),
        'import-listen': choose(env.bool('import_listen'), config('importListen')),
        'import': choose(env.bool('import'), config('import')),
        'export': choose(env.bool('export'), config('export')),
        
        'prefix-socket': config('prefixSocket'),
        'show-dot-files': choose(env.bool('show_dot_files'), config('showDotFiles')),
        'show-file-name': choose(env.bool('show_file_name'), config('showFileName')),
        'sync-console-path': choose(env.bool('sync_console_path'), config('syncConsolePath')),
        'config-dialog': choose(env.bool('config_dialog'), config('configDialog')),
        'config-auth': choose(env.bool('config_auth'), config('configAuth')),
        'terminal-path': env('terminal_path') || config('terminalPath'),
        'terminal-command': env('terminal_command') || config('terminalCommand'),
        'terminal-auto-restart': choose(env.bool('terminal_auto_restart'), config('terminalAutoRestart')),
        'one-file-panel': choose(env.bool('one_file_panel'), config('oneFilePanel')),
        'confirm-copy': choose(env.bool('confirm_copy'), config('confirmCopy')),
        'confirm-move': choose(env.bool('confirm_move'), config('confirmMove')),
        'keys-panel': env.bool('keys_panel') || config('keysPanel'),
        'import-token': env('import_token') || config('importToken'),
        'export-token': env('export_token') || config('exportToken'),
        
        'dropbox': config('dropbox'),
        'dropbox-token': config('dropboxToken') || '',
    },
    alias: {
        version: 'v',
        help: 'h',
        password: 'p',
        online: 'o',
        username: 'u',
        save: 's',
        auth: 'a',
        config: 'c',
    },
};

const {argv} = process;
const args = parse(argv.slice(2), yargsOptions);

if (args.version)
    version();
else if (args.help)
    help();
else
    main();

async function main() {
    const {validateArgs} = await simport('@putout/cli-validate-args');
    
    const error = await validateArgs(args, [
        ...yargsOptions.boolean,
        ...yargsOptions.string,
    ]);
    
    if (error)
        return exit(error);
    
    if (args.repl)
        repl();
    
    validate.columns(args.columns);
    validate.theme(args.theme);
    
    port(args.port);
    
    config('name', args.name);
    config('auth', args.auth);
    config('online', args.online);
    config('open', args.open);
    config('username', args.username);
    config('console', args.console);
    config('syncConsolePath', args.syncConsolePath);
    config('showDotFiles', args.showDotFiles);
    config('showFileName', args.showFileName);
    config('contact', args.contact);
    config('terminal', args.terminal);
    config('terminalPath', args.terminalPath);
    config('terminalCommand', args.terminalCommand);
    config('terminalAutoRestart', args.terminalAutoRestart);
    config('editor', args.editor);
    config('menu', args.menu);
    config('prefix', prefixer(args.prefix));
    config('prefixSocket', prefixer(args.prefixSocket));
    config('root', args.root || '/');
    config('vim', args.vim);
    config('theme', args.theme);
    config('columns', args.columns);
    config('log', args.log);
    config('confirmCopy', args.confirmCopy);
    config('confirmMove', args.confirmMove);
    config('oneFilePanel', args.oneFilePanel);
    config('configDialog', args.configDialog);
    config('configAuth', args.configAuth);
    config('keysPanel', args.keysPanel);
    config('export', args.export);
    config('exportToken', args.exportToken);
    config('import', args.import);
    config('importToken', args.importToken);
    config('importListen', args.importListen);
    config('importUrl', args.importUrl);
    
    config('dropbox', args.dropbox);
    config('dropboxToken', args.dropboxToken);
    
    await readConfig(args.config);
    
    const options = {
        root: config('root'),
        editor: config('editor'),
        packer: config('packer'),
        prefix: config('prefix'),
        prefixSocket: config('prefixSocket'),
        columns: config('columns'),
        theme: config('theme'),
        menu: config('menu'),
    };
    
    const password = env('password') || args.password;
    
    if (password)
        config('password', await getPassword(password));
    
    validateRoot(options.root, config);
    
    if (args.showConfig)
        await showConfig();
    
    const {distributeImport} = await simport('../server/distribute/import.mjs');
    const importConfig = promisify(distributeImport);
    
    await start(options, config);
    
    if (args.save)
        config.write();
    
    await tryToCatch(checkUpdate);
    await importConfig(config);
}

function validateRoot(root, config) {
    validate.root(root, config);
    
    if (root === '/')
        return;
    
    console.log(`root: ${root}`);
}

async function getPassword(password) {
    const criton = await simport('criton');
    return criton(password, config('algo'));
}

function version() {
    console.log('v' + Info.version);
}

async function start(options, config) {
    const SERVER = `${DIR_SERVER}server.mjs`;
    
    if (!args.server)
        return;
    
    const server = await simport(SERVER);
    server(options, config);
}

function port(arg) {
    const number = parseInt(arg, 10);
    
    if (!isNaN(number))
        return config('port', number);
    
    exit('cloudcmd --port: should be a number');
}

async function showConfig() {
    const show = await simport('../server/show-config');
    const data = show(config('*'));
    
    console.log(data);
}

async function readConfig(name) {
    if (!name)
        return;
    
    const tryToCatch = await simport('try-to-catch');
    const forEachKey = await simport('for-each-key');
    
    const [error, data] = await tryToCatch(simport, name);
    
    if (error)
        return exit(error.message);
    
    forEachKey(config, data);
}

async function help() {
    const {default: bin} = await import('../json/help.json', {
        with: {
            type: 'json',
        },
    });
    
    const forEachKey = await simport('for-each-key');
    const currify = await simport('currify');
    
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
    require(`${DIR_SERVER}repl`);
}

async function checkUpdate() {
    const load = await simport('package-json');
    
    const {version} = await load(Info.name, 'latest');
    await showUpdateInfo(version);
}

async function showUpdateInfo(version) {
    if (version === Info.version)
        return;
    
    const chalk = await simport('chalk');
    
    const latestVersion = chalk.green.bold(`v${version}`);
    const latest = `update available: ${latestVersion}`;
    const current = chalk.dim(`(current: v${Info.version})`);
    
    console.log('%s %s', latest, current);
}
