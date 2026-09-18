export const createTranslator = (dictionary = {}) => (key) => {
    return dictionary[key] ?? key;
};
