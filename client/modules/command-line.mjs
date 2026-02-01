/* global CloudCmd */
import * as Dialog from '#dom/dialog';

export const init = () => {};

CloudCmd.CommandLine = {
    init,
    show,
    hide,
};

export async function show() {
    const [, cmd] = await Dialog.prompt('Command Line', '');
    const TERMINAL = '^(t|terminal)';
    
    if (RegExp(`${TERMINAL}$`).test(cmd))
        return await CloudCmd.Terminal.show();
    
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

export function hide() {}
