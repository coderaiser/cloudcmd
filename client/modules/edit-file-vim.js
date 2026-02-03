import * as Events from '#dom/events';

const {CloudCmd} = globalThis;

CloudCmd.EditFileVim = {
    init,
    show,
    hide,
};

const {Key} = CloudCmd;

const ConfigView = {
    bindKeys: false,
    beforeClose: () => {
        Events.rmKey(listener);
        CloudCmd.EditFile.isChanged();
    },
};

export async function init() {
    await CloudCmd.EditFile();
}

export async function show() {
    Events.addKey(listener);
    
    const editFile = await CloudCmd.EditFile.show(ConfigView);
    
    editFile
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
