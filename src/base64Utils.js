const fs = require('fs');
module.exports = {
    fileToBase(filePath) {
        const bytes = fs.readFileSync(filePath);
        return  Buffer.from(bytes).toString("base64");
    }
}