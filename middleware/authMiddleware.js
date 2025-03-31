const jwt = require('jsonwebtoken');
const User = require('../models/api/User');

const authMiddleware = async (req, res, next) => {
    try {
        let token = req.headers.authorization?.split(' ')[1]; // Lấy token từ headers

        if (!token && req.session.token) { 
            token = req.session.token; // Lấy token từ session nếu không có trong headers
        }

        if (!token) {
            console.log('Token is missing');
            return res.status(401).json({ message: 'Unauthorized' });
        }

        const decodedToken = jwt.verify(token, process.env.JWT_SEC);
        const user = await User.findById(decodedToken.userId);
        
        if (!user) {
            console.log('User not found');
            return res.status(401).json({ message: 'Unauthorized' });
        }

        req.user = user;
        next();
    } catch (error) {
        console.error('Error in authentication middleware:', error);
        return res.status(401).json({ message: 'Unauthorized' });
    }
};

module.exports = authMiddleware;
