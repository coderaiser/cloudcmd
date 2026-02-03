import path, {dirname} from 'node:path';
import {fileURLToPath} from 'node:url';
import readFilesSync from '@cloudcmd/read-files-sync';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const templatePath = path.join(__dirname, '..', 'tmpl/fs');

export default readFilesSync(templatePath, 'utf8');
