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
            return res.render('login');
        }

        const { email, password } = req.body;

        const user = await User.findOne({ email });

        if (!user) {
            return res.status(401).json({ error: 'User not found' });
        }

        // Kiểm tra mật khẩu
        const bytes = CryptoJs.AES.decrypt(user.password, process.env.SECRET);
        const originalPassword = bytes.toString(CryptoJs.enc.Utf8);

        if (originalPassword !== password) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        const token = jwt.sign({ userId: user._id, role: user.role }, process.env.JWT_SEC, { expiresIn: '1h' });

        // Lưu thông tin người dùng và token vào session
        req.session.user = user;
        req.session.token = token;

        console.log("Data user: ", user)

        res.render('menu', { user: user});

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
}

};
