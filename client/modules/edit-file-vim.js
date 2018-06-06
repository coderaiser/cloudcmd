'use strict';

/* global CloudCmd */

const exec = require('execon');
const Events = require('../dom/events');

const {Key} = CloudCmd;

CloudCmd.EditFileVim = function EditFileVimProto(callback) {
    const EditFileVim = this;
    
    const ConfigView  = {
        bindKeys: false,
        beforeClose: () => {
            Events.rmKey(listener);
            CloudCmd.EditFile.isChanged();
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
    
    function listener(event) {
        const {
            keyCode,
            shiftKey,
        } = event;
        
        if (shiftKey && keyCode === Key.ESC) {
            event.preventDefault();
            EditFileVim.hide();
        }
    }
    
    init(callback);
};

