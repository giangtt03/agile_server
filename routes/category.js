const express = require('express');
const router = express.Router();
const categoryController = require('../controllers/categoryController');
const verifyToken = require('../middleware/authMiddleware'); 

router.get('/update/:id', verifyToken, categoryController.getUpdateCategoryForm);
router.put('/update/:id', verifyToken, categoryController.updateCategory);

router.get('/create', verifyToken, categoryController.getCreateCategoryForm);
router.post('/create', verifyToken, categoryController.createCategory);

router.put('/:id', verifyToken, categoryController.getCategoryById);
router.get('/', verifyToken, categoryController.getAllCategories);

module.exports = router;
