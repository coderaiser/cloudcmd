import {test, expect} from './fixtures.js';
import {
    open,
    exists,
    p,
} from './helper.js';

const menu = `export default {
    'D - Make marker': async ({DOM}) => {
        await DOM.RESTful.write(\`\${DOM.CurrentInfo.dirPath}marker.txt\`);
    },
};
`;

test.describe('user menu', () => {
    test.use({
        extraFiles: {
            '.cloudcmd.menu.js': menu,
        },
    });
    
    test('USR-01: F2 opens the user menu from the menu file', async ({page}) => {
        await open(page);
        await page.keyboard.press('F2');
        
        await expect(page.locator('select.cloudcmd-user-menu')).toContainText('Make marker');
    });
    
    test('USR-02: a user menu item runs', async ({page, server}) => {
        await open(page);
        await page.keyboard.press('F2');
        await page
            .locator('select.cloudcmd-user-menu option', {
                hasText: 'Make marker',
            })
            .dblclick();
        
        await expect
            .poll(() => exists(p(server.root, 'marker.txt')))
            .toBe(true);
    });
});
