#!/usr/bin/env node

import readjson from 'readjson';

import {promisify} from 'util';
import tryToCatch from 'try-to-catch';

import exit from '../server/exit.js';
import {createConfig, configPath} from '../server/config.js';

const config = createConfig({
    configPath,
});

import env from '../server/env.js';
import prefixer from '../server/prefixer.js';

import minimist from 'minimist';

const Info = await readjson(new URL('../package.json', import.meta.url));

const {argv} = process;

const choose = (a, b) => {
    if (a === undefined)
        return b;
    
    return a;
};

process.on('unhandledRejection', exit);

const args = minimist(argv.slice(2), {
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
        'show-file-name',
        'vim',
        'keys-panel',
        'color',
        'export',
        'import',
        'import-listen',
        'log',
        'dropbox',
    ],
    default: {
        'server'      : true,
        'name'        : choose(env('name'), config('name')),
        'auth'        : choose(env.bool('auth'), config('auth')),
        'port'        : config('port'),
        'online'      : config('online'),
        'open'        : choose(env.bool('open'), config('open')),
        'editor'      : env('editor') || config('editor'),
        'packer'      : config('packer') || 'tar',
        'zip'         : config('zip'),
        'username'    : env('username') || config('username'),
        'root'        : choose(env('root'), config('root')),
        'prefix'      : choose(env('cloudcmd_prefix'), config('prefix')),
        'console'     : choose(env.bool('console'), config('console')),
        'contact'     : choose(env.bool('contact'), config('contact')),
        'terminal'    : choose(env.bool('terminal'), config('terminal')),
        'columns'     : env('columns') || config('columns') || '',
        'vim'         : choose(env.bool('vim'), config('vim')),
        'log'         : config('log'),
        
        'import-url': env('import_url') || config('importUrl'),
        'import-listen': choose(env.bool('import_listen'), config('importListen')),
        'import'      : choose(env.bool('import'), config('import')),
        'export'      : choose(env.bool('export'), config('export')),
        
        'prefix-socket': config('prefixSocket'),
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
        'dropbox-token': config('dropboxToken'),
    },
    alias: {
        v: 'version',
        h: 'help',
        p: 'password',
        o: 'online',
        u: 'username',
        s: 'save',
        a: 'auth',
        c: 'config',
    },
    unknown: (cmd) => {
        exit('\'%s\' is not a cloudcmd option. See \'cloudcmd --help\'.', cmd);
    },
});

if (args.version)
    version();
else if (args.help)
    help();
else
    await main();

async function main() {
    if (args.repl)
        await repl();
    
    port(args.port);
    
    config('name', args.name);
    config('auth', args.auth);
    config('online', args.online);
    config('open', args.open);
    config('username', args.username);
    config('console', args.console);
    config('syncConsolePath', args['sync-console-path']);
    config('showFileName', args['show-file-name']);
    config('contact', args.contact);
    config('terminal', args.terminal);
    config('terminalPath', args['terminal-path']);
    config('terminalCommand', args['terminal-command']);
    config('terminalAutoRestart', args['terminal-auto-restart']);
    config('editor', args.editor);
    config('prefix', prefixer(args.prefix));
    config('prefixSocket', prefixer(args['prefix-socket']));
    config('root', args.root || '/');
    config('vim', args.vim);
    config('columns', args.columns);
    config('log', args.log);
    config('confirmCopy', args['confirm-copy']);
    config('confirmMove', args['confirm-move']);
    config('oneFilePanel', args['one-file-panel']);
    config('configDialog', args['config-dialog']);
    config('configAuth', args['config-auth']);
    config('keysPanel', args['keys-panel']);
    config('export', args.export);
    config('exportToken', args['export-token']);
    config('import', args.import);
    config('importToken', args['import-token']);
    config('importListen', args['import-listen']);
    config('importUrl', args['import-url']);
    
    config('dropbox', args['dropbox']);
    config('dropboxToken', args['dropbox-token'] || '');
    
    await readConfig(args.config);
    
    const options = {
        root: config('root'),
        editor: config('editor'),
        packer: config('packer'),
        prefix: config('prefix'),
        prefixSocket: config('prefixSocket'),
        columns: config('columns'),
    };
    
    const password = env('password') || args.password;
    
    if (password)
        config('password', await getPassword(password));
    
    await validateRoot(options.root, config);
    
    if (args['show-config'])
        await showConfig();
    
    const {default: distributeImport} = await import('../server/distribute/import.js');
    const importConfig = promisify(distributeImport);
    
    await start(options, config);
    
    if (args.save)
        config.write();
    
    await tryToCatch(checkUpdate);
    await importConfig(config);
}

async function validateRoot(root, config) {
    const validate = await import('../server/validate.js');
    
    validate.root(root, config);
    
    if (root === '/')
        return;
    
    console.log(`root: ${root}`);
}

async function getPassword(password) {
    const criton = await import('criton');
    return criton(password, config('algo'));
}

function version() {
    console.log('v' + Info.version);
}

async function start(options, config) {
    if (!args.server)
        return;
    
    const {default: server} = await import('../server/server.js');
    server(options, config);
}

function port(arg) {
    const number = parseInt(arg, 10);
    
    if (!isNaN(number))
        return config('port', number);
    
    exit('cloudcmd --port: should be a number');
}

async function showConfig() {
    const show = await import('../server/show-config');
    const data = show(config('*'));
    
    console.log(data);
}

async function readConfig(name) {
    if (!name)
        return;
    
    const fs = await import('fs');
    const tryCatch = await import('try-catch');
    const jju = await import('jju');
    const forEachKey = await import('for-each-key');
    
    const readjsonSync = (name) => jju.parse(fs.readFileSync(name, 'utf8'), {
        mode: 'json',
    });
    
    const [error, data] = tryCatch(readjsonSync, name);
    
    if (error)
        return exit(error.message);
    
    forEachKey(config, data);
}

async function help() {
    const bin = await import('../json/help');
    const forEachKey = await import('for-each-key');
    const currify = await import('currify');
    const usage = 'Usage: cloudcmd [options]';
    const url = Info.homepage;
    const log = currify((a, b, c) => console.log(a, b, c));
    
    console.log(usage);
    console.log('Options:');
    forEachKey(log('  %s %s'), bin);
    console.log('\nGeneral help using Cloud Commander: <%s>', url);
}

async function repl() {
    console.log('REPL mode enabled (telnet localhost 1337)');
    await import('../server/repl');
}

async function checkUpdate() {
    const load = await import('package-json');
    
    const {version} = await load(Info.name, 'latest');
    await showUpdateInfo(version);
}

async function showUpdateInfo(version) {
    if (version === Info.version)
        return;
    
    const chalk = await import('chalk');
    
    const latestVersion = chalk.green.bold('v' + version);
    const latest = `update available: ${latestVersion}`;
    const current = chalk.dim(`(current: v${Info.version})`);
    
    console.log('%s %s', latest, current);
}

