const success = (f) => (data) => f(null, data);

export default (promise) => (...a) => {
    const fn = a.pop();
    
    promise(...a)
        .then(success(fn))
        .catch(fn);
};
