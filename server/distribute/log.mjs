import wraptile from 'wraptile';
import chalk from 'chalk';
import datetime from '../../common/datetime.js';

const {assign} = Object;

const log = (isLog, name, msg) => isLog && console.log(`${datetime()} -> ${name}: ${msg}`);

export const makeColor = (a) => chalk.blue(a);
export const getMessage = (e) => e.message || e;
export const getDescription = (e) => e.message;

export default log;

export const logWrapped = wraptile(log);

export const importStr = 'import';
export const exportStr = 'export';
export const connectedStr = chalk.green('connected');
export const disconnectedStr = chalk.red('disconnected');
export const tokenRejectedStr = chalk.red('token rejected');
export const authTryStr = chalk.yellow('try to auth');

export function stringToRGB(a) {
    return [
        a.charCodeAt(0),
        a.length,
        crc(a),
    ];
}

const add = (a, b) => a + b.charCodeAt(0);

function crc(a) {
    return a
        .split('')
        .reduce(add, 0);
}

assign(log, {
    getMessage,
    makeColor,
    getDescription,
    authTryStr,
    stringToRGB,
    logWrapped,
    importStr,
    exportStr,
    connectedStr,
    disconnectedStr,
    tokenRejectedStr,
});
