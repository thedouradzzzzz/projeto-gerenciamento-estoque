const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema({
  nome: { type: String, required: [true, 'O nome � obrigat�rio'] },
  email: { type: String, required: [true, 'O e-mail � obrigat�rio'], unique: true, lowercase: true, match: [/\S+@\S+\.\S+/, 'Por favor, use um e-mail v�lido.'] },
  senha: { type: String, required: [true, 'A senha � obrigat�ria'], select: false },
  cargo: { type: String, enum: ['Gerente', 'Funcion�rio'], default: 'Funcion�rio' },
}, { timestamps: true });

UserSchema.pre('save', async function (next) {
  if (!this.isModified('senha')) return next();
  const salt = await bcrypt.genSalt(10);
  this.senha = await bcrypt.hash(this.senha, salt);
  next();
});

module.exports = mongoose.model('User', UserSchema);
