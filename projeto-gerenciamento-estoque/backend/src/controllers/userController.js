const User = require('../models/User');

exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find();
    res.status(200).json({ success: true, count: users.length, data: users });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Erro no servidor' });
  }
};

exports.getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'Usu�rio n�o encontrado' });
    }
    res.status(200).json({ success: true, data: user });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Erro no servidor' });
  }
};

exports.updateUser = async (req, res) => {
  try {
    // N�o permitir atualiza��o de senha por esta rota para seguran�a
    const { senha, ...updateData } = req.body;
    
    const user = await User.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
      runValidators: true,
    });
    if (!user) {
      return res.status(404).json({ success: false, message: 'Usu�rio n�o encontrado' });
    }
    res.status(200).json({ success: true, data: user });
  } catch (error) {
    res.status(400).json({ success: false, message: 'Erro ao atualizar usu�rio', error: error.message });
  }
};

exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'Usu�rio n�o encontrado' });
    }
    res.status(200).json({ success: true, message: 'Usu�rio deletado' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Erro no servidor' });
  }
};
