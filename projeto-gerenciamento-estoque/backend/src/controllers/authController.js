const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });
};

exports.register = async (req, res) => {
  const { nome, email, senha, cargo } = req.body;
  try {
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ success: false, message: 'Usuário já cadastrado' });
    }
    const user = await User.create({ nome, email, senha, cargo });
    res.status(201).json({ success: true, token: generateToken(user._id) });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Erro no servidor', error: error.message });
  }
};

exports.login = async (req, res) => {
  const { email, senha } = req.body;
  if (!email || !senha) {
    return res.status(400).json({ success: false, message: 'Forneça e-mail e senha' });
  }
  try {
    const user = await User.findOne({ email }).select('+senha');
    if (!user || !(await bcrypt.compare(senha, user.senha))) {
      return res.status(401).json({ success: false, message: 'Credenciais inválidas' });
    }
    res.json({ success: true, token: generateToken(user._id) });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Erro no servidor', error: error.message });
  }
};

exports.getMe = async (req, res) => {
  res.status(200).json({ success: true, data: req.user });
};
