const difference = (a, b) => new Set(a).difference(new Set(b));
const {keys} = Object;

export const omit = (a, list) => {
    const result = {};
    
    for (const key of difference(keys(a), list)) {
        result[key] = a[key];
    }
    
    return result;
};
