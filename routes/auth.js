const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

router.post('/signup', authController.createUser);

router.get('/login', authController.loginUser);
router.post('/login', authController.loginUser);

router.get('/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            console.log(err);
            return res.redirect('/login'); 
        }
        res.redirect('/login');
    });
});


module.exports = router;
