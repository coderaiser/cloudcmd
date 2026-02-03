import '../../css/terminal.css';
import {promisify} from 'es6-promisify';
import {tryToCatch} from 'try-to-catch';
import {fullstore} from 'fullstore';
import exec from 'execon';
import load from 'load.js';
import DOM from '#dom';
import * as Images from '#dom/images';

const {Dialog} = DOM;
const {CloudCmd} = globalThis;
const {Key, config} = CloudCmd;

CloudCmd.TerminalRun = {
    init,
    show,
    hide,
};

let Loaded;
let Terminal;
let Socket;

const exitCodeStore = fullstore();

const loadAll = async () => {
    const {prefix} = CloudCmd;
    
    const prefixGritty = getPrefix();
    const js = `${prefixGritty}/gritty.js`;
    const css = `${prefix}/dist/terminal.css`;
    
    const [e] = await tryToCatch(load.parallel, [js, css]);
    
    if (e) {
        const src = e.target.src.replace(globalThis.location.href, '');
        return Dialog.alert(`file ${src} could not be loaded`);
    }
    
    Loaded = true;
};

export async function init() {
    if (!config('terminal'))
        return;
    
    Images.show.load('top');
    
    await CloudCmd.View();
    await loadAll();
}

export async function show(options = {}) {
    await runTerminal(options);
}

const runTerminal = promisify((options, fn) => {
    if (!Loaded)
        return fn(null, -1);
    
    if (!config('terminal'))
        return;
    
    create(options);
    
    CloudCmd.View.show(Terminal.element, {
        afterShow: () => {
            Terminal.focus();
        },
        afterClose: (/* exec.series args */) => {
            fn(null, exitCodeStore());
        },
    });
});

export function hide() {
    CloudCmd.View.hide();
}

const getPrefix = () => CloudCmd.prefix + '/gritty';

function getPrefixSocket() {
    return CloudCmd.prefixSocket + '/gritty';
}

const getEnv = () => ({
    ACTIVE_DIR: DOM.getCurrentDirPath,
    PASSIVE_DIR: DOM.getNotCurrentDirPath,
    CURRENT_NAME: DOM.getCurrentName,
    CURRENT_PATH: DOM.getCurrentPath,
});

function create(createOptions) {
    const {
        cwd = DOM.getCurrentDirPath(),
        command,
        autoClose,
        closeMessage = 'Press any key to close Terminal...',
    } = createOptions;
    
    const options = {
        cwd,
        env: getEnv(),
        prefix: getPrefixSocket(),
        socketPath: CloudCmd.prefix,
        fontFamily: 'Droid Sans Mono',
        command,
        autoRestart: false,
    };
    
    let commandExit = false;
    
    const {socket, terminal} = globalThis.gritty(document.body, options);
    
    Socket = socket;
    Terminal = terminal;
    
    Terminal.onKey(({domEvent}) => {
        const {keyCode, shiftKey} = domEvent;
        
        if (commandExit)
            hide();
        
        if (shiftKey && keyCode === Key.ESC)
            hide();
    });
    
    Socket.on('exit', (code) => {
        exitCodeStore(code);
        
        if (autoClose)
            return hide();
        
        terminal.write(`\n${closeMessage}`);
        commandExit = true;
    });
    
    Socket.on('connect', exec.with(authCheck, socket));
}

function authCheck(spawn) {
    spawn.emit('auth', config('username'), config('password'));
    
    spawn.on('reject', () => {
        Dialog.alert('Wrong credentials!');
    });
}
