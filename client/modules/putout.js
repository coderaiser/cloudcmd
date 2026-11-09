import * as putout from '@putout/bundle';
import * as processorHtml from '@putout/processor-html';

const noop = () => {};
const {CloudCmd} = globalThis;

globalThis.CloudCmdPutout = {
    putout,
    processorHtml,
};

CloudCmd.Putout = {
    init: noop,
};
