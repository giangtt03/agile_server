const Test = require('../../models/test');
const User = require('../../models/api/User');
const Session = require('../../models/api/session');

// ham xoa dau
const removeAccents = (str) => {
    return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
};

module.exports = {
    getTests: async (req, res) => {
        try {
            const tests = await Test.find({});
            res.json(tests);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    },

    getTestById: async (req, res) => {
        try {
            const { testId } = req.params;
            const test = await Test.findById(testId).populate({
                path: 'questions',
                populate: {
                    path: 'answers'
                }
            });

            if (!test) {
                return res.status(404).json({ error: 'Test not found' });
            }

            res.json(test);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    },

    takeTest: async (req, res) => {
        try {
            const { testId, userId, answers } = req.body;
            const test = await Test.findById(testId).populate('questions');
    
            if (!test) {
                return res.status(404).json({ error: 'Test not found' });
            }
    
            if (test.questions.length !== answers.length) {
                return res.status(400).json({ error: 'Number of answers does not match number of questions' });
            }
    
            let correctCount = 0;
            let incorrectCount = 0;
  
            const sessionAnswers = answers.map(userAnswer => {
                const question = test.questions.find(q => q._id.toString() === userAnswer.questionId);
                const selectedAnswer = question.answers[userAnswer.selectedAnswerIndex];
                const correct = selectedAnswer && selectedAnswer.correct.toLowerCase() === 'true';
            
                if (correct) correctCount++;
                else incorrectCount++;
            
                return {
                    questionId: question._id,
                    selectedAnswerIndex: userAnswer.selectedAnswerIndex,
                    isCorrect: correct
                };
            });
            
            await test.save();
    
            const session = await Session.create({
                userId: userId,
                testId: testId,
                answers: sessionAnswers,
                correctAnswersCount: correctCount,
                incorrectAnswersCount: incorrectCount,
            });
    
            res.status(200).json({ message: 'Test completed', session });
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    },

    getSessionsByUserId: async (req, res) => {
        try {
            const { userId } = req.params;
            const sessions = await Session.find({ userId })
                .sort({ createdAt: -1 })
                .limit(10)
                .populate({
                    path: 'testId',
                    select: 'name image questions',
                    populate: {
                        path: 'questions',
                        populate: {
                            path: 'answers'
                        }
                    }
                });

            if (!sessions) {
                return res.status(404).json({ error: 'Sessions not found for this user' });
            }

            res.json(sessions);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    },
    searchTests: async (req, res) => {
        try {
            const { name } = req.query;
            if (!name) {
                return res.status(400).json({ message: "Missing search query" });
            }
    
            const normalizedQuery = removeAccents(name).toLowerCase();
    
            // Tìm từ hoàn chỉnh bằng \b (word boundary)
            const regexQuery = name.split(" ").map(word => `\\b${word}\\b`).join("|");
            const regexNormalizedQuery = normalizedQuery.split(" ").map(word => `\\b${word}\\b`).join("|");
    
            const tests = await Test.find({
                $or: [
                    { name: { $regex: new RegExp(regexQuery, "i") } },
                    { normalizedName: { $regex: new RegExp(regexNormalizedQuery, "i") } }
                ]
            });
    
            res.json(tests);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    }
    
};