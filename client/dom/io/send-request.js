/* global CloudCmd */
import {promisify} from 'es6-promisify';
import * as Images from '#dom/images';
import * as load from '#dom/load';

export const sendRequest = promisify((params, callback) => {
    const p = params;
    const {prefixURL} = CloudCmd;
    
    p.url = prefixURL + p.url;
    p.url = encodeURI(p.url);
    
    p.url = replaceHash(p.url);
    
    load.ajax({
        method: p.method,
        url: p.url,
        data: p.data,
        dataType: p.dataType,
        error: (jqXHR) => {
            const response = jqXHR.responseText;
            
            const {statusText, status} = jqXHR;
            
            const text = status === 404 ? response : statusText;
            
            callback(Error(text));
        },
        success: (data) => {
            Images.hide();
            
            if (!p.notLog)
                CloudCmd.log(data);
            
            callback(null, data);
        },
    });
});

export const _replaceHash = replaceHash;

function replaceHash(url) {
    /*
     * if we send ajax request -
     * no need in hash so we escape #
     */
    return url.replace(/#/g, '%23');
}
