'use strict';

module.exports = (...args) => {
    console.error(...args);
    process.exit(1);
};

