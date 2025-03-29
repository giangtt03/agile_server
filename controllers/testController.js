const mongoose = require('mongoose');
const Test = require('../models/test');
const Question = require('../models/question');
const Category = require('../models/category');

module.exports = {
    renderQuestionList: async (req, res) => {
        try {
            const questions = await Question.find();
            const categories = await Category.find();
            res.render('test/createTest', { questions, categories });
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    },

    getQuestionsByCategory: async (req, res) => {
        try {
            const { categoryId } = req.query;
            const categoryQuestions = await Question.find({ category: categoryId });
            res.json(categoryQuestions);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    },

    createTest: async (req, res) => {
        try {
            const { name, image, category, questions } = req.body; 
            console.log("question: ", questions);

            const selectedQuestions = [];
            for (const question of questions) {
                const foundQuestion = await Question.findOne({ content: question });
                if (foundQuestion) {
                    selectedQuestions.push(foundQuestion._id);
                }
            }

            const newTest = new Test({
                name,
                image,
                category,
                questions: selectedQuestions,
            });
            const savedTest = await newTest.save();
            res.json(savedTest);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    },

    renderCreateTest: async (req, res) => {
        try {
            // const user = req.session.user;
            const categories = await Category.find();
            const user = req.session.user || {};
            res.render('test/createTest', { categories, user });
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    },


    getTestById: async (req, res) => {
        try {
            const { id } = req.params;
            const test = await Test.findById(id).populate('questions');
            if (!test) {
                return res.status(404).json({ error: 'Test not found' });
            }
            res.json(test);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },

    getAllTests: async (req, res) => {
        try {
            const tests = await Test.find().populate({
                path: 'questions',
                populate: {
                    path: 'answers'
                }
            }).populate('category');
            const totalTests = tests.length;
            const user = req.session.user;
            res.render('test/getAllTests', { tests, totalTests, user });
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    },

    renderUpdateTest: async (req, res) => {
        try {
            const { id } = req.params;
            const test = await Test.findById(id);
            const questions = await Question.find();
            const categories = await Category.find();
            const user = req.session.user;
            res.render('test/updateTest', { test, questions, categories, user });
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    },
    updateTest: async (req, res) => {
        try {
            const { id } = req.params;
            const { name, image, category, questions } = req.body;
            const selectedQuestions = questions.map(questionId => new mongoose.Types.ObjectId(questionId));

            const updatedTest = await Test.findByIdAndUpdate(
                id,
                { name, image, category, questions: selectedQuestions },
                { new: true }
            ).populate('questions');

            if (!updatedTest) {
                return res.status(404).json({ message: 'Test not found' });
            }

            res.json(updatedTest);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    },
};
