#!/usr/bin/env node

'use strict';

const fs = require('fs');
const path = require('path');

const dir = path.join(__dirname, '../lib/server');
const _dir = path.join(__dirname, '../legacy/lib/server');

const setDir = (name) => {
    return path.join(_dir, name);
};


fs.readdirSync(dir)
  .map(fillFile)
  .map(writeFile);

function fillFile(name) {
    return {
        name: setDir(name),
        data: `module.exports = require(\'../../../lib_/server/${name}\');`
    }
}

function writeFile({name, data}) {
    return fs.writeFileSync(name, data);
}

