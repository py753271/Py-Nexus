const express = require('express');
const { getAllCategories, createCategory, deleteCategory } = require('../controllers/categoryController');
const { verifyToken, requireRole } = require('../middlewares/auth');

const router = express.Router();

router.get('/', getAllCategories);
router.post('/', verifyToken, requireRole(['ADMIN']), createCategory);
router.delete('/:id', verifyToken, requireRole(['ADMIN']), deleteCategory);

module.exports = router;
