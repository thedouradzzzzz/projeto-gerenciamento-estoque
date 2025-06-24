
import React, { useState, useEffect, useCallback } from 'react';
import { Routes, Route, Navigate, Outlet, useNavigate, useLocation } from 'react-router-dom';
import LoginPage from './components/auth/LoginPage';
import DashboardLayout from './components/dashboard/DashboardLayout';
import MainDashboardPage from './pages/dashboard/MainDashboardPage';
import UserManagementPage from './pages/UserManagementPage';
import ProductSearchPage from './pages/products/ProductSearchPage';
import ProductAddPage from './pages/products/ProductAddPage';
import AssetManagementPage from './pages/assets/AssetManagementPage';
import AssetAddPage from './pages/assets/AssetAddPage';
import AssetEditPage from './pages/assets/AssetEditPage';
import DescriptorManagementPage from './pages/descriptors/DescriptorManagementPage';
import DescriptorAddPage from './pages/descriptors/DescriptorAddPage';
import DescriptorEditPage from './pages/descriptors/DescriptorEditPage';
import ProductTypeManagementPage from './pages/products/ProductTypeManagementPage'; // Will be CategoryManagement
import MovementLogsPage from './pages/logs/MovementLogsPage';
import ReportsDashboardPage from './pages/reports/ReportsDashboardPage';
import AdminDashboardPage from './pages/admin/AdminDashboardPage';
import PlaceholderContent from './pages/PlaceholderContent';
import ForceChangePasswordPage from './pages/auth/ForceChangePasswordPage'; // For reset password link
import ForgotPasswordModal from './components/auth/ForgotPasswordModal'; // New Modal

import apiService from './services/apiService';

import type { 
  User, 
  AppUser, 
  Product, 
  Asset, 
  Descriptor, 
  LogEntry, 
  Category,
  Fornecedor,
  ProductFormData,
  AssetFormData,
  DescriptorFormData,
  AddUserFormData,
  EditUserFormData,
  ResetPasswordFormData,
  AddQuantityFormData,
  SubtractQuantityFormData,
  ForgotPasswordFormData,
} from './types';
import { LogEntryActionType } from './types';


