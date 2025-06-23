
export interface User {
  id: string; // This can be the AppUser.id
  username: string; // This can be AppUser.name
  isAdmin: boolean;
  appUserId: string; // ID of the corresponding AppUser
  forcePasswordChange?: boolean;
}

export interface NavItem {
  name: string;
  path: string;
  icon?: (props: React.SVGProps<SVGSVGElement>) => React.ReactNode; 
  adminOnly?: boolean;
}

export enum Company {
  CATARINENSE = 'Catarinense Pharma',
  ABPLAST = 'ABPlast',
  CATARINENSE_FILIAL = 'Catarinense Pharma Filial', 
}

// Representa um produto no sistema
export interface Product {
  id: string;
  type: string; 
  brand: string; 
  model: string; 
  description: string; 
  barcode: string; 
  quantity: number; 
  company: Company; // Added company field
}

// Tipos para cadastro de produto
export interface ProductFormData {
  type: string;
  brand: string;
  model: string;
  description: string;
  barcode: string;
  company: Company; // Added company field
}

// Tipos para gerenciamento de quantidade de produto
export interface AddQuantityFormData {
  amount: number;
  purchaseOrder: string;
}

export interface SubtractQuantityFormData {
  amount: number;
  destinationAssetId: string; 
  ticketNumber?: string; // Added optional ticket number
}


export enum ProductType {
  HD = "HD",
  SSD = "SSD",
  RAM = "Memória Ram",
  KEYBOARD_MOUSE = "Teclado e Mouse",
  NOTEBOOK_SUPPORT = "Suporte de notebook",
  HDMI_CABLE = "Cabo HDMI",
  POWER_CABLE = "Cabo de força",
  VGA_CABLE = "Cabo VGA",
  DISPLAYPORT_CABLE = "Cabo Displayport",
  LINE_FILTER = "Filtro de linha",
  CHARGER_USB_C = "Carregador + cabo usb C",
  USB_A_A_CABLE = "Cabo USB A-A",
  USB_A_B_CABLE = "Cabo USB A-B", 
  SMARTPHONE = "Smartphone",
}

// Tipos para Modals e Forms de Usuário
export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}

export interface AppUser {
  id: string;
  name: string;
  email: string;
  role: 'Administrador' | 'Usuário comum';
  status: 'Ativo' | 'Inativo';
  createdAt: Date;
  lastModifiedAt: Date;
  forcePasswordChange?: boolean; // Added for forced password change
  password_param?: string; // To simulate password storage for login
}

export interface AddUserFormData {
  name: string;
  email: string;
  password_param: string; 
  confirmPassword_param: string; 
  role: 'Administrador' | 'Usuário comum';
  status: 'Ativo' | 'Inativo';
  forcePasswordChange?: boolean; // Added for forced password change
}

export interface EditUserFormData {
  name: string;
  email: string;
  role: 'Administrador' | 'Usuário comum';
  status: 'Ativo' | 'Inativo';
}

export interface ResetPasswordFormData {
  newPassword_param: string; 
  confirmNewPassword_param: string; 
}

// Tipos para Gerenciamento de Ativos
export enum AssetStatus {
  IN_USE = 'Em uso',
  AVAILABLE = 'Disponível',
  MAINTENANCE = 'Manutenção',
}

export interface Asset {
  id: string;
  assetType: string; 
  serialNumber: string; 
  brand: string; 
  model: string; 
  acquisitionDate: string; 
  status: AssetStatus; 
  location: string; 
  responsibleUserId: string | null; 
  observations: string; 
  qrCodeValue: string; 
  maintenanceNotes?: string; 
}

export interface AssetFormData {
  assetType: string;
  serialNumber: string;
  brand: string;
  model: string;
  acquisitionDate: string;
  status: AssetStatus;
  location: string;
  responsibleUserId: string | null; 
  observations: string;
  maintenanceNotes: string; 
}

// Tipos para Gerenciador de Descritivos
export enum DescriptorStatus {
  ACTIVE = 'Ativo',
  INACTIVE = 'Inativo',
}

export interface Descriptor {
  id: string;
  title: string;
  equipmentType: string;
  category: string;
  status: DescriptorStatus;
  technicalSpecifications: string;
  minimumRequirements: string;
  compatibility: string;
  importantNotes: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface DescriptorFormData {
  title: string;
  equipmentType: string;
  category: string;
  status: DescriptorStatus;
  technicalSpecifications: string;
  minimumRequirements: string;
  compatibility: string;
  importantNotes: string;
}

// Tipos para Logs de Movimentações
export enum LogEntryActionType {
  // User Actions
  USER_LOGIN_SUCCESS = 'Login Bem-Sucedido',
  USER_LOGIN_FAIL = 'Falha no Login',
  USER_LOGOUT = 'Logout de Usuário',
  USER_CREATED = 'Usuário Criado',
  USER_UPDATED = 'Usuário Atualizado',
  USER_DELETED = 'Usuário Excluído',
  USER_PASSWORD_RESET = 'Senha de Usuário Alterada/Resetada', // Combined for simplicity
  // Product Actions
  PRODUCT_CREATED = 'Produto Criado',
  PRODUCT_QUANTITY_UPDATED = 'Quantidade de Produto Atualizada',
  // Product Type Actions
  PRODUCT_TYPE_CREATED = 'Tipo de Produto Criado',
  PRODUCT_TYPE_UPDATED = 'Tipo de Produto Atualizado',
  PRODUCT_TYPE_DELETED = 'Tipo de Produto Excluído',
  // Asset Actions
  ASSET_CREATED = 'Ativo Criado',
  ASSET_UPDATED = 'Ativo Atualizado',
  ASSET_DELETED = 'Ativo Excluído',
  ASSET_IMPORTED = 'Importação de Ativos via CSV',
  // Descriptor Actions
  DESCRIPTOR_CREATED = 'Descritivo Criado',
  DESCRIPTOR_UPDATED = 'Descritivo Atualizado',
  DESCRIPTOR_DELETED = 'Descritivo Excluído',
  // System Actions
  SYSTEM_ERROR = 'Erro no Sistema',
  OTHER = 'Outra Ação',
}

export interface LogEntry {
  id: string;
  timestamp: Date;
  userId: string; 
  username: string; 
  actionType: LogEntryActionType;
  description: string; 
  details?: Record<string, any>; 
}