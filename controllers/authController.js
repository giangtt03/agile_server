const User = require('../models/user');
const CryptoJs = require('crypto-js');
const jwt = require('jsonwebtoken');

module.exports = {
  createUser: async (req, res) => {
    try {
      const { username, email, password, avatar, role } = req.body;

      // Mã hóa mật khẩu
      const encryptedPassword = CryptoJs.AES.encrypt(password, process.env.SECRET).toString();

      const newUser = new User({
        username,
        email,
        password: encryptedPassword,
        avatar,
        role
      });

      const savedUser = await newUser.save();
      res.json({ savedUser: { ...savedUser._doc, password: undefined } });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  loginUser: async (req, res) => {
    try {
      if (req.method === "GET") {
        return res.render('login', { error: null });
      }

      const { email, password } = req.body;

      const user = await User.findOne({ email });

      if (!user) {
        return res.render('login', { error: 'User not found' });
      }

      // Giải mã mật khẩu
      const bytes = CryptoJs.AES.decrypt(user.password, process.env.SECRET);
      const originalPassword = bytes.toString(CryptoJs.enc.Utf8);

      if (originalPassword !== password) {
        return res.render('login', { error: 'Invalid credentials' });
      }

      const token = jwt.sign({ userId: user._id, role: user.role }, process.env.JWT_SEC, { expiresIn: '1h' });

      req.session.user = user;
      req.session.token = token;

      res.render('menu', { user: user });

    } catch (error) {
      console.error(error);
      res.render('login', { error: 'Internal Server Error' });
    }
  }
};
