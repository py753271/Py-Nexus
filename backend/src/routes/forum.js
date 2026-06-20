const express = require('express');
const router = express.Router();
const forumController = require('../controllers/forumController');
const { verifyToken } = require('../middlewares/auth');

// Protected routes (Only logged in users can see/post)
router.get('/', verifyToken, forumController.getThreads);
router.post('/', verifyToken, forumController.createThread);
router.patch('/:id/upvote', verifyToken, forumController.upvoteThread);

module.exports = router;
