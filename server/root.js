import mellow from 'mellow';

export default (dir, root) => {
    return mellow.pathToWin(dir, root || '/');
};

