const jwt = require('jsonwebtoken');
const User = require('../models/User');

exports.protect = async (req, res, next) => {
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = await User.findById(decoded.id).select('-senha');
      if (!req.user) {
        return res.status(401).json({ success: false, message: 'Usuário não encontrado.' });
      }
      next();
    } catch (error) {
      return res.status(401).json({ success: false, message: 'Não autorizado, token inválido.' });
    }
  }
  if (!token) {
    return res.status(401).json({ success: false, message: 'Não autorizado, sem token.' });
  }
};

exports.authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.cargo)) {
      return res.status(403).json({ success: false, message: O usuário com o cargo '\' não tem permissão para acessar esta rota. });
    }
    next();
  };
};
