const router = require('express').Router();
const { getAllRepositories, deleteRepositories } = require('../controllers/repoController');
const authenticateToken = require('../middleware/auth');

router.get('/all', authenticateToken, getAllRepositories);

router.delete('/delete', authenticateToken, deleteRepositories);

module.exports = router;