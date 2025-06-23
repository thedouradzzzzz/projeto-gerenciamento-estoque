
import React, { useState, useEffect } from 'react';
import type { DescriptorFormData } from '../../types';
import { DescriptorStatus } from '../../types';
import { DESCRIPTOR_STATUS_OPTIONS } from '../../constants';

interface DescriptorFormProps {
  onSubmit: (data: DescriptorFormData) => void;
  initialData?: DescriptorFormData;
  isEditMode?: boolean;
  onCancel: () => void;
}

const DescriptorForm: React.FC<DescriptorFormProps> = ({ onSubmit, initialData, isEditMode = false, onCancel }) => {
  const [formData, setFormData] = useState<DescriptorFormData>({
    title: '',
    equipmentType: '',
    category: '',
    status: DescriptorStatus.ACTIVE,
    technicalSpecifications: '',
    minimumRequirements: '',
    compatibility: '',
    importantNotes: '',
  });
  const [error, setError] = useState<string | null>(null);

  const inputBaseClasses = "mt-1 block w-full px-3 py-2 bg-white text-gray-900 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm";
  const labelBaseClasses = "block text-sm font-medium text-gray-700 mb-1";

  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    } else {
      setFormData({
        title: '', equipmentType: '', category: '', status: DescriptorStatus.ACTIVE,
        technicalSpecifications: '', minimumRequirements: '', compatibility: '', importantNotes: '',
      });
    }
  }, [initialData]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const requiredFields: (keyof Pick<DescriptorFormData, 'title' | 'equipmentType' | 'category' | 'status'>)[] = 
      ['title', 'equipmentType', 'category', 'status'];
    for (const field of requiredFields) {
      if (!formData[field]) {
        setError(`O campo "${field}" é obrigatório.`);
        return;
      }
    }
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && <p className="mb-4 text-sm text-red-600 bg-red-100 p-3 rounded-md border border-red-300">{error}</p>}
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label htmlFor="title" className={labelBaseClasses}>Título do Descritivo</label>
          <input type="text" name="title" id="title" value={formData.title} onChange={handleChange} required className={inputBaseClasses}/>
        </div>
        <div>
          <label htmlFor="equipmentType" className={labelBaseClasses}>Tipo de Equipamento</label>
          <input type="text" name="equipmentType" id="equipmentType" value={formData.equipmentType} onChange={handleChange} required className={inputBaseClasses} placeholder="Ex: Desktop, Notebook, Servidor"/>
        </div>
        <div>
          <label htmlFor="category" className={labelBaseClasses}>Categoria</label>
          <input type="text" name="category" id="category" value={formData.category} onChange={handleChange} required className={inputBaseClasses} placeholder="Ex: Uso Geral, Desenvolvimento, Infraestrutura"/>
        </div>
        <div>
          <label htmlFor="status" className={labelBaseClasses}>Status</label>
          <select name="status" id="status" value={formData.status} onChange={handleChange} required className={inputBaseClasses}>
            {DESCRIPTOR_STATUS_OPTIONS.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
          </select>
        </div>
      </div>
      
      <div>
        <label htmlFor="technicalSpecifications" className={labelBaseClasses}>Especificações Técnicas</label>
        <textarea name="technicalSpecifications" id="technicalSpecifications" value={formData.technicalSpecifications} onChange={handleChange} rows={4} className={inputBaseClasses} placeholder="Detalhes técnicos como CPU, RAM, Armazenamento, etc."></textarea>
      </div>
      <div>
        <label htmlFor="minimumRequirements" className={labelBaseClasses}>Requisitos Mínimos</label>
        <textarea name="minimumRequirements" id="minimumRequirements" value={formData.minimumRequirements} onChange={handleChange} rows={3} className={inputBaseClasses} placeholder="Requisitos de software, sistema operacional, etc."></textarea>
      </div>
      <div>
        <label htmlFor="compatibility" className={labelBaseClasses}>Compatibilidade</label>
        <textarea name="compatibility" id="compatibility" value={formData.compatibility} onChange={handleChange} rows={3} className={inputBaseClasses} placeholder="Informações sobre compatibilidade com outros sistemas ou periféricos."></textarea>
      </div>
      <div>
        <label htmlFor="importantNotes" className={labelBaseClasses}>Notas Importantes</label>
        <textarea name="importantNotes" id="importantNotes" value={formData.importantNotes} onChange={handleChange} rows={3} className={inputBaseClasses} placeholder="Outras informações relevantes, como garantia, SLA, etc."></textarea>
      </div>

      <div className="flex justify-end space-x-3 pt-4">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition"
        >
          Cancelar
        </button>
        <button
          type="submit"
          className="px-6 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition"
        >
          {isEditMode ? 'Salvar Alterações' : 'Adicionar Descritivo'}
        </button>
      </div>
    </form>
  );
};

export default DescriptorForm;
