const Question = require('../models/question');
const Category = require('../models/category');

const paginate = async (model, query, page = 1, limit = 10) => {
    const skip = (page - 1) * limit;
    const totalDocuments = await model.countDocuments(query);
    const totalPages = Math.ceil(totalDocuments / limit);
    const results = await model.find(query).skip(skip).limit(limit);
    return { results, totalPages };
};

module.exports = {
    getCreateQuestionForm: async (req, res) => {
        try {
            const categories = await Category.find();
            const user = req.session.user;
            res.render('question/createQuestion', { categories, user });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },

    createQuestion: async (req, res) => {
        try {
            const { content, category, answers } = req.body;
            const newQuestion = new Question({
                content,
                category,
                answers,
            });
            const savedQuestion = await newQuestion.save();
            res.json(savedQuestion);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    },


    getUpdateQuestionForm: async (req, res) => {
        try {
            const { id } = req.params;
            const question = await Question.findById(id);
            const categories = await Category.find();
            const user = req.session.user;
            if (!question) {
                return res.status(404).json({ error: 'Question not found' });
            }
            res.render('question/updateQuestion', { question, categories, user });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },

    updateQuestion: async (req, res) => {
        try {
            const { id } = req.params;
            const { content, category, answers, correctAnswer } = req.body;
            const updatedQuestion = await Question.findByIdAndUpdate(
                id,
                { content, category, answers, correctAnswer },
                { new: true }
            );
            if (!updatedQuestion) {
                return res.status(404).json({ message: 'Question not found' });
            }
            res.json(updatedQuestion);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    },

    deleteQuestion: async (req, res) => {
        try {
            const { id } = req.params;
            await Question.findByIdAndDelete(id);
            res.json({ message: 'Question deleted successfully' });
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    },

    getQuestionById: async (req, res) => {
        try {
            const { id } = req.params;
            const question = await Question.findById(id);
            if (!question) {
                return res.status(404).json({ error: 'Question not found' });
            }
            res.json(question);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },

    getAllQuestions: async (req, res) => {
        try {
            const page = parseInt(req.query.page) || 1; // Lấy số trang từ query, mặc định là trang 1
            const limit = 5; // Số lượng câu hỏi trên mỗi trang
            const offset = (page - 1) * limit; // Vị trí bắt đầu của trang hiện tại
            const questions = await Question.find().populate('category').skip(offset).limit(limit);
            const count = await Question.countDocuments(); // Tổng số câu hỏi
            const totalPages = Math.ceil(count / limit); // Tính số trang
            const categories = await Category.find();
            const user = req.session.user;
            res.render('question/getAllQuestions', { questions, categories, user, totalPages, currentPage: page, totalQuestions: count  });
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    },
    
    getQuestionsByCategory: async (req, res) => {
        try {
            const { categoryId } = req.params;
            const questions = await Question.find({ category: categoryId }).populate('category');
            const totalQuestions = await Question.countDocuments({ category: categoryId }); 
            const user = req.session.user;
            res.render('question/getAllQuestions', { questions, user, totalQuestions });
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    },
    getQuestionsByCategoryJSON: async (req, res) => {
        try {
            const { categoryId } = req.params;
            const questions = await Question.find({ category: categoryId }).populate('category');
            res.json(questions);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    }
    
};
