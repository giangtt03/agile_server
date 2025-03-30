const express = require('express');
const router = express.Router();
const api = require('../../controllers/api/api.authController');

router.post('/create-user', api.createTK);

router.post('/login', api.loginTK);

module.exports = router;
