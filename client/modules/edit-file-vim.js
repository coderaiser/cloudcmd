'use strict';

/* global CloudCmd */

CloudCmd.EditFileVim = exports;

const Events = require('../dom/events');

const {Key} = CloudCmd;

const ConfigView = {
    bindKeys: false,
    beforeClose: () => {
        Events.rmKey(listener);
        CloudCmd.EditFile.isChanged();
    },
};

module.exports.init = async () => {
    await CloudCmd.EditFile();
};

module.exports.show = () => {
    Events.addKey(listener);
    
    CloudCmd.EditFile
        .show(ConfigView)
        .getEditor()
        .setKeyMap('vim');
};

module.exports.hide = hide;

function hide() {
    CloudCmd.Edit.hide();
}

function listener(event) {
    const {
        keyCode,
        shiftKey,
    } = event;
    
    if (shiftKey && keyCode === Key.ESC) {
        event.preventDefault();
        hide();
    }
}

