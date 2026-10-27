export interface LoginRequest {
  email: string;
  password?: string;
  password_hash?: string;
}

export interface UsuarioAutenticado {
  id: string;
  nombre: string;
  apellido: string;
  email: string;
  rol: 'ADMIN' | 'ADMINISTRADOR' | 'VETERINARIO' | 'RECEPCIONISTA' | 'ENCARGADO_INVENTARIO';
}

export interface LoginResponse {
  token: string;
  usuario: UsuarioAutenticado;
}