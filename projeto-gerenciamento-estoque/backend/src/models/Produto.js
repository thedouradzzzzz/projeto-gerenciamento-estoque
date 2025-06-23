const mongoose = require('mongoose');

const ProdutoSchema = new mongoose.Schema({
  nome: { type: String, required: [true, 'O nome do produto � obrigat�rio'], trim: true },
  descricao: { type: String },
  preco: { type: Number, required: [true, 'O pre�o � obrigat�rio'], min: [0, 'O pre�o n�o pode ser negativo'] },
  quantidade: { type: Number, required: true, default: 0, min: [0, 'A quantidade n�o pode ser negativa'] },
  categoria: { type: mongoose.Schema.ObjectId, ref: 'Categoria', required: true },
  fornecedor: { type: mongoose.Schema.ObjectId, ref: 'Fornecedor' },
}, { timestamps: true });

module.exports = mongoose.model('Produto', ProdutoSchema);
