/* global CloudCmd */
/* global DOM */
import olark from '@cloudcmd/olark';
import * as Images from '#dom/images';

CloudCmd.Contact = {
    init,
    show,
    hide,
};

const {Events} = DOM;
const {Key} = CloudCmd;

export function init() {
    Events.addKey(onKey);
    
    olark.identify('6216-545-10-4223');
    olark('api.box.onExpand', show);
    olark('api.box.onShow', show);
    olark('api.box.onShrink', hide);
}

export function show() {
    Key.unsetBind();
    Images.hide();
    
    olark('api.box.expand');
}

export function hide() {
    Key.setBind();
    olark('api.box.hide');
}

function onKey({keyCode}) {
    if (keyCode === Key.ESC)
        hide();
}
