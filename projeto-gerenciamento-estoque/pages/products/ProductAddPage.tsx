
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import type { Product, ProductFormData, Company } from '../../types';
import { COMPANY_OPTIONS } from '../../constants'; // PRODUCT_TYPES_ARRAY removed

interface ProductAddPageProps {
  products: Product[]; 
  productTypes: string[]; // Added prop
  onAddProduct: (data: ProductFormData & { company: Company }) => void;
}

const ProductAddPage: React.FC<ProductAddPageProps> = ({ products, productTypes, onAddProduct }) => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<ProductFormData & { company: Company }>({
    type: productTypes[0] || '', // Initialize with the first available type or empty string
    brand: '',
    model: '',
    description: '',
    barcode: '',
    company: COMPANY_OPTIONS[0]?.value || 'Catarinense Pharma' as Company,
  });
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const inputBaseClasses = "mt-1 block w-full px-3 py-2 bg-white text-gray-900 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm";

  // Effect to update default type if productTypes prop changes (e.g., after initial load)
  useEffect(() => {
    setFormData(prev => ({
      ...prev,
      type: productTypes[0] || '',
    }));
  }, [productTypes]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);

    if (!formData.type || !formData.brand || !formData.model || !formData.description || !formData.barcode || !formData.company) {
      setError('Todos os campos são obrigatórios.');
      return;
    }
     if (productTypes.length > 0 && !formData.type) {
      setError('Por favor, selecione um tipo de produto válido.');
      return;
    }


    if (products.some(p => p.barcode === formData.barcode)) {
      setError('Já existe um produto com este código de barras.');
      return;
    }

    onAddProduct(formData);
    setSuccessMessage(`Produto "${formData.brand} ${formData.model}" cadastrado com sucesso!`);
    setFormData({ 
        type: productTypes[0] || '', 
        brand: '', model: '', 
        description: '', 
        barcode: '', 
        company: COMPANY_OPTIONS[0]?.value || 'Catarinense Pharma' as Company 
    }); 
    
  };

  return (
    <div className="bg-white p-6 md:p-8 rounded-xl shadow-lg max-w-2xl mx-auto">
      <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6">Cadastrar Novo Produto</h1>
      
      {error && <p className="mb-4 text-sm text-red-600 bg-red-100 p-3 rounded-md border border-red-300">{error}</p>}
      {successMessage && <p className="mb-4 text-sm text-green-600 bg-green-100 p-3 rounded-md border border-green-300">{successMessage}</p>}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="type" className="block text-sm font-medium text-gray-700">Tipo</label>
          <select 
            name="type" 
            id="type" 
            value={formData.type} 
            onChange={handleChange} 
            required
            className={inputBaseClasses}
            disabled={productTypes.length === 0}
          >
            {productTypes.length === 0 ? (
                <option value="" disabled>Nenhum tipo disponível</option>
            ) : (
                productTypes.map(type => (
                <option key={type} value={type}>{type}</option>
                ))
            )}
          </select>
           {productTypes.length === 0 && <p className="mt-1 text-xs text-yellow-600">Nenhum tipo de produto cadastrado. Adicione tipos na seção 'Tipos de Produto'.</p>}
        </div>

        <div>
          <label htmlFor="brand" className="block text-sm font-medium text-gray-700">Marca</label>
          <input type="text" name="brand" id="brand" value={formData.brand} onChange={handleChange} required 
                 className={inputBaseClasses}/>
        </div>

        <div>
          <label htmlFor="model" className="block text-sm font-medium text-gray-700">Modelo</label>
          <input type="text" name="model" id="model" value={formData.model} onChange={handleChange} required
                 className={inputBaseClasses}/>
        </div>
        
        <div>
          <label htmlFor="company" className="block text-sm font-medium text-gray-700">Empresa</label>
          <select 
            name="company" 
            id="company" 
            value={formData.company} 
            // @ts-ignore
            onChange={handleChange} 
            required
            className={inputBaseClasses}
          >
            {COMPANY_OPTIONS.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700">Descrição</label>
          <textarea name="description" id="description" value={formData.description} onChange={handleChange} rows={3} required
                    className={inputBaseClasses}></textarea>
        </div>

        <div>
          <label htmlFor="barcode" className="block text-sm font-medium text-gray-700">Código de Barras</label>
          <input type="text" name="barcode" id="barcode" value={formData.barcode} onChange={handleChange} required
                 className={inputBaseClasses}/>
        </div>

        <div className="flex justify-end space-x-3 pt-2">
          <button
            type="button"
            onClick={() => navigate(-1)} 
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition"
          >
            Cancelar
          </button>
          <button
            type="submit"
            className="px-6 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition"
          >
            Cadastrar Produto
          </button>
        </div>
      </form>
    </div>
  );
};

export default ProductAddPage;
