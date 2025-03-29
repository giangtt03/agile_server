const Category = require('../models/category');

module.exports = {
  getCreateCategoryForm: (req, res) => {
    const user = req.session.user;
    console.log("User:", user);
    res.render('category/createCategory', { user });
  },

  createCategory: async (req, res) => {
    try {
      const { name } = req.body;
      const newCategory = new Category({ name });
      const savedCategory = await newCategory.save();
      res.json(savedCategory);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  getUpdateCategoryForm: async (req, res) => {
    try {
      const user = req.session.user;
      const { id } = req.params;
      const category = await Category.findById(id);
      if (!category) {
        return res.status(404).json({ error: 'Category not found' });
      }
      res.render('category/updateCategory', { category, user });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  updateCategory: async (req, res) => {
    try {
      const { id } = req.params;
      // console.log("Category ID:", id);
      const { name } = req.body;
      // console.log("name:", name); 
      const updatedCategory = await Category.findByIdAndUpdate(id, { name }, { new: true });
      // console.log("Updated category:", updatedCategory);
      res.json(updatedCategory);
    } catch (error) {
      console.error('Error updating category:', error);
      res.status(500).json({ error: error.message });
    }
  },
  
  deleteCategory: async (req, res) => {
    try {
      const { id } = req.params;
      await Category.findByIdAndDelete(id);
      res.json({ message: 'Category deleted successfully' });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  getCategoryById: async (req, res) => {
    try {
      const { id } = req.params;
      const category = await Category.findById(id);
      if (!category) {
        return res.status(404).json({ error: 'Category not found' });
      }
      res.json(category);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  getAllCategories: async (req, res) => {
    try {
      const categories = await Category.find();
      const user = req.session.user;
      res.render('category/getAllCategory', { categories, user });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
};
