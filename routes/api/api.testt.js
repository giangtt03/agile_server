const express = require('express');
const router = express.Router();
const testController = require('../../controllers/api/api.testController');

router.get('/get-test', testController.getTests);

router.post('/take-test', testController.takeTest);
router.get('/test/:testId', testController.getTestById);

router.get('/sessions/user/:userId', testController.getSessionsByUserId);

router.post('/search', testController.searchTests);

// router.get('/mostTakenTests', testController.getMostTakenTests);

module.exports = router;
