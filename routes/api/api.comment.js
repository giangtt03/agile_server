// routes/commentRoutes.js
const express = require('express');
const router = express.Router();
const commentController = require('../../controllers/api/api.commentController');
const authMiddleware = require('../../middleware/authMiddleware');


router.post('/create', authMiddleware, commentController.createComment);
router.get('/topic/:topicId', authMiddleware, commentController.getCommentsByTopic);
router.delete('/:id', authMiddleware, commentController.deleteComment);

module.exports = router;
