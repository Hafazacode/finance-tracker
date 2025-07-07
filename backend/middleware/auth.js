const jwt = require('jsonwebtoken');
require('dotenv').config();

const protect = (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      // Ambil token dari header
      token = req.headers.authorization.split(' ')[1];

      // Verifikasi token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Simpan user id dari payload token ke request object
      req.user = { id: decoded.id };

      next();
    } catch (error) {
      console.error(error);
      res.status(401).json({ message: 'Tidak terautentikasi, token gagal' });
    }
  }

  if (!token) {
    res.status(401).json({ message: 'Tidak terautentikasi, tidak ada token' });
  }
};

module.exports = { protect };