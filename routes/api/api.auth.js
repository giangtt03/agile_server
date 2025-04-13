const express = require('express');
const router = express.Router();
const api = require('../../controllers/api/api.authController');
const multer = require('multer');

const storage = multer.memoryStorage();
const upload = multer({ storage });


router.get('/user/:id', api.getUserById);

router.post('/create-user', upload.single('avatar'), api.createTK);

router.put('/update/:id', upload.single('avatar'), api.updateProfile);

router.post('/login', api.loginTK);

router.get('/profile/:userId', api.getUserProfile);

router.get('/topics/:userId', api.getUserTopics);

router.get('/comments/:userId', api.getUserComments);

module.exports = router;
