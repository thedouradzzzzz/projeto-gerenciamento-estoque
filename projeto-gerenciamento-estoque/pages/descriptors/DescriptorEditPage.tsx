import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import DescriptorForm from '../../components/descriptors/DescriptorForm';
import type { Descriptor, DescriptorFormData } from '../../types';

interface DescriptorEditPageProps {
  descriptors: Descriptor[];
  onUpdateDescriptor: (descriptorId: string, data: DescriptorFormData) => void;
}

const DescriptorEditPage: React.FC<DescriptorEditPageProps> = ({ descriptors, onUpdateDescriptor }) => {
  const navigate = useNavigate();
  const { descriptorId } = useParams<{ descriptorId: string }>();
  
  const descriptorToEdit = descriptors.find(d => d.id === descriptorId);

  const handleSubmit = (data: DescriptorFormData) => {
    if (descriptorId) {
      onUpdateDescriptor(descriptorId, data);
      // TODO: Add success toast notification
      navigate('/dashboard/descriptors');
    }
  };

  if (!descriptorToEdit) {
    return (
      <div className="bg-white p-6 md:p-8 rounded-xl shadow-lg text-center">
        <h2 className="text-xl font-semibold text-red-600">Descritivo não encontrado.</h2>
        <button onClick={() => navigate('/dashboard/descriptors')} className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
          Voltar para Lista de Descritivos
        </button>
      </div>
    );
  }
  
  const initialFormData: DescriptorFormData = {
    title: descriptorToEdit.title,
    equipmentType: descriptorToEdit.equipmentType,
    category: descriptorToEdit.category,
    status: descriptorToEdit.status,
    technicalSpecifications: descriptorToEdit.technicalSpecifications,
    minimumRequirements: descriptorToEdit.minimumRequirements,
    compatibility: descriptorToEdit.compatibility,
    importantNotes: descriptorToEdit.importantNotes,
  };

  return (
    <div className="bg-white p-6 md:p-8 rounded-xl shadow-lg max-w-3xl mx-auto">
      <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6">Editar Descritivo: {descriptorToEdit.title}</h1>
      <DescriptorForm 
        onSubmit={handleSubmit} 
        initialData={initialFormData}
        isEditMode={true}
        onCancel={() => navigate('/dashboard/descriptors')}
      />
    </div>
  );
};

export default DescriptorEditPage;