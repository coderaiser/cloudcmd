import {getExt} from '#common/util';

export const removeExtension = (name) => {
    const ext = getExtension(name);
    
    return name.replace(ext, '');
};

function getExtension(name) {
    if (name.endsWith('.tar.gz'))
        return '.tar.gz';
    
    if (name.endsWith('.tar.bz2'))
        return '.tar.bz2';
    
    return getExt(name);
}
