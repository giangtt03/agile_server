const mongoose = require('mongoose');

const CommentSchema = new mongoose.Schema(
    {
        content: { type: String, required: true }, 
        author: { type: mongoose.Schema.Types.ObjectId, ref: "TKNguoiDung", required: true }, 
        topic: { type: mongoose.Schema.Types.ObjectId, ref: "Topic", required: true },
        likes: [{ type: mongoose.Schema.Types.ObjectId, ref: "TKNguoiDung" }],
        parent: { type: mongoose.Schema.Types.ObjectId, ref: "Comment", default: null }
    },
    { timestamps: true }
);

module.exports = mongoose.model("Comment", CommentSchema);
