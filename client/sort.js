'use strict';

/* global CloudCmd */
const DOM = require('./dom');

const Info = DOM.CurrentInfo;

const {
    sort,
    order,
} = CloudCmd;

const position = DOM.getPanelPosition();

let sortPrevious = sort[position];

const {getPanel} = DOM;

CloudCmd.sortPanel = (name, panel = getPanel()) => {
    const position = panel
        .dataset
        .name
        .replace('js-', '');
    
    if (name !== sortPrevious) {
        order[position] = 'asc';
    } else {
        if (order[position] === 'asc')
            order[position] = 'desc';
        else
            order[position] = 'asc';
    }
    
    sortPrevious =
    sort[position] = name;
    
    const noCurrent = position !== Info.panelPosition;
    
    CloudCmd.refresh({
        panel,
        noCurrent,
    });
};

