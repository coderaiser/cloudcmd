import {encode} from '#common/entity';

export const encodeMarkup = (str) => encode(
    String(str).replaceAll('&', '&amp;'),
);
