/* global CloudCmd, filepicker */

'use strict';

const exec = require('execon');
const currify = require('currify/legacy');
const {promisify} = require('es6-promisify');
const loadJS = promisify(require('load.js').js);

const {log} = CloudCmd;

const {ajax} = require('../dom/load');
const Files = require('../dom/files');
const Images = require('../dom/images');

const upload = currify(_upload);

const Name = 'Cloud';
CloudCmd[Name] = module.exports;

module.exports.init = async () => {
    const [modules] = await loadFiles();
    const {key} = modules.data.FilePicker;
    
    filepicker.setKey(key);
    Images.hide();
};

module.exports.uploadFile = (filename, data) => {
    const mimetype = '';
    
    filepicker.store(data, {
        mimetype,
        filename,
    }, (fpFile) => {
        filepicker.exportFile(fpFile, log, log);
    });
};

module.exports.saveFile = (callback) => {
    filepicker.pick(upload(callback));
};

function _upload(callback, file) {
    const {
        url,
        filename,
    } = file;
    
    const responseType = 'arraybuffer';
    const success = exec.with(callback, filename);
    
    ajax({
        url,
        responseType,
        success,
    });
}

async function loadFiles() {
    const js = '//api.filepicker.io/v2/filepicker.js';
    
    return Promise.all([
        Files.get('modules'),
        loadJS(js),
    ]);
}

