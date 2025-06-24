const Produto = require('../models/Produto');

exports.getAllProdutos = async (req, res) => {
  try {
    const produtos = await Produto.find().populate('categoria').populate('fornecedor');
    res.status(200).json({ success: true, count: produtos.length, data: produtos });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Erro no servidor', error: error.message });
  }
};

exports.getProdutoById = async (req, res) => {
  try {
    const produto = await Produto.findById(req.params.id).populate('categoria').populate('fornecedor');
    if (!produto) {
      return res.status(404).json({ success: false, message: 'Produto não encontrado' });
    }
    res.status(200).json({ success: true, data: produto });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Erro no servidor', error: error.message });
  }
};

exports.createProduto = async (req, res) => {
  try {
    const produto = await Produto.create(req.body);
    res.status(201).json({ success: true, data: produto });
  } catch (error) {
    res.status(400).json({ success: false, message: 'Erro ao criar produto', error: error.message });
  }
};

exports.updateProduto = async (req, res) => {
  try {
    const produto = await Produto.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!produto) {
      return res.status(404).json({ success: false, message: 'Produto não encontrado' });
    }
    res.status(200).json({ success: true, data: produto });
  } catch (error) {
    res.status(400).json({ success: false, message: 'Erro ao atualizar produto', error: error.message });
  }
};

exports.deleteProduto = async (req, res) => {
  try {
    const produto = await Produto.findByIdAndDelete(req.params.id);
    if (!produto) {
      return res.status(404).json({ success: false, message: 'Produto não encontrado' });
    }
    res.status(200).json({ success: true, message: 'Produto deletado' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Erro no servidor', error: error.message });
  }
};
