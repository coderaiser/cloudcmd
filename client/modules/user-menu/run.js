'use strict';

module.exports.runSelected = async (selectedItems, items, runUserMenu) => {
    for (const selected of selectedItems) {
        await runUserMenu(items[selected]);
    }
};

