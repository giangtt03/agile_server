const User = require('../models/user');
const jwt = require('jsonwebtoken');

const sessionMiddleware = async (req, res, next) => {
  try {
    if (req.session && req.session.user) {
      next();
    } else {
      const token = req.headers.authorization;

      if (!token) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const decoded = jwt.verify(token, process.env.JWT_SEC);

      const user = await User.findById(decoded.userId);

      if (!user) {
        return res.status(401).json({ error: 'User not found' });
      }

      req.session.user = user;

      next();
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

module.exports = sessionMiddleware;
