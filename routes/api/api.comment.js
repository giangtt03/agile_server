// routes/commentRoutes.js
const express = require('express');
const router = express.Router();
const commentController = require('../../controllers/api/api.commentController');

router.post('/create', commentController.createComment);
router.get('/topic/:topicId', commentController.getCommentsByTopic);
router.delete('/:id', commentController.deleteComment);

module.exports = router;
