/* global CloudCmd */

import capitalize from 'just-capitalize';

import Dialog from '../dialog.js';
import Storage from '../storage.js';
import RESTful from '../rest.js';
import {isCurrentFile, getCurrentName, getCurrentFile, getCurrentByName, getCurrentType, getCurrentDirPath, setCurrentName} from '../current-file.js';

export default async (current) => {
    if (!isCurrentFile(current))
        current = getCurrentFile();
    
    const from = getCurrentName(current);
    
    if (from === '..')
        return Dialog.alert.noFiles();
    
    const [cancel, to] = await Dialog.prompt('Rename', from);
    
    if (cancel)
        return;
    
    const nextFile = getCurrentByName(to);
    
    if (nextFile) {
        const type = getCurrentType(nextFile);
        const msg = `${capitalize(type)} "${to}" already exists. Proceed?`;
        const [cancel] = await Dialog.confirm(msg);
        
        if (cancel)
            return;
    }
    
    if (from === to)
        return;
    
    const dirPath = getCurrentDirPath();
    
    const fromFull = `${dirPath}${from}`;
    const toFull = `${dirPath}${to}`;
    
    const [e] = await RESTful.rename(fromFull, toFull);
    
    if (e)
        return;
    
    setCurrentName(to, current);
    
    Storage.remove(dirPath);
    CloudCmd.refresh();
};

