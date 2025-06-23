
import React, { useState } from 'react';
import Modal from '../common/Modal';
import type { AddQuantityFormData } from '../../types';

interface AddQuantityModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirmAdd: (data: AddQuantityFormData) => void;
  productName: string;
}

const AddQuantityModal: React.FC<AddQuantityModalProps> = ({ isOpen, onClose, onConfirmAdd, productName }) => {
  const [amount, setAmount] = useState<number | string>(1); 
  const [purchaseOrder, setPurchaseOrder] = useState('');
  const [error, setError] = useState<string | null>(null);

  const inputBaseClasses = "mt-1 block w-full px-3 py-2 bg-white text-gray-900 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm";

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const numAmount = Number(amount);

    if (isNaN(numAmount) || numAmount < 1 || numAmount > 50) {
      setError('A quantidade a adicionar deve ser um número entre 1 e 50.');
      return;
    }
    if (!purchaseOrder.trim()) {
      setError('O número da solicitação de compra é obrigatório.');
      return;
    }

    onConfirmAdd({ amount: numAmount, purchaseOrder });
    setAmount(1); 
    setPurchaseOrder('');
  };

  const modalFooter = (
    <>
      <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition">Cancelar</button>
      <button type="submit" form="addQuantityForm" className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition">Adicionar Quantidade</button>
    </>
  );
  
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Adicionar Quantidade: ${productName}`} footer={modalFooter}>
      <form id="addQuantityForm" onSubmit={handleSubmit} className="space-y-4">
        {error && <p className="text-sm text-red-600 bg-red-100 p-3 rounded-md border border-red-300">{error}</p>}
        <div>
          <label htmlFor="amount-add" className="block text-sm font-medium text-gray-700">Quantidade a Adicionar (1-50)</label>
          <input 
            type="number" 
            name="amount-add" 
            id="amount-add" 
            value={amount} 
            onChange={(e) => setAmount(e.target.value)} 
            min="1" 
            max="50"
            required 
            className={inputBaseClasses}/>
        </div>
        <div>
          <label htmlFor="purchaseOrder" className="block text-sm font-medium text-gray-700">Número da Solicitação de Compra</label>
          <input 
            type="text" 
            name="purchaseOrder" 
            id="purchaseOrder" 
            value={purchaseOrder} 
            onChange={(e) => setPurchaseOrder(e.target.value)} 
            required 
            className={inputBaseClasses}/>
        </div>
      </form>
    </Modal>
  );
};

export default AddQuantityModal;
