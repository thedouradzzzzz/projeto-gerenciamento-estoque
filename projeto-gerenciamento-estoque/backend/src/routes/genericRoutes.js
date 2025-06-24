const express = require('express');
const { protect, authorize } = require('../middlewares/authMiddleware');

// Fun��o gen�rica para criar rotas CRUD
const createCrudRoutes = (controller) => {
  const router = express.Router();
  
  router.route('/')
    .get(controller.getAll) // Pode ser p�blico ou protegido, ajuste conforme necess�rio
    .post(protect, authorize('Gerente', 'Funcion�rio'), controller.create);

  router.route('/:id')
    .get(controller.getById)
    .put(protect, authorize('Gerente', 'Funcion�rio'), controller.update)
    .delete(protect, authorize('Gerente'), controller.delete);
    
  return router;
};

module.exports = createCrudRoutes;
