'use strict';

module.exports.createBinder = () => {
    let binded = false;
    
    return {
        isBind() {
            return binded;
        },
        setBind() {
            binded = true;
        },
        unsetBind() {
            binded = false;
        },
    };
};

