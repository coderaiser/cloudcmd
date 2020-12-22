import wraptile from 'wraptile';
import chalk from 'chalk';

import datetime from '../../common/datetime.js';

const log = (isLog, name, msg) => isLog && console.log(`${datetime()} -> ${name}: ${msg}`);
export const makeColor = (a, color) => chalk.rgb(color || stringToRGB(a))(a);
export const getMessage = (e) => e.message || e;
export const getDescription = (e) => `${e.type}: ${e.description}`;

export default log;
export const logWraped = wraptile(log);

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

const add = (a, b) => {
    return a + b.charCodeAt(0);
};

function crc(a) {
    return a
        .split('')
        .reduce(add, 0);
}

