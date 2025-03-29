const mongoose = require('mongoose');

const TestSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  image:{
    type: String,
    require: true,
  },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    required: true,
  },
  questions: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Question', 
  }],
  // duration: { type: Number, required: true } // Thời gian làm bài 
});

module.exports = mongoose.model('Test', TestSchema);
