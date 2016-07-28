#!/usr/bin/env node

'use strict';

const   DIR         = '../';
const   Info        = require(DIR + 'package');

const   minor       = require('minor');
const   place       = require('place');
const   rendy       = require('rendy');
const   shortdate   = require('shortdate');

const   ERROR   = Error('ERROR: version is missing. release --patch|--minor|--major');

main((error) => {
    if (error)
        console.error(error.message);
});

function main(callback) {
    const history     = 'Version history\n---------------\n';
    const link        = '//github.com/coderaiser/cloudcmd/releases/tag/';
    const template    = '- *{{ date }}*, '  +
                      '**[v{{ version }}]'  +
                      '(' + link + 'v{{ version }})**\n';
    
    const version     = Info.version;
    
    cl((error, versionNew) => {
        if (error) {
            callback(error);
        } else {
            replaceVersion('README.md', version, versionNew, callback);
            replaceVersion('HELP.md', version, versionNew, function() {
                const historyNew = history + rendy(template, {
                    date    : shortdate(),
                    version : versionNew
                });
                
                replaceVersion('HELP.md', history, historyNew, callback);
            });
        }
    });
}

function replaceVersion(name, version, versionNew, callback) {
    place(name, version, versionNew, (error) => {
        let msg;
        
        if (!error)
            msg = 'done: ' + name;
        
        callback(error, msg);
    });
}

function cl(callback) {
    const argv        = process.argv;
    const length      = argv.length - 1;
    const last        = process.argv[length];
    const regExp      = /^--(major|minor|patch)$/;
    const [, match]   = last.match(regExp) || [];
    
    let error;
    let versionNew;
    
    if (!regExp.test(last))
        error = ERROR;
    else if (match)
        versionNew  = minor(match, Info.version);
    else
        versionNew  = last.substr(3);
    
    callback(error, versionNew);
}

