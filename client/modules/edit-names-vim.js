'use strict';

/* global CloudCmd */

const exec = require('execon');
const Events = require('../dom/events');

const {Key} = CloudCmd;

CloudCmd.EditNamesVim = function EditNamesVimProto(callback) {
    const EditNamesVim = this;
    
    const ConfigView  = {
        bindKeys: false,
        beforeClose: () => {
            Events.rmKey(listener);
            CloudCmd.EditNames.isChanged();
        }
    };
    
    function init(callback) {
        exec.series([
            CloudCmd.EditNames,
            callback || EditNamesVim.show,
        ]);
    }
    
    this.show = () => {
        Events.addKey(listener);
        
        CloudCmd.EditNames
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
            EditNamesVim.hide();
        }
    }
    
    init(callback);
};

