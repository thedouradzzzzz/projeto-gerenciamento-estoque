
import React, { useState, useMemo } from 'react';
import type { Product, AddQuantityFormData, SubtractQuantityFormData, Company } from '../../types';
import { COMPANY_OPTIONS } from '../../constants'; // PRODUCT_TYPES_ARRAY removed from here
import AddQuantityModal from '../../components/products/AddQuantityModal';
import SubtractQuantityModal from '../../components/products/SubtractQuantityModal';
import { PlusIcon, MinusIcon } from '../../components/icons/Icons';

interface ProductSearchPageProps {
  products: Product[];
  productTypes: string[]; // Added prop
  onUpdateQuantity: (productId: string, amountChange: number, details: { purchaseOrder?: string; destinationAssetId?: string, ticketNumber?: string }) => void;
}

const ProductSearchPage: React.FC<ProductSearchPageProps> = ({ products, productTypes, onUpdateQuantity }) => {
  const [filters, setFilters] = useState({
    brand: '',
    type: '',
    model: '',
    description: '',
    barcode: '',
    company: '',
  });

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isSubtractModalOpen, setIsSubtractModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  const inputBaseClasses = "mt-1 block w-full px-3 py-2 bg-white text-gray-900 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm";

  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFilters(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const filteredProducts = useMemo(() => {
    return products.filter(product => {
      return (
        (filters.brand ? product.brand.toLowerCase().includes(filters.brand.toLowerCase()) : true) &&
        (filters.type ? product.type === filters.type : true) &&
        (filters.model ? product.model.toLowerCase().includes(filters.model.toLowerCase()) : true) &&
        (filters.description ? product.description.toLowerCase().includes(filters.description.toLowerCase()) : true) &&
        (filters.barcode ? product.barcode.toLowerCase().includes(filters.barcode.toLowerCase()) : true) &&
        (filters.company ? product.company === filters.company : true)
      );
    });
  }, [products, filters]);

  const openAddQuantityModal = (product: Product) => {
    setSelectedProduct(product);
    setIsAddModalOpen(true);
  };

  const openSubtractQuantityModal = (product: Product) => {
    setSelectedProduct(product);
    setIsSubtractModalOpen(true);
  };

  const closeModal = () => {
    setIsAddModalOpen(false);
    setIsSubtractModalOpen(false);
    setSelectedProduct(null);
  };

  const handleConfirmAddQuantity = (data: AddQuantityFormData) => {
    if (selectedProduct) {
      onUpdateQuantity(selectedProduct.id, data.amount, { purchaseOrder: data.purchaseOrder });
    }
    closeModal();
  };

  const handleConfirmSubtractQuantity = (data: SubtractQuantityFormData) => {
    if (selectedProduct) {
      onUpdateQuantity(selectedProduct.id, -data.amount, { destinationAssetId: data.destinationAssetId, ticketNumber: data.ticketNumber });
    }
    closeModal();
  };
  
  const clearFilters = () => {
    setFilters({ brand: '', type: '', model: '', description: '', barcode: '', company: '' });
  };


  return (
    <div className="bg-white p-6 md:p-8 rounded-xl shadow-lg">
      <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6">Buscar Produtos</h1>

      <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 items-end">
          <input type="text" name="brand" placeholder="Marca" value={filters.brand} onChange={handleFilterChange} className={inputBaseClasses}/>
          <select name="type" value={filters.type} onChange={handleFilterChange} className={inputBaseClasses}>
            <option value="">Todos os Tipos</option>
            {productTypes.map(type => <option key={type} value={type}>{type}</option>)}
          </select>
          <input type="text" name="model" placeholder="Modelo" value={filters.model} onChange={handleFilterChange} className={inputBaseClasses}/>
          <input type="text" name="description" placeholder="Descrição" value={filters.description} onChange={handleFilterChange} className={inputBaseClasses}/>
          <input type="text" name="barcode" placeholder="Código de Barras" value={filters.barcode} onChange={handleFilterChange} className={inputBaseClasses}/>
          <select name="company" value={filters.company} onChange={handleFilterChange} className={inputBaseClasses}>
            <option value="">Todas as Empresas</option>
            {COMPANY_OPTIONS.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
          </select>
          <button 
            onClick={clearFilters}
            className="col-span-1 sm:col-span-2 lg:col-span-3 xl:col-span-6 mt-2 sm:mt-0 sm:ml-auto xl:ml-0 xl:mt-2 w-full xl:w-auto px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition"
            >
            Limpar Filtros
          </button>
        </div>
      </div>
      

      <div className="overflow-x-auto rounded-lg border border-gray-200">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tipo</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Marca/Modelo</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Empresa</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Descrição</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cód. Barras</th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Qtd.</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ações de Qtd.</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredProducts.map(product => (
              <tr key={product.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800">{product.type}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">{product.brand}</div>
                  <div className="text-xs text-gray-500">{product.model}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800">{product.company}</td>
                <td className="px-6 py-4 whitespace-normal text-sm text-gray-500 max-w-xs truncate" title={product.description}>{product.description}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{product.barcode}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800 font-semibold text-center">{product.quantity}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm space-x-2">
                  <button onClick={() => openAddQuantityModal(product)} title="Adicionar Quantidade" className="text-green-600 hover:text-green-900 p-1 rounded hover:bg-green-100 transition"><PlusIcon className="h-5 w-5"/></button>
                  <button onClick={() => openSubtractQuantityModal(product)} title="Subtrair Quantidade" className="text-red-600 hover:text-red-900 p-1 rounded hover:bg-red-100 transition"><MinusIcon className="h-5 w-5"/></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {filteredProducts.length === 0 && (
        <div className="text-center py-10 text-gray-500">
          Nenhum produto encontrado com os filtros atuais.
        </div>
      )}

      {selectedProduct && (
        <>
          <AddQuantityModal 
            isOpen={isAddModalOpen} 
            onClose={closeModal} 
            onConfirmAdd={handleConfirmAddQuantity} 
            productName={`${selectedProduct.brand} ${selectedProduct.model}`} 
          />
          <SubtractQuantityModal 
            isOpen={isSubtractModalOpen} 
            onClose={closeModal} 
            onConfirmSubtract={handleConfirmSubtractQuantity} 
            productName={`${selectedProduct.brand} ${selectedProduct.model}`}
            currentQuantity={selectedProduct.quantity}
          />
        </>
      )}
    </div>
  );
};

export default ProductSearchPage;
