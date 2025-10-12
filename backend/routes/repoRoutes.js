const router = require('express').Router();
const { getAllRepos } = require('../controllers/repoController');
const authenticateToken = require('../middleware/auth');



router.get('/all', authenticateToken, getAllRepos);


module.exports = router;