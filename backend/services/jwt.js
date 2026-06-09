const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET;

exports.generateToken = userId => {
    return jwt.sign({ userId }, JWT_SECRET, { expiresIn: '7d' });
};

exports.verifyToken = token => {
    return jwt.verify(token, JWT_SECRET);
};
