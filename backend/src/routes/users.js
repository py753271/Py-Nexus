const express = require('express');
const { getAllUsers, deleteUser, updateProfile, createUser, getProfile, updateUser } = require('../controllers/userController');
const { verifyToken, requireRole } = require('../middlewares/auth');

const router = express.Router();

router.use(verifyToken);

// Self-service profile routes (Any logged in user)
router.get('/profile', getProfile);
router.patch('/profile', updateProfile);

// Management routes (Only ADMIN)
router.get('/', requireRole(['ADMIN']), getAllUsers);
router.post('/', requireRole(['ADMIN']), createUser);
router.patch('/:id', requireRole(['ADMIN']), updateUser);
router.delete('/:id', requireRole(['ADMIN']), deleteUser);

module.exports = router;


