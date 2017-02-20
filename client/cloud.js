/* global CloudCmd, filepicker */

'use strict';

CloudCmd.Cloud = CloudProto;

const exec = require('execon');

const load = require('./load');
const Files = require('./files');
const {Images} = require('./dom');

const Util = require('../common/util');

function CloudProto(callback) {
    exec.series([
        loadFiles,
        callback,
    ]);
    
    return module.exports;
}

module.exports.uploadFile = (filename, data) => {
    const {log} = CloudCmd;
    const mimetype = '';
    
    filepicker.store(data, {
        mimetype,
        filename,
    }, (fpFile) => {
        log(fpFile);
        filepicker.exportFile(fpFile, log, log);
    });
};

module.exports.saveFile = (callback) => {
    filepicker.pick((fpFile) => {
        console.log(fpFile);
        const {url} = fpFile;
        const responseType = 'arraybuffer';
        const success = exec.with(callback, fpFile.filename);
        
        load.ajax({
            url,
            responseType,
            success,
        });
    });
};

function loadFiles(callback) {
    Util.time('filepicker load');
    
    load.js('//api.filepicker.io/v1/filepicker.js', () => {
        Files.get('modules', (error, modules) => {
            const storage = Util.findObjByNameInArr(modules, 'storage');
            const picker = Util.findObjByNameInArr(storage, 'FilePicker');
            const key = picker && picker.key;
            
            filepicker.setKey(key);
            
            Images.hide();
            Util.timeEnd('filepicker loaded');
            exec(callback);
        });
    });
}

