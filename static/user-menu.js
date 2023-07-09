'use strict';

const RENAME_FILE = 'Rename file';
const CDN = 'https://cdn.jsdelivr.net/gh/cloudcmd/user-menu@1.2.4';

module.exports = {
    '__settings': {
        select: [RENAME_FILE],
        run: false,
    },
    [`F2 - ${RENAME_FILE}`]: async ({DOM}) => {
        await DOM.renameCurrent();
    },
    
    'F6 - Copy URL to current file': async ({DOM}) => {
        const {copyURLToCurrentFile} = await import(`${CDN}/menu/copy-url-to-current-file.js`);
        
        await copyURLToCurrentFile({
            DOM,
        });
    },
    
    'R - cd /': async ({CloudCmd}) => {
        await CloudCmd.changeDir('/');
    },
    'Y - Convert YouTube to MP3': async ({CloudCmd, DOM}) => {
        const {convertYouTubeToMp3} = await import(`${CDN}/menu/convert-youtube-to-mp3.js`);
        
        await convertYouTubeToMp3({
            CloudCmd,
            DOM,
        });
    },
    
    'F - Convert flac to mp3 [ffmpeg]': async ({CloudCmd, DOM}) => {
        const {convertFlacToMp3} = await import(`${CDN}/menu/ffmpeg.js`);
        
        await convertFlacToMp3({
            CloudCmd,
            DOM,
        });
    },
    'M - Convert mp4 to mp3 [ffmpeg]': async ({CloudCmd, DOM}) => {
        const {convertMp4ToMp3} = await import(`${CDN}/menu/ffmpeg.js`);
        
        await convertMp4ToMp3({
            CloudCmd,
            DOM,
        });
    },
    
    'O - Convert mov to mp3 [ffmpeg]': async ({CloudCmd, DOM}) => {
        const {convertMovToMp3} = await import(`${CDN}/menu/ffmpeg.js`);
        
        await convertMovToMp3({
            CloudCmd,
            DOM,
        });
    },
    
    'C - Create User Menu File': async ({DOM, CloudCmd}) => {
        const {Dialog, CurrentInfo} = DOM;
        
        const currentFile = DOM.getCurrentByName('.cloudcmd.menu.js');
        
        if (currentFile) {
            const [cancel] = await Dialog.confirm(`Looks like file '.cloudcmd.menu.js' already exists. Overwrite?`);
            
            if (cancel)
                return;
        }
        
        const {dirPath} = CurrentInfo;
        const path = `${dirPath}.cloudcmd.menu.js`;
        const {prefix} = CloudCmd;
        
        const data = await readDefaultMenu({
            prefix,
        });
        
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
