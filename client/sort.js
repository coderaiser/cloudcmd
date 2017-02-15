'use strict';

/* global CloudCmd */
const DOM = require('./dom');

const Info = DOM.CurrentInfo;
const sort = CloudCmd.sort;
const order = CloudCmd.order;
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
    
    CloudCmd.refresh(panel, {
        noCurrent: position !== Info.panelPosition
    });
};

