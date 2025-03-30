const Test = require('../../models/test');
const User = require('../../models/api/User');
const Session = require('../../models/api/session');

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

            for (let index = 0; index < answers.length; index++) {
                const userAnswer = answers[index];
                const question = test.questions[index];
                const correctAnswer = question.answers.find(answer => answer.answer === userAnswer && answer.correct.toLowerCase() === 'true');

                if (typeof correctAnswer !== 'undefined') {
                    correctCount++;
                    test.questions[index].isCorrect = true;
                } else {
                    incorrectCount++;
                    test.questions[index].isCorrect = false;
                }
            }

            const sessionAnswers = answers.map((answer, index) => {
                const question = test.questions[index];
                const correctAnswer = question.answers.find(ans => ans.correct.toLowerCase() === 'true');
                return {
                    questionId: question._id,
                    selectedAnswerIndex: index,
                    isCorrect: correctAnswer.answer === answers[index] 
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
    }
};