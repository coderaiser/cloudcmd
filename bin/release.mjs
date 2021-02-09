#!/usr/bin/env node

import {promisify} from 'util';

import tryToCatch from 'try-to-catch';
import {createSimport} from 'simport';
import minor from 'minor';
import _place from 'place';
import rendy from 'rendy';
import shortdate from 'shortdate';

const simport = createSimport(import.meta.url);
const place = promisify(_place);

const Info = await simport('../package.json');

await main();

async function main() {
    const history = '## Version history\n\n';
    const link = '//github.com/coderaiser/cloudcmd/releases/tag/';
    const template = '- *{{ date }}*, ' +
                      '**[v{{ version }}]' +
                      '(' + link + 'v{{ version }})**\n';
    
    const {version} = Info;
    
    const [error, versionNew] = await tryToCatch(cl);
    
    if (error)
        return console.error(error);
    
    await replaceVersion('README.md', version, versionNew);
    await replaceVersion('HELP.md', version, versionNew);
    
    const historyNew = history + rendy(template, {
        date    : shortdate(),
        version : versionNew,
    });
    
    await replaceVersion('HELP.md', history, historyNew);
}

async function replaceVersion(name, version, versionNew) {
    const [error] = await tryToCatch(place, name, version, versionNew);
    
    if (error)
        return console.error(error);
    
    console.log('done: ' + name);
}

async function cl() {
    const {argv} = process;
    const length = argv.length - 1;
    const last = process.argv[length];
    const regExp = /^--(major|minor|patch)$/;
    const [, match] = last.match(regExp) || [];
    
    console.log(last);
    
    if (!regExp.test(last))
        throw Error('ERROR: version is missing. release --patch|--minor|--major');
    
    return getVersionNew(last, match);
}

function getVersionNew(last, match) {
    if (match)
        return minor(match, Info.version);
    
    return last.substr(3);
}

