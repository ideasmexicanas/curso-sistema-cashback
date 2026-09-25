const fs = require('fs');
const buffer = fs.readFileSync('public/logo.png');
let i = 2;
while (i < buffer.length) {
    if (buffer[i] === 0xFF && buffer[i+1] === 0xC0) {
        const height = buffer.readUInt16BE(i + 5);
        const width = buffer.readUInt16BE(i + 7);
        console.log(`Dimensions: ${width}x${height}`);
        process.exit(0);
    }
    i++;
}
console.log('SOF0 marker not found');
