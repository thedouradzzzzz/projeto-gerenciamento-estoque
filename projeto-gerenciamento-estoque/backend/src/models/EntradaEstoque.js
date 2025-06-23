const mongoose = require('mongoose');

const EntradaEstoqueSchema = new mongoose.Schema({
  produto: { type: mongoose.Schema.ObjectId, ref: 'Produto', required: true },
  quantidade: { type: Number, required: [true, 'A quantidade de entrada � obrigat�ria'], min: [1, 'A quantidade deve ser de no m�nimo 1'] },
  precoCusto: { type: Number, required: [true, 'O pre�o de custo � obrigat�rio'] },
  dataEntrada: { type: Date, default: Date.now },
  usuario: { type: mongoose.Schema.ObjectId, ref: 'User', required: true },
}, { timestamps: true });

module.exports = mongoose.model('EntradaEstoque', EntradaEstoqueSchema);