const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [appUsers, setAppUsers] = useState<AppUser[]>([]); 
  const [products, setProducts] = useState<Product[]>([]);
  const [assets, setAssets] = useState<Asset[]>([]); // Now from API
  const [descriptors, setDescriptors] = useState<Descriptor[]>([]); // Now from API
  const [logs, setLogs] = useState<LogEntry[]>([]); // Frontend logs, stays on localStorage for now
  const [categories, setCategories] = useState<Category[]>([]);
  const [fornecedores, setFornecedores] = useState<Fornecedor[]>([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null); // General error for login page
  const [toast, setToast] = useState<{ message: string, type: 'success' | 'error' } | null>(null);
  const [isForgotPasswordModalOpen, setIsForgotPasswordModalOpen] = useState(false);


  const navigate = useNavigate();
  const location = useLocation();

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  // --- LOGGING ---
  const addLog = useCallback((actionType: LogEntryActionType, description: string, details?: Record<string, any>) => {
    const newLog: LogEntry = {
      id: Date.now().toString(), 
      timestamp: new Date(),
      userId: currentUser?.id || 'System',
      username: currentUser?.username || 'Sistema',
      actionType,
      description,
      details,
    };
    setLogs(prevLogs => {
      const updatedLogs = [newLog, ...prevLogs];
      try {
        localStorage.setItem('movementLogs', JSON.stringify(updatedLogs));
      } catch (e) {
        console.error("Failed to save logs to localStorage:", e);
      }
      return updatedLogs;
    });
  }, [currentUser]);


  // --- AUTH HANDLERS ---
  const handleLogin = async (email: string, password_param: string): Promise<boolean> => {
    setError(null);
    try {
      const loginResponse = await apiService.login(email, password_param);
      if (loginResponse.success && loginResponse.token) {
        localStorage.setItem('authToken', loginResponse.token); 
        
        const meResponse = await apiService.getMe(); 
        if (meResponse.success) {
          const backendUser = meResponse.data;
          const userToStore: User = {
            id: backendUser.id,
            username: backendUser.name,
            isAdmin: backendUser.role === 'Gerente',
            token: loginResponse.token,
          };
          setCurrentUser(userToStore);
          localStorage.setItem('currentUser', JSON.stringify(userToStore));
          localStorage.removeItem('authToken'); 
          
          addLog(LogEntryActionType.USER_LOGIN_SUCCESS, `Usuário ${userToStore.username} logado.`);
          showToast('Login bem-sucedido!', 'success');
          navigate('/dashboard'); // Explicit navigation after successful login and data set
          return true;
        } else {
          throw new Error(meResponse.message || "Falha ao buscar dados do usuário.");
        }
      } else {
        throw new Error(loginResponse.message || "Credenciais inválidas.");
      }
    } catch (err: any) {
      setError(err.message || 'Erro de login.');
      addLog(LogEntryActionType.USER_LOGIN_FAIL, `Login falhou para ${email}. Erro: ${err.message}`);
      showToast(`Falha no login: ${err.message}`, 'error');
      localStorage.removeItem('authToken'); 
      return false;
    }
  };

  const handleLogout = () => {
    if (currentUser) {
      addLog(LogEntryActionType.USER_LOGOUT, `Usuário ${currentUser.username} deslogado.`);
    }
    setCurrentUser(null);
    localStorage.removeItem('currentUser');
    setAppUsers([]);
    setProducts([]);
    setCategories([]);
    setFornecedores([]);
    setAssets([]);
    setDescriptors([]);
    showToast('Logout realizado com sucesso.', 'success');
    navigate('/');
  };
  
  const handleForgotPasswordSubmit = async (data: ForgotPasswordFormData) => {
    try {
      const response = await apiService.forgotPassword(data.email);
      if (response.success) {
        showToast(response.message || 'Se o e-mail existir, um link de recuperação foi enviado.', 'success');
        addLog(LogEntryActionType.USER_PASSWORD_RESET_REQUEST, `Solicitação de reset de senha para ${data.email}. Backend msg: ${response.message}`);
        setIsForgotPasswordModalOpen(false);
      } else {
        throw new Error(response.message);
      }
    } catch (err: any) {
      showToast(`Erro ao solicitar reset de senha: ${err.message}`, 'error');
      addLog(LogEntryActionType.API_ERROR, `Falha na solicitação de reset de senha para ${data.email}.`, { error: err.message });
    }
  };
  
  // This is for the /resetpassword/:token page
  const handleActualPasswordReset = async (token: string, newPassword_param: string): Promise<boolean> => {
    try {
      const response = await apiService.resetPasswordWithToken(token, newPassword_param);
      if (response.success) {
        addLog(LogEntryActionType.USER_PASSWORD_RESET_SUCCESS, `Senha resetada com sucesso usando token.`);
        showToast('Senha alterada com sucesso! Você pode fazer login.', 'success');
        return true;
      } else {
        throw new Error(response.message);
      }
    } catch (err: any) {
      addLog(LogEntryActionType.API_ERROR, `Falha ao resetar senha com token.`, { error: err.message });
      showToast(`Erro ao alterar senha: ${err.message}`, 'error');
      return false;
    }
  };


  // --- DATA FETCHING ---
  const fetchData = useCallback(async () => {
    if (!currentUser || !currentUser.token) {
      setLoading(false); 
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const [
        categoriesRes, 
        fornecedoresRes, 
        productsRes, 
        appUsersRes, 
        assetsRes, 
        descriptorsRes
      ] = await Promise.all([
        apiService.fetchCategories(),
        apiService.fetchFornecedores(),
        apiService.fetchProducts(),
        apiService.fetchAppUsers(),
        apiService.fetchAssets(),
        apiService.fetchDescriptors(),
      ]);

      if (categoriesRes.success) setCategories(categoriesRes.data);
      else throw new Error(`Categorias: ${categoriesRes.message}`);
      
      if (fornecedoresRes.success) setFornecedores(fornecedoresRes.data);
      else throw new Error(`Fornecedores: ${fornecedoresRes.message}`);

      if (productsRes.success) setProducts(productsRes.data);
      else throw new Error(`Produtos: ${productsRes.message}`);
      
      if (appUsersRes.success) setAppUsers(appUsersRes.data);
      else throw new Error(`Usuários: ${appUsersRes.message}`);

      if (assetsRes.success) setAssets(assetsRes.data);
      else throw new Error(`Ativos: ${assetsRes.message}`);

      if (descriptorsRes.success) setDescriptors(descriptorsRes.data);
      else throw new Error(`Descritivos: ${descriptorsRes.message}`);

    } catch (err: any) {
      setError(err.message || 'Erro ao carregar dados.');
      showToast(`Erro ao carregar dados: ${err.message}`, 'error');
      addLog(LogEntryActionType.API_ERROR, 'Falha ao carregar dados API.', { error: err.message });
      if (err.message.toLowerCase().includes('não autorizado') || err.message.toLowerCase().includes('unauthorized')) {
        handleLogout(); // Force logout if token is invalid
      }
    } finally {
      setLoading(false);
    }
  }, [currentUser, addLog]); // addLog added to dependencies

  useEffect(() => {
    const storedUser = localStorage.getItem('currentUser');
    if (storedUser) {
      try {
        const parsedUser: User = JSON.parse(storedUser);
        setCurrentUser(parsedUser);
      } catch (e) {
        console.error("Falha ao parsear usuário:", e);
        localStorage.removeItem('currentUser');
        setLoading(false);
      }
    } else {
      setLoading(false); 
    }
    
    // Load frontend-only logs
    const storedLogs = localStorage.getItem('movementLogs');
    if (storedLogs) setLogs(JSON.parse(storedLogs).map((l: LogEntry) => ({...l, timestamp: new Date(l.timestamp)})));
    else setLogs([]);

  }, []); 

  useEffect(() => {
    if (currentUser && currentUser.token) {
        fetchData();
    } else {
        setAppUsers([]);
        setProducts([]);
        setCategories([]);
        setFornecedores([]);
        setAssets([]);
        setDescriptors([]);
    }
  }, [currentUser, fetchData]);


  // --- USER MANAGEMENT HANDLERS ---
  const handleAddUser = async (data: AddUserFormData) => { // This is for admin creating user / register
    try {
      const response = await apiService.registerUser(data); 
      if (response.success) {
        addLog(LogEntryActionType.USER_REGISTERED, `Usuário ${data.name} registrado.`);
        showToast('Usuário registrado com sucesso!', 'success');
        // No need to fetchAppUsers here, as an admin typically registers, not adds to current session's list immediately
      } else {
        throw new Error(response.message);
      }
    } catch (err: any) {
      addLog(LogEntryActionType.API_ERROR, `Falha ao registrar ${data.name}.`, { error: err.message });
      showToast(`Erro ao registrar: ${err.message}`, 'error');
    }
  };
  const handleEditUser = async (userId: string, data: EditUserFormData) => { 
    try {
      const response = await apiService.updateAppUser(userId, data);
      if (response.success) {
        setAppUsers(prev => prev.map(u => u.id === userId ? response.data : u));
        addLog(LogEntryActionType.USER_UPDATED, `Usuário ID ${userId} atualizado.`, { data: response.data });
        showToast('Usuário atualizado!', 'success');
      } else {
        throw new Error(response.message);
      }
    } catch (err: any) {
      addLog(LogEntryActionType.API_ERROR, `Falha ao editar usuário ID ${userId}.`, { error: err.message });
      showToast(`Erro ao editar: ${err.message}`, 'error');
    }
  };
  const handleDeleteUser = async (userId: string) => { 
    try {
      const response = await apiService.deleteAppUser(userId);
      if (response.success) {
        setAppUsers(prev => prev.filter(u => u.id !== userId));
        addLog(LogEntryActionType.USER_DELETED, `Usuário ID ${userId} excluído.`);
        showToast('Usuário excluído!', 'success');
      } else {
        throw new Error(response.message);
      }
    } catch (err: any)      {
      addLog(LogEntryActionType.API_ERROR, `Falha ao excluir usuário ID ${userId}.`, { error: err.message });
      showToast(`Erro ao excluir: ${err.message}`, 'error');
    }
  };
  const handleResetPasswordByAdmin = async (userId: string, newPassword_param: string) => { 
    // This flow isn't directly supported by a single admin API endpoint in the provided backend.
    // The backend has /forgotpassword (user initiates) and /resetpassword/:token (user confirms).
    // An admin resetting another user's password usually involves setting a temporary password or forcing a reset.
    // For now, this handler will remain a placeholder.
    console.warn('Reset password by admin: Funcionalidade não implementada no backend da forma esperada.', userId);
    showToast('Reset de senha por admin não implementado no backend.', 'error');
    addLog(LogEntryActionType.API_ERROR, `Tentativa de reset de senha (admin) para usuário ${userId} (API não implementada).`);
  };

  // --- CATEGORY HANDLERS ---
  const handleAddCategory = async (name: string, description?: string): Promise<boolean> => {
    try {
      const response = await apiService.createCategory(name, description);
      if (response.success) {
        setCategories(prev => [...prev, response.data].sort((a,b) => a.name.localeCompare(b.name)));
        addLog(LogEntryActionType.CATEGORY_CREATED, `Categoria "${name}" criada.`, { category: response.data });
        showToast('Categoria adicionada!', 'success');
        return true;
      }
      throw new Error(response.message);
    } catch (err: any) {
      addLog(LogEntryActionType.API_ERROR, `Falha ao criar categoria "${name}".`, { error: err.message });
      showToast(`Erro categoria: ${err.message}`, 'error');
      return false;
    }
  };

  const handleEditCategory = async (id: string, newName: string, newDescription?: string): Promise<boolean> => {
     try {
      const response = await apiService.updateCategory(id, newName, newDescription);
      if (response.success) {
        setCategories(prev => prev.map(c => c.id === id ? response.data : c).sort((a,b) => a.name.localeCompare(b.name)));
        addLog(LogEntryActionType.CATEGORY_UPDATED, `Categoria ID ${id} atualizada para "${newName}".`);
        showToast('Categoria atualizada!', 'success');
        return true;
      }
      throw new Error(response.message);
    } catch (err: any) {
      addLog(LogEntryActionType.API_ERROR, `Falha ao atualizar categoria ID ${id}.`, { error: err.message });
      showToast(`Erro categoria: ${err.message}`, 'error');
      return false;
    }
  };

  const handleDeleteCategory = async (id: string) => {
    const categoryInUse = products.some(p => p.categoryId === id);
    if (categoryInUse) {
        showToast('Não é possível excluir: Categoria em uso.', 'error');
        addLog(LogEntryActionType.API_ERROR, `Tentativa de excluir categoria ID ${id} em uso.`);
        return;
    }
    try {
      const response = await apiService.deleteCategory(id);
      if (response.success) {
        setCategories(prev => prev.filter(c => c.id !== id));
        addLog(LogEntryActionType.CATEGORY_DELETED, `Categoria ID ${id} excluída.`);
        showToast('Categoria excluída!', 'success');
      } else {
        throw new Error(response.message);
      }
    } catch (err: any) {
      addLog(LogEntryActionType.API_ERROR, `Falha ao excluir categoria ID ${id}.`, { error: err.message });
      showToast(`Erro categoria: ${err.message}`, 'error');
    }
  };
  
  // --- PRODUCT HANDLERS ---
  const handleAddProduct = async (data: ProductFormData) => {
    try {
      const apiData = { // Ensure barcode is included
          name: data.name,
          barcode: data.barcode,
          descricao: data.description,
          price: data.price, 
          categoria: data.categoria, 
          fornecedor: data.fornecedor || undefined,
      };
      const response = await apiService.createProduct(apiData);
      if (response.success) {
        const newProduct = response.data;
        // Populate names if not returned by API (though backend Product controller does populate)
        if (!newProduct.categoryName && newProduct.categoryId) {
            newProduct.categoryName = categories.find(c => c.id === newProduct.categoryId)?.name;
        }
        if (!newProduct.fornecedorName && newProduct.fornecedorId) {
            newProduct.fornecedorName = fornecedores.find(f => f.id === newProduct.fornecedorId)?.name;
        }
        setProducts(prev => [...prev, newProduct]);
        addLog(LogEntryActionType.PRODUCT_CREATED, `Produto "${newProduct.name}" criado.`, { product: newProduct });
        showToast('Produto adicionado!', 'success');
      } else {
        throw new Error(response.message);
      }
    } catch (err: any) {
      addLog(LogEntryActionType.API_ERROR, `Falha ao criar produto "${data.name}".`, { error: err.message });
      showToast(`Erro produto: ${err.message}`, 'error');
    }
  };

  const handleUpdateQuantity = async (productId: string, amountChange: number, details: { priceCost?: number; reason?: SubtractQuantityFormData['reason'] }) => {
    try {
      let response;
      if (amountChange > 0) {
        if (details.priceCost === undefined || details.priceCost <= 0) {
            showToast('Preço de custo é obrigatório e positivo.', 'error'); return;
        }
        response = await apiService.createEntradaEstoque({ productId, quantity: amountChange, priceCost: details.priceCost });
        addLog(LogEntryActionType.PRODUCT_QUANTITY_ADD, `Entrada de ${amountChange} para ID ${productId}.`, { details });
      } else if (amountChange < 0) {
        if (!details.reason) {
            showToast('Motivo é obrigatório para saídas.', 'error'); return;
        }
        response = await apiService.createSaidaEstoque({ productId, quantity: Math.abs(amountChange), reason: details.reason });
        addLog(LogEntryActionType.PRODUCT_QUANTITY_SUBTRACT, `Saída de ${Math.abs(amountChange)} para ID ${productId}.`, { details });
      } else return;

      if (response.success) {
        // Refetch products or update locally
        setProducts(prev => prev.map(p => p.id === productId ? { ...p, quantity: p.quantity + amountChange } : p));
        showToast('Quantidade atualizada!', 'success');
      } else {
        throw new Error(response.message);
      }
    } catch (err: any) {
      addLog(LogEntryActionType.API_ERROR, `Falha ao atualizar qtd produto ID ${productId}.`, { error: err.message });
      showToast(`Erro qtd: ${err.message}`, 'error');
    }
  };

  // --- ASSET HANDLERS (Now API Based) ---
  const handleAddAsset = async (data: AssetFormData) => {
    try {
        const response = await apiService.createAsset(data);
        if (response.success) {
            setAssets(prev => [...prev, response.data]);
            addLog(LogEntryActionType.ASSET_CREATED, `Ativo "${response.data.name}" criado via API.`);
            showToast('Ativo adicionado!', 'success');
        } else {
            throw new Error(response.message);
        }
    } catch (err: any) {
        addLog(LogEntryActionType.API_ERROR, `Falha ao criar ativo.`, { error: err.message, data });
        showToast(`Erro ativo: ${err.message}`, 'error');
    }
  };

  const handleUpdateAsset = async (assetId: string, data: AssetFormData) => {
     try {
        const response = await apiService.updateAsset(assetId, data);
        if (response.success) {
            setAssets(prev => prev.map(asset => asset.id === assetId ? response.data : asset));
            addLog(LogEntryActionType.ASSET_UPDATED, `Ativo ID ${assetId} atualizado via API.`);
            showToast('Ativo atualizado!', 'success');
        } else {
            throw new Error(response.message);
        }
    } catch (err: any) {
        addLog(LogEntryActionType.API_ERROR, `Falha ao atualizar ativo ID ${assetId}.`, { error: err.message, data });
        showToast(`Erro ativo: ${err.message}`, 'error');
    }
  };

  const handleDeleteAsset = async (assetId: string) => {
    try {
        const response = await apiService.deleteAsset(assetId);
        if (response.success) {
            setAssets(prev => prev.filter(asset => asset.id !== assetId));
            addLog(LogEntryActionType.ASSET_DELETED, `Ativo ID ${assetId} excluído via API.`);
            showToast('Ativo excluído!', 'success');
        } else {
            throw new Error(response.message);
        }
    } catch (err: any) {
        addLog(LogEntryActionType.API_ERROR, `Falha ao excluir ativo ID ${assetId}.`, { error: err.message });
        showToast(`Erro ativo: ${err.message}`, 'error');
    }
  };

   const handleImportAssets = (importedAssetsData: AssetFormData[], summary: { successfullyAdded: number; duplicatesSkipped: number; errors: number; errorDetails: string[] }) => {
    console.warn("handleImportAssets: A importação de CSV para Ativos precisa ser reavaliada para o novo modelo de dados do backend (Asset: nome, descricao, responsavel, localizacao). Funcionalidade desabilitada por enquanto.");
    showToast("Importação CSV de Ativos desabilitada devido a mudanças no modelo de dados.", "error");
    addLog(LogEntryActionType.API_ERROR, "Tentativa de importação de CSV de Ativos (desabilitado).", { summary });
  };

  // --- DESCRIPTOR HANDLERS (Now API Based) ---
  const handleAddDescriptor = async (data: DescriptorFormData) => {
    try {
        const response = await apiService.createDescriptor(data);
        if (response.success) {
            setDescriptors(prev => [...prev, response.data]);
            addLog(LogEntryActionType.DESCRIPTOR_CREATED, `Descritivo "${response.data.name}" criado via API.`);
            showToast('Descritivo adicionado!', 'success');
        } else {
            throw new Error(response.message);
        }
    } catch (err: any) {
        addLog(LogEntryActionType.API_ERROR, `Falha ao criar descritivo.`, { error: err.message, data });
        showToast(`Erro descritivo: ${err.message}`, 'error');
    }
  };
  
  const handleUpdateDescriptor = async (descriptorId: string, data: DescriptorFormData) => {
    try {
        const response = await apiService.updateDescriptor(descriptorId, data);
        if (response.success) {
            setDescriptors(prev => prev.map(d => d.id === descriptorId ? response.data : d));
            addLog(LogEntryActionType.DESCRIPTOR_UPDATED, `Descritivo ID ${descriptorId} atualizado via API.`);
            showToast('Descritivo atualizado!', 'success');
        } else {
            throw new Error(response.message);
        }
    } catch (err: any) {
        addLog(LogEntryActionType.API_ERROR, `Falha ao atualizar descritivo ID ${descriptorId}.`, { error: err.message, data });
        showToast(`Erro descritivo: ${err.message}`, 'error');
    }
  };

  const handleDeleteDescriptor = async (descriptorId: string) => {
     try {
        const response = await apiService.deleteDescriptor(descriptorId);
        if (response.success) {
            setDescriptors(prev => prev.filter(d => d.id !== descriptorId));
            addLog(LogEntryActionType.DESCRIPTOR_DELETED, `Descritivo ID ${descriptorId} excluído via API.`);
            showToast('Descritivo excluído!', 'success');
        } else {
            throw new Error(response.message);
        }
    } catch (err: any) {
        addLog(LogEntryActionType.API_ERROR, `Falha ao excluir descritivo ID ${descriptorId}.`, { error: err.message });
        showToast(`Erro descritivo: ${err.message}`, 'error');
    }
  };

  if (loading && !currentUser && location.pathname !== '/' && !location.pathname.startsWith('/reset-password')) { 
    return <div className="flex justify-center items-center h-screen text-xl font-semibold text-gray-700">Carregando Sistema...</div>;
  }
  
  const resetTokenFromUrl = location.pathname.startsWith('/reset-password/') ? location.pathname.split('/').pop() : null;

  return (
    <>
      {toast && (
        <div className={`fixed top-5 right-5 p-4 rounded-md shadow-lg text-white z-[100] ${toast.type === 'success' ? 'bg-green-500' : 'bg-red-500'}`}>
          {toast.message}
        </div>
      )}
      {isForgotPasswordModalOpen && (
        <ForgotPasswordModal
          isOpen={isForgotPasswordModalOpen}
          onClose={() => setIsForgotPasswordModalOpen(false)}
          onSubmit={handleForgotPasswordSubmit}
        />
      )}
      <Routes>
        <Route 
            path="/" 
            element={
                currentUser ? <Navigate to="/dashboard" /> : 
                <LoginPage onLogin={handleLogin} onForgotPassword={() => setIsForgotPasswordModalOpen(true)} />
            } 
        />
        
        <Route path="/reset-password/:token" element={<ForceChangePasswordPage onActualResetPassword={handleActualPasswordReset} onLogout={handleLogout} username="" resetToken={resetTokenFromUrl || undefined} />} />


        <Route 
          path="/dashboard" 
          element={
            currentUser ? <DashboardLayout currentUser={currentUser} onLogout={handleLogout} /> : <Navigate to="/" />
          }
        >
          {loading && currentUser ? (
             <Route index element={<div className="flex justify-center items-center h-full p-6 text-gray-600">Carregando dados do dashboard...</div>} />
          ) : (
            <>
              <Route index element={<MainDashboardPage products={products} assets={assets} />} />
              <Route path="users" element={currentUser?.isAdmin ? <UserManagementPage users={appUsers} onAddUser={handleAddUser} onEditUser={handleEditUser} onDeleteUser={handleDeleteUser} onResetPassword={handleResetPasswordByAdmin} /> : <Navigate to="/dashboard" />} />
              <Route path="products/search" element={<ProductSearchPage products={products} productTypes={categories.map(c=>c.name)} onUpdateQuantity={handleUpdateQuantity} />} />
              <Route path="products/add" element={currentUser?.isAdmin ? <ProductAddPage products={products} categories={categories} fornecedores={fornecedores} onAddProduct={handleAddProduct} /> : <Navigate to="/dashboard" />} />
              
              <Route path="assets" element={<AssetManagementPage assets={assets} users={appUsers} onDeleteAsset={handleDeleteAsset} onImportAssets={handleImportAssets}/>} />
              <Route path="assets/add" element={<AssetAddPage users={appUsers} onAddAsset={handleAddAsset} />} />
              <Route path="assets/edit/:assetId" element={<AssetEditPage assets={assets} users={appUsers} onUpdateAsset={handleUpdateAsset}/>} />
              
              <Route path="descriptors" element={currentUser?.isAdmin ? <DescriptorManagementPage descriptors={descriptors} onDeleteDescriptor={handleDeleteDescriptor} /> : <Navigate to="/dashboard" />} />
              <Route path="descriptors/add" element={currentUser?.isAdmin ? <DescriptorAddPage onAddDescriptor={handleAddDescriptor} /> : <Navigate to="/dashboard" />} />
              <Route path="descriptors/edit/:descriptorId" element={currentUser?.isAdmin ? <DescriptorEditPage descriptors={descriptors} onUpdateDescriptor={handleUpdateDescriptor} />: <Navigate to="/dashboard" />} />
              
              <Route path="product-types" element={currentUser?.isAdmin ? <ProductTypeManagementPage categories={categories} onAddProductType={handleAddCategory} onEditProductType={handleEditCategory} onDeleteProductType={handleDeleteCategory} /> : <Navigate to="/dashboard" />} />
              <Route path="logs" element={<MovementLogsPage logs={logs} />} />
              <Route path="reports" element={<ReportsDashboardPage products={products} assets={assets} />} />
              <Route path="admin" element={currentUser?.isAdmin ? <AdminDashboardPage appUsers={appUsers} products={products} assets={assets} descriptors={descriptors} movementLogs={logs} /> : <Navigate to="/dashboard" />} />
              <Route path="*" element={<PlaceholderContent title="Página não encontrada" message="A página que você está procurando não existe ou foi movida." />} />
            </>
          )}
        </Route>
        <Route path="*" element={<Navigate to={currentUser ? "/dashboard" : "/"} />} />
      </Routes>
    </>
  );
};

export default App;