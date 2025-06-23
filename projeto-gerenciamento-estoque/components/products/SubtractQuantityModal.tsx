
import React, { useState } from 'react';
import Modal from '../common/Modal';
import type { SubtractQuantityFormData } from '../../types';

interface SubtractQuantityModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirmSubtract: (data: SubtractQuantityFormData) => void;
  productName: string;
  currentQuantity: number;
}

const SubtractQuantityModal: React.FC<SubtractQuantityModalProps> = ({ isOpen, onClose, onConfirmSubtract, productName, currentQuantity }) => {
  const [amount, setAmount] = useState<number | string>(1);
  const [destinationAssetId, setDestinationAssetId] = useState('');
  const [ticketNumber, setTicketNumber] = useState(''); 
  const [error, setError] = useState<string | null>(null);

  const inputBaseClasses = "mt-1 block w-full px-3 py-2 bg-white text-gray-900 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm";

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const numAmount = Number(amount);

    if (isNaN(numAmount) || numAmount < 1 || numAmount > 50) {
      setError('A quantidade a subtrair deve ser um número entre 1 e 50.');
      return;
    }
    if (numAmount > currentQuantity) {
      setError(`A quantidade a subtrair (${numAmount}) não pode ser maior que a quantidade atual (${currentQuantity}).`);
      return;
    }
    if (!destinationAssetId.trim()) {
      setError('A identificação do ativo de destino é obrigatória.');
      return;
    }

    onConfirmSubtract({ amount: numAmount, destinationAssetId, ticketNumber: ticketNumber.trim() || undefined });
    setAmount(1); 
    setDestinationAssetId('');
    setTicketNumber(''); 
  };
  
  const modalFooter = (
    <>
      <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition">Cancelar</button>
      <button type="submit" form="subtractQuantityForm" className="px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md shadow-sm hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition">Subtrair Quantidade</button>
    </>
  );

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Subtrair Quantidade: ${productName}`} footer={modalFooter}>
      <form id="subtractQuantityForm" onSubmit={handleSubmit} className="space-y-4">
        {error && <p className="text-sm text-red-600 bg-red-100 p-3 rounded-md border border-red-300">{error}</p>}
        <p className="text-sm text-gray-600">Quantidade atual em estoque: <span className="font-semibold">{currentQuantity}</span></p>
        <div>
          <label htmlFor="amount-subtract" className="block text-sm font-medium text-gray-700">Quantidade a Subtrair (1-50)</label>
          <input 
            type="number" 
            name="amount-subtract" 
            id="amount-subtract" 
            value={amount} 
            onChange={(e) => setAmount(e.target.value)} 
            min="1" 
            max="50"
            required 
            className={inputBaseClasses}/>
        </div>
        <div>
          <label htmlFor="destinationAssetId" className="block text-sm font-medium text-gray-700">Identificação do Ativo Destino</label>
          <input 
            type="text" 
            name="destinationAssetId" 
            id="destinationAssetId" 
            value={destinationAssetId} 
            onChange={(e) => setDestinationAssetId(e.target.value)} 
            required 
            placeholder="Ex: ID do Notebook, Sala, Projeto"
            className={inputBaseClasses}/>
        </div>
        <div>
          <label htmlFor="ticketNumber" className="block text-sm font-medium text-gray-700">Número do Chamado (Opcional)</label>
          <input 
            type="text" 
            name="ticketNumber" 
            id="ticketNumber" 
            value={ticketNumber} 
            onChange={(e) => setTicketNumber(e.target.value)} 
            placeholder="Ex: INC0012345"
            className={inputBaseClasses}/>
        </div>
      </form>
    </Modal>
  );
};

export default SubtractQuantityModal;
