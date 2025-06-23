



import React, { useState, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import type { Asset, AppUser, AssetFormData } from '../../types';
import { AssetStatus } from '../../types';
import { ASSET_STATUS_OPTIONS } from '../../constants';
import { PlusIcon, PencilIcon, TrashIcon, QrCodeIcon } from '../../components/icons/Icons';
import ViewQRModal from '../../components/assets/ViewQRModal';
import DeleteAssetConfirmationModal from '../../components/assets/DeleteAssetConfirmationModal';

interface AssetManagementPageProps {
  assets: Asset[];
  users: AppUser[];
  onDeleteAsset: (assetId: string) => void;
  onImportAssets: (importedAssetsData: AssetFormData[], summary: { successfullyAdded: number; duplicatesSkipped: number; errors: number; errorDetails: string[] }) => void;
}

const ITEMS_PER_PAGE = 10;

const AssetManagementPage: React.FC<AssetManagementPageProps> = ({ assets, users, onDeleteAsset, onImportAssets }) => {
  const navigate = useNavigate();
  const [filters, setFilters] = useState({
    assetType: '',
    status: '',
    location: '',
    responsibleUserId: '',
    acquisitionDate: '',
  });

  const [isQRModalOpen, setIsQRModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);

  const [currentPage, setCurrentPage] = useState(1);
  const [sortConfig, setSortConfig] = useState<{ key: keyof Asset | null; direction: 'ascending' | 'descending' }>({ key: null, direction: 'ascending' });
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [importStatusMessage, setImportStatusMessage] = useState<string | null>(null);
  const [isImportLoading, setIsImportLoading] = useState(false);

  const inputBaseClasses = "mt-1 block w-full px-3 py-2 bg-white text-gray-900 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm";


  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setCurrentPage(1); 
    setFilters(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };
  
  const clearFilters = () => {
    setCurrentPage(1);
    setFilters({ assetType: '', status: '', location: '', responsibleUserId: '', acquisitionDate: '' });
  };

  const filteredAssets = useMemo(() => {
    return assets.filter(asset => {
      return (
        (filters.assetType ? asset.assetType.toLowerCase().includes(filters.assetType.toLowerCase()) : true) &&
        (filters.status ? asset.status === filters.status : true) &&
        (filters.location ? asset.location.toLowerCase().includes(filters.location.toLowerCase()) : true) &&
        (filters.responsibleUserId ? asset.responsibleUserId === filters.responsibleUserId : true) &&
        (filters.acquisitionDate ? asset.acquisitionDate === filters.acquisitionDate : true)
      );
    });
  }, [assets, filters]);

  const requestSort = (key: keyof Asset) => {
    setCurrentPage(1); 
    let direction: 'ascending' | 'descending' = 'ascending';
    if (sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };

  const sortedAssets = useMemo(() => {
    let sortableAssets = [...filteredAssets];
    if (sortConfig.key !== null) {
      sortableAssets.sort((a, b) => {
        const key = sortConfig.key!;
        const valA = a[key];
        const valB = b[key];

        let comparison = 0;

        if (valA === null || valA === undefined) {
          comparison = -1;
        } else if (valB === null || valB === undefined) {
          comparison = 1;
        } else if (key === 'acquisitionDate') {
          
          const dateA = new Date(valA as string).getTime();
          const dateB = new Date(valB as string).getTime();
          if (isNaN(dateA) && isNaN(dateB)) comparison = 0;
          else if (isNaN(dateA)) comparison = -1; 
          else if (isNaN(dateB)) comparison = 1;
          else comparison = dateA - dateB;
        } else if (typeof valA === 'number' && typeof valB === 'number') {
          comparison = valA - valB;
        } else {
          
          comparison = String(valA).localeCompare(String(valB), 'pt-BR', { sensitivity: 'base' });
        }
        
        return sortConfig.direction === 'ascending' ? comparison : -comparison;
      });
    }
    return sortableAssets;
  }, [filteredAssets, sortConfig]);

  const paginatedAssets = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return sortedAssets.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [sortedAssets, currentPage]);

  const totalPages = Math.ceil(sortedAssets.length / ITEMS_PER_PAGE);

  const openQRModal = (asset: Asset) => {
    setSelectedAsset(asset);
    setIsQRModalOpen(true);
  };

  const openDeleteModal = (asset: Asset) => {
    setSelectedAsset(asset);
    setIsDeleteModalOpen(true);
  };

  const closeModals = () => {
    setIsQRModalOpen(false);
    setIsDeleteModalOpen(false);
    setSelectedAsset(null);
  };

  const confirmDelete = () => {
    if (selectedAsset) {
      onDeleteAsset(selectedAsset.id);
    }
    closeModals();
  };

  const getUserNameById = (userId: string | null) => {
    if (!userId) return 'N/A';
    const user = users.find(u => u.id === userId);
    return user ? user.name : 'Desconhecido';
  };
  
  const formatDateDisplay = (dateString: string) => {
    if (!dateString) return 'N/A';
    try {
        const date = new Date(dateString + 'T00:00:00'); 
        return date.toLocaleDateString('pt-BR');
    } catch {
        return dateString;
    }
  };
  
  const getSortIndicator = (key: keyof Asset) => {
    if (sortConfig.key === key) {
      return sortConfig.direction === 'ascending' ? ' ▲' : ' ▼';
    }
    return '';
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsImportLoading(true);
    setImportStatusMessage('Processando arquivo CSV...');

    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      if (!text) {
        setImportStatusMessage('Erro: Arquivo vazio ou ilegível.');
        setIsImportLoading(false);
        return;
      }
      
      const contentToParse = text.charCodeAt(0) === 0xFEFF ? text.substring(1) : text; 
      const lines = contentToParse.split(/\r\n|\n|\r/);
      if (lines.length < 2) {
        setImportStatusMessage('Erro: CSV precisa de cabeçalho e pelo menos uma linha de dados.');
        setIsImportLoading(false);
        return;
      }

      const rawHeaders = lines[0].split(';').map(h => h.trim().replace(/^"|"$/g, ''));
      
      const headerMap: { [key: string]: keyof AssetFormData | 'ignore' | 'observations_extra' } = {
        'Tipo': 'assetType',
        'Número de série': 'serialNumber',
        'Fabricante': 'brand',
        'Modelo': 'model',
        'Última atualização': 'acquisitionDate',
        'Nome': 'observations_extra', 
        'Nome alternativo do usuário': 'observations_extra',
        'Componentes - Processador': 'observations_extra',
        'Componentes - Memória': 'observations_extra',
        'Componentes - Tipo de disco rígido': 'observations_extra',
        'Sistema operacional - Nome': 'observations_extra',
        'Monitores - Número de monitores': 'observations_extra',
      };
      
      const headerIndexes: { [key in keyof AssetFormData]?: number } & { observations_extra?: number[] } = {};
      const extraObservationHeaders: string[] = [];

      rawHeaders.forEach((rawHeader, index) => {
        const mappedKey = Object.keys(headerMap).find(csvHeader => rawHeader.toLowerCase() === csvHeader.toLowerCase());
        if (mappedKey) {
            const targetKey = headerMap[mappedKey];
            if (targetKey === 'observations_extra') {
                if (!headerIndexes.observations_extra) headerIndexes.observations_extra = [];
                headerIndexes.observations_extra.push(index);
                extraObservationHeaders.push(rawHeader); 
            } else if (targetKey !== 'ignore') {
                headerIndexes[targetKey as keyof AssetFormData] = index;
            }
        }
      });

      const importedAssetsData: AssetFormData[] = [];
      const errorDetails: string[] = [];
      let successfullyProcessed = 0;

      for (let i = 1; i < lines.length; i++) {
        const line = lines[i];
        if (!line.trim()) continue; 

        const values = line.split(';').map(v => v.trim().replace(/^"|"$/g, ''));
        const assetData = {} as AssetFormData;
        let validRow = true;
        let rowErrors: string[] = [];
        
        assetData.assetType = headerIndexes.assetType !== undefined ? values[headerIndexes.assetType] : '';
        assetData.serialNumber = headerIndexes.serialNumber !== undefined ? values[headerIndexes.serialNumber] : '';
        assetData.brand = headerIndexes.brand !== undefined ? values[headerIndexes.brand] : '';
        assetData.model = headerIndexes.model !== undefined ? values[headerIndexes.model] : '';
        
        const dateRaw = headerIndexes.acquisitionDate !== undefined ? values[headerIndexes.acquisitionDate] : '';
        if (dateRaw) {
            const parts = dateRaw.split(' ')[0].split('-'); 
            if (parts.length === 3) {
                assetData.acquisitionDate = `${parts[2]}-${parts[1]}-${parts[0]}`; 
                 if (isNaN(new Date(assetData.acquisitionDate).getTime())) {
                    rowErrors.push(`Formato de data inválido para 'Última atualização': ${dateRaw}`);
                    validRow = false;
                }
            } else {
                rowErrors.push(`Formato de data inválido para 'Última atualização': ${dateRaw}`);
                validRow = false;
            }
        } else {
             assetData.acquisitionDate = ''; 
        }
        
        assetData.status = AssetStatus.AVAILABLE; 
        assetData.location = 'Importado via CSV'; 
        assetData.responsibleUserId = null; 
        assetData.observations = '';
        assetData.maintenanceNotes = '';
        
        let extraObs: string[] = [];
        if (headerIndexes.observations_extra) {
            headerIndexes.observations_extra.forEach((obsIndex, k) => {
                if (values[obsIndex] && values[obsIndex].trim()) {
                    extraObs.push(`${extraObservationHeaders[k]}: ${values[obsIndex]}`);
                }
            });
        }
        assetData.observations = extraObs.join('; ');

        if (!assetData.assetType) { rowErrors.push("Campo 'Tipo' (assetType) obrigatório não encontrado ou vazio."); validRow = false; }
        if (!assetData.serialNumber) { rowErrors.push("Campo 'Número de série' (serialNumber) obrigatório não encontrado ou vazio."); validRow = false; }
        if (!assetData.brand) { rowErrors.push("Campo 'Fabricante' (brand) obrigatório não encontrado ou vazio."); validRow = false; }
        if (!assetData.model) { rowErrors.push("Campo 'Modelo' (model) obrigatório não encontrado ou vazio."); validRow = false; }
        
        if (validRow) {
          importedAssetsData.push(assetData);
          successfullyProcessed++;
        } else {
          errorDetails.push(`Linha ${i + 1}: ${rowErrors.join(', ')}`);
        }
      }
      
      const importSummary = { 
        successfullyAdded: successfullyProcessed, 
        duplicatesSkipped: 0, 
        errors: errorDetails.length, 
        errorDetails 
      };
      
      onImportAssets(importedAssetsData, importSummary); 

      setImportStatusMessage(`Processamento concluído. ${successfullyProcessed} registros lidos do CSV. Verifique os logs para detalhes do processamento final.`);
      setIsImportLoading(false);
      if (fileInputRef.current) fileInputRef.current.value = ""; 
    };
    reader.onerror = () => {
      setImportStatusMessage('Erro ao ler o arquivo.');
      setIsImportLoading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    };
    reader.readAsText(file, 'UTF-8'); 
  };

  return (
    <div className="bg-white p-6 md:p-8 rounded-xl shadow-lg">
      <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">Gerenciamento de Ativos</h1>
        <div className="flex gap-2">
            <input 
                type="file" 
                accept=".csv" 
                onChange={handleFileUpload} 
                className="hidden" 
                ref={fileInputRef} 
                id="csvFileInput"
            />
            <button
                onClick={() => fileInputRef.current?.click()}
                disabled={isImportLoading}
                className="flex items-center bg-teal-600 hover:bg-teal-700 text-white font-semibold py-2 px-4 rounded-lg shadow-md transition duration-150 disabled:opacity-50"
            >
                {isImportLoading ? 'Importando...' : 'Importar CSV'}
            </button>
            <button 
                onClick={() => navigate('/dashboard/assets/add')}
                className="flex items-center bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg shadow-md transition duration-150"
            >
                <PlusIcon className="h-5 w-5 mr-2" />
                Adicionar Ativo
            </button>
        </div>
      </div>
       {importStatusMessage && (
        <div className={`p-3 mb-4 rounded-md text-sm ${importStatusMessage.startsWith('Erro') ? 'bg-red-100 text-red-700 border border-red-300' : 'bg-blue-100 text-blue-700 border border-blue-300'}`}>
          {importStatusMessage}
        </div>
      )}

      <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 items-end">
          <input type="text" name="assetType" placeholder="Tipo de Ativo" value={filters.assetType} onChange={handleFilterChange} className={inputBaseClasses}/>
          <select name="status" value={filters.status} onChange={handleFilterChange} className={inputBaseClasses}>
            <option value="">Todos os Status</option>
            {ASSET_STATUS_OPTIONS.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
          </select>
          <input type="text" name="location" placeholder="Localização" value={filters.location} onChange={handleFilterChange} className={inputBaseClasses}/>
          <select name="responsibleUserId" value={filters.responsibleUserId} onChange={handleFilterChange} className={inputBaseClasses}>
            <option value="">Todos os Usuários</option>
            {users.filter(u => u.status === 'Ativo').map(user => <option key={user.id} value={user.id}>{user.name}</option>)}
          </select>
          <input type="date" name="acquisitionDate" value={filters.acquisitionDate} onChange={handleFilterChange} className={inputBaseClasses}/>
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
              <th className="th-cell cursor-pointer hover:bg-gray-100" onClick={() => requestSort('assetType')}>Tipo{getSortIndicator('assetType')}</th>
              <th className="th-cell cursor-pointer hover:bg-gray-100" onClick={() => requestSort('brand')}>Marca/Modelo{getSortIndicator('brand')}</th>
              <th className="th-cell cursor-pointer hover:bg-gray-100" onClick={() => requestSort('serialNumber')}>Nº Série{getSortIndicator('serialNumber')}</th>
              <th className="th-cell cursor-pointer hover:bg-gray-100" onClick={() => requestSort('status')}>Status{getSortIndicator('status')}</th>
              <th className="th-cell cursor-pointer hover:bg-gray-100" onClick={() => requestSort('location')}>Localização{getSortIndicator('location')}</th>
              <th className="th-cell cursor-pointer hover:bg-gray-100" onClick={() => requestSort('responsibleUserId')}>Responsável{getSortIndicator('responsibleUserId')}</th>
              <th className="th-cell cursor-pointer hover:bg-gray-100" onClick={() => requestSort('acquisitionDate')}>Data Aquisição{getSortIndicator('acquisitionDate')}</th>
              <th className="th-cell">Notas Manut.</th>
              <th className="th-cell">Ações</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {paginatedAssets.map(asset => (
              <tr key={asset.id} className="hover:bg-gray-50 transition-colors">
                <td className="td-cell">{asset.assetType}</td>
                <td className="td-cell">
                  <div>{asset.brand}</div>
                  <div className="text-xs text-gray-500">{asset.model}</div>
                </td>
                <td className="td-cell">{asset.serialNumber}</td>
                <td className="td-cell">
                   <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    asset.status === AssetStatus.IN_USE ? 'bg-blue-100 text-blue-800' :
                    asset.status === AssetStatus.AVAILABLE ? 'bg-green-100 text-green-800' :
                    'bg-yellow-100 text-yellow-800' 
                  }`}>
                    {asset.status}
                  </span>
                </td>
                <td className="td-cell">{asset.location}</td>
                <td className="td-cell">{getUserNameById(asset.responsibleUserId)}</td>
                <td className="td-cell">{formatDateDisplay(asset.acquisitionDate)}</td>
                <td className="td-cell max-w-xs truncate" title={asset.maintenanceNotes || ''}>{asset.maintenanceNotes || '-'}</td>
                <td className="td-cell space-x-1">
                  <button onClick={() => navigate(`/dashboard/assets/edit/${asset.id}`)} title="Editar" className="action-btn text-indigo-600 hover:bg-indigo-100"><PencilIcon className="h-5 w-5"/></button>
                  <button onClick={() => openQRModal(asset)} title="Ver QR Code" className="action-btn text-purple-600 hover:bg-purple-100"><QrCodeIcon className="h-5 w-5"/></button>
                  <button onClick={() => openDeleteModal(asset)} title="Excluir" className="action-btn text-red-600 hover:bg-red-100"><TrashIcon className="h-5 w-5"/></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {paginatedAssets.length === 0 && (
        <div className="text-center py-10 text-gray-500">
          Nenhum ativo encontrado com os filtros atuais.
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

      {selectedAsset && (
        <>
          <ViewQRModal isOpen={isQRModalOpen} onClose={closeModals} asset={selectedAsset} />
          <DeleteAssetConfirmationModal isOpen={isDeleteModalOpen} onClose={closeModals} onConfirmDelete={confirmDelete} assetName={`${selectedAsset.assetType} ${selectedAsset.serialNumber}`} />
        </>
      )}
    </div>
  );
};

export default AssetManagementPage;