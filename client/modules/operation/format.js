export default (operation, from, to) => {
    if (!to)
        return `${operation} ${from}`;
    
    return `${operation} ${from} -> ${to}`;
};

