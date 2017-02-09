'use strict';

/* global CloudCmd */
const DOM = require('./dom');

var Info = DOM.CurrentInfo;
var sort = CloudCmd.sort;
var order = CloudCmd.order;
var position = DOM.getPanelPosition();
var sortPrevious = sort[position];

CloudCmd.sortPanel = function(name, panel) {
    panel = panel || DOM.getPanel();
    
    var position = panel
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
