const mongoose = require('mongoose');

const AnswerSchema = new mongoose.Schema({
  answer: {
    type: String,
    required: true,
  },
  correct: {
    type: String,
    required: true,
  }
});

const QuestionSchema = new mongoose.Schema({
  content: {
    type: String,
    required: true,
  },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    required: true,
  },
  answers: [AnswerSchema],
});

module.exports = mongoose.model('Question', QuestionSchema);
