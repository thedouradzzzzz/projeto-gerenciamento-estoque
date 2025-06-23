
import React, { useState, useEffect, useCallback } from 'react';
import { Routes, Route, Navigate, Outlet, useNavigate } from 'react-router-dom';
import LoginPage from './components/auth/LoginPage';
import DashboardLayout from './components/dashboard/DashboardLayout';
import UserManagementPage from './pages/UserManagementPage';
import ProductSearchPage from './pages/products/ProductSearchPage';
import ProductAddPage from './pages/products/ProductAddPage';
import AssetManagementPage from './pages/assets/AssetManagementPage';
import AssetAddPage from './pages/assets/AssetAddPage';
import AssetEditPage from './pages/assets/AssetEditPage';
import DescriptorManagementPage from './pages/descriptors/DescriptorManagementPage';
import DescriptorAddPage from './pages/descriptors/DescriptorAddPage';
import DescriptorEditPage from './pages/descriptors/DescriptorEditPage';
import MovementLogsPage from './pages/logs/MovementLogsPage';
import ReportsDashboardPage from './pages/reports/ReportsDashboardPage'; 
import AdminDashboardPage from './pages/admin/AdminDashboardPage'; 
import MainDashboardPage from './pages/dashboard/MainDashboardPage'; 
import ForceChangePasswordPage from './pages/auth/ForceChangePasswordPage';
import ProductTypeManagementPage from './pages/products/ProductTypeManagementPage';


import { DEFAULT_ADMIN_EMAIL, DEFAULT_ADMIN_PASSWORD } from './constants';
import type { User, AppUser, Product, Asset, Descriptor, ProductFormData, AddUserFormData, EditUserFormData, AssetFormData, DescriptorFormData, LogEntry, LogEntryActionType as ActionType, Company } from './types';
import { AssetStatus, DescriptorStatus, LogEntryActionType } from './types';

// Initial data for demonstration (used as fallback if localStorage is empty)
const initialAppUsers: AppUser[] = [
  { id: 'user-admin-001', name: 'João Administrador', email: 'admin@system.dev', role: 'Administrador', status: 'Ativo', createdAt: new Date('2023-01-15'), lastModifiedAt: new Date('2023-10-20'), forcePasswordChange: false, password_param: DEFAULT_ADMIN_PASSWORD },
  { id: '2', name: 'Maria Usuária', email: 'maria.user@example.com', role: 'Usuário comum', status: 'Ativo', createdAt: new Date('2023-02-20'), lastModifiedAt: new Date('2023-11-05'), forcePasswordChange: false, password_param: 'userpass' },
  { id: '3', name: 'Carlos Inativo', email: 'carlos.inactive@example.com', role: 'Usuário comum', status: 'Inativo', createdAt: new Date('2023-03-10'), lastModifiedAt: new Date('2023-09-01'), forcePasswordChange: false, password_param: 'inactivepass' },
];

const initialProductTypesData: string[] = [
  "HD", "SSD", "Memória Ram", "Teclado e Mouse", "Suporte de notebook", 
  "Cabo HDMI", "Cabo de força", "Cabo VGA", "Cabo Displayport", 
  "Filtro de linha", "Carregador + cabo usb C", "Cabo USB A-A", 
  "Cabo USB A-B", "Smartphone"
];

const initialProductsData: Product[] = [
  { id: 'prod1', type: initialProductTypesData[1], brand: 'Kingston', model: 'A400', description: 'SSD 240GB SATA III', barcode: '740617261219', quantity: 10, company: 'Catarinense Pharma' as Company },
  { id: 'prod2', type: initialProductTypesData[2], brand: 'Corsair', model: 'Vengeance LPX', description: '16GB (2x8GB) DDR4 3200MHz', barcode: '843591070000', quantity: 3, company: 'ABPlast' as Company },
  { id: 'prod3', type: initialProductTypesData[3], brand: 'Logitech', model: 'MK270', description: 'Combo Teclado e Mouse sem Fio', barcode: '097855140620', quantity: 15, company: 'Catarinense Pharma' as Company },
  { id: 'prod4', type: initialProductTypesData[0], brand: 'Seagate', model: 'Barracuda 1TB', description: 'HD Interno 1TB Sata III', barcode: '763649007540', quantity: 2, company: 'ABPlast' as Company },
];

