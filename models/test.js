const mongoose = require('mongoose');

const removeAccents = (str) => {
  return str
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") 
    .replace(/đ/g, "d") 
    .replace(/Đ/g, "D");
};

const TestSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  normalizedName: {
    type: String, // Lưu tên không dấu để tìm kiếm
  },
  image: {
    type: String,
    required: true,
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
});

// Middleware tự động lưu tên không dấu khi tạo mới hoặc cập nhật bài quiz
TestSchema.pre("save", function (next) {
  this.normalizedName = removeAccents(this.name).toLowerCase();
  next();
});

module.exports = mongoose.model('Test', TestSchema);
