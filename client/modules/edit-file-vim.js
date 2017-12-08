'use strict';

/* global CloudCmd */

const exec = require('execon');
const Key = CloudCmd.Key;

const Events = require('../dom/events');

CloudCmd.EditFileVim = function EditFileVimProto(callback) {
    const EditFileVim = this;
    
    const ConfigView  = {
        bindKeys: false,
        beforeClose: () => {
            Events.rmKey(listener);
        }
    };
    
    function init(callback) {
        exec.series([
            CloudCmd.EditFile,
            callback || EditFileVim.show,
        ]);
    }
    
    this.show = () => {
        Events.addKey(listener);
        
        CloudCmd.EditFile
            .show(ConfigView)
            .getEditor()
            .setKeyMap('vim');
    };
    
    this.hide = () => {
        CloudCmd.Edit.hide();
    };
    
    function listener({keyCode, shiftKey}) {
        if (shiftKey && keyCode === Key.ESC)
            EditFileVim.hide();
    }
    
    init(callback);
};

