const Comment = require("../../models/api/comment");
const Topic = require("../../models/api/topic");
const User = require("../../models/api/User");

module.exports = {
    createComment: async (req, res) => {
        try {
            console.log('🔹 req.user in createComment:', req.user);
            const { content, topicId } = req.body; 
            const author = req.user._id; 
    
            if (!content || !topicId) {
                return res.status(400).json({ error: 'Content and Topic ID are required' });
            }
    
            const topic = await Topic.findById(topicId);
            if (!topic) {
                return res.status(404).json({ error: 'Topic not found' });
            }
    
            const newComment = new Comment({
                content,
                author,
                topic: topicId,
            });
    
            const savedComment = await newComment.save();
    
            topic.comments.push(savedComment._id);
            await topic.save();
    
            res.json(savedComment);
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Internal Server Error' });
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
            if (comment.author.toString() !== req.user._id) return res.status(403).json({ error: "Unauthorized" });
            
            await comment.remove();
            await User.findByIdAndUpdate(req.user._id, { $pull: { comments: comment._id } });
            await Topic.findByIdAndUpdate(comment.topic, { $pull: { comments: comment._id } });
            
            res.json({ message: "Comment deleted" });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
};
