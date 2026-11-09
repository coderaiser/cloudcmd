export const createState = (config) => {
    let state = {
        ...config,
    };
    
    const read = () => state;
    
    const commit = (name, value) => {
        state = {
            ...state,
            [name]: value,
        };
    };
    
    return {
        read,
        commit,
    };
};
