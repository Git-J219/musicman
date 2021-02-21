const fs = require('fs-extra');
const path = require('path');

module.exports = [(destPath, _a, _b, _c, completed) => {
    fs.copy(path.join(__dirname, '3rdParty'), destPath).then(completed);
}];
