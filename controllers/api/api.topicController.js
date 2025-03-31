const Topic = require("../../models/api/topic");
const User = require("../../models/api/User");

module.exports = {
    createTopic: async (req, res) => {
        try {
            const { title, content, tags } = req.body;
            const author = req.user._id; // Lấy author từ token 

            if (!title || !content || !tags) {
                return res.status(400).json({ error: 'All fields are required' });
            }

            const newTopic = new Topic({
                title,
                content,
                tags,
                author
            });

            const savedTopic = await newTopic.save();
            res.json(savedTopic);
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Internal Server Error' });
        }
    },

    getTopics: async (req, res) => {
        try {
            const topics = await Topic.find().populate("author", "username").sort({ createdAt: -1 });
            res.json(topics);
        } catch (error) {
            console.error("Error in getTopics:", error);
            res.status(500).json({ error: error.message });
        }
    },

    getTopicById: async (req, res) => {
        try {
            const topic = await Topic.findById(req.params.id).populate("author", "username");
            if (!topic) return res.status(404).json({ error: "Topic not found" });
            res.json(topic);
        } catch (error) {
            console.error("Error in getTopicById:", error);
            res.status(500).json({ error: error.message });
        }
    },

    deleteTopic: async (req, res) => {
        try {
            const topic = await Topic.findById(req.params.id);
            if (!topic) return res.status(404).json({ error: "Topic not found" });
            if (topic.author.toString() !== req.user.userId) return res.status(403).json({ error: "Unauthorized" });
            
            await topic.remove();
            await User.findByIdAndUpdate(req.user.userId, { $pull: { topics: topic._id } });
            res.json({ message: "Topic deleted" });
        } catch (error) {
            console.error("Error in deleteTopic:", error);
            res.status(500).json({ error: error.message });
        }
    },
    getTopicsByTag: async (req, res) => {
        try {
            const { tag } = req.params; // Lấy tag từ tham số URL

            // Tìm các topic có chứa tag này
            const topics = await Topic.find({ tags: tag }).populate("author", "username").sort({ createdAt: -1 });

            if (topics.length === 0) {
                return res.status(404).json({ error: `No topics found for tag: ${tag}` });
            }

            res.json(topics);
        } catch (error) {
            console.error("Error in getTopicsByTag:", error);
            res.status(500).json({ error: error.message });
        }
    }
};
