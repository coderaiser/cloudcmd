import process from 'node:process';
import format from 'format-io';
import info from '../../package.json' with {
    type: 'json',
};

const {version} = info;

const getMemory = () => {
    const {rss} = process.memoryUsage();
    return format.size(rss);
};

export default (prefix) => ({
    version,
    prefix,
    memory: getMemory(),
});
