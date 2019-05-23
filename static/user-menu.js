'use strict';

module.exports = {
    'F2 - Rename file': async ({DOM}) => {
        await DOM.renameCurrent();
    },
    
    'C - Create User Menu File': async ({DOM, CloudCmd}) => {
        const {CurrentInfo} = DOM;
        
        const {dirPath} = CurrentInfo;
        const path = `${dirPath}.cloudcmd.menu.js`;
        const {prefix} = CloudCmd;
        
        const data = await readDefaultMenu({prefix});
        await createDefaultMenu({
            path,
            data,
            DOM,
            CloudCmd,
        });
    },
};

async function createDefaultMenu({path, data, DOM, CloudCmd}) {
    const {IO} = DOM;
    
    await IO.write(path, data);
    await CloudCmd.refresh();
    
    DOM.setCurrentByName('.cloudcmd.menu.js');
    
    await CloudCmd.EditFile.show();
}

async function readDefaultMenu({prefix}) {
    const res = await fetch(`${prefix}/api/v1/user-menu/default`);
    const data = await res.text();
    
    return data;
}

