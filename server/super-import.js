import tryToCatch from 'try-to-catch';

export default async function superImport(str) {
    const tryToCatch = await expandDefault('try-to-catch');
    
    const [eJs, resultJs] = await tryToCatch(expandDefault, `${str}.js`);
    
    if (!eJs)
        return resultJs;
    
    const [eIndex, resultIndex] = await tryToCatch(expandDefault, `${str}/index.js`);
    
    if (!eIndex)
        return resultIndex;
    
    return await expandDefault(str);
}

async function expandDefault(a) {
    const result = await import(a);
    return result.default;
}

