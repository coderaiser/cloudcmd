'use strict';

module.exports = {
    'F2 - Rename file': async ({DOM}) => {
        await DOM.renameCurrent();
    },
    'L - Lint': async ({CloudCmd}) => {
        const {TerminalRun} = CloudCmd;
        await run(TerminalRun, 'npm run lint');
    },
    'F - Fix Lint': async ({CloudCmd}) => {
        const {TerminalRun} = CloudCmd;
        await run(TerminalRun, 'npm run fix:lint');
    },
    'T - Test': async ({CloudCmd}) => {
        const {TerminalRun} = CloudCmd;
        
        await run(TerminalRun, 'npm run test');
    },
    'C - Coverage': async ({CloudCmd}) => {
        const {TerminalRun} = CloudCmd;
        
        await run(TerminalRun, 'npm run coverage');
    },
    'D - Build Dev': async ({CloudCmd}) => {
        const {TerminalRun} = CloudCmd;
        
        await run(TerminalRun, 'npm run build:client:dev');
        CloudCmd.refresh();
    },
    'P - Build Prod': async ({CloudCmd}) => {
        const {TerminalRun} = CloudCmd;
        
        await run(TerminalRun, 'npm run build:client');
        CloudCmd.refresh();
    },
};

async function run(TerminalRun, command) {
    await TerminalRun.show({
        command,
        closeMessage: 'Press any key to close Terminal',
        autoClose: false,
    });
}

