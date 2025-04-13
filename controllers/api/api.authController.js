const multer = require('multer');
const TKNguoiDung = require('../../models/api/User');
const Topic = require("../../models/api/topic")
const Comment = require("../../models/api/comment")
const CryptoJs = require('crypto-js');
const jwt = require('jsonwebtoken');


const storage = multer.memoryStorage();
const upload = multer({ storage });

module.exports = {
    createTK: async (req, res) => {
        try {
            const { username, email, password } = req.body;
            if (!username || !email || !password || !req.file) {
                return res.status(400).json({ error: 'All fields are required' });
            }

            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(email)) {
                return res.status(400).json({ error: 'Invalid email format' });
            }

            if (password.length < 6) {
                return res.status(400).json({ error: 'Password must be at least 6 characters long' });
            }

            const existingUser = await TKNguoiDung.findOne({ email });
            if (existingUser) {
                return res.status(400).json({ error: 'Email already exists' });
            }

            // Mã hóa mật khẩu
            const encryptedPassword = CryptoJs.AES.encrypt(password, process.env.SECRET).toString();

            // Chuyển ảnh sang Base64
            const avatarBase64 = `data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}`;

            const newUser = new TKNguoiDung({
                username,
                email,
                password: encryptedPassword,
                avatar: avatarBase64
            });

            const savedUser = await newUser.save();
            res.json({ savedUser: { ...savedUser._doc, password: undefined } });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },

    loginTK: async (req, res) => {
        try {
            const { email, password } = req.body;

            if (!email || !password) {
                return res.status(400).json({ error: 'Email and password are required' });
            }

            const user = await TKNguoiDung.findOne({ email });

            if (!user) {
                return res.status(401).json({ error: 'User not found' });
            }

            const bytes = CryptoJs.AES.decrypt(user.password, process.env.SECRET);
            const originalPassword = bytes.toString(CryptoJs.enc.Utf8);

            if (originalPassword !== password) {
                return res.status(401).json({ error: 'Invalid credentials' });
            }

            const token = jwt.sign({ userId: user._id }, process.env.JWT_SEC, { expiresIn: '1d' });

            res.json({ user: user, token: token });

        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Internal Server Error' });
        }
    },

    getUserById: async (req, res) => {
        try {
            const { id } = req.params;
            const user = await TKNguoiDung.findById(id).select('-password');

            if (!user) {
                return res.status(404).json({ error: 'User not found' });
            }

            res.json(user);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },
    updateProfile: async (req, res) => {
        try {
            const { id } = req.params;
            const { username } = req.body;

            const user = await TKNguoiDung.findById(id);
            if (!user) {
                return res.status(404).json({ error: 'User not found' });
            }

            if (username) {
                user.username = username;
            }

            if (req.file) {
                const avatarBase64 = `data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}`;
                user.avatar = avatarBase64;
            }

            //   console.log('req.file:', req.file); 
            //   console.log('req.body.username:', req.body.username);

            const updatedUser = await user.save();

            res.json({
                updatedUser: {
                    ...updatedUser._doc,
                    password: undefined
                }
            });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },
    getUserProfile: async (req, res) => {
        try {
            const { userId } = req.params;

            const user = await TKNguoiDung.findById(userId).select("-password");

            if (!user) {
                return res.status(404).json({ error: "User not found" });
            }

            const topicsCount = await Topic.countDocuments({ author: userId });
            const commentsCount = await Comment.countDocuments({ author: userId });

            const latestTopic = await Topic.findOne({ author: userId }).sort({ createdAt: -1 });
            const latestComment = await Comment.findOne({ author: userId }).sort({ createdAt: -1 });

            let lastActivity = user.updatedAt;
            if (latestTopic && latestComment) {
                lastActivity = new Date(
                    Math.max(new Date(latestTopic.createdAt).getTime(), new Date(latestComment.createdAt).getTime())
                );
            } else if (latestTopic) {
                lastActivity = latestTopic.createdAt;
            } else if (latestComment) {
                lastActivity = latestComment.createdAt;
            }

            res.json({
                user,
                stats: {
                    topicsCount,
                    commentsCount,
                    lastActivity,
                },
            });
        } catch (error) {
            console.error("Error in getUserProfile:", error);
            res.status(500).json({ error: error.message });
        }
    },

    getUserTopics: async (req, res) => {
        try {
            const { userId } = req.params;

            const user = await TKNguoiDung.findById(userId);
            if (!user) {
                return res.status(404).json({ error: "User not found" });
            }

            const topics = await Topic.find({ author: userId })
                .populate("author", "username avatar")
                .sort({ createdAt: -1 });

            res.json(topics);
        } catch (error) {
            console.error("Error in getUserTopics:", error);
            res.status(500).json({ error: error.message });
        }
    },

    getUserComments: async (req, res) => {
        try {
            const { userId } = req.params;

            const user = await TKNguoiDung.findById(userId);
            if (!user) {
                return res.status(404).json({ error: "User not found" });
            }

            const comments = await Comment.find({ author: userId })
                .populate("author", "username avatar")
                .populate("topic", "title")
                .sort({ createdAt: -1 });

            res.json(comments);
        } catch (error) {
            console.error("Error in getUserComments:", error);
            res.status(500).json({ error: error.message });
        }
    }

};
