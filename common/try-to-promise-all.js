import tryToCatch from 'try-to-catch';
const all = Promise.all.bind(Promise);

export default async (a) => {
    const [e, result = []] = await tryToCatch(all, a);
    
    return [
        e,
        ...result,
    ];
};

