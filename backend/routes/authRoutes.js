const router = require('express').Router();
const { githubAuthUrl, githubCallback, getCurrentUser, logoutUser } = require('../controllers/authController');

router.get('/github/url', githubAuthUrl);

router.get('/github/callback', githubCallback);

router.get('/me', getCurrentUser);

router.post('/logout', logoutUser);


module.exports = router;
