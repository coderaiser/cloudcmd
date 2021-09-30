'use strict';

const success = (f) => (data) => f(null, data);

module.exports = (promise) => (...a) => {
    const fn = a.pop();
    
    promise(...a)
        .then(success(fn))
        .catch(fn);
};

