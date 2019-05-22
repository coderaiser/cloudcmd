'use strict';

const data = `'use strict';

module.exports = {
    'F2 - Rename file': async ({DOM}) => {
        await DOM.renameCurrent();
    },
};
`;

module.exports = {
    'F2 - Rename file': async ({DOM}) => {
        await DOM.renameCurrent();
    },
    
    'C - Create User Menu File': async ({DOM, CloudCmd}) => {
        const {
            RESTful,
            CurrentInfo,
        } = DOM;
        
        const {dirPath} = CurrentInfo;
        const path = `${dirPath}.cloudcmd.menu.js`;
        
        const [e] = await RESTful.write(path, data);
        
        if (e)
            return;
        
        await CloudCmd.refresh();
        DOM.setCurrentByName('.cloudcmd.menu.js');
        await CloudCmd.EditFile.show();
    },
};

module.exports._data = data;

