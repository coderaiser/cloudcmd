'use strict';

const path = require('path');
const readFilesSync = require('@cloudcmd/read-files-sync');
const templatePath = path.join(__dirname, '..', 'tmpl/fs');

module.exports = readFilesSync(templatePath, 'utf8');

