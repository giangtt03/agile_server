// routes/topicRoutes.js
const express = require('express');
const router = express.Router();
const topicController = require('../../controllers/api/api.topicController');
const authMiddleware = require('../../middleware/authMiddleware');


router.post('/create', authMiddleware, topicController.createTopic); 

router.get('/', authMiddleware, topicController.getTopics);
router.get('/:id', authMiddleware, topicController.getTopicById);
router.delete('/:id', authMiddleware, topicController.deleteTopic);

router.get('/tag/:tag', authMiddleware, topicController.getTopicsByTag);

router.post('/search', authMiddleware, topicController.searchTopics);


module.exports = router;