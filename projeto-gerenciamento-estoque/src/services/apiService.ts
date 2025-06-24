import type { 
  User, 
  AppUser, 
  Category, 
  Fornecedor, 
  Product, 
  ProductFormData,
  AddUserFormData,
  EditUserFormData,
  Asset,
  AssetFormData,
  Descriptor,
  DescriptorFormData,
  AddQuantityFormData,
  SubtractQuantityFormData
} from '../../types'; 

const API_BASE_URL = 'http://localhost:5000/api'; // From your backend .env

interface ApiErrorData {
  success: false;
  message: string;
  error?: any;
}

interface ApiSuccessData<T> {
  success: true;
  data: T;
  token?: string; // For login/register
  count?: number; // For list operations
  message?: string;
}

type ApiResponse<T> = ApiSuccessData<T> | ApiErrorData;

const getAuthToken = (): string | null => {
  const storedUser = localStorage.getItem('currentUser');
  if (storedUser) {
    try {
      const parsedUser: User = JSON.parse(storedUser);
      return parsedUser.token || null;
    } catch {
      return null;
    }
  }
  return null;
};

const request = async <T>(
  endpoint: string,
  method: 'GET' | 'POST' | 'PUT' | 'DELETE',
  body?: any,
  isPublic: boolean = false
): Promise<ApiSuccessData<T>> => {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };
  const token = getAuthToken();

  if (!isPublic && token) {
    headers['Authorization'] = `Bearer ${token}`;
  } else if (!isPublic && !token && !endpoint.startsWith('/auth/login') && !endpoint.startsWith('/auth/register') && !endpoint.startsWith('/auth/forgotpassword') && !endpoint.startsWith('/auth/resetpassword')) {
    console.error('API call to protected route without token:', endpoint);
    throw new Error('Não autorizado. Token não encontrado ou inválido.');
  }
  
  const config: RequestInit = {
    method,
    headers,
  };

  if (body) {
    config.body = JSON.stringify(body);
  }

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
    const data: ApiResponse<T> = await response.json(); 

    if (!response.ok || !data.success) {
      const errorData = data as ApiErrorData;
      console.error(`API Error on ${method} ${API_BASE_URL}${endpoint}:`, errorData.message, errorData.error);
      throw new Error(errorData.message || `Erro na API: ${response.status} ${response.statusText}`);
    }
    return data as ApiSuccessData<T>;
  } catch (error) {
    console.error(`Network or Parsing Error on ${method} ${API_BASE_URL}${endpoint}:`, error);
    if (error instanceof Error) { 
        throw error;
    }
    throw new Error(`Erro de comunicação com o servidor.`);
  }
};

// --- Auth Service ---
export const login = async (email: string, password_param: string): Promise<ApiSuccessData<{ token: string }>> => {
  return request<{ token: string }>(`/auth/login`, 'POST', { email, senha: password_param }, true);
};

export const registerUser = async (userData: AddUserFormData): Promise<ApiSuccessData<{ token: string }>> => {
  const backendUserData = {
    nome: userData.name,
    email: userData.email,
    senha: userData.password_param,
    cargo: userData.role,
  };
  return request<{ token: string }>(`/auth/register`, 'POST', backendUserData, true);
};

export const getMe = async (): Promise<ApiSuccessData<AppUser>> => { 
  const response = await request<any>(`/auth/me`, 'GET');
  const backendUser = response.data;
  const appUser: AppUser = {
    id: backendUser._id,
    name: backendUser.nome,
    email: backendUser.email,
    role: backendUser.cargo,
  };
  return { ...response, data: appUser };
};

export const forgotPassword = async (email: string): Promise<ApiSuccessData<{ message: string; data?: string }>> => {
  // Backend's forgotPassword returns: { success: true, message: 'Token de reset enviado', data: resetToken }
  return request<{ message: string; data?: string }>(`/auth/forgotpassword`, 'POST', { email }, true);
};

