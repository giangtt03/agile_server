const express = require('express');
const router = express.Router();
const questionController = require('../controllers/questionController');
const sessionMiddleware = require('../middleware/sessionMiddleware');

// Middleware để kiểm tra session
router.use('/update', sessionMiddleware);
router.use('/create', sessionMiddleware);
router.use('/delete', sessionMiddleware);

router.get('/update/:id', questionController.getUpdateQuestionForm);
router.put('/update/:id', questionController.updateQuestion);

router.get('/create', questionController.getCreateQuestionForm);
router.post('/create', questionController.createQuestion);

router.get('/', questionController.getAllQuestions);
router.get('/:id', questionController.getQuestionById);

router.delete('/delete/:id', questionController.deleteQuestion);

router.post('/category/:categoryId', questionController.getQuestionsByCategory);
router.post('/category/:categoryId/json', questionController.getQuestionsByCategoryJSON);

module.exports = router;
