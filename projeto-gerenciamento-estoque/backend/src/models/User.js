const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema({
  nome: { type: String, required: [true, 'O nome é obrigatório'] },
  email: { type: String, required: [true, 'O e-mail é obrigatório'], unique: true, lowercase: true, match: [/\S+@\S+\.\S+/, 'Por favor, use um e-mail válido.'] },
  senha: { type: String, required: [true, 'A senha é obrigatória'], select: false },
  cargo: { type: String, enum: ['Gerente', 'Funcionário'], default: 'Funcionário' },
}, { timestamps: true });

UserSchema.pre('save', async function (next) {
  if (!this.isModified('senha')) return next();
  const salt = await bcrypt.genSalt(10);
  this.senha = await bcrypt.hash(this.senha, salt);
  next();
});

module.exports = mongoose.model('User', UserSchema);
