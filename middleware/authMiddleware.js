const jwt = require('jsonwebtoken');
const User = require('../models/api/User');

const authMiddleware = async (req, res, next) => {
    try {
        let token = req.headers.authorization?.split(' ')[1];

        if (!token && req.session?.token) { 
            token = req.session.token;
        }

        console.log('🔹 Token received:', token); 

        if (!token) {
            console.log(' Token is missing');
            return res.status(401).json({ message: 'Unauthorized' });
        }

        let decodedToken;
        try {
            decodedToken = jwt.verify(token, process.env.JWT_SEC);
            console.log('🔹 Decoded Token:', decodedToken);
        } catch (error) {
            console.log(' Token verification failed:', error.message);
            if (error.name === 'TokenExpiredError') {
                return res.status(401).json({ message: 'Token expired' });
            }
            return res.status(401).json({ message: 'Unauthorized' });
        }

        const user = await User.findById(decodedToken.userId);
        console.log('🔹 User found:', user);

        if (!user) {
            console.log(' User not found');
            return res.status(401).json({ message: 'Unauthorized' });
        }

        req.user = user;
        console.log('🔹 req.user after middleware:', req.user);
        next();
    } catch (error) {
        console.error(' Error in authentication middleware:', error);
        return res.status(401).json({ message: 'Unauthorized' });
    }
};

module.exports = authMiddleware;
