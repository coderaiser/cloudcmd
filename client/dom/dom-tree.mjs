import currify from 'currify';

const DOM = {
    show,
    hide,
    getByClass,
    getByClassAll,
    getByDataName,
    getById,
    getByTag,
    isContainClass,
};

/**
 * check class of element
 *
 * @param element
 * @param className
 */
export function isContainClass(element, className) {
    if (!element)
        throw Error('element could not be empty!');
    
    if (!className)
        throw Error('className could not be empty!');
    
    if (Array.isArray(className))
        return className.some(currify(
            isContainClass,
            element,
        ));
    
    const {classList} = element;
    
    return classList.contains(className);
}

/**
 * Function search element by tag
 * @param tag - className
 * @param element - element
 */
export function getByTag(tag, element = document) {
    return element.getElementsByTagName(tag);
}

/**
 * Function search element by id
 * @param id
 * @param element
 */
export function getById(id, element = document) {
    return element.querySelector(`#${id}`);
}

/**
 * Function search first element by class name
 * @param className - className
 * @param element - element
 */
export function getByClass(className, element = document) {
    return DOM.getByClassAll(className, element)[0];
}

export function getByDataName(attribute, element = document) {
    const selector = '[' + 'data-name="' + attribute + '"]';
    return element.querySelector(selector);
}

/**
 * Function search element by class name
 * @param className
 * @param element
 */
export function getByClassAll(className, element) {
    return (element || document).getElementsByClassName(className);
}

/**
 * add class=hidden to element
 *
 * @param element
 */
export function hide(element) {
    element.classList.add('hidden');
    return DOM;
}

export function show(element) {
    element.classList.remove('hidden');
    return DOM;
}
