const express = require('express');
const { getAllProdutos, getProdutoById, createProduto, updateProduto, deleteProduto } = require('../controllers/produtoController');
const { protect, authorize } = require('../middlewares/authMiddleware');
const router = express.Router();

router.route('/')
  .get(getAllProdutos)
  .post(protect, authorize('Gerente'), createProduto);

router.route('/:id')
  .get(getProdutoById)
  .put(protect, authorize('Gerente', 'Funcionário'), updateProduto)
  .delete(protect, authorize('Gerente'), deleteProduto);

module.exports = router;
