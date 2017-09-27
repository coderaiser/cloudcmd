'use strict';

const fs = require('fs');
const join = require('path').join;

const DIR = __dirname + '/../';
const DIR_TMPL = DIR + 'tmpl/';
const DIR_FS = DIR_TMPL + 'fs/';

const TMPL_PATH   = [
    'file',
    'panel',
    'path',
    'pathLink',
    'link',
];

module.exports = () => {
    const templates = {};
    
    TMPL_PATH.forEach((name) => {
        const path = join(DIR_FS, `${name}.hbs`);
        templates[name] = fs.readFileSync(path, 'utf8');
    });
    
    return templates;
};

