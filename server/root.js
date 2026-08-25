import path from 'node:path';
import mellow from 'mellow';

const rootFn = (dir, root, {webToWin = mellow.webToWin} = {}) => {
    return webToWin(dir, root || '/');
};

rootFn.resolve = (dir, rootDir) => {
    const normalizedRoot = path.normalize(rootDir);
    const resolved = rootFn(dir, normalizedRoot);
    
    const sep = normalizedRoot.endsWith(path.sep) ? '' : path.sep;
    
    if (resolved !== normalizedRoot && !resolved.startsWith(normalizedRoot + sep))
        throw Error(`Path ${resolved} beyond root ${normalizedRoot}!`);
    
    return resolved;
};

export default rootFn;