export const resetPasswordWithToken = async (token: string, newPassword_param: string): Promise<ApiSuccessData<{ message: string }>> => {
  return request<{ message: string }>(`/auth/resetpassword/${token}`, 'PUT', { senha: newPassword_param }, true);
};


// --- User Management APIs (Admin) ---
export const fetchAppUsers = async (): Promise<ApiSuccessData<AppUser[]>> => {
  const response = await request<any[]>(`/users`, 'GET');
  const appUsers: AppUser[] = response.data.map(u => ({
    id: u._id,
    name: u.nome,
    email: u.email,
    role: u.cargo,
  }));
  return { ...response, data: appUsers };
};

export const updateAppUser = async (userId: string, userData: Partial<EditUserFormData>): Promise<ApiSuccessData<AppUser>> => {
  // Backend expects 'nome' and 'cargo'
  const backendData = {
    ...(userData.name && { nome: userData.name }),
    ...(userData.email && { email: userData.email }), // Backend might not allow email change here or might have specific logic
    ...(userData.role && { cargo: userData.role }),
  };
  const response = await request<any>(`/users/${userId}`, 'PUT', backendData);
  const u = response.data;
  return { ...response, data: { id: u._id, name: u.nome, email: u.email, role: u.cargo } };
};

export const deleteAppUser = async (userId: string): Promise<ApiSuccessData<{ message: string }>> => {
  return request<{ message: string }>(`/users/${userId}`, 'DELETE');
};

// Note: Resetting another user's password by an admin isn't directly in authController.
// This might need a specific admin endpoint or a re-evaluation of how it's done.
// For now, let's assume an admin might trigger a standard reset flow for a user if UI requires it.

// --- Category (ProductType) Service ---
export const fetchCategories = async (): Promise<ApiSuccessData<Category[]>> => {
  const response = await request<any[]>(`/categorias`, 'GET', undefined, true);
  const categories: Category[] = response.data.map(cat => ({
    id: cat._id,
    name: cat.nome,
    description: cat.descricao,
  }));
  return { ...response, data: categories };
};

export const createCategory = async (name: string, description?: string): Promise<ApiSuccessData<Category>> => {
  const response = await request<any>(`/categorias`, 'POST', { nome: name, descricao: description });
  const cat = response.data;
  return { ...response, data: { id: cat._id, name: cat.nome, description: cat.descricao } };
};

export const updateCategory = async (id: string, name: string, description?: string): Promise<ApiSuccessData<Category>> => {
  const response = await request<any>(`/categorias/${id}`, 'PUT', { nome: name, descricao: description });
  const cat = response.data;
  return { ...response, data: { id: cat._id, name: cat.nome, description: cat.descricao } };
};

export const deleteCategory = async (id: string): Promise<ApiSuccessData<{ message: string }>> => {
  return request<{ message: string }>(`/categorias/${id}`, 'DELETE');
};

// --- Fornecedor (Company) Service ---
export const fetchFornecedores = async (): Promise<ApiSuccessData<Fornecedor[]>> => {
  const response = await request<any[]>(`/fornecedores`, 'GET', undefined, true);
  const fornecedores: Fornecedor[] = response.data.map(f => ({
    id: f._id,
    name: f.nome,
    contact: f.contato,
    address: f.endereco,
  }));
  return { ...response, data: fornecedores };
};

export const createFornecedor = async (data: {nome: string, contato?: object, endereco?: object}): Promise<ApiSuccessData<Fornecedor>> => {
  const response = await request<any>(`/fornecedores`, 'POST', data);
  const f = response.data;
  return { ...response, data: { id: f._id, name: f.nome, contact: f.contato, address: f.endereco } };
};

export const updateFornecedor = async (id: string, data: {nome?: string, contato?: object, endereco?: object}): Promise<ApiSuccessData<Fornecedor>> => {
  const response = await request<any>(`/fornecedores/${id}`, 'PUT', data);
  const f = response.data;
  return { ...response, data: { id: f._id, name: f.nome, contact: f.contato, address: f.endereco } };
};

