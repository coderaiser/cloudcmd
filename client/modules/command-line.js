'use strict';

/* global CloudCmd */
CloudCmd.CommandLine = exports;

const Dialog = require('../dom/dialog');

const noop = () => {};

module.exports.init = noop;

module.exports.show = show;
module.exports.hide = hide;

async function show() {
    const [, cmd] = await Dialog.prompt('Command Line', '');
    const TERMINAL = '^(t|terminal)';
    
    if (RegExp(`${TERMINAL}$`).test(cmd)) {
        return await CloudCmd.Terminal.show();
    }
    
    if (RegExp(TERMINAL).test(cmd)) {
        const command = cmd.replace(RegExp(`${TERMINAL} `), '');
        const exitCode = await CloudCmd.TerminalRun.show({
            command: `bash -c '${command}'`,
        });
        
        if (exitCode === -1)
            await Dialog.alert(`☝️ Looks like Terminal is disabled, start Cloud Coammnder with '--terminal' flag.`);
        
        return;
    }
}

function hide() {}
