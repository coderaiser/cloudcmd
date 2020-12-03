'use strict';

const RENAME_FILE = 'Rename file';

module.exports = {
    '__settings': {
        select: [
            RENAME_FILE,
        ],
        run: false,
    },
    [`F2 - ${RENAME_FILE}`]: async ({DOM}) => {
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
    'D - Compare directories': ({DOM}) => {
        const {
            CurrentInfo,
            getFilenames,
            getCurrentByName,
            selectFile,
        } = DOM;
        
        const {
            files,
            filesPassive,
            panel,
            panelPassive,
        } = CurrentInfo;
        
        const names = getFilenames(files);
        const namesPassive = getFilenames(filesPassive);
        
        const selectedNames = compare(names, namesPassive);
        const selectedNamesPassive = compare(namesPassive, names);
        
        selectNames(selectedNames, panel, {
            selectFile,
            getCurrentByName,
        });
        
        selectNames(selectedNamesPassive, panelPassive, {
            selectFile,
            getCurrentByName,
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

module.exports._selectNames = selectNames;
function selectNames(names, panel, {selectFile, getCurrentByName}) {
    for (const name of names) {
        const file = getCurrentByName(name, panel);
        selectFile(file);
    }
}

module.exports._compare = compare;
function compare(a, b) {
    const result = [];
    
    for (const el of a) {
        if (b.includes(el))
            continue;
        
        result.push(el);
    }
    
    return result;
}

