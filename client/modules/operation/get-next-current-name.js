import currify from 'currify';

const not = currify((array, value) => !array.includes(value));
const notOneOf = currify((a, b) => a.filter(not(b)));

export default (currentName, names, removedNames) => {
    const i = names.indexOf(currentName);
    
    const nextNames = notOneOf(names, removedNames);
    const {length} = nextNames;
    
    if (nextNames[i])
        return nextNames[i];
    
    return nextNames[length - 1];
};

