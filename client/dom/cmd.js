/* global DOM */
const SELECTED_FILE = 'selected-file';

/**
 * selected file check
 *
 * @param currentFile
 */
export function isSelected(currentFile) {
    if (!currentFile)
        return false;
    
    return DOM.isContainClass(currentFile, SELECTED_FILE);
}

/**
 * select current file
 * @param currentFile
 */
export function selectFile(currentFile) {
    const current = currentFile || DOM.getCurrentFile();
    
    current.classList.add(SELECTED_FILE);
    
    return DOM;
}

export function unselectFile(currentFile) {
    const current = currentFile || DOM.getCurrentFile();
    
    current.classList.remove(SELECTED_FILE);
    
    return DOM;
}

export function toggleSelectedFile(currentFile) {
    const current = currentFile || DOM.getCurrentFile();
    const name = DOM.getCurrentName(current);
    
    if (name === '..')
        return DOM;
    
    current.classList.toggle(SELECTED_FILE);
    
    return DOM;
}

export function toggleAllSelectedFiles() {
    DOM
        .getAllFiles()
        .map(DOM.toggleSelectedFile);
    
    return DOM;
}

export function selectAllFiles() {
    DOM
        .getAllFiles()
        .map(DOM.selectFile);
    
    return DOM;
}

/**
 * unified way to get selected files
 *
 * @currentFile
 */
export function getSelectedFiles() {
    const panel = DOM.getPanel();
    const selected = DOM.getByClassAll(SELECTED_FILE, panel);
    
    return Array.from(selected);
}
