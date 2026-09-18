const goto = (page) => page.goto('/', {
    waitUntil: 'networkidle',
});

const waitForPanel = (page) => page
    .locator('.files li')
    .first()
    .waitFor();

export const createMenuHelper = (page) => ({
    async open() {
        await goto(page);
        await waitForPanel(page);
        await page
            .locator('[data-name="js-left"]')
            .click({
                button: 'right',
            });
    },
    async pressKey(key) {
        await page.keyboard.press(key);
    },
    async waitForMenu() {
        await page
            .locator('ul.menu:not(.menu-hidden)')
            .first()
            .waitFor();
    },
    isVisible: () => page
        .locator('ul.menu:not(.menu-hidden)')
        .first()
        .isVisible(),
    isHidden: () => page
        .locator('ul.menu')
        .first()
        .isHidden(),
    selectedText: () => page
        .locator('.menu-item-selected label')
        .first()
        .textContent(),
    itemTexts: () => page
        .locator('.menu > .menu-item > label')
        .allTextContents(),
});
