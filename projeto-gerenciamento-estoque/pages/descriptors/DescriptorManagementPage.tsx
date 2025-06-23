
import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import type { Descriptor } from '../../types';
import { DescriptorStatus } from '../../types';
import { DESCRIPTOR_STATUS_OPTIONS } from '../../constants';
import { PlusIcon, PencilIcon, TrashIcon } from '../../components/icons/Icons';
import DeleteDescriptorConfirmationModal from '../../components/descriptors/DeleteDescriptorConfirmationModal';

interface DescriptorManagementPageProps {
  descriptors: Descriptor[];
  onDeleteDescriptor: (descriptorId: string) => void;
}

const ITEMS_PER_PAGE = 10;

const formatDate = (date: Date) => {
  return date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
};

const DescriptorManagementPage: React.FC<DescriptorManagementPageProps> = ({ descriptors, onDeleteDescriptor }) => {
  const navigate = useNavigate();
  const [filters, setFilters] = useState({
    title: '',
    equipmentType: '',
    category: '',
    status: '',
  });

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedDescriptor, setSelectedDescriptor] = useState<Descriptor | null>(null);

  const [currentPage, setCurrentPage] = useState(1);
  const [sortConfig, setSortConfig] = useState<{ key: keyof Descriptor | null; direction: 'ascending' | 'descending' }>({ key: null, direction: 'ascending' });

  const inputBaseClasses = "mt-1 block w-full px-3 py-2 bg-white text-gray-900 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm";

  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setCurrentPage(1);
    setFilters(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const clearFilters = () => {
    setCurrentPage(1);
    setFilters({ title: '', equipmentType: '', category: '', status: '' });
  };

  const filteredDescriptors = useMemo(() => {
    return descriptors.filter(desc => {
      return (
        (filters.title ? desc.title.toLowerCase().includes(filters.title.toLowerCase()) : true) &&
        (filters.equipmentType ? desc.equipmentType.toLowerCase().includes(filters.equipmentType.toLowerCase()) : true) &&
        (filters.category ? desc.category.toLowerCase().includes(filters.category.toLowerCase()) : true) &&
        (filters.status ? desc.status === filters.status : true)
      );
    });
  }, [descriptors, filters]);

  const requestSort = (key: keyof Descriptor) => {
    setCurrentPage(1);
    let direction: 'ascending' | 'descending' = 'ascending';
    if (sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };

  const sortedDescriptors = useMemo(() => {
    let sortableDescriptors = [...filteredDescriptors];
    if (sortConfig.key !== null) {
      sortableDescriptors.sort((a, b) => {
        const key = sortConfig.key!;
        const valA = a[key];
        const valB = b[key];

        let comparison = 0;
        if (valA instanceof Date && valB instanceof Date) {
          comparison = valA.getTime() - valB.getTime();
        } else if (typeof valA === 'string' && typeof valB === 'string') {
          comparison = valA.localeCompare(valB, 'pt-BR', { sensitivity: 'base' });
        } else if (typeof valA === 'number' && typeof valB === 'number') {
          comparison = valA - valB;
        } else {
            comparison = String(valA).localeCompare(String(valB), 'pt-BR', { sensitivity: 'base' });
        }
        return sortConfig.direction === 'ascending' ? comparison : -comparison;
      });
    }
    return sortableDescriptors;
  }, [filteredDescriptors, sortConfig]);

  const paginatedDescriptors = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return sortedDescriptors.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [sortedDescriptors, currentPage]);

  const totalPages = Math.ceil(sortedDescriptors.length / ITEMS_PER_PAGE);

  const openDeleteModal = (descriptor: Descriptor) => {
    setSelectedDescriptor(descriptor);
    setIsDeleteModalOpen(true);
  };

  const closeDeleteModal = () => {
    setIsDeleteModalOpen(false);
    setSelectedDescriptor(null);
  };

  const confirmDelete = () => {
    if (selectedDescriptor) {
      onDeleteDescriptor(selectedDescriptor.id);
    }
    closeDeleteModal();
  };

  const getSortIndicator = (key: keyof Descriptor) => {
    if (sortConfig.key === key) {
      return sortConfig.direction === 'ascending' ? ' ▲' : ' ▼';
    }
    return '';
  };

  return (
    <div className="bg-white p-6 md:p-8 rounded-xl shadow-lg">
      <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">Gerenciador de Descritivos</h1>
        <button
          onClick={() => navigate('/dashboard/descriptors/add')}
          className="flex items-center bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg shadow-md transition duration-150"
        >
          <PlusIcon className="h-5 w-5 mr-2" />
          Adicionar Descritivo
        </button>
      </div>

      <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-4 items-end">
          <input type="text" name="title" placeholder="Título" value={filters.title} onChange={handleFilterChange} className={inputBaseClasses} />
          <input type="text" name="equipmentType" placeholder="Tipo de Equipamento" value={filters.equipmentType} onChange={handleFilterChange} className={inputBaseClasses} />
          <input type="text" name="category" placeholder="Categoria" value={filters.category} onChange={handleFilterChange} className={inputBaseClasses} />
          <select name="status" value={filters.status} onChange={handleFilterChange} className={inputBaseClasses}>
            <option value="">Todos os Status</option>
            {DESCRIPTOR_STATUS_OPTIONS.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
          </select>
          <button
            onClick={clearFilters}
            className="sm:col-start-1 lg:col-start-auto xl:col-start-auto px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition"
          >
            Limpar Filtros
          </button>
        </div>
      </div>
      

      <div className="overflow-x-auto rounded-lg border border-gray-200">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="th-cell cursor-pointer hover:bg-gray-100" onClick={() => requestSort('title')}>Título{getSortIndicator('title')}</th>
              <th className="th-cell cursor-pointer hover:bg-gray-100" onClick={() => requestSort('equipmentType')}>Tipo Equip.{getSortIndicator('equipmentType')}</th>
              <th className="th-cell cursor-pointer hover:bg-gray-100" onClick={() => requestSort('category')}>Categoria{getSortIndicator('category')}</th>
              <th className="th-cell cursor-pointer hover:bg-gray-100" onClick={() => requestSort('status')}>Status{getSortIndicator('status')}</th>
              <th className="th-cell cursor-pointer hover:bg-gray-100" onClick={() => requestSort('createdAt')}>Criado em{getSortIndicator('createdAt')}</th>
              <th className="th-cell cursor-pointer hover:bg-gray-100" onClick={() => requestSort('updatedAt')}>Atualizado em{getSortIndicator('updatedAt')}</th>
              <th className="th-cell">Ações</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {paginatedDescriptors.map(desc => (
              <tr key={desc.id} className="hover:bg-gray-50 transition-colors">
                <td className="td-cell font-medium text-gray-900">{desc.title}</td>
                <td className="td-cell">{desc.equipmentType}</td>
                <td className="td-cell">{desc.category}</td>
                <td className="td-cell">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    desc.status === DescriptorStatus.ACTIVE ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {desc.status}
                  </span>
                </td>
                <td className="td-cell">{formatDate(desc.createdAt)}</td>
                <td className="td-cell">{formatDate(desc.updatedAt)}</td>
                <td className="td-cell space-x-1">
                  <button onClick={() => navigate(`/dashboard/descriptors/edit/${desc.id}`)} title="Editar" className="action-btn text-indigo-600 hover:bg-indigo-100"><PencilIcon className="h-5 w-5"/></button>
                  <button onClick={() => openDeleteModal(desc)} title="Excluir" className="action-btn text-red-600 hover:bg-red-100"><TrashIcon className="h-5 w-5"/></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {paginatedDescriptors.length === 0 && (
        <div className="text-center py-10 text-gray-500">
          Nenhum descritivo encontrado com os filtros atuais.
        </div>
      )}

      {totalPages > 1 && (
        <div className="mt-6 flex items-center justify-between">
          <button
            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50"
          >
            Anterior
          </button>
          <span className="text-sm text-gray-700">
            Página {currentPage} de {totalPages}
          </span>
          <button
            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50"
          >
            Próxima
          </button>
        </div>
      )}
      <style>{`
        .th-cell { @apply px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider; }
        .td-cell { @apply px-4 py-4 whitespace-nowrap text-sm text-gray-800; } 
        .action-btn { @apply p-1 rounded transition; }
      `}</style>

      {selectedDescriptor && (
        <DeleteDescriptorConfirmationModal 
            isOpen={isDeleteModalOpen} 
            onClose={closeDeleteModal} 
            onConfirmDelete={confirmDelete} 
            descriptorTitle={selectedDescriptor.title} 
        />
      )}
    </div>
  );
};

export default DescriptorManagementPage;