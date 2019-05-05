'use strict';

module.exports = {
    'F2 - Rename file': async ({DOM}) => {
        await DOM.renameCurrent();
    },
    'D - Build Dev': async ({CloudCmd}) => {
        await CloudCmd.TerminalRun.show({
            command: 'npm run build:client:dev',
            autoClose: false,
            closeMessage: 'Press any button to close Terminal',
        });
        
        CloudCmd.refresh();
    },
    'P - Build Prod': async ({CloudCmd}) => {
        await CloudCmd.TerminalRun.show({
            command: 'npm run build:client',
            autoClose: true,
        });
        
        CloudCmd.refresh();
    },
};

