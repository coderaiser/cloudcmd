#!/usr/bin/env node

import {createRequire} from 'node:module';
import {promisify} from 'node:util';
import tryToCatch from 'try-to-catch';
import {createSimport} from 'simport';
import process from 'node:process';
import exit from '../server/exit.js';
import {
    createConfig,
    configPath,
} from '../server/config.js';
import env from '../server/env.js';
import prefixer from '../server/prefixer.js';

process.on('unhandledRejection', exit);

const require = createRequire(import.meta.url);

const yargs = require('yargs');
const Info = require('../package.json');

const simport = createSimport(import.meta.url);

const config = createConfig({
    configPath,
});

const DIR_SERVER = '../server/';

const maybeRoot = (a) => {
    if (a === '.')
        return process.cwd();
    
    return a;
};

main();

async function main() {
    const args = yargs
        .parserConfiguration({
            'strip-aliased': true,
            'strip-dashed': true,
        })
        .help()
        .version(`v${Info.version}`) // startup behavior
        .option('server', {
            describe: 'Start server',
            default: true,
            type: 'boolean',
        })
        .option('open', {
            describe: 'Open web browser when server starts',
            default: env.bool('open') ?? config('open'),
            type: 'boolean',
        }) // http server config
        .option('listen', {
            describe:
                'Set listening address, must be a valid URL' +
                ' of format tcp://<hostname>[:<port>] or unix:<path>' +
                ' (overrides --port)',
            default: env('listen') ?? config('listen'),
            type: 'string',
        })
        .option('port', {
            describe: 'Set port number',
            default: config('port'),
            type: 'number',
        })
        .option('prefix', {
            describe: 'Set routed URL path prefix (http://<host>/<prefix>)',
            default: env('prefix') ?? config('prefix'),
            type: 'string',
        })
        .option('prefix-socket', {
            describe: 'Set routed WebSocket URL path prefix (ws://<host>/<prefix>)',
            default: config('prefixSocket'),
            type: 'string',
        }) // logging
        .option('log', {
            describe: 'Enable logging',
            default: config('log'),
            type: 'boolean',
        }) // config mgmt
        .option('config', {
            alias: 'c',
            describe: 'Configuration file path',
            default: undefined,
            type: 'string',
        })
        .option('show-config', {
            describe: 'Show config values',
            default: undefined,
            type: 'boolean',
        })
        .option('save', {
            alias: 's',
            describe: 'Save configuration',
            default: undefined,
            type: 'boolean',
        })
        .option('import', {
            describe: 'Enable import of config',
            default: env.bool('import') ?? config('import'),
            type: 'boolean',
        })
        .option('import-listen', {
            describe: 'Enable listen on config updates from import server',
            default: env.bool('import_listen') ?? config('importListen'),
            type: 'boolean',
        })
        .option('import-url', {
            describe: 'Url of export server to connect to',
            default: env('import_url') || config('importUrl'),
            type: 'string',
        })
        .option('import-token', {
            describe: 'Authorization token used to connect to export server',
            default: env('import_token') || config('importToken'),
            type: 'string',
        })
        .option('export', {
            describe: 'Enable export of config through a server',
            default: env.bool('export') ?? config('export'),
            type: 'boolean',
        })
        .option('export-token', {
            describe: 'Authorization token used by export server',
            default: env('export_token') || config('exportToken'),
            type: 'string',
        }) // repl mode
        .option('repl', {
            describe: 'Enable REPL mode (telnet localhost 1337)',
            default: false,
            type: 'boolean',
        }) // auth
        .option('auth', {
            alias: 'a',
            describe: 'Enable authorization',
            default: env.bool('auth') ?? config('auth'),
            type: 'boolean',
        })
        .option('username', {
            alias: 'u',
            describe: 'Set username',
            default: env('username') || config('username'),
            type: 'string',
        })
        .option('password', {
            alias: 'p',
            describe: 'Set password',
            default: undefined,
            type: 'string',
        }) // UI
        .option('name', {
            describe: '[UI] set tab name in web browser',
            default: env('name') ?? config('name'),
            type: 'string',
        })
        .option('editor', {
            describe: '[UI] set editor',
            default: env('editor') || config('editor'),
            choices: [
                'dword',
                'edward',
                'deepword',
            ],
        })
        .option('columns', {
            describe: '[UI] set visible columns',
            default: env('columns') || config('columns') || '',
            type: 'string',
        })
        .option('one-file-panel', {
            describe: '[UI] show one file panel instead of two',
            default: env.bool('one_file_panel') ?? config('oneFilePanel'),
            type: 'boolean',
        })
        .option('config-dialog', {
            describe: '[UI] enable config dialog',
            default: env.bool('config_dialog') ?? config('configDialog'),
            type: 'boolean',
        })
        .option('config-auth', {
            describe: '[UI] enable auth change in config dialog',
            default: env.bool('config_auth') ?? config('configAuth'),
            type: 'boolean',
        })
        .option('keys-panel', {
            describe: '[UI] show keys panel',
            default: env.bool('keys_panel') || config('keysPanel'),
            type: 'boolean',
        })
        .option('confirm-copy', {
            describe: '[UI] confirm copy',
            default: env.bool('confirm_copy') ?? config('confirmCopy'),
            type: 'boolean',
        })
        .option('confirm-move', {
            describe: '[UI] confirm move',
            default: env.bool('confirm_move') ?? config('confirmMove'),
            type: 'boolean',
        })
        .option('show-file-name', {
            describe: '[UI] show file name in view and edit',
            default: env.bool('show_file_name') ?? config('showFileName'),
            type: 'boolean',
        })
        .option('vim', {
            describe: '[UI] enable vim hot keys',
            default: env.bool('vim') ?? config('vim'),
            type: 'boolean',
        }) // file transfer
        .option('packer', {
            describe: 'Set packer',
            default: config('packer') || 'tar',
            choices: ['tar', 'zip'],
            type: 'string',
        })
        .option('root', {
            describe: 'Set root directory available to client',
            default: env('root') ?? config('root'),
            type: 'string',
        })
        .coerce('root', maybeRoot)
        .option('online', {
            alias: 'o',
            describe: 'Load scripts from remote servers',
            default: config('online'),
            type: 'boolean',
        }) // terminal
        .option('terminal', {
            describe: 'Enable terminal',
            default: env.bool('terminal') ?? config('terminal'),
            type: 'boolean',
        })
        .option('terminal-auto-restart', {
            describe: 'Restart command on exit',
            default: env.bool('terminal_auto_restart') ?? config('terminalAutoRestart'),
            type: 'boolean',
        })
        .option('terminal-path', {
            describe: 'Set terminal initial working directory',
            default: env('terminal_path') || config('terminalPath'),
            type: 'string',
        })
        .option('terminal-command', {
            describe: 'Set command to run in terminal (shell by default)',
            default: env('terminal_command') || config('terminalCommand'),
            type: 'string',
        }) // console
        .option('console', {
            describe: 'Enable console',
            default: env.bool('console') ?? config('console'),
            type: 'boolean',
        })
        .option('sync-console-path', {
            describe: 'Sync console path',
            default: env.bool('sync_console_path') ?? config('syncConsolePath'),
            type: 'boolean',
        }) // contact
        .option('contact', {
            describe: 'Enable contact',
            default: env.bool('contact') ?? config('contact'),
            type: 'boolean',
        }) // dropbox integration
        .option('dropbox', {
            describe: 'Enable dropbox integration',
            default: config('dropbox'),
            type: 'boolean',
        })
        .option('dropbox-token', {
            describe: 'Set dropbox token',
            default: config('dropboxToken') || '',
            type: 'string',
        }) // misc
        .option('color', {
            default: undefined,
            type: 'boolean',
        })
        .option('zip', {
            default: config('zip'),
            type: 'boolean',
        })
        .argv;
    
    if (args.repl)
        repl();
    
    config('listen', args.listen);
    config('port', args.port);
    
    config('name', args.name);
    config('auth', args.auth);
    config('online', args.online);
    config('open', args.open);
    config('username', args.username);
    config('console', args.console);
    config('syncConsolePath', args.syncConsolePath);
    config('showFileName', args.showFileName);
    config('contact', args.contact);
    config('terminal', args.terminal);
    config('terminalPath', args.terminalPath);
    config('terminalCommand', args.terminalCommand);
    config('terminalAutoRestart', args.terminalAutoRestart);
    config('editor', args.editor);
    config('prefix', prefixer(args.prefix));
    config('prefixSocket', prefixer(args.prefixSocket));
    config('root', args.root || '/');
    config('vim', args.vim);
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
    };
    
    const password = env('password') ?? args.password;
    
    if (password)
        config('password', await getPassword(password));
    
    await validateRoot(options.root, config);
    
    if (args.showConfig)
        await showConfig();
    
    const distribute = await simport('../server/distribute/index.js');
    const importConfig = promisify(distribute.import);
    
    if (args.server) {
        const listen_uri = new URL(process.env.LISTEN ?? config('listen') ?? `tcp://${process.env.IP ?? config('ip') ?? 'localhost'}` + `:${process.env.PORT ?? config('port') ?? 8000}`);
        
        await start(listen_uri, options, config);
    }
    
    if (args.save)
        config.write();
    
    await tryToCatch(checkUpdate);
    await importConfig(config);
}

async function validateRoot(root, config) {
    const validate = await simport(`${DIR_SERVER}validate.js`);
    validate.root(root, config);
    
    if (root === '/')
        return;
    
    console.log(`root: ${root}`);
}

async function getPassword(password) {
    const criton = await simport('criton');
    return criton(password, config('algo'));
}

async function start(listen_uri, options, config) {
    const SERVER = `${DIR_SERVER}server.mjs`;
    const server = await simport(SERVER);
    
    server(listen_uri, options, config);
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
