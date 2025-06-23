
import React, { useState, useEffect } from 'react';
import type { AssetFormData, AppUser } from '../../types';
import { AssetStatus } from '../../types';
import { ASSET_STATUS_OPTIONS } from '../../constants';

interface AssetFormProps {
  onSubmit: (data: AssetFormData) => void;
  initialData?: AssetFormData;
  users: AppUser[]; 
  isEditMode?: boolean;
  onCancel: () => void;
}

const AssetForm: React.FC<AssetFormProps> = ({ onSubmit, initialData, users, isEditMode = false, onCancel }) => {
  const [formData, setFormData] = useState<AssetFormData>({
    assetType: '',
    serialNumber: '',
    brand: '',
    model: '',
    acquisitionDate: '',
    status: ASSET_STATUS_OPTIONS[0]?.value || AssetStatus.AVAILABLE,
    location: '',
    responsibleUserId: null,
    observations: '',
    maintenanceNotes: '',
  });
  const [error, setError] = useState<string | null>(null);

  const inputBaseClasses = "mt-1 block w-full px-3 py-2 bg-white text-gray-900 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm";
  const labelBaseClasses = "block text-sm font-medium text-gray-700 mb-1";

  useEffect(() => {
    if (initialData) {
      setFormData({
        ...initialData,
        responsibleUserId: initialData.responsibleUserId || null, 
        maintenanceNotes: initialData.maintenanceNotes || '', 
      });
    } else {
      setFormData({
        assetType: '', serialNumber: '', brand: '', model: '', acquisitionDate: '',
        status: ASSET_STATUS_OPTIONS[0]?.value || AssetStatus.AVAILABLE,
        location: '', responsibleUserId: null, observations: '', maintenanceNotes: '',
      });
    }
  }, [initialData]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value === "" && name === "responsibleUserId" ? null : value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const requiredFields: (keyof Omit<AssetFormData, 'observations' | 'maintenanceNotes' | 'responsibleUserId'>)[] = ['assetType', 'serialNumber', 'brand', 'model', 'acquisitionDate', 'status', 'location'];
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
          <label htmlFor="assetType" className={labelBaseClasses}>Tipo de Ativo</label>
          <input type="text" name="assetType" id="assetType" value={formData.assetType} onChange={handleChange} required className={inputBaseClasses}/>
        </div>
        <div>
          <label htmlFor="serialNumber" className={labelBaseClasses}>Número de Série</label>
          <input type="text" name="serialNumber" id="serialNumber" value={formData.serialNumber} onChange={handleChange} required className={inputBaseClasses}/>
        </div>
        <div>
          <label htmlFor="brand" className={labelBaseClasses}>Marca</label>
          <input type="text" name="brand" id="brand" value={formData.brand} onChange={handleChange} required className={inputBaseClasses}/>
        </div>
        <div>
          <label htmlFor="model" className={labelBaseClasses}>Modelo</label>
          <input type="text" name="model" id="model" value={formData.model} onChange={handleChange} required className={inputBaseClasses}/>
        </div>
        <div>
          <label htmlFor="acquisitionDate" className={labelBaseClasses}>Data de Aquisição</label>
          <input type="date" name="acquisitionDate" id="acquisitionDate" value={formData.acquisitionDate} onChange={handleChange} required className={inputBaseClasses}/>
        </div>
        <div>
          <label htmlFor="status" className={labelBaseClasses}>Status</label>
          <select name="status" id="status" value={formData.status} onChange={handleChange} required className={inputBaseClasses}>
            {ASSET_STATUS_OPTIONS.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
          </select>
        </div>
        <div>
          <label htmlFor="location" className={labelBaseClasses}>Localização</label>
          <input type="text" name="location" id="location" value={formData.location} onChange={handleChange} required className={inputBaseClasses}/>
        </div>
        <div>
          <label htmlFor="responsibleUserId" className={labelBaseClasses}>Usuário Responsável</label>
          <select name="responsibleUserId" id="responsibleUserId" value={formData.responsibleUserId || ''} onChange={handleChange} className={inputBaseClasses}>
            <option value="">Nenhum</option>
            {users.filter(u => u.status === 'Ativo').map(user => <option key={user.id} value={user.id}>{user.name}</option>)}
          </select>
        </div>
      </div>
      
      <div>
        <label htmlFor="observations" className={labelBaseClasses}>Observações</label>
        <textarea name="observations" id="observations" value={formData.observations} onChange={handleChange} rows={3} className={inputBaseClasses}></textarea>
      </div>

      <div>
        <label htmlFor="maintenanceNotes" className={labelBaseClasses}>Notas de Manutenção</label>
        <textarea name="maintenanceNotes" id="maintenanceNotes" value={formData.maintenanceNotes} onChange={handleChange} rows={3} className={inputBaseClasses}></textarea>
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
          {isEditMode ? 'Salvar Alterações' : 'Adicionar Ativo'}
        </button>
      </div>
    </form>
  );
};

export default AssetForm;
