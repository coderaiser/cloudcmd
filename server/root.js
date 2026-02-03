import mellow from 'mellow';

export default (dir, root, {webToWin = mellow.webToWin} = {}) => {
    return webToWin(dir, root || '/');
};
