let list = [];

export const add = (el, name, fn) => {
    list.push([
        el,
        name,
        fn,
    ]);
};

export const clear = () => {
    list = [];
};

export const get = () => list;