export const deleteFornecedor = async (id: string): Promise<ApiSuccessData<{ message: string }>> => {
  return request<{ message: string }>(`/fornecedores/${id}`, 'DELETE');
};

// --- Product Service ---
export const fetchProducts = async (): Promise<ApiSuccessData<Product[]>> => {
    const response = await request<any[]>(`/produtos`, 'GET', undefined, true);
    const mappedProducts: Product[] = response.data.map(p => ({
        id: p._id,
        name: p.nome,
        barcode: p.barcode, // Now included from backend
        description: p.descricao,
        price: p.preco,
        quantity: p.quantidade,
        categoryId: p.categoria?._id, 
        categoryName: p.categoria?.nome, 
        fornecedorId: p.fornecedor?._id, 
        fornecedorName: p.fornecedor?.nome, 
    }));
    return { ...response, data: mappedProducts };
};

export const createProduct = async (productData: ProductFormData): Promise<ApiSuccessData<Product>> => {
  const backendProductData = {
    nome: productData.name,
    barcode: productData.barcode,
    descricao: productData.description,
    preco: productData.price,
    categoria: productData.categoria,
    fornecedor: productData.fornecedor,
  };

  const response = await request<any>(`/produtos`, 'POST', backendProductData);
  const p = response.data; 
  const mappedProduct: Product = {
    id: p._id,
    name: p.nome,
    barcode: p.barcode,
    description: p.descricao,
    price: p.preco,
    quantity: p.quantidade,
    categoryId: p.categoria?._id || p.categoria,
    categoryName: p.categoria?.nome, 
    fornecedorId: p.fornecedor?._id || p.fornecedor,
    fornecedorName: p.fornecedor?.nome,
  };
  return { ...response, data: mappedProduct };
};

export const updateProduct = async (id: string, productData: Partial<ProductFormData>): Promise<ApiSuccessData<Product>> => {
   const backendProductData = {
    ...(productData.name && { nome: productData.name }),
    ...(productData.barcode && { barcode: productData.barcode }),
    ...(productData.description && { descricao: productData.description }),
    ...(productData.price && { preco: productData.price }),
    ...(productData.categoria && { categoria: productData.categoria }),
    ...(productData.fornecedor && { fornecedor: productData.fornecedor }),
  };
  const response = await request<any>(`/produtos/${id}`, 'PUT', backendProductData);
  const p = response.data; 
  const mappedProduct: Product = {
    id: p._id,
    name: p.nome,
    barcode: p.barcode,
    description: p.descricao,
    price: p.preco,
    quantity: p.quantidade,
    categoryId: p.categoria?._id || p.categoria,
    categoryName: p.categoria?.nome,
    fornecedorId: p.fornecedor?._id || p.fornecedor,
    fornecedorName: p.fornecedor?.nome,
  };
  return { ...response, data: mappedProduct };
};

export const deleteProduct = async (id: string): Promise<ApiSuccessData<{ message: string }>> => {
  return request<{ message: string }>(`/produtos/${id}`, 'DELETE');
};

// --- Stock Movement (Entrada/Saida Estoque) Service ---
export const createEntradaEstoque = async (data: AddQuantityFormData): Promise<ApiSuccessData<any>> => {
  const payload = {
    produto: data.productId,
    quantidade: data.quantity,
    precoCusto: data.priceCost,
  };
  return request<any>(`/entradas`, 'POST', payload);
};

export const createSaidaEstoque = async (data: SubtractQuantityFormData): Promise<ApiSuccessData<any>> => {
  const payload = {
    produto: data.productId,
    quantidade: data.quantity,
    motivo: data.reason,
  };
  return request<any>(`/saidas`, 'POST', payload);
};


