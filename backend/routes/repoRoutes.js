const router = require('express').Router();
const { getAllRepositories, deleteRepositories, makeRepositoriesPrivate, makeRepositoriesPublic } = require('../controllers/repoController');
const authenticateToken = require('../middleware/auth');

router.get('/all', authenticateToken, getAllRepositories);
router.delete('/delete', authenticateToken, deleteRepositories);
router.patch('/visibility', authenticateToken, makeRepositoriesPrivate);
router.patch('/visibility/public', authenticateToken, makeRepositoriesPublic);

module.exports = router;
