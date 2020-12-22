import format from 'format-io';
import readjson from 'readjson';

const infoPath = new URL('../../package.json', import.meta.url);
const {version} = await readjson(infoPath);

const getMemory = () => {
    const {rss} = process.memoryUsage();
    return format.size(rss);
};

export default (prefix) => ({
    version,
    prefix,
    memory: getMemory(),
});

