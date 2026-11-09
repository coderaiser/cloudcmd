const isCheckbox = ({type}) => type === 'checkbox';

const removeMissing = (live, next) => {
    const attributes = Array.from(live.attributes);
    
    for (const {name} of attributes) {
        if (!next.hasAttribute(name))
            live.removeAttribute(name);
    }
};

const setChanged = (live, next, isFocused) => {
    const attributes = Array.from(next.attributes);
    
    for (const {name, value} of attributes) {
        if (name === 'value' && isFocused)
            continue;
        
        if (live.getAttribute(name) !== value)
            live.setAttribute(name, value);
    }
};

export const patch = (live, next, {activeElement}) => {
    const liveElements = Array.from(live.querySelectorAll('*'));
    const nextElements = Array.from(next.querySelectorAll('*'));
    
    if (liveElements.length !== nextElements.length)
        throw Error('The structure of the form changed');
    
    for (const [index, element] of liveElements.entries()) {
        const nextElement = nextElements[index];
        
        removeMissing(element, nextElement);
        setChanged(element, nextElement, element === activeElement);
        
        if (isCheckbox(element))
            element.checked = nextElement.hasAttribute('checked');
    }
};
