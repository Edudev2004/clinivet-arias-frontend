export interface LoginRequest {
  email: string;
  password_hash: string;
}

export interface LoginResponse {
  token: string;
  usuario: {
    id: string;
    nombre: string;
    apellido: string;
    email: string;
    rol: 'ADMIN' | 'VETERINARIO' | 'RECEPCIONISTA' | 'ENCARGADO_INVENTARIO';
  };
}