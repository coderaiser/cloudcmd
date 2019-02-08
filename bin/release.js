#!/usr/bin/env node

'use strict';

const DIR = '../';
const Info = require(DIR + 'package');

const minor = require('minor');
const place = require('place');
const rendy = require('rendy');
const shortdate = require('shortdate');

const ERROR = Error('ERROR: version is missing. release --patch|--minor|--major');

main((error) => {
    if (error)
        console.error(error.message);
});

function main(callback) {
    const history = 'Version history\n---------------\n';
    const link = '//github.com/coderaiser/cloudcmd/releases/tag/';
    const template = '- *{{ date }}*, ' +
                      '**[v{{ version }}]' +
                      '(' + link + 'v{{ version }})**\n';
    
    const {version} = Info;
    
    cl((error, versionNew) => {
        if (error)
            return callback(error);
        
        replaceVersion('README.md', version, versionNew, callback);
        replaceVersion('HELP.md', version, versionNew, () => {
            const historyNew = history + rendy(template, {
                date    : shortdate(),
                version : versionNew,
            });
            
            replaceVersion('HELP.md', history, historyNew, callback);
        });
    });
}

function replaceVersion(name, version, versionNew, callback) {
    place(name, version, versionNew, (error) => {
        if (error)
            return callback(error);
        
        callback(null, 'done: ' + name);
    });
}

function cl(callback) {
    const {argv} = process;
    const length = argv.length - 1;
    const last = process.argv[length];
    const regExp = /^--(major|minor|patch)$/;
    const [, match] = last.match(regExp) || [];
    
    if (!regExp.test(last))
        return callback(ERROR);
    
    callback(null, getVersionNew(last, match));
}

function getVersionNew(last, match) {
    if (match)
        return minor(match, Info.version);
    
    return last.substr(3);
}

