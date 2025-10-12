const crypto = require('crypto');

const generateRandomString = (length = 16) => {
        return crypto.randomBytes(length).toString('hex');
    }

module.exports = {
    generateRandomString
};