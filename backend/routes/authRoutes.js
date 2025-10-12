const router = require('express').Router();
const { githubAuthUrl, githubCallback, getCurrentUser, logoutUser } = require('../controllers/authController');
const authenticateToken = require('../middleware/auth');

router.get('/github/url', githubAuthUrl);

router.get('/github/callback', githubCallback);

router.get('/me', authenticateToken, getCurrentUser);

router.post('/logout', logoutUser);


module.exports = router;
