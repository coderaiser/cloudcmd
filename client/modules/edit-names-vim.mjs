import Events from '#dom/events';

const {CloudCmd} = globalThis;

CloudCmd.EditNamesVim = {
    init,
    show,
    hide,
};
const {Key} = CloudCmd;

const ConfigView = {
    bindKeys: false,
    beforeClose: () => {
        Events.rmKey(listener);
        CloudCmd.EditNames.isChanged();
    },
};

export async function init() {
    await CloudCmd.EditNames();
}

export function show() {
    Events.addKey(listener);
    
    CloudCmd.EditNames
        .show(ConfigView)
        .getEditor()
        .setKeyMap('vim');
}

export function hide() {
    CloudCmd.Edit.hide();
}

function listener(event) {
    const {keyCode, shiftKey} = event;
    
    if (shiftKey && keyCode === Key.ESC) {
        event.preventDefault();
        hide();
    }
}

