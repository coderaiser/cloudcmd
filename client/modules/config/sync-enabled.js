export const syncEnabled = (root) => {
    const dependents = root.querySelectorAll('[data-enabled-by]');
    
    for (const element of dependents) {
        const name = element.dataset.enabledBy;
        const checkbox = root.querySelector(`[data-name="js-${name}"]`);
        
        element.disabled = !checkbox.checked;
    }
};
