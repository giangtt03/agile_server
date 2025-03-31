const mongoose = require('mongoose');
const TopicSchema = new mongoose.Schema(
    {
        title: { type: String, required: true },
        content: { type: String, required: true },
        author: { type: mongoose.Schema.Types.ObjectId, ref: "TKNguoiDung", required: true },
        tags: [{ type: String }],
        likes: [{ type: mongoose.Schema.Types.ObjectId, ref: "TKNguoiDung" }],
        comments: [{ type: mongoose.Schema.Types.ObjectId, ref: "Comment" }],
    },
    { timestamps: true }
);

module.exports = mongoose.model("Topic", TopicSchema);