const initialAssetsData: Asset[] = [
    { id: 'asset1', assetType: 'Notebook', serialNumber: 'SNB001', brand: 'Dell', model: 'Latitude 5420', acquisitionDate: '2023-05-10', status: AssetStatus.IN_USE, location: 'Sala 101', responsibleUserId: 'user-admin-001', observations: 'Notebook para desenvolvimento', qrCodeValue: 'asset1:SNB001', maintenanceNotes: 'Bateria trocada em 2023-12-01.' },
    { id: 'asset2', assetType: 'Monitor', serialNumber: 'SNM002', brand: 'LG', model: '24MK430H', acquisitionDate: '2023-06-15', status: AssetStatus.AVAILABLE, location: 'Estoque TI', responsibleUserId: null, observations: 'Monitor reserva', qrCodeValue: 'asset2:SNM002', maintenanceNotes: '' },
];

const initialDescriptorsData: Descriptor[] = [
  { id: 'desc1', title: 'Desktop Padrão - TI Nível 1', equipmentType: 'Desktop', category: 'Uso Geral', status: DescriptorStatus.ACTIVE, technicalSpecifications: 'CPU i5, 8GB RAM, SSD 256GB, Monitor 21"', minimumRequirements: 'Windows 10 Pro', compatibility: 'Periféricos USB padrão', importantNotes: 'Garantia de 3 anos no local.', createdAt: new Date('2023-01-10'), updatedAt: new Date('2023-01-15') },
  { id: 'desc2', title: 'Notebook Desenvolvedor Pleno', equipmentType: 'Notebook', category: 'Desenvolvimento', status: DescriptorStatus.ACTIVE, technicalSpecifications: 'CPU i7, 16GB RAM, SSD 512GB NVMe, Tela 14" FHD IPS', minimumRequirements: 'Linux ou macOS, Docker', compatibility: 'Dockstation USB-C', importantNotes: 'Bateria de longa duração.', createdAt: new Date('2023-02-01'), updatedAt: new Date('2023-02-05') },
  { id: 'desc3', title: 'Servidor de Testes Pequeno', equipmentType: 'Servidor', category: 'Infraestrutura', status: DescriptorStatus.INACTIVE, technicalSpecifications: 'Xeon E3, 32GB RAM ECC, 2x 1TB HDD RAID1', minimumRequirements: 'VMWare ESXi ou Proxmox', compatibility: 'Rede Gigabit', importantNotes: 'Desativado, aguardando substituição.', createdAt: new Date('2022-05-20'), updatedAt: new Date('2023-03-01') },
];

const initialMovementLogs: LogEntry[] = [];

// Helper function to load data from localStorage
function loadFromLocalStorage<T>(key: string, defaultValue: T, reviver?: (data: any) => T): T {
  try {
    const storedValue = localStorage.getItem(key);
    if (storedValue) {
      const parsed = JSON.parse(storedValue);
      return reviver ? reviver(parsed) : parsed;
    }
  } catch (error) {
    console.error(`Error loading ${key} from localStorage:`, error);
  }
  return defaultValue;
}

// Date revivers
const reviveAppUserDates = (users: AppUser[]): AppUser[] => {
  return users.map(user => ({
    ...user,
    createdAt: new Date(user.createdAt),
    lastModifiedAt: new Date(user.lastModifiedAt),
  }));
};

const reviveDescriptorDates = (descriptors: Descriptor[]): Descriptor[] => {
  return descriptors.map(descriptor => ({
    ...descriptor,
    createdAt: new Date(descriptor.createdAt),
    updatedAt: new Date(descriptor.updatedAt),
  }));
};

