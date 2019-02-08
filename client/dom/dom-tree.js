'use strict';

const currify = require('currify/legacy');

const DOM = module.exports;

/**
 * check class of element
 *
 * @param element
 * @param className
 */
const isContainClass = (element, className) => {
    if (!element)
        throw Error('element could not be empty!');
    
    if (!className)
        throw Error('className could not be empty!');
    
    if (Array.isArray(className))
        return className.some(currify(isContainClass, element));
    
    const {classList} = element;
    
    return classList.contains(className);
};

module.exports.isContainClass = isContainClass;

/**
 * Function search element by tag
 * @param tag - className
 * @param element - element
 */
module.exports.getByTag = (tag, element = document) => {
    return element.getElementsByTagName(tag);
};

/**
 * Function search element by id
 * @param Id - id
 */
module.exports.getById = (id, element = document) => {
    return element.querySelector('#' + id);
};

/**
 * Function search first element by class name
 * @param className - className
 * @param element - element
 */
module.exports.getByClass = (className, element = document) => {
    return DOM.getByClassAll(className, element)[0];
};

module.exports.getByDataName = (attribute, element = document) => {
    const selector = '[' + 'data-name="' + attribute + '"]';
    return element.querySelector(selector);
};

/**
 * Function search element by class name
 * @param pClass - className
 * @param element - element
 */
module.exports.getByClassAll = (className, element) => {
    return (element || document).getElementsByClassName(className);
};

/**
 * add class=hidden to element
 *
 * @param element
 */
module.exports.hide = (element) => {
    element.classList.add('hidden');
    return DOM;
};

module.exports.show = (element) => {
    element.classList.remove('hidden');
    return DOM;
};

