export default {
    'F2 - Rename File': renameCurrent,
    'L - Lint': run('npm run lint'),
    'F - Fix Lint': run('npm run fix:lint'),
    'T - Test': run('npm run test'),
    'C - Coverage': run('npm run coverage'),
    'D - Build Dev': run('npm run build:client:dev'),
    'P - Build Prod': run('npm run build:client'),
};

async function renameCurrent(DOM) {
    await DOM.renameCurrent();
}

function run(command) {
    return async ({CloudCmd, DOM}) => {
        const {TerminalRun, config} = CloudCmd;
        
        const {CurrentInfo} = DOM;
        const {dirPath} = CurrentInfo;
        
        const cwd = config('root') + dirPath;
        
        return await TerminalRun.show({
            cwd,
            command,
            closeMessage: 'Press any key to close Terminal',
            autoClose: false,
        });
    };
}