const reviveLogEntryDates = (logs: LogEntry[]): LogEntry[] => {
  return logs.map(log => ({
    ...log,
    timestamp: new Date(log.timestamp),
  }));
};


const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const [appUsers, setAppUsers] = useState<AppUser[]>(() => 
    loadFromLocalStorage('localStorageAppUsers', initialAppUsers, reviveAppUserDates)
  );
  const [productTypes, setProductTypes] = useState<string[]>(() =>
    loadFromLocalStorage('localStorageProductTypes', initialProductTypesData)
  );
  const [products, setProducts] = useState<Product[]>(() =>
    loadFromLocalStorage('localStorageProducts', initialProductsData)
  );
  const [assets, setAssets] = useState<Asset[]>(() =>
    loadFromLocalStorage('localStorageAssets', initialAssetsData)
  );
  const [descriptors, setDescriptors] = useState<Descriptor[]>(() =>
    loadFromLocalStorage('localStorageDescriptors', initialDescriptorsData, reviveDescriptorDates)
  );
  const [movementLogs, setMovementLogs] = useState<LogEntry[]>(() =>
    loadFromLocalStorage('localStorageMovementLogs', initialMovementLogs, reviveLogEntryDates)
  );


  // Save to localStorage effects
  useEffect(() => { localStorage.setItem('localStorageAppUsers', JSON.stringify(appUsers)); }, [appUsers]);
  useEffect(() => { localStorage.setItem('localStorageProductTypes', JSON.stringify(productTypes)); }, [productTypes]);
  useEffect(() => { localStorage.setItem('localStorageProducts', JSON.stringify(products)); }, [products]);
  useEffect(() => { localStorage.setItem('localStorageAssets', JSON.stringify(assets)); }, [assets]);
  useEffect(() => { localStorage.setItem('localStorageDescriptors', JSON.stringify(descriptors)); }, [descriptors]);
  useEffect(() => { localStorage.setItem('localStorageMovementLogs', JSON.stringify(movementLogs)); }, [movementLogs]);


  const addLogEntry = useCallback((actionType: ActionType, description: string, details?: Record<string, any>) => {
    const newLog: LogEntry = {
      id: `log-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      timestamp: new Date(),
      userId: currentUser?.appUserId || 'SYSTEM', 
      username: currentUser?.username || 'Sistema',
      actionType,
      description,
      details,
    };
    setMovementLogs(prevLogs => [newLog, ...prevLogs]);
  }, [currentUser]); // No need to add movementLogs to dependency array, it causes infinite loop if saving logs also creates a log.


  useEffect(() => {
    const storedUser = localStorage.getItem('currentUser');
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        setCurrentUser(parsedUser);
      } catch (error) {
        console.error("Error parsing currentUser from localStorage:", error);
        localStorage.removeItem('currentUser'); // Clear corrupted data
      }
    }
    setLoading(false);
  }, []);

  const handleLogin = useCallback((email_param: string, password_param: string): boolean => {
    const loginAttemptEmail = email_param.toLowerCase();

    const appUser = appUsers.find(u => u.email.toLowerCase() === loginAttemptEmail);

    if (!appUser) {
        addLogEntry(LogEntryActionType.USER_LOGIN_FAIL, `Tentativa de login falhou. Usuário '${email_param}' não encontrado.`);
        return false;
    }

    if (appUser.status === 'Inativo') {
        addLogEntry(LogEntryActionType.USER_LOGIN_FAIL, `Tentativa de login falhou para '${email_param}' (usuário inativo).`);
        return false;
    }

    let passwordMatch = false;
    if (appUser.email.toLowerCase() === DEFAULT_ADMIN_EMAIL.toLowerCase() && appUser.role === 'Administrador') {
        if (password_param === DEFAULT_ADMIN_PASSWORD) {
            passwordMatch = true;
        }
    } else {
        if (appUser.password_param === password_param) {
            passwordMatch = true;
        }
    }

    if (passwordMatch) {
        const userToStore: User = {
            id: appUser.id,
            username: appUser.name, 
            isAdmin: appUser.role === 'Administrador',
            appUserId: appUser.id,
            forcePasswordChange: appUser.forcePasswordChange,
        };
        setCurrentUser(userToStore);
        localStorage.setItem('currentUser', JSON.stringify(userToStore));
        addLogEntry(LogEntryActionType.USER_LOGIN_SUCCESS, `Usuário '${userToStore.username}' (email: ${email_param}) logou com sucesso.`);
        return true;
    } else {
        addLogEntry(LogEntryActionType.USER_LOGIN_FAIL, `Tentativa de login falhou para '${email_param}'. Credenciais inválidas.`);
        return false;
    }
  }, [appUsers, addLogEntry]); // addLogEntry is stable due to its own useCallback

  const handleLogout = useCallback(() => {
    if(currentUser) {
      addLogEntry(LogEntryActionType.USER_LOGOUT, `Usuário '${currentUser.username}' deslogou.`);
    }
    setCurrentUser(null);
    localStorage.removeItem('currentUser');
  }, [currentUser, addLogEntry]); // addLogEntry is stable

  // User Management
  const handleAddAppUser = (data: AddUserFormData) => {
    const newUser: AppUser = {
      id: `appuser-${Date.now()}`,
      name: data.name,
      email: data.email,
      role: data.role,
      status: data.status,
      createdAt: new Date(),
      lastModifiedAt: new Date(),
      forcePasswordChange: data.forcePasswordChange || false,
      password_param: data.password_param,
    };
    setAppUsers(prev => [newUser, ...prev]);
    addLogEntry(LogEntryActionType.USER_CREATED, `Novo usuário '${newUser.name}' (ID: ${newUser.id}) criado.`, { userData: {name: newUser.name, email: newUser.email, role: newUser.role, status: newUser.status } });
  };

  const handleEditAppUser = (userId: string, data: EditUserFormData) => {
    let oldUserData: AppUser | undefined;
    setAppUsers(prev =>
      prev.map(u => {
        if (u.id === userId) {
          oldUserData = { ...u };
          return { ...u, ...data, lastModifiedAt: new Date() };
        }
        return u;
      })
    );
    if (oldUserData) {
      addLogEntry(LogEntryActionType.USER_UPDATED, `Usuário '${data.name}' (ID: ${userId}) atualizado.`, { userId, oldData: {name: oldUserData.name, email: oldUserData.email, role: oldUserData.role, status: oldUserData.status}, newData: data });
    }
  };

  const handleDeleteAppUser = (userId: string) => {
    const userToDelete = appUsers.find(u => u.id === userId);
    setAppUsers(prev => prev.filter(u => u.id !== userId));
    setAssets(prevAssets => prevAssets.map(asset => 
      asset.responsibleUserId === userId ? { ...asset, responsibleUserId: null } : asset
    ));
    if (userToDelete) {
      addLogEntry(LogEntryActionType.USER_DELETED, `Usuário '${userToDelete.name}' (ID: ${userId}) excluído.`, { userId, deletedUserName: userToDelete.name, deletedUserEmail: userToDelete.email });
    }
  };
  
  const handleResetAppUserPassword = (userId: string, newPassword_param: string) => {
    let updatedUser: AppUser | undefined;
    setAppUsers(prev => 
      prev.map(u => {
        if (u.id === userId) {
          updatedUser = { ...u, password_param: newPassword_param, lastModifiedAt: new Date(), forcePasswordChange: true };
          return updatedUser;
        }
        return u;
      })
    );
    if(updatedUser){
      addLogEntry(LogEntryActionType.USER_PASSWORD_RESET, `Senha do usuário '${updatedUser.name}' (ID: ${userId}) resetada. Próximo login forçará troca.`, { userId, userName: updatedUser.name });
    }
  };

  const handleChangeForcedPassword = (newPassword_param: string) => {
    if (!currentUser || !currentUser.appUserId) {
      addLogEntry(LogEntryActionType.SYSTEM_ERROR, `Tentativa de troca de senha forçada sem usuário logado ou appUserId.`);
      return false; 
    }
    
    let passwordChanged = false;
    setAppUsers(prevAppUsers => 
      prevAppUsers.map(appUser => {
        if (appUser.id === currentUser.appUserId) {
          passwordChanged = true;
          return { ...appUser, password_param: newPassword_param, forcePasswordChange: false, lastModifiedAt: new Date() };
        }
        return appUser;
      })
    );

    if (passwordChanged) {
      const updatedCurrentUser: User = { ...currentUser, forcePasswordChange: false };
      setCurrentUser(updatedCurrentUser);
      localStorage.setItem('currentUser', JSON.stringify(updatedCurrentUser)); // Update localStorage for currentUser too
      addLogEntry(LogEntryActionType.USER_PASSWORD_RESET, `Usuário '${currentUser.username}' alterou sua senha (forçado).`, { userId: currentUser.appUserId });
      return true;
    }
    return false;
  };

  // Product Type Management
  const handleAddProductType = (newTypeName: string): boolean => {
    if (productTypes.some(pt => pt.toLowerCase() === newTypeName.toLowerCase())) {
      addLogEntry(LogEntryActionType.SYSTEM_ERROR, `Falha ao adicionar tipo de produto: '${newTypeName}' já existe.`);
      return false;
    }
    setProductTypes(prev => [...prev, newTypeName].sort((a,b) => a.localeCompare(b)));
    addLogEntry(LogEntryActionType.PRODUCT_TYPE_CREATED, `Novo tipo de produto '${newTypeName}' adicionado.`);
    return true;
  };

  const handleEditProductType = (oldTypeName: string, newTypeName: string): boolean => {
     if (oldTypeName.toLowerCase() !== newTypeName.toLowerCase() && productTypes.some(pt => pt.toLowerCase() === newTypeName.toLowerCase())) {
      addLogEntry(LogEntryActionType.SYSTEM_ERROR, `Falha ao editar tipo de produto: Novo nome '${newTypeName}' já existe.`);
      return false;
    }
    setProductTypes(prev => prev.map(pt => pt === oldTypeName ? newTypeName : pt).sort((a,b) => a.localeCompare(b)));
    setProducts(prevProducts => prevProducts.map(p => p.type === oldTypeName ? { ...p, type: newTypeName } : p));
    addLogEntry(LogEntryActionType.PRODUCT_TYPE_UPDATED, `Tipo de produto '${oldTypeName}' atualizado para '${newTypeName}'.`);
    return true;
  };

  const handleDeleteProductType = (typeNameToDelete: string) => {
    // Check if any product uses this type
    const isTypeInUse = products.some(p => p.type === typeNameToDelete);
    if (isTypeInUse) {
        addLogEntry(LogEntryActionType.SYSTEM_ERROR, `Falha ao excluir tipo de produto: '${typeNameToDelete}' está em uso por um ou mais produtos.`);
        alert(`Não é possível excluir o tipo "${typeNameToDelete}" pois ele está associado a produtos existentes. Remova ou altere os produtos primeiro.`);
        return;
    }
    setProductTypes(prev => prev.filter(pt => pt !== typeNameToDelete));
    addLogEntry(LogEntryActionType.PRODUCT_TYPE_DELETED, `Tipo de produto '${typeNameToDelete}' excluído.`);
  };


  // Product Management
  const handleAddProduct = (data: ProductFormData & { company: Company }) => {
    const newProduct: Product = {
      id: `prod${Date.now()}`,
      type: data.type,
      brand: data.brand,
      model: data.model,
      description: data.description,
      barcode: data.barcode,
      company: data.company,
      quantity: 0, 
    };
    setProducts(prev => [newProduct, ...prev]);
    addLogEntry(LogEntryActionType.PRODUCT_CREATED, `Produto '${newProduct.brand} ${newProduct.model}' (Empresa: ${newProduct.company}, ID: ${newProduct.id}) criado.`, { productData: { brand: newProduct.brand, model: newProduct.model, type: newProduct.type, company: newProduct.company } });
  };

  const handleUpdateProductQuantity = (productId: string, amountChange: number, details: { purchaseOrder?: string, destinationAssetId?: string, ticketNumber?: string}) => {
    let updatedProduct: Product | undefined;
    let oldQuantity: number | undefined;

    setProducts(prev => 
      prev.map(p => {
        if (p.id === productId) {
          oldQuantity = p.quantity;
          const newQuantity = p.quantity + amountChange;
          if (newQuantity < 0) {
            addLogEntry(LogEntryActionType.SYSTEM_ERROR, `Tentativa de definir quantidade negativa para o produto ID: ${productId}.`, { productId, amountChange, currentQuantity: p.quantity });
            alert("A quantidade não pode ser negativa.");
            return p; 
          }
          updatedProduct = { ...p, quantity: newQuantity };
          return updatedProduct;
        }
        return p;
      })
    );
    if (updatedProduct && oldQuantity !== undefined) {
      addLogEntry(LogEntryActionType.PRODUCT_QUANTITY_UPDATED, 
        `Qtd. do produto '${updatedProduct.brand} ${updatedProduct.model}' (ID: ${productId}) alterada em ${amountChange}. Nova: ${updatedProduct.quantity}.`, 
        { productId, productName: `${updatedProduct.brand} ${updatedProduct.model}`, oldQuantity, newQuantity: updatedProduct.quantity, change: amountChange, transactionDetails: details }
      );
    }
  };

  // Asset Management
  const handleAddAsset = (data: AssetFormData) => {
    const qrCodeValue = `${data.assetType}:${data.serialNumber}:${data.model}`.slice(0, 50); 
    const newAsset: Asset = {
      id: `asset${Date.now()}`,
      assetType: data.assetType,
      serialNumber: data.serialNumber,
      brand: data.brand,
      model: data.model,
      acquisitionDate: data.acquisitionDate,
      status: data.status,
      location: data.location,
      responsibleUserId: data.responsibleUserId,
      observations: data.observations,
      maintenanceNotes: data.maintenanceNotes, 
      qrCodeValue,
    };
    setAssets(prev => [newAsset, ...prev]);
    addLogEntry(LogEntryActionType.ASSET_CREATED, `Ativo '${newAsset.assetType} ${newAsset.serialNumber}' (ID: ${newAsset.id}) criado.`, { assetData: { type: newAsset.assetType, serial: newAsset.serialNumber, brand: newAsset.brand, model: newAsset.model } });
  };

  const handleUpdateAsset = (assetId: string, data: AssetFormData) => {
    const qrCodeValue = `${data.assetType}:${data.serialNumber}:${data.model}`.slice(0, 50);
    let oldAssetData: Asset | undefined;
    setAssets(prev => 
      prev.map(a => {
        if (a.id === assetId) {
          oldAssetData = { ...a };
          return { ...a, ...data, maintenanceNotes: data.maintenanceNotes, qrCodeValue };
        }
        return a;
      })
    );
    if (oldAssetData) {
      const changedFields: Partial<AssetFormData> = {};
      (Object.keys(data) as Array<keyof AssetFormData>).forEach(key => {
        if(data[key] !== oldAssetData![key as keyof Asset]) { // @ts-ignore
          changedFields[key] = data[key];
        }
      });
      addLogEntry(LogEntryActionType.ASSET_UPDATED, `Ativo '${data.assetType} ${data.serialNumber}' (ID: ${assetId}) atualizado.`, { assetId, oldSerial: oldAssetData.serialNumber, newSerial: data.serialNumber, changes: changedFields });
    }
  };

  const handleDeleteAsset = (assetId: string) => {
    const assetToDelete = assets.find(a => a.id === assetId);
    setAssets(prev => prev.filter(a => a.id !== assetId));
    if (assetToDelete) {
      addLogEntry(LogEntryActionType.ASSET_DELETED, `Ativo '${assetToDelete.assetType} ${assetToDelete.serialNumber}' (ID: ${assetId}) excluído.`, { assetId, deletedAssetInfo: `${assetToDelete.assetType} ${assetToDelete.serialNumber}` });
    }
  };
  
  const handleImportAssets = (importedAssetsData: AssetFormData[], summaryFromPage: { successfullyAdded: number; duplicatesSkipped: number; errors: number; errorDetails: string[]}) => {
    let currentAssetsView = [...assets]; 
    let newAssetsAddedToState: Asset[] = [];
    let actualDuplicatesFound = 0;

    importedAssetsData.forEach(data => {
        const isDuplicate = currentAssetsView.some(existingAsset => existingAsset.serialNumber === data.serialNumber);
        if (!isDuplicate) {
            const qrCodeValue = `${data.assetType}:${data.serialNumber}:${data.model}`.slice(0, 50);
            const newAsset: Asset = {
                id: `asset${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
                ...data,
                qrCodeValue,
            };
            newAssetsAddedToState.push(newAsset);
            currentAssetsView.push(newAsset); 
        } else {
            actualDuplicatesFound++;
        }
    });

    if (newAssetsAddedToState.length > 0) {
        setAssets(prev => [...newAssetsAddedToState, ...prev]);
    }
    
    addLogEntry(LogEntryActionType.ASSET_IMPORTED, 
      `Importação de ativos via CSV: ${newAssetsAddedToState.length} adicionados ao sistema, ${actualDuplicatesFound} duplicatas encontradas, ${summaryFromPage.errors} erros de parsing.`, 
      { 
        parsedSuccessfullyFromCsv: summaryFromPage.successfullyAdded,
        addedToSystem: newAssetsAddedToState.length,
        duplicatesFoundInSystem: actualDuplicatesFound,
        parsingErrors: summaryFromPage.errors,
        errorDetails: summaryFromPage.errorDetails,
        rawImportedCount: importedAssetsData.length 
      }
    );
  };


  // Descriptor Management
  const handleAddDescriptor = (data: DescriptorFormData) => {
    const newDescriptor: Descriptor = {
      id: `desc${Date.now()}`,
      ...data,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    setDescriptors(prev => [newDescriptor, ...prev]);
    addLogEntry(LogEntryActionType.DESCRIPTOR_CREATED, `Descritivo '${newDescriptor.title}' (ID: ${newDescriptor.id}) criado.`, { descriptorData: { title: newDescriptor.title, type: newDescriptor.equipmentType, category: newDescriptor.category } });
  };

  const handleUpdateDescriptor = (descriptorId: string, data: DescriptorFormData) => {
     let oldDescriptorData: Descriptor | undefined;
    setDescriptors(prev =>
      prev.map(d => {
        if (d.id === descriptorId) {
          oldDescriptorData = { ...d };
          return { ...d, ...data, updatedAt: new Date() };
        }
        return d;
      })
    );
    if(oldDescriptorData) {
       addLogEntry(LogEntryActionType.DESCRIPTOR_UPDATED, `Descritivo '${data.title}' (ID: ${descriptorId}) atualizado.`, { descriptorId, oldTitle: oldDescriptorData.title, newTitle: data.title });
    }
  };

  const handleDeleteDescriptor = (descriptorId: string) => {
    const descriptorToDelete = descriptors.find(d => d.id === descriptorId);
    setDescriptors(prev => prev.filter(d => d.id !== descriptorId));
     if (descriptorToDelete) {
      addLogEntry(LogEntryActionType.DESCRIPTOR_DELETED, `Descritivo '${descriptorToDelete.title}' (ID: ${descriptorId}) excluído.`, { descriptorId, deletedTitle: descriptorToDelete.title });
    }
  };


  if (loading) {
    return <div className="flex items-center justify-center h-screen"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div></div>;
  }

  const ProtectedRoute: React.FC<{isAdminRoute?: boolean, children?: React.ReactNode}> = ({ isAdminRoute, children }) => {
    if (!currentUser) {
      return <Navigate to="/login" replace />;
    }
    if (isAdminRoute && !currentUser.isAdmin) {
       return <Navigate to="/dashboard" replace />; 
    }
    return children ? <>{children}</> : <Outlet />;
  };
  
  return (
    <Routes>
      <Route path="/login" element={currentUser ? <Navigate to="/dashboard" /> : <LoginPage onLogin={handleLogin} />} />
      
      <Route path="/force-change-password" element={
        <ProtectedRoute>
          {currentUser?.forcePasswordChange ? (
            <ForceChangePasswordPage 
              onChangePassword={handleChangeForcedPassword} 
              onLogout={handleLogout} 
              username={currentUser.username}
            />
          ) : (
            <Navigate to="/dashboard" replace />
          )}
        </ProtectedRoute>
      } />

      <Route element={<ProtectedRoute />}>
        <Route path="/dashboard" element={
            currentUser?.forcePasswordChange ? (
                <Navigate to="/force-change-password" replace />
            ) : (
                <DashboardLayout currentUser={currentUser!} onLogout={handleLogout} />
            )
        }>
          <Route index element={<MainDashboardPage products={products} assets={assets} />} />
          
          <Route element={<ProtectedRoute isAdminRoute={true} />}>
            <Route path="users" element={<UserManagementPage users={appUsers} onAddUser={handleAddAppUser} onEditUser={handleEditAppUser} onDeleteUser={handleDeleteAppUser} onResetPassword={handleResetAppUserPassword} />} />
            <Route path="products/add" element={<ProductAddPage products={products} productTypes={productTypes} onAddProduct={handleAddProduct} />} />
            
            <Route path="descriptors" element={<DescriptorManagementPage descriptors={descriptors} onDeleteDescriptor={handleDeleteDescriptor} />} />
            <Route path="descriptors/add" element={<DescriptorAddPage onAddDescriptor={handleAddDescriptor} />} />
            <Route path="descriptors/edit/:descriptorId" element={<DescriptorEditPage descriptors={descriptors} onUpdateDescriptor={handleUpdateDescriptor} />} />

            <Route path="product-types" element={<ProductTypeManagementPage productTypes={productTypes} onAddProductType={handleAddProductType} onEditProductType={handleEditProductType} onDeleteProductType={handleDeleteProductType} />} />

            <Route path="assets/add" element={<AssetAddPage users={appUsers} onAddAsset={handleAddAsset} />} />
            <Route path="assets/edit/:assetId" element={<AssetEditPage assets={assets} users={appUsers} onUpdateAsset={handleUpdateAsset} />} />
            
            <Route path="admin" element={<AdminDashboardPage appUsers={appUsers} products={products} assets={assets} descriptors={descriptors} movementLogs={movementLogs} />} />
          </Route>
          
          <Route path="products/search" element={<ProductSearchPage products={products} productTypes={productTypes} onUpdateQuantity={handleUpdateProductQuantity} />} />
          <Route path="assets" element={<AssetManagementPage assets={assets} users={appUsers} onDeleteAsset={handleDeleteAsset} onImportAssets={handleImportAssets} />} />
          <Route path="logs" element={<MovementLogsPage logs={movementLogs} />} />
          <Route path="reports" element={<ReportsDashboardPage products={products} assets={assets} />} />

          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Route>
      </Route>
      
      <Route path="*" element={<Navigate to={currentUser ? "/dashboard" : "/login"} />} />
    </Routes>
  );
};

export default App;
