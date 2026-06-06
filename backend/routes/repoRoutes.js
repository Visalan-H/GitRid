const router = require('express').Router();
const { getAllRepositories, deleteRepositories, makeRepositoriesPrivate } = require('../controllers/repoController');
const authenticateToken = require('../middleware/auth');

router.get('/all', authenticateToken, getAllRepositories);

router.delete('/delete', authenticateToken, deleteRepositories);

router.patch('/visibility', authenticateToken, makeRepositoriesPrivate);

module.exports = router;
