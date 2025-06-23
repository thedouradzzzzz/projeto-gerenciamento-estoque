
import React, { useState } from 'react';
import Modal from '../../components/common/Modal';
import { PlusIcon, PencilIcon, TrashIcon } from '../../components/icons/Icons';

interface ProductTypeManagementPageProps {
  productTypes: string[];
  onAddProductType: (typeName: string) => boolean; // Returns true on success, false on failure (e.g. duplicate)
  onEditProductType: (oldTypeName: string, newTypeName: string) => boolean; // Returns true on success, false on failure
  onDeleteProductType: (typeName: string) => void;
}

const ProductTypeManagementPage: React.FC<ProductTypeManagementPageProps> = ({
  productTypes,
  onAddProductType,
  onEditProductType,
  onDeleteProductType,
}) => {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  
  const [currentTypeName, setCurrentTypeName] = useState('');
  const [selectedProductType, setSelectedProductType] = useState<string | null>(null);
  const [modalError, setModalError] = useState<string | null>(null);

  const inputBaseClasses = "mt-1 block w-full px-3 py-2 bg-white text-gray-900 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm";

  const openAddModal = () => {
    setCurrentTypeName('');
    setModalError(null);
    setIsAddModalOpen(true);
  };

  const openEditModal = (typeName: string) => {
    setSelectedProductType(typeName);
    setCurrentTypeName(typeName);
    setModalError(null);
    setIsEditModalOpen(true);
  };

  const openDeleteModal = (typeName: string) => {
    setSelectedProductType(typeName);
    setModalError(null);
    setIsDeleteModalOpen(true);
  };

  const closeModal = () => {
    setIsAddModalOpen(false);
    setIsEditModalOpen(false);
    setIsDeleteModalOpen(false);
    setSelectedProductType(null);
    setCurrentTypeName('');
    setModalError(null);
  };

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setModalError(null);
    if (!currentTypeName.trim()) {
      setModalError('O nome do tipo não pode ser vazio.');
      return;
    }
    const success = onAddProductType(currentTypeName.trim());
    if (success) {
      closeModal();
    } else {
      setModalError('Este tipo de produto já existe.');
    }
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setModalError(null);
    if (!selectedProductType || !currentTypeName.trim()) {
      setModalError('O nome do tipo não pode ser vazio.');
      return;
    }
    const success = onEditProductType(selectedProductType, currentTypeName.trim());
    if (success) {
      closeModal();
    } else {
      setModalError('Este tipo de produto já existe (ou ocorreu um erro).');
    }
  };

  const handleDeleteConfirm = () => {
    if (selectedProductType) {
      onDeleteProductType(selectedProductType);
      closeModal();
    }
  };
  
  const sortedProductTypes = [...productTypes].sort((a,b) => a.localeCompare(b));

  return (
    <div className="bg-white p-6 md:p-8 rounded-xl shadow-lg">
      <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">Gerenciar Tipos de Produto</h1>
        <button
          onClick={openAddModal}
          className="flex items-center bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg shadow-md transition duration-150"
        >
          <PlusIcon className="h-5 w-5 mr-2" />
          Adicionar Tipo
        </button>
      </div>

      {sortedProductTypes.length === 0 ? (
        <p className="text-gray-500 text-center py-8">Nenhum tipo de produto cadastrado.</p>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-gray-200">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nome do Tipo</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ações</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {sortedProductTypes.map((type) => (
                <tr key={type} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{type}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-1">
                    <button onClick={() => openEditModal(type)} title="Editar" className="text-indigo-600 hover:text-indigo-900 p-1 rounded hover:bg-indigo-100 transition"><PencilIcon className="h-5 w-5"/></button>
                    <button onClick={() => openDeleteModal(type)} title="Excluir" className="text-red-600 hover:text-red-900 p-1 rounded hover:bg-red-100 transition"><TrashIcon className="h-5 w-5"/></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Add Modal */}
      <Modal 
        isOpen={isAddModalOpen} 
        onClose={closeModal} 
        title="Adicionar Novo Tipo de Produto"
        footer={
          <>
            <button type="button" onClick={closeModal} className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50">Cancelar</button>
            <button type="submit" form="addProductTypeForm" className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md shadow-sm hover:bg-blue-700">Adicionar</button>
          </>
        }
      >
        <form id="addProductTypeForm" onSubmit={handleAddSubmit} className="space-y-4">
          {modalError && <p className="text-sm text-red-600 bg-red-100 p-3 rounded-md border border-red-300">{modalError}</p>}
          <div>
            <label htmlFor="typeNameAdd" className="block text-sm font-medium text-gray-700">Nome do Tipo</label>
            <input type="text" name="typeNameAdd" id="typeNameAdd" value={currentTypeName} onChange={(e) => setCurrentTypeName(e.target.value)} required className={inputBaseClasses}/>
          </div>
        </form>
      </Modal>

      {/* Edit Modal */}
      <Modal 
        isOpen={isEditModalOpen} 
        onClose={closeModal} 
        title={`Editar Tipo de Produto: ${selectedProductType}`}
        footer={
          <>
            <button type="button" onClick={closeModal} className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50">Cancelar</button>
            <button type="submit" form="editProductTypeForm" className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md shadow-sm hover:bg-blue-700">Salvar</button>
          </>
        }
      >
        <form id="editProductTypeForm" onSubmit={handleEditSubmit} className="space-y-4">
          {modalError && <p className="text-sm text-red-600 bg-red-100 p-3 rounded-md border border-red-300">{modalError}</p>}
          <div>
            <label htmlFor="typeNameEdit" className="block text-sm font-medium text-gray-700">Novo Nome do Tipo</label>
            <input type="text" name="typeNameEdit" id="typeNameEdit" value={currentTypeName} onChange={(e) => setCurrentTypeName(e.target.value)} required className={inputBaseClasses}/>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal 
        isOpen={isDeleteModalOpen} 
        onClose={closeModal} 
        title="Confirmar Exclusão"
        footer={
          <>
            <button type="button" onClick={closeModal} className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50">Cancelar</button>
            <button type="button" onClick={handleDeleteConfirm} className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md shadow-sm hover:bg-red-700">Excluir</button>
          </>
        }
      >
        <p className="text-sm text-gray-600">
          Tem certeza que deseja excluir o tipo de produto <strong className="font-medium text-gray-800">{selectedProductType}</strong>? 
          Esta ação não pode ser desfeita. Produtos existentes com este tipo manterão o nome antigo, mas ele não estará mais disponível para seleção.
        </p>
      </Modal>
    </div>
  );
};

export default ProductTypeManagementPage;
