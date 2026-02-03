const {parse, stringify} = JSON;

export const set = (name, data) => {
    localStorage.setItem(name, data);
};

export const setJson = (name, data) => {
    localStorage.setItem(name, stringify(data));
};

export const get = (name) => {
    return localStorage.getItem(name);
};

export const getJson = (name) => {
    const data = localStorage.getItem(name);
    return parse(data);
};

export const clear = () => {
    localStorage.clear();
};

export const remove = (item) => {
    localStorage.removeItem(item);
};
