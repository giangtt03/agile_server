const Comment = require("../../models/api/comment");
const Topic = require("../../models/api/topic");
const User = require("../../models/api/User");

module.exports = {
    createComment: async (req, res) => {
        try {
            const { content, topicId } = req.body;
            const comment = new Comment({ content, author: req.user.userId, topic: topicId });
            await comment.save();
            
            await Topic.findByIdAndUpdate(topicId, { $push: { comments: comment._id } });
            await User.findByIdAndUpdate(req.user.userId, { $push: { comments: comment._id } });
            
            res.status(201).json(comment);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },

    getCommentsByTopic: async (req, res) => {
        try {
            const comments = await Comment.find({ topic: req.params.topicId })
                .populate("author", "username")
                .sort({ createdAt: 1 });
            res.json(comments);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },

    deleteComment: async (req, res) => {
        try {
            const comment = await Comment.findById(req.params.id);
            if (!comment) return res.status(404).json({ error: "Comment not found" });
            if (comment.author.toString() !== req.user.userId) return res.status(403).json({ error: "Unauthorized" });
            
            await comment.remove();
            await User.findByIdAndUpdate(req.user.userId, { $pull: { comments: comment._id } });
            await Topic.findByIdAndUpdate(comment.topic, { $pull: { comments: comment._id } });
            
            res.json({ message: "Comment deleted" });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
};