// --- Asset Service ---
export const fetchAssets = async (): Promise<ApiSuccessData<Asset[]>> => {
  const response = await request<any[]>(`/assets`, 'GET');
  const assets: Asset[] = response.data.map(a => ({
    id: a._id,
    name: a.nome,
    description: a.descricao,
    responsibleUserId: a.responsavel?._id || a.responsavel, // If populated or just ID
    responsibleUserName: a.responsavel?.nome, // If populated
    location: a.localizacao,
  }));
  return { ...response, data: assets };
};

export const createAsset = async (assetData: AssetFormData): Promise<ApiSuccessData<Asset>> => {
  const backendData = {
    nome: assetData.name,
    descricao: assetData.description,
    responsavel: assetData.responsavel,
    localizacao: assetData.localizacao,
  };
  const response = await request<any>(`/assets`, 'POST', backendData);
  const a = response.data;
  return { ...response, data: { 
    id: a._id, 
    name: a.nome, 
    description: a.descricao,
    responsibleUserId: a.responsavel?._id || a.responsavel,
    responsibleUserName: a.responsavel?.nome,
    location: a.localizacao,
  }};
};

export const updateAsset = async (id: string, assetData: Partial<AssetFormData>): Promise<ApiSuccessData<Asset>> => {
  const backendData = {
    ...(assetData.name && { nome: assetData.name }),
    ...(assetData.description && { descricao: assetData.description }),
    ...(assetData.responsavel && { responsavel: assetData.responsavel }),
    ...(assetData.localizacao && { localizacao: assetData.localizacao }),
  };
  const response = await request<any>(`/assets/${id}`, 'PUT', backendData);
  const a = response.data;
  return { ...response, data: { 
    id: a._id, 
    name: a.nome, 
    description: a.descricao,
    responsibleUserId: a.responsavel?._id || a.responsavel,
    responsibleUserName: a.responsavel?.nome,
    location: a.localizacao,
  }};
};

export const deleteAsset = async (id: string): Promise<ApiSuccessData<{ message: string }>> => {
  return request<{ message: string }>(`/assets/${id}`, 'DELETE');
};

// --- Descriptor Service ---
export const fetchDescriptors = async (): Promise<ApiSuccessData<Descriptor[]>> => {
  const response = await request<any[]>(`/descriptors`, 'GET');
  const descriptors: Descriptor[] = response.data.map(d => ({
    id: d._id,
    name: d.nome,
    value: d.valor,
  }));
  return { ...response, data: descriptors };
};

export const createDescriptor = async (descriptorData: DescriptorFormData): Promise<ApiSuccessData<Descriptor>> => {
  const response = await request<any>(`/descriptors`, 'POST', descriptorData);
  const d = response.data;
  return { ...response, data: { id: d._id, name: d.nome, value: d.valor } };
};

export const updateDescriptor = async (id: string, descriptorData: Partial<DescriptorFormData>): Promise<ApiSuccessData<Descriptor>> => {
  const response = await request<any>(`/descriptors/${id}`, 'PUT', descriptorData);
  const d = response.data;
  return { ...response, data: { id: d._id, name: d.nome, value: d.valor } };
};

export const deleteDescriptor = async (id: string): Promise<ApiSuccessData<{ message: string }>> => {
  return request<{ message: string }>(`/descriptors/${id}`, 'DELETE');
};


const apiService = {
  login,
  registerUser,
  getMe,
  forgotPassword,
  resetPasswordWithToken,
  fetchAppUsers, 
  updateAppUser,
  deleteAppUser,
  // resetAppUserPassword, // Removed as admin password reset for another user is not standard this way
  fetchCategories,
  createCategory,
  updateCategory,
  deleteCategory,
  fetchFornecedores,
  createFornecedor,
  updateFornecedor,
  deleteFornecedor,
  fetchProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  createEntradaEstoque,
  createSaidaEstoque,
  fetchAssets,
  createAsset,
  updateAsset,
  deleteAsset,
  fetchDescriptors,
  createDescriptor,
  updateDescriptor,
  deleteDescriptor,
};

export default apiService;