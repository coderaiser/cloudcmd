import {tryToCatch} from 'try-to-catch';

export const listenSW = (sw, ...args) => {
    sw?.addEventListener(...args);
};

export async function registerSW(prefix) {
    if (!navigator.serviceWorker)
        return;
    
    const isHTTPS = location.protocol === 'https:';
    const isLocalhost = location.hostname === 'localhost';
    
    if (!isHTTPS && !isLocalhost)
        return;
    
    const {serviceWorker} = navigator;
    const register = serviceWorker.register.bind(serviceWorker);
    const [e, sw] = await tryToCatch(register, `${prefix}/sw.mjs`);
    
    if (e)
        return null;
    
    return sw;
}

export async function unregisterSW(prefix) {
    const reg = await registerSW(prefix);
    reg?.unregister(prefix);
}
