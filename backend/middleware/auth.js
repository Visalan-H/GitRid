const User = require('../models/User');
const { verifyToken } = require('../services/jwt');

const authenticateToken = async (req, res, next) => {
    const token = req.cookies.jwt;
    if (!token) return res.status(401).json({ message: 'Unauthorized' });
    try {
        const decoded = verifyToken(token);
        const user = await User.findById(decoded.userId).select('+accessToken');
        if (!user) return res.status(403).json({ message: 'Forbidden' });
        req.user = user;
        next();
    } catch (error) {
        return res.status(401).json({ message: error.message });
    }
};

module.exports = authenticateToken;
