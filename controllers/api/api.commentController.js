const Comment = require("../../models/api/comment");
const Topic = require("../../models/api/topic");
const User = require("../../models/api/User");

function buildCommentTree(comments, parentId = null, currentDepth = 0, maxDepth = 2) {
    if (currentDepth >= maxDepth) return [];

    const commentMap = {};
    if (currentDepth === 0) { 
        for (const comment of comments) {
            const parent = comment.parent ? comment.parent.toString() : null;
            if (!commentMap[parent]) {
                commentMap[parent] = [];
            }
            commentMap[parent].push(comment);
        }
    }

    const childComments = currentDepth === 0 
        ? (commentMap[parentId] || []) 
        : comments.filter(c => c.parent && c.parent.toString() === parentId.toString());

    return childComments.map(comment => {
        const commentObj = comment.toObject ? comment.toObject() : comment;
        
        // Đệ quy để lấy replies
        const replies = buildCommentTree(
            currentDepth === 0 ? comments : commentMap[comment._id.toString()] || [],
            comment._id,
            currentDepth + 1,
            maxDepth
        );

        return {
            ...commentObj,
            replies
        };
    });
}

module.exports = {
    createComment: async (req, res) => {
        try {
            console.log('🔹 req.user in createComment:', req.user);
            const { content, topicId, parentId } = req.body;
            const author = req.user._id;
    
            if (!content || !topicId) {
                return res.status(400).json({ error: 'Content and Topic ID are required' });
            }
    
            const topic = await Topic.findById(topicId);
            if (!topic) {
                return res.status(404).json({ error: 'Topic not found' });
            }
    
            if (parentId) {
                const parentComment = await Comment.findById(parentId);
                if (!parentComment) {
                    return res.status(404).json({ error: 'Parent comment not found' });
                }
                
                if (parentComment.topic.toString() !== topicId) {
                    return res.status(400).json({ error: 'Parent comment does not belong to this topic' });
                }
                
                if (parentComment.parent) {
                    return res.status(400).json({ error: 'Cannot reply to a reply (max depth is 2)' });
                }
            }
    
            const newComment = new Comment({
                content,
                author,
                topic: topicId,
                parent: parentId || null,
            });
    
            const savedComment = await newComment.save();
            
            await savedComment.populate('author', 'username avatar');
    
            topic.comments.push(savedComment._id);
            await topic.save();
    
            res.json(savedComment);
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Internal Server Error' });
        }
    },  

    getCommentTreeByTopic: async (req, res) => {
        try {
            const { topicId } = req.params;
            const { depth = 2, limit = 100, sort = 'createdAt' } = req.query;
    
            const maxDepth = Math.min(parseInt(depth) || 2, 5); 
    
            const comments = await Comment.find({ topic: topicId })
                .populate("author", "username avatar")
                .sort({ [sort]: sort === 'createdAt' ? 1 : -1 })
                .limit(parseInt(limit));
    
            const plainComments = comments.map(comment => comment.toObject());
    
            const commentTree = buildCommentTree(plainComments, null, 0, maxDepth);
    
            res.json(commentTree);
        } catch (error) {
            console.error("Error building comment tree:", error);
            res.status(500).json({ error: "Internal Server Error" });
        }
    },
    
    getCommentsByTopic: async (req, res) => {
        try {
            const comments = await Comment.find({ topic: req.params.topicId })
                .populate("author", "username avatar")
                .sort({ createdAt: 1 });
            res.json(comments);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },

    deleteComment: async (req, res) => {
        try {
            const { id } = req.params;
            const userId = req.user._id;
    
            const comment = await Comment.findById(id);
            if (!comment) {
                return res.status(404).json({ error: "Comment not found" });
            }
    
            if (comment.author.toString() !== userId.toString()) {
                return res.status(403).json({ error: "Unauthorized" });
            }
    
            await Comment.deleteMany({ parent: id });
    
            await Comment.findByIdAndDelete(id);
    
            await Promise.all([
                User.findByIdAndUpdate(userId, { $pull: { comments: id } }),
                Topic.findByIdAndUpdate(comment.topic, { $pull: { comments: id } })
            ]);
    
            return res.json({ message: "Comment deleted successfully" });
        } catch (error) {
            return res.status(500).json({ error: error.message });
        }
    }
    
};
