/* global DOM */

import createElement from '@cloudcmd/create-element';

const Images = module.exports;

const LOADING = 'loading';
const HIDDEN = 'hidden';
const ERROR = 'error';

function getLoadingType() {
    return isSVG() ? '-svg' : '-gif';
}

export const get = getElement;

/**
 * check SVG SMIL animation support
 */
function isSVG() {
    const createNS = document.createElementNS;
    const SVG_URL = 'http://www.w3.org/2000/svg';
    
    if (!createNS)
        return false;
    
    const create = createNS.bind(document);
    const svgNode = create(SVG_URL, 'animate');
    const name = svgNode.toString();
    
    return /SVGAnimate/.test(name);
}

function getElement() {
    return createElement('span', {
        id: 'js-status-image',
        className: 'icon',
        dataName: 'progress',
        notAppend: true,
    });
}

/* Функция создаёт картинку загрузки */
export const loading = () => {
    const element = getElement();
    const {classList} = element;
    const loadingImage = LOADING + getLoadingType();
    
    classList.add(LOADING, loadingImage);
    classList.remove(ERROR, HIDDEN);
    
    return element;
};

/* Функция создаёт картинку ошибки загрузки */
export const error = () => {
    const element = getElement();
    const {classList} = element;
    const loadingImage = LOADING + getLoadingType();
    
    classList.add(ERROR);
    classList.remove(HIDDEN, LOADING, loadingImage);
    
    return element;
};

module.exports.show.load = show;
module.exports.show.error = showError;

/**
* Function shows loading spinner
* position = {top: true};
*/
export /**
* Function shows loading spinner
* position = {top: true};
*/
function show(position, panel) {
    const image = Images.loading();
    const parent = image.parentElement;
    const refreshButton = DOM.getRefreshButton(panel);
    
    let current;
    
    if (position === 'top') {
        current = refreshButton.parentElement;
    } else {
        current = DOM.getCurrentFile();
        
        if (current)
            current = DOM.getByDataName('js-name', current);
        else
            current = refreshButton.parentElement;
    }
    
    if (!parent || parent && parent !== current)
        current.appendChild(image);
    
    DOM.show(image);
    
    return image;
}

function showError(text) {
    const image = Images.error();
    
    DOM.show(image);
    image.title = text;
    
    return image;
}

/**
* hide load image
*/
export const hide = () => {
    const element = Images.get();
    
    DOM.hide(element);
    
    return Images;
};

export const setProgress = (value, title) => {
    const DATA = 'data-progress';
    const element = Images.get();
    
    if (!element)
        return Images;
    
    element.setAttribute(DATA, value + '%');
    
    if (title)
        element.title = title;
    
    return Images;
};

export const clearProgress = () => {
    const DATA = 'data-progress';
    const element = Images.get();
    
    if (!element)
        return Images;
    
    element.setAttribute(DATA, '');
    element.title = '';
    
    return Images;
};

