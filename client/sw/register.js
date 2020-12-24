export const listenSW = (sw, ...args) => {
    sw && sw.addEventListener(...args);
};

export async function registerSW(prefix) {
    if (!navigator.serviceWorker)
        return;
    
    const isHTTPS = location.protocol === 'https:';
    const isLocalhost = location.hostname === 'localhost';
    
    if (!isHTTPS && !isLocalhost)
        return;
    
    return await navigator.serviceWorker.register(`${prefix}/sw.js`);
}
export async function unregisterSW(prefix) {
    const reg = await registerSW(prefix);
    reg && reg.unregister(prefix);
}

