export const createBinder = () => {
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
