'use strict';

/* global CloudCmd */

CloudCmd.EditNamesVim = exports;

const Events = require('../dom/events');
const {Key} = CloudCmd;

const ConfigView = {
    bindKeys: false,
    beforeClose: () => {
        Events.rmKey(listener);
        CloudCmd.EditNames.isChanged();
    },
};

module.exports.init = async () => {
    await CloudCmd.EditNames();
};

module.exports.show = () => {
    Events.addKey(listener);
    
    CloudCmd.EditNames
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

