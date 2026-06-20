const express = require('express');
const router = express.Router();
const articleController = require('../controllers/articleController');
const { verifyToken, requireRole } = require('../middlewares/auth');

router.use(verifyToken);

router.get('/', articleController.getArticles);
router.post('/', requireRole(['ADMIN']), articleController.createArticle);
router.patch('/:id/verify', requireRole(['ADMIN']), articleController.verifyArticle);
router.delete('/:id', requireRole(['ADMIN']), articleController.deleteArticle);

module.exports = router;
