import {join, dirname} from 'path';
import {fileURLToPath} from 'url';
import readFilesSync from '@cloudcmd/read-files-sync';

const __dirname = dirname(fileURLToPath(import.meta.url));
const templatePath = join(__dirname, '..', 'tmpl/fs');

export default readFilesSync(templatePath, 'utf8');

