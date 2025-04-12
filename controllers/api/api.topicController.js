const Topic = require("../../models/api/topic");
const User = require("../../models/api/User");

const removeAccents = (str) => {
    return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
};

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
            const topics = await Topic.find().populate("author", "username avatar").sort({ createdAt: -1 });
            res.json(topics);
        } catch (error) {
            console.error("Error in getTopics:", error);
            res.status(500).json({ error: error.message });
        }
    },
    
    getTopicById: async (req, res) => {
        try {
            const topic = await Topic.findById(req.params.id).populate("author", "username avatar");
            if (!topic) return res.status(404).json({ error: "Topic not found" });
            res.json(topic);
        } catch (error) {
            console.error("Error in getTopicById:", error);
            res.status(500).json({ error: error.message });
        }
    },

    deleteTopic: async (req, res) => {
        try {
            console.log("User from req:", req.user); 
            const topic = await Topic.findById(req.params.id);
            if (!topic) return res.status(404).json({ error: "Topic not found" });
    
            console.log("Topic author:", topic.author.toString());
            console.log("Request user ID:", req.user._id);
    
            if (topic.author.toString() !== req.user._id.toString()) { 
                return res.status(403).json({ error: "Unauthorized" });
            }
            
            await topic.deleteOne();
            await User.findByIdAndUpdate(req.user._id, { $pull: { topics: topic._id } });
            res.json({ message: "Topic deleted" });
        } catch (error) {
            console.error("Error in deleteTopic:", error);
            res.status(500).json({ error: error.message });
        }
    },
    
    getTopicsByTag: async (req, res) => {
        try {
            const { tag } = req.params; 

            const topics = await Topic.find({ tags: tag }).populate("author", "username avatar").sort({ createdAt: -1 });

            if (topics.length === 0) {
                return res.status(404).json({ error: `No topics found for tag: ${tag}` });
            }

            res.json(topics);
        } catch (error) {
            console.error("Error in getTopicsByTag:", error);
            res.status(500).json({ error: error.message });
        }
    },

    searchTopics: async (req, res) => {
        try {
            const { title } = req.query;
            if (!title) {
                return res.status(400).json({ message: "Missing search query" });
            }

            const normalizedQuery = removeAccents(title).toLowerCase();

            // Chỉ tìm từ hoàn chỉnh bằng \b (word boundary)
            const regexQuery = title.split(" ").map(word => `\\b${word}\\b`).join("|");
            const regexNormalizedQuery = normalizedQuery.split(" ").map(word => `\\b${word}\\b`).join("|");

            const topics = await Topic.find({
                $or: [
                    { title: { $regex: new RegExp(regexQuery, "i") } },
                    { title: { $regex: new RegExp(regexNormalizedQuery, "i") } }
                ]
            });

            res.json(topics);
        } catch (error) {
            console.error("Error in searchTopics:", error);
            res.status(500).json({ error: error.message });
        }
    }
};
