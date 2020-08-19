'use strict';

const {parse, stringify} = JSON;

module.exports.set = async (name, data) => {
    localStorage.setItem(name, data);
};

module.exports.setJson = async (name, data) => {
    localStorage.setItem(name, stringify(data));
};

module.exports.get = async (name) => {
    return localStorage.getItem(name);
};

module.exports.getJson = async (name) => {
    const data = localStorage.getItem(name);
    return parse(data);
};

module.exports.clear = () => {
    localStorage.clear();
};

module.exports.remove = (item) => {
    localStorage.removeItem(item);
};

