const express = require('express');
const router = express.Router();
const testController = require('../controllers/testController');
const sessionMiddleware = require('../middleware/sessionMiddleware');

// Middleware để kiểm tra session
router.use(sessionMiddleware);


router.post('/questions/category/:categoryId', testController.getQuestionsByCategory);

router.get('/create', testController.renderQuestionList);
router.post('/create', testController.createTest);

router.get('/:id', testController.getTestById);

router.get('/', testController.getAllTests);

router.get('/update/:id', testController.renderUpdateTest);
router.put('/update/:id', testController.updateTest);

// router.delete('/:id', testController.deleteTest);

module.exports = router;
