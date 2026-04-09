import api from './api';

export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterPayload extends LoginPayload {
  organization?: string;
}

export interface LoginResponse {
  access_token: string;
  token_type: string;
}

export interface AuthUser {
  id?: number;
  email: string;
  organization?: string;
}

export async function login(payload: LoginPayload) {
  const { data } = await api.post<LoginResponse>('/login', payload);
  return data;
}

export async function register(payload: RegisterPayload) {
  const { data } = await api.post<AuthUser>('/register', payload);
  return data;
}