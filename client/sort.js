/* global CloudCmd */
import {fullstore} from 'fullstore';
import DOM from '#dom';

const sortPrevious = fullstore();

const {getPanel} = DOM;

export const initSortPanel = () => {
    const {sort} = CloudCmd;
    const position = DOM.getPanelPosition();
    
    sortPrevious(sort[position]);
};

export const sortPanel = (name, panel = getPanel()) => {
    const {sort, order} = CloudCmd;
    const Info = DOM.CurrentInfo;
    const position = panel.dataset.name.replace('js-', '');
    
    if (name !== sortPrevious())
        order[position] = 'asc';
    else if (order[position] === 'asc')
        order[position] = 'desc';
    else
        order[position] = 'asc';
    
    sortPrevious(name);
    sort[position] = name;
    const noCurrent = position !== Info.panelPosition;
    
    CloudCmd.refresh({
        panel,
        noCurrent,
    });
};
