import process from 'node:process';

const getMessage = (a) => a?.message || a;

export default (...args) => {
    const messages = args.map(getMessage);
    
    console.error(...messages);
    process.exit(1);
};
