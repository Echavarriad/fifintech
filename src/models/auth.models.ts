/**
 * Modelos para el sistema de autenticación
 */

// Tipos de roles disponibles en el sistema
export enum UserRole {
  ADMIN = 'admin',
  CLIENTE = 'cliente',
  ASESOR = 'asesor'
}

// Interfaz para el usuario
export interface User {
  id: number;
  email?: string;
  name: string;
  lastName?: string;
  roles: string[];
  // Campos adicionales que podrían ser útiles
  profilePicture?: string;
  phoneNumber?: string;
  lastLogin?: Date;
  username?: string;
}

// Interfaz para las credenciales de inicio de sesión
export interface LoginCredentials {
  email: string;
  password: string;
}

// Interfaz para la respuesta de autenticación
export interface AuthResponse {
  user: User;
  token: string;
  refreshToken?: string;
  expiresIn?: number;
}

// Interfaz para el estado de autenticación
export interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isLoggedIn: boolean;
  error: string | null;
}

// Interfaz para el registro de usuario
export interface RegisterData {
  username: string;
  name: string;
  lastname: string;
  "no.identiti": string;
  email: string;
  phone: string;
  password: string;
  password2: string;
  address: string;
  photo: string;
  photo_document_front: string;
  photo_document_lat: string;
  role: string;
  tyc: boolean;
}

// Interfaz para la recuperación de contraseña
export interface RecoverPasswordData {
  email: string;
}

// Interfaz para el cambio de contraseña
export interface ChangePasswordData {
  [x: string]: string | undefined;
  oldPassword: string;
  newPassword: string;
  confirmPassword: string;
}