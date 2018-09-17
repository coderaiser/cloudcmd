'use strict';

const query = (a) => document.querySelector(`[data-name="${a}"]`);
const isStr = (a) => typeof a === 'string';

module.exports = (name, {innerHTML, className, dataName, textContent, parent} = {}) => {
    parent = parent || document.body;
    className = className || '';
    dataName = dataName || '';
    
    const elFound = isElementPresent(dataName);
    
    if (elFound)
        return elFound;
    
    const el = document.createElement(name);
    
    if (isStr(innerHTML))
        el.innerHTML = innerHTML;
    
    if (isStr(textContent))
        el.textContent = textContent;
    
    el.className = className;
    el.dataset.name = dataName;
    
    parent.appendChild(el);
    
    return el;
};

module.exports.isElementPresent = isElementPresent;

function isElementPresent(dataName) {
    if (!dataName)
        return;
    
    return query(dataName);
}

