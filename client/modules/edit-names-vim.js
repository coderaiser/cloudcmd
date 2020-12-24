/* global CloudCmd */

CloudCmd.EditNamesVim = exports;

import Events from '../dom/events.js';
const {Key} = CloudCmd;

const ConfigView = {
    bindKeys: false,
    beforeClose: () => {
        Events.rmKey(listener);
        CloudCmd.EditNames.isChanged();
    },
};

export const init = async () => {
    await CloudCmd.EditNames();
};

export const show = () => {
    Events.addKey(listener);
    
    CloudCmd.EditNames
        .show(ConfigView)
        .getEditor()
        .setKeyMap('vim');
};

export function hide() {
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

